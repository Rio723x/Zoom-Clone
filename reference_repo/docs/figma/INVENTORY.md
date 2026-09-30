# Figma Extraction Inventory

Extracted with **figma-cli** (silships) from the three community files, reading Figma Desktop directly (no API key / no rate limits). This is the design reference for the pixel-match + new-views work; implementation is planned separately.

**Workflow notes (for re-running):**
- figma-cli reads the **frontmost** Figma Desktop file. After switching files, run `figma-cli daemon reconnect` to re-target it (`status` alone can lag).
- Working commands (no daemon): `files`, `find`, `get`, `inspect`, `eval`. Daemon commands: `extract`, `verify` (screenshots), `analyze`, `a11y`.
- `export-jsx` is **broken in this build** (crashes needing `oxfmt` via a `figma-use` bridge). Use `get`/`inspect <nodeId>` for exact geometry instead.
- Screenshot: `figma-cli verify <nodeId> --scale 1 --save <path>` (~15s each; batch ≤6 to avoid timeouts).

## Files

| File | fileKey | DESIGN.md | Covers |
|---|---|---|---|
| Zoom App UI | `aihVVUTJSahMvS25Icf5JH` | `zoom-app-ui-DESIGN.md` | In-meeting **components**: Top/Bottom toolbars, Participants, Reactions; Grid + Speaker view variants |
| Free Zoom UI Mockups | `FvUo2b5r0R5mji7cjYiihz` | `free-zoom-mockups-DESIGN.md` | Full-window **Desktop meeting screens** (Light×6, Dark×6) + Mobile |
| Zoom Apps UI Overview | `6L6h6C834OVCfq0NXDWTEY` | `zoom-apps-overview-DESIGN.md` (+ `DESIGN-structure/`) | Zoom **Apps SDK** panel, Discover, Collaboration, Guest User, Webinar, Core UI Components (×49) |

## Screenshots → surface

**`screenshots/zoom-app-ui/`**
- `zoom-ui-main.png` — 4 meeting layouts (grid 7-up, grid mixed, speaker 1+1, speaker+filmstrip). **Primary in-meeting reference.**
- `bottom-toolbar.png` — control bar component (exact). `top-toolbars.png` — top bar. `participants.png` — participants panel rows. `reactions.png` — reactions tray.
- `grid-all-video-on.png`, `grid-reactions.png`, `speaker-view.png` — full-frame variants.

**`screenshots/free-zoom-mockups/`** — `desktop-light-1..6`, `desktop-dark-1..6` — full 1920×1080 desktop meeting windows (single-speaker, 2-up, etc.) in both themes. **Best full-layout + control-bar reference.**

**`screenshots/zoom-apps-overview/`** — `discover-1` (Apps panel + top-filmstrip speaker view), `core-components-1`, `collaboration-1`, `guest-user-1`, `webinar-1`.

## Surface → app component mapping

| Figma surface | App target | Action |
|---|---|---|
| Top bar ("Original Sound: Off" shield + View) | `src/components/meeting/TopBar.tsx` | **Refine** — match shield/dropdown, "View" button top-right |
| Bottom control bar | `ControlBar.tsx` + `ControlBarButton.tsx` | **Refine** — order/labels: Mute, Stop Video, Security, Participants(▾), Chat, Share Screen(green), **Polling**, **Record**, **Breakout Rooms**, Reactions, **Leave/End**(red) |
| Grid view tiles + gold active-speaker border | `VideoGrid.tsx`, `ParticipantTile.tsx`, `LiveParticipantTile.tsx` | **Refine** — active-speaker border → **gold `#d7d966`** (currently green); name pill; near-black stage |
| Speaker view (large + filmstrip; top or side) | **new** `SpeakerView.tsx` | **Build** (Phase B) |
| Participants panel | `ParticipantsPanel.tsx` | **Refine** |
| Reactions tray | `ReactionsFlyout.tsx` | **Refine** |
| Apps side panel (My Apps/Discover/Featured) | — | **Reference only** (out of current scope) |
| Webinar / Guest User / Collaboration | — | Reference for later |

## Consolidated tokens (dark meeting theme → fold into `src/styles/tokens.css`)

From the DESIGN.md palettes + verified screenshots:
- **Stage / window bg:** `#0a0a0a` (near-black) → `#242424` (tile/empty).
- **Control bar & top bar (dark):** `#242424`/`#1a1a1a`; light variants exist (`#f2f2f2`/`#ffffff`) — app uses dark.
- **Accent red (Leave/End, Record dot):** `#cc3b33` / `#cd3b33`.
- **Share-screen green:** `#63c454` / `#67d669`.
- **Active-speaker border (gold):** `#d7d966` — **change from current green.**
- **Text:** primary `#ffffff` (dark) / `#000000` (light); secondary `#4f4f4f`.
- **Typography:** SF Pro Text / SF Pro Display (system stack already used); body 14px, caption 11-12px.
- **Radii:** small tile corners (~4-8px); note raw DESIGN radii are in sub-px "base-unit" values — treat as ~4px/8px in CSS.

## Key differences to fix during Phase A

1. Active-speaker border: **green → gold `#d7d966`**.
2. Control-bar labels/order: use **Polling** (not "Polls"), **Record**, **Breakout Rooms** (two words), and Zoom's exact ordering; Leave→**End** for host in red.
3. Stage bg is **near-black `#0a0a0a`**, not `#1a1a1a`.
4. Top bar left shows **green shield + "Original Sound: Off ▾"**, right shows a **"View"** button (drives grid/speaker toggle).
5. Name pill: solid black, white text, small radius, bottom-left.

## Status

Extraction **complete** for all three files (DESIGN.md ×3 + structure splits, 25 screenshots, this inventory). Next: review with user, then re-plan implementation (Phases A-E).
