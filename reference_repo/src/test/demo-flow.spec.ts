import { test, expect } from "@playwright/test";

/**
 * End-to-end journey through the demo meeting (no VideoSDK token required),
 * exercising join, chat, reactions, and polls.
 */
test("demo meeting: join → chat → poll", async ({ page }) => {
  await page.goto("/meeting/demo-e2e");

  // Pre-join
  await page.getByPlaceholder("Your Name").fill("E2E Tester");
  await page.getByRole("button", { name: "Join", exact: true }).click();

  // In-meeting control bar
  await expect(page.getByText("Original Sound: Off")).toBeVisible();
  await expect(page.getByRole("button", { name: "Chat" })).toBeVisible();

  // Recording toggle (mocked in demo): Record -> Stop + indicator -> Record
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await expect(page.getByText("Recording", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByRole("button", { name: "Record", exact: true })).toBeVisible();

  // Chat
  await page.getByRole("button", { name: "Chat" }).click();
  await page.getByPlaceholder("Type message here...").fill("Hello E2E");
  await page.getByPlaceholder("Type message here...").press("Enter");
  await expect(page.getByText("Hello E2E")).toBeVisible();

  // Polls: create + vote + results
  await page.getByRole("button", { name: "Polling" }).click();
  await page.getByRole("button", { name: "Create a Poll" }).click();
  await page.getByPlaceholder("Poll question").fill("Best editor?");
  await page.getByPlaceholder("Option 1").fill("VS Code");
  await page.getByPlaceholder("Option 2").fill("Neovim");
  await page.getByRole("button", { name: "Launch" }).click();
  await page.getByRole("button", { name: /VS Code/ }).click();
  await expect(page.getByText("100%")).toBeVisible();
});
