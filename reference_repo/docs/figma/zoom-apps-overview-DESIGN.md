# DESIGN.md -- Zoom Apps UI Overview (Community)

<!-- extraction-meta
source: Figma file "Zoom Apps UI Overview (Community)"
scope: 11 page(s)
date: 2026-07-08
nodes-scanned: 71075
generator: figma-cli extract
-->

> **Structure trees auto-split** (~348k tokens — too large for one AI context): per-page trees are in `DESIGN-structure/`. Use `--no-split` to force a single file.

## 1. Identity

**In one line:** A design system using SF Pro Display, SF Pro Text, Roboto Mono, Roboto, Segoe MDL2 Assets, SF Pro, SF Compact Display with 94 unique colors extracted directly from Figma.

**Signature Techniques:**
- Consistent auto-layout spacing system
- Component library with 0 variants across 0 component sets

## 2. Color

### Palette

| Token | Hex | Usage count |
|---|---|---|
| background | `#ffffff` | 3250 |
| surface | `#f5f5f5` | 980 |
| text-primary | `#000000` | 711 |
| text-tertiary | `#747487` | 350 |
| border | `#c2c7cd` | 268 |
| surface-alt | `#dfe3e8` | 254 |
| accent | `#ff5c5c` | 242 |
| accent-alt | `#4f9af7` | 210 |
| accent-3 | `#de2828` | 198 |
| text-primary-alt | `#040413` | 178 |
| accent-4 | `#23d959` | 156 |
| text-secondary | `#525280` | 149 |
| accent-5 | `#0e72ed` | 136 |
| text-primary-3 | `#222230` | 119 |
| surface-3 | `#ededf4` | 97 |
| text-tertiary-alt | `#8a8a8b` | 96 |
| text-primary-4 | `#090a0a` | 87 |
| border-alt | `#c4c4c4` | 86 |
| background-alt | `#f8f9fa` | 85 |
| text-primary-5 | `#242424` | 76 |
| text-primary-6 | `#282f38` | 75 |
| text-primary-7 | `#131619` | 75 |
| accent-6 | `#268543` | 74 |
| accent-7 | `#1b2733` | 73 |
| accent-8 | `#e05050` | 70 |
| accent-9 | `#0e71eb` | 67 |
| text-primary-8 | `#232333` | 59 |
| accent-10 | `#e02828` | 42 |
| accent-11 | `#4ccc7d` | 42 |
| background-3 | `#f7f7fc` | 41 |
| accent-12 | `#2e8cff` | 38 |
| accent-13 | `#ff0000` | 36 |
| text-primary-9 | `#1a1a1a` | 35 |
| text-secondary-alt | `#637282` | 35 |
| surface-4 | `#e7e8eb` | 32 |
| text-primary-10 | `#111111` | 32 |
| text-primary-11 | `#2e2e2e` | 28 |
| surface-5 | `#e0e0e0` | 25 |
| accent-14 | `#0061ff` | 23 |
| background-4 | `#f9fbfc` | 19 |
| accent-15 | `#4793f1` | 19 |
| text-secondary-3 | `#707070` | 17 |
| accent-16 | `#bd3fb1` | 16 |
| text-primary-12 | `#2f2f30` | 13 |
| accent-17 | `#a26900` | 12 |
| accent-18 | `#f04a4e` | 12 |
| accent-19 | `#ce3f43` | 12 |
| accent-20 | `#ffc53d` | 12 |
| accent-21 | `#faad14` | 12 |
| accent-22 | `#00b27d` | 12 |
| accent-23 | `#00996b` | 12 |
| background-5 | `#f8f8f8` | 11 |
| text-primary-13 | `#252a30` | 11 |
| text-primary-14 | `#303031` | 11 |
| text-tertiary-3 | `#909096` | 9 |
| background-6 | `#f7f9fa` | 8 |
| accent-24 | `#dfdff9` | 7 |
| surface-6 | `#f1f4f6` | 7 |
| border-3 | `#a5a5a5` | 6 |
| accent-25 | `#5f9bf0` | 6 |
| text-tertiary-4 | `#667281` | 6 |
| accent-26 | `#e4e4fe` | 5 |
| text-tertiary-5 | `#6e7680` | 5 |
| text-primary-15 | `#121212` | 5 |
| accent-27 | `#007aff` | 5 |
| background-7 | `#fcfbfc` | 4 |
| accent-28 | `#df4744` | 4 |
| accent-29 | `#fc5753` | 4 |
| accent-30 | `#de9f34` | 4 |
| accent-31 | `#fdbc40` | 4 |
| accent-32 | `#27aa35` | 4 |
| accent-33 | `#36c84b` | 4 |
| accent-34 | `#e8173d` | 4 |
| text-primary-16 | `#3d3d3d` | 4 |
| text-primary-17 | `#3d3d3c` | 4 |
| text-primary-18 | `#252626` | 3 |
| accent-35 | `#304ffe` | 3 |
| surface-7 | `#d9d9d9` | 3 |
| border-4 | `#c5c5c5` | 2 |
| border-5 | `#98a0a9` | 2 |
| accent-36 | `#9e6ee8` | 2 |
| accent-37 | `#faac2a` | 2 |
| surface-8 | `#f2f2f7` | 2 |
| accent-38 | `#25e55f` | 2 |
| surface-9 | `#f0f0f0` | 2 |
| accent-39 | `#e7f1fd` | 1 |
| accent-40 | `#f26d21` | 1 |
| accent-41 | `#f5c2c2` | 1 |
| surface-10 | `#dedede` | 1 |
| border-6 | `#d7d7d7` | 1 |
| border-7 | `#9c9c9c` | 1 |
| surface-11 | `#dddddd` | 1 |
| accent-42 | `#3991fd` | 1 |
| accent-43 | `#141a2e` | 1 |

## 3. Variables

_no local variables found — this file has no variable collections, the palette above is sampled from raw fills_

## 4. Typography

### Fonts

- SF Pro Display
- SF Pro Text
- Roboto Mono
- Roboto
- Segoe MDL2 Assets
- SF Pro
- SF Compact Display

### Scale

| Token | Family | Size | Weight | Line height |
|---|---|---|---|---|
| display | SF Pro Text | 48px | 700 | auto |
| display-2 | SF Pro Text | 40px | 400 | auto |
| display-3 | SF Pro Text | 40px | 400 | 48px |
| display-4 | SF Pro Display | 40px | 700 | 48px |
| display-5 | SF Pro Text | 40px | 600 | 45px |
| h1 | SF Pro Display | 32px | 700 | 40px |
| h2 | SF Pro Text | 30px | 600 | 34.1860466003418px |
| h3 | SF Pro Text | 24px | 700 | 32px |
| h3-2 | SF Pro Text | 24px | 600 | 32px |
| h3-3 | SF Pro Display | 24px | 700 | 32px |
| h3-4 | SF Pro | 24px | 600 | 32px |
| h3-5 | SF Compact Display | 24px | 700 | 32px |
| h4 | SF Pro Text | 22px | 400 | 40px |
| h5 | SF Pro Display | 20px | 500 | 24px |
| h6 | SF Pro Text | 18px | 400 | 24px |
| h6-2 | Roboto | 18px | 500 | auto |
| body-lg | SF Pro | 17px | 600 | 32px |
| body-lg-2 | Roboto Mono | 16px | 400 | 19.2px |
| body-lg-3 | Roboto Mono | 16px | 700 | 19.2px |
| body-lg-4 | SF Pro Text | 16px | 700 | 24px |
| body-lg-5 | SF Pro Text | 16px | 700 | auto |
| body-lg-6 | SF Pro Text | 16px | 600 | 24px |
| body-lg-7 | SF Pro | 16px | 600 | 32px |
| body-lg-8 | SF Pro Text | 16px | 400 | 24px |
| body-lg-9 | Roboto Mono | 16px | 700 | 24px |
| body | SF Pro Text | 15px | 400 | auto |
| body-2 | SF Pro Text | 14px | 500 | 16px |
| body-3 | SF Pro Text | 14px | 400 | 16px |
| body-4 | SF Pro Text | 14px | 700 | 16px |
| body-5 | SF Pro Text | 14px | 400 | 22px |
| body-6 | SF Pro Display | 14px | 600 | 20px |
| body-7 | SF Pro Display | 14px | 400 | auto |
| body-8 | SF Pro Text | 14px | 600 | auto |
| body-9 | SF Pro Text | 14px | 400 | 20px |
| body-10 | SF Pro | 14px | 400 | 32px |
| body-11 | SF Pro Text | 14px | 500 | 20px |
| body-12 | SF Pro Text | 13px | 400 | 16px |
| body-13 | SF Pro Text | 13px | 700 | 16px |
| body-14 | SF Pro Text | 13px | 400 | 16px |
| body-15 | SF Pro Text | 13px | 500 | 16px |
| body-16 | SF Pro Text | 13px | 400 | auto |
| body-17 | SF Pro Text | 13px | 400 | 24px |
| body-18 | SF Pro Text | 13px | 400 | 20px |
| body-19 | SF Pro Text | 13px | 700 | auto |
| body-20 | SF Pro Text | 13px | 600 | auto |
| caption | SF Pro Text | 12px | 500 | 16px |
| caption-2 | SF Pro Text | 12px | 400 | auto |
| caption-3 | SF Pro Text | 12px | 700 | 16px |
| caption-4 | SF Pro Text | 12px | 500 | auto |
| caption-5 | SF Pro Text | 12px | 500 | 16px |
| caption-6 | SF Pro Text | 12px | 400 | 16px |
| caption-7 | SF Pro Display | 12px | 400 | 16px |
| caption-8 | SF Pro Text | 11px | 500 | 12px |
| caption-9 | SF Pro Text | 11px | 400 | 14px |
| caption-10 | SF Pro Text | 11px | 400 | auto |
| caption-11 | SF Pro Text | 11px | 500 | 16px |
| caption-12 | SF Pro Text | 11px | 400 | 16px |
| caption-13 | SF Pro Text | 11px | 700 | auto |
| caption-14 | SF Pro Text | 11px | 400 | 16px |
| caption-15 | SF Pro Text | 10px | 600 | 10px |
| caption-16 | SF Pro Text | 10px | 700 | 13px |
| caption-17 | SF Pro Text | 10px | 700 | auto |
| caption-18 | Segoe MDL2 Assets | 10px | 400 | auto |
| caption-19 | SF Pro Text | 10px | 700 | 12px |
| caption-20 | SF Pro Text | 10px | 400 | 12.155038833618164px |

## 5. Spacing & Layout

### Base Unit

2px

### Border Radius

| Token | Value |
|---|---|
| radius-sm | 0.30000001192092896px |
| radius-md | 0.5px |
| radius-lg | 1px |
| radius-lg-2 | 1.127271294593811px |
| radius-lg-3 | 1.2941176891326904px |
| radius-lg-4 | 1.8405075073242188px |
| radius-lg-5 | 2px |
| radius-lg-6 | 3px |
| radius-lg-7 | 4px |
| radius-lg-8 | 5px |
| radius-lg-9 | 5.300000190734863px |
| radius-lg-10 | 6px |
| radius-lg-11 | 7px |
| radius-lg-12 | 8px |
| radius-lg-13 | 9.239999771118164px |
| radius-lg-14 | 10px |
| radius-lg-15 | 10.5px |
| radius-lg-16 | 10.5600004196167px |
| radius-lg-17 | 12px |
| radius-lg-18 | 14px |
| radius-lg-19 | 16px |
| radius-lg-20 | 18px |
| radius-lg-21 | 20px |
| radius-lg-22 | 22px |
| radius-lg-23 | 24px |
| radius-lg-24 | 29px |
| radius-lg-25 | 100px |

## 6. Depth & Motion

### Elevation

- BACKGROUND_BLUR blur 45px (used 331×)
- 0px 25px 30px 0px #000000 @ 35% (used 283×)
- 0px 0px 20px 0px #000000 @ 15% (used 283×)
- BACKGROUND_BLUR blur 48px (used 119×)
- 0px 0px 6.673171520233154px 0px #000000 @ 13% (used 90×)
- BACKGROUND_BLUR blur 20px (used 86×)
- 0px 8px 24px 0px #000000 @ 30% (used 67×)
- 0px 2px 8px 0px #232333 @ 10% (used 49×)
- 0px 4px 4px 0px #000000 @ 25% (used 38×)
- BACKGROUND_BLUR blur 54.36563491821289px (used 36×)
- 0px 8px 32px 0px #000000 @ 15% (used 23×)
- 0px 0px 24px 0px #000000 @ 20% (used 15×)
- BACKGROUND_BLUR blur 10px (used 10×)
- 0px 2px 10px 0px #232333 @ 16% (used 9×)
- 0px 3px 7px 0px #000000 @ 30% (used 8×)
- BACKGROUND_BLUR blur 16px (used 8×)
- 0px 1px 0px 0px #ffffff @ 9% (used 7×)
- 0px 12px 24px 0px #000000 @ 50% (used 6×)
- 0px 6px 12px 0px #000000 @ 50% (used 4×)
- 0px 2px 4px 0px #131619 @ 10% (used 4×)
- 0px 4px 8px 0px #131619 @ 10% (used 4×)
- 0px 8px 24px 0px #232333 @ 10% (used 4×)
- 0px 2.021052598953247px 5.894737243652344px 0px #000000 @ 10% (used 3×)
- 0px 4px 16px 0px #000000 @ 20% (used 3×)
- 0px 8px 24px 0px #000000 @ 15% (used 2×)
- 0px 8px 24px 0px #000000 @ 8% (used 2×)
- 1px 0px 0px 0px #ffffff @ 9% (used 2×)
- 0px 1px 1px 0px #000000 @ 20% (used 2×)
- 0px 2px 2px 0px #000000 @ 15% (used 2×)
- inset 0px -1px 0px 0px #ededf4 @ 100% (used 2×)
- 0px 8px 16px 0px #000000 @ 10% (used 2×)
- inset 0px 0px 0px 1px #000000 @ 9% (used 2×)
- 0px 1px 0px 0px #bfbfbf @ 100% (used 2×)
- 0px 2px 24px 0px #ffffff @ 10% (used 2×)
- BACKGROUND_BLUR blur 15.193798065185547px (used 2×)
- 0px 1.5193798542022705px 18.232559204101562px 0px #ffffff @ 10% (used 2×)
- 0px 24px 48px 0px #000000 @ 50% (used 2×)
- inset 0px 4px 4px 0px #000000 @ 25% (used 1×)
- 0px 2px 10px 0px #000000 @ 16% (used 1×)
- 0px 1px 4px 0px #000000 @ 8% (used 1×)
- 0px 1px 1px 0px #000000 @ 15% (used 1×)
- inset 0px 4px 24px 0px #5c7fec @ 20% (used 1×)
- inset 0px 3.038759708404541px 18.232559204101562px 0px #5c7fec @ 20% (used 1×)

## 7. Components

_no component sets found_

## 8. States

State tokens should be derived from the base palette above. Recommended mappings:

| State | Treatment |
|-------|-----------|
| Hover | Lighten/darken accent by 10% |
| Focus | 2px ring using accent color with 30% opacity |
| Disabled | 40% opacity, no pointer events |
| Error | Use danger color for border and text |

## 9. Rules

### Do

- Use the 2px base unit for all spacing decisions
- Use `#ff5c5c` (accent) as the primary accent color
- Bind colors to the tokens below instead of hardcoding hex values

### Don't

- Introduce new colors without adding them to the palette
- Mix corner radii outside the radius scale

## 10. Extending this system

### How to reuse this DESIGN.md

Import into Figma with `figma-cli import <this file>` — colors, radii and typography become variables.

### When to add a new token vs reuse

Reuse the closest existing token; add a new one only when a new semantic role appears.

## 11. Machine-readable tokens

The block below is the canonical token map. It mirrors the tables above but is unambiguous and parseable.

```json design-tokens
{
  "$schema": "design-tokens.v1",
  "meta": {
    "source": "Zoom Apps UI Overview (Community)",
    "generated": "2026-07-08"
  },
  "color": {
    "background": "#ffffff",
    "surface": "#f5f5f5",
    "text-primary": "#000000",
    "text-tertiary": "#747487",
    "border": "#c2c7cd",
    "surface-alt": "#dfe3e8",
    "accent": "#ff5c5c",
    "accent-alt": "#4f9af7",
    "accent-3": "#de2828",
    "text-primary-alt": "#040413",
    "accent-4": "#23d959",
    "text-secondary": "#525280",
    "accent-5": "#0e72ed",
    "text-primary-3": "#222230",
    "surface-3": "#ededf4",
    "text-tertiary-alt": "#8a8a8b",
    "text-primary-4": "#090a0a",
    "border-alt": "#c4c4c4",
    "background-alt": "#f8f9fa",
    "text-primary-5": "#242424",
    "text-primary-6": "#282f38",
    "text-primary-7": "#131619",
    "accent-6": "#268543",
    "accent-7": "#1b2733",
    "accent-8": "#e05050",
    "accent-9": "#0e71eb",
    "text-primary-8": "#232333",
    "accent-10": "#e02828",
    "accent-11": "#4ccc7d",
    "background-3": "#f7f7fc",
    "accent-12": "#2e8cff",
    "accent-13": "#ff0000",
    "text-primary-9": "#1a1a1a",
    "text-secondary-alt": "#637282",
    "surface-4": "#e7e8eb",
    "text-primary-10": "#111111",
    "text-primary-11": "#2e2e2e",
    "surface-5": "#e0e0e0",
    "accent-14": "#0061ff",
    "background-4": "#f9fbfc",
    "accent-15": "#4793f1",
    "text-secondary-3": "#707070",
    "accent-16": "#bd3fb1",
    "text-primary-12": "#2f2f30",
    "accent-17": "#a26900",
    "accent-18": "#f04a4e",
    "accent-19": "#ce3f43",
    "accent-20": "#ffc53d",
    "accent-21": "#faad14",
    "accent-22": "#00b27d",
    "accent-23": "#00996b",
    "background-5": "#f8f8f8",
    "text-primary-13": "#252a30",
    "text-primary-14": "#303031",
    "text-tertiary-3": "#909096",
    "background-6": "#f7f9fa",
    "accent-24": "#dfdff9",
    "surface-6": "#f1f4f6",
    "border-3": "#a5a5a5",
    "accent-25": "#5f9bf0",
    "text-tertiary-4": "#667281",
    "accent-26": "#e4e4fe",
    "text-tertiary-5": "#6e7680",
    "text-primary-15": "#121212",
    "accent-27": "#007aff",
    "background-7": "#fcfbfc",
    "accent-28": "#df4744",
    "accent-29": "#fc5753",
    "accent-30": "#de9f34",
    "accent-31": "#fdbc40",
    "accent-32": "#27aa35",
    "accent-33": "#36c84b",
    "accent-34": "#e8173d",
    "text-primary-16": "#3d3d3d",
    "text-primary-17": "#3d3d3c",
    "text-primary-18": "#252626",
    "accent-35": "#304ffe",
    "surface-7": "#d9d9d9",
    "border-4": "#c5c5c5",
    "border-5": "#98a0a9",
    "accent-36": "#9e6ee8",
    "accent-37": "#faac2a",
    "surface-8": "#f2f2f7",
    "accent-38": "#25e55f",
    "surface-9": "#f0f0f0",
    "accent-39": "#e7f1fd",
    "accent-40": "#f26d21",
    "accent-41": "#f5c2c2",
    "surface-10": "#dedede",
    "border-6": "#d7d7d7",
    "border-7": "#9c9c9c",
    "surface-11": "#dddddd",
    "accent-42": "#3991fd",
    "accent-43": "#141a2e"
  },
  "typography": {
    "display": {
      "fontFamily": "SF Pro Text",
      "fontSize": 48,
      "fontWeight": 700
    },
    "display-2": {
      "fontFamily": "SF Pro Text",
      "fontSize": 40,
      "fontWeight": 400
    },
    "display-3": {
      "fontFamily": "SF Pro Text",
      "fontSize": 40,
      "fontWeight": 400,
      "lineHeight": 48
    },
    "display-4": {
      "fontFamily": "SF Pro Display",
      "fontSize": 40,
      "fontWeight": 700,
      "lineHeight": 48
    },
    "display-5": {
      "fontFamily": "SF Pro Text",
      "fontSize": 40,
      "fontWeight": 600,
      "lineHeight": 45
    },
    "h1": {
      "fontFamily": "SF Pro Display",
      "fontSize": 32,
      "fontWeight": 700,
      "lineHeight": 40
    },
    "h2": {
      "fontFamily": "SF Pro Text",
      "fontSize": 30,
      "fontWeight": 600,
      "lineHeight": 34.1860466003418
    },
    "h3": {
      "fontFamily": "SF Pro Text",
      "fontSize": 24,
      "fontWeight": 700,
      "lineHeight": 32
    },
    "h3-2": {
      "fontFamily": "SF Pro Text",
      "fontSize": 24,
      "fontWeight": 600,
      "lineHeight": 32
    },
    "h3-3": {
      "fontFamily": "SF Pro Display",
      "fontSize": 24,
      "fontWeight": 700,
      "lineHeight": 32
    },
    "h3-4": {
      "fontFamily": "SF Pro",
      "fontSize": 24,
      "fontWeight": 600,
      "lineHeight": 32
    },
    "h3-5": {
      "fontFamily": "SF Compact Display",
      "fontSize": 24,
      "fontWeight": 700,
      "lineHeight": 32
    },
    "h4": {
      "fontFamily": "SF Pro Text",
      "fontSize": 22,
      "fontWeight": 400,
      "lineHeight": 40
    },
    "h5": {
      "fontFamily": "SF Pro Display",
      "fontSize": 20,
      "fontWeight": 500,
      "lineHeight": 24
    },
    "h6": {
      "fontFamily": "SF Pro Text",
      "fontSize": 18,
      "fontWeight": 400,
      "lineHeight": 24
    },
    "h6-2": {
      "fontFamily": "Roboto",
      "fontSize": 18,
      "fontWeight": 500
    },
    "body-lg": {
      "fontFamily": "SF Pro",
      "fontSize": 17,
      "fontWeight": 600,
      "lineHeight": 32
    },
    "body-lg-2": {
      "fontFamily": "Roboto Mono",
      "fontSize": 16,
      "fontWeight": 400,
      "lineHeight": 19.2,
      "letterSpacing": -4
    },
    "body-lg-3": {
      "fontFamily": "Roboto Mono",
      "fontSize": 16,
      "fontWeight": 700,
      "lineHeight": 19.2,
      "letterSpacing": -4
    },
    "body-lg-4": {
      "fontFamily": "SF Pro Text",
      "fontSize": 16,
      "fontWeight": 700,
      "lineHeight": 24
    },
    "body-lg-5": {
      "fontFamily": "SF Pro Text",
      "fontSize": 16,
      "fontWeight": 700
    },
    "body-lg-6": {
      "fontFamily": "SF Pro Text",
      "fontSize": 16,
      "fontWeight": 600,
      "lineHeight": 24,
      "letterSpacing": -2
    },
    "body-lg-7": {
      "fontFamily": "SF Pro",
      "fontSize": 16,
      "fontWeight": 600,
      "lineHeight": 32
    },
    "body-lg-8": {
      "fontFamily": "SF Pro Text",
      "fontSize": 16,
      "fontWeight": 400,
      "lineHeight": 24,
      "letterSpacing": -2
    },
    "body-lg-9": {
      "fontFamily": "Roboto Mono",
      "fontSize": 16,
      "fontWeight": 700,
      "lineHeight": 24,
      "letterSpacing": -4
    },
    "body": {
      "fontFamily": "SF Pro Text",
      "fontSize": 15,
      "fontWeight": 400
    },
    "body-2": {
      "fontFamily": "SF Pro Text",
      "fontSize": 14,
      "fontWeight": 500,
      "lineHeight": 16,
      "letterSpacing": -2
    },
    "body-3": {
      "fontFamily": "SF Pro Text",
      "fontSize": 14,
      "fontWeight": 400,
      "lineHeight": 16
    },
    "body-4": {
      "fontFamily": "SF Pro Text",
      "fontSize": 14,
      "fontWeight": 700,
      "lineHeight": 16
    },
    "body-5": {
      "fontFamily": "SF Pro Text",
      "fontSize": 14,
      "fontWeight": 400,
      "lineHeight": 22
    },
    "body-6": {
      "fontFamily": "SF Pro Display",
      "fontSize": 14,
      "fontWeight": 600,
      "lineHeight": 20
    },
    "body-7": {
      "fontFamily": "SF Pro Display",
      "fontSize": 14,
      "fontWeight": 400
    },
    "body-8": {
      "fontFamily": "SF Pro Text",
      "fontSize": 14,
      "fontWeight": 600
    },
    "body-9": {
      "fontFamily": "SF Pro Text",
      "fontSize": 14,
      "fontWeight": 400,
      "lineHeight": 20
    },
    "body-10": {
      "fontFamily": "SF Pro",
      "fontSize": 14,
      "fontWeight": 400,
      "lineHeight": 32
    },
    "body-11": {
      "fontFamily": "SF Pro Text",
      "fontSize": 14,
      "fontWeight": 500,
      "lineHeight": 20
    },
    "body-12": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 400,
      "lineHeight": 16
    },
    "body-13": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 700,
      "lineHeight": 16
    },
    "body-14": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 400,
      "lineHeight": 16,
      "letterSpacing": -4
    },
    "body-15": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 500,
      "lineHeight": 16
    },
    "body-16": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 400
    },
    "body-17": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 400,
      "lineHeight": 24
    },
    "body-18": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 400,
      "lineHeight": 20
    },
    "body-19": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 700
    },
    "body-20": {
      "fontFamily": "SF Pro Text",
      "fontSize": 13,
      "fontWeight": 600
    },
    "caption": {
      "fontFamily": "SF Pro Text",
      "fontSize": 12,
      "fontWeight": 500,
      "lineHeight": 16
    },
    "caption-2": {
      "fontFamily": "SF Pro Text",
      "fontSize": 12,
      "fontWeight": 400
    },
    "caption-3": {
      "fontFamily": "SF Pro Text",
      "fontSize": 12,
      "fontWeight": 700,
      "lineHeight": 16
    },
    "caption-4": {
      "fontFamily": "SF Pro Text",
      "fontSize": 12,
      "fontWeight": 500
    },
    "caption-5": {
      "fontFamily": "SF Pro Text",
      "fontSize": 12,
      "fontWeight": 500,
      "lineHeight": 16,
      "letterSpacing": -1
    },
    "caption-6": {
      "fontFamily": "SF Pro Text",
      "fontSize": 12,
      "fontWeight": 400,
      "lineHeight": 16
    },
    "caption-7": {
      "fontFamily": "SF Pro Display",
      "fontSize": 12,
      "fontWeight": 400,
      "lineHeight": 16
    },
    "caption-8": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11,
      "fontWeight": 500,
      "lineHeight": 12
    },
    "caption-9": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11,
      "fontWeight": 400,
      "lineHeight": 14
    },
    "caption-10": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11,
      "fontWeight": 400
    },
    "caption-11": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11,
      "fontWeight": 500,
      "lineHeight": 16,
      "letterSpacing": -2
    },
    "caption-12": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11,
      "fontWeight": 400,
      "lineHeight": 16
    },
    "caption-13": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11,
      "fontWeight": 700
    },
    "caption-14": {
      "fontFamily": "SF Pro Text",
      "fontSize": 11,
      "fontWeight": 400,
      "lineHeight": 16,
      "letterSpacing": -4
    },
    "caption-15": {
      "fontFamily": "SF Pro Text",
      "fontSize": 10,
      "fontWeight": 600,
      "lineHeight": 10,
      "letterSpacing": -0.20000000298023224
    },
    "caption-16": {
      "fontFamily": "SF Pro Text",
      "fontSize": 10,
      "fontWeight": 700,
      "lineHeight": 13
    },
    "caption-17": {
      "fontFamily": "SF Pro Text",
      "fontSize": 10,
      "fontWeight": 700
    },
    "caption-18": {
      "fontFamily": "Segoe MDL2 Assets",
      "fontSize": 10,
      "fontWeight": 400
    },
    "caption-19": {
      "fontFamily": "SF Pro Text",
      "fontSize": 10,
      "fontWeight": 700,
      "lineHeight": 12,
      "letterSpacing": 0.5
    },
    "caption-20": {
      "fontFamily": "SF Pro Text",
      "fontSize": 10,
      "fontWeight": 400,
      "lineHeight": 12.155038833618164
    }
  },
  "spacing": {
    "base-unit": 2
  },
  "radius": {
    "radius-sm": "0.30000001192092896px",
    "radius-md": "0.5px",
    "radius-lg": "1px",
    "radius-lg-2": "1.127271294593811px",
    "radius-lg-3": "1.2941176891326904px",
    "radius-lg-4": "1.8405075073242188px",
    "radius-lg-5": "2px",
    "radius-lg-6": "3px",
    "radius-lg-7": "4px",
    "radius-lg-8": "5px",
    "radius-lg-9": "5.300000190734863px",
    "radius-lg-10": "6px",
    "radius-lg-11": "7px",
    "radius-lg-12": "8px",
    "radius-lg-13": "9.239999771118164px",
    "radius-lg-14": "10px",
    "radius-lg-15": "10.5px",
    "radius-lg-16": "10.5600004196167px",
    "radius-lg-17": "12px",
    "radius-lg-18": "14px",
    "radius-lg-19": "16px",
    "radius-lg-20": "18px",
    "radius-lg-21": "20px",
    "radius-lg-22": "22px",
    "radius-lg-23": "24px",
    "radius-lg-24": "29px",
    "radius-lg-25": "100px"
  },
  "shadow": {
    "shadow-1": "0px 25px 30px 0px #00000059",
    "shadow-2": "0px 0px 20px 0px #00000026",
    "shadow-3": "0px 0px 6.673171520233154px 0px #00000021",
    "shadow-4": "0px 8px 24px 0px #0000004d",
    "shadow-5": "0px 2px 8px 0px #2323331a",
    "shadow-6": "0px 4px 4px 0px #00000040",
    "shadow-7": "0px 8px 32px 0px #00000026",
    "shadow-8": "0px 0px 24px 0px #00000033",
    "shadow-9": "0px 2px 10px 0px #23233329",
    "shadow-10": "0px 3px 7px 0px #0000004d",
    "shadow-11": "0px 1px 0px 0px #ffffff17",
    "shadow-12": "0px 12px 24px 0px #00000080",
    "shadow-13": "0px 6px 12px 0px #00000080",
    "shadow-14": "0px 2px 4px 0px #1316191a",
    "shadow-15": "0px 4px 8px 0px #1316191a",
    "shadow-16": "0px 8px 24px 0px #2323331a",
    "shadow-17": "0px 2.021052598953247px 5.894737243652344px 0px #0000001a",
    "shadow-18": "0px 4px 16px 0px #00000033",
    "shadow-19": "0px 8px 24px 0px #00000026",
    "shadow-20": "0px 8px 24px 0px #00000014",
    "shadow-21": "1px 0px 0px 0px #ffffff17",
    "shadow-22": "0px 1px 1px 0px #00000033",
    "shadow-23": "0px 2px 2px 0px #00000026",
    "shadow-24": "inset 0px -1px 0px 0px #ededf4",
    "shadow-25": "0px 8px 16px 0px #0000001a",
    "shadow-26": "inset 0px 0px 0px 1px #00000017",
    "shadow-27": "0px 1px 0px 0px #bfbfbf",
    "shadow-28": "0px 2px 24px 0px #ffffff1a",
    "shadow-29": "0px 1.5193798542022705px 18.232559204101562px 0px #ffffff1a",
    "shadow-30": "0px 24px 48px 0px #00000080",
    "shadow-31": "inset 0px 4px 4px 0px #00000040",
    "shadow-32": "0px 2px 10px 0px #00000029",
    "shadow-33": "0px 1px 4px 0px #00000014",
    "shadow-34": "0px 1px 1px 0px #00000026",
    "shadow-35": "inset 0px 4px 24px 0px #5c7fec33",
    "shadow-36": "inset 0px 3.038759708404541px 18.232559204101562px 0px #5c7fec33"
  },
  "fonts": [
    "SF Pro Display",
    "SF Pro Text",
    "Roboto Mono",
    "Roboto",
    "Segoe MDL2 Assets",
    "SF Pro",
    "SF Compact Display"
  ]
}
```
