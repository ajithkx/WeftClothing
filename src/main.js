import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { IG, pieces, details, process, reelImages } from './data.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const desktop = () => innerWidth > 900;

$('#year').textContent = new Date().getFullYear();

/* ---------------- render content ---------------- */

const arrow = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const sep = '<span class="tape-sep" aria-hidden="true">/</span>';

$('#rail-track').innerHTML =
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

const pad2 = (n) => String(n).padStart(2, '0');
const tilt = [-7, 5, -3, 8, -5, 3];

$('#deck-stage').innerHTML = details
  .map(
    (d, i) => `
  <figure class="deck-card" style="--r:${tilt[i % tilt.length]}deg; z-index:${details.length - i}">
    <img src="${d.src}" srcset="${d.sm} 600w, ${d.src} 1200w" sizes="(max-width: 900px) 70vw, 34vw" alt="Close-up of the ${d.label.toLowerCase()}" loading="lazy" />
    <figcaption class="deck-tag font-mono" aria-hidden="true">${pad2(i + 1)} / ${d.label}</figcaption>
  </figure>`
  )
  .join('');
$('#deck-ghost').textContent = details[0].label;
$('.deck-of').textContent = `/${pad2(details.length)}`;
$('#rail-count').textContent = `01 / ${pad2(pieces.length)}`;
$('#deck-name').textContent = details[0].label;
$('#deck-sub').textContent = details[0].sub;
if (reduced) $('.deck').classList.add('is-static');


$('#steps').innerHTML = process
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
$$('.tape-track').forEach((track) => {
  const words = tapeWords[track.dataset.dir];
  const group = `<span class="tape-item">${words.map((w) => `<span>${w}</span>${sep}`).join('')}</span>`;
  track.innerHTML = group.repeat(6);
});

/* ---------------- smooth scroll ---------------- */

let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.stop();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu();
    goTo(target);
  })
);

function goTo(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else if (target === 0) window.scrollTo(0, 0);
  else target.scrollIntoView();
}

// Floating buttons: back to top, and skip out of the pinned scroll sections
const toTop = $('#to-top');
const skipBtn = $('#skip-btn');
const setOn = (el, on) => {
  el.classList.toggle('is-on', on);
  el.tabIndex = on ? 0 : -1;
};
let skipTarget = null;
function setSkip(active, sel) {
  if (active) skipTarget = sel;
  else if (skipTarget === sel) skipTarget = null;
  setOn(skipBtn, !!skipTarget);
}
toTop.addEventListener('click', () => goTo(0));
skipBtn.addEventListener('click', () => skipTarget && goTo($(skipTarget)));
const syncTop = () => setOn(toTop, scrollY > innerHeight * 1.2);
addEventListener('scroll', syncTop, { passive: true });
syncTop();

/* ---------------- hero 3D ---------------- */

const canvas = $('#hero-canvas');
const sw = $('.scene-switch');
const params = new URLSearchParams(location.search);
let sceneMode = params.get('hero') || safeGet('weft-hero') || 'reel';
if (!['reel', 'cloth'].includes(sceneMode)) sceneMode = 'reel';
let hero = null;

function safeGet(k) {
  try { return localStorage.getItem(k); } catch { return null; }
}
function safeSet(k, v) {
  try { localStorage.setItem(k, v); } catch { /* private mode */ }
}
function syncSwitch() {
  sw.dataset.active = sceneMode;
  $$('button', sw).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.scene === sceneMode)));
}
syncSwitch();

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function initHero() {
  if (!hasWebGL()) {
    document.documentElement.classList.add('no-webgl');
    $('.hero-fallback').style.backgroundImage = `url(${pieces[0].src})`;
    return;
  }
  const { createHero } = await import('./scene.js');
  hero = createHero(canvas, { images: reelImages, mode: sceneMode, reducedMotion: reduced });

  const panel = $('#hero-panel');
  panel.addEventListener('pointermove', (e) => {
    const r = panel.getBoundingClientRect();
    hero.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  });
  panel.addEventListener('pointerleave', () => hero.setPointer(0, 0));

  ScrollTrigger.create({
    trigger: '#top',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (st) => hero.setScroll(st.progress, st.getVelocity() / 12000),
  });
}

sw.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-scene]');
  if (!b || b.dataset.scene === sceneMode) return;
  sceneMode = b.dataset.scene;
  safeSet('weft-hero', sceneMode);
  syncSwitch();
  if (!hero) return;
  if (reduced) return hero.setMode(sceneMode);
  gsap.timeline()
    .to(canvas, { opacity: 0, filter: 'blur(12px)', duration: 0.35, ease: 'power2.in' })
    .add(() => hero.setMode(sceneMode))
    .to(canvas, { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out' });
});
sw.addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const next = sceneMode === 'reel' ? 'cloth' : 'reel';
  $(`button[data-scene="${next}"]`, sw).click();
  $(`button[data-scene="${next}"]`, sw).focus();
});

/* ---------------- loader + intro ---------------- */

function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero-title .line > span', { yPercent: 110, skewY: 6, duration: 1.3, stagger: 0.1 })
    .from('.reveal-fade', { opacity: 0, y: 16, duration: 1, stagger: 0.08 }, '-=0.9')
    .from('.notch', { yPercent: 100, duration: 1 }, '-=1')
    .from('.nav-bar', { y: -30, opacity: 0, duration: 1 }, '-=1');
  return tl;
}

function runLoader() {
  const loader = $('#loader');
  const done = () => {
    document.body.classList.remove('is-loading');
    lenis?.start();
    ScrollTrigger.refresh();
  };
  if (reduced) {
    loader.remove();
    done();
    return;
  }
  const count = { v: 0 };
  const out = $('#loader-count');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.loader-mark', { opacity: 1, duration: 0.6 })
    .fromTo('.loader-mark', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power3.inOut' }, 0)
    .to('.loader-thread span', { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0.1)
    .to(count, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => (out.textContent = String(Math.round(count.v)).padStart(3, '0')) }, 0.1)
    .to(loader, { clipPath: 'ellipse(150% 0% at 50% 0%)', duration: 1.1, ease: 'expo.inOut' }, '+=0.15')
    .add(() => {
      intro();
      done();
    }, '-=0.55')
    .add(() => loader.remove());
}

/* ---------------- scroll choreography ---------------- */

function choreography() {
  if (reduced) return;

  // Tapes: velocity-reactive marquee
  $$('.tape-track').forEach((track) => {
    const dir = Number(track.dataset.dir);
    const w = track.scrollWidth / 6;
    const x = gsap.quickSetter(track, 'x', 'px');
    let pos = dir > 0 ? -w : 0;
    let boost = 0;
    ScrollTrigger.create({ trigger: '.tapes', start: 'top bottom', end: 'bottom top', onUpdate: (st) => (boost = st.getVelocity() / 300) });
    gsap.ticker.add((_, dt) => {
      boost *= 0.92;
      pos += dir * (0.06 * dt + Math.abs(boost) * dt * 0.02);
      if (pos > 0) pos -= w;
      if (pos < -w) pos += w;
      x(pos);
    });
  });

  // Overlap word + cards parallax
  gsap.utils.toArray('[data-speed]').forEach((el) => {
    gsap.to(el, {
      yPercent: -100 * Number(el.dataset.speed),
      ease: 'none',
      scrollTrigger: { trigger: '.overlap', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  gsap.from('.ocard', {
    y: 380, rotation: (i) => [-38, 24, 42][i], opacity: 0, duration: 1.4, ease: 'back.out(1.3)', stagger: 0.14,
    scrollTrigger: { trigger: '.overlap-cards', start: 'top 92%' },
  });
  gsap.from('.overlap-word span', {
    xPercent: -12, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '.overlap', start: 'top bottom', end: 'top 30%', scrub: true },
  });

  // Big titles: rise in
  $$('.stack-title, .overlap-copy .display, .drop-copy .display').forEach((el) => {
    gsap.from(el, {
      y: 80, opacity: 0, skewY: 4, duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // Rail cards rise in as a fanned stack
  gsap.from('.pc', {
    y: 200, rotation: (i) => 10 + i * 3, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: '.rail-viewport', start: 'top 85%' },
  });

  // Steps
  gsap.from('.step', {
    y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: '.steps', start: 'top 80%' },
  });

  // Drop: panel scales out of a curve, photos float in
  gsap.fromTo('.drop', { clipPath: 'inset(8% 6% 0% 6% round 160px 160px 32px 32px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 48px 48px 32px 32px)', ease: 'none',
    scrollTrigger: { trigger: '.drop-wrap', start: 'top bottom', end: 'top 25%', scrub: true },
  });
  gsap.from('.drop-photos img', {
    x: -420, y: 220, rotation: -50, opacity: 0, stagger: 0.12, duration: 1.4, ease: 'back.out(1.2)',
    scrollTrigger: { trigger: '.drop', start: 'top 60%' },
  });

  // Footer wordmark letters rise out of the baseline rule
  gsap.from('.fw-letters span', {
    yPercent: 100, stagger: 0.07, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer-word', start: 'top 95%' },
  });

  // Nav hides on scroll down, returns on scroll up
  const nav = $('#nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: () => {
      const y = scrollY;
      if (Math.abs(y - lastY) < 4) return;
      nav.classList.toggle('is-hidden', y > lastY && y > 240 && !menuOpen);
      lastY = y;
    },
  });

  // Rail: vertical scroll drives horizontal track (desktop)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = $('#rail-track');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const bar = $('#rail-bar');
    const count = $('#rail-count');
    const slide = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.rail-pin',
        start: 'top top',
        end: () => '+=' + dist(),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onToggle: (st) => setSkip(st.isActive, '#details'),
        onUpdate: (st) => {
          bar.style.transform = `scaleX(${0.08 + st.progress * 0.92})`;
          const n = Math.min(pieces.length, 1 + Math.floor(st.progress * pieces.length));
          count.textContent = `${String(n).padStart(2, '0')} / ${String(pieces.length).padStart(2, '0')}`;
        },
      },
    });

    // Each card swings open like a door as it slides in from the right
    $$('.pc', track).forEach((pc) => {
      const card = $('.pc-card', pc);
      gsap.fromTo(
        card,
        { '--ey': '-70deg', '--ez': '4deg', '--sc': 0.82 },
        {
          '--ey': '0deg', '--ez': '0deg', '--sc': 1, ease: 'none',
          scrollTrigger: { trigger: pc, containerAnimation: slide, start: 'left 105%', end: 'left 62%', scrub: true },
        }
      );
    });
    return () => setSkip(false, '#details');
  });
  mm.add('(max-width: 900px)', () => {
    const vp = $('.rail-viewport');
    const bar = $('#rail-bar');
    const onScroll = () => {
      const p = vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth);
      bar.style.transform = `scaleX(${0.08 + p * 0.92})`;
      const n = Math.min(pieces.length, 1 + Math.round(p * (pieces.length - 1)));
      $('#rail-count').textContent = `${String(n).padStart(2, '0')} / ${String(pieces.length).padStart(2, '0')}`;
    };
    vp.addEventListener('scroll', onScroll, { passive: true });
    return () => vp.removeEventListener('scroll', onScroll);
  });

  // Up close: pinned deck, each scroll step flicks the top card away
  {
    const cards = $$('.deck-card');
    const n = cards.length;
    const ghost = $('#deck-ghost');
    const iEl = $('#deck-i');
    const nameEl = $('#deck-name');
    const subEl = $('#deck-sub');
    let current = 0;
    const show = (i) => {
      if (i === current) return;
      current = i;
      iEl.textContent = pad2(i + 1);
      nameEl.textContent = details[i].label;
      subEl.textContent = details[i].sub;
      ghost.textContent = details[i].label;
      gsap.fromTo([iEl, nameEl, subEl], { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05 });
      gsap.fromTo(ghost, { xPercent: 8, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out' });
    };

    // cards arrive dealt onto the pile
    // (xPercent/yPercent only, so it never fights the pinned timeline's x/y/rotation/opacity)
    gsap.from(cards, {
      yPercent: 110, xPercent: (i) => (i % 2 ? 24 : -24), duration: 1.3, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: '.deck', start: 'top 70%' },
    });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '.deck-pin',
        start: 'top top',
        end: () => '+=' + innerHeight * 0.75 * (n - 1),
        pin: true,
        anticipatePin: 1,
        // Touch: snapping fights momentum scrolling and makes the pin jitter, so skip it there
        scrub: finePointer ? 0.7 : 0.35,
        snap: finePointer ? { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, ease: 'power2.inOut' } : false,
        invalidateOnRefresh: true,
        onToggle: (st) => setSkip(st.isActive, '#process'),
        onUpdate: (st) => show(Math.min(n - 1, Math.round(st.progress * (n - 1)))),
      },
    });
    cards.forEach((card, i) => {
      if (i === n - 1) return;
      const dir = i % 2 ? 1 : -1;
      tl.to(card, { x: () => dir * innerWidth * 0.75, y: () => -innerHeight * 0.25, rotation: dir * 38, scale: 0.9, opacity: 0, duration: 1 }, i)
        .to(cards[i + 1], { rotation: 0, scale: 1.04, duration: 1 }, i)
        .to(cards.slice(i + 2), { scale: '+=0.02', duration: 1 }, i);
    });

    // deck leans toward the cursor
    if (finePointer) {
      const stage = $('#deck-stage');
      const rx = gsap.quickTo(stage, 'rotationX', { duration: 0.8, ease: 'expo.out' });
      const ry = gsap.quickTo(stage, 'rotationY', { duration: 0.8, ease: 'expo.out' });
      gsap.set(stage, { transformPerspective: 1200 });
      $('.deck').addEventListener('pointermove', (e) => {
        ry((e.clientX / innerWidth - 0.5) * 16);
        rx((0.5 - e.clientY / innerHeight) * 12);
      });
      $('.deck').addEventListener('pointerleave', () => { rx(0); ry(0); });
    }
  }
}

/* ---------------- micro-interactions ---------------- */

function interactions() {
  // Tilt + spotlight on product cards
  if (finePointer && !reduced) {
    $$('.pc').forEach((card) => {
      const inner = $('.pc-card', card);
      card.addEventListener('pointermove', (e) => {
        const r = inner.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', `${(px - 0.5) * 12}deg`);
        card.style.setProperty('--rx', `${(0.5 - py) * 10}deg`);
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });

    // Magnetic pills
    $$('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'expo.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'expo.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', () => {
        xTo(0);
        yTo(0);
      });
    });

    // Process rows: floating image follows the cursor
    const float = $('.step-float');
    const fimg = $('img', float);
    const fx = gsap.quickTo(float, 'x', { duration: 0.6, ease: 'expo.out' });
    const fy = gsap.quickTo(float, 'y', { duration: 0.6, ease: 'expo.out' });
    const fr = gsap.quickTo(float, 'rotate', { duration: 0.8, ease: 'expo.out' });
    // Track the cursor globally and hit-test on scroll too, so the image
    // shows at the cursor when wheel/trackpad scrolling brings a row under it.
    let px = -1, py = -1, lastX = 0, active = null;
    const place = (instant) => {
      if (instant) gsap.set(float, { x: px - 120, y: py - 160 });
      fx(px - 120);
      fy(py - 160);
    };
    const hitTest = () => {
      if (px < 0) return;
      const el = document.elementFromPoint(px, py);
      const row = el && el.closest('.step');
      if (row === active) return;
      const wasOn = !!active;
      active = row;
      if (row) {
        fimg.src = row.dataset.img;
        if (!wasOn) place(true);
        float.classList.add('on');
      } else {
        float.classList.remove('on');
      }
    };
    addEventListener('pointermove', (e) => {
      px = e.clientX;
      py = e.clientY;
      hitTest();
      if (active) {
        place(false);
        fr(Math.max(-12, Math.min(12, (px - lastX) * 0.8)));
      }
      lastX = px;
    }, { passive: true });
    addEventListener('scroll', hitTest, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => {
      px = -1;
      active = null;
      float.classList.remove('on');
    });
  }
}

/* ---------------- mobile menu ---------------- */

const menu = $('#menu');
const menuBtn = $('#menu-btn');
let menuOpen = false;
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Open menu');
  menu.hidden = true;
  lenis?.start();
}
menuBtn.addEventListener('click', () => {
  if (menuOpen) return closeMenu();
  menuOpen = true;
  menu.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
  menuBtn.setAttribute('aria-label', 'Close menu');
  lenis?.stop();
  if (!reduced) gsap.from('#menu nav a', { yPercent: 60, opacity: 0, stagger: 0.05, duration: 0.8, ease: 'expo.out' });
});
addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());

/* ---------------- boot ---------------- */

initHero();
choreography();
interactions();
if (document.fonts?.ready) document.fonts.ready.then(runLoader);
else runLoader();
