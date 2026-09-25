# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + Tailwind CSS v4 + Three.js, with GSAP (ScrollTrigger) and Lenis for scroll choreography. Chosen by the user over plain static HTML. Builds to `dist/` with a relative base so it can be hosted anywhere static.

## Users

Gen Z shoppers (roughly 16–26) who hunt vintage and thrifted streetwear, mostly on their phones, discovering the brand through Instagram. They want a one-of-one piece nobody else at the party has, and they decide fast.

## Product Purpose

WEFT Clothing sells thrifted vintage jackets — mostly 90s/00s sportswear track tops, shells and windbreakers (Macron, Legea, Sun Mountain, Italia team pieces). The landing page makes the archive feel desirable and sends people to Instagram to claim a piece.

## Positioning

Every piece is one of one: found, cleaned, graded and put back into rotation. No restocks, no duplicates. "Weft" is the thread woven across the warp — the brand is the thread running through your closet.

## Operating Context

- There is no store backend or checkout. All purchase intent goes to Instagram DM: https://www.instagram.com/shopweft
- Products are photographed as flat-lays on a white/cream floor, plus close-up detail shots of tags, zips and embroidery.
- Drops happen in small "archives" (Archive 01 is current).

## Capabilities and Constraints

- No cart, no prices, no sizes published on the site yet — price/size is "DM for details".
- No 3D jacket model exists yet (Meshy.ai workflow planned). Hero 3D is built from real photos and a procedural fabric scene; the user is comparing both.
- Trending-products API is not available yet; the product rail is static data in code.
- Undecided: next drop date, contact email, shipping/returns policy, TikTok handle.

## Brand Commitments

- Name: WEFT Clothing.
- Logo: knockout wordmark filled with hand-drawn blue/teal line-art (`images/logo/weft-logo-dark-bg.png`, `weft-logo-light-bg.png`). The fill pattern is a usable motif.
- User-pinned direction: dark theme, blue and red accents, a little neon (not overdone), 3D and animated, built for Gen Z. References: a bold dark streetwear e-commerce layout (huge condensed caps, ticker strip, category cards, stickers) and a streetwear landing with heavy italic display type, organic curved cutouts and red pill CTAs.

## Evidence on Hand

- 20 product photos in `public/img/1.webp` to `20.webp` (flat-lays and detail close-ups), each with a 600w `-sm` version.
- Logo source files in `images/logo/`; the site uses copies in `public/img/`.
- No testimonials, reviews, stats, press or customer counts. Do not fabricate them.

## Product Principles

- One of one is the whole story — scarcity is real, never faked with timers or fake counters.
- The jacket is the hero; the interface stays out of its way outside the set-piece moments.
- Every "buy" path ends in a human conversation on Instagram.
- Fast on a phone on mobile data, even with the 3D.

## Accessibility & Inclusion

Respect `prefers-reduced-motion` (static hero, no scroll hijack). Keyboard-reachable controls, visible focus, WCAG AA text contrast.
