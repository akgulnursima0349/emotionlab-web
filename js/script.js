/* ==========================================================================
   EmotionLab — Scroll-Driven Demo & UI Interactions
   ========================================================================== */

'use strict';

// ── Helpers ─────────────────────────────────────────────────────────────────

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ── Navbar ───────────────────────────────────────────────────────────────────

(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('navMobileMenu');

  // Scrolled state
  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Mobile toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    // Close on link click
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

// ── Scroll-Driven Demo Engine ─────────────────────────────────────────────────

/**
 * Sets the active step for a demo section.
 * Updates .screen-content, .text-step, and .step-dot elements.
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
  });
}

/**
 * Sets up a scroll-driven demo for a given scroll area element.
 * @param {HTMLElement} scrollAreaEl - The tall scroll area container
 * @param {number}      stepCount    - Number of steps
 * @param {HTMLElement} sectionEl    - The parent section (for setActiveStep)
 */
function setupScrollDemo(scrollAreaEl, stepCount, sectionEl) {
  if (!scrollAreaEl || stepCount < 1) return;

  let currentStep = 0;
  let ticking = false;

  // Set initial active step
  setActiveStep(sectionEl, 0);

  function update() {
    const rect       = scrollAreaEl.getBoundingClientRect();
    const areaHeight = scrollAreaEl.offsetHeight;
    const vh         = window.innerHeight;
    const scrollable = areaHeight - vh;

    if (scrollable <= 0) {
      ticking = false;
      return;
    }

    // progress: 0 when area top is at viewport top, 1 when area bottom at viewport bottom
    const progress = clamp(-rect.top / scrollable, 0, 1);
    const step = Math.min(stepCount - 1, Math.floor(progress * stepCount));

    if (step !== currentStep) {
      currentStep = step;
      setActiveStep(sectionEl, step);
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Also run on resize (layout may shift)
  window.addEventListener('resize', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Initial calculation
  requestAnimationFrame(update);
}

/**
 * For prefers-reduced-motion: show all steps as a static list
 * (removes sticky + scroll-driven behavior, shows steps in sequence)
 */
function setupStaticFallback(sectionEl) {
  const scrollArea = sectionEl.querySelector('.scroll-demo-area');
  if (!scrollArea) return;

  // Remove sticky behavior
  const sticky = scrollArea.querySelector('.scroll-demo-sticky');
  if (sticky) {
    sticky.style.position = 'static';
    sticky.style.height   = 'auto';
  }

  // Make all steps visible
  sectionEl.querySelectorAll('.text-step').forEach(el => {
    el.style.opacity  = '1';
    el.style.transform = 'none';
    el.style.gridColumn = '';
    el.style.gridRow   = '';
    el.style.position  = 'relative';
  });
  sectionEl.querySelectorAll('.screen-content').forEach((el, i) => {
    el.style.opacity   = i === 0 ? '1' : '0';
    el.style.position  = 'absolute';
  });

  // Collapse scroll area height
  scrollArea.style.height = 'auto';

  // Show step 0 by default
  setActiveStep(sectionEl, 0);
}

// ── Initialize Demos ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Section 02 — Tablet Demo (6 steps)
  (function initTabletDemo() {
    const section    = document.getElementById('tablet-demo');
    const scrollArea = document.getElementById('tablet-scroll-area');
    if (!section || !scrollArea) return;

    const stepCount = 6;
    // Height: (stepCount + 1) * 100vh → each step lasts ~1 viewport of scroll
    scrollArea.style.height = `${(stepCount + 1) * 100}vh`;

    if (prefersReducedMotion) {
      setupStaticFallback(section);
    } else {
      setupScrollDemo(scrollArea, stepCount, section);
    }
  })();

  // Section 03 — Phone Demo (4 steps)
  (function initPhoneDemo() {
    const section    = document.getElementById('phone-demo');
    const scrollArea = document.getElementById('phone-scroll-area');
    if (!section || !scrollArea) return;

    const stepCount = 4;
    scrollArea.style.height = `${(stepCount + 1) * 100}vh`;

    if (prefersReducedMotion) {
      setupStaticFallback(section);
    } else {
      setupScrollDemo(scrollArea, stepCount, section);
    }
  })();

  // Section 04 — Teacher Panel (3 steps)
  (function initTeacherDemo() {
    const section    = document.getElementById('browser-demo');
    const scrollArea = document.getElementById('teacher-scroll-area');
    if (!section || !scrollArea) return;

    const stepCount = 3;
    scrollArea.style.height = `${(stepCount + 1) * 100}vh`;

    if (prefersReducedMotion) {
      setupStaticFallback(section);
    } else {
      setupScrollDemo(scrollArea, stepCount, section);
    }
  })();

  // ── Ayakkabı Bağlama — 5-adım stepper ───────────────────────────────────
  (function initLifeskillStepper() {
    const screenContent = document.querySelector('#tablet-demo .screen-content[data-step="5"]');
    if (!screenContent) return;

    const substeps  = Array.from(screenContent.querySelectorAll('.ls-substep'));
    const stepNumEl = screenContent.querySelector('.ls-step-num');
    const progressEl = screenContent.querySelector('.ls-progress');
    const prevBtn   = screenContent.querySelector('.ls-prev');
    const nextBtn   = screenContent.querySelector('.ls-next');
    const total     = substeps.length;
    let current     = 0;

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
