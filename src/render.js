// Markup builders shared by main.js (client) and the Vite prerender plugin (build/dev),
// so the no-JS HTML and the enhanced page come from one source of truth.
import { IG, pieces, details, process } from './data.js';

const arrow = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const sep = '<span class="tape-sep" aria-hidden="true">/</span>';

export const pad2 = (n) => String(n).padStart(2, '0');
const tilt = [-7, 5, -3, 8, -5, 3];

export const railHTML = () =>
  pieces
    .map(
      (p) => `
  <article class="pc">
    <div class="pc-card">
      <img src="${p.src}" srcset="${p.sm} 600w, ${p.src} 1200w" sizes="(max-width: 900px) 76vw, 360px" alt="${p.name}, ${p.note.toLowerCase()} ${p.type.toLowerCase()} laid flat" loading="lazy" />
      <div class="pc-tags">
        <span class="chip ${p.hot ? 'chip-red' : ''}">1 of 1</span>
      </div>
      <a class="pc-cta" href="${IG}" target="_blank" rel="noopener" aria-label="DM to claim the ${p.name}">
        DM to claim <span class="knob">${arrow}</span>
      </a>
    </div>
    <div class="pc-info">
      <div><div class="pc-name">${p.name}</div><div class="pc-sub">${p.note}</div></div>
      <span class="pc-price">DM for price</span>
    </div>
  </article>`
    )
    .join('') +
  `
  <article class="pc pc-end">
    <a class="pc-card" href="${IG}" target="_blank" rel="noopener">
      <span class="chip self-start">@shopweft</span>
      <span class="display">More on<br/>the gram.</span>
      <span class="pill pill-black self-start">Open Instagram ${arrow}</span>
    </a>
  </article>`;

export const deckHTML = () =>
  details
    .map(
      (d, i) => `
  <figure class="deck-card" style="--r:${tilt[i % tilt.length]}deg; z-index:${details.length - i}">
    <img src="${d.src}" srcset="${d.sm} 600w, ${d.src} 1200w" sizes="(max-width: 900px) 70vw, 34vw" alt="Close-up of the ${d.label.toLowerCase()}" loading="lazy" />
    <figcaption class="deck-tag font-mono" aria-hidden="true">${pad2(i + 1)} / ${d.label}</figcaption>
  </figure>`
    )
    .join('');

export const stepsHTML = () =>
  process
    .map(
      (s) => `
  <li class="step" data-img="${s.sm}">
    <img class="step-img" src="${s.sm}" alt="" loading="lazy" />
    <span class="step-word">${s.word}</span>
    <p>${s.text}</p>
  </li>`
    )
    .join('');

const tapeWords = {
  1: ['One of one', 'No restocks', 'DM to cop', 'Archive 01 live'],
  '-1': ['Thrifted', 'Cleaned', 'Graded', 'Reworn', '90s sportswear'],
};

// Six copies for the seamless loop; only the first is exposed to assistive tech.
export const tapeHTML = (dir) => {
  const body = tapeWords[dir].map((w) => `<span>${w}</span>${sep}`).join('');
  return Array.from({ length: 6 }, (_, i) => `<span class="tape-item"${i ? ' aria-hidden="true"' : ''}>${body}</span>`).join('');
};
