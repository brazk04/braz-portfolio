"use strict";

(() => {
  const galleries = [...document.querySelectorAll('.project-gallery')];
  if (!galleries.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 64rem)');
  const dialog = document.createElement('dialog');
  dialog.className = 'project-lightbox';
  dialog.setAttribute('aria-labelledby', 'lightbox-title');
  dialog.innerHTML = `<div class="lightbox-toolbar"><h2 id="lightbox-title"></h2><button class="lightbox-close" type="button" aria-label="Fechar visualização ampliada" autofocus>×</button></div>
    <div class="lightbox-stage"><img class="lightbox-image" alt="" decoding="async" hidden><p class="lightbox-error" role="status" hidden>Imagem indisponível. Você pode navegar para outra imagem.</p></div>
    <div class="lightbox-navigation"><button class="lightbox-previous" type="button" aria-label="Imagem anterior">←</button><span class="lightbox-counter" aria-live="polite" aria-atomic="true"></span><button class="lightbox-next" type="button" aria-label="Próxima imagem">→</button></div>`;
  document.body.append(dialog);
  const large = dialog.querySelector('.lightbox-image');
  const error = dialog.querySelector('.lightbox-error');
  let active = null, opener = null;
  const states = galleries.map(gallery => {
    const main = gallery.querySelector('.project-main-media');
    const image = main.querySelector('.project-image');
    const thumbs = [...gallery.querySelectorAll('.project-thumbnail')];
    const items = thumbs.map(thumb => ({ src: thumb.getAttribute('href'), alt: thumb.dataset.imageAlt, width: thumb.dataset.width, height: thumb.dataset.height }));
    const state = { gallery, main, image, thumbs, items, index: 0, revision: 0, timer: 0, tiltFrame: 0 };
    thumbs.forEach((thumb, index) => {
      thumb.dataset.imageNumber = String(index + 1);
      const thumbnailImage = thumb.querySelector('img');
      function updateThumbnail() {
        const ok = thumbnailImage.complete && thumbnailImage.naturalWidth > 0;
        thumbnailImage.hidden = !ok;
        thumb.classList.toggle('is-unavailable', !ok);
      }
      thumbnailImage.addEventListener('load', updateThumbnail);
      thumbnailImage.addEventListener('error', updateThumbnail);
      if (thumbnailImage.complete) updateThumbnail();
    });
    function loaded() {
      const ok = image.complete && image.naturalWidth > 0;
      gallery.classList.toggle('is-loaded', ok);
      gallery.classList.toggle('is-unavailable', !ok);
      image.hidden = !ok;
      gallery.classList.remove('is-switching');
    }
    image.addEventListener('load', loaded);
    image.addEventListener('error', loaded);
    if (image.complete) loaded();
    thumbs.forEach((thumb, index) => thumb.addEventListener('click', event => {
      event.preventDefault(); select(state, index);
    }));
    main.addEventListener('click', event => {
      if (!dialog.showModal) return; // Sem suporte a dialog, o link direto continua funcionando.
      event.preventDefault(); active = state; opener = main;
      resetTilt(state); renderLightbox();
      document.body.classList.add('gallery-open');
      dialog.showModal();
    });
    main.addEventListener('pointermove', event => {
      if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
      const rect = main.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      cancelAnimationFrame(state.tiltFrame);
      state.tiltFrame = requestAnimationFrame(() => {
        state.tiltFrame = 0;
        main.style.setProperty('--tilt-x', `${(-y * 3).toFixed(2)}deg`);
        main.style.setProperty('--tilt-y', `${(x * 4).toFixed(2)}deg`);
        main.style.setProperty('--gallery-light-x', `${(x + 1) * 50}%`);
        main.style.setProperty('--gallery-light-y', `${(y + 1) * 50}%`);
      });
    }, { passive: true });
    main.addEventListener('pointerleave', () => resetTilt(state));
    return state;
  });

  function resetTilt(state) {
    cancelAnimationFrame(state.tiltFrame); state.tiltFrame = 0;
    ['--tilt-x', '--tilt-y', '--gallery-light-x', '--gallery-light-y'].forEach(property => state.main.style.removeProperty(property));
  }
  function select(state, index) {
    state.index = (index + state.items.length) % state.items.length;
    const item = state.items[state.index];
    state.thumbs.forEach((thumb, i) => {
      if (i === state.index) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    state.main.href = item.src;
    const revision = ++state.revision;
    clearTimeout(state.timer);
    state.gallery.classList.add('is-switching');
    state.timer = setTimeout(() => {
      if (revision !== state.revision) return;
      state.image.hidden = false;
      state.gallery.classList.remove('is-unavailable');
      state.image.alt = item.alt;
      state.image.width = Number(item.width); state.image.height = Number(item.height);
      state.image.src = item.src;
      if (state.image.complete) state.image.dispatchEvent(new Event(state.image.naturalWidth ? 'load' : 'error'));
    }, reduced.matches ? 0 : 160);
  }
  function renderLightbox() {
    const item = active.items[active.index];
    dialog.querySelector('#lightbox-title').textContent = active.gallery.dataset.projectName;
    dialog.querySelector('.lightbox-counter').textContent = `${active.index + 1} / ${active.items.length}`;
    dialog.querySelectorAll('.lightbox-navigation button').forEach(button => { button.hidden = active.items.length < 2; });
    large.hidden = true; error.hidden = true;
    large.alt = item.alt; large.src = item.src;
    if (large.complete) updateLarge();
  }
  function updateLarge() {
    const ok = large.complete && large.naturalWidth > 0;
    large.hidden = !ok; error.hidden = ok;
  }
  large.addEventListener('load', updateLarge);
  large.addEventListener('error', updateLarge);
  function step(direction) { if (!active) return; select(active, active.index + direction); renderLightbox(); }
  function close() { if (dialog.open) dialog.close(); }
  dialog.querySelector('.lightbox-close').addEventListener('click', close);
  dialog.querySelector('.lightbox-previous').addEventListener('click', () => step(-1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.classList.contains('lightbox-stage')) close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('gallery-open'); active = null; opener?.focus({ preventScroll: true });
  });
  function resetAll() { states.forEach(resetTilt); }
  reduced.addEventListener('change', resetAll);
  fine.addEventListener('change', resetAll);
  window.addEventListener('resize', resetAll, { passive: true });
  window.addEventListener('scroll', resetAll, { passive: true });
  document.addEventListener('visibilitychange', resetAll);
})();
