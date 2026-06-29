(function() {
  'use strict';

  // Constants
  var NAV_HEIGHT_DESKTOP = 64;

  // DOM elements (resolved at init time)
  var nav;
  var heroSection;
  var hamburger;
  var menu;
  var closeBtn;
  var navLinks;
  var sections;

  // =========================================================================
  // Feature 1: Scroll state detection (transparent <-> solid nav)
  // Uses IntersectionObserver on #hero to toggle nav background.
  // =========================================================================
  function initScrollState() {
    if (!heroSection || !nav) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          nav.classList.add('nav--transparent');
          nav.classList.remove('nav--solid');
        } else {
          nav.classList.add('nav--solid');
          nav.classList.remove('nav--transparent');
        }
      });
    }, { threshold: 0, rootMargin: '-100px 0px 0px 0px' });

    observer.observe(heroSection);

    // Handle page refresh when already scrolled past hero (Pitfall 5)
    checkInitialScrollState();
  }

  function checkInitialScrollState() {
    if (!heroSection || !nav) return;
    var heroRect = heroSection.getBoundingClientRect();
    // If hero bottom is above the 100px threshold, nav should be solid
    if (heroRect.bottom <= 100) {
      nav.classList.remove('nav--transparent');
      nav.classList.add('nav--solid');
    }
  }

  // =========================================================================
  // Feature 2: Mobile menu toggle with focus trap
  // =========================================================================
  function initMobileMenu() {
    if (!hamburger || !menu || !closeBtn) return;

    hamburger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);

    // Close menu when clicking nav links inside it
    var menuLinks = menu.querySelectorAll('a[href^="#"]');
    menuLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });
  }

  function openMenu() {
    if (!menu || !hamburger || !closeBtn) return;

    menu.classList.remove('hidden');
    menu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Fade-in animation: set opacity after a frame so transition fires
    requestAnimationFrame(function() {
      menu.classList.add('opacity-100');
      menu.classList.remove('opacity-0');
    });

    // Focus the close button after opening
    closeBtn.focus();

    // Attach focus trap
    menu.addEventListener('keydown', trapFocus);
  }

  function closeMenu() {
    if (!menu || !hamburger) return;

    menu.classList.remove('opacity-100');
    menu.classList.add('opacity-0');
    menu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Remove focus trap
    menu.removeEventListener('keydown', trapFocus);

    // Wait for fade-out transition then hide
    var handleTransitionEnd = function() {
      menu.classList.add('hidden');
      menu.removeEventListener('transitionend', handleTransitionEnd);
    };

    // Check if reduced motion is preferred — if so, hide immediately
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      menu.classList.add('hidden');
    } else {
      menu.addEventListener('transitionend', handleTransitionEnd);
    }

    // Return focus to hamburger
    hamburger.focus();
  }

  function trapFocus(e) {
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }
    if (e.key !== 'Tab') return;

    var focusable = menu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // =========================================================================
  // Feature 3: Smooth scroll for anchor links
  // =========================================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        // Account for fixed nav height
        var navHeight = nav ? nav.offsetHeight : NAV_HEIGHT_DESKTOP;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({ top: targetPosition, behavior: 'smooth' });

        // Close mobile menu if open
        if (menu && !menu.classList.contains('hidden')) {
          closeMenu();
        }
      });
    });
  }

  // =========================================================================
  // Feature 4: Scroll-spy active section tracking
  // =========================================================================
  function initScrollSpy() {
    if (!sections || sections.length === 0 || !navLinks || navLinks.length === 0) return;

    var spyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function(link) {
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('nav-link--active');
            } else {
              link.classList.remove('nav-link--active');
            }
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-64px 0px -50% 0px' });

    sections.forEach(function(section) {
      spyObserver.observe(section);
    });
  }

  // =========================================================================
  // Initialization
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function() {
    // Resolve DOM elements
    nav = document.getElementById('main-nav');
    heroSection = document.getElementById('hero');
    hamburger = document.getElementById('hamburger-btn');
    menu = document.getElementById('mobile-menu');
    closeBtn = document.getElementById('mobile-menu-close');
    navLinks = document.querySelectorAll('[data-nav-link]');
    sections = document.querySelectorAll('main section[id]');

    // Initialize all features
    initScrollState();
    initMobileMenu();
    initSmoothScroll();
    initScrollSpy();
  });

})();
