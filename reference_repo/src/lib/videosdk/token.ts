/**
 * VideoSDK auth tokens.
 *
 * These are signed at BUILD TIME by vite.config.ts from VIDEOSDK_API_KEY +
 * VIDEOSDK_SECRET (see scripts/videosdk-token.mjs) and injected here as the
 * `__VIDEOSDK_TOKEN__` / `__VIDEOSDK_API_TOKEN__` literals. So deploying only
 * needs the API key + secret set as env vars — no manual `mint-token` step, and
 * the secret is never shipped to the client. A pre-set VITE_VIDEOSDK_TOKEN
 * (e.g. a dashboard token) is used as a fallback when key/secret are absent.
 *
 * VideoSDK v2 splits roles: `rtc` joins meetings; `crawler` calls the REST APIs
 * (create/validate room). Hence two tokens.
 */
declare const __VIDEOSDK_TOKEN__: string;
declare const __VIDEOSDK_API_TOKEN__: string;

/** The rtc (join) token used by the client to join meetings. */
export const VIDEOSDK_TOKEN: string =
  typeof __VIDEOSDK_TOKEN__ === "string" ? __VIDEOSDK_TOKEN__ : "";

/** The crawler token for server REST APIs; falls back to the join token. */
export const VIDEOSDK_API_TOKEN: string =
  (typeof __VIDEOSDK_API_TOKEN__ === "string" ? __VIDEOSDK_API_TOKEN__ : "") ||
  VIDEOSDK_TOKEN;

export function hasToken(): boolean {
  return VIDEOSDK_TOKEN.trim().length > 0;
}
