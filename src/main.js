import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { pieces, details, reelImages } from './data.js';
import { pad2, railHTML, deckHTML, stepsHTML, tapeHTML } from './render.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const desktop = () => innerWidth > 900;

$('#year').textContent = new Date().getFullYear();

/* ---------------- render content ---------------- */

// Rail, deck, steps and tapes are pre-rendered into index.html at build time (vite.config.js),
// so crawlers and no-JS visitors see them. Only fill any that are still empty (e.g. a stripped page).
const fill = (el, html) => { if (!el.firstElementChild) el.innerHTML = html; };
fill($('#rail-track'), railHTML());
fill($('#deck-stage'), deckHTML());
fill($('#steps'), stepsHTML());
$$('.tape-track').forEach((track) => fill(track, tapeHTML(track.dataset.dir)));

$('#deck-ghost').textContent = details[0].label;
$('.deck-of').textContent = `/${pad2(details.length)}`;
$('#rail-count').textContent = `01 / ${pad2(pieces.length)}`;
$('#deck-name').textContent = details[0].label;
$('#deck-sub').textContent = details[0].sub;
if (reduced) $('.deck').classList.add('is-static');

/* ---------------- smooth scroll ---------------- */

let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.stop();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
// Loader failsafe in index.html fires this if boot stalls or throws, so wheel scroll is not left blocked.
addEventListener('weft:unlock', () => lenis?.start());

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
  $$('button', sw).forEach((b) => {
    const on = b.dataset.scene === sceneMode;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1; // roving tabindex: only the checked radio is a tab stop
  });
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

// Data saver or a 2G link: skip the 3D scene (143 kB gzip + reel textures) and show the photo
const conn = navigator.connection;
const constrained = !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));

// Phones: keep Three.js off the critical path. Wait for the page's own assets,
// then for the canvas to be on screen, then for an idle moment.
function heroReady() {
  if (desktop()) return Promise.resolve(false);
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
  return loaded
    .then(() => new Promise((r) => {
      const io = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) { io.disconnect(); r(); }
      }, { rootMargin: '200px 0px' });
      io.observe(canvas);
    }))
    .then(() => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 1200 }) : setTimeout(r, 200))))
    .then(() => true);
}

function showHeroFallback() {
  document.documentElement.classList.add('no-webgl');
  $('.hero-fallback').style.backgroundImage = `url(${desktop() ? pieces[0].src : pieces[0].sm})`;
}

async function initHero() {
  if (!hasWebGL() || constrained) return showHeroFallback();
  try {
    const deferred = await heroReady();
    // Phones: show the photo while the scene chunk loads, then cross-fade to the canvas
    if (deferred) showHeroFallback();
    const { createHero } = await import('./scene.js');
    hero = createHero(canvas, { images: reelImages, mode: sceneMode, reducedMotion: reduced });
    if (deferred) {
      const fb = $('.hero-fallback');
      const finish = () => document.documentElement.classList.remove('no-webgl');
      if (reduced) finish();
      else {
        gsap.from(canvas, { opacity: 0, duration: 0.9, ease: 'power2.out' });
        gsap.to(fb, { opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: () => { finish(); gsap.set(fb, { clearProps: 'opacity' }); } });
      }
    }
  } catch (err) {
    // Scene chunk blocked or WebGL init failed: fall back to the photo
    console.warn('Hero scene failed, using photo fallback', err);
    hero = null;
    showHeroFallback();
    return;
  }

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
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
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
  let seen = false;
  try {
    seen = sessionStorage.getItem('weft-loaded') === '1';
    sessionStorage.setItem('weft-loaded', '1');
  } catch { /* private mode */ }
  if (seen) {
    // Repeat visit this session: skip the full sequence, just fade out and run the intro
    gsap.timeline()
      .to(loader, { opacity: 0, duration: 0.4, ease: 'power1.out' })
      .add(() => {
        intro();
        done();
      }, '-=0.25')
      .add(() => loader.remove());
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

// Rail progress from native horizontal scroll (phones, and reduced motion at any width)
function railScrollSync() {
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
}

// Phones: a thread draws down the step list as you scroll; each step's knot lights at the reading line
function stepThread() {
  const list = $('#steps');
  if (!list) return;
  gsap.matchMedia().add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    list.classList.add('is-live');
    $$('.step', list).forEach((step) => {
      const line = $('.step-line', step);
      const node = $('.step-node', step);
      const img = $('.step-img', step);
      // the tip of the drawn thread sits exactly on the reading line (55% of the viewport); offsetTop ignores the intro's y offset
      gsap.fromTo(line, { scaleY: 0 }, {
        scaleY: 1, ease: 'none', transformOrigin: 'top center',
        scrollTrigger: { trigger: list, start: () => `top+=${step.offsetTop} 55%`, end: () => `top+=${step.offsetTop + step.offsetHeight} 55%`, scrub: true, refreshPriority: -1 },
      });
      const tag = gsap.timeline({ paused: true })
        .fromTo(img, { rotation: -9, scale: 0.94, opacity: 0.45, transformOrigin: '0% 0%' },
          { rotation: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'elastic.out(1, 0.45)' }, 0)
        .fromTo(node, { scale: 0.7 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 0);
      const pull = gsap.fromTo(line, { scaleX: 1 }, { scaleX: 2.4, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out', paused: true });
      ScrollTrigger.create({
        trigger: list, start: () => `top+=${step.offsetTop + 30} 55%`, end: 'max', refreshPriority: -1,
        onToggle: (self) => {
          step.classList.toggle('is-lit', self.isActive);
          if (self.isActive) { tag.play(); pull.restart(); } else tag.reverse();
        },
      });
    });
    return () => list.classList.remove('is-live');
  });
}

function choreography() {
  if (reduced) {
    railScrollSync();
    return;
  }

  // Tapes: velocity-reactive marquee
  $$('.tape-track').forEach((track) => {
    const dir = Number(track.dataset.dir);
    // Wrap distance: re-measured once webfonts swap in and on resize
    let w = track.scrollWidth / 6;
    const x = gsap.quickSetter(track, 'x', 'px');
    let pos = dir > 0 ? -w : 0;
    let boost = 0;
    const measure = () => {
      w = track.scrollWidth / 6;
      pos = Math.max(-w, Math.min(0, pos));
    };
    document.fonts?.ready.then(measure);
    addEventListener('resize', measure);
    ScrollTrigger.create({ trigger: '.tapes', start: 'top bottom', end: 'bottom top', onUpdate: (st) => (boost = st.getVelocity() / 300) });
    const tick = (_, dt) => {
      boost *= 0.92;
      pos += dir * (0.06 * dt + Math.abs(boost) * dt * 0.02);
      if (pos > 0) pos -= w;
      if (pos < -w) pos += w;
      x(pos);
    };
    x(pos);
    // Only tick while this tape is on screen
    new IntersectionObserver(([e]) => (e.isIntersecting ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)), { rootMargin: '100px 0px' }).observe(track.parentElement);
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
  stepThread();

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
    track.style.willChange = 'transform';
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

    // Keyboard: focusing a card scrolls the page to the point where the pin shows it centred
    const vp = $('.rail-viewport');
    const onFocus = (e) => {
      const pc = e.target.closest('.pc');
      const st = slide.scrollTrigger;
      if (!pc || !st) return;
      vp.scrollLeft = 0; // never let an implicit scroll-into-view offset the track
      const d = dist();
      if (!d) return;
      const x = Math.min(d, Math.max(0, pc.offsetLeft - track.offsetLeft + pc.offsetWidth / 2 - innerWidth / 2));
      const y = st.start + (st.end - st.start) * (x / d);
      if (lenis) lenis.scrollTo(y, { duration: 0.6 });
      else window.scrollTo(0, y);
    };
    track.addEventListener('focusin', onFocus);
    return () => {
      track.removeEventListener('focusin', onFocus);
      track.style.willChange = '';
      setSkip(false, '#details');
    };
  });
  mm.add('(max-width: 900px)', railScrollSync);

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
        onToggle: (st) => {
          setSkip(st.isActive, '#process');
          // Phones: promote the cards only while the flick is running
          if (!desktop()) cards.forEach((c) => (c.style.willChange = st.isActive ? 'transform, opacity' : ''));
        },
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
      // will-change only while the pill is being pulled (and until it settles back)
      let settle = null;
      el.addEventListener('pointerenter', () => {
        settle?.kill();
        el.style.willChange = 'transform';
      });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', () => {
        xTo(0);
        yTo(0);
        settle = gsap.delayedCall(0.7, () => (el.style.willChange = ''));
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
      // Only hit-test near the process rows; elsewhere just drop the float if it was showing
      if (active || e.target.closest?.('.steps, .step-float')) hitTest();
      if (active) {
        place(false);
        fr(Math.max(-12, Math.min(12, (px - lastX) * 0.8)));
      }
      lastX = px;
    }, { passive: true });
    // Scroll: at most one hit-test (layout read) per frame
    let hitQueued = false;
    addEventListener('scroll', () => {
      if (hitQueued || px < 0) return;
      hitQueued = true;
      requestAnimationFrame(() => {
        hitQueued = false;
        hitTest();
      });
    }, { passive: true });
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
const menuClose = $('#menu-close');
let menuOpen = false;
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Open menu');
  menu.hidden = true;
  setBehindMenuInert(false);
  lenis?.start();
  menuBtn.focus();
}
// While the menu is open, everything behind the overlay is inert (header trigger included);
// only the menu's own close button and links are reachable; Tab cycles those.
function setBehindMenuInert(on) {
  $$('.skip, #main, .footer, #skip-btn, #to-top, .nav-logo, .nav-bar .pill, #menu-btn').forEach((el) => (el.inert = on));
}
menuClose.addEventListener('click', closeMenu);
menuBtn.addEventListener('click', () => {
  if (menuOpen) return closeMenu();
  menuOpen = true;
  menu.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
  menuBtn.setAttribute('aria-label', 'Close menu');
  setBehindMenuInert(true);
  menuClose.focus();
  lenis?.stop();
  // fromTo with explicit end values: a plain from() reopened mid-tween reads the half-faded state as its target and leaves links invisible.
  if (!reduced) gsap.fromTo('#menu nav a', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: 'expo.out', overwrite: true });
});
addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
addEventListener('keydown', (e) => {
  if (!menuOpen || e.key !== 'Tab') return;
  const ring = [menuClose, ...$$('#menu a')];
  const i = ring.indexOf(document.activeElement);
  const next = ring[(i + (e.shiftKey ? -1 : 1) + ring.length) % ring.length];
  e.preventDefault();
  next.focus();
});

/* ---------------- boot ---------------- */

initHero();
choreography();
interactions();
// Don't hold the loader hostage to slow fonts: start after 1s regardless
if (document.fonts?.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]).then(runLoader);
else runLoader();
