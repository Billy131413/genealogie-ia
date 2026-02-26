/**
 * Consent Management Module
 * Gère la bannière de consentement RGPD avec 3 catégories :
 * - essential (toujours actif)
 * - analytics (GA4)
 * - marketing (publicités)
 *
 * Stockage : localStorage('ia_consent')
 * Format : { essential: true, analytics: bool, marketing: bool, timestamp: ISO }
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ia_consent';
  var CONSENT_VERSION = 1;

  /** Récupère le consentement enregistré */
  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var consent = JSON.parse(raw);
      if (consent.version !== CONSENT_VERSION) return null;
      return consent;
    } catch (e) {
      return null;
    }
  }

  /** Enregistre le consentement */
  function saveConsent(analytics, marketing) {
    var consent = {
      version: CONSENT_VERSION,
      essential: true,
      analytics: !!analytics,
      marketing: !!marketing,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {
      /* localStorage indisponible — on continue sans persistance */
    }
    applyConsent(consent);
    hideBanner();
    showModifyLink();
  }

  /** Applique le consentement : charge les scripts autorisés */
  function applyConsent(consent) {
    /* GA4 Consent Mode v2 */
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    if (consent.analytics) {
      gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
      /* Charger GA4 si un ID est configuré */
      var gaId = document.documentElement.dataset.gaId;
      if (gaId && !document.getElementById('ga4-script')) {
        var s = document.createElement('script');
        s.id = 'ga4-script';
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
        document.head.appendChild(s);
        gtag('js', new Date());
        gtag('config', gaId, { send_page_view: true });
      }
    }

    if (consent.marketing) {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_personalization: 'granted',
        ad_user_data: 'granted'
      });
      /* Charger AdSense si un ID est configuré */
      var adsenseId = document.documentElement.dataset.adsenseId;
      if (adsenseId && !document.getElementById('adsense-script')) {
        var a = document.createElement('script');
        a.id = 'adsense-script';
        a.async = true;
        a.crossOrigin = 'anonymous';
        a.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + adsenseId;
        document.head.appendChild(a);
      }
    }

    /* Dispatch un événement custom pour les autres modules */
    document.dispatchEvent(new CustomEvent('consentUpdated', { detail: consent }));
  }

  /** Affiche la bannière */
  function showBanner() {
    var banner = document.getElementById('consent-banner');
    if (banner) {
      banner.classList.add('is-visible');
      /* Focus management pour accessibilité */
      var firstBtn = banner.querySelector('button');
      if (firstBtn) firstBtn.focus();
    }
  }

  /** Cache la bannière */
  function hideBanner() {
    var banner = document.getElementById('consent-banner');
    if (banner) {
      banner.classList.remove('is-visible');
    }
  }

  /** Affiche le lien "Modifier mes choix" */
  function showModifyLink() {
    var link = document.getElementById('consent-modify');
    if (link) {
      link.classList.add('is-visible');
    }
  }

  /** Cache le lien "Modifier mes choix" */
  function hideModifyLink() {
    var link = document.getElementById('consent-modify');
    if (link) {
      link.classList.remove('is-visible');
    }
  }

  /** Initialise la bannière */
  function init() {
    /* Consent Mode v2 : défauts restrictifs */
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_personalization: 'denied',
      ad_user_data: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });

    var existing = getConsent();
    if (existing) {
      applyConsent(existing);
      showModifyLink();
      return;
    }

    showBanner();

    /* Bouton Accepter tout */
    var acceptAll = document.getElementById('consent-accept-all');
    if (acceptAll) {
      acceptAll.addEventListener('click', function () {
        saveConsent(true, true);
      });
    }

    /* Bouton Refuser tout */
    var rejectAll = document.getElementById('consent-reject-all');
    if (rejectAll) {
      rejectAll.addEventListener('click', function () {
        saveConsent(false, false);
      });
    }

    /* Bouton Personnaliser */
    var customize = document.getElementById('consent-customize');
    if (customize) {
      customize.addEventListener('click', function () {
        var categories = document.getElementById('consent-categories');
        if (categories) {
          categories.classList.toggle('is-expanded');
        }
      });
    }

    /* Bouton Sauvegarder les préférences */
    var savePrefs = document.getElementById('consent-save');
    if (savePrefs) {
      savePrefs.addEventListener('click', function () {
        var analyticsCheck = document.getElementById('consent-analytics');
        var marketingCheck = document.getElementById('consent-marketing');
        saveConsent(
          analyticsCheck ? analyticsCheck.checked : false,
          marketingCheck ? marketingCheck.checked : false
        );
      });
    }

    /* Lien Modifier mes choix */
    var modifyLink = document.getElementById('consent-modify');
    if (modifyLink) {
      modifyLink.addEventListener('click', function (e) {
        e.preventDefault();
        hideModifyLink();
        showBanner();
        var categories = document.getElementById('consent-categories');
        if (categories) {
          categories.classList.add('is-expanded');
          /* Pré-remplir les checkboxes */
          var current = getConsent();
          if (current) {
            var analyticsCheck = document.getElementById('consent-analytics');
            var marketingCheck = document.getElementById('consent-marketing');
            if (analyticsCheck) analyticsCheck.checked = current.analytics;
            if (marketingCheck) marketingCheck.checked = current.marketing;
          }
        }
      });
    }
  }

  /* Expose l'API publique */
  window.ConsentManager = {
    getConsent: getConsent,
    hasConsent: function (category) {
      var c = getConsent();
      if (!c) return false;
      return !!c[category];
    }
  };

  /* Lancement */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
