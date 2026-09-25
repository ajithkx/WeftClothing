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
| `cyan` | `#4FD6E8` | Neon only: focus ring, rail progress, tile captions, price label, card hover edge |
| `mint` | `#B9E8D8` | Reserved; unused so far |

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
- **Nav**: floating rounded bar, blurred raised bg, hides on scroll down. Mobile: logo + IG icon pill + two-line menu button → full-screen menu of display-type links alternating solid/outline.
- **Scene switch**: segmented radio (`Reel` / `Cloth`), sliding ink thumb with cyan glow; arrow keys switch.
- **Sticker**: rotating circular text around a red "1/1" disc.
- **Tapes**: two full-bleed crossing bands (red +3°, blue -3.5°) with display caps separated by a faded slash; speed reacts to scroll velocity.
- **Product card** (`.pc`): 3:4 photo, "1 of 1" chip (red when hot), slide-up "DM to claim" bar, name + mono type/colour + cyan "DM for price". 3D tilt + spotlight on fine pointers. Rail ends with a blue "More on the gram" card.
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

Product photos are real flat-lays (`images/*.jpg`), shipped as `public/img/{n}.webp` (1200w) and `{n}-sm.webp` (600w). Detail close-ups go in the bento. Logo: `public/img/weft-mark.png` (wordmark, transparent) and `weft-logo.png` (with CLOTHING): use on dark only.

## Voice rules

No em dashes, no middle-dot separators, no sparkle-star glyphs, no pulsing dots or invented SKU codes in page copy. Write in short plain sentences; use periods, commas or parentheses.

## Card motion

Cards are the main scroll set piece:
- Overlap cards are dealt onto the table (rise from below with big rotation, `back.out`).
- Rail cards rise in as a fanned stack, then on desktop each card swings open like a door (`--ey` -70deg to 0, `--sc` .82 to 1) as the pinned horizontal scroll brings it in (GSAP `containerAnimation`).
- Up close cards are dealt onto the pile, then flicked away one per scroll step.
- Drop photos are thrown in from the left like a hand of cards.
