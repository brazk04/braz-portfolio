"use strict";

const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
const mobile = window.matchMedia("(max-width: 63.99rem)");
document.documentElement.classList.add("menu-enhanced");
toggle.hidden = false;

function setMenu(open, restoreFocus = false) {
  const expanded = open && mobile.matches;
  header.classList.toggle("menu-open", expanded);
  document.body.classList.toggle("menu-locked", expanded);
  toggle.setAttribute("aria-expanded", String(expanded));
  toggle.setAttribute("aria-label", expanded ? "Fechar menu de navegação" : "Abrir menu de navegação");
  nav.inert = mobile.matches && !expanded;
  if (restoreFocus) toggle.focus();
}
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  setMenu(false);
  const href = link.getAttribute("href");
  if (href.startsWith("#")) document.querySelector(href)?.focus({ preventScroll: true });
});
document.addEventListener("keydown", (event) => {
  if (toggle.getAttribute("aria-expanded") !== "true") return;
  if (event.key === "Escape") setMenu(false, true);
  if (event.key !== "Tab") return;
  const last = [...nav.querySelectorAll("a[href]")].at(-1);
  if (event.shiftKey && document.activeElement === toggle) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); toggle.focus(); }
});
header.addEventListener("focusout", (event) => { if (!header.contains(event.relatedTarget)) setMenu(false); });
mobile.addEventListener("change", () => setMenu(false));
setMenu(false);
function updateHeader() { header.classList.toggle("is-scrolled", window.scrollY > 16); }
updateHeader();

// Screenshots locais: o fallback permanece até a imagem carregar corretamente.
document.querySelectorAll(".project-preview:not(.project-gallery) .project-image[src]").forEach((image) => {
  const preview = image.closest(".project-preview");
  function updatePreview() {
    const loaded = image.complete && image.naturalWidth > 0;
    preview.classList.toggle("is-loaded", loaded);
    image.setAttribute("aria-hidden", String(!loaded));
  }
  image.addEventListener("load", updatePreview);
  image.addEventListener("error", updatePreview);
  updatePreview();
});

// Melhoria progressiva: sem suporte ou com movimento reduzido, o texto fica visível.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll(".section-header h2").forEach((heading) => {
  const inner = document.createElement("span");
  inner.className = "title-reveal-inner";
  inner.append(...heading.childNodes);
  heading.append(inner);
});
document.querySelectorAll(".stack-technologies, .education-column").forEach((group) => {
  group.querySelectorAll("li, .education-item").forEach((item, index) => item.style.setProperty("--item-index", Math.min(index, 3)));
});
document.querySelectorAll(".stack-row, .project-row").forEach((element, index) => element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 3) * 60}ms`));
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  document.documentElement.classList.add("reveal-enabled");
  // Trocar a preferência durante a sessão também revela todo o conteúdo.
  reducedMotion.addEventListener("change", (event) => {
    if (!event.matches) return;
    document.documentElement.classList.remove("reveal-enabled");
    observer.disconnect();
  });
}

// Indicador de navegação independente de movimento e de animações de entrada.
if ("IntersectionObserver" in window) {
  const sections = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("section-active"); });
    if (!current) return;
    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.hash === `#${current.target.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
  document.querySelectorAll("main > section").forEach((section) => sections.observe(section));
}

// Um único frame agrega mouse, scroll e interpolação; fica ocioso ao estabilizar.
(() => {
  const root = document.documentElement;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 64rem)");
  const intro = document.querySelector(".brand-intro");
  const role = document.querySelector(".hero-role");
  const roleText = role.textContent;
  const hero = document.querySelector(".hero");
  const signature = document.querySelector(".contact-signature");
  const buttons = [...document.querySelectorAll(".hero-actions .button, .contact-email")];
  let frame = 0, scrambleFrame = 0, activeTarget = null, hoverPreview = null;
  let mouseX = innerWidth * .5, mouseY = innerHeight * .25, lightX = mouseX, lightY = mouseY;
  let previewX = mouseX, previewY = mouseY;
  const pointerEffects = () => finePointer.matches && !reducedMotion.matches;

  function dismissIntro() { intro.hidden = true; }
  let firstVisit = false;
  try { firstVisit = !sessionStorage.getItem("braz:intro"); sessionStorage.setItem("braz:intro", "1"); } catch { firstVisit = true; }
  if (firstVisit && !reducedMotion.matches && !location.hash) {
    root.style.setProperty("--hero-delay", "250ms");
    intro.hidden = false;
    setTimeout(dismissIntro, 1400);
    document.addEventListener("pointerdown", dismissIntro, { once: true });
    document.addEventListener("keydown", dismissIntro, { once: true });
    const started = performance.now();
    let lastScramble = 0;
    function scramble(time) {
      if (reducedMotion.matches || document.hidden || time - started >= 480) { role.textContent = roleText; return; }
      if (time - lastScramble > 45) {
        const settled = Math.floor((time - started) / 480 * roleText.length);
        role.textContent = [...roleText].map((letter, index) => index < settled || letter === " " ? letter : "01/._"[Math.floor(Math.random() * 5)]).join("");
        lastScramble = time;
      }
      scrambleFrame = requestAnimationFrame(scramble);
    }
    scrambleFrame = requestAnimationFrame(scramble);
  }

  function resetTarget() {
    if (!activeTarget) return;
    ["--magnet-x", "--magnet-y", "--image-x", "--image-y", "--image-scale", "--button-x", "--button-y", "--panel-x", "--panel-y"].forEach((property) => activeTarget.style.removeProperty(property));
    activeTarget = null;
  }
  function hidePreview() { if (hoverPreview) hoverPreview.hidden = true; }
  function queueFrame() { if (!frame && !document.hidden) frame = requestAnimationFrame(render); }
  function render() {
    frame = 0;
    updateHeader();
    const distance = root.scrollHeight - innerHeight;
    root.style.setProperty("--scroll-progress", distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0);
    if (!pointerEffects()) return;
    const dx = mouseX - lightX, dy = mouseY - lightY;
    lightX += dx * .085; lightY += dy * .085;
    root.style.setProperty("--mouse-x", `${lightX.toFixed(1)}px`);
    root.style.setProperty("--mouse-y", `${lightY.toFixed(1)}px`);
    root.style.setProperty("--hero-drift", `${Math.min(22, scrollY * .025).toFixed(1)}px`);
    const signatureRect = signature.getBoundingClientRect();
    if (signatureRect.top < innerHeight && signatureRect.bottom > 0) root.style.setProperty("--signature-drift", `${Math.max(-18, Math.min(18, (signatureRect.top - innerHeight * .6) * .03)).toFixed(1)}px`);
    if (activeTarget) {
      const rect = activeTarget.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (mouseX - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (mouseY - rect.top) / rect.height * 2 - 1));
      if (activeTarget.matches(".button")) {
        activeTarget.style.setProperty("--magnet-x", `${(x * 4).toFixed(1)}px`);
        activeTarget.style.setProperty("--magnet-y", `${(y * 4).toFixed(1)}px`);
        activeTarget.style.setProperty("--button-x", `${((x + 1) * 50).toFixed(1)}%`);
        activeTarget.style.setProperty("--button-y", `${((y + 1) * 50).toFixed(1)}%`);
      } else if (activeTarget.matches(".project-preview.is-loaded")) {
        activeTarget.style.setProperty("--image-x", `${(x * 4).toFixed(1)}px`);
        activeTarget.style.setProperty("--image-y", `${(y * 4).toFixed(1)}px`);
        activeTarget.style.setProperty("--image-scale", "1.015");
      } else {
        activeTarget.style.setProperty("--panel-x", `${((x + 1) * 50).toFixed(1)}%`);
        activeTarget.style.setProperty("--panel-y", `${((y + 1) * 50).toFixed(1)}%`);
      }
    }
    let previewMoving = false;
    if (hoverPreview && !hoverPreview.hidden) {
      const tx = Math.max(12, Math.min(innerWidth - hoverPreview.offsetWidth - 12, mouseX + 24));
      const ty = Math.max(12, Math.min(innerHeight - hoverPreview.offsetHeight - 12, mouseY + 20));
      previewX += (tx - previewX) * .18; previewY += (ty - previewY) * .18;
      hoverPreview.style.transform = `translate(${previewX.toFixed(1)}px, ${previewY.toFixed(1)}px)`;
      previewMoving = Math.abs(tx - previewX) + Math.abs(ty - previewY) > .5;
    }
    if (Math.abs(dx) + Math.abs(dy) > .5 || previewMoving) queueFrame();
  }
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" || !pointerEffects()) return;
    mouseX = event.clientX; mouseY = event.clientY;
    queueFrame();
  }, { passive: true });
  [...buttons, ...document.querySelectorAll(".project-preview:not(.project-gallery), .education-highlight")].forEach((element) => {
    element.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch" || !pointerEffects()) return;
      resetTarget(); activeTarget = element; queueFrame();
    });
    element.addEventListener("pointerleave", () => { resetTarget(); queueFrame(); });
  });
  document.querySelectorAll(".project-row:not(:has(.project-gallery))").forEach((row) => {
    const title = row.querySelector("h3"), image = row.querySelector(".project-image");
    title.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch" || !pointerEffects() || !image.getAttribute("src") || !image.complete || !image.naturalWidth) return;
      if (!hoverPreview) { hoverPreview = document.createElement("div"); hoverPreview.className = "floating-preview"; hoverPreview.setAttribute("aria-hidden", "true"); document.body.append(hoverPreview); }
      const clone = image.cloneNode(); clone.className = ""; clone.alt = "";
      hoverPreview.replaceChildren(clone); hoverPreview.hidden = false;
      previewX = mouseX; previewY = mouseY; queueFrame();
    });
    title.addEventListener("pointerleave", hidePreview);
  });
  function syncMotion() {
    root.classList.toggle("motion-ready", !reducedMotion.matches);
    if (!pointerEffects()) {
      resetTarget(); hidePreview();
      ["--mouse-x", "--mouse-y", "--hero-drift", "--signature-drift"].forEach((property) => root.style.removeProperty(property));
    }
    if (reducedMotion.matches) { dismissIntro(); cancelAnimationFrame(scrambleFrame); role.textContent = roleText; }
    queueFrame();
  }
  finePointer.addEventListener("change", syncMotion);
  reducedMotion.addEventListener("change", syncMotion);
  window.addEventListener("scroll", () => { hidePreview(); queueFrame(); }, { passive: true });
  window.addEventListener("resize", () => { resetTarget(); hidePreview(); queueFrame(); }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; cancelAnimationFrame(scrambleFrame); role.textContent = roleText; dismissIntro(); resetTarget(); hidePreview(); }
    else queueFrame();
  });
  let clicks = 0, lastClick = 0;
  document.querySelector(".site-header .brand > span").addEventListener("click", (event) => {
    const now = performance.now(); clicks = now - lastClick < 500 ? clicks + 1 : 1; lastClick = now;
    if (clicks < 5 || reducedMotion.matches) return;
    event.preventDefault(); clicks = 0;
    hero.classList.remove("brand-egg"); requestAnimationFrame(() => hero.classList.add("brand-egg"));
    setTimeout(() => hero.classList.remove("brand-egg"), 650);
  });
  syncMotion();
})();
