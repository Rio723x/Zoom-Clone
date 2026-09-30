import { VIDEOSDK_API_TOKEN } from "./token";

const API_BASE = "https://api.videosdk.live/v2";

/**
 * Create a new VideoSDK room and return its roomId.
 * There is no SDK method for this — it is a REST call authorized with the token.
 */
export async function createMeeting(): Promise<string> {
  const res = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    headers: {
      authorization: VIDEOSDK_API_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    throw new Error(`Failed to create meeting (${res.status})`);
  }
  const data = (await res.json()) as { roomId: string };
  return data.roomId;
}

/** Validate that a roomId exists / is joinable. */
export async function validateMeeting(roomId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/rooms/validate/${roomId}`, {
      headers: { authorization: VIDEOSDK_API_TOKEN },
    });
    return res.ok;
  } catch {
    return false;
  }
}
