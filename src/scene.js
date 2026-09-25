import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const BLUE = new THREE.Color('#3d7bff');
const CYAN = new THREE.Color('#4fd6e8');
const RED = new THREE.Color('#ff2e4d');

/**
 * Hero WebGL scene with two switchable worlds:
 *  - "reel":  real jacket photos on a curved ring, a blue + red thread weaving through it
 *  - "cloth": a procedural woven fabric sheet with track-jacket piping, lit by the cursor
 */
export function createHero(canvas, { images, mode = 'reel', reducedMotion = false }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x07080b, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07080b, 9, 22);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 0, 11);

  const small = () => canvas.clientWidth < 768;
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.9, 0.5, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const pointer = new THREE.Vector2(0, 0); // smoothed, -1..1
  const pointerTarget = new THREE.Vector2(0, 0);
  let scroll = 0; // 0..1 through the hero
  let velocity = 0;
  let world = null;
  let running = false;
  let visible = true;
  let raf = 0;
  const clock = new THREE.Clock();
  let time = 0;

  const loader = new THREE.TextureLoader();
  const textures = images.map((src) => {
    const t = loader.load(src, () => reducedMotion && renderOnce());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    world?.layout?.(w, h);
    if (!running) renderOnce();
  }

  function setMode(next) {
    if (world) {
      scene.remove(world.group);
      world.dispose();
    }
    world = next === 'cloth' ? buildCloth() : buildReel(textures);
    scene.add(world.group);
    world.layout(canvas.clientWidth, canvas.clientHeight);
    renderOnce();
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    time += dt;
    pointer.lerp(pointerTarget, 1 - Math.pow(0.001, dt));
    velocity *= Math.pow(0.02, dt);
    world.update(time, dt, { pointer, scroll, velocity, camera });
    composer.render(dt);
  }

  function renderOnce() {
    if (!world) return;
    world.update(time, 0, { pointer, scroll, velocity, camera });
    composer.render(0);
  }

  function start() {
    if (running || reducedMotion || !visible || document.hidden) return;
    running = true;
    clock.getDelta();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? start() : stop();
  });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);

  setMode(mode);
  resize();
  start();

  return {
    setMode,
    setPointer(x, y) {
      pointerTarget.set(x, y);
      world?.setPointerRay?.(x, y, camera);
    },
    setScroll(p, v = 0) {
      scroll = p;
      velocity = Math.max(-1, Math.min(1, velocity + v));
      if (!running) renderOnce();
    },
    destroy() {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      world?.dispose();
      textures.forEach((t) => t.dispose());
      composer.dispose();
      renderer.dispose();
    },
  };
}

/* ------------------------------------------------------------------ */
/* REEL: bent photo cards on a ring + weaving neon thread              */
/* ------------------------------------------------------------------ */

function buildReel(textures) {
  const group = new THREE.Group();
  const ring = new THREE.Group();
  group.add(ring);

  const R = 4.3;
  const N = textures.length;
  const W = 1.62;
  const H = 2.16; // 3:4, matches the photos

  const geo = new THREE.PlaneGeometry(W, H, 32, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const th = x / R;
    pos.setX(i, R * Math.sin(th));
    pos.setZ(i, R * Math.cos(th) - R);
  }
  geo.computeVertexNormals();

  const cardMats = textures.map(
    (map, i) =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          uMap: { value: map },
          uEdge: { value: i % 3 === 1 ? RED : i % 3 === 2 ? CYAN : BLUE },
          uTime: { value: 0 },
          uFocus: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying float vFog;
          void main(){
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(position,1.0);
            vFog = smoothstep(-9.0, -16.0, mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap; uniform vec3 uEdge; uniform float uTime; uniform float uFocus;
          varying vec2 vUv; varying float vFog;
          float rbox(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
          void main(){
            vec2 p = (vUv-0.5)*vec2(0.75,1.0);
            float d = rbox(p, vec2(0.375,0.5), 0.07);
            if(d > 0.0) discard;
            vec3 img = texture2D(uMap, vUv).rgb;
            if(!gl_FrontFacing){ img = texture2D(uMap, vec2(1.0-vUv.x, vUv.y)).rgb * 0.18 + uEdge*0.04; }
            // pull the white studio floor down so the ring sits in the dark
            img = pow(img, vec3(1.15)) * mix(0.45, 0.86, uFocus);
            float edge = smoothstep(-0.012, 0.0, d);
            float glow = edge * (0.7 + 0.3*sin(uTime*2.0 + vUv.y*6.0));
            vec3 col = mix(img, uEdge*2.2, glow);
            col = mix(col, vec3(0.027,0.031,0.043), vFog*0.85);
            gl_FragColor = vec4(col, 1.0);
          }`,
      })
  );

  const cards = cardMats.map((mat, i) => {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / N) * Math.PI * 2;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = R;
    pivot.add(mesh);
    ring.add(pivot);
    return { pivot, mesh, mat, base: pivot.rotation.y };
  });

  // The weft: two neon threads weaving over/under the ring
  const threads = [
    { color: BLUE, phase: 0, amp: 0.55, radius: R + 0.05 },
    { color: RED, phase: Math.PI, amp: 0.5, radius: R - 0.05 },
  ].map(({ color, phase, amp, radius }) => {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const a = (i / 240) * Math.PI * 2;
      const r = radius + Math.sin(a * N + phase) * 0.35;
      pts.push(new THREE.Vector3(Math.sin(a) * r, Math.sin(a * 3 + phase) * amp - 0.1, Math.cos(a) * r));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 600, 0.014, 6, true),
      new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(2.4), fog: true })
    );
    ring.add(tube);
    return tube;
  });


  let spin = 0;
  const tmp = new THREE.Vector3();

  return {
    group,
    layout(w, h) {
      const wide = w / h > 1.1;
      group.position.set(wide ? 1.9 : 0, wide ? 0.8 : 1.1, 0);
      group.scale.setScalar(wide ? 1 : 0.78);
    },
    update(t, dt, { pointer, scroll, velocity, camera }) {
      spin += dt * (0.12 + Math.abs(velocity) * 1.6);
      ring.rotation.y = spin + scroll * Math.PI * 0.9;
      ring.rotation.x = 0.16 + pointer.y * 0.12;
      ring.rotation.z = -0.1 + pointer.x * 0.06;
      threads[0].rotation.y = Math.sin(t * 0.3) * 0.04;
      threads[1].rotation.y = -Math.sin(t * 0.3) * 0.04;

      camera.position.set(pointer.x * 0.6, pointer.y * 0.35 + scroll * 0.8, 11 - scroll * 3);
      camera.lookAt(group.position.x * 0.55, group.position.y * 0.3, 0);

      for (const card of cards) {
        card.mesh.getWorldPosition(tmp);
        const facing = THREE.MathUtils.smoothstep(tmp.z, 1.5, 4.3);
        card.mat.uniforms.uFocus.value = facing;
        card.mat.uniforms.uTime.value = t;
        card.mesh.position.y = Math.sin(t * 0.8 + card.base * 3) * 0.08;
      }
    },
    dispose() {
      geo.dispose();
      cardMats.forEach((m) => m.dispose());
      threads.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* CLOTH: procedural twill with piping stripes, cursor-lit             */
/* ------------------------------------------------------------------ */

function buildCloth() {
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(16, 10, 220, 140);
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uPress: { value: 0 },
    uBlue: { value: BLUE },
    uRed: { value: RED },
    uCyan: { value: CYAN },
    uLight: { value: new THREE.Vector3(0, 0, 3) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform vec2 uPointer; uniform float uPress;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vH;
      float h(vec2 uv){
        float t = uTime;
        float v = 0.0;
        v += sin(uv.x*5.0 + t*0.55 + sin(uv.y*3.0 + t*0.3)*1.4) * 0.42;
        v += sin(uv.x*11.0 - uv.y*4.0 - t*0.8) * 0.12;
        v += sin(uv.y*7.0 + t*0.4 + uv.x*2.0) * 0.18;
        // drape: fall off toward the bottom edge
        v *= 0.6 + 0.6*uv.y;
        // cursor ripple
        float d = distance(uv*vec2(1.6,1.0), uPointer*vec2(1.6,1.0));
        v += exp(-d*d*28.0) * (0.55 + 0.25*uPress) * sin(d*26.0 - t*4.0) * 0.6;
        v += exp(-d*d*18.0) * 0.45;
        return v;
      }
      void main(){
        vUv = uv;
        vec3 p = position;
        float e = 0.004;
        float c = h(uv);
        float hx = h(uv+vec2(e,0.0));
        float hy = h(uv+vec2(0.0,e));
        p.z += c;
        vH = c;
        vec3 tx = normalize(vec3(16.0*e, 0.0, hx-c));
        vec3 ty = normalize(vec3(0.0, 10.0*e, hy-c));
        vN = normalize(normalMatrix * cross(tx, ty));
        vec4 w = modelMatrix * vec4(p,1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uBlue; uniform vec3 uRed; uniform vec3 uCyan; uniform vec3 uLight; uniform vec2 uPointer;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vH;
      void main(){
        // twill weave
        vec2 q = vUv * vec2(260.0, 160.0);
        vec2 cell = floor(q); vec2 f = fract(q);
        float over = step(0.5, fract((cell.x + cell.y) / 4.0 + 0.001)); // 2/2 twill
        float warp = sin(f.x*3.14159);
        float weft = sin(f.y*3.14159);
        float thread = mix(weft, warp, over);
        vec3 base = mix(vec3(0.028,0.036,0.07), vec3(0.05,0.07,0.14), over);

        // track-jacket piping: blue / white / red bands running across
        float y = vUv.y;
        float band = 0.0; vec3 bandCol = vec3(0.0);
        float b1 = smoothstep(0.004,0.0,abs(y-0.44)-0.014);
        float b2 = smoothstep(0.004,0.0,abs(y-0.485)-0.006);
        float b3 = smoothstep(0.004,0.0,abs(y-0.525)-0.014);
        bandCol = uBlue*b1 + vec3(0.85)*b2 + uRed*b3;
        band = max(max(b1,b2),b3);
        base = mix(base, bandCol*0.55, band);

        vec3 n = normalize(vN);
        if(!gl_FrontFacing) n = -n;
        vec3 V = normalize(cameraPosition - vW);
        vec3 L1 = normalize(uLight - vW);
        vec3 L2 = normalize(vec3(6.0, -3.0, 2.0) - vW);
        vec3 L3 = normalize(vec3(-7.0, 4.0, 1.5) - vW);
        float dif = max(dot(n,L1),0.0);
        // anisotropic-ish sheen along the thread direction
        vec3 Hh = normalize(L1+V);
        float spec = pow(max(dot(n,Hh),0.0), 40.0) * (0.35+0.65*thread);
        float rimR = pow(1.0-max(dot(n,V),0.0), 3.0) * max(dot(n,L2),0.0);
        float rimB = pow(max(dot(n,L3),0.0), 3.0);

        vec3 col = base * (0.25 + 0.9*dif) * (0.55 + 0.45*thread);
        col += uCyan * spec * 0.55;
        col += uRed * rimR * 0.9;
        col += uBlue * rimB * 0.25 * (0.6+0.4*thread);
        col += bandCol * band * (0.25 + 0.55*dif) * (0.6+0.4*thread);
        // fold shadows
        col *= 0.55 + 0.45*smoothstep(-0.8, 0.6, vH);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -0.95;
  mesh.rotation.z = 0.12;
  group.add(mesh);

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const uvTarget = new THREE.Vector2(0.62, 0.55);

  return {
    group,
    layout(w, h) {
      const wide = w / h > 1.1;
      group.position.set(wide ? 0.6 : 0, wide ? -0.2 : 0.4, wide ? 0 : -2.5);
    },
    setPointerRay(x, y, camera) {
      ndc.set(x, y);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(mesh)[0];
      if (hit?.uv) uvTarget.copy(hit.uv);
    },
    update(t, dt, { pointer, scroll, camera }) {
      uniforms.uTime.value = t;
      uniforms.uPointer.value.lerp(uvTarget, 1 - Math.pow(0.02, dt || 1));
      uniforms.uLight.value.set(pointer.x * 6, pointer.y * 4 + 1.5, 3.2);
      mesh.rotation.x = -0.95 + scroll * 0.5;
      camera.position.set(pointer.x * 0.4, 0.4 + pointer.y * 0.25, 11 - scroll * 2.5);
      camera.lookAt(0, 0, 0);
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
