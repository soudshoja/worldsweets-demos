(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    // Footer variant switcher (dev tool - remove before production)
    var switcher = document.getElementById('footer-variant-switcher');
    var footer = document.querySelector('footer[data-footer-variant]');

    if (switcher && footer) {
      var buttons = switcher.querySelectorAll('button[data-variant]');
      buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var variant = this.getAttribute('data-variant');
          var currentVariant = footer.getAttribute('data-footer-variant');

          // Remove current variant class, add new one
          footer.classList.remove('footer--' + currentVariant);
          footer.classList.add('footer--' + variant);
          footer.setAttribute('data-footer-variant', variant);

          // Update active button styling
          buttons.forEach(function(b) { b.classList.remove('ring-2', 'ring-coral'); });
          this.classList.add('ring-2', 'ring-coral');
        });
      });
    }

    // Video play button overlay handler
    document.querySelectorAll('.video-play-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var video = this.parentElement.querySelector('video');
        this.style.display = 'none';
        video.play();
      });
      var video = btn.parentElement.querySelector('video');
      video.addEventListener('play', function() {
        var overlay = this.parentElement.querySelector('.video-play-btn');
        if (overlay) overlay.style.display = 'none';
      });
      video.addEventListener('ended', function() {
        var overlay = this.parentElement.querySelector('.video-play-btn');
        if (overlay) overlay.style.display = '';
      });
    });

    // Respect prefers-reduced-motion for video autoplay
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('video').forEach(function(video) {
        video.removeAttribute('autoplay');
      });
    }

    // WhatsApp button pulse animation on load (per D-38)
    var whatsappBtn = document.getElementById('whatsapp-float');
    if (whatsappBtn) {
      whatsappBtn.classList.add('animate-pulse');
      setTimeout(function() {
        whatsappBtn.classList.remove('animate-pulse');
      }, 3000);
    }

    // =============================================
    // Sticky Mobile App Download Bar
    // =============================================
    var mobileBar = document.getElementById('mobile-app-bar');
    var heroSection = document.getElementById('hero');
    var whatsappFloat = document.getElementById('whatsapp-float');

    if (mobileBar && heroSection) {
      var barObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) {
            mobileBar.classList.remove('hidden');
            if (whatsappFloat) whatsappFloat.style.bottom = '4.5rem';
          } else {
            mobileBar.classList.add('hidden');
            if (whatsappFloat) whatsappFloat.style.bottom = '';
          }
        });
      }, { threshold: 0 });
      barObserver.observe(heroSection);
    }

    // =============================================
    // Escalating App Download Popup (5-stage sequence)
    // =============================================
    var appPopup = document.getElementById('app-popup');
    var appPopupClose = document.getElementById('app-popup-close');
    var appPopupBackdrop = appPopup ? appPopup.querySelector('[data-dismiss="app-popup"]') : null;
    var appPopupContent = appPopup ? appPopup.querySelector('.app-popup-content') : null;
    var appPopupTitle = document.getElementById('app-popup-title');
    var appPopupDesc = document.getElementById('app-popup-desc');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 5 stages of escalating content
    var appPopupStages = [
      { title: 'Shop easier on our app!', desc: 'Browse 1,000+ products, get exclusive offers, and enjoy fast delivery across Kuwait.' },
      { title: "Don't miss exclusive app deals!", desc: 'Our app users get early access to special promotions and discounts you won\'t find anywhere else.' },
      { title: 'Join thousands of sweet lovers on our app!', desc: 'Over 10,000 happy customers order their favorite treats through our app every month.' },
      { title: 'Last chance! Download now for special offers', desc: 'Limited-time app-only deals are waiting for you. Don\'t let them slip away!' },
      { title: 'Your sweets are waiting!', desc: 'One tap away from Kuwait\'s finest confectionery collection. Download now and start exploring.' }
    ];

    var appPopupCurrentStage = 0;
    var appPopupTimers = [];
    var appPopupCancelledForSession = sessionStorage.getItem('app-popup-cancelled') === '1';
    var appPopupAllDismissed = sessionStorage.getItem('app-popup-all-dismissed') === '1';

    function showAppPopup() {
      if (appPopupCancelledForSession || appPopupAllDismissed) return;
      if (!appPopup || appPopupCurrentStage >= appPopupStages.length) return;

      var stage = appPopupStages[appPopupCurrentStage];
      if (appPopupTitle) appPopupTitle.textContent = stage.title;
      if (appPopupDesc) appPopupDesc.textContent = stage.desc;

      appPopup.classList.remove('hidden');

      // Animate slide-up
      if (appPopupContent && !prefersReducedMotion) {
        appPopupContent.style.transform = 'translateY(100%)';
        appPopupContent.style.opacity = '0';
        appPopupContent.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            appPopupContent.style.transform = '';
            appPopupContent.style.opacity = '1';
          });
        });
      }
    }

    function dismissAppPopup() {
      if (!appPopup) return;

      // Animate out
      if (appPopupContent && !prefersReducedMotion) {
        appPopupContent.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
        appPopupContent.style.transform = 'translateY(100%)';
        appPopupContent.style.opacity = '0';
        setTimeout(function() {
          appPopup.classList.add('hidden');
          appPopupContent.style.transform = '';
          appPopupContent.style.opacity = '';
        }, 200);
      } else {
        appPopup.classList.add('hidden');
      }

      appPopupCurrentStage++;

      if (appPopupCurrentStage >= appPopupStages.length) {
        // All 5 dismissed — stop permanently for session
        sessionStorage.setItem('app-popup-all-dismissed', '1');
        appPopupAllDismissed = true;
      } else {
        // Schedule next popup 15 seconds after dismiss
        var nextTimer = setTimeout(showAppPopup, 15000);
        appPopupTimers.push(nextTimer);
      }
    }

    function cancelAllAppPopups() {
      // User clicked a store link — cancel all future popups
      appPopupCancelledForSession = true;
      sessionStorage.setItem('app-popup-cancelled', '1');
      appPopupTimers.forEach(function(t) { clearTimeout(t); });
      appPopupTimers = [];
      if (appPopup) appPopup.classList.add('hidden');
    }

    if (appPopupClose) appPopupClose.addEventListener('click', dismissAppPopup);
    if (appPopupBackdrop) appPopupBackdrop.addEventListener('click', dismissAppPopup);

    // Cancel all popups when user clicks any store link inside the popup
    if (appPopup) {
      var storeLinks = appPopup.querySelectorAll('.app-store-link');
      storeLinks.forEach(function(link) {
        link.addEventListener('click', cancelAllAppPopups);
      });
    }

    // Start first popup after 5 seconds (if not already cancelled)
    if (!appPopupCancelledForSession && !appPopupAllDismissed) {
      var firstTimer = setTimeout(showAppPopup, 5000);
      appPopupTimers.push(firstTimer);
    }

    // =============================================
    // Follow Us Popup
    // =============================================
    var followPopup = document.getElementById('follow-popup');
    var followPopupClose = document.getElementById('follow-popup-close');
    var followPopupShown = false;
    var followPopupDismissed = sessionStorage.getItem('follow-popup-dismissed') === '1';

    function showFollowPopup() {
      if (followPopupShown || followPopupDismissed) return;
      if (!followPopup) return;
      // Don't show if app popup is currently visible
      if (appPopup && !appPopup.classList.contains('hidden')) return;
      followPopupShown = true;

      followPopup.classList.remove('hidden');

      // Animate slide-in
      var content = followPopup.querySelector('.bg-white');
      if (content && !prefersReducedMotion) {
        content.style.transform = window.innerWidth >= 768 ? 'translateX(100%)' : 'translateY(100%)';
        content.style.opacity = '0';
        content.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            content.style.transform = 'translate(0)';
            content.style.opacity = '1';
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

    if (followPopupClose) followPopupClose.addEventListener('click', dismissFollowPopup);

    // Trigger: 30 second timer
    if (!followPopupDismissed) {
      setTimeout(showFollowPopup, 30000);
    }

    // Trigger: scroll past 50% of page
    function checkScrollForFollow() {
      var scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.5 && !followPopupShown && !followPopupDismissed) {
        showFollowPopup();
        window.removeEventListener('scroll', checkScrollForFollow);
      }
    }
    if (!followPopupDismissed) {
      window.addEventListener('scroll', checkScrollForFollow, { passive: true });
    }

    // =============================================
    // Keyboard accessibility — Escape dismisses popups
    // =============================================
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (appPopup && !appPopup.classList.contains('hidden')) dismissAppPopup();
        if (followPopup && !followPopup.classList.contains('hidden')) dismissFollowPopup();
      }
    });
  });
})();
