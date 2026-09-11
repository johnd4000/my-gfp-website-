/* ==========================================================================
   Partners in Planning — site behaviour
   No dependencies. Progressive enhancement: everything degrades gracefully
   if JavaScript is unavailable.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Header: solid background once scrolled off the hero --------------- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Mobile navigation -------------------------------------------------- */
  var toggle = document.querySelector('.nav__toggle');
  var drawer = document.querySelector('.mobile-nav');

  if (toggle && drawer) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      // Keep the drawer out of the tab order while closed
      drawer.setAttribute('aria-hidden', String(!open));
    };

    setNav(false);

    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close on link activation and on Escape
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* --- "Our Services" dropdown -------------------------------------------
     The chevron button opens and closes the submenu for keyboard, touch and
     screen-reader users (hover alone is handled in CSS). It closes on Escape,
     when focus leaves the menu, on a click elsewhere, and after choosing an
     item — which matters on the Services page itself, where the items are
     same-page jumps and the page never reloads to close it.
     ---------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-subnav]'), function (item) {
    var btn = item.querySelector('.nav__sub-toggle');
    if (!btn) return;

    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
    };

    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && item.classList.contains('is-open')) {
        setOpen(false);
        btn.focus();
      }
    });

    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!item.contains(e.target)) setOpen(false);
    });

    Array.prototype.forEach.call(item.querySelectorAll('.nav__sub a'), function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  });

  /* --- Scroll reveal ------------------------------------------------------ */
  var revealTargets = document.querySelectorAll('.reveal, .reveal-group');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    // Show everything immediately — motion here is decorative only
    Array.prototype.forEach.call(revealTargets, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);   // reveal once, then stop watching
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    Array.prototype.forEach.call(revealTargets, function (el) {
      observer.observe(el);
    });
  }

  /* --- Hero slideshow -----------------------------------------------------
     The images are already in the markup, so this only decides which one
     carries .is-active. If this script never runs, slide 1 stays visible and
     the hero is a normal static photograph — nothing is stranded blank.

     Auto-advance is suppressed entirely under reduced motion, and the pause
     control is only shown while slides are genuinely advancing (WCAG 2.2.2).
     ---------------------------------------------------------------------- */
  (function heroSlides() {
    var stage  = document.querySelector('[data-hero-slides]');
    var toggle = document.querySelector('[data-slides-toggle]');
    if (!stage) return;

    var slides = Array.prototype.slice.call(stage.querySelectorAll('.hero__slide'));
    if (slides.length < 2) return;          // nothing to advance through

    var HOLD = 7000;                        // ms each photograph is held
    var index = 0;
    var timer = null;
    var userPaused = false;                 // an explicit choice we must respect

    var setToggleState = function (paused) {
      if (!toggle) return;
      toggle.classList.toggle('is-paused', paused);
      // This label is the button's accessible name, so it names the next action
      var label = paused ? 'Play slideshow' : 'Pause slideshow';
      toggle.querySelector('.video-toggle__text').textContent = label;
      toggle.setAttribute('aria-label', label);
    };

    var render = function () {
      for (var i = 0; i < slides.length; i++) {
        slides[i].classList.toggle('is-active', i === index);
      }
    };

    var halt = function () {
      if (timer) { clearInterval(timer); timer = null; }
    };

    var play = function () {
      // Never move for someone who asked for reduced motion, and never
      // override a visitor who deliberately pressed pause.
      if (reduceMotion || userPaused || timer) return;
      timer = setInterval(function () {
        index = (index + 1) % slides.length;
        render();
      }, HOLD);
    };

    render();

    if (reduceMotion) {
      // A single still photograph. Nothing is moving, so a pause button
      // would be a control for nothing — leave it hidden.
      return;
    }

    play();
    if (toggle) { toggle.hidden = false; setToggleState(false); }

    if (toggle) {
      toggle.addEventListener('click', function () {
        userPaused = !userPaused;
        if (userPaused) { halt(); } else { play(); }
        setToggleState(userPaused);
      });
    }

    /* Stop the timer when the hero is off-screen or the tab is in the
       background, so it never burns cycles, and so returning to the page
       does not drop the visitor halfway through a crossfade. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { halt(); } else { play(); }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { play(); } else { halt(); }
      }, { threshold: 0.15 }).observe(stage);
    }

    /* Swipe to change photograph on touch devices. Purely a convenience —
       there is no content here that a visitor needs to reach. */
    var startX = null;
    stage.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });

    stage.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) {
        index = (index + (dx < 0 ? 1 : -1) + slides.length) % slides.length;
        render();
        if (!userPaused) { halt(); play(); }   // restart the dwell from now
      }
      startX = null;
    }, { passive: true });
  })();

  /* --- Contact form validation -------------------------------------------
     Inline, accessible validation: errors appear beside the field they
     belong to, focus moves to the first problem, and the live region
     announces the result.
     ---------------------------------------------------------------------- */
  var form = document.querySelector('[data-validate]');
  if (!form) return;

  var status = form.querySelector('.form__status');

  var showError = function (input, message) {
    var field = input.closest('.field');
    if (!field) return;
    var slot = field.querySelector('.field__error');
    field.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    if (slot) slot.textContent = message;
  };

  var clearError = function (input) {
    var field = input.closest('.field');
    if (!field) return;
    var slot = field.querySelector('.field__error');
    field.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    if (slot) slot.textContent = '';
  };

  var validate = function (input) {
    var value = (input.value || '').trim();

    if (input.hasAttribute('required') && !value) {
      showError(input, (input.dataset.label || 'This field') + ' is required.');
      return false;
    }
    if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      showError(input, 'Enter a valid email address, e.g. name@example.com.');
      return false;
    }
    if (input.type === 'tel' && value && !/^[0-9+()\s-]{8,}$/.test(value)) {
      showError(input, 'Enter a valid contact number.');
      return false;
    }
    clearError(input);
    return true;
  };

  var inputs = form.querySelectorAll('input, select, textarea');

  // Validate on blur, but only clear errors while typing (never scold mid-entry)
  Array.prototype.forEach.call(inputs, function (input) {
    input.addEventListener('blur', function () { validate(input); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('has-error')) validate(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstBad = null;
    Array.prototype.forEach.call(inputs, function (input) {
      if (!validate(input) && !firstBad) firstBad = input;
    });

    if (firstBad) {
      firstBad.focus();
      if (status) {
        status.hidden = false;
        status.textContent = 'Please correct the highlighted fields and try again.';
      }
      return;
    }

    /* -------------------------------------------------------------------
       NO BACKEND CONNECTED YET.
       This form does not send anywhere. To make it live, either:
         a) point action="" at a form service (Formspree, Netlify Forms,
            Basin) and delete this handler's success branch, or
         b) wire it to your own endpoint via fetch().
       Do not go live without this — enquiries would be silently lost.
       ------------------------------------------------------------------- */
    if (status) {
      status.hidden = false;
      status.textContent =
        'Form validated. No delivery endpoint is connected yet — see README.md before publishing.';
    }
  });
})();
