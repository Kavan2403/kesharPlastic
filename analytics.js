(function () {
  'use strict';
  var id = 'G-08GTRQQTFK';
  var key = 'skp-privacy-v1';
  var permitted = false;
  var loaded = false;
  var production = /^(www\.)?shreekesharplastic\.com$/.test(location.hostname);
  var panel = document.getElementById('privacy-choices');
  var openButton = document.getElementById('privacy-open');
  var previousFocus;
  if (!panel || !openButton) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied' });
  window['ga-disable-' + id] = true;

  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.trim().split('=')[0];
      if (!/^(_ga|_gid|_gat)(_|$)/.test(name)) return;
      ['', '; domain=' + location.hostname, '; domain=.shreekesharplastic.com'].forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax';
      });
    });
  }

  function apply(allow) {
    permitted = allow;
    window['ga-disable-' + id] = !allow;
    window.gtag('consent', 'update', { analytics_storage: allow ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    if (!allow) { clearAnalyticsCookies(); return; }
    if (!production || loaded) return;
    loaded = true;
    window.gtag('js', new Date());
    var referringOrigin = '';
    try { referringOrigin = new URL(document.referrer).origin; } catch (_) { /* No referrer is valid. */ }
    window.gtag('config', id, {
      page_location: location.origin + location.pathname,
      page_referrer: referringOrigin,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(tag);
  }

  window.skpAnalytics = {
    track: function (name, offering) {
      if (!production || !permitted) return;
      var events = ['phone_call_click', 'whatsapp_click', 'email_click', 'enquiry_message_prepared', 'whatsapp_enquiry_handoff', 'generate_lead'];
      if (!events.includes(name)) return;
      window.gtag('event', name, {
        offering: ['cores', 'black', 'pvc', 'hdpe', 'installation', 'guidance'].includes(offering) ? offering : 'general',
        page_name: document.body.dataset.page,
        send_to: id
      });
    }
  };
  panel.querySelectorAll('[data-analytics-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      var allow = button.dataset.analyticsChoice === 'allow';
      apply(allow);
      try { localStorage.setItem(key, JSON.stringify({ analytics: allow, time: Date.now() })); }
      catch (_) { /* A blocked store affects persistence, never access to the website. */ }
      panel.hidden = true;
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
      else openButton.focus({ preventScroll: true });
    });
  });
  openButton.hidden = false;
  openButton.addEventListener('click', function () {
    previousFocus = document.activeElement;
    panel.hidden = false;
    panel.querySelector('button').focus();
  });
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch (_) { /* Start with no consent. */ }
  if (saved && typeof saved.analytics === 'boolean' && Date.now() - saved.time >= 0 && Date.now() - saved.time < 180 * 86400000) apply(saved.analytics);
  else panel.hidden = false;
  window.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    var value = null;
    try { value = JSON.parse(event.newValue); } catch (_) { /* Invalid choice means denied. */ }
    apply(value?.analytics === true && Date.now() - value.time >= 0 && Date.now() - value.time < 180 * 86400000);
  });
})();
