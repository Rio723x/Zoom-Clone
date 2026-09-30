import { test, expect } from "@playwright/test";

/**
 * Chat file-sharing in demo mode (no VideoSDK token needed — attachments use
 * local object URLs). Verifies attach/send plus the 10 MB and 2-file caps.
 */
test("demo chat: attach + send a file, and enforce the size/count caps", async ({
  page,
}) => {
  await page.goto("/meeting/demo-chatfiles");
  await page.getByPlaceholder("Your Name").fill("File Tester");
  await page.getByRole("button", { name: "Join", exact: true }).click();

  await page.getByRole("button", { name: "Chat" }).click();
  const fileInput = page.locator('input[type="file"]');

  // Attach a small file (a files-only message) and send it.
  await fileInput.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello attachment"),
  });
  await expect(page.getByText("notes.txt")).toBeVisible(); // composer chip
  await page.getByRole("button", { name: "Send message" }).click();
  // The sent message shows the downloadable file chip.
  await expect(page.getByRole("button", { name: /notes\.txt/ })).toBeVisible();

  // A file over 10 MB is rejected with an error and not attached.
  await fileInput.setInputFiles({
    name: "big.bin",
    mimeType: "application/octet-stream",
    buffer: Buffer.alloc(11 * 1024 * 1024),
  });
  await expect(page.getByText("Each file must be under 10 MB.")).toBeVisible();

  // Selecting three files caps at two, with an explanatory error.
  await fileInput.setInputFiles([
    { name: "a.txt", mimeType: "text/plain", buffer: Buffer.from("a") },
    { name: "b.txt", mimeType: "text/plain", buffer: Buffer.from("b") },
    { name: "c.txt", mimeType: "text/plain", buffer: Buffer.from("c") },
  ]);
  await expect(
    page.getByText("You can attach up to 2 files per message."),
  ).toBeVisible();
  await expect(page.getByText("a.txt")).toBeVisible();
  await expect(page.getByText("b.txt")).toBeVisible();
  await expect(page.getByText("c.txt")).toHaveCount(0);
});
