"use strict";

(() => {
  const canvas = document.querySelector(".particle-canvas");
  const context = canvas?.getContext("2d", { alpha: true });
  if (!context || canvas.dataset.initialized) return;
  canvas.dataset.initialized = "true";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const hero = document.querySelector(".hero");
  const sections = [...document.querySelectorAll("main > section")];
  const mouse = { x: innerWidth / 2, y: innerHeight / 4, targetX: innerWidth / 2, targetY: innerHeight / 4, active: false };
  const moods = { inicio: 1, sobre: .65, experiencia: .55, stack: .75, projetos: .8, formacao: .6, contato: .9 };
  let particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let brightness = 1;
  let targetBrightness = 1;
  let scrollPosition = scrollY;
  let targetScroll = scrollY;
  let quality = 1;
  let slowFrames = 0;
  let sampleFrames = 0;
  let resizePending = false;

  function particleCount() {
    const [min, max] = width < 640 ? [15, 30] : width < 1024 ? [30, 50] : width < 1600 ? [50, 80] : [70, 110];
    const density = Math.round(width * height / (width < 640 ? 18000 : 20000));
    return Math.max(12, Math.round(Math.max(min, Math.min(max, density)) * quality));
  }

  function createParticles() {
    const count = particleCount();
    particles.length = Math.min(particles.length, count);
    while (particles.length < count) {
      const depth = Math.random();
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        depth, size: .6 + depth * 1.6, speed: .05 + depth * .18,
        angle, phase: Math.random() * Math.PI * 2,
        accent: particles.length % 5 === 0,
        offsetX: 0, offsetY: 0, drawX: 0, drawY: 0,
      });
    }
  }

  function resizeParticles() {
    const oldWidth = width || innerWidth;
    const oldHeight = height || innerHeight;
    width = innerWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles.forEach(p => { p.x *= width / oldWidth; p.y *= height / oldHeight; });
    createParticles();
    resizePending = false;
  }

  function updateSection() {
    targetScroll = scrollY;
    const midpoint = scrollY + height * .4;
    const current = sections.find(section => midpoint >= section.offsetTop && midpoint < section.offsetTop + section.offsetHeight);
    targetBrightness = moods[current?.id] ?? (hero && scrollY < hero.offsetHeight ? 1 : .65);
  }

  function handleMouseMove(event) {
    if (!fine.matches || event.pointerType === "touch" || reduced.matches) return;
    mouse.targetX = event.clientX;
    mouse.targetY = event.clientY;
    mouse.active = true;
  }

  function updateParticles(step) {
    const smoothing = 1 - Math.pow(.92, step);
    mouse.x += (mouse.targetX - mouse.x) * smoothing;
    mouse.y += (mouse.targetY - mouse.y) * smoothing;
    brightness += (targetBrightness - brightness) * smoothing * .4;
    scrollPosition += (targetScroll - scrollPosition) * smoothing;
    const scrollDrift = Math.max(-10, Math.min(10, (scrollPosition - targetScroll) * .04));
    for (const p of particles) {
      const angle = p.angle + Math.sin(elapsed * .00015 + p.phase) * .25;
      const speed = p.speed * step * (fine.matches ? 1 : .65);
      p.x = (p.x + Math.cos(angle) * speed + width + 12) % (width + 12);
      p.y = (p.y + Math.sin(angle) * speed + height + 12) % (height + 12);
      const dx = p.x - 6 - mouse.x;
      const dy = p.y - 6 - mouse.y;
      const distance = Math.hypot(dx, dy);
      const influence = mouse.active && fine.matches ? Math.max(0, 1 - distance / 160) : 0;
      const force = influence * influence * (3 + p.depth * 5);
      const parallaxX = mouse.active && fine.matches ? (mouse.x / width - .5) * p.depth * 3 : 0;
      const parallaxY = mouse.active && fine.matches ? (mouse.y / height - .5) * p.depth * 3 : 0;
      p.offsetX += ((dx / (distance || 1)) * force + parallaxX - p.offsetX) * smoothing;
      p.offsetY += ((dy / (distance || 1)) * force + parallaxY - p.offsetY) * smoothing;
      p.drawX = p.x - 6 + p.offsetX;
      p.drawY = p.y - 6 + p.offsetY + scrollDrift * p.depth;
      p.alpha = Math.min(.6, (.1 + p.depth * .32) * brightness + influence * .12);
    }
  }

  function drawParticles() {
    context.clearRect(0, 0, width, height);
    for (const p of particles) {
      context.globalAlpha = p.alpha;
      context.fillStyle = p.accent ? "#1e40af" : "#fafafa";
      context.beginPath();
      context.arc(p.drawX, p.drawY, p.size, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function animate(time) {
    frame = 0;
    if (document.hidden || reduced.matches) return;
    if (resizePending) { resizeParticles(); updateSection(); }
    const delta = lastTime ? time - lastTime : 16.67;
    lastTime = time;
    elapsed += Math.min(delta, 50);
    updateParticles(Math.min(delta / 16.67, 3));
    drawParticles();
    // Evaluate sustained slow frames, not one long task or a backgrounded tab.
    sampleFrames++;
    if (delta > 28 && delta < 250) slowFrames++;
    if (sampleFrames >= 180) {
      if (slowFrames / sampleFrames > .3 && quality > .45) {
        quality = Math.max(.45, quality * .8);
        createParticles();
      }
      sampleFrames = slowFrames = 0;
    }
    frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    sampleFrames = slowFrames = 0;
    if (reduced.matches) {
      context.clearRect(0, 0, width, height);
      return;
    }
    if (!document.hidden) frame = requestAnimationFrame(animate);
  }

  function initParticles() {
    resizeParticles();
    updateSection();
    addEventListener("resize", () => { resizePending = true; }, { passive: true });
    addEventListener("scroll", updateSection, { passive: true });
    addEventListener("pointermove", handleMouseMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { mouse.active = false; });
    addEventListener("blur", () => { mouse.active = false; });
    fine.addEventListener("change", () => { mouse.active = false; resizePending = true; });
    reduced.addEventListener("change", syncAnimation);
    document.addEventListener("visibilitychange", syncAnimation);
    syncAnimation();
  }

  initParticles();
})();
