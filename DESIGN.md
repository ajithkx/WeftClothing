# WEFT Clothing: Design System

Dark streetwear drop site. Near-black ground, electric blue and signal red used like track-jacket piping, cyan kept for neon glow only. Big heavy italic caps, curved panels, crossing ticker tapes, stickers. Motion is concentrated in a few set pieces (hero 3D, tapes, rail pin, drop reveal); everything else stays quiet.

Source of truth: `src/style.css` (`@theme` tokens + components), `src/scene.js` (3D), `src/main.js` (motion).

## Color

| Token | Hex | Role |
|---|---|---|
| `bg` | `#07080B` | Page ground. Never pure black. |
| `raised` / `raised-2` | `#0F1117` / `#161A23` | Nav bar, switch, card backs |
| `ink` | `#F2F4F3` | Primary text, light cards (`.ocard`), CTA bars |
| `soft` | `#C4CAD2` | Body copy on dark |
| `mute` | `#8F97A3` | Labels, meta (AA on `bg`) |
| `blue` | `#3D7BFF` | Piping: blue tape, process hover fill, end card, glow text |
| `red` | `#FF2E4D` | Primary action colour: all "DM" pills, sticker, drop section field, hot "1 of 1" chip |
| `red-hi` | `#FF4762` | Hover lift on red pills |
| `on-red` | `#1A0006` | Every text label on red (pills, CTA hover, skip hover, hot chip, drop body copy, red tape, selection). 5.49:1 on `red`, 6.05:1 on `red-hi` |
| `cyan` | `#4FD6E8` | Neon only: focus ring, rail progress, tile captions, price label, card hover edge |
| `blue-pale` | `#CFE0FF` | Text colour of `.glow-blue` (blue glow headline words) |
| `blue-soft` | `#8FB4FF` | `.glow-blue` on `.text-blue`, footer wordmark outline (at 80% via `color-mix`), deck ghost outline (16%) |
| `navy` | `#0F1A36` | Core of the hero panel radial gradient only |
| `white` | `#FFFFFF` | Only large display text and hairlines on red or blue (drop headline, sticker "1/1", blue end card and blue tape, knob, drop photo borders) and the `pill-black` hover |
| `black` | `#000000` | `pill-black` hover fill only |
| `red-shade` / `red-glow` / `red-dark` | `#5A0014` / `#780014` / `#3C000A` | Warm shadow tones inside the red drop panel (corner shade, headline shadow, photo shadow) |

Focus ring: two-tone, global `:focus-visible`. A 2px `cyan` outline sits between two 2px `bg` bands (box-shadow 6px, outline offset 2px), so it holds on any backdrop: `bg` band vs red 5.48:1, blue 5.22:1, ink 18.13:1; cyan vs `bg` 11.55:1. Cyan alone was only 2.11:1 on red and 2.21:1 on blue. The halo lives in the `--focus-halo` custom property (set by `:focus-visible`, `0 0 0 0 transparent` otherwise); any component with its own `box-shadow` lists `var(--focus-halo)` first so the glow and the halo compose. No `!important`. Do not override the ring per surface.

Contrast: white on `red` is only 3.65:1, so small text on red is never white; it uses `on-red`. White stays only where it is large display text (drop headline, sticker "1/1", which pass the 3:1 large-text rule). Darkening the red instead was rejected: white needs `#EE0023` to reach 4.5:1, and that red falls to 4.44:1 as text on `bg`. Chips (`.chip`) sit on near-opaque `bg` at 80% so `ink` text holds AA over any photo or the blue end card (at least 10:1).

Rules: red means "act" (every buy path). Blue carries identity and big fields. Cyan never fills anything bigger than a thin line or a dot. Neon = `text-shadow`/`box-shadow` glow, never gradient text.

## Type

- **Display**: Archivo Variable, italic, weight 900, `font-stretch: 78%`, uppercase, line-height .84, tracking -0.02em (`.display`). Headlines are stacked two-liners with the second line either `.outline` (1.5px stroke, transparent fill), `.text-red`, or `.glow-blue`.
- **Body**: Schibsted Grotesk Variable. `.lede` 1.05–1.25rem / 1.6.
- **Mono**: JetBrains Mono Variable for data only: "1 of 1", colourways, "DM for price", counters, footer meta. 10.5–11px, uppercase, +0.08em.

Sizes: hero `clamp(3.6rem, 10.4vw, 11rem)`, section `.stack-title` `clamp(3.4rem, 10vw, 9.5rem)`, drop `clamp(3.2rem, 8.4vw, 8.6rem)`.

No eyebrows/kickers above headings. The only small label in the hero is the live status pill.

## Shape

- Panels: 32px radius (`--r`), 26px on mobile. Drop panel: 48px top corners.
- **Inverted-corner notch** (`.notch`): a bg-coloured block cut into a panel's bottom-right with radial-gradient inverse corners. Holds secondary controls (scene switch, thumbnails).
- Cards 24–26px, tiles 28px, inner images ~18px. Pills fully round.
- Curved reveals: tiles open from `inset(... round 120px)`, drop panel from a 160px-round inset, loader exits via ellipse clip.

## Components

- **Pills**: `.pill` 44px; `.pill-lg` 58px. `.pill-red` (primary, soft red glow), `.pill-ghost` (hairline), `.pill-black` (on red). Optional `.knob` circle with arrow that rotates -45° on hover. `.magnetic` pulls toward cursor.
- **Nav**: floating rounded bar, near-solid raised bg (no backdrop blur, it re-sampled the WebGL hero every frame), hides on scroll down. Logo is text only ("WEFT" in display type plus small mono "CLOTHING", cyan on hover). Mobile: logo + IG icon pill + two-line menu button → full-screen menu of display-type links alternating solid/outline.
- **Footer wordmark** (`.footer-word`): full-width outlined "WEFT" in display type sinking into a hairline; letters rise in on scroll, fill ink (T in red) on hover; filled by default on touch.
- **Floating buttons**: round back-to-top (bottom right, after the hero) and a "Skip" pill (bottom centre) shown only while the rail or Up close deck is pinned.
- **Scene switch**: compact pill segmented radio (`Reel` / `Cloth`), sliding ink thumb with cyan glow; arrow keys switch.
- **Sticker**: rotating circular text around a red "1/1" disc.
- **Tapes**: two full-bleed crossing bands (red +3°, blue -3.5°) with display caps separated by a faded slash; speed reacts to scroll velocity.
- **Product card** (`.pc`): 3:4 photo, "1 of 1" chip (`.chip`: mono caps pill on dark glass; `.chip-red` when hot: red fill, `on-red` text, red glow), slide-up "DM to claim" bar, name + mono type/colour + cyan "DM for price". 3D tilt + spotlight on fine pointers. Rail ends with a blue "More on the gram" card.
- **Overlap cards** (`.ocard`): light ink cards, rotated ±5°, overlapping a giant display word, parallax.
- **Up close deck** (`.deck`): pinned section. Close-up photos stacked as a tilted deck of ink-bordered cards; each scroll step (snapped) flicks the top card off to alternating sides while the next straightens. Left column shows a big red counter (01/06), label and cyan mono caption; a giant outlined label sits behind. The deck leans toward the cursor on desktop.
- **Steps**: full-width rows with giant display word; hover fills blue from bottom and a photo follows the cursor. Mobile shows inline thumbnails instead.

## 3D hero (`src/scene.js`)

Two worlds, switchable, persisted in `localStorage` (`weft-hero`) or `?hero=reel|cloth`:
- **Reel**: 10 real product photos on bent planes around a ring, rounded-rect SDF with a thin pulsing blue/red/cyan edge, two neon tube threads weaving over/under. Cursor tilts ring and camera; scroll spins and dollies.
- **Cloth**: 220×140 plane displaced in the vertex shader (folds + cursor ripple), 2/2 twill in the fragment shader, blue/white/red piping bands, cursor-following light, red rim light.

Bloom threshold .92 so only neon edges/threads glow: photos never wash out. Renderer pauses off-screen and on hidden tabs; DPR capped 1.5–1.75. No WebGL → static photo fallback. Reduced motion → one static frame, no loader, no Lenis, no scroll choreography.

## Motion

Easing: `expo.out` / `cubic-bezier(.16,1,.3,1)` for entrances, `cubic-bezier(.7,0,.2,1)` for UI snaps. Loader (logo wipe + thread bar + counter, ~2.5s) → hero lines rise with slight skew. Lenis smooth scroll. Desktop rail pins and scrubs horizontally; mobile rail is native scroll-snap.

## Imagery

Product photos are real flat-lays, shipped as `public/img/{n}.webp` (1200w) and `{n}-sm.webp` (600w). Detail close-ups go in the Up close deck. Logo: `public/img/weft-mark.webp` (wordmark, 1260x338 so it stays sharp at 3x, flattened onto `--color-bg` `#07080b`, used by the loader only) (use on dark only). Nav and footer use text.

## Voice rules

No em dashes, no middle-dot separators, no sparkle-star glyphs, no pulsing dots or invented SKU codes in page copy. Write in short plain sentences; use periods, commas or parentheses.

## Card motion

Cards are the main scroll set piece:
- Overlap cards are dealt onto the table (rise from below with big rotation, `back.out`).
- Rail cards rise in as a fanned stack, then on desktop each card swings open like a door (`--ey` -70deg to 0, `--sc` .82 to 1) as the pinned horizontal scroll brings it in (GSAP `containerAnimation`).
- Up close cards are dealt onto the pile, then flicked away one per scroll step.
- Drop photos are thrown in from the left like a hand of cards.
