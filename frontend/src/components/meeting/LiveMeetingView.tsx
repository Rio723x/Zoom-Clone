import { useEffect, useReducer, useRef, useState } from "react";
import {
  useMeeting,
  usePubSub,
  useWhiteboard,
  useFile,
  VideoPlayer,
  createMicrophoneAudioTrack,
  createScreenShareVideoTrack,
} from "@videosdk.live/react-sdk";
import TopBar from "./TopBar";
import ControlBar from "./ControlBar";
import SpeakerView from "./SpeakerView";
import LiveParticipantTile from "./LiveParticipantTile";
import LiveParticipantRowActions from "./LiveParticipantRowActions";
import MicEnforcer from "./MicEnforcer";
import RecordingIndicator from "./RecordingIndicator";
import FloatingReactions, { type FloatingReaction } from "./FloatingReactions";
import { useLivePolls } from "./useLivePolls";
import { useMeetingHotkeys } from "./useMeetingHotkeys";
import type { PanelType } from "./types";
import ParticipantsPanel from "@/components/panels/ParticipantsPanel";
import ChatPanel, {
  type ChatMessageVM,
  type ChatAttachment,
} from "@/components/panels/ChatPanel";
import PollsPanel from "@/components/panels/PollsPanel";
import { colorForId, type ParticipantVM } from "@/lib/participantVM";
import { VIDEOSDK_TOKEN } from "@/lib/videosdk/token";
import { fileToBase64, base64ToObjectUrl, triggerDownload } from "@/lib/file";
import { useSessionStore } from "@/store/useSessionStore";
import { useMeetingControlsStore } from "@/store/useMeetingControlsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import WaitingRoom from "./WaitingRoom";
import { useGalleryTileSize } from "./useGalleryTileSize";
import { usePictureInPicture } from "./usePictureInPicture";

const LOCKED_MSG = "This meeting is locked by the host.";
const REMOVED_MSG = "You were removed from the meeting by the host.";

// A failed screen-share (user cancelled the picker, denied permission, or the
// browser can't share -- e.g. most mobile browsers) is never fatal to the
// meeting, so it must never surface the "Back to Home" toast. Platforms report
// the cancel differently; the SDK can fire a specific *and* a generic
// display-media error for the same action, so match the whole family: the known
// getDisplayMedia error codes plus any message mentioning screen/display share.
const SCREENSHARE_ERROR_CODES = new Set(["3011", "3013", "3014", "3016", "3020"]);
function isScreenShareError(e: { code?: string | number; message?: string }): boolean {
  if (SCREENSHARE_ERROR_CODES.has(String(e?.code ?? ""))) return true;
  return /display\s*media|getdisplaymedia|screen[-\s]?shar/i.test(String(e?.message ?? ""));
}

type RecordingStatus =
  | "RECORDING_STOPPED"
  | "RECORDING_STARTING"
  | "RECORDING_STARTED"
  | "RECORDING_STOPPING";

function fmtTime(ts: string): string {
  const d = new Date(Number(ts) || Date.parse(ts) || Date.now());
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function useElapsed(): string {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

interface LiveMeetingViewProps {
  roomId: string;
  /** Pre-join media intent, restored when a waiting guest is admitted. */
  initialMicOn: boolean;
  initialWebcamOn: boolean;
  /** Navigate away; an optional reason surfaces as a toast on Home. */
  onLeave: (reason?: string) => void;
}

export default function LiveMeetingView({
  roomId,
  initialMicOn,
  initialWebcamOn,
  onLeave,
}: LiveMeetingViewProps) {
  const role = useSessionStore((s) => s.role);
  const isHost = role === "host";
  const elapsed = useElapsed();

  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [view, setView] = useState<"gallery" | "speaker">("gallery");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("RECORDING_STOPPED");

  // Force-update tick so VideoSDK's in-place participants-Map mutations
  // reflect in the UI when the roster changes.
  const [, bump] = useReducer((n: number) => n + 1, 0);

  // --- State/refs the useMeeting callbacks close over (declared first) ---
  // Host-owned authoritative set of participant ids currently held in the
  // waiting room. Broadcast idempotently over WAITING_SET; guests mirror it.
  const [waitingSet, setWaitingSet] = useState<string[]>([]);
  const admittedIds = useRef<Set<string>>(new Set());
  // Distinguishes a real Leave click (self-leave) from an involuntary removal.
  const intentionalLeave = useRef(false);
  // Reason string received (targeted) just before the host removes us.
  const [bounceReason, setBounceReason] = useState<string | null>(null);
  const bounceReasonRef = useRef<string | null>(null);
  bounceReasonRef.current = bounceReason;
  // publish fns assigned after their usePubSub calls, read from callbacks.
  type PublishFn = (
    msg: string,
    opts: { persist: boolean; sendOnly?: string[] },
  ) => unknown;
  const publishBounceRef = useRef<PublishFn | null>(null);

  const {
    participants,
    activeSpeakerId,
    localParticipant,
    localMicOn,
    localWebcamOn,
    presenterId,
    toggleMic,
    toggleWebcam,
    toggleScreenShare,
    disableScreenShare,
    changeMic,
    changeWebcam,
    startRecording,
    stopRecording,
    leave,
    end,
  } = useMeeting({
    onRecordingStateChanged: ({ status }: { status: RecordingStatus }) =>
      setRecordingStatus(status),
    onMeetingLeft: () => {
      if (intentionalLeave.current) {
        onLeave();
        return;
      }
      // Involuntary removal. Prefer the targeted reason message, but fall back
      // to the synced lock state so a locked-out guest still learns why even if
      // the (best-effort) BOUNCE message lost the race with removal.
      const reason =
        bounceReasonRef.current ??
        (useMeetingControlsStore.getState().locked ? LOCKED_MSG : REMOVED_MSG);
      onLeave(reason);
    },
    onParticipantJoined: (p) => {
      bump();
      // Host-authoritative Lock + Waiting Room enforcement on new joiners only.
      // Existing participants and the host never re-fire their own join, so
      // locking / enabling WR mid-meeting cannot affect people already in.
      if (useSessionStore.getState().role !== "host") return;
      const st = useMeetingControlsStore.getState();
      if (st.locked) {
        // Silence them instantly (no media leak), then remove after a beat so
        // the targeted reason message reliably lands before they disconnect.
        try {
          p.disableMic();
          p.disableWebcam();
        } catch {
          /* ignore */
        }
        publishBounceRef.current?.(LOCKED_MSG, { sendOnly: [p.id], persist: false });
        setTimeout(() => {
          try {
            p.remove();
          } catch {
            /* already gone */
          }
        }, 600);
        return;
      }
      if (st.waitingRoomEnabled && !admittedIds.current.has(p.id)) {
        // Force media off so no stream leaks to anyone while they wait.
        try {
          p.disableMic();
          p.disableWebcam();
        } catch {
          /* ignore */
        }
        setWaitingSet((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
      }
    },
    onParticipantLeft: () => bump(),
    onError: (e: { code: string; message: string }) => {
      // Cancelling/denying/failing a screen-share is a normal user action, not a
      // fatal meeting error -- silently ignore the whole display-media error
      // family instead of surfacing the "Back to Home" toast, matching Zoom.
      if (isScreenShareError(e)) return;
      setJoinError(e?.message || "Could not connect to the meeting.");
    },
  });

  // Reset host controls on mount so a lock/permission from a prior meeting (or
  // from Demo mode) doesn't leak in via the shared singleton store.
  useEffect(() => {
    useMeetingControlsStore.getState().reset();
  }, [roomId]);

  // --- Chat (persisted so late joiners get history) ---
  const { uploadBase64File, fetchBase64File } = useFile();
  const { publish: publishChat, messages: chatMessages } = usePubSub("CHAT");
  const chatVMs: ChatMessageVM[] = chatMessages.map((m) => {
    // Payload is JSON { text, files? }; tolerate a bare-string legacy message.
    let text = m.message;
    let files: ChatAttachment[] | undefined;
    try {
      const parsed = JSON.parse(m.message);
      if (parsed && typeof parsed === "object") {
        text = typeof parsed.text === "string" ? parsed.text : "";
        files = Array.isArray(parsed.files) ? parsed.files : undefined;
      }
    } catch {
      /* not JSON -- treat as plain text */
    }
    return {
      id: m.id,
      senderName: m.senderName,
      toName: "Everyone",
      message: text,
      timestamp: fmtTime(m.timestamp),
      isLocal: m.senderId === localParticipant?.id,
      files,
    };
  });

  // --- Reactions (transient, floating emoji) ---
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const { publish: publishReaction } = usePubSub("REACTIONS", {
    onMessageReceived: (m) => {
      const id = `${m.id}`;
      setFloating((prev) => [
        ...prev,
        { id, emoji: m.message, left: 10 + Math.floor(Math.random() * 80) },
      ]);
      setTimeout(
        () => setFloating((prev) => prev.filter((r) => r.id !== id)),
        3000,
      );
    },
  });
  const sendReaction = (emoji: string) => {
    publishReaction(emoji, { persist: false });
  };

  // --- Raise hand (transient toggle, tracked per participant) ---
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  const { publish: publishHand } = usePubSub("RAISE_HAND", {
    onMessageReceived: (m) => {
      setRaisedHands((prev) => {
        const next = new Set(prev);
        if (m.message === "LOWER") next.delete(m.senderId);
        else next.add(m.senderId);
        return next;
      });
    },
  });
  const raiseHand = () => {
    const raised = raisedHands.has(localParticipant?.id ?? "");
    publishHand(raised ? "LOWER" : "RAISE", { persist: false });
  };

  // --- Polls (app-side over pubsub) ---
  const polls = useLivePolls(localParticipant?.id);

  // --- Whiteboard (native VideoSDK, shared via URL) ---
  const { startWhiteboard, stopWhiteboard, whiteboardUrl } = useWhiteboard();
  const toggleWhiteboard = () => {
    if (whiteboardUrl) stopWhiteboard();
    else startWhiteboard();
  };

  // Derived each render (the Map reference is stable, so no memo).
  const participantIds = [...participants.keys()];

  // --- Host meeting controls (Security menu) broadcast via HOST_CONTROL ---
  const controls = useMeetingControlsStore();
  const controlsSnapshot = {
    locked: controls.locked,
    waitingRoomEnabled: controls.waitingRoomEnabled,
    permissions: controls.permissions,
  };
  const { publish: publishControl, messages: controlMsgs } = usePubSub(
    "HOST_CONTROL",
    {
      onMessageReceived: (m) => {
        if (m.senderId === localParticipant?.id) return;
        try {
          controls.applySnapshot(JSON.parse(m.message));
        } catch {
          /* ignore malformed */
        }
      },
    },
  );
  // Guests also apply the latest persisted snapshot from history, so someone
  // who joins after the host set controls (e.g. locked a meeting) reliably
  // learns the current state even if the live callback missed the replay.
  useEffect(() => {
    if (isHost) return;
    const last = controlMsgs[controlMsgs.length - 1];
    if (!last) return;
    try {
      controls.applySnapshot(JSON.parse(last.message));
    } catch {
      /* ignore malformed */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, controlMsgs]);
  const pushControls = (next: typeof controlsSnapshot) => {
    controls.applySnapshot(next);
    publishControl(JSON.stringify(next), { persist: true });
  };
  const toggleWaitingRoom = () => {
    // Enabling WR does NOT hold current participants -- only later joiners are
    // held (via onParticipantJoined), so this can't evict people already in.
    pushControls({
      ...controlsSnapshot,
      waitingRoomEnabled: !controls.waitingRoomEnabled,
    });
  };

  // --- Waiting Room: host broadcasts the authoritative set; guests mirror it ---
  // Guests apply the LATEST message from the persisted history (`messages`)
  // rather than only live `onMessageReceived`, so a guest that subscribes a beat
  // after the host publishes still picks up that they are being held.
  const { publish: publishWaiting, messages: waitingMsgs } =
    usePubSub("WAITING_SET");
  useEffect(() => {
    if (isHost) return; // host owns the truth; only guests mirror it
    const last = waitingMsgs[waitingMsgs.length - 1];
    if (!last) return;
    try {
      setWaitingSet(JSON.parse(last.message));
    } catch {
      /* ignore malformed */
    }
  }, [isHost, waitingMsgs]);
  const publishWaitingRef = useRef(publishWaiting);
  publishWaitingRef.current = publishWaiting;
  useEffect(() => {
    if (!isHost) return;
    publishWaitingRef.current(JSON.stringify(waitingSet), { persist: true });
  }, [isHost, waitingSet]);

  // --- Bounce: targeted reason sent to a guest right before removing them ---
  const { publish: publishBounce } = usePubSub("BOUNCE", {
    onMessageReceived: (m) => {
      if (useSessionStore.getState().role === "host") return;
      setBounceReason(m.message);
    },
  });
  publishBounceRef.current = publishBounce;

  // --- Share control: cooperative "stop your share" (no native remote stop) ---
  const { publish: publishStopShare } = usePubSub("SHARE_CONTROL", {
    onMessageReceived: (m) => {
      if (m.message === "STOP") {
        try {
          disableScreenShare();
        } catch {
          /* not sharing */
        }
      }
    },
  });
  const publishStopShareRef = useRef(publishStopShare);
  publishStopShareRef.current = publishStopShare;

  const admitWaiting = (id: string) => {
    admittedIds.current.add(id);
    setWaitingSet((prev) => prev.filter((x) => x !== id));
  };
  const denyWaiting = (id: string) => {
    publishBounceRef.current?.(REMOVED_MSG, { sendOnly: [id], persist: false });
    // Delay the removal so the reason message lands before they disconnect.
    const target = participants.get(id);
    setTimeout(() => {
      try {
        target?.remove();
      } catch {
        /* already gone */
      }
    }, 600);
    setWaitingSet((prev) => prev.filter((x) => x !== id));
  };

  const waitingIds = new Set(waitingSet);
  const amWaiting = !isHost && waitingIds.has(localParticipant?.id ?? "");
  const visibleIds = participantIds.filter((id) => !waitingIds.has(id));
  const gallery = useGalleryTileSize(visibleIds.length);

  // Picture-in-Picture composites the live participant videos in the stage.
  const stageRef = useRef<HTMLDivElement>(null);
  const { pipActive, pipSupported, togglePip } = usePictureInPicture(stageRef);

  // Permission-derived flags for this client.
  const chatBlocked = !isHost && !controls.permissions.chat;
  const shareBlocked = !isHost && !controls.permissions.share;
  const unmuteBlocked = !isHost && !controls.permissions.unmute;

  // --- Original Sound (Zoom): honor the persisted mic-fidelity preference ---
  // Build a mic track whose browser DSP (echo cancel / noise suppression /
  // auto-gain) is OFF when Original Sound is ON, matching Zoom's semantics.
  const micTrackFor = (originalSound: boolean) =>
    createMicrophoneAudioTrack({
      microphoneId: useSettingsStore.getState().micId,
      encoderConfig: originalSound ? "high_quality" : "speech_standard",
      noiseConfig: {
        echoCancellation: !originalSound,
        autoGainControl: !originalSound,
        noiseSuppression: !originalSound,
      },
    });

  // Toggle the mic, applying the Original Sound preference on the unmute edge
  // (a custom track can only be attached while turning the mic on).
  const handleToggleMic = async () => {
    if (unmuteBlocked && !localMicOn) return;
    if (localMicOn) {
      toggleMic();
      return;
    }
    try {
      toggleMic(await micTrackFor(useSettingsStore.getState().originalSound));
    } catch {
      toggleMic();
    }
  };

  // Swap the live mic track when Original Sound changes (only meaningful while
  // unmuted; a muted mic picks the preference up on its next unmute).
  const applyOriginalSound = async (on: boolean) => {
    if (!localMicOn) return;
    try {
      changeMic(await micTrackFor(on));
    } catch {
      /* keep the current track if rebuilding fails */
    }
  };

  // Switch device while honoring Original Sound (micId is already updated in
  // the store by the DeviceMenu before this fires).
  const applyMicDevice = async (id: string) => {
    if (!localMicOn) {
      changeMic(id);
      return;
    }
    try {
      changeMic(await micTrackFor(useSettingsStore.getState().originalSound));
    } catch {
      changeMic(id);
    }
  };

  const sendChat = async (text: string, files: File[]) => {
    if (chatBlocked) return;
    // Upload each attachment to VideoSDK temporary storage; only the small
    // fileUrl + metadata travel over pubsub (never the base64 bytes).
    const uploaded: ChatAttachment[] = [];
    for (const file of files) {
      try {
        const base64Data = await fileToBase64(file);
        const url = await uploadBase64File({
          base64Data,
          token: VIDEOSDK_TOKEN,
          fileName: file.name,
        });
        if (url) {
          uploaded.push({ name: file.name, size: file.size, mime: file.type, url });
        }
      } catch {
        /* skip a file that failed to read/upload */
      }
    }
    publishChat(JSON.stringify({ text, files: uploaded }), { persist: true });
  };

  const handleDownloadFile = async (file: ChatAttachment) => {
    const base64 = await fetchBase64File({ url: file.url, token: VIDEOSDK_TOKEN });
    if (!base64) return;
    const objectUrl = base64ToObjectUrl(base64, file.mime);
    triggerDownload(objectUrl, file.name);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  };

  // Guest-side unmute block at the source (the button/chevron are also disabled).
  useMeetingHotkeys(
    () => handleToggleMic(),
    () => toggleWebcam(),
  );

  // Host unmute enforcement: when revoked, immediately mute every unmuted
  // remote (handles anyone already talking). MicEnforcer children keep them
  // muted continuously if they try to unmute again.
  useEffect(() => {
    if (!isHost || controls.permissions.unmute) return;
    participants.forEach((p) => {
      if (p.id !== localParticipant?.id && p.micOn) {
        try {
          p.disableMic();
        } catch {
          /* already gone */
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, controls.permissions.unmute]);

  // Host share enforcement: if a remote is presenting when share is revoked,
  // ask them to stop (cooperative -- no native remote-share-stop exists).
  useEffect(() => {
    if (!isHost || controls.permissions.share) return;
    if (presenterId && presenterId !== localParticipant?.id) {
      publishStopShareRef.current("STOP", {
        sendOnly: [presenterId],
        persist: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, controls.permissions.share, presenterId]);

  // When a waiting guest is admitted (amWaiting: true → false), restore the
  // mic/cam intent they picked at pre-join (the host had forced them off).
  const prevAmWaiting = useRef(amWaiting);
  useEffect(() => {
    if (prevAmWaiting.current && !amWaiting) {
      if (initialMicOn && !localMicOn) toggleMic();
      if (initialWebcamOn && !localWebcamOn) toggleWebcam();
    }
    prevAmWaiting.current = amWaiting;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amWaiting]);

  const panelVMs: ParticipantVM[] = [...participants.values()]
    .filter((p) => !waitingIds.has(p.id))
    .map((p) => ({
      id: p.id,
      name: p.displayName || "Guest",
      isLocal: p.id === localParticipant?.id,
      isHost: p.id === localParticipant?.id && isHost,
      micOn: !!p.micOn,
      webcamOn: !!p.webcamOn,
      handRaised: raisedHands.has(p.id),
      color: colorForId(p.id),
    }));

  const waitingVMs = waitingSet.map((id) => ({
    id,
    name: participants.get(id)?.displayName || "Guest",
  }));

  const openPanel = (panel: PanelType) => {
    setActivePanel((cur) => (cur === panel ? null : panel));
  };

  // Real Leave click: tag it so onMeetingLeft treats the exit as intentional.
  const handleLeave = () => {
    intentionalLeave.current = true;
    try {
      leave();
    } catch {
      onLeave();
    }
  };

  const handleEnd = () => {
    intentionalLeave.current = true;
    try {
      end();
    } catch {
      onLeave();
    }
  };

  // Composite cloud recording (host). `recordingState` drives the button; a
  // failure (e.g. recording not enabled on the account) surfaces via onError
  // and the status reverts to stopped.
  const recordingActive = recordingStatus === "RECORDING_STARTED";
  const recordingBusy =
    recordingStatus === "RECORDING_STARTING" ||
    recordingStatus === "RECORDING_STOPPING";
  const handleToggleRecording = () => {
    if (recordingActive || recordingStatus === "RECORDING_STARTING") {
      stopRecording();
    } else {
      startRecording(undefined, undefined, {
        layout: { type: "GRID", priority: "SPEAKER", gridSize: 4 },
        orientation: "landscape",
        quality: "high",
        mode: "video-and-audio",
      });
    }
  };

  // Host "Mute All" -- force-mute every remote participant.
  const muteAll = () => {
    participants.forEach((p) => {
      if (p.id !== localParticipant?.id) {
        try {
          p.disableMic();
        } catch {
          /* participant may have already left */
        }
      }
    });
  };

  if (amWaiting) {
    return (
      <WaitingRoom
        roomId={roomId}
        name={localParticipant?.displayName || "Guest"}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div className="relative flex h-screen w-screen flex-col bg-stage">
      <RecordingIndicator active={recordingActive} />
      {joinError && (
        <div className="absolute left-1/2 top-14 z-30 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-leave px-4 py-2.5 text-sm text-white shadow-lg">
          <span>{joinError}</span>
          <button
            onClick={() => onLeave()}
            className="rounded bg-white/20 px-2 py-1 text-xs font-medium hover:bg-white/30"
          >
            Back to Home
          </button>
        </div>
      )}
      <TopBar
        meetingId={roomId}
        elapsed={elapsed}
        view={view}
        onSetView={setView}
        onOriginalSoundChange={applyOriginalSound}
      />

      <div className="relative flex min-h-0 flex-1">
        <div ref={stageRef} className="min-w-0 flex-1">
          {(() => {
            const liveTiles = visibleIds.map((id) => (
              <LiveParticipantTile
                key={id}
                participantId={id}
                handRaised={raisedHands.has(id)}
              />
            ));
            // Whiteboard → main area, participants as filmstrip.
            if (whiteboardUrl) {
              return (
                <SpeakerView
                  filmstrip={liveTiles}
                  main={
                    <iframe
                      title="Whiteboard"
                      src={whiteboardUrl}
                      className="h-full w-full border-0 bg-white"
                      allow="camera; microphone; display-capture"
                    />
                  }
                />
              );
            }
            // Screen share → main area, participants as filmstrip.
            if (presenterId) {
              return (
                <SpeakerView
                  filmstrip={liveTiles}
                  main={
                    <div className="h-full w-full bg-black">
                      <VideoPlayer
                        participantId={presenterId}
                        type="share"
                        containerStyle={{ height: "100%", width: "100%" }}
                        videoStyle={{
                          height: "100%",
                          width: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  }
                />
              );
            }
            // Speaker view → active speaker large + filmstrip of the rest.
            if (view === "speaker") {
              const mainId = activeSpeakerId || visibleIds[0];
              return (
                <SpeakerView
                  filmstrip={visibleIds
                    .filter((id) => id !== mainId)
                    .map((id) => (
                      <LiveParticipantTile
                        key={id}
                        participantId={id}
                        handRaised={raisedHands.has(id)}
                      />
                    ))}
                  main={
                    mainId ? (
                      <div
                        className="h-full max-w-full"
                        style={{ aspectRatio: "16 / 9" }}
                      >
                        <LiveParticipantTile
                          participantId={mainId}
                          handRaised={raisedHands.has(mainId)}
                        />
                      </div>
                    ) : null
                  }
                />
              );
            }
            // Single participant: centered 16:9 tile sized by height.
            if (visibleIds.length === 1) {
              return (
                <div className="flex h-full w-full items-center justify-center p-4">
                  <div className="h-full max-w-full" style={{ aspectRatio: "16 / 9" }}>
                    <LiveParticipantTile
                      participantId={visibleIds[0]}
                      handRaised={raisedHands.has(visibleIds[0])}
                    />
                  </div>
                </div>
              );
            }
            // Gallery → responsive flex-wrap sized to fit every row (centered
            // trailing rows); see useGalleryTileSize.
            return (
              <div className="flex h-full w-full items-center justify-center p-4">
                <div
                  ref={gallery.ref}
                  className="flex h-full w-full flex-wrap content-center items-center justify-center gap-2"
                >
                  {visibleIds.map((id) => (
                    <div key={id} style={gallery.tileStyle}>
                      <LiveParticipantTile
                        participantId={id}
                        handRaised={raisedHands.has(id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {activePanel === "participants" && (
          <ParticipantsPanel
            participants={panelVMs}
            isHost={isHost}
            waiting={waitingVMs}
            onAdmit={admitWaiting}
            onDeny={denyWaiting}
            onClose={() => setActivePanel(null)}
            onMuteAll={muteAll}
            onRaiseHand={raiseHand}
            renderRowActions={(id) => (
              <LiveParticipantRowActions participantId={id} />
            )}
          />
        )}
        {activePanel === "chat" && (
          <ChatPanel
            messages={chatVMs}
            onSend={sendChat}
            onDownloadFile={handleDownloadFile}
            onClose={() => setActivePanel(null)}
            disabled={chatBlocked}
          />
        )}
        {activePanel === "polls" && (
          <PollsPanel
            isHost={isHost}
            polls={polls.polls}
            results={polls.results}
            myVotes={polls.myVotes}
            onCreate={polls.createPoll}
            onVote={polls.vote}
            onClose={() => setActivePanel(null)}
          />
        )}
      </div>

      <FloatingReactions reactions={floating} />

      {/* Host-side continuous unmute backstop (render-null, one per remote). */}
      {isHost &&
        visibleIds
          .filter((id) => id !== localParticipant?.id)
          .map((id) => (
            <MicEnforcer
              key={id}
              participantId={id}
              enforced={!controls.permissions.unmute}
            />
          ))}

      <ControlBar
        micOn={!!localMicOn}
        webcamOn={!!localWebcamOn}
        isHost={isHost}
        participantCount={visibleIds.length}
        activePanel={activePanel}
        onToggleMic={() => handleToggleMic()}
        onToggleWebcam={() => toggleWebcam()}
        onShareScreen={async () => {
          if (shareBlocked) return;
          // Already presenting -> toggle off (no track needed).
          if (presenterId && presenterId === localParticipant?.id) {
            toggleScreenShare();
            return;
          }
          // Start a fresh share at 1080p30. `text` optimization keeps shared
          // documents/code crisp; VideoSDK default is only h720p_15fps.
          try {
            const track = await createScreenShareVideoTrack({
              encoderConfig: "h1080p_30fps",
              optimizationMode: "text",
              withAudio: "enable",
            });
            toggleScreenShare(track);
          } catch (e) {
            // User cancelled the picker or capture failed; stay silent to
            // match the rest of the screenshare error handling.
            if (isScreenShareError(e as { code?: string | number; message?: string })) return;
          }
        }}
        onWhiteboard={toggleWhiteboard}
        onTogglePip={togglePip}
        pipActive={pipActive}
        pipSupported={pipSupported}
        onToggleRecording={handleToggleRecording}
        recordingActive={recordingActive}
        recordingBusy={recordingBusy}
        onOpenPanel={openPanel}
        onLeave={handleLeave}
        onEnd={isHost ? handleEnd : undefined}
        onReact={sendReaction}
        onRaiseHand={raiseHand}
        onApplyMic={(id) => applyMicDevice(id)}
        onApplyCamera={(id) => changeWebcam?.(id)}
        controls={controlsSnapshot}
        onToggleLock={() => pushControls({ ...controlsSnapshot, locked: !controls.locked })}
        onToggleWaitingRoom={toggleWaitingRoom}
        onTogglePermission={(p) =>
          pushControls({
            ...controlsSnapshot,
            permissions: { ...controls.permissions, [p]: !controls.permissions[p] },
          })
        }
      />
    </div>
  );
}
