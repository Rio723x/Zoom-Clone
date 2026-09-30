/**
 * Host tokens are issued once when a meeting is created. Keeping them in this browser is
 * what lets the creator come back (reload, or start a scheduled meeting later) as host.
 * Storage can be unavailable (private mode, blocked cookies), so every access is guarded.
 */
const key = (meetingId: string) => `vcm-host-token:${meetingId}`;

export function saveHostToken(meetingId: string, token: string): void {
  try {
    localStorage.setItem(key(meetingId), token);
  } catch {
    /* storage unavailable: the creator just won't be recognised as host on return */
  }
}

export function getHostToken(meetingId: string): string | null {
  try {
    return localStorage.getItem(key(meetingId));
  } catch {
    return null;
  }
}

export function removeHostToken(meetingId: string): void {
  try {
    localStorage.removeItem(key(meetingId));
  } catch {
    /* nothing to clean up */
  }
}
