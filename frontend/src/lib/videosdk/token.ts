/** Video conferencing auth token configuration. */

export const VIDEOSDK_TOKEN: string =
  process.env.NEXT_PUBLIC_VIDEOSDK_TOKEN ?? "";

export const VIDEOSDK_API_TOKEN: string =
  process.env.NEXT_PUBLIC_VIDEOSDK_API_TOKEN ?? VIDEOSDK_TOKEN;

/** Returns true when a valid token is configured, enabling live video calls. */
export function hasToken(): boolean {
  return VIDEOSDK_TOKEN.trim().length > 0;
}
