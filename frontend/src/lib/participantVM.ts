/** Common shape both mock and live participants conform to, for shared panels. */
export interface ParticipantVM {
  id: string;
  name: string;
  isLocal: boolean;
  isHost: boolean;
  micOn: boolean;
  webcamOn: boolean;
  handRaised: boolean;
  color: string;
  reaction?: string;
}

const PALETTE = [
  "#3b6ea5",
  "#8e5aa8",
  "#4a7c59",
  "#a8622d",
  "#5a5aa8",
  "#a83b5a",
  "#2d7d7d",
  "#7d5a2d",
];

/** Deterministic avatar/tile color from a participant id. */
export function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
