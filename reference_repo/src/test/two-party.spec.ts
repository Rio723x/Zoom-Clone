import { test, expect, chromium } from "@playwright/test";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import {
  readToken,
  readApiToken,
  createRoom,
  joinMeeting,
  toggleSecurity,
  admitWaiting,
  decodedFrames,
  setTileHidden,
} from "./helpers";

/**
 * Two-participant end-to-end test using two isolated browser contexts, each
 * with its own fake camera/mic. Verifies roster sync and host controls, which
 * cannot be exercised with a single shared browser tab.
 */
test.describe("two-party meeting", () => {
  let browser: Browser;
  let token: string;

  test.beforeAll(async () => {
    token = readToken();
    browser = await chromium.launch({
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    });
  });

  test.afterAll(async () => {
    await browser?.close();
  });

  test("two participants federate and see each other", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    const roomId = await createRoom(readApiToken());
    expect(roomId).toBeTruthy();

    const hostCtx = await browser.newContext({ baseURL: "http://localhost:5173" });
    const guestCtx = await browser.newContext({ baseURL: "http://localhost:5173" });
    const host = await hostCtx.newPage();
    const guest = await guestCtx.newPage();

    await joinMeeting(host, roomId, "Host Hannah");
    await joinMeeting(guest, roomId, "Guest Gary");

    // A temporary dashboard token may have expired; skip rather than fail so the
    // suite stays green. Regenerate VITE_VIDEOSDK_TOKEN to run the full assertion.
    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    // Both should end up seeing 2 participants once the SFU federates them.
    await expect
      .poll(async () => await host.getByText("Guest Gary").count(), {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);
    await expect
      .poll(async () => await guest.getByText("Host Hannah").count(), {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("remote video keeps decoding frames and never freezes in the host's view", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    test.setTimeout(90_000);
    const roomId = await createRoom(readApiToken());

    const hostCtx = await browser.newContext({ baseURL: "http://localhost:5173" });
    const guestCtx = await browser.newContext({ baseURL: "http://localhost:5173" });
    const host = await hostCtx.newPage();
    const guest = await guestCtx.newPage();

    await joinMeeting(host, roomId, "Host Hannah", { asHost: true });
    await joinMeeting(guest, roomId, "Guest Gary");

    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    // Federate: the host must see the guest's tile with a decoding <video>.
    await expect
      .poll(async () => await host.getByText("Guest Gary").count(), {
        timeout: 40_000,
      })
      .toBeGreaterThan(0);
    await expect
      .poll(async () => await decodedFrames(host, "Guest Gary"), {
        timeout: 40_000,
      })
      .toBeGreaterThan(0);

    // The root-cause guarantee: our player has NO pause-on-offscreen observer, so
    // the remote stream must keep decoding regardless of the tile's visibility.
    // Hide the tile (which is exactly what a layout reflow transiently did on
    // mount) and confirm frames keep climbing while it's hidden. With the SDK's
    // observer (the bug), hiding the tile pauses the stream and the counter
    // stalls at a fixed value — a frozen frame — so this assertion would fail.
    await setTileHidden(host, "Guest Gary", true);
    await host.waitForTimeout(1200); // let any pause debounce (400ms) settle
    const hiddenBaseline = await decodedFrames(host, "Guest Gary");
    expect(hiddenBaseline).toBeGreaterThan(0);
    await expect
      .poll(async () => (await decodedFrames(host, "Guest Gary")) - hiddenBaseline, {
        timeout: 15_000,
      })
      .toBeGreaterThan(10);
    await setTileHidden(host, "Guest Gary", false);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("host Security controls restrict the participant live", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    test.setTimeout(90_000);
    const roomId = await createRoom(readApiToken());

    const hostCtx = await browser.newContext({ baseURL: "http://localhost:5173" });
    const guestCtx = await browser.newContext({ baseURL: "http://localhost:5173" });
    const host = await hostCtx.newPage();
    const guest = await guestCtx.newPage();

    await joinMeeting(host, roomId, "Host Hannah", { asHost: true });
    await joinMeeting(guest, roomId, "Guest Gary");

    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    // Both must be fully in the meeting (control bar visible) before we assert.
    await expect(
      host.getByRole("button", { name: "Security" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      guest.getByRole("button", { name: "Chat", exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    // Wait for federation so the HOST_CONTROL broadcast will reach the guest.
    await expect
      .poll(async () => await host.getByText("Guest Gary").count(), { timeout: 40_000 })
      .toBeGreaterThan(0);

    const guestChat = guest.getByRole("button", { name: "Chat", exact: true });
    const guestShare = guest.getByRole("button", {
      name: "Share Screen",
      exact: true,
    });
    await expect(guestChat).toBeEnabled();
    await expect(guestShare).toBeEnabled();

    // Host revokes Chat + Share Screen via the Security menu.
    await host.getByRole("button", { name: "Security" }).click();
    const menu = host.getByTestId("security-menu");
    await menu.getByText("Chat", { exact: true }).click();
    await menu.getByText("Share Screen", { exact: true }).click();

    // The guest's controls become disabled, driven by HOST_CONTROL.
    await expect(guestChat).toBeDisabled({ timeout: 10_000 });
    await expect(guestShare).toBeDisabled({ timeout: 10_000 });

    // Re-enabling restores them (host is never restricted).
    await menu.getByText("Chat", { exact: true }).click();
    await expect(guestChat).toBeEnabled({ timeout: 10_000 });

    // Close the Security menu (click its backdrop), then confirm the host's own
    // Chat was never disabled.
    await host.locator(".fixed.inset-0.z-10").click();
    await expect(
      host.getByRole("button", { name: "Chat", exact: true }),
    ).toBeEnabled();

    await hostCtx.close();
    await guestCtx.close();
  });
});

/**
 * Host-authoritative security enforcement. These exercise the real SDK-driven
 * behaviour (eject, force-mute, waiting-room hold) across genuinely federated
 * fake-media contexts, not just disabled buttons.
 */
test.describe("security enforcement (host-authoritative)", () => {
  let browser: Browser;
  let token: string;

  test.beforeAll(async () => {
    token = readToken();
    browser = await chromium.launch({
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    });
  });

  test.afterAll(async () => {
    await browser?.close();
  });

  async function join(
    roomId: string,
    name: string,
    opts: { asHost?: boolean } = {},
  ): Promise<{ ctx: BrowserContext; page: Page }> {
    const ctx = await browser.newContext({ baseURL: "http://localhost:5173" });
    const page = await ctx.newPage();
    await joinMeeting(page, roomId, name, opts);
    return { ctx, page };
  }

  const federated = (host: Page, name: string) =>
    expect
      .poll(async () => await host.getByText(name).count(), { timeout: 40_000 })
      .toBeGreaterThan(0);

  test("Lock ejects a late joiner but keeps existing participants", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    test.setTimeout(120_000);
    const roomId = await createRoom(readApiToken());

    const { ctx: hCtx, page: host } = await join(roomId, "Host Hannah", {
      asHost: true,
    });
    const { ctx: g1Ctx, page: guest1 } = await join(roomId, "Guest Uno");

    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    await expect(host.getByRole("button", { name: "Security" })).toBeVisible({
      timeout: 30_000,
    });
    await federated(host, "Guest Uno");

    // Host locks the meeting.
    await toggleSecurity(host, "Lock Meeting");

    // A late joiner is bounced back to Home with the lock reason.
    const { ctx: g2Ctx, page: guest2 } = await join(roomId, "Guest Dos");
    await expect(
      guest2.getByText("This meeting is locked by the host."),
    ).toBeVisible({ timeout: 30_000 });

    // The existing guest is untouched, and the host never keeps the late joiner.
    await expect(guest1.getByRole("button", { name: "Leave" })).toBeVisible();
    await expect
      .poll(async () => await host.getByText("Guest Dos").count(), {
        timeout: 15_000,
      })
      .toBe(0);

    await hCtx.close();
    await g1Ctx.close();
    await g2Ctx.close();
  });

  test("Waiting Room holds only later joiners and hides them from all", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    test.setTimeout(120_000);
    const roomId = await createRoom(readApiToken());

    const { ctx: hCtx, page: host } = await join(roomId, "Host Hannah", {
      asHost: true,
    });
    const { ctx: g1Ctx, page: guest1 } = await join(roomId, "Guest Uno");

    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    await expect(host.getByRole("button", { name: "Security" })).toBeVisible({
      timeout: 30_000,
    });
    await federated(host, "Guest Uno");

    // Enable the waiting room AFTER guest1 is already in — guest1 is grandfathered.
    await toggleSecurity(host, "Enable Waiting Room");
    await expect(
      guest1.getByRole("button", { name: "Leave" }),
    ).toBeVisible();

    // A later joiner is held on the waiting screen...
    const { ctx: g2Ctx, page: guest2 } = await join(roomId, "Guest Dos");
    await expect(
      guest2.getByText("Please wait, the host will let you in soon."),
    ).toBeVisible({ timeout: 30_000 });
    // ...and is hidden from the OTHER guest, not just the host.
    await expect
      .poll(async () => await guest1.getByText("Guest Dos").count(), {
        timeout: 10_000,
      })
      .toBe(0);

    // Host admits them; they enter the meeting and everyone sees them.
    await admitWaiting(host);
    await expect(guest2.getByRole("button", { name: "Leave" })).toBeVisible({
      timeout: 30_000,
    });
    await federated(guest1, "Guest Dos");

    await hCtx.close();
    await g1Ctx.close();
    await g2Ctx.close();
  });

  test("Revoking Unmute force-mutes the guest, and the hotkey can't override it", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    test.setTimeout(120_000);
    const roomId = await createRoom(readApiToken());

    const { ctx: hCtx, page: host } = await join(roomId, "Host Hannah", {
      asHost: true,
    });
    const { ctx: gCtx, page: guest } = await join(roomId, "Guest Uno");

    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    await expect(host.getByRole("button", { name: "Security" })).toBeVisible({
      timeout: 30_000,
    });
    await federated(host, "Guest Uno");
    // Guest starts unmuted.
    await expect(guest.getByRole("button", { name: "Mute", exact: true })).toBeVisible();

    // Host revokes "Unmute Themselves" → the guest is force-muted.
    await toggleSecurity(host, "Unmute Themselves");
    const guestUnmute = guest.getByRole("button", { name: "Unmute", exact: true });
    await expect(guestUnmute).toBeVisible({ timeout: 25_000 });
    await expect(guestUnmute).toBeDisabled({ timeout: 25_000 });

    // The M hotkey must not re-unmute; the backstop keeps them muted.
    await guest.locator("body").press("m");
    await guest.waitForTimeout(1500);
    await expect(
      guest.getByRole("button", { name: "Unmute", exact: true }),
    ).toBeVisible();
    await expect(
      guest.getByRole("button", { name: "Mute", exact: true }),
    ).toHaveCount(0);

    await hCtx.close();
    await gCtx.close();
  });

  test("Revoking Chat disables an already-open composer, and re-enabling restores it", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    test.setTimeout(120_000);
    const roomId = await createRoom(readApiToken());

    const { ctx: hCtx, page: host } = await join(roomId, "Host Hannah", {
      asHost: true,
    });
    const { ctx: gCtx, page: guest } = await join(roomId, "Guest Uno");

    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    await expect(host.getByRole("button", { name: "Security" })).toBeVisible({
      timeout: 30_000,
    });
    await federated(host, "Guest Uno");

    // Guest opens chat first, THEN the host revokes it — the open panel must lock.
    await guest.getByRole("button", { name: "Chat", exact: true }).click();
    await expect(guest.getByPlaceholder("Type message here...")).toBeVisible();

    await toggleSecurity(host, "Chat");
    await expect(
      guest.getByText("Chat has been disabled by the host."),
    ).toBeVisible({ timeout: 25_000 });
    await expect(
      guest.getByPlaceholder("Type message here..."),
    ).toHaveCount(0);

    // Re-enabling brings the composer back.
    await toggleSecurity(host, "Chat");
    await expect(
      guest.getByPlaceholder("Type message here..."),
    ).toBeVisible({ timeout: 25_000 });

    await hCtx.close();
    await gCtx.close();
  });

  test("Revoking Share Screen keeps Whiteboard reachable for the guest", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    test.setTimeout(120_000);
    const roomId = await createRoom(readApiToken());

    const { ctx: hCtx, page: host } = await join(roomId, "Host Hannah", {
      asHost: true,
    });
    const { ctx: gCtx, page: guest } = await join(roomId, "Guest Uno");

    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    await expect(host.getByRole("button", { name: "Security" })).toBeVisible({
      timeout: 30_000,
    });
    await federated(host, "Guest Uno");

    // Host revokes Share Screen.
    await toggleSecurity(host, "Share Screen");
    await expect(
      guest.getByRole("button", { name: "Share Screen", exact: true }),
    ).toBeDisabled({ timeout: 25_000 });

    // The Share chevron still opens, and Whiteboard remains usable even though
    // Share Screen itself is blocked (they share one menu).
    await guest.getByRole("button", { name: "Share Screen options" }).click();
    await expect(guest.getByText("Whiteboard")).toBeEnabled();

    await hCtx.close();
    await gCtx.close();
  });

  test("Lock state does not leak into the next meeting (store reset)", async () => {
    test.skip(!token, "VITE_VIDEOSDK_TOKEN not set");
    test.setTimeout(120_000);
    const roomA = await createRoom(readApiToken());
    const roomB = await createRoom(readApiToken());

    // One host context: lock room A, leave, host room B fresh.
    const { ctx: hCtx, page: host } = await join(roomA, "Host Hannah", {
      asHost: true,
    });
    const tokenError = await host
      .getByText(/token.*(invalid|expired)/i)
      .count()
      .catch(() => 0);
    test.skip(tokenError > 0, "VideoSDK token expired — regenerate to run");

    await expect(host.getByRole("button", { name: "Security" })).toBeVisible({
      timeout: 30_000,
    });
    await toggleSecurity(host, "Lock Meeting");
    // Re-host a brand-new room in the same context.
    await joinMeeting(host, roomB, "Host Hannah", { asHost: true });
    await expect(host.getByRole("button", { name: "Security" })).toBeVisible({
      timeout: 30_000,
    });

    // A guest joining room B must NOT be bounced (lock did not leak).
    const { ctx: gCtx, page: guest } = await join(roomB, "Guest Uno");
    await expect(guest.getByRole("button", { name: "Leave" })).toBeVisible({
      timeout: 30_000,
    });
    await federated(host, "Guest Uno");
    expect(
      await guest.getByText("This meeting is locked by the host.").count(),
    ).toBe(0);

    await hCtx.close();
    await gCtx.close();
  });
});
