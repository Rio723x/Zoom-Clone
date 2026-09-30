/** Backend origin; set NEXT_PUBLIC_API_URL for deployments (e.g. https://api.example.com). */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export const API_BASE = `${API_URL}/api`;

/** WebSocket base: same host as the API, ws:// or wss:// to match its scheme. */
export const WS_BASE = `${API_URL.replace(/^http/, "ws")}/api`;
