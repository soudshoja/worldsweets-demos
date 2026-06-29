(function() {
  'use strict';

  /**
   * Animate a counter element from 0 to target over duration ms.
   * Uses ease-out quad easing: t * (2 - t)
   */
  function animateCounter(element, target, duration) {
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = progress * (2 - progress);
      element.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target;
        element.setAttribute('data-counted', 'true');
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Initialize stat counter animations triggered by IntersectionObserver.
   * Respects prefers-reduced-motion for accessibility.
   */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');

    if (!counters.length) return;

    // Reduced motion: set values immediately, no animation
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      counters.forEach(function(counter) {
        var target = parseInt(counter.getAttribute('data-target'), 10);
        counter.textContent = target;
        counter.setAttribute('data-counted', 'true');
      });
      return;
    }

    // Standard animation via IntersectionObserver
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;

          // Guard against re-triggering
          if (el.getAttribute('data-counted') === 'true') return;

          var target = parseInt(el.getAttribute('data-target'), 10);
          animateCounter(el, target, 2000);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px'
    });

    counters.forEach(function(counter) {
      observer.observe(counter);
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
