import { useEffect, useRef, useState } from "react";
import TopBar from "./TopBar";
import VideoGrid from "./VideoGrid";
import SpeakerView from "./SpeakerView";
import ParticipantTile from "./ParticipantTile";
import ControlBar from "./ControlBar";
import type { PanelType } from "./types";
import ParticipantsPanel from "@/components/panels/ParticipantsPanel";
import ChatPanel, {
  type ChatMessageVM,
  type ChatAttachment,
} from "@/components/panels/ChatPanel";
import PollsPanel from "@/components/panels/PollsPanel";
import FloatingReactions, { type FloatingReaction } from "./FloatingReactions";
import DrawingCanvas from "./DrawingCanvas";
import RecordingIndicator from "./RecordingIndicator";
import { useMeetingHotkeys } from "./useMeetingHotkeys";
import { MOCK_PARTICIPANTS, MOCK_CHAT, type MockParticipant } from "@/lib/mock";
import { colorForId } from "@/lib/participantVM";
import { triggerDownload } from "@/lib/file";
import { useMeetingControlsStore } from "@/store/useMeetingControlsStore";
import type { Poll, PollResults, MyVotes } from "@/lib/polls";

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

interface DemoMeetingProps {
  roomId: string;
  isHost: boolean;
  initialMicOn: boolean;
  initialWebcamOn: boolean;
  onLeave: () => void;
}

/**
 * Fully-interactive static meeting used when no VideoSDK token is configured,
 * so the UI is always demoable. Media state is local-only (no real streams).
 */
export default function DemoMeeting({
  roomId,
  isHost,
  initialMicOn,
  initialWebcamOn,
  onLeave,
}: DemoMeetingProps) {
  const [micOn, setMicOn] = useState(initialMicOn);
  const [webcamOn, setWebcamOn] = useState(initialWebcamOn);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [recording, setRecording] = useState(false);
  const [view, setView] = useState<"gallery" | "speaker">("gallery");
  const [messages, setMessages] = useState<ChatMessageVM[]>(MOCK_CHAT);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const reactionSeq = useRef(0);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [results, setResults] = useState<PollResults>({});
  const [myVotes, setMyVotes] = useState<MyVotes>({});
  const elapsed = useElapsed();

  // Host meeting controls (Security menu) + a simulated Waiting Room queue.
  const controls = useMeetingControlsStore();
  // Reset controls on mount so a lock/permission from a prior (or Live) meeting
  // doesn't leak into this one via the shared singleton store.
  useEffect(() => {
    useMeetingControlsStore.getState().reset();
  }, [roomId]);
  const [pendingWaiting, setPendingWaiting] = useState([
    { id: "w1", name: "Jordan Lee" },
  ]);
  const [admitted, setAdmitted] = useState<MockParticipant[]>([]);
  const waiting = controls.waitingRoomEnabled ? pendingWaiting : [];

  const admit = (id: string) => {
    const person = pendingWaiting.find((w) => w.id === id);
    if (!person) return;
    setPendingWaiting((prev) => prev.filter((w) => w.id !== id));
    setAdmitted((prev) => [
      ...prev,
      {
        id: person.id,
        name: person.name,
        isLocal: false,
        isHost: false,
        micOn: true,
        webcamOn: false,
        handRaised: false,
        color: colorForId(person.id),
      },
    ]);
  };
  const deny = (id: string) =>
    setPendingWaiting((prev) => prev.filter((w) => w.id !== id));

  const createPoll = (question: string, options: string[]) => {
    const id = `poll-${polls.length}`;
    setPolls((prev) => [...prev, { id, question, options, launched: true }]);
    setResults((prev) => ({ ...prev, [id]: options.map(() => 0) }));
  };
  const votePoll = (pollId: string, optionIndex: number) => {
    if (myVotes[pollId] !== undefined) return;
    setMyVotes((prev) => ({ ...prev, [pollId]: optionIndex }));
    setResults((prev) => ({
      ...prev,
      [pollId]: prev[pollId].map((c, i) => (i === optionIndex ? c + 1 : c)),
    }));
  };

  const addReaction = (emoji: string) => {
    const id = `r-${reactionSeq.current++}`;
    setFloating((prev) => [...prev, { id, emoji, left: 10 + Math.floor(Math.random() * 80) }]);
    setTimeout(() => setFloating((prev) => prev.filter((r) => r.id !== id)), 3000);
  };

  const sendMessage = (text: string, files: File[]) => {
    // Demo has no VideoSDK storage; keep attachments as local object URLs.
    const attachments = files.map((f) => ({
      name: f.name,
      size: f.size,
      mime: f.type,
      url: URL.createObjectURL(f),
    }));
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${prev.length}`,
        senderName: "You",
        toName: "Everyone",
        message: text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isLocal: true,
        files: attachments.length ? attachments : undefined,
      },
    ]);
  };

  const handleDownloadFile = (file: ChatAttachment) => {
    triggerDownload(file.url, file.name);
  };

  const localParticipants = [
    ...MOCK_PARTICIPANTS.map((p) =>
      p.isLocal ? { ...p, micOn, webcamOn } : p,
    ),
    ...admitted,
  ];

  const openPanel = (panel: PanelType) => {
    setActivePanel((cur) => (cur === panel ? null : panel));
  };

  useMeetingHotkeys(
    () => setMicOn((v) => !v),
    () => setWebcamOn((v) => !v),
  );

  return (
    <div className="relative flex h-screen w-screen flex-col bg-stage">
      <RecordingIndicator active={recording} />
      <TopBar
        meetingId={roomId}
        elapsed={elapsed}
        view={view}
        onSetView={setView}
      />

      <div className="relative flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          {(() => {
            const activeId = "p2";
            const active =
              localParticipants.find((p) => p.id === activeId) ??
              localParticipants[0];
            // Whiteboard → shared content in the speaker-view main area.
            if (showWhiteboard) {
              return (
                <SpeakerView
                  filmstrip={localParticipants.map((p) => (
                    <ParticipantTile key={p.id} participant={p} />
                  ))}
                  main={
                    <div className="h-full w-full">
                      <DrawingCanvas />
                    </div>
                  }
                />
              );
            }
            // Speaker view → active speaker large + filmstrip of the rest.
            if (view === "speaker") {
              return (
                <SpeakerView
                  filmstrip={localParticipants
                    .filter((p) => p.id !== active.id)
                    .map((p) => (
                      <ParticipantTile key={p.id} participant={p} />
                    ))}
                  main={
                    <div className="h-full max-w-full" style={{ aspectRatio: "16 / 9" }}>
                      <ParticipantTile participant={active} isActiveSpeaker />
                    </div>
                  }
                />
              );
            }
            return (
              <VideoGrid participants={localParticipants} activeSpeakerId={activeId} />
            );
          })()}
        </div>

        {activePanel === "participants" && (
          <ParticipantsPanel
            participants={localParticipants}
            isHost={isHost}
            waiting={waiting}
            onAdmit={admit}
            onDeny={deny}
            onClose={() => setActivePanel(null)}
          />
        )}
        {activePanel === "chat" && (
          <ChatPanel
            messages={messages}
            onSend={sendMessage}
            onDownloadFile={handleDownloadFile}
            onClose={() => setActivePanel(null)}
          />
        )}
        {activePanel === "polls" && (
          <PollsPanel
            isHost={isHost}
            polls={polls}
            results={results}
            myVotes={myVotes}
            onCreate={createPoll}
            onVote={votePoll}
            onClose={() => setActivePanel(null)}
          />
        )}
      </div>

      <FloatingReactions reactions={floating} />

      <ControlBar
        micOn={micOn}
        webcamOn={webcamOn}
        isHost={isHost}
        participantCount={localParticipants.length}
        activePanel={activePanel}
        onToggleMic={() => setMicOn((v) => !v)}
        onToggleWebcam={() => setWebcamOn((v) => !v)}
        onWhiteboard={() => setShowWhiteboard((v) => !v)}
        onToggleRecording={() => setRecording((v) => !v)}
        recordingActive={recording}
        onOpenPanel={openPanel}
        onLeave={onLeave}
        onReact={addReaction}
        onRaiseHand={() => {}}
        controls={{
          locked: controls.locked,
          waitingRoomEnabled: controls.waitingRoomEnabled,
          permissions: controls.permissions,
        }}
        onToggleLock={() => controls.setLocked(!controls.locked)}
        onToggleWaitingRoom={() =>
          controls.setWaitingRoom(!controls.waitingRoomEnabled)
        }
        onTogglePermission={(p) => controls.setPermission(p, !controls.permissions[p])}
      />
    </div>
  );
}
