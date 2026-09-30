# DESIGN.md -- Zoom App UI (Community)

<!-- extraction-meta
source: Figma file "Zoom App UI (Community)"
scope: 3 page(s)
date: 2026-07-08
nodes-scanned: 3364
generator: figma-cli extract
-->

## 1. Identity

**In one line:** A design system using SF Pro Text, Roboto, SF Pro Display with 20 unique colors extracted directly from Figma.

**Signature Techniques:**
- Consistent auto-layout spacing system
- Component library with 104 variants across 7 component sets

## 2. Structure

High-level composition. Each entry: frame name, type, dimensions, auto-layout.

### Page: 🟢 Zoom UI

_5 top-level frame(s)_

- **Grid View / All Video On** · `FRAME` · 1920×1080 · 3 children
  - **Group 1** · `GROUP` · 1803×1166 · 2 children
    - **Rectangle 3** · `VECTOR` · 1293×1002
    - **Rectangle 4** · `VECTOR` · 437×1166
  - **Zoom UI** · `INSTANCE` · 1072×542 · instance of Zoom UI
  - **Group 8** · `GROUP` · 441×172 · 2 children
    - **Grid View** · `TEXT` · 441×119 · “Grid View”
    - **Video On | Audio On** · `TEXT` · 335×43 · “Video On | Audio On”
- **Grid View / Mixed Audio & Mixed Video** · `FRAME` · 1920×1080 · 3 children
  - **Group 1** · `GROUP` · 1803×1166 · 2 children
    - **Rectangle 3** · `VECTOR` · 1293×1002
    - **Rectangle 4** · `VECTOR` · 437×1166
  - **Zoom UI** · `INSTANCE` · 1072×542 · instance of Zoom UI
  - **Group 5** · `GROUP` · 528×172 · 2 children
    - **Grid View** · `TEXT` · 441×119 · “Grid View”
    - **Video On & Off | Audio On & Off** · `TEXT` · 528×43 · “Video On & Off | Audio On & Off”
- **Grid View / Speaking Indication** · `FRAME` · 1920×1080 · 3 children
  - **Group 1** · `GROUP` · 1803×1166 · 2 children
    - **Rectangle 3** · `VECTOR` · 1293×1002
    - **Rectangle 4** · `VECTOR` · 437×1166
  - **Zoom UI** · `INSTANCE` · 1072×542 · instance of Zoom UI
  - **Group 7** · `GROUP` · 441×172 · 2 children
    - **Grid View** · `TEXT` · 441×119 · “Grid View”
    - **Speaking Indication** · `TEXT` · 330×43 · “Speaking Indication”
- **Grid View / Reactions** · `FRAME` · 1920×1080 · 4 children
  - **Group 1** · `GROUP` · 1803×1166 · 2 children
    - **Rectangle 3** · `VECTOR` · 1293×1002
    - **Rectangle 4** · `VECTOR` · 437×1166
  - **Zoom UI** · `INSTANCE` · 1072×542 · instance of Zoom UI
  - **Group 7** · `GROUP` · 441×172 · 2 children
    - **Grid View** · `TEXT` · 441×119 · “Grid View”
    - **Reactions** · `TEXT` · 166×43 · “Reactions”
  - **Reaction Overlay** · `INSTANCE` · 264×84 · vertical stack, gap 8px, padding 8px · instance of Reaction Overlay
- **Speaker View / Speaking Indication & Mixed Audio & Mixed Video ** · `FRAME` · 1920×1080 · 3 children
  - **Group 1** · `GROUP` · 1803×1166 · 2 children
    - **Rectangle 3** · `VECTOR` · 1293×1002
    - **Rectangle 4** · `VECTOR` · 437×1166
  - **Zoom UI** · `INSTANCE` · 1072×542 · instance of Zoom UI
  - **Group 6** · `GROUP` · 884×172 · 2 children
    - **Speaker View** · `TEXT` · 623×119 · “Speaker View”
    - **Speaking Indication | Audio On & Off | Video On & Off** · `TEXT` · 884×43 · “Speaking Indication | Audio On & Off | Video On & Off”

### Page: 📐 Components

_7 top-level frame(s)_

- **Reactions** · `FRAME` · 398×436 · 4 children
  - **Reactions** · `COMPONENT_SET` · 347×117 · 14 children
    - **Property 1=Clap, Hover=No** · `COMPONENT` · 32×32 · 1 children
      - **👏🏼** · `TEXT` · 22×22 · “👏🏼”
  - **Reactions/Icon/more_horiz** · `COMPONENT` · 24×24 · 2 children
    - **Vector** · `VECTOR` · 24×24
    - **Vector** · `VECTOR` · 16×4
  - **Reaction Overlay** · `COMPONENT` · 264×84 · vertical stack, gap 8px, padding 8px · 2 children
    - **Frame 18** · `FRAME` · 248×32 · horizontal row · 7 children
      - **Reactions** · `INSTANCE` · 32×32 · instance of Reactions
      - **Reactions** · `INSTANCE` · 32×32 · instance of Reactions · ×6
    - **Frame 2** · `FRAME` · 248×28 · 1 children
      - **Frame 3** · `FRAME` · 86×14 · horizontal row, gap 4px · 2 children
        - **✋🏼** · `TEXT` · 14×14 · “✋🏼”
        - **Raise Hand** · `TEXT` · 68×14 · “Raise Hand”
  - **Reactions** · `TEXT` · 219×57 · “Reactions”
- **Participants Name** · `FRAME` · 514×487 · 6 children
  - **Rectangle 77** · `RECTANGLE` · 48×45
  - **Participant Name & Video** · `TEXT` · 376×114 · “Participant Name
& Video”
  - **Name + Muted** · `COMPONENT_SET` · 90×80 · 2 children
    - **Muted=Yes** · `COMPONENT` · 52×18 · horizontal row, gap 4px, padding 2px · 2 children
      - **Name Label / Icon** · `INSTANCE` · 13×13 · instance of Name Label / Icon
      - **Label** · `TEXT` · 31×14 · “Name”
  - **Name Label / Icon** · `COMPONENT` · 13×13 · 4 children
    - **Vector 10** · `VECTOR` · 0×2
    - **Rectangle 71** · `RECTANGLE` · 4×1
    - **Red Line** · `INSTANCE` · 13×13 · instance of Red Line
    - **Subtract** · `BOOLEAN_OPERATION` · 4×9 · 2 children
      - **Rectangle 70** · `RECTANGLE` · 4×9
      - **Red Line** · `VECTOR` · 11×11
  - **Label** · `COMPONENT` · 29×14 · 1 children
    - **Label** · `TEXT` · 29×14 · “Label”
  - **Participant/Video Background** · `COMPONENT` · 161×97 · 1 children
    - **Rectangle 74** · `RECTANGLE` · 161×97
- **Top Toolbars** · `FRAME` · 343×284 · 6 children
  - **Top Toolbars** · `TEXT` · 276×57 · “Top Toolbars”
  - **Top Left Toolbar** · `COMPONENT` · 159×26 · horizontal row, gap 5px · 2 children
    - **Frame 9** · `FRAME` · 26×26 · horizontal row, gap 10px, padding 7px · 1 children
      - **Security Shield** · `INSTANCE` · 12×12 · instance of Security Shield
    - **Frame 10** · `FRAME` · 128×26 · horizontal row, gap 10px, padding 6px · 2 children
      - **Original Sound: Off** · `TEXT` · 98×14 · “Original Sound: Off”
      - **Vector** · `VECTOR` · 8×4
  - **Top Right Toolbar** · `COMPONENT` · 54×25 · horizontal row, gap 2px, padding 6/8/6/8px · 2 children
    - **Grid** · `INSTANCE` · 11×11 · instance of Grid
    - **View** · `TEXT` · 25×13 · “View”
  - **Security Shield** · `COMPONENT` · 12×12 · 2 children
    - **Vector 8** · `VECTOR` · 12×12
    - **Vector 9** · `VECTOR` · 5×3
  - **Grid** · `COMPONENT` · 11×11 · 9 children
    - **Rectangle 61** · `RECTANGLE` · 3×3
    - **Rectangle 64** · `RECTANGLE` · 3×3
    - **Rectangle 67** · `RECTANGLE` · 3×3
    - **Rectangle 62** · `RECTANGLE` · 3×3
    - **Rectangle 65** · `RECTANGLE` · 3×3
    - **Rectangle 68** · `RECTANGLE` · 3×3
    - **Rectangle 63** · `RECTANGLE` · 3×3
    - **Rectangle 66** · `RECTANGLE` · 3×3
    - **Rectangle 69** · `RECTANGLE` · 3×3
  - **Speaker View** · `COMPONENT` · 11×11 · 5 children
    - **Rectangle 61** · `RECTANGLE` · 3×3
    - **Rectangle 64** · `RECTANGLE` · 11×7
    - **Rectangle 62** · `RECTANGLE` · 3×3
    - **Rectangle 63** · `RECTANGLE` · 3×3
    - **Rectangle 69** · `RECTANGLE` · 3×3
- **Mac UI** · `FRAME` · 301×327 · 2 children
  - **Mac UI** · `TEXT` · 150×57 · “Mac UI”
  - **Browser** · `COMPONENT` · 67×22 · 3 children
    - **Ellipse 10** · `ELLIPSE` · 9×9
    - **Ellipse 11** · `ELLIPSE` · 9×9
    - **Ellipse 12** · `ELLIPSE` · 9×9
- **Zoom UI** · `FRAME` · 2451×1486 · 2 children
  - **Zoom UI** · `TEXT` · 183×57 · “Zoom UI”
  - **Zoom UI** · `COMPONENT_SET` · 2435×1255 · 4 children
    - **View=Grid View, Participants=7** · `COMPONENT` · 1072×542 · 3 children
      - **Participant Frame** · `FRAME` · 1072×470 · 3 children
        - **Participants View** · `GROUP` · 1056×299 · 7 children
          - **Participants UI** · `INSTANCE` · 257×145 · instance of Participants UI · ×7
        - **Top Right Toolbar** · `INSTANCE` · 54×25 · horizontal row, gap 2px, padding 6/8/6/8px · instance of Top Right Toolbar
        - **Top Left Toolbar** · `INSTANCE` · 159×26 · horizontal row, gap 5px · instance of Top Left Toolbar
      - **Browser** · `INSTANCE` · 1072×22 · instance of Browser
      - **Bottom Controls** · `INSTANCE` · 1072×50 · instance of Bottom Controls
- **Bottom Toolbar UI** · `FRAME` · 1118×579 · 11 children
  - **Bottom Toolbar UI** · `TEXT` · 390×57 · “Bottom Toolbar UI”
  - **Toolbar UI** · `COMPONENT_SET` · 212×92 · 2 children
    - **Property 1=Initial** · `COMPONENT` · 80×48 · 4 children
      - **UI Icon** · `INSTANCE` · 24×24 · instance of UI Icon
      - **keyboard_arrow_up** · `INSTANCE` · 12×12 · instance of keyboard_arrow_up
      - **Toolbar UI / Label** · `INSTANCE` · 25×12 · instance of Toolbar UI / Label
      - **Toolbar UI / Number** · `INSTANCE` · 7×12 · instance of Toolbar UI / Number
  - **UI Icon** · `COMPONENT_SET` · 352×96 · 12 children
    - **Property 1=Unmute** · `COMPONENT` · 24×24 · 4 children
      - **Subtract** · `BOOLEAN_OPERATION` · 8×14 · 2 children
        - **Rectangle 14** · `RECTANGLE` · 8×14
        - **Red Line - Off** · `INSTANCE` · 24×24 · instance of Red Line - Off
      - **Subtract** · `BOOLEAN_OPERATION` · 0×0
      - **Subtract** · `BOOLEAN_OPERATION` · 13×11 · 2 children
        - **Union** · `BOOLEAN_OPERATION` · 13×11 · 2 children
          - **Vector (Stroke)** · `VECTOR` · 8×6
          - **Ellipse 1 (Stroke)** · `VECTOR` · 14×7
        - **Red Line - Off** · `INSTANCE` · 24×24 · instance of Red Line - Off
      - **Red Line** · `INSTANCE` · 24×24 · instance of Red Line
  - **Button / Base** · `COMPONENT` · 56×28 · 1 children
    - **Label** · `TEXT` · 34×14 · “Label”
  - **Button / Red** · `COMPONENT` · 56×28 · 1 children
    - **Button / Base** · `INSTANCE` · 56×28 · instance of Button / Base
  - **Red Line - Off** · `COMPONENT` · 24×24 · 1 children
    - **Red Line** · `VECTOR` · 20×20
  - **Red Line** · `COMPONENT` · 24×24 · 1 children
    - **Red Line** · `VECTOR` · 20×20
  - **Bottom Controls** · `COMPONENT` · 1072×50 · 3 children
    - **Button / Red** · `INSTANCE` · 56×28 · instance of Button / Red
    - **Left Controls** · `FRAME` · 161×48 · horizontal row · 2 children
      - **Toolbar UI** · `INSTANCE` · 75×48 · instance of Toolbar UI
      - **Toolbar UI** · `INSTANCE` · 86×48 · instance of Toolbar UI
    - **Center Controls** · `FRAME` · 648×48 · horizontal row · 8 children
      - **Toolbar UI** · `INSTANCE` · 78×48 · instance of Toolbar UI
      - **Toolbar UI** · `INSTANCE` · 86×48 · instance of Toolbar UI
      - **Toolbar UI** · `INSTANCE` · 78×48 · instance of Toolbar UI
      - **Toolbar UI** · `INSTANCE` · 83×48 · instance of Toolbar UI
      - **Toolbar UI** · `INSTANCE` · 76×48 · instance of Toolbar UI
      - **Toolbar UI** · `INSTANCE` · 74×48 · instance of Toolbar UI
      - **Toolbar UI** · `INSTANCE` · 104×48 · instance of Toolbar UI
      - **Toolbar UI** · `INSTANCE` · 69×48 · instance of Toolbar UI
  - **Toolbar UI / Number** · `COMPONENT` · 7×12 · 1 children
    - **Number** · `TEXT` · 7×12 · “2”
  - **Toolbar UI / Label** · `COMPONENT` · 25×12 · 1 children
    - **Label** · `TEXT` · 25×12 · “Label”
  - **keyboard_arrow_up** · `COMPONENT` · 12×12 · 2 children
    - **Vector** · `VECTOR` · 8×5
    - **Vector** · `VECTOR` · 16×16
- **Participants** · `FRAME` · 4217×3938 · 26 children
  - **Unmuted** · `TEXT` · 229×57 · “Unmuted”
  - **Video On** · `TEXT` · 131×33 · “Video On”
  - **Silent** · `TEXT` · 61×24 · “Silent” · ×4
  - **Talking** · `TEXT` · 76×24 · “Talking” · ×4
  - **Video On** · `TEXT` · 131×33 · “Video On”
  - **Video Off** · `TEXT` · 137×33 · “Video Off” · ×2
  - **Muted** · `TEXT` · 159×57 · “Muted”
  - **Teresa** · `TEXT` · 105×36 · “Teresa”
  - **Sean** · `TEXT` · 78×36 · “Sean”
  - **Raina** · `TEXT` · 87×36 · “Raina”
  - **Christopher** · `TEXT` · 188×36 · “Christopher”
  - **Ming-Na** · `TEXT` · 133×36 · “Ming-Na”
  - **Victoria** · `TEXT` · 124×36 · “Victoria”
  - **Rebecca** · `TEXT` · 133×36 · “Rebecca”
  - **Participants** · `TEXT` · 263×57 · “Participants”
  - **Participants UI** · `TEXT` · 319×57 · “Participants UI”
  - **Participants Avatars** · `TEXT` · 440×57 · “Participants Avatars”
  - **Participants UI** · `COMPONENT_SET` · 3586×2651 · 56 children
    - **Participant=Teresa, Video:=On, Talking=No, Muted=No** · `COMPONENT` · 458×258 · 2 children
      - **Participants Avatars** · `INSTANCE` · 458×258 · instance of Participants Avatars
      - **Name + Muted** · `INSTANCE` · 39×18 · horizontal row, gap 4px, padding 2px · instance of Name + Muted
  - **Participants Avatars** · `COMPONENT_SET` · 3444×530 · 14 children
    - **Participant=#1, Video=No** · `COMPONENT` · 175×175 · 1 children
      - **image 23** · `RECTANGLE` · 175×175

### Page: 📗 Cover

_2 top-level frame(s)_

- **Cover** · `FRAME` · 1920×960 · 5 children
  - **Group 1** · `GROUP` · 427×276 · 2 children
    - **Rectangle 3** · `VECTOR` · 306×237
    - **Rectangle 4** · `VECTOR` · 103×276
  - **Zoom UI** · `TEXT` · 299×95 · “Zoom UI”
  - **Recreated by Chris Hartley** · `TEXT` · 400×43 · “Recreated by Chris Hartley”
  - **Zoom UI** · `INSTANCE` · 1377×696 · instance of Zoom UI
  - **Zoom UI** · `INSTANCE` · 1134×573 · instance of Zoom UI
- **Avatars via Content Reel & Unsplash** · `TEXT` · 421×29 · “Avatars via Content Reel & Unsplash”

## 3. Color

### Palette

| Token | Hex | Usage count |
|---|---|---|
| text-primary | `#000000` | 48 |
| background | `#ffffff` | 41 |
| text-primary-alt | `#1b1b1b` | 21 |
| border | `#c4c4c4` | 16 |
| border-alt | `#acacac` | 9 |
| accent | `#7b61ff` | 7 |
| accent-alt | `#e1edff` | 5 |
| accent-3 | `#cd3b33` | 4 |
| text-primary-3 | `#242424` | 3 |
| text-primary-4 | `#111111` | 3 |
| text-primary-5 | `#0a0a0a` | 2 |
| text-primary-6 | `#393a3b` | 2 |
| accent-4 | `#ab342e` | 2 |
| text-primary-7 | `#323232` | 1 |
| border-3 | `#d5d6d5` | 1 |
| accent-5 | `#69d569` | 1 |
| accent-6 | `#ed695e` | 1 |
| accent-7 | `#f4be4f` | 1 |
| accent-8 | `#63c454` | 1 |
| accent-9 | `#ee6762` | 1 |

## 4. Variables

_no local variables found — this file has no variable collections, the palette above is sampled from raw fills_

## 5. Typography

### Fonts

- SF Pro Text
- Roboto
- SF Pro Display

### Scale

| Token | Family | Size | Weight | Line height |
|---|---|---|---|---|
| display | SF Pro Text | 100px | 600 | auto |
| display-2 | SF Pro Display | 80px | 600 | auto |
| display-3 | SF Pro Display | 48px | 700 | auto |
| display-4 | SF Pro Text | 48px | 400 | auto |
| display-5 | SF Pro Text | 36px | 500 | auto |
| display-6 | SF Pro Display | 36px | 400 | auto |
| h1 | SF Pro Text | 30px | 400 | auto |
| h2 | SF Pro Text | 28px | 400 | auto |
| h3 | SF Pro Text | 24px | 500 | auto |
| h4 | Roboto | 22px | 400 | auto |
| h5 | SF Pro Text | 20px | 400 | auto |
| body | SF Pro Text | 14px | 400 | auto |
| caption | SF Pro Text | 12px | 400 | auto |
| caption-2 | SF Pro Text | 12px | 400 | auto |
| caption-3 | SF Pro Text | 11.5px | 500 | auto |
| caption-4 | SF Pro Text | 11.5px | 600 | auto |
| caption-5 | SF Pro Text | 11px | 500 | auto |
| caption-6 | SF Pro Text | 10px | 500 | auto |

## 6. Spacing & Layout

### Base Unit

2px

### Border Radius

| Token | Value |
|---|---|
| radius-sm | 1px |
| radius-md | 4px |
| radius-lg | 5px |
| radius-lg-2 | 6px |
| radius-lg-3 | 7px |
| radius-lg-4 | 8px |
| radius-lg-5 | 8.462371826171875px |
| radius-lg-6 | 10.273062705993652px |
| radius-lg-7 | 14px |
| radius-lg-8 | 16px |
| radius-lg-9 | 20px |

## 7. Depth & Motion

### Elevation

- inset 0px 0px 0px 1.25px #ffffff @ 25% (used 6×)
- inset 0px 4px 150px 0px #ffffff @ 80% (used 5×)
- 0px 4px 150px 0px #0145a7 @ 10% (used 5×)
- 0px 40px 100px 0px #183c77 @ 70% (used 5×)
- 0px 0px 0.5px 0.5px #181818 @ 80% (used 2×)
- inset 0px 0px 0px 0.5px #343436 @ 100% (used 2×)
- inset 0px -1px 0px 0px #000000 @ 100% (used 1×)
- 80.20722198486328px 80.20722198486328px 267.357421875px 0px #164fac @ 50% (used 1×)
- inset 0px 0px 0px 1.6051663160324097px #ffffff @ 25% (used 1×)
- 50px 50px 264.6235046386719px 0px #164fac @ 100% (used 1×)
- inset 0px 0px 0px 1.322245717048645px #ffffff @ 25% (used 1×)

## 8. Components

### Reactions

Page: 📐 Components · 14 variants

Reuse: import existing — key `7b0e162831407ed0b834d2d42516e7ef2050faf2` · node `27:1068`

| Property | Values |
|---|---|
| Property 1 | Clap, Thumbs Up, Heart, Funny, Surprised, Celebrate, More |
| Hover | No, Yes |

Sample variant structure:

- **Property 1=Clap, Hover=No** · `COMPONENT` · 32×32 · 1 children
  - **👏🏼** · `TEXT` · 22×22 · “👏🏼”

### Name + Muted

Page: 📐 Components · 2 variants

Reuse: import existing — key `6c828de1065a5dea7b9d712ad8a00828d1655a26` · node `21:885`

| Property | Values |
|---|---|
| Muted | Yes, No |

Sample variant structure:

- **Muted=Yes** · `COMPONENT` · 52×18 · horizontal row, gap 4px, padding 2px · 2 children
  - **Name Label / Icon** · `INSTANCE` · 13×13 · instance of Name Label / Icon
  - **Label** · `TEXT` · 31×14 · “Name”

### Zoom UI

Page: 📐 Components · 4 variants

Reuse: import existing — key `9facd0e6b5e164b38b0bab486cdd524ff0f8f2e1` · node `19:564`

| Property | Values |
|---|---|
| View | Grid View, Speaker View |
| Participants | 2, 4, 7 |

Sample variant structure:

- **View=Grid View, Participants=7** · `COMPONENT` · 1072×542 · 3 children
  - **Participant Frame** · `FRAME` · 1072×470 · 3 children
    - **Participants View** · `GROUP` · 1056×299 · 7 children
      - **Participants UI** · `INSTANCE` · 257×145 · instance of Participants UI · ×7
    - **Top Right Toolbar** · `INSTANCE` · 54×25 · horizontal row, gap 2px, padding 6/8/6/8px · instance of Top Right Toolbar
    - **Top Left Toolbar** · `INSTANCE` · 159×26 · horizontal row, gap 5px · instance of Top Left Toolbar
  - **Browser** · `INSTANCE` · 1072×22 · instance of Browser
  - **Bottom Controls** · `INSTANCE` · 1072×50 · instance of Bottom Controls

### Toolbar UI

Page: 📐 Components · 2 variants

Reuse: import existing — key `d2fcf2d3ab8db9a45853215973456dcf2b98b44a` · node `5:61`

| Property | Values |
|---|---|
| Property 1 | Hover, Initial |

Sample variant structure:

- **Property 1=Initial** · `COMPONENT` · 80×48 · 4 children
  - **UI Icon** · `INSTANCE` · 24×24 · instance of UI Icon
  - **keyboard_arrow_up** · `INSTANCE` · 12×12 · instance of keyboard_arrow_up
  - **Toolbar UI / Label** · `INSTANCE` · 25×12 · instance of Toolbar UI / Label
  - **Toolbar UI / Number** · `INSTANCE` · 7×12 · instance of Toolbar UI / Number

### UI Icon

Page: 📐 Components · 12 variants

Reuse: import existing — key `86cc399d93f946d03c80c3ff80520b332488f5fc` · node `1:112`

| Property | Values |
|---|---|
| Property 1 | Mute, Unmute, Start Video, Stop Video, Security, Participants, Chat, Share Screen, Polling, Record, Breakout, Reaction |

Sample variant structure:

- **Property 1=Unmute** · `COMPONENT` · 24×24 · 4 children
  - **Subtract** · `BOOLEAN_OPERATION` · 8×14 · 2 children
    - **Rectangle 14** · `RECTANGLE` · 8×14
    - **Red Line - Off** · `INSTANCE` · 24×24 · instance of Red Line - Off
  - **Subtract** · `BOOLEAN_OPERATION` · 0×0
  - **Subtract** · `BOOLEAN_OPERATION` · 13×11 · 2 children
    - **Union** · `BOOLEAN_OPERATION` · 13×11 · 2 children
      - **Vector (Stroke)** · `VECTOR` · 8×6
      - **Ellipse 1 (Stroke)** · `VECTOR` · 14×7
    - **Red Line - Off** · `INSTANCE` · 24×24 · instance of Red Line - Off
  - **Red Line** · `INSTANCE` · 24×24 · instance of Red Line

### Participants UI

Page: 📐 Components · 56 variants

Reuse: import existing — key `a920be9d9bd8b9fd1e2a15d6b7346267a1a845d1` · node `13:220`

| Property | Values |
|---|---|
| Participant | Teresa, Rebecca, Victoria, Ming-Na, Christopher, Raina, Sean |
| Video: | Off, On |
| Talking | No, Yes |
| Muted | No, Yes |

Sample variant structure:

- **Participant=Teresa, Video:=On, Talking=No, Muted=No** · `COMPONENT` · 458×258 · 2 children
  - **Participants Avatars** · `INSTANCE` · 458×258 · instance of Participants Avatars
  - **Name + Muted** · `INSTANCE` · 39×18 · horizontal row, gap 4px, padding 2px · instance of Name + Muted

### Participants Avatars

Page: 📐 Components · 14 variants

Reuse: import existing — key `0fd4d82b198c7e88bd4c3e14cda34331053e6cf5` · node `101:1296`

| Property | Values |
|---|---|
| Participant | #1, #2, #3, #4, #5, #6, #7 |
| Video | Yes, No |

Sample variant structure:

- **Participant=#1, Video=No** · `COMPONENT` · 175×175 · 1 children
  - **image 23** · `RECTANGLE` · 175×175

## 9. States

State tokens should be derived from the base palette above. Recommended mappings:

| State | Treatment |
|-------|-----------|
| Hover | Lighten/darken accent by 10% |
| Focus | 2px ring using accent color with 30% opacity |
| Disabled | 40% opacity, no pointer events |
| Error | Use danger color for border and text |

## 10. Rules

### Do

- Use the 2px base unit for all spacing decisions
- Use `#7b61ff` (accent) as the primary accent color
- Bind colors to the tokens below instead of hardcoding hex values

### Don't

- Introduce new colors without adding them to the palette
- Mix corner radii outside the radius scale

## 11. Extending this system

### How to reuse this DESIGN.md

Import into Figma with `figma-cli import <this file>` — colors, radii and typography become variables.

### When to add a new token vs reuse

Reuse the closest existing token; add a new one only when a new semantic role appears.

## 12. Machine-readable tokens

The block below is the canonical token map. It mirrors the tables above but is unambiguous and parseable.

```json design-tokens
{
  "$schema": "design-tokens.v1",
  "meta": {
    "source": "Zoom App UI (Community)",
    "generated": "2026-07-08"
  },
  "color": {
    "text-primary": "#000000",
    "background": "#ffffff",
    "text-primary-alt": "#1b1b1b",
    "border": "#c4c4c4",
    "border-alt": "#acacac",
    "accent": "#7b61ff",
    "accent-alt": "#e1edff",
    "accent-3": "#cd3b33",
    "text-primary-3": "#242424",
    "text-primary-4": "#111111",
    "text-primary-5": "#0a0a0a",
    "text-primary-6": "#393a3b",
    "accent-4": "#ab342e",
    "text-primary-7": "#323232",
    "border-3": "#d5d6d5",
    "accent-5": "#69d569",
    "accent-6": "#ed695e",
    "accent-7": "#f4be4f",
    "accent-8": "#63c454",
    "accent-9": "#ee6762"
  },
  "typography": {
    "display": {
      "fontFamily": "SF Pro Text",
      "fontSize": 100,
      "fontWeight": 600,
      "letterSpacing": -4
    },
    "display-2": {
      "fontFamily": "SF Pro Display",
      "fontSize": 80,
      "fontWeight": 600
    },
    "display-3": {
      "fontFamily": "SF Pro Display",
      "fontSize": 48,
      "fontWeight": 700
    },
    "display-4": {
      "fontFamily": "SF Pro Text",
      "fontSize": 48,
      "fontWeight": 400
    },
    "display-5": {
      "fontFamily": "SF Pro Text",
      "fontSize": 36,
      "fontWeight": 500,
      "letterSpacing": -2
    },
    "display-6": {
      "fontFamily": "SF Pro Display",
      "fontSize": 36,
      "fontWeight": 400
    },
    "h1": {
      "fontFamily": "SF Pro Text",
      "fontSize": 30,
      "fontWeight": 400
    },
    "h2": {
      "fontFamily": "SF Pro Text",
      "fontSize": 28,
      "fontWeight": 400
    },
    "h3": {
      "fontFamily": "SF Pro Text",
      "fontSize": 24,
      "fontWeight": 500
    },
    "h4": {
      "fontFamily": "Roboto",
      "fontSize": 22,
      "fontWeight": 400
    },
    "h5": {
      "fontFamily": "SF Pro Text",
      "fontSize": 20,
      "fontWeight": 400
    },
    "body": {
      "fontFamily": "SF Pro Text",
      "fontSize": 14,
      "fontWeight": 400
    },
    "caption": {
      "fontFamily": "SF Pro Text",
      "fontSize": 12,
      "fontWeight": 400,
      "letterSpacing": -2
    },
    "caption-2": {
      "fontFamily": "SF Pro Text",
      "fontSize": 12,
      "fontWeight": 400
    },
    "caption-3": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11.5,
      "fontWeight": 500,
      "letterSpacing": -4
    },
    "caption-4": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11.5,
      "fontWeight": 600,
      "letterSpacing": -5
    },
    "caption-5": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11,
      "fontWeight": 500,
      "letterSpacing": -5
    },
    "caption-6": {
      "fontFamily": "SF Pro Text",
      "fontSize": 10,
      "fontWeight": 500,
      "letterSpacing": -5
    }
  },
  "spacing": {
    "base-unit": 2
  },
  "radius": {
    "radius-sm": "1px",
    "radius-md": "4px",
    "radius-lg": "5px",
    "radius-lg-2": "6px",
    "radius-lg-3": "7px",
    "radius-lg-4": "8px",
    "radius-lg-5": "8.462371826171875px",
    "radius-lg-6": "10.273062705993652px",
    "radius-lg-7": "14px",
    "radius-lg-8": "16px",
    "radius-lg-9": "20px"
  },
  "shadow": {
    "shadow-1": "inset 0px 0px 0px 1.25px #ffffff40",
    "shadow-2": "inset 0px 4px 150px 0px #ffffffcc",
    "shadow-3": "0px 4px 150px 0px #0145a71a",
    "shadow-4": "0px 40px 100px 0px #183c77b3",
    "shadow-5": "0px 0px 0.5px 0.5px #181818cc",
    "shadow-6": "inset 0px 0px 0px 0.5px #343436",
    "shadow-7": "inset 0px -1px 0px 0px #000000",
    "shadow-8": "80.20722198486328px 80.20722198486328px 267.357421875px 0px #164fac80",
    "shadow-9": "inset 0px 0px 0px 1.6051663160324097px #ffffff40",
    "shadow-10": "50px 50px 264.6235046386719px 0px #164fac",
    "shadow-11": "inset 0px 0px 0px 1.322245717048645px #ffffff40"
  },
  "fonts": [
    "SF Pro Text",
    "Roboto",
    "SF Pro Display"
  ]
}
```
