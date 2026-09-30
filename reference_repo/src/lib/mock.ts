/** Mock data used to build the static UI (M1) before wiring VideoSDK (M2+). */

export interface MockParticipant {
  id: string;
  name: string;
  isLocal: boolean;
  isHost: boolean;
  micOn: boolean;
  webcamOn: boolean;
  handRaised: boolean;
  /** Solid color used as the avatar / empty-tile background. */
  color: string;
  /** Optional current emoji reaction. */
  reaction?: string;
}

export const MOCK_PARTICIPANTS: MockParticipant[] = [
  { id: "p1", name: "You", isLocal: true, isHost: true, micOn: true, webcamOn: true, handRaised: false, color: "#3b6ea5" },
  { id: "p2", name: "Sarah Chen", isLocal: false, isHost: false, micOn: true, webcamOn: true, handRaised: false, color: "#8e5aa8" },
  { id: "p3", name: "Marcus Reid", isLocal: false, isHost: false, micOn: false, webcamOn: true, handRaised: true, color: "#4a7c59" },
  { id: "p4", name: "Priya Nair", isLocal: false, isHost: false, micOn: true, webcamOn: false, handRaised: false, color: "#a8622d", reaction: "👍" },
  { id: "p5", name: "Tom Becker", isLocal: false, isHost: false, micOn: false, webcamOn: false, handRaised: false, color: "#5a5aa8" },
  { id: "p6", name: "Ana Duarte", isLocal: false, isHost: false, micOn: true, webcamOn: true, handRaised: false, color: "#a83b5a" },
];

export interface MockChatMessage {
  id: string;
  senderName: string;
  toName: string;
  message: string;
  timestamp: string;
  isLocal: boolean;
}

export const MOCK_CHAT: MockChatMessage[] = [
  { id: "c1", senderName: "Sarah Chen", toName: "Everyone", message: "Hi all, thanks for joining!", timestamp: "10:01 AM", isLocal: false },
  { id: "c2", senderName: "Marcus Reid", toName: "Everyone", message: "Can everyone see my screen?", timestamp: "10:02 AM", isLocal: false },
  { id: "c3", senderName: "You", toName: "Everyone", message: "Yes, looks good 👍", timestamp: "10:02 AM", isLocal: true },
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
