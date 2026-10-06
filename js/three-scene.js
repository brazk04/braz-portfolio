// Three.js r170, importado apenas quando o hero visível comporta WebGL.
const hero = document.querySelector('.hero');
const host = document.querySelector('.data-core');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 48rem)');
const pointer = matchMedia('(hover: hover) and (pointer: fine)');
let visible = false, loading = false, sceneController = null;

// Tilt limitado aos previews, conquista e assinatura; nenhum listener em cards genéricos.
const tilted = [...document.querySelectorAll('.project-preview:not(.project-gallery), .education-highlight, .contact-signature')];
let tiltFrame = 0, tiltTarget = null, tiltX = 0, tiltY = 0;
function resetTilt() {
  cancelAnimationFrame(tiltFrame); tiltFrame = 0; tiltTarget = null;
  tilted.forEach(element => { element.style.removeProperty('--tilt-x'); element.style.removeProperty('--tilt-y'); });
}
tilted.forEach(element => {
  element.addEventListener('pointermove', event => {
    if (motion.matches || !pointer.matches || event.pointerType === 'touch') return;
    const rect = element.getBoundingClientRect();
    const limit = element.matches('.education-highlight') ? 2 : element.matches('.contact-signature') ? .8 : element.matches('.featured-preview') ? 4 : 3;
    tiltTarget = element;
    tiltX = -(Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))) * limit;
    tiltY = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)) * limit;
    if (!tiltFrame) tiltFrame = requestAnimationFrame(() => {
      tiltFrame = 0;
      tiltTarget?.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
      tiltTarget?.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    });
  }, { passive: true });
  element.addEventListener('pointerleave', resetTilt);
});

async function sync() {
  if (!desktop.matches) { sceneController?.dispose(); sceneController = null; return; }
  if (!visible || document.hidden) { sceneController?.pause(); return; }
  if (sceneController) { sceneController.resume(); return; }
  if (loading) return;
  loading = true;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (!gl) return;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js');
    if (!desktop.matches || !visible || document.hidden) return;
    sceneController = createScene(THREE);
    sceneController.resume();
  } catch {
    // Sem WebGL ou rede, o fallback CSS permanece visível.
    host.classList.remove('is-ready');
  } finally { loading = false; }
}

function createScene(T) {
  const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 8) <= 4 || innerWidth < 1024;
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: !weak, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  let dpr = Math.min(devicePixelRatio || 1, weak ? 1 : 1.5);
  renderer.setPixelRatio(dpr);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, .1, 40);
  camera.position.z = 6.5;
  const rig = new T.Group(), core = new T.Group();
  scene.add(rig); rig.add(core);
  rig.rotation.set(.18, -.25, -.15);
  const materials = [], geometries = [];
  function add(geometry, material, type = T.Mesh, parent = core) {
    geometries.push(geometry); materials.push({ material, opacity: material.opacity });
    const object = new type(geometry, material); parent.add(object); return object;
  }
  add(new T.IcosahedronGeometry(.62, 0), new T.MeshBasicMaterial({ color: '#1e3a8a', transparent: true, opacity: .09, depthWrite: false }));
  const inner = add(new T.IcosahedronGeometry(.85, 0), new T.MeshBasicMaterial({ color: '#1e40af', wireframe: true, transparent: true, opacity: .32, depthWrite: false }));
  const shell = new T.IcosahedronGeometry(1.25, 1);
  add(new T.WireframeGeometry(shell), new T.LineBasicMaterial({ color: '#FAFAFA', transparent: true, opacity: .14, depthWrite: false }), T.LineSegments);
  shell.dispose();
  function cloud(count, radius, color, size, opacity, parent) {
    const positions = [];
    // Distribution de Fibonacci : surface régulière, sans amas aléatoires.
    for (let i = 0; i < count; i++) {
      const y = 1 - 2 * (i + .5) / count, a = i * Math.PI * (3 - Math.sqrt(5));
      const r = Math.sqrt(1 - y * y), spread = radius > 1.5 ? 1 + .16 * Math.sin(i * 7.3) : 1;
      positions.push(Math.cos(a) * r * radius * spread, y * radius * spread, Math.sin(a) * r * radius * spread);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    return add(geometry, new T.PointsMaterial({ color, size, sizeAttenuation: true, transparent: true, opacity, depthWrite: false }), T.Points, parent);
  }
  cloud(weak ? 60 : 110, 1.26, '#FAFAFA', .024, .55, core);
  cloud(weak ? 32 : 60, .91, '#1e40af', .035, .7, core);
  const orbit = cloud(weak ? 50 : 100, 1.8, '#A1A1AA', .022, .38, rig);
  const rings = [];
  for (let i = 0; i < (weak ? 1 : 2); i++) {
    const points = new T.EllipseCurve(0, 0, 1.75 + i * .15, 1.75 + i * .15, 0, Math.PI * 2).getPoints(weak ? 64 : 96);
    const ring = add(new T.BufferGeometry().setFromPoints(points), new T.LineBasicMaterial({ color: i ? '#FAFAFA' : '#1e40af', transparent: true, opacity: i ? .12 : .23, depthWrite: false }), T.LineLoop, rig);
    ring.rotation.set(.9 + i * .7, i * .5, .3); rings.push(ring);
  }
  let frame = 0, last = 0, elapsed = 0, entrance = 0, targetX = 0, targetY = 0, hover = false, speed = 1, lost = false, disposed = false;
  let slow = 0, samples = 0;
  const intro = document.querySelector('.brand-intro');
  function resize() {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    if (motion.matches && visible && !document.hidden) draw(performance.now());
  }
  function pause() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function draw(now) {
    frame = 0;
    if (disposed || lost || document.hidden || !visible || !desktop.matches) return;
    const dt = last ? Math.min((now - last) / 1000, .05) : 0;
    if (last && !motion.matches) {
      samples++; if (now - last > 28) slow++;
      if (samples >= 120) {
        if (slow > 80 && dpr > .8) {
          dpr = Math.max(.8, dpr - .25); renderer.setPixelRatio(dpr);
          orbit.geometry.setDrawRange(0, Math.floor(orbit.geometry.attributes.position.count * .6));
        }
        samples = 0; slow = 0;
      }
    }
    last = now;
    if (!motion.matches) {
      elapsed += dt;
      if (!intro || intro.hidden) entrance = Math.min(1, entrance + dt / .8);
      speed += ((hover ? 1.2 : 1) - speed) * (1 - Math.exp(-3 * dt));
      core.rotation.y += dt * .06 * speed; core.rotation.x += dt * .025;
      inner.rotation.y -= dt * .1; orbit.rotation.y -= dt * .025;
      rings.forEach((ring, i) => { ring.rotation.z += dt * (i ? -.018 : .022); });
      const lerp = 1 - Math.exp(-1.8 * dt);
      rig.rotation.x += (.18 + targetY - rig.rotation.x) * lerp;
      rig.rotation.y += (-.25 + targetX - rig.rotation.y) * lerp;
      rig.position.y = Math.sin(elapsed * .45) * .025;
    } else { entrance = 1; rig.rotation.set(.18, -.25, -.15); rig.position.y = 0; }
    const rect = hero.getBoundingClientRect();
    const exit = motion.matches ? 0 : Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * .75)));
    const enter = 1 - Math.pow(1 - entrance, 3);
    rig.scale.setScalar((.6 + .4 * enter) * (1 - exit * .2) * (motion.matches ? 1 : 1 + Math.sin(elapsed * .65) * .0075));
    materials.forEach(({ material, opacity }) => { material.opacity = opacity * enter * (1 - exit); });
    renderer.render(scene, camera);
    if (!motion.matches) frame = requestAnimationFrame(draw);
  }
  function resume() { if (!frame && !lost && !disposed) { last = 0; frame = requestAnimationFrame(draw); } }
  function mouse(event) {
    if (motion.matches || !pointer.matches || !visible || event.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)) * .13;
    targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)) * .1;
    hover = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }
  function resetMouse() { targetX = targetY = 0; hover = false; }
  function contextLost(event) { event.preventDefault(); lost = true; pause(); host.classList.remove('is-ready'); }
  function contextRestored() { lost = false; host.classList.add('is-ready'); sync(); }
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
  window.addEventListener('pointermove', mouse, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetMouse);
  const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(host);
  host.append(renderer.domElement); resize(); host.classList.add('is-ready');
  return { pause, resume, dispose() {
    disposed = true; pause(); sizeObserver.disconnect();
    window.removeEventListener('pointermove', mouse);
    document.documentElement.removeEventListener('pointerleave', resetMouse);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(({ material }) => material.dispose());
    renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); host.classList.remove('is-ready');
  } };
}

if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(hero);
} else { visible = true; sync(); }
desktop.addEventListener('change', sync);
motion.addEventListener('change', () => { resetTilt(); sceneController?.pause(); sync(); });
pointer.addEventListener('change', resetTilt);
window.addEventListener('resize', resetTilt, { passive: true });
window.addEventListener('scroll', resetTilt, { passive: true });
document.addEventListener('visibilitychange', () => { resetTilt(); sync(); });
window.addEventListener('pagehide', () => { sceneController?.dispose(); sceneController = null; });
window.addEventListener('pageshow', sync);
