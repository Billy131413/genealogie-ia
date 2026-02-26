/* ============================================================
   GÉNÉALOGIE & IA — Comparatifs VS
   JavaScript vanilla — interactions légères
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Mobile menu toggle ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.classList.toggle('is-open');
    });

    // Fermer le menu quand on clique un lien
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('is-open');
      });
    });
  }

  /* ---------- FAQ Accordéons ---------- */
  document.querySelectorAll('.faq-item__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var answer = item.querySelector('.faq-item__answer');
      var isOpen = item.classList.contains('is-open');

      // Fermer les autres accordéons du même groupe
      var parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.faq-item.is-open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            var openAnswer = openItem.querySelector('.faq-item__answer');
            if (openAnswer) openAnswer.style.maxHeight = '0';
            openItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
          }
        });
      }

      // Toggle l'accordéon courant
      if (isOpen) {
        item.classList.remove('is-open');
        answer.style.maxHeight = '0';
        this.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Smooth scroll pour ancres internes ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Mettre le focus pour l'accessibilité
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- Tracking léger via sendBeacon ---------- */
  function trackEvent(category, action, label) {
    if (!navigator.sendBeacon) return;
    // Placeholder : remplacer l'URL par votre endpoint analytics
    // var data = JSON.stringify({ category: category, action: action, label: label, ts: Date.now() });
    // navigator.sendBeacon('/api/collect', data);
  }

  // Track ouverture FAQ
  document.querySelectorAll('.faq-item__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var q = this.textContent.trim().substring(0, 60);
      trackEvent('faq', 'toggle', q);
    });
  });

  /* ---------- Fermer menu mobile si redimensionnement ---------- */
  var mql = window.matchMedia('(min-width: 768px)');
  function handleResize(e) {
    if (e.matches && mobileMenu && burger) {
      mobileMenu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  }
  if (mql.addEventListener) {
    mql.addEventListener('change', handleResize);
  }

})();
