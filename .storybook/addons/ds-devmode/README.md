# DS Devmode — Storybook Addon

Figma Dev Mode-grade inspect experience inside Storybook. Click any element in
the canvas to pin it; a right-side panel shows anatomy, computed CSS, and
reverse-looked-up DS token usage. A redline overlay renders purple outline +
blue padding hatching + red distance labels to the parent.

## What it gives you

| Feature | How |
|---|---|
| **Click-to-pin / hover-live** | Toolbar toggle or `Alt+I`; `Esc` unpins |
| **Anatomy box** | Border + Padding + inner size (border-box); edge distances to parent |
| **Redline overlay** | Purple element outline, blue hatching on padding, red dashed lines + numeric labels to parent edges |
| **Computed CSS** | Grouped Layout / Style, filters browser defaults |
| **Token reverse lookup** | Scans `:root` custom properties → matches any computed value (`#0065EA` → `var(--primary, #0065EA)`) with resolved chain |
| **List / Code view** | List = semantic; Code = copy-ready CSS block |
| **Copy** | Per-section copy button |

## Why built (vs. existing addons)

- `@storybook/addon-measure`: only Alt+hover, no click-pin, no token resolution
- `@whitespace/storybook-addon-html`: shows rendered HTML + className list; no computed style or token reverse-lookup
- `storybook-addon-pseudo-states`: off-topic (hover state driver), not an inspector
- Figma **Code Connect / Storybook Connect**: reverse direction (Figma-side)

So we built a local addon that matches Figma Dev Mode's inspect UX against our
own design tokens.

## Architecture

```
.storybook/addons/ds-devmode/
├── preset.ts                    addon entry (managerEntries + previewAnnotations)
├── manager.tsx                  toolbar button + panel register
├── preview.ts                   canvas iframe: listeners + overlay driver
├── Panel.tsx                    right-side panel UI
├── constants.ts                 ADDON_ID / EVENTS / Payload types
└── utils/
    ├── dom-geometry.ts          getBoundingClientRect + distances-to-parent
    ├── computed-style.ts        getComputedStyle + default filter, grouped layout/style
    ├── token-reverse-lookup.ts  :root custom-property scan + value→name map
    └── overlay.ts               imperative redline renderer (inside iframe)
```

## Keyboard

| Key | Action |
|---|---|
| `Alt+I` | Toggle Off ↔ Live |
| click (while Live) | Pin element |
| `Esc` | Unpin (back to Live) |

## Pin vs. Live

- **Live** (default once toggled on): hover any canvas element → panel + overlay update in real time.
- **Pin**: click an element; panel freezes on it. Hover elsewhere doesn't replace it. Interact with other controls in the canvas — the pinned element's geometry refreshes on scroll / resize so animated flows can be inspected frame-by-frame (re-click to sample a new frame).

## Token reverse-lookup

On each inspect:

1. Read all CSS custom properties declared on `:root` (cached, 2 s TTL).
2. Resolve each `var(...)` expression down to the final value (up to 10 hops).
3. Build a reverse map: resolved value → list of custom-property names.
4. For each computed property on the target element, look up its value in the reverse map.
5. Display `var(--token-name, resolved-value)` with the color chip + hover tooltip showing the chain (`--primary → --color-blue-6 → #0065EA`).

This means any element that sets its color / padding / radius via a token will
show the token name even though the browser returns the already-resolved value.

## Reusability

- New components / new stories need **zero** addon changes — it's DOM-level.
- Works on every viewport / density / theme — reads live computed styles.
- Works on interactive flows: in Pin mode, re-click at each frame to sample.

## Reading the overlay

| Visual | Meaning |
|---|---|
| **Purple solid outline** | Selected element bounds |
| **Purple dashed outline** | Immediate parent bounds |
| **Blue hatching** | Computed padding (drawn on the inside of the 4 edges) |
| **Red dashed line + badge** | Distance from element edge to parent edge (px) |
| **Purple top badge** | Element label (`#id` / `.className` / tag) |
