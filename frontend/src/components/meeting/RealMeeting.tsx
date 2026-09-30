"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic, MicOff, Video, VideoOff, Users, MessageSquare,
  Monitor, ChevronUp, Shield, Smile, Copy, Check, Info
} from "lucide-react";

// ─── Elapsed timer ────────────────────────────────────────────────────────────
function useElapsed(): string {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Initials avatar ──────────────────────────────────────────────────────────
function Avatar({ name, size = 64 }: { name: string; size?: number }) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const bg = `hsl(${hue}, 45%, 40%)`;
  const fontSize = size * 0.35;
  return (
    <div
      style={{ width: size, height: size, background: bg, borderRadius: "50%", fontSize }}
      className="flex items-center justify-center font-semibold text-white select-none shrink-0"
    >
      {initials}
    </div>
  );
}

// ─── Control bar button ───────────────────────────────────────────────────────
function CtrlBtn({
  icon: Icon, label, onClick, active = false, danger = false, disabled = false, green = false, hasChevron = false, onChevron,
}: {
  icon: React.ElementType; label: string; onClick: () => void; active?: boolean; danger?: boolean; disabled?: boolean; green?: boolean; hasChevron?: boolean; onChevron?: () => void;
}) {
  return (
    <div className="flex flex-col items-center relative">
      <div className="flex items-center">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
            danger ? "text-[#e02b20] hover:bg-white/10" : active ? "text-white bg-white/20 hover:bg-white/25" : green ? "text-[#4caf50] hover:bg-white/10" : "text-white hover:bg-white/10"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </button>
        {hasChevron && (
          <button onClick={onChevron} className="text-white/60 hover:text-white px-0.5">
            <ChevronUp className="h-3 w-3" />
          </button>
        )}
      </div>
      <span className="text-[11px] text-white/70 leading-none">{label}</span>
    </div>
  );
}

// ─── Video Tile ───────────────────────────────────────────────────────────────
function VideoTile({ stream, name, micOn, camOn, isLocal }: { stream: MediaStream | null; name: string; micOn: boolean; camOn: boolean; isLocal: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-[#2c2c2c] w-full h-full flex items-center justify-center shadow-md border border-white/5">
      {camOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`h-full w-full object-cover ${isLocal ? "-scale-x-100" : ""}`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <Avatar name={name} size={96} />
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1">
        {micOn
          ? <Mic className="h-3 w-3 text-white/80" />
          : <MicOff className="h-3 w-3 text-[#e02b20]" />
        }
        <span className="text-xs text-white/90">{name} {isLocal ? "(You)" : ""}</span>
      </div>
    </div>
  );
}

// ─── Main Meeting Room ────────────────────────────────────────────────────────
interface RealMeetingProps {
  roomId: string;
  displayName: string;
  initialMicOn: boolean;
  initialWebcamOn: boolean;
  onLeave: () => void;
}

interface Peer {
  id: string;
  name: string;
  stream: MediaStream | null;
  micOn: boolean;
  camOn: boolean;
}

export default function RealMeeting({
  roomId,
  displayName,
  initialMicOn,
  initialWebcamOn,
  onLeave,
}: RealMeetingProps) {
  const elapsed = useElapsed();

  const [micOn, setMicOn] = useState(initialMicOn);
  const [camOn, setCamOn] = useState(initialWebcamOn);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  
  const [panel, setPanel] = useState<"chat" | "participants" | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showLeaveMenu, setShowLeaveMenu] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const pendingCandidates = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const clientId = useRef(Math.random().toString(36).substring(2, 10)).current;
  const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // ── WebRTC Signaling ────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    async function init() {
      // 1. Get local stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getAudioTracks().forEach(t => t.enabled = initialMicOn);
        stream.getVideoTracks().forEach(t => t.enabled = initialWebcamOn);
        if (!active) return;
        setLocalStream(stream);
        localStreamRef.current = stream;
      } catch (e) {
        console.error("Failed to get media", e);
      }

      // 2. Connect WebSocket
      const wsUrl = `ws://${window.location.hostname}:8000/api/ws/${roomId}/${clientId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "user-joined", name: displayName, micOn: initialMicOn, camOn: initialWebcamOn, sender: clientId }));
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        const sender = msg.sender || msg.clientId;
        
        if (msg.type === "user-joined") {
          setPeers(prev => ({ ...prev, [sender]: { id: sender, name: msg.name, stream: null, micOn: msg.micOn, camOn: msg.camOn } }));
          // Initiator
          const pc = createPeerConnection(sender);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws.send(JSON.stringify({ type: "offer", target: sender, sender: clientId, offer, name: displayName, micOn, camOn }));
        } 
        else if (msg.type === "offer") {
          setPeers(prev => ({ ...prev, [sender]: { id: sender, name: msg.name, stream: null, micOn: msg.micOn, camOn: msg.camOn } }));
          const pc = createPeerConnection(sender);
          await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
          if (pendingCandidates.current[sender]) {
            for (const c of pendingCandidates.current[sender]) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
            pendingCandidates.current[sender] = [];
          }
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", target: sender, sender: clientId, answer }));
        } 
        else if (msg.type === "answer") {
          const pc = peerConnections.current[sender];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
            if (pendingCandidates.current[sender]) {
              for (const c of pendingCandidates.current[sender]) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
              pendingCandidates.current[sender] = [];
            }
          }
        } 
        else if (msg.type === "ice-candidate") {
          const pc = peerConnections.current[sender];
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(console.error);
          } else {
            if (!pendingCandidates.current[sender]) pendingCandidates.current[sender] = [];
            pendingCandidates.current[sender].push(msg.candidate);
          }
        } 
        else if (msg.type === "user-left") {
          const pc = peerConnections.current[sender];
          if (pc) { pc.close(); delete peerConnections.current[sender]; }
          setPeers(prev => {
            const next = { ...prev };
            delete next[sender];
            return next;
          });
        }
        else if (msg.type === "chat") {
          setMessages(prev => [...prev, { id: Math.random().toString(), sender: msg.name, text: msg.text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false }]);
        }
        else if (msg.type === "state-change") {
          setPeers(prev => {
            if (!prev[sender]) return prev;
            return { ...prev, [sender]: { ...prev[sender], micOn: msg.micOn, camOn: msg.camOn } };
          });
        }
      };
    }

    init();

    return () => {
      active = false;
      wsRef.current?.close();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function createPeerConnection(peerId: string) {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[peerId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: "ice-candidate", target: peerId, sender: clientId, candidate: event.candidate }));
      }
    };

    pc.ontrack = (event) => {
      setPeers(prev => {
        if (!prev[peerId]) return prev;
        return { ...prev, [peerId]: { ...prev[peerId], stream: event.streams[0] } };
      });
    };

    return pc;
  }

  // ── Controls ────────────────────────────────────────────────────────────────
  function toggleMic() {
    const newMic = !micOn;
    setMicOn(newMic);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = newMic; });
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "state-change", sender: clientId, micOn: newMic, camOn }));
    }
  }

  function toggleCam() {
    const newCam = !camOn;
    setCamOn(newCam);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = newCam; });
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "state-change", sender: clientId, micOn, camOn: newCam }));
    }
  }

  function sendMessage(text: string) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", sender: clientId, name: displayName, text }));
    }
    setMessages(prev => [...prev, { id: Math.random().toString(), sender: displayName, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true }]);
  }

  function handleLeave() {
    wsRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peerConnections.current).forEach(pc => pc.close());
    onLeave();
  }

  // ── Layout ──────────────────────────────────────────────────────────────────
  const peerList = Object.values(peers);
  const totalUsers = peerList.length + 1;
  let gridCols = 1;
  if (totalUsers > 1 && totalUsers <= 4) gridCols = 2;
  else if (totalUsers > 4 && totalUsers <= 9) gridCols = 3;
  else if (totalUsers > 9) gridCols = 4;

  return (
    <div className="flex h-screen w-screen bg-[#1c1c1c] overflow-hidden">
      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex h-11 shrink-0 items-center justify-between bg-[#1c1c1c] px-4">
          <div className="flex items-center gap-2 relative">
            <button onClick={() => setShowInfo(v => !v)} className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-white/70 hover:bg-white/10">
              <Info className="h-3.5 w-3.5" /> {roomId}
            </button>
            {showInfo && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowInfo(false)} />
                <div className="absolute left-4 top-10 z-30 w-72 rounded-xl bg-[#2c2c2c] border border-[#404040] shadow-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Meeting Info</span>
                    <button onClick={() => setShowInfo(false)} className="text-white/50 hover:text-white">×</button>
                  </div>
                  <div className="space-y-2 text-xs text-white/70">
                    <div className="flex justify-between"><span>Meeting ID</span><span className="font-mono text-white">{roomId}</span></div>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/meeting/${roomId}`)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B5CFF] py-2 text-xs text-white hover:bg-[#0950e8]">
                    <Copy className="h-3.5 w-3.5" /> Copy Invite Link
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <span className="font-mono">{elapsed}</span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="relative flex-1 overflow-hidden bg-[#1c1c1c] p-4 flex items-center justify-center">
          <div className={`grid gap-4 w-full h-full`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gridAutoRows: '1fr' }}>
            <VideoTile stream={localStream} name={displayName} micOn={micOn} camOn={camOn} isLocal={true} />
            {peerList.map(peer => (
              <VideoTile key={peer.id} stream={peer.stream} name={peer.name} micOn={peer.micOn} camOn={peer.camOn} isLocal={false} />
            ))}
          </div>
        </div>

        {/* Control bar */}
        <div className="flex h-[70px] shrink-0 items-center justify-between bg-[#1c1c1c] px-6 border-t border-white/5">
          <div className="flex items-center gap-1">
            <CtrlBtn icon={micOn ? Mic : MicOff} label={micOn ? "Mute" : "Unmute"} onClick={toggleMic} danger={!micOn} />
            <CtrlBtn icon={camOn ? Video : VideoOff} label={camOn ? "Stop Video" : "Start Video"} onClick={toggleCam} danger={!camOn} />
          </div>
          <div className="flex items-center gap-1">
            <CtrlBtn icon={Shield} label="Security" onClick={() => {}} />
            <CtrlBtn icon={Users} label="Participants" onClick={() => setPanel(p => p === "participants" ? null : "participants")} active={panel === "participants"} />
            <CtrlBtn icon={MessageSquare} label="Chat" onClick={() => setPanel(p => p === "chat" ? null : "chat")} active={panel === "chat"} />
            <CtrlBtn icon={Monitor} label="Share Screen" onClick={() => {}} green />
            <CtrlBtn icon={Smile} label="Reactions" onClick={() => {}} />
          </div>
          <div className="relative">
            <button onClick={() => setShowLeaveMenu(v => !v)} className="rounded-lg bg-[#e02b20] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c92318] transition-colors">Leave</button>
            {showLeaveMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLeaveMenu(false)} />
                <div className="absolute bottom-14 right-0 z-20 w-52 overflow-hidden rounded-xl bg-[#2c2c2c] border border-[#404040] shadow-2xl py-1">
                  <button onClick={handleLeave} className="block w-full px-4 py-2.5 text-left text-sm text-[#e02b20] hover:bg-white/5 font-semibold">End Meeting for All</button>
                  <button onClick={handleLeave} className="block w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/5">Leave Meeting</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Side panel ────────────────────────────────────────────────────── */}
      {panel === "chat" && (
        <div className="w-[340px] shrink-0 flex flex-col h-full bg-[#2c2c2c] border-l border-[#404040]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#404040]">
             <span className="text-sm font-semibold text-white">In-Meeting Chat</span>
             <button onClick={() => setPanel(null)} className="text-white/50 hover:text-white text-lg leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                   <span className="text-[10px] text-white/40 mb-0.5">{msg.isMe ? "You" : msg.sender} · {msg.time}</span>
                   <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.isMe ? "bg-[#0B5CFF] text-white" : "bg-[#3a3a3a] text-white"}`}>{msg.text}</div>
                </div>
             ))}
          </div>
          <div className="p-3 border-t border-[#404040]">
             <input onKeyDown={e => { if (e.key === 'Enter') { sendMessage(e.currentTarget.value); e.currentTarget.value = ''; } }} placeholder="Type a message and press Enter..." className="w-full rounded-lg bg-[#3a3a3a] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none" />
          </div>
        </div>
      )}
      {panel === "participants" && (
        <div className="w-[340px] shrink-0 flex flex-col h-full bg-[#2c2c2c] border-l border-[#404040]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#404040]">
             <span className="text-sm font-semibold text-white">Participants ({totalUsers})</span>
             <button onClick={() => setPanel(null)} className="text-white/50 hover:text-white text-lg leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
             <div className="flex items-center gap-3 py-2">
                <Avatar name={displayName} size={36} />
                <div className="flex-1"><p className="text-sm text-white font-medium">{displayName} <span className="text-white/40 text-xs">(Host, Me)</span></p></div>
                <div className="flex gap-1 text-white/50">{micOn ? <Mic className="h-4 w-4"/> : <MicOff className="h-4 w-4 text-red-500"/>}</div>
             </div>
             {peerList.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2">
                   <Avatar name={p.name} size={36} />
                   <div className="flex-1"><p className="text-sm text-white font-medium">{p.name}</p></div>
                   <div className="flex gap-1 text-white/50">{p.micOn ? <Mic className="h-4 w-4"/> : <MicOff className="h-4 w-4 text-red-500"/>}</div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
