#!/usr/bin/env node
// OPTIONAL convenience: write pre-signed VideoSDK tokens into .env.
//
// You normally do NOT need this — vite.config.ts signs the tokens at build/dev
// time straight from VIDEOSDK_API_KEY + VIDEOSDK_SECRET. This script only helps
// if you want the VITE_ tokens materialized in .env (e.g. to inspect them).
//
// Usage: pnpm mint-token
import { readFileSync, writeFileSync } from "node:fs";
import { signVideosdkTokens } from "./videosdk-token.mjs";

const envUrl = new URL("../.env", import.meta.url);
const env = readFileSync(envUrl, "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim();

const apikey = get("VIDEOSDK_API_KEY");
const secret = get("VIDEOSDK_SECRET");
if (!apikey || !secret) {
  console.error("Missing VIDEOSDK_API_KEY / VIDEOSDK_SECRET in .env");
  process.exit(1);
}

const { rtc, crawler } = signVideosdkTokens({
  apikey,
  secret,
  expiresIn: get("VIDEOSDK_TOKEN_EXPIRY") || "7d",
});

const setLine = (src, key, val) => {
  const line = `${key}=${val}`;
  return src.match(new RegExp(`^${key}=.*$`, "m"))
    ? src.replace(new RegExp(`^${key}=.*$`, "m"), line)
    : `${src.trimEnd()}\n${line}\n`;
};

let out = setLine(env, "VITE_VIDEOSDK_TOKEN", rtc);
out = setLine(out, "VITE_VIDEOSDK_API_TOKEN", crawler);
writeFileSync(envUrl, out);

console.log(
  "Wrote VITE_VIDEOSDK_TOKEN (rtc) + VITE_VIDEOSDK_API_TOKEN (crawler). " +
    "Note: not required — the build signs these automatically.",
);
