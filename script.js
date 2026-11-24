(function () {
  'use strict';

  var types = {
    black: 'Black Pipes',
    cores: 'Plastic Replacement Cores',
    pvc: 'PVC Pipes',
    hdpe: 'HDPE Pipes',
    installation: 'Farm pipeline installation',
    guidance: 'Help choosing a pipe or core'
  };

  function track(name, offering) {
    if (window.skpAnalytics) window.skpAnalytics.track(name, offering);
  }

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function showNavigationCue() {
    if (reducedMotion() || document.querySelector('.navigation-cue')) return;
    var cue = document.createElement('div');
    cue.className = 'navigation-cue';
    cue.setAttribute('role', 'status');
    cue.innerHTML = '<svg viewBox="0 0 100 50" fill="none" aria-hidden="true"><path d="M5 40V12H42V38H75V12H95" stroke="#1c3d5a" stroke-width="6" pathLength="120"/></svg><span>Connecting the next page</span>';
    document.body.appendChild(cue);
    window.setTimeout(function () { cue.remove(); }, 650);
  }

  function initNavigation() {
    var menu = document.querySelector('.mobile-nav');
    if (menu) {
      menu.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          menu.open = false;
          menu.querySelector('summary').focus();
        }
      });
      document.addEventListener('click', function (event) {
        if (menu.open && !menu.contains(event.target)) menu.open = false;
      });
      window.matchMedia('(min-width: 1180px)').addEventListener('change', function (event) {
        if (event.matches) menu.open = false;
      });
    }
    try {
      if (sessionStorage.getItem('skp-page-transition') === '1') {
        sessionStorage.removeItem('skp-page-transition');
        showNavigationCue();
      }
    } catch (_) { /* Navigation does not require storage access. */ }
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var url = new URL(link.href, location.href);
      var offering = link.dataset.offering || document.body.dataset.offering;
      if (url.protocol === 'tel:') track('phone_call_click', offering);
      if (url.protocol === 'mailto:') track('email_click', offering);
      if (url.hostname === 'wa.me') track(link.id === 'quote-whatsapp' ? 'whatsapp_enquiry_handoff' : 'whatsapp_click', offering);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol) || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (menu) menu.open = false;
      try { sessionStorage.setItem('skp-page-transition', '1'); } catch (_) { /* Best-effort visual cue only. */ }
      showNavigationCue();
      // Allow the browser to navigate immediately, including when JavaScript fails.
    });
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) document.querySelectorAll('.navigation-cue').forEach(function (cue) { cue.remove(); });
    });
  }

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function initQuoteForm() {
    var form = document.querySelector('[data-quote-form]');
    if (!form) return;
    var select = form.elements.requirement_type;
    var requested = new URLSearchParams(location.search).get('product');
    if (Object.hasOwn(types, requested || '')) select.value = requested;
    var status = document.getElementById('quote-status');
    var handoff = document.getElementById('quote-handoff');
    var preview = document.getElementById('quote-preview');
    var link = document.getElementById('quote-whatsapp');
    var preparedMessage = '';
    var preparedOffering = '';
    var sending = false;
    var sentDetails = '';
    var emailAvailable = false;
    var send = document.getElementById('quote-send');
    var availability = document.getElementById('email-availability');
    var fieldset = form.querySelector('fieldset');

    function notify(message, error) {
      status.textContent = message;
      status.dataset.error = String(Boolean(error));
      status.hidden = false;
    }

    if (form.dataset.emailDelivery === 'disabled') {
      send.hidden = true;
      availability.textContent = 'Prepare your enquiry below, then review and send it in WhatsApp. You can also call or email info@shreekesharplastic.com directly.';
    } else fetch('/api/enquiry', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) })
      .then(function (response) { if (!response.ok) throw new Error(); return response.json(); })
      .then(function (data) {
        emailAvailable = data.available === true;
        send.hidden = !emailAvailable;
        send.disabled = !emailAvailable;
        availability.textContent = emailAvailable
          ? 'Send directly to our business inbox. No email app or WhatsApp is required.'
          : 'Online email delivery is not enabled yet. Please use WhatsApp, call, or email info@shreekesharplastic.com directly.';
      }).catch(function () {
        availability.textContent = 'Online email delivery is unavailable here. Please use WhatsApp, call, or email info@shreekesharplastic.com directly.';
      });

    function validateFields() {
      var phone = form.elements.phone;
      var digits = phone.value.replace(/\D/g, '');
      phone.setCustomValidity(/^\+?[0-9 ]+$/.test(phone.value) && digits.length >= 7 && digits.length <= 15 ? '' : 'Enter a phone number with 7 to 15 digits, using spaces or a leading + if needed.');
      form.elements.full_name.setCustomValidity(clean(form.elements.full_name.value) ? '' : 'Please enter your name.');
      form.elements.message.setCustomValidity(clean(form.elements.message.value) ? '' : 'Please describe your requirement.');
    }

    function invalidateMessage() {
      if (handoff.hidden) return;
      handoff.hidden = true;
      preparedMessage = '';
      preparedOffering = '';
      preview.textContent = '';
      status.textContent = 'Details changed. Prepare the message again before opening WhatsApp.';
      status.hidden = false;
    }
    form.addEventListener('input', invalidateMessage);
    form.addEventListener('change', invalidateMessage);
    form.addEventListener('input', validateFields);
    link.addEventListener('click', function () {
      if (!preparedMessage || handoff.hidden) return;
      // A button avoids exposing personal message text to GA4 outbound-link capture.
      window.open('https://wa.me/919426391608?text=' + encodeURIComponent(preparedMessage), '_blank', 'noopener,noreferrer');
      track('whatsapp_enquiry_handoff', preparedOffering);
    });
    document.getElementById('quote-prepare').addEventListener('click', function () {
      if (sending) return;
      validateFields();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var offering = String(data.get('requirement_type'));
      if (!Object.hasOwn(types, offering)) return;
      var lines = [
        'Hello Shree Keshar Plastic, I would like to discuss a requirement.',
        'Name: ' + clean(data.get('full_name')),
        'Phone: ' + clean(data.get('phone')),
        'Product / service: ' + types[offering]
      ];
      [['company', 'Company'], ['work_email', 'Work email'], ['city', 'City / farm location'], ['buyer_type', 'Buyer type'], ['size_quantity', 'Size / quantity'], ['message', 'Requirement']].forEach(function (field) {
        var value = clean(data.get(field[0]));
        if (value) lines.push(field[1] + ': ' + value);
      });
      var message = lines.join('\n');
      preview.textContent = message;
      preparedMessage = message;
      preparedOffering = offering;
      notify('Your WhatsApp message is ready to review. It has not been sent through WhatsApp yet.');
      handoff.hidden = false;
      track('enquiry_message_prepared', offering);
      link.focus({ preventScroll: true });
      handoff.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'nearest' });
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (sending || !emailAvailable) return;
      validateFields();
      if (!form.reportValidity()) return;
      var details = JSON.stringify(Object.fromEntries(new FormData(form)));
      if (details === sentDetails) { notify('This enquiry was already accepted. Please contact us directly if you need to follow up.'); return; }
      sending = true;
      fieldset.disabled = true;
      link.disabled = true;
      handoff.hidden = true;
      send.textContent = 'Sending enquiry...';
      form.setAttribute('aria-busy', 'true');
      notify('Sending your enquiry. Please keep this page open.');
      try {
        var response = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: details, signal: AbortSignal.timeout(20000) });
        var result = await response.json();
        if (!response.ok || result.accepted !== true) throw new Error(typeof result.message === 'string' ? result.message : 'Unable to confirm acceptance. Please contact us directly.');
        sentDetails = details;
        notify('Thank you. Your enquiry was accepted for email delivery to info@shreekesharplastic.com. This is not yet a quotation or confirmation of inbox delivery. Reference: ' + result.reference);
        track('generate_lead', form.elements.requirement_type.value);
      } catch (error) {
        notify(error.name === 'TimeoutError' || error instanceof TypeError || error instanceof SyntaxError
          ? 'We could not confirm the result. Your details are still here. Please call or email us before resending to avoid a duplicate.' : error.message, true);
      } finally {
        sending = false;
        fieldset.disabled = false;
        link.disabled = false;
        send.textContent = 'Send enquiry by email';
        form.removeAttribute('aria-busy');
      }
    });
    // Keep the form disabled without JavaScript; direct contact links always work.
    fieldset.disabled = false;
  }

  initQuoteForm();
  initNavigation();
})();
