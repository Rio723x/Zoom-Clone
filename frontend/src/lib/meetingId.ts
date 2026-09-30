const ID_PATTERN = /^[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}$/;

/**
 * Accepts a bare meeting ID ("892-573-401", "892573401") or a full invite link
 * ("https://host/meeting/892-573-401?x=1") and returns the normalised ID, or null.
 */
export function parseMeetingId(input: string): string | null {
  let candidate = input.trim();
  if (!candidate) return null;

  const fromLink = candidate.match(/\/meeting\/([^/?#\s]+)/i);
  if (fromLink) candidate = fromLink[1];

  candidate = candidate.toLowerCase().replace(/[\s_]/g, "");
  if (/^[a-z0-9]{9}$/.test(candidate)) {
    candidate = `${candidate.slice(0, 3)}-${candidate.slice(3, 6)}-${candidate.slice(6)}`;
  }
  return ID_PATTERN.test(candidate) ? candidate : null;
}
