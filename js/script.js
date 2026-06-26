/* ==========================================================================
   EmotionLab — Interactive Demo & UI Interactions
   ========================================================================== */

'use strict';

// ── Navbar ───────────────────────────────────────────────────────────────────

(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const toggle     = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('navMobileMenu');

  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }
})();

// ── Interactive Demo Engine ───────────────────────────────────────────────────

/**
 * Toggles is-active on .screen-content, .text-step, .step-dot by index.
 */
function setActiveStep(sectionEl, step) {
  sectionEl.querySelectorAll('.screen-content').forEach((el, i) => {
    el.classList.toggle('is-active', i === step);
  });
  sectionEl.querySelectorAll('.text-step').forEach((el, i) => {
    el.classList.toggle('is-active', i === step);
  });
  sectionEl.querySelectorAll('.step-dot').forEach((el, i) => {
    el.classList.toggle('is-active', i === step);
    el.setAttribute('aria-current', i === step ? 'true' : 'false');
  });
}

/**
 * Sets up click/swipe-driven navigation for a demo section.
 * Handles .demo-prev / .demo-next buttons, clickable .step-dot,
 * and left/right touch swipe on the device screen.
 */
function setupInteractiveDemo(sectionEl, stepCount) {
  if (!sectionEl || stepCount < 1) return;

  let current = 0;

  const prevBtn = sectionEl.querySelector('.demo-prev');
  const nextBtn = sectionEl.querySelector('.demo-next');
  const dots    = sectionEl.querySelectorAll('.step-dot');

  function goTo(step) {
    step = Math.max(0, Math.min(stepCount - 1, step));
    current = step;
    setActiveStep(sectionEl, current);
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === stepCount - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Clickable / keyboard-navigable dots
  dots.forEach((dot, i) => {
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    dot.addEventListener('click', () => goTo(i));
    dot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); }
    });
  });

  // Touch swipe on device screen (left = next, right = prev)
  const deviceScreen = sectionEl.querySelector('.device-screen');
  if (deviceScreen) {
    let startX = 0;
    deviceScreen.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    deviceScreen.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    }, { passive: true });
  }

  goTo(0);
}

// ── Initialize Demos ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  setupInteractiveDemo(document.getElementById('tablet-demo'),  6);
  setupInteractiveDemo(document.getElementById('phone-demo'),   4);
  setupInteractiveDemo(document.getElementById('browser-demo'), 3);

  // ── Ayakkabı Bağlama — 5-adım stepper ───────────────────────────────────
  (function initLifeskillStepper() {
    const screenContent = document.querySelector('#tablet-demo .screen-content[data-step="5"]');
    if (!screenContent) return;

    const substeps   = Array.from(screenContent.querySelectorAll('.ls-substep'));
    const stepNumEl  = screenContent.querySelector('.ls-step-num');
    const progressEl = screenContent.querySelector('.ls-progress');
    const prevBtn    = screenContent.querySelector('.ls-prev');
    const nextBtn    = screenContent.querySelector('.ls-next');
    const total      = substeps.length;
    let current      = 0;

    function render() {
      substeps.forEach((el, i) => el.classList.toggle('is-active', i === current));
      if (stepNumEl)  stepNumEl.textContent  = `Adım ${current + 1} / ${total}`;
      if (progressEl) progressEl.style.width = `${((current + 1) / total) * 100}%`;
      prevBtn.disabled = current === 0;
      const last = current === total - 1;
      nextBtn.textContent = last ? 'Tamamlandı ✓' : 'Sıradaki Adım →';
      nextBtn.disabled    = last;
    }

    prevBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (current > 0) { current--; render(); }
    });
    nextBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (current < total - 1) { current++; render(); }
    });

    render();
  })();

  // ── Dynamic copyright year ───────────────────────────────────────────────
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
