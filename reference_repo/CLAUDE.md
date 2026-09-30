# CLAUDE.md

Pixel-accurate Zoom web-client clone built on VideoSDK.
Vite + React 18 + TypeScript + pnpm + Tailwind v4, routed with react-router-dom, state in Zustand.
The in-meeting UI is matched to Figma references under `docs/figma/`.

## Commands

- `pnpm dev` - Vite dev server on http://localhost:5173.
- `pnpm build` - runs `tsc --noEmit` then `vite build` (a build failure usually means a type error first).
- `pnpm typecheck` - `tsc --noEmit`.
- `pnpm lint` - `eslint .`.
- `pnpm test:e2e` - Playwright E2E (or `pnpm exec playwright test`). Needs `pnpm dev` running (config serves 5173).
- `pnpm mint-token` - regenerates both VideoSDK tokens into `.env` (see below).

Always run `pnpm typecheck` and `pnpm lint` before considering a change done.

## Two modes: Demo vs Live

`src/routes/MeetingRoom.tsx` decides: `isLive = hasToken() && !roomId.startsWith("demo-")`.

- Live mode -> `LiveMeeting.tsx` wraps VideoSDK's `MeetingProvider`, rendering `LiveMeetingView.tsx` (real streams, pubsub, host enforcement).
- Demo mode -> `DemoMeeting.tsx` (fully interactive mock meeting with mock participants and local-only media; used when no token is set or for a `demo-*` room). Keeps the whole UI demoable without a token.

`ControlBar.tsx`, panels, and `SpeakerView`/`VideoGrid` are shared by both.
When you add an in-meeting feature, decide whether it belongs in Live only, Demo only, or both.
Picture-in-Picture, for example, is Live-only (nothing to composite in Demo).

## VideoSDK integration (the important gotchas)

- SDK: `@videosdk.live/react-sdk` `^0.13.3`.
- Two-token architecture, signed at BUILD TIME from `VIDEOSDK_API_KEY` + `VIDEOSDK_SECRET` (VideoSDK v2 splits roles):
  - `VITE_VIDEOSDK_TOKEN` - rtc role, used to join meetings.
  - `VITE_VIDEOSDK_API_TOKEN` - crawler role, used for REST room create/validate (`src/lib/videosdk/api.ts`).
  - Deploy needs ONLY the key + secret as env vars. `vite.config.ts` calls `resolveVideosdkTokens` (`scripts/videosdk-token.mjs`) and injects the signed tokens via `define` as `__VIDEOSDK_TOKEN__` / `__VIDEOSDK_API_TOKEN__` (read in `src/lib/videosdk/token.ts`). The secret is used only in the Node config and never ships to the client. A pre-set `VITE_VIDEOSDK_TOKEN` (dashboard token) is a fallback when key/secret are absent.
  - Tokens are baked per build (default 365d, override with `VIDEOSDK_TOKEN_EXPIRY`); a redeploy refreshes them. `pnpm mint-token` still exists but is now OPTIONAL (the build does it). The E2E tests sign the same way via `resolveVideosdkTokens` in `src/test/helpers.ts`.
  - Token expiry is the #1 cause of "live tests skip" or "meeting won't join" — rebuild/restart the dev server to re-sign. Never commit `.env`, and never print token/secret contents.
- `participants` is a Map whose VALUES expose host commands imperatively: `p.disableMic()`, `p.disableWebcam()`, `p.remove()`. No per-participant hook needed to call them (see `muteAll`).
- The meeting re-renders via a manual `bump` reducer wired to `onParticipantJoined`/`onParticipantLeft`. It does NOT re-render when a remote's `micOn`/`webcamOn` flips. To react to a remote's media state you must mount a `useParticipant(id)` child (see `MicEnforcer.tsx`).
- `useMeeting({ onMeetingLeft })` fires for both a self-`leave()` and being `remove()`d by the host, with no reason. Tag intentional exits with a ref (`intentionalLeave`) to tell them apart.
- `useMeeting`'s `toggleScreenShare()`/`disableScreenShare()` act on the LOCAL participant only. There is no native way to stop a REMOTE participant's screenshare; use cooperative pubsub instead.
- Host detection is app-local only: `useSessionStore.role === "host"` (set via the `?role=host` deep-link in `MeetingRoom.tsx`, or on Home before navigating). There is no server-side role authority.

### PubSub via persisted messages, not just live callbacks

For any state a late joiner must learn, publish with `{ persist: true }` AND apply from the returned `messages` array (which includes persisted history), not only `onMessageReceived`.
`onMessageReceived` can miss the persisted replay if a client subscribes a beat late.
This is why `HOST_CONTROL` and `WAITING_SET` are applied from `messages` on guests.

Topics in use:

| Topic | Owner | Options | Payload |
|---|---|---|---|
| `CHAT` | anyone | persist | chat messages (history for late joiners) |
| `REACTIONS` | anyone | transient | floating emoji |
| `RAISE_HAND` | anyone | transient | RAISE / LOWER |
| `HOST_CONTROL` | host | persist | `{ locked, waitingRoomEnabled, permissions }` snapshot |
| `WAITING_SET` | host | persist | `string[]` of held participant ids (idempotent full-state) |
| `BOUNCE` | host -> one guest | `sendOnly`, transient | reason string shown when removed (lock / deny) |
| `SHARE_CONTROL` | host -> presenter | `sendOnly`, transient | `"STOP"` (cooperative stop-share) |
| `POLL_CREATE` / `POLL_VOTE` | anyone | persist | polls |

## Security features are host-authoritative

The Security menu (Lock, Waiting Room, and Share/Chat/Unmute permissions) enforces for real, not just by disabling buttons.
The pattern is: the host issues SFU-enforced SDK commands, and the guest UI reacts on top.

- Lock: host `remove()`s late joiners in `onParticipantJoined` (mutes/darkens them first so nothing leaks, removes after a short delay so the reason message lands). Existing participants and the host are never affected. Non-retroactive, matching Zoom.
- Waiting Room: the host owns an authoritative `WAITING_SET` broadcast to everyone, so all clients hide waiters. Held guests are force-muted/cam-off. Enabling it mid-meeting grandfathers current participants (only later joiners are held).
- Unmute: guest is source-blocked (button + chevron + `M` hotkey) AND the host force-mutes on revoke, with a per-remote `MicEnforcer` re-muting anyone who unmutes again.
- Chat: publish path gated + composer disabled with a notice.
- Share: handler gated; Whiteboard stays reachable (it shares the Share chevron menu); an active remote share is stopped via `SHARE_CONTROL`.
- `useMeetingControlsStore` is a non-persisted singleton, so it is `reset()` on every meeting mount to stop lock/permissions leaking across meetings and between Demo and Live.

Known ceiling (by design, no backend): a fully modified client that ignores its own UI could briefly publish before the host re-mutes it.
True bulletproofing would need server-minted VideoSDK role tokens (a token backend), which is out of scope. See the comment in `LiveMeeting.tsx`.

## State (Zustand, `src/store/`)

- `useSessionStore` - `role` ("host" | "participant"), NOT persisted, defaults "participant".
- `useUserStore` - display name.
- `useMeetingsStore` - scheduled meetings (persisted).
- `useSettingsStore` - selected mic/camera/speaker device ids (persisted).
- `useMeetingControlsStore` - lock / waiting room / permissions. NOT persisted; `reset()` on meeting mount.

## Testing

- `src/test/two-party.spec.ts` - the real integration suite. Launches Chromium with `--use-fake-device-for-media-stream` and TWO browser contexts that genuinely federate at the SFU. This is how host-enforcement (eject, force-mute, waiting-room) is verified. Model new multi-party cases on the existing ones; helpers are in `src/test/helpers.ts`.
- `src/test/demo-flow.spec.ts` - single-tab demo-mode smoke.
- All live tests self-skip when `VITE_VIDEOSDK_TOKEN` is unset, so the suite stays green without a token. If tests skip unexpectedly, mint a fresh token.
- Federation facts learned the hard way:
  - Fake-media contexts federate; the Playwright MCP browser does NOT (it runs without the fake-media flags), so you cannot demo cross-participant behavior through the MCP browser. Use it only for single-client UI checks.
  - Two tabs in one browser context do not peer either.
  - Under heavy parallelism the SFU can be slow; give guest-facing (HOST_CONTROL-propagation) assertions ~25s and make roster-change assertions polls.

## Conventions

- Prefer quality, simplicity, robustness, and maintainability over development cost.
- Fix a bug by first reproducing it end-to-end the way a user hits it (for this repo, usually a federated Playwright case).
- Be picky about the UI; match the Figma references and fix visible glitches even if tangential.
- Reference the exact Zoom control-bar icons in `src/components/icons/` (SVGs extracted from Figma), not generic lucide icons, for control-bar actions.

## Repo / branches

- `local/zoom-clone-impl` is the working trunk (all real work lives here).
- `master` is only the init commit; there is no `main`. Treat `local/zoom-clone-impl` as the integration target unless told otherwise.
- Feature branches are developed in `.claude/worktrees/` and merged back into the trunk.
