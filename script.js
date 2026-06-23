(function(){
  document.documentElement.classList.add('js');

  var MEASUREMENT_ID = 'G-08GTRQQTFK';
  var navigationLoaderActive = false;

  function track(action, label) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: 'lead_generation',
        event_label: label || 'website',
        send_to: MEASUREMENT_ID
      });
    }
  }

  function sanitize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createPreloader() {
    var existing = document.querySelector('.preloader');
    if (existing) {
      if (!existing.classList.contains('is-hidden')) return existing;
      existing.remove();
    }

    var el = document.createElement('div');
    el.className = 'preloader';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<svg width="360" height="220" viewBox="0 0 600 360" fill="none" aria-hidden="true"><path pathLength="100" d="M80 290 L80 130 L250 130 L250 240 L430 240 L430 110 L535 110" stroke="#1c3d5a" stroke-width="26" stroke-linecap="butt" fill="none" style="stroke-dasharray:100;stroke-dashoffset:100;animation:sk-draw 1.1s ease-out forwards"></path><path d="M80 290 L80 130 L250 130 L250 240 L430 240 L430 110 L535 110" stroke="#86c2f0" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="6 28" style="animation:sk-flow .9s linear 1s infinite"></path></svg><div class="preloader-text">Assembling the pipeline</div>';
    document.body.appendChild(el);
    return el;
  }

  function hidePreloader(el) {
    if (!el) return;
    el.classList.add('is-hidden');
    setTimeout(function(){
      if (el.parentNode) el.remove();
    }, 500);
  }

  function hasSeenInitialPreloader() {
    try {
      if (sessionStorage.getItem('sk-preloader-seen')) return true;
      sessionStorage.setItem('sk-preloader-seen', '1');
      return false;
    } catch (e) {
      return false;
    }
  }

  function initPreloader() {
    if (prefersReducedMotion() || hasSeenInitialPreloader()) return;
    var el = createPreloader();
    setTimeout(function(){ hidePreloader(el); }, 1350);
  }

  function shouldShowNavigationLoader(event, link) {
    if (!link || !link.href) return false;
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.hasAttribute('download')) return false;
    if (link.target && link.target.toLowerCase() !== '_self') return false;

    var targetUrl;
    try {
      targetUrl = new URL(link.href, window.location.href);
    } catch (e) {
      return false;
    }

    if (targetUrl.origin !== window.location.origin) return false;
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') return false;

    var sameDocument = targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search;
    if (sameDocument && targetUrl.hash) return false;
    if (targetUrl.href === window.location.href) return false;

    return true;
  }

  function initPageTransitions() {
    document.addEventListener('click', function(event) {
      var link = event.target.closest ? event.target.closest('a[href]') : null;
      if (!shouldShowNavigationLoader(event, link)) return;
      if (prefersReducedMotion()) return;

      event.preventDefault();
      if (navigationLoaderActive) return;
      navigationLoaderActive = true;

      createPreloader();
      setTimeout(function(){
        window.location.href = link.href;
      }, 650);
    });

    window.addEventListener('pageshow', function(event) {
      if (!event.persisted) return;
      navigationLoaderActive = false;
      document.querySelectorAll('.preloader').forEach(function(el){ el.remove(); });
    });
  }

  function initMenu() {
    var btn = document.querySelector('.menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });

    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        btn.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }

  function buildMessage(form) {
    var data = new FormData(form);
    return encodeURIComponent([
      'New enquiry from website',
      'Page: ' + location.pathname,
      'Name: ' + sanitize(data.get('full_name')),
      'Phone: ' + sanitize(data.get('phone')),
      'City: ' + sanitize(data.get('city')),
      'Buyer type: ' + sanitize(data.get('buyer_type')),
      'Product / service: ' + sanitize(data.get('requirement_type')),
      'Size / quantity: ' + sanitize(data.get('size_quantity')),
      'Preferred contact: ' + sanitize(data.get('preferred_contact_method')),
      'Message: ' + sanitize(data.get('message'))
    ].join('\n'));
  }

  function initForms() {
    document.querySelectorAll('form.js-quote-form').forEach(function(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        if (!form.reportValidity()) return;
        track('generate_lead', form.dataset.context || location.pathname);
        window.open('https://wa.me/919426391608?text=' + buildMessage(form), '_blank', 'noopener');
        form.reset();
      });
    });
  }

  function initTracking() {
    document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
      a.addEventListener('click', function(){
        track('phone_call_click', sanitize(a.textContent) || a.href);
      });
    });

    document.querySelectorAll('a[href*="wa.me"]').forEach(function(a){
      a.addEventListener('click', function(){
        track('whatsapp_click', sanitize(a.textContent) || a.href);
      });
    });
  }

  function initReveal() {
    var els = [].slice.call(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window)) return;

    els.forEach(function(el){
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .65s cubic-bezier(.2,.7,.2,1), transform .65s cubic-bezier(.2,.7,.2,1)';
    });

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });

    els.forEach(function(el){ io.observe(el); });
    setTimeout(function(){
      els.forEach(function(el){
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }, 2500);
  }

  function initVideo() {
    document.querySelectorAll('video').forEach(function(v){
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function(){});
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initPreloader();
    initPageTransitions();
    initMenu();
    initForms();
    initTracking();
    initReveal();
    initVideo();

    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  });
})();
