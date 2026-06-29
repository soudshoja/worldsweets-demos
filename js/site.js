/* ============================================================
   World Sweets — js/site.js
   Shared interactivity module for every page in the 6-page site.
   Written as a single framework-free IIFE; every element lookup is
   null-guarded so spoke pages that omit certain sections never throw.
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    // =============================================
    // 1. Mobile nav overlay
    // =============================================
    var navToggle  = document.getElementById('nav-toggle');
    var mmClose    = document.getElementById('mm-close');
    var mobileMenu = document.getElementById('mobile-menu');

    function openMenu() {
      if (!mobileMenu || !navToggle) return;
      mobileMenu.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      if (!mobileMenu || !navToggle) return;
      mobileMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    if (navToggle)    navToggle.addEventListener('click', openMenu);
    if (mmClose)      mmClose.addEventListener('click', closeMenu);

    if (mobileMenu) {
      mobileMenu.querySelectorAll('.mm-link, .btn').forEach(function (el) {
        el.addEventListener('click', closeMenu);
      });
    }

    // =============================================
    // 2. Reveal observer (scroll-fade-up)
    // =============================================
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealIO.observe(el);
    });

    // =============================================
    // 3. 3-D credential-stack pointer parallax
    //    Desktop only (> 920 px) and not reduced-motion.
    // =============================================
    var stack = document.getElementById('stack');
    if (stack && !reduce && window.innerWidth > 920) {
      window.addEventListener('pointermove', function (e) {
        var x = (e.clientX / window.innerWidth)  - 0.5;
        var y = (e.clientY / window.innerHeight) - 0.5;
        stack.style.transform =
          'rotateY(' + (-16 + x * 8) + 'deg) rotateX(' + (6 - y * 8) + 'deg)';
      });
    }

    // =============================================
    // 4. Brand marquee — duplicate children for seamless CSS loop
    //    CSS animates translateX(-50%), so the set must be ×2.
    // =============================================
    var marquee = document.getElementById('brand-marquee');
    if (marquee) {
      var originalItems = Array.from(marquee.children);
      originalItems.forEach(function (child) {
        marquee.appendChild(child.cloneNode(true));
      });
    }

    // =============================================
    // 5. WhatsApp float pulse on load
    //    CSS .pulse runs wa-pulse 1.6 s × 2 = 3.2 s; remove after 3.4 s.
    // =============================================
    var whatsappFloat = document.getElementById('whatsapp-float');
    if (whatsappFloat) {
      whatsappFloat.classList.add('pulse');
      setTimeout(function () {
        whatsappFloat.classList.remove('pulse');
      }, 3400);
    }

    // =============================================
    // 6. Sticky mobile app bar (≤ 900 px via CSS)
    //    IntersectionObserver on #hero: hero not intersecting → show bar.
    //    When bar is shown, lift WhatsApp float so they don't overlap.
    // =============================================
    var appBar = document.getElementById('app-bar');
    var hero   = document.getElementById('hero');

    if (appBar && hero) {
      var barIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            appBar.classList.add('show');
            if (whatsappFloat) whatsappFloat.style.insetBlockEnd = '5rem';
          } else {
            appBar.classList.remove('show');
            if (whatsappFloat) whatsappFloat.style.insetBlockEnd = '';
          }
        });
      }, { threshold: 0 });
      barIO.observe(hero);
    }

    // =============================================
    // 7. 5-stage escalating app-download popup
    // =============================================
    var appPopup        = document.getElementById('app-popup');
    var appPopupClose   = document.getElementById('app-popup-close');
    var appPopupBackdrop = appPopup
      ? appPopup.querySelector('[data-dismiss="app-popup"]') : null;
    var appPopupContent = appPopup
      ? appPopup.querySelector('.app-popup-content') : null;
    var appPopupTitle   = document.getElementById('app-popup-title');
    var appPopupDesc    = document.getElementById('app-popup-desc');

    /* Stage copy — port VERBATIM from js/main.js lines 96–102 */
    var appPopupStages = [
      {
        title: 'Shop easier on our app!',
        desc:  'Browse 1,000+ products, get exclusive offers, and enjoy fast delivery across Kuwait.'
      },
      {
        title: "Don't miss exclusive app deals!",
        desc:  "Our app users get early access to special promotions and discounts you won't find anywhere else."
      },
      {
        title: 'Join thousands of sweet lovers on our app!',
        desc:  'Over 10,000 happy customers order their favorite treats through our app every month.'
      },
      {
        title: 'Last chance! Download now for special offers',
        desc:  "Limited-time app-only deals are waiting for you. Don't let them slip away!"
      },
      {
        title: 'Your sweets are waiting!',
        desc:  "One tap away from Kuwait's finest confectionery collection. Download now and start exploring."
      }
    ];

    var appPopupCurrentStage       = 0;
    var appPopupTimers             = [];
    var appPopupCancelledForSession = sessionStorage.getItem('app-popup-cancelled')    === '1';
    var appPopupAllDismissed        = sessionStorage.getItem('app-popup-all-dismissed') === '1';

    function showAppPopup() {
      if (appPopupCancelledForSession || appPopupAllDismissed) return;
      if (!appPopup || appPopupCurrentStage >= appPopupStages.length) return;

      var stage = appPopupStages[appPopupCurrentStage];
      if (appPopupTitle) appPopupTitle.textContent = stage.title;
      if (appPopupDesc)  appPopupDesc.textContent  = stage.desc;

      appPopup.classList.remove('hidden');

      /* Slide-up animation — skipped under reduced-motion */
      if (appPopupContent && !reduce) {
        appPopupContent.style.transform  = 'translateY(100%)';
        appPopupContent.style.opacity    = '0';
        appPopupContent.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            appPopupContent.style.transform = '';
            appPopupContent.style.opacity   = '1';
          });
        });
      }
    }

    function dismissAppPopup() {
      if (!appPopup) return;

      if (appPopupContent && !reduce) {
        appPopupContent.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
        appPopupContent.style.transform  = 'translateY(100%)';
        appPopupContent.style.opacity    = '0';
        setTimeout(function () {
          appPopup.classList.add('hidden');
          appPopupContent.style.transform = '';
          appPopupContent.style.opacity   = '';
        }, 200);
      } else {
        appPopup.classList.add('hidden');
      }

      appPopupCurrentStage++;

      if (appPopupCurrentStage >= appPopupStages.length) {
        /* All 5 stages dismissed — stop for this session */
        sessionStorage.setItem('app-popup-all-dismissed', '1');
        appPopupAllDismissed = true;
      } else {
        /* Schedule next stage 15 s after this dismiss */
        var nextTimer = setTimeout(showAppPopup, 15000);
        appPopupTimers.push(nextTimer);
      }
    }

    function cancelAllAppPopups() {
      /* User clicked a store link — cancel all future popups */
      appPopupCancelledForSession = true;
      sessionStorage.setItem('app-popup-cancelled', '1');
      appPopupTimers.forEach(function (t) { clearTimeout(t); });
      appPopupTimers = [];
      if (appPopup) appPopup.classList.add('hidden');
    }

    if (appPopupClose)   appPopupClose.addEventListener('click', dismissAppPopup);
    if (appPopupBackdrop) appPopupBackdrop.addEventListener('click', dismissAppPopup);

    if (appPopup) {
      appPopup.querySelectorAll('.app-store-link').forEach(function (link) {
        link.addEventListener('click', cancelAllAppPopups);
      });
    }

    /* First popup fires after 5 s (if not already cancelled/exhausted) */
    if (!appPopupCancelledForSession && !appPopupAllDismissed) {
      var firstTimer = setTimeout(showAppPopup, 5000);
      appPopupTimers.push(firstTimer);
    }

    // =============================================
    // 8. Follow-us popup
    //    Trigger: 30 s timer OR scroll past 50 % of page height.
    //    Do not show while app popup is visible.
    //    NOTE: backdrop [data-dismiss="follow-popup"] is wired here
    //    (main.js omitted this handler — corrected in site.js).
    // =============================================
    var followPopup        = document.getElementById('follow-popup');
    var followPopupClose   = document.getElementById('follow-popup-close');
    var followPopupBackdrop = followPopup
      ? followPopup.querySelector('[data-dismiss="follow-popup"]') : null;
    var followPopupShown     = false;
    var followPopupDismissed = sessionStorage.getItem('follow-popup-dismissed') === '1';

    function showFollowPopup() {
      if (followPopupShown || followPopupDismissed) return;
      if (!followPopup) return;
      /* Don't interrupt the app popup */
      if (appPopup && !appPopup.classList.contains('hidden')) return;

      followPopupShown = true;
      followPopup.classList.remove('hidden');

      /* Slide-in animation on .follow-card (not .bg-white — does not exist here) */
      var card = followPopup.querySelector('.follow-card');
      if (card && !reduce) {
        card.style.transform  = window.innerWidth >= 768
          ? 'translateX(100%)' : 'translateY(100%)';
        card.style.opacity    = '0';
        card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            card.style.transform = 'translate(0)';
            card.style.opacity   = '1';
          });
        });
      }
    }

    function dismissFollowPopup() {
      if (!followPopup) return;
      followPopup.classList.add('hidden');
      sessionStorage.setItem('follow-popup-dismissed', '1');
      followPopupDismissed = true;
    }

    if (followPopupClose)   followPopupClose.addEventListener('click', dismissFollowPopup);
    if (followPopupBackdrop) followPopupBackdrop.addEventListener('click', dismissFollowPopup);

    /* 30-second timer trigger */
    if (!followPopupDismissed) {
      setTimeout(showFollowPopup, 30000);
    }

    /* 50%-scroll trigger — listener removed after first fire */
    function checkScrollForFollow() {
      var scrollPercent =
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.5 && !followPopupShown && !followPopupDismissed) {
        showFollowPopup();
        window.removeEventListener('scroll', checkScrollForFollow);
      }
    }

    if (!followPopupDismissed) {
      window.addEventListener('scroll', checkScrollForFollow, { passive: true });
    }

    // =============================================
    // 9. Escape key — dismiss whichever popup is open
    // =============================================
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (appPopup    && !appPopup.classList.contains('hidden'))    dismissAppPopup();
        if (followPopup && !followPopup.classList.contains('hidden')) dismissFollowPopup();
      }
    });

  }); /* end DOMContentLoaded */
})();
