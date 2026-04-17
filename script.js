(function () {
  document.documentElement.classList.add('js');
  const GA_MEASUREMENT_ID = 'G-08GTRQQTFK';

  function trackLead(action, label) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: 'lead_generation',
        event_label: label,
        send_to: GA_MEASUREMENT_ID
      });
    }
  }

  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      mobileNav.classList.toggle('show');
    });

    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('show');
      });
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  const counters = document.querySelectorAll('.counter');
  const stats = document.querySelector('.stats-grid');
  let started = false;

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const start = performance.now();
    const duration = 1500;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + '+';
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (stats && counters.length) {
    const statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            counters.forEach(animateCounter);
          }
        });
      },
      { threshold: 0.35 }
    );
    statObserver.observe(stats);
  }

  const forms = document.querySelectorAll('.lead-form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString();
      const phone = (data.get('phone') || '').toString();
      const requirement = (data.get('requirement') || '').toString();
      const city = (data.get('city') || 'Gujarat').toString();

      const message = encodeURIComponent(
        'Enquiry from website\nName: ' + name + '\nPhone: ' + phone + '\nCity: ' + city + '\nRequirement: ' + requirement
      );
      trackLead('generate_lead', 'website_form_submit');
      window.open('https://wa.me/919426391608?text=' + message, '_blank', 'noopener');
      form.reset();
      alert('Thanks! We have opened WhatsApp to complete your enquiry.');
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      trackLead('phone_call_click', link.textContent.trim() || 'call_link');
    });
  });

  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(function (link) {
    link.addEventListener('click', function () {
      trackLead('whatsapp_click', link.textContent.trim() || 'whatsapp_link');
    });
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
