import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { railHTML, deckHTML, stepsHTML, tapeHTML } from './src/render.js';

// Pre-render the JS-built sections into index.html (build and dev) so crawlers and
// no-JS visitors get real content. src/main.js enhances it without re-rendering.
function prerender() {
  return {
    name: 'weft-prerender',
    transformIndexHtml: (html) =>
      html
        .replace(/(<div class="rail-track" id="rail-track">)(<\/div>)/, (_, o, c) => o + railHTML() + c)
        .replace(/(<div class="deck-stage" id="deck-stage">)(<\/div>)/, (_, o, c) => o + deckHTML() + c)
        .replace(/(<ol class="steps" id="steps">)(<\/ol>)/, (_, o, c) => o + stepsHTML() + c)
        .replace(/(<div class="tape-track" data-dir="(-?1)">)(<\/div>)/g, (_, o, dir, c) => o + tapeHTML(dir) + c),
  };
}

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), prerender()],
  build: { chunkSizeWarningLimit: 900 },
});
