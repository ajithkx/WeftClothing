# WEFT Clothing — Design & Build Brief
**Handoff document — paste into a new chat (or Claude Code) to continue the build**

---

## 1. What this is

A WebGL/Three.js landing page for **WEFT Clothing**, a thrifted-jacket store. Product is a
3D jacket model placed center-stage; scroll drives camera movement, object animation,
lighting changes, and a **trending products** rail pulled from an existing API.

Dark theme. Neon. Built to feel expensive, not like a tutorial demo.

---

## 2. Brand

**Name:** WEFT Clothing
*("Weft" = the horizontal thread woven through a fabric's warp — literal + on-theme for a
clothing brand, quietly ties back to the idea of garments being made, not just sold.)*

**Logo assets (provided, attached alongside this brief):**
- `weft-logo-dark-bg.png` — full-color mark on black, for use on the dark theme (primary)
- `weft-logo-light-bg.png` — same mark on white, for light contexts (emails, light sections, favicons on light UI, press kit)

The wordmark itself is knockout type filled with a hand-drawn abstract line-art pattern in
blues/teals/mint — it's the single most distinctive brand asset. Treat it as a **texture**,
not just a logotype: the fill pattern (tangled cables, dot, waves) is a legitimate motif to
echo elsewhere at small scale (e.g. as a subtle background texture, a loading-state fill, or
an SVG mask reused on a section divider) — don't overuse it, but it's there if a moment calls
for it.

**Color palette** — pulled directly from the logo's ink rather than invented:

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#08090C` | primary background, near-black not pure black |
| `--bg-raised` | `#101319` | cards, raised surfaces |
| `--ink` | `#F4F6F5` | primary text on dark |
| `--neon-cyan` | `#4FD6E8` | primary accent — CTAs, active states, glow |
| `--neon-teal` | `#2BA6A0` | secondary accent, hover states |
| `--deep-indigo` | `#1E2A4A` | shadows, gradients, depth |
| `--mint` | `#B9E8D8` | rare highlight, sparingly — logo's lightest tone |

Neon is expressed as **glow, not saturation** — soft cyan bloom on edges/type, not a wash
of bright color across the whole page. One accent color doing the work (cyan), teal as its
quieter sibling, mint used almost never (a spark, not a fill).

**Typography** — not yet finalized, but direction:
- Display: a tight, slightly condensed grotesk (something in the Neue Montreal / General
  Sans / Founders Grotesk family) set very large for hero moments — echoes the logo's
  confident, geometric sans letterforms
- Body: a plain, highly legible grotesk at a smaller weight (Inter or similar) — utility only
- Consider one mono face (JetBrains Mono / IBM Plex Mono) for price tags, SKU-style labels,
  and the "trending" rail — reinforces the thrifted/archival, catalogued feel

---

## 3. Motion & scroll reference: landonorris.com

Studied the reference site directly. What to actually borrow (not a skin-swap, the
underlying *mechanics*):

- **Oversized type reveal on load** — the hero commits to one huge wordmark/name treatment
  before anything else loads in. WEFT should open on the 3D jacket + wordmark, not a
  cluttered hero.
- **Horizontal image-reel scroll** — a pinned section where vertical scroll drives a
  *horizontal* strip of images (their career-moments reel). This is a strong candidate for
  the **trending products rail**: pin the section, scroll vertically, products glide
  horizontally past camera. More distinctive than a standard carousel.
- **Section headers as huge stacked two-line type** ("ON / TRACK") — use for section
  dividers ("SHOP / TRENDING", "THE / JACKET") rather than small eyebrow labels.
- **Pinned/locked scroll moments** — the hero section briefly "locks" scroll to let an
  animation resolve (their "tap to lock" / "back to scroll" pattern) before releasing the
  page. Consider this for the jacket reveal: scroll locks for the first full rotation/zoom,
  then releases into normal scroll.
- **Marquee logo strip** — their partner-logo row scrolls infinitely. Could reuse this
  pattern for a "as seen in" / sustainability-badge strip near the footer if relevant.
- **Restraint between the big moments** — the flashy parts are concentrated in a few set
  pieces (hero, reel, section transitions); everything else (nav, footer, copy blocks) is
  quiet and fast. Don't spread motion evenly — spend it where it earns attention.

**What NOT to copy:** their site is built for a person/celebrity brand — big portrait
photography, tabloid-style pacing. WEFT is a product brand; the "portrait" is the jacket
itself. Translate the mechanics, not the content style.

---

## 4. Page structure (draft)

1. **Hero** — 3D jacket centered, WEFT wordmark, scroll-locked intro rotation/reveal
2. **The Jacket** — scroll-driven camera orbit + zoom, callouts on stitching/fabric detail
   as camera approaches specific points on the model
3. **Trending Now** — API-driven product rail, horizontal-scroll-on-vertical-scroll (see §3)
4. **Story / sourcing** — short editorial block on the thrifted/sustainable angle (copy TBD)
5. **Footer** — nav, socials, marquee strip if used

This is a draft ordering, not locked — open to reshuffling once the 3D asset is in hand.

---

## 5. Technical stack (carried over from prior planning)

- **React Three Fiber** + Three.js — 3D scene
- **GSAP + ScrollTrigger** — scroll choreography (pin/lock sections, camera paths)
- **Zustand** — scroll/animation state
- **Vite** — build tooling
- **Tailwind** — UI overlay styling
- Custom GLSL shaders for fabric detail; Drei pre-built materials as fallback
- Post-processing: bloom (this will do a lot of work for the neon feel), subtle DOF,
  color grading toward the cyan/indigo palette
- Deployment: Vercel (auto-deploy from GitHub)
- **Trending Products**: fetched client-side from existing API (endpoint/auth/response
  shape still TBD — needs confirming before that section is built)

---

## 6. Open / unresolved

- [ ] 3D jacket model not yet generated (reference photos in hand, Meshy.ai workflow agreed)
- [ ] API endpoint, auth method, and response schema for trending products — not yet shared
- [ ] Exact typefaces not chosen
- [ ] Full copy (headlines, product story) not written
- [ ] Whether scroll-lock on hero is worth the UX risk on mobile (can feel hijack-y if
      done wrong — Lando's site gets away with it via a very short lock window)
- [ ] Signature element for the page not yet chosen — candidate: the horizontal reel doubling
      as both trending-products AND a garment-detail scrubber, but this needs validation
      once the 3D asset exists

---

## 7. Files provided alongside this brief

- `weft-logo-dark-bg.png`
- `weft-logo-light-bg.png`
- `01-PROJECT-PLAN.pdf`, `02-YOUR-ACTION-ITEMS.pdf`, `03-CLAUDE-DEVELOPMENT-ROADMAP.pdf`
  (earlier planning docs — tech stack and phased build plan, still valid)
