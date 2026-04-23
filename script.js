(function () {
  var MEASUREMENT_ID = 'G-08GTRQQTFK';

  function track(action, label, value) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', action, {
      event_category: 'lead_generation',
      event_label: label || 'website',
      value: value || 1,
      send_to: MEASUREMENT_ID
    });
  }

  function sanitize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function buildWhatsappMessage(form, context) {
    var data = new FormData(form);
    var rows = [
      'Website Enquiry - Shree Keshar Plastic',
      'Page: ' + sanitize(context),
      'Name: ' + sanitize(data.get('full_name')),
      'Phone: ' + sanitize(data.get('phone')),
      'City: ' + sanitize(data.get('city')),
      'Buyer Type: ' + sanitize(data.get('buyer_type')),
      'Product/Service: ' + sanitize(data.get('requirement_type')),
      'Size/Quantity: ' + sanitize(data.get('size_quantity')),
      'Preferred Contact: ' + sanitize(data.get('preferred_contact_method')),
      'Message: ' + sanitize(data.get('message'))
    ];
    return encodeURIComponent(rows.join('\n'));
  }

  document.querySelectorAll('form.js-quote-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      var context = form.getAttribute('data-context') || window.location.pathname;
      var message = buildWhatsappMessage(form, context);
      track('generate_lead', context);
      window.open('https://wa.me/919426391608?text=' + message, '_blank', 'noopener');
      form.reset();
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      track('phone_call_click', sanitize(link.textContent) || link.getAttribute('href'));
    });
  });

  document.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"]').forEach(function (link) {
    link.addEventListener('click', function () {
      track('whatsapp_click', sanitize(link.textContent) || link.getAttribute('href'));
    });
  });

  var yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
})();
