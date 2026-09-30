import { test, expect } from "@playwright/test";

/**
 * Mobile control-bar layout (demo meeting, no VideoSDK token required).
 * On a phone-width viewport the control bar collapses to Mic + Camera + More +
 * Leave, and every other feature moves into the "More" bottom sheet.
 */
test.use({ viewport: { width: 390, height: 844 } });

test("mobile: control bar collapses features into a More sheet", async ({ page }) => {
  // Host, so the sheet includes the host-only Security + Record.
  await page.goto("/meeting/demo-mobile?role=host");

  await page.getByPlaceholder("Your Name").fill("Mobile Tester");
  await page.getByRole("button", { name: "Join", exact: true }).click();

  // Bar shows only the essentials.
  await expect(page.getByRole("button", { name: "Mute", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop Video", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "More", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Leave" })).toBeVisible();

  // The center feature group isn't rendered on mobile (moved to the sheet);
  // the marketing/top-bar chrome is CSS-hidden below the breakpoint.
  await expect(page.getByRole("button", { name: "Polling" })).toHaveCount(0);
  await expect(page.getByText("Original Sound: Off")).toBeHidden();
  await expect(page.getByRole("link", { name: "Fork now" })).toBeHidden();

  // Open the More sheet — the moved features live here.
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(page.getByRole("button", { name: "Participants" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Polling" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Whiteboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Raise Hand" })).toBeVisible();
  // Host-only sections.
  await expect(page.getByRole("button", { name: "Record", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lock Meeting" })).toBeVisible();

  // Tapping a panel tile dismisses the sheet and opens the full-screen panel.
  await page.getByRole("button", { name: "Chat" }).first().click();
  await expect(page.getByPlaceholder("Type message here...")).toBeVisible();
  await expect(page.getByRole("button", { name: "Lock Meeting" })).toHaveCount(0);

  // The panel closes and video returns; the collapsed bar is still there.
  await page.getByRole("button", { name: "Close panel" }).click();
  await expect(page.getByRole("button", { name: "More", exact: true })).toBeVisible();
});
