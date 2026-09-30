/** Helpers for chat file attachments (VideoSDK temporary-file upload/fetch). */

/** Strip a `data:<mime>;base64,` prefix if present, returning raw base64. */
function stripBase64Prefix(data: string): string {
  const comma = data.indexOf(",");
  return data.startsWith("data:") && comma !== -1 ? data.slice(comma + 1) : data;
}

/** Read a File as raw base64 (no data-URL prefix), which is what uploadBase64File wants. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(stripBase64Prefix(String(reader.result)));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Turn base64 (with or without prefix) + mime into a downloadable object URL. */
export function base64ToObjectUrl(base64: string, mime: string): string {
  const raw = stripBase64Prefix(base64);
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime || "application/octet-stream" }));
}

/** Trigger a browser download of a URL under the given filename. */
export function triggerDownload(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Human-readable file size, e.g. 1.2 MB. */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}
