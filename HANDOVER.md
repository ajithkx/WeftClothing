# Handover

State of the WEFT Clothing landing page as of 2026-09-25. Everything below is committed and pushed to `master`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Where things live

| File | What |
|---|---|
| `index.html` | All page markup, in section order |
| `src/data.js` | Products (rail), Up close details, process steps, reel images, Instagram URL |
| `src/main.js` | Rendering from data, Lenis smooth scroll, GSAP scroll choreography, interactions |
| `src/scene.js` | Three.js hero: `Reel` (photo ring) and `Cloth` (shader fabric) |
| `src/style.css` | Tailwind `@theme` tokens and all component styles |
| `public/img/` | Webp photos (`n.webp` 1200w, `n-sm.webp` 600w), logos, favicon |
| `DESIGN.md` | Design system (colours, type, components, motion) |
| `PRODUCT.md` | Product truth and constraints |

## Page order

Loader, nav, 3D hero (Reel/Cloth switch), crossing tapes, overlap cards, product rail (`#archive`, pinned horizontal on desktop), Up close deck (`#details`, pinned card flick), How it drops (`#process`), Instagram drop panel (`#drop`), footer.

## Recent changes (latest first)

- Up close on touch: no scroll snap, lighter scrub, cheaper shadows; deal-in animation uses xPercent/yPercent so it never fights the pinned timeline.
- How it drops: the floating hover image follows the cursor even when rows scroll under a still mouse.
- Floating back-to-top button (after the hero), and a Skip button shown only while the rail or deck is pinned.
- Footer: giant outlined "WEFT" text wordmark (rises in on scroll, fills on hover) replaces the blurry logo image.
- Nav logo is plain text. Reel/Cloth switch made smaller.
- Splash logo is now `public/img/weft-mark.webp` (1260x338, about 20 kB, flattened onto `#07080b`), made from the earlier 3x PNG rebuild of `images/logo/weft-logo-dark-bg.png`. Icons: `public/favicon-32.png` and `public/apple-touch-icon.png` (180x180), cut from the old 500px `favicon.png`.
- Old `images/*.jpg` and old logo/favicon removed (still in git history).

## Open items

- Confirm the Up close deck feels smooth on a real phone. If it still jitters, try `ScrollTrigger.normalizeScroll(true)` on touch only (watch for conflicts with Lenis).
- Splash logo is only as sharp as the 1024px source allows. A larger original logo file would fix it properly.
- Loader still uses the image logo; footer and nav are text.
- Unknowns from PRODUCT.md: next drop date, contact email, shipping/returns, TikTok handle.

## Rules the owner set

- Copy: no em dashes, middle dots, sparkle glyphs, pulsing "live" dots or invented SKU codes. Don't describe pieces as old or worn-condition. Instagram is @shopweft; every buy path is an Instagram DM.
- Only change the section asked for.
- Respect `prefers-reduced-motion` (static fallbacks exist everywhere).

## Gotchas

- GSAP reads CSS `translate`/`rotate` and gets confused by `transition-delay` on elements it tweens. Keep CSS transitions off properties GSAP animates.
- If the dev page suddenly shows a serif font, Tailwind HMR got stuck: restart `npm run dev`.
- On Windows PowerShell 5.1, don't round-trip files with `Get-Content`/`Set-Content` (breaks UTF-8).
