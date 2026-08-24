/* =====================================================================
   Sīkdatņu piekrišana — Bratus Tehnoloģiju Akadēmija.
   Viens pašpietiekams fails: CSS ievietots ar <style>, bez atkarībām.
   Režīmi (mainās, nomainot vienu "enabled" vērtību, kodu nepārrakstot):
     - Informatīvais: tikai "necessary" ir enabled:true → "Sapratu" + saite.
     - Piekrišanas: kādai neobligātai kategorijai enabled:true →
       "Piekrist visām" / "Noraidīt neobligātās" + "Iestatījumi".
   Lai ieslēgtu piekrišanas režīmu (piem., pievienojot GA4):
       statistics: { enabled: true, required: false }
   ===================================================================== */

(function () {
  'use strict';

  var CONFIG = {
    version: 1,
    cookieName: 'bta_consent',
    categories: {
      necessary:  { enabled: true,  required: true  },
      statistics: { enabled: false, required: false },
      marketing:  { enabled: false, required: false }
    }
  };

  /* --- Kategoriju nosaukumi un apraksti (latviski) --- */
  var CATEGORY_LABELS = {
    necessary: {
      name: 'Nepieciešamās sīkdatnes',
      desc: 'Nodrošina vietnes pamatfunkcijas, piemēram, pieteikuma formas darbību. Tās nevar atslēgt.'
    },
    statistics: {
      name: 'Statistikas sīkdatnes',
      desc: 'Palīdz saprast, kā apmeklētāji lieto vietni, lai to uzlabotu. Dati tiek apkopoti anonīmi.'
    },
    marketing: {
      name: 'Mārketinga sīkdatnes',
      desc: 'Izmanto, lai rādītu atbilstošas reklāmas un novērtētu kampaņu efektivitāti.'
    }
  };

  /* ================================================================
     CSS — ievietots ar <style>, lai nebūtu papildu HTTP pieprasījuma.
     Izmanto vietnes CSS mainīgos ar fallback vērtībām.
     ================================================================ */
  var CSS = `
#cc-banner,#cc-overlay{--cc-accent:var(--accent,#E85D2A);--cc-radius:var(--radius,10px);--cc-bg:var(--bg,#0f1115);--cc-text:var(--text,var(--ink,#f5f5f5));--cc-border:color-mix(in srgb,var(--cc-text) 20%,transparent);--cc-muted:color-mix(in srgb,var(--cc-text) 65%,transparent);font-family:inherit;color-scheme:light dark}
@media (prefers-color-scheme:light){#cc-banner,#cc-overlay{--cc-bg:var(--bg,#fffbf5);--cc-text:var(--text,var(--ink,#1f1f1f))}}
/* Baneris — fiksēta josla apakšā, zem navigācijas (1000). VDAR: atteikuma poga ir vienādi pamanāma kā piekrišanas. */
#cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:900;background:color-mix(in srgb,var(--cc-bg) 88%,transparent);color:var(--cc-text);border-top:1px solid var(--cc-border);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transform:translateY(110%);opacity:0;pointer-events:none;transition:transform .25s ease-out,opacity .25s ease-out}
#cc-banner.cc-show{transform:translateY(0);opacity:1;pointer-events:auto}
#cc-inner{width:100%;max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:12px 16px;padding-bottom:calc(12px + env(safe-area-inset-bottom))}
#cc-text{margin:0;flex:1 1 260px;font-size:.875rem;line-height:1.45}
#cc-text a{color:var(--cc-accent);text-decoration:underline;text-underline-offset:2px;font-weight:600}
#cc-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:0 0 auto}
@media (min-width:760px){#cc-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.cc-btn{font-family:inherit;font-size:.875rem;font-weight:600;padding:10px 18px;border-radius:var(--cc-radius);border:1.5px solid transparent;cursor:pointer;line-height:1.2;white-space:nowrap;transition:opacity .15s,background-color .15s,color .15s}
.cc-btn:hover{opacity:.9}
.cc-btn-accept{background:var(--cc-accent);color:#fff}
.cc-btn-reject{background:var(--cc-text);color:var(--cc-bg)}
.cc-settings-link{color:var(--cc-text);font-size:.875rem;font-weight:600;text-decoration:underline;text-underline-offset:2px;white-space:nowrap}
.cc-settings-link:hover{color:var(--cc-accent)}
/* Iestatījumu dialogs (modāls) */
#cc-overlay{position:fixed;inset:0;z-index:2000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.5)}
#cc-overlay.cc-open{display:flex}
#cc-dialog{width:100%;max-width:480px;max-height:85vh;overflow:auto;background:var(--cc-bg);color:var(--cc-text);border:1px solid var(--cc-border);border-radius:var(--cc-radius);padding:24px;box-shadow:0 24px 60px rgba(0,0,0,.35)}
#cc-dialog h2{margin:0 0 8px;font-size:1.25rem;font-weight:700;letter-spacing:0}
.cc-dialog-intro{margin:0 0 16px;font-size:.875rem;line-height:1.55;color:var(--cc-muted)}
.cc-dialog-intro a{color:var(--cc-accent);font-weight:600}
#cc-options{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}
.cc-option{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid var(--cc-border);border-radius:var(--cc-radius);cursor:pointer}
.cc-option input{margin-top:3px;width:18px;height:18px;accent-color:var(--cc-accent);flex:0 0 auto}
.cc-option-text{display:flex;flex-direction:column;gap:2px}
.cc-option-text strong{font-size:.9rem;font-weight:600}
.cc-option-text em{font-style:normal;font-size:.8rem;color:var(--cc-muted);line-height:1.45}
.cc-option-disabled{cursor:default;opacity:.75}
.cc-option-note{font-size:.85rem;color:var(--cc-muted);margin:0}
#cc-dialog-actions{display:flex;gap:10px;flex-wrap:wrap}
#cc-dialog-actions .cc-btn{flex:1 1 auto}
.cc-btn:focus-visible,.cc-settings-link:focus-visible,#cc-dialog a:focus-visible{outline:2px solid var(--cc-accent);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion:reduce){#cc-banner,#cc-overlay,#cc-dialog,.cc-btn{transition:none!important}}
`;

  /* ================================================================
     SĪKDATNES (pirmās puses, bta_consent)
     Vērtība — JSON: { v, ts, cats: { necessary, statistics, marketing } }
     Derīgums: 12 mēneši pēc piekrišanas, 6 mēneši pēc atteikuma.
     ================================================================ */
  function writeCookie(consent, maxAgeDays) {
    var val = encodeURIComponent(JSON.stringify(consent));
    var cookie = CONFIG.cookieName + '=' + val +
      '; max-age=' + (maxAgeDays * 24 * 60 * 60) +
      '; path=/' +
      '; SameSite=Lax' +
      '; Secure';
    document.cookie = cookie;
  }

  function deleteCookie() {
    document.cookie = CONFIG.cookieName + '=; max-age=0; path=/; SameSite=Lax; Secure';
  }

  function readCookie() {
    var name = CONFIG.cookieName + '=';
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].replace(/^\s+|\s+$/g, '');
      if (c.indexOf(name) === 0) {
        var raw = c.substring(name.length);
        try { return JSON.parse(decodeURIComponent(raw)); } catch (e) { return null; }
      }
    }
    return null;
  }

  function getConsent() {
    var data = readCookie();
    if (data && data.v === CONFIG.version && data.cats) return data;
    return null;
  }

  function hasValidConsent() {
    return getConsent() !== null;
  }

  function optionalCategories() {
    return Object.keys(CONFIG.categories).filter(function (key) {
      return !CONFIG.categories[key].required && CONFIG.categories[key].enabled;
    });
  }

  function isConsentMode() {
    return optionalCategories().length > 0;
  }

  /* ================================================================
     DOM ELEMENTI
     ================================================================ */
  var styleEl = null;
  var banner = null;
  var overlay = null;
  var dialogEl = null;
  var lastFocused = null;
  var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function injectStyles() {
    styleEl = document.createElement('style');
    styleEl.id = 'cc-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  /* ================================================================
     BANERIS
     ================================================================ */
  function buildBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.id = 'cc-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Paziņojums par sīkdatnēm');

    var policyLink = '<a href="/sikdatnes">sīkdatņu politikā</a>';
    var text, actions;

    if (isConsentMode()) {
      text = 'Mēs izmantojam sīkdatnes, lai vietne darbotos un lai uzlabotu Jūsu pieredzi. Jūs varat piekrist visām vai noraidīt neobligātās. Sīkāk — ' + policyLink + '.';
      actions =
        '<button type="button" class="cc-btn cc-btn-reject" id="cc-reject-all">Noraidīt neobligātās</button>' +
        '<button type="button" class="cc-btn cc-btn-accept" id="cc-accept-all">Piekrist visām</button>' +
        '<a href="/sikdatnes" class="cc-settings-link" data-cookie-settings>Iestatījumi</a>';
    } else {
      text = 'Mēs izmantojam tikai tehniski nepieciešamās sīkdatnes, lai vietne darbotos. Sīkāk — ' + policyLink + '.';
      actions = '<button type="button" class="cc-btn cc-btn-accept" id="cc-accept-all">Sapratu</button>';
    }

    banner.innerHTML =
      '<div id="cc-inner">' +
        '<p id="cc-text">' + text + '</p>' +
        '<div id="cc-actions">' + actions + '</div>' +
      '</div>';

    document.body.appendChild(banner);

    var accept = banner.querySelector('#cc-accept-all');
    if (accept) accept.addEventListener('click', onAcceptAll);
    var reject = banner.querySelector('#cc-reject-all');
    if (reject) reject.addEventListener('click', onRejectAll);
  }

  function showBanner() {
    if (!banner) buildBanner();
    banner.classList.remove('cc-show');
    void banner.offsetWidth; /* reflow — lai sākuma stāvoklis būtu ārpus ekrāna */
    banner.classList.add('cc-show');
    updateHeight();
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('cc-show');
    setHeightVar(0);
    var b = banner;
    window.setTimeout(function () {
      if (b.parentNode) b.parentNode.removeChild(b);
      if (banner === b) banner = null;
    }, 300);
  }

  function setHeightVar(px) {
    document.documentElement.style.setProperty('--cc-height', px + 'px');
  }

  function updateHeight() {
    if (banner && banner.classList.contains('cc-show')) {
      setHeightVar(Math.round(banner.getBoundingClientRect().height));
    }
  }

  /* ================================================================
     IESTATĪJUMU DIALOGS
     ================================================================ */
  function buildDialog() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'cc-overlay';
    overlay.innerHTML =
      '<div id="cc-dialog" role="dialog" aria-modal="true" aria-labelledby="cc-title" tabindex="-1">' +
        '<h2 id="cc-title">Sīkdatņu iestatījumi</h2>' +
        '<p class="cc-dialog-intro">Šeit varat mainīt savu izvēli. Nepieciešamās sīkdatnes vienmēr ir aktīvas, jo bez tām vietne nedarbojas. Sīkāka informācija — <a href="/sikdatnes">sīkdatņu politikā</a>.</p>' +
        '<div id="cc-options"></div>' +
        '<div id="cc-dialog-actions"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    dialogEl = overlay.querySelector('#cc-dialog');

    /* Klikšķis ārpus dialoga aizver to bez saglabāšanas */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDialog();
    });
  }

  function populateDialog() {
    var optionsEl = overlay.querySelector('#cc-options');
    var actionsEl = overlay.querySelector('#cc-dialog-actions');
    var consent = getConsent() || { cats: {} };

    var html =
      '<label class="cc-option cc-option-disabled">' +
        '<input type="checkbox" checked disabled>' +
        '<span class="cc-option-text"><strong>' + CATEGORY_LABELS.necessary.name + '</strong>' +
        '<em>' + CATEGORY_LABELS.necessary.desc + '</em></span>' +
      '</label>';

    var optional = optionalCategories();
    if (optional.length) {
      optional.forEach(function (key) {
        var label = CATEGORY_LABELS[key] || { name: key, desc: '' };
        var checked = consent.cats[key] ? ' checked' : '';
        html +=
          '<label class="cc-option">' +
            '<input type="checkbox" data-cc-cat="' + key + '"' + checked + '>' +
            '<span class="cc-option-text"><strong>' + label.name + '</strong>' +
            '<em>' + label.desc + '</em></span>' +
          '</label>';
      });
    } else {
      html += '<p class="cc-option-note">Šobrīd šī vietne izmanto tikai nepieciešamās sīkdatnes, tāpēc papildu izvēle nav nepieciešama.</p>';
    }
    optionsEl.innerHTML = html;

    actionsEl.innerHTML =
      '<button type="button" class="cc-btn cc-btn-accept" id="cc-save">Saglabāt izvēli</button>' +
      '<button type="button" class="cc-btn cc-btn-reject" id="cc-cancel">Atcelt</button>';

    overlay.querySelector('#cc-save').addEventListener('click', onSaveDialog);
    overlay.querySelector('#cc-cancel').addEventListener('click', closeDialog);
  }

  function openDialog() {
    if (!overlay) buildDialog();
    populateDialog();
    lastFocused = document.activeElement;
    overlay.classList.add('cc-open');
    document.addEventListener('keydown', onDialogKeydown);
    var first = overlay.querySelector(FOCUSABLE);
    if (first) first.focus();
    else dialogEl.focus();
  }

  function closeDialog() {
    if (!overlay) return;
    overlay.classList.remove('cc-open');
    document.removeEventListener('keydown', onDialogKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  }

  /* Esc aizver dialogu BEZ saglabāšanas; Tab tiek ieslēgts dialoga ietvaros */
  function onDialogKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDialog();
      return;
    }
    if (e.key !== 'Tab') return;
    var focusables = Array.prototype.slice.call(overlay.querySelectorAll(FOCUSABLE))
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ================================================================
     DARBĪBAS
     ================================================================ */
  function onAcceptAll() {
    var cats = {};
    Object.keys(CONFIG.categories).forEach(function (key) {
      cats[key] = CONFIG.categories[key].enabled === true;
    });
    saveChoice(cats, false);
  }

  function onRejectAll() {
    var cats = {};
    Object.keys(CONFIG.categories).forEach(function (key) {
      cats[key] = CONFIG.categories[key].required === true;
    });
    saveChoice(cats, true);
  }

  function onSaveDialog() {
    var cats = {};
    Object.keys(CONFIG.categories).forEach(function (key) {
      if (CONFIG.categories[key].required) { cats[key] = true; return; }
      var cb = overlay.querySelector('input[data-cc-cat="' + key + '"]');
      cats[key] = !!(cb && cb.checked);
    });
    var refusal = !Object.keys(cats).some(function (key) {
      return cats[key] && !CONFIG.categories[key].required;
    });
    saveChoice(cats, refusal);
    closeDialog();
  }

  function saveChoice(cats, refusal) {
    var consent = { v: CONFIG.version, ts: new Date().toISOString(), cats: cats };
    /* 12 mēneši pēc piekrišanas, 6 mēneši pēc atteikuma */
    writeCookie(consent, refusal ? 180 : 365);
    syncConsentMode(consent);
    activateDeferredScripts();
    hideBanner();
    if (overlay && overlay.classList.contains('cc-open')) closeDialog();
  }

  /* ================================================================
     SKRIPTU BLOĶĒŠANA NĀKOTNEI
     Piemērs (ievieto lapā, kur skriptam jāgaida piekrišana):
       <script type="text/plain" data-cc-category="statistics" src="..."></script>
     Pēc piekrišanas type tiek pārrakstīts uz text/javascript un elements
     tiek pārielādēts.
     ================================================================ */
  function activateDeferredScripts() {
    var consent = getConsent();
    if (!consent || !consent.cats) return;
    var els = document.querySelectorAll('script[type="text/plain"][data-cc-category]');
    Array.prototype.forEach.call(els, function (el) {
      var cat = el.getAttribute('data-cc-category');
      if (!consent.cats[cat]) return;
      var s = document.createElement('script');
      s.type = 'text/javascript';
      Array.prototype.forEach.call(el.attributes, function (attr) {
        if (attr.name === 'type' || attr.name === 'data-cc-category') return;
        s.setAttribute(attr.name, attr.value);
      });
      if (el.textContent && el.textContent.trim()) s.text = el.textContent;
      el.parentNode.insertBefore(s, el);
      el.parentNode.removeChild(el);
    });
  }

  /* GOOGLE CONSENT MODE v2 — SAGATAVE (atkomentēt tikai tad, kad pievienosiet GA4/Google Ads).
     Ievietot <head> PIRMS jebkura Google skripta — sākumā visi signāli "denied":
       <script>
         window.dataLayer = window.dataLayer || [];
         function gtag(){ dataLayer.push(arguments); }
         gtag('consent', 'default', {
           ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
           analytics_storage:'denied', functionality_storage:'denied',
           personalization_storage:'denied', security_storage:'denied'
         });
       </script>
     Zemāk esošā syncConsentMode() nosūta "update" tikai tad, ja gtag jau eksistē. */
  function syncConsentMode(consent) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      ad_storage: consent.cats.marketing ? 'granted' : 'denied',
      ad_user_data: consent.cats.marketing ? 'granted' : 'denied',
      ad_personalization: consent.cats.marketing ? 'granted' : 'denied',
      analytics_storage: consent.cats.statistics ? 'granted' : 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted'
    });
  }

  /* ================================================================
     INICIALIZĀCIJA
     ================================================================ */
  function init() {
    injectStyles();
    buildBanner();
    buildDialog();

    window.addEventListener('resize', function () {
      if (banner && banner.classList.contains('cc-show')) updateHeight();
    });

    /* Jebkurš elements ar atribūtu data-cookie-settings atver dialogu */
    document.addEventListener('click', function (e) {
      var target = e.target;
      while (target && target !== document) {
        if (target.hasAttribute && target.hasAttribute('data-cookie-settings')) {
          e.preventDefault();
          openDialog();
          return;
        }
        target = target.parentNode;
      }
    });

    function ready() {
      /* Jau piekritušajiem apmeklētājiem — aktivizē atliktos skriptus */
      activateDeferredScripts();
      if (hasValidConsent()) return;
      /* ~500 ms aizture pēc DOMContentLoaded, tad maigs slide-up */
      window.setTimeout(showBanner, 500);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ready);
    } else {
      ready();
    }
  }

  /* ================================================================
     PUBLISKAIS API (vienīgais globālais objekts)
     ================================================================ */
  window.CookieConsent = {
    open: function () { openDialog(); },
    get: function () {
      var c = getConsent();
      if (!c) return null;
      return { v: c.v, ts: c.ts, cats: Object.assign({}, c.cats) };
    },
    reset: function () {
      deleteCookie();
      if (overlay && overlay.classList.contains('cc-open')) closeDialog();
      if (!banner) buildBanner();
      showBanner();
    }
  };

  init();
})();
