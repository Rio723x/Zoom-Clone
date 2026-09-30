import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Page } from "@playwright/test";
import { resolveVideosdkTokens } from "../../scripts/videosdk-token.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Parse the repo .env into a plain object (tests run in Node, pre-Vite). */
function loadEnvFile(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const content = readFileSync(resolve(__dirname, "../../.env"), "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env — live tests will self-skip */
  }
  return out;
}

// Resolve the same way the build does: sign from API key/secret, else fall back
// to any pre-set VITE_ tokens. Keeps live tests working with the new .env that
// only holds the key + secret.
const tokens = resolveVideosdkTokens(loadEnvFile());

/** The client join token (rtc role) — presence gates the live tests. */
export function readToken(): string {
  return tokens.rtc;
}

/** The server-API token (crawler role) used to create rooms. */
export function readApiToken(): string {
  return tokens.crawler;
}

/** Create a fresh VideoSDK room via REST and return its id. */
export async function createRoom(token: string): Promise<string> {
  const res = await fetch("https://api.videosdk.live/v2/rooms", {
    method: "POST",
    headers: { authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = (await res.json()) as { roomId: string };
  return data.roomId;
}

/** Drive the pre-join screen and enter the meeting under the given name. */
export async function joinMeeting(
  page: Page,
  roomId: string,
  name: string,
  opts: { asHost?: boolean } = {},
) {
  const query = opts.asHost ? "?role=host" : "";
  await page.goto(`/meeting/${roomId}${query}`);
  await page.getByPlaceholder("Your Name").fill(name);
  await page.getByRole("button", { name: "Join", exact: true }).click();
}

/** Open the host Security menu and toggle a row by its exact label. */
export async function toggleSecurity(host: Page, label: string) {
  await host.getByRole("button", { name: "Security" }).click();
  const menu = host.getByTestId("security-menu");
  await menu.getByText(label, { exact: true }).click();
  // Close the popover so it doesn't cover other controls.
  await host.locator(".fixed.inset-0.z-10").first().click();
}

/** Open the host Participants panel (idempotent-ish toggle). */
export async function openParticipants(host: Page) {
  await host.getByRole("button", { name: /Participants$/ }).click();
}

/**
 * Read the decoded-frame count of a remote participant's <video> as seen on
 * `page`, located by the participant's on-screen name. Returns -1 if the tile or
 * video isn't present yet.
 *
 * A paused SFU stream keeps the <video> element "playing" wall-clock time (so
 * `currentTime` still advances) but stops delivering decoded frames — so the
 * decoded-frame counter is the crisp "is it frozen?" signal, not currentTime.
 */
export async function decodedFrames(page: Page, name: string): Promise<number> {
  return page.evaluate((needle) => {
    const labels = Array.from(document.querySelectorAll("span")).filter((s) =>
      s.textContent?.includes(needle),
    );
    for (const label of labels) {
      const tile = label.closest(".rounded-tile");
      const video = tile?.querySelector("video");
      if (video && video.readyState >= 2) {
        const q = video.getVideoPlaybackQuality?.();
        if (q) return q.totalVideoFrames;
        const legacy = (video as unknown as { webkitDecodedFrameCount?: number })
          .webkitDecodedFrameCount;
        return typeof legacy === "number" ? legacy : -1;
      }
    }
    return -1;
  }, name);
}

/**
 * Show/hide a participant's tile (located by name) via `display`. Hiding it makes
 * the tile non-intersecting: the SDK's adaptive observer (if present) then pauses
 * the incoming stream, so decoded frames stall. The tile element stays in the DOM
 * so `decodedFrames` can still read it while hidden.
 */
export async function setTileHidden(page: Page, name: string, hidden: boolean) {
  await page.evaluate(
    ({ needle, hide }) => {
      const label = Array.from(document.querySelectorAll("span")).find((s) =>
        s.textContent?.includes(needle),
      );
      const tile = label?.closest(".rounded-tile") as HTMLElement | null;
      if (tile) tile.style.display = hide ? "none" : "";
    },
    { needle: name, hide: hidden },
  );
}

/** Admit the sole waiting guest from the host's Participants panel. */
export async function admitWaiting(host: Page) {
  await openParticipants(host);
  await host
    .getByText(/Waiting Room \(/)
    .waitFor({ state: "visible", timeout: 10_000 });
  await host.getByRole("button", { name: "Admit" }).click();
}
