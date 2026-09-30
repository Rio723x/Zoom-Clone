// Shared VideoSDK token signer. Used at build time (vite.config), by the E2E
// tests, and by the optional `pnpm mint-token` convenience script.
//
// VideoSDK v2 splits roles: `rtc` can join/run a meeting but NOT call server
// APIs; `crawler` can call server APIs (create room) but NOT run a meeting.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

/**
 * Sign the rtc (join) + crawler (REST) tokens from an API key/secret.
 * @param {{ apikey: string, secret: string, expiresIn?: string }} opts
 * @returns {{ rtc: string, crawler: string }}
 */
export function signVideosdkTokens({ apikey, secret, expiresIn = "365d" }) {
  const base = { apikey, permissions: ["allow_join", "allow_mod"], version: 2 };
  const opts = { algorithm: "HS256", expiresIn };
  return {
    rtc: jwt.sign({ ...base, roles: ["rtc"] }, secret, opts),
    crawler: jwt.sign({ ...base, roles: ["crawler"] }, secret, opts),
  };
}

/**
 * Resolve the two tokens from an env-like object. Prefers auto-signing from
 * VIDEOSDK_API_KEY + VIDEOSDK_SECRET; falls back to any pre-set
 * VITE_VIDEOSDK_TOKEN / VITE_VIDEOSDK_API_TOKEN (e.g. a dashboard token).
 * Returns empty strings when neither is available.
 * @param {Record<string, string | undefined>} env
 * @returns {{ rtc: string, crawler: string }}
 */
export function resolveVideosdkTokens(env) {
  if (env.VIDEOSDK_API_KEY && env.VIDEOSDK_SECRET) {
    return signVideosdkTokens({
      apikey: env.VIDEOSDK_API_KEY,
      secret: env.VIDEOSDK_SECRET,
      expiresIn: env.VIDEOSDK_TOKEN_EXPIRY || "365d",
    });
  }
  const rtc = env.VITE_VIDEOSDK_TOKEN || "";
  return { rtc, crawler: env.VITE_VIDEOSDK_API_TOKEN || rtc };
}
