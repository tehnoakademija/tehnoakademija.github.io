/* ============================================================
   BRATUS TEHNOLOĢIJU AKADĒMIJA - Galvenais JS fails
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- MOBILE NAV TOGGLE --- */
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Aizvērt menu uz klikšķa uz saites
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* --- NAV SCROLL EFFECT --- */
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  /* --- FAQ ACCORDION --- */
  document.querySelectorAll('.faq-question').forEach(function (question) {
    question.addEventListener('click', function () {
      const item = this.parentElement;
      const isOpen = item.classList.contains('open');

      // Aizvērt visus
      document.querySelectorAll('.faq-item').forEach(function (faqItem) {
        faqItem.classList.remove('open');
      });

      // Atvērt klikšķināto (ja nebija atvērts)
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  /* --- SCROLL ANIMATIONS --- */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .stat-item, .team-card, .testimonial-card, .equipment-card, .shop-card, .about-feature')
    .forEach(function (el) {
      observer.observe(el);
    });

  /* --- SHOP TABS (veikals.html) --- */
  const shopTabs = document.querySelectorAll('.shop-tab');
  const shopPanels = document.querySelectorAll('.shop-panel');

  if (shopTabs.length && shopPanels.length) {
    shopTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = this.getAttribute('data-tab');

        // Deactivate all
        shopTabs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        shopPanels.forEach(function (p) { p.classList.remove('active'); });

        // Activate target
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        const panel = document.querySelector('.shop-panel[data-panel="' + target + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* --- KONTAKTU FORMA --- */
  const contactForm = document.getElementById('ContactFormV3');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const statusDiv = document.getElementById('ct-form-status');
      const submitBtn = document.getElementById('ct-submit-btn');

      statusDiv.style.display = 'block';
      statusDiv.style.backgroundColor = 'rgba(213,118,57,0.15)';
      statusDiv.style.color = '#D57639';
      statusDiv.style.border = '1px solid #D57639';
      statusDiv.innerText = 'Sūta ziņu...';
      if (submitBtn) submitBtn.disabled = true;

      const name = document.getElementById('CTName')?.value || '';
      const email = document.getElementById('CTEmail')?.value || '';
      const phone = document.getElementById('CTPhone')?.value || '';
      const rawMessage = document.getElementById('CTMsg')?.value || '';
      const context = document.getElementById('ct_page_context')?.value || 'Mājaslapa';

      const fullMessage = `Lapa: ${context}\nTālrunis: ${phone}\n\nKomentāri / Jautājums:\n${rawMessage}`;

      const formData = {
        name: name,
        email: email,
        message: fullMessage,
        form_identifier: document.getElementById('ct_form_identifier')?.value || 'academy',
        to: 'akademija@bratus.lv'
      };

      try {
        const response = await fetch('https://shopforms.vercel.app/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          statusDiv.style.backgroundColor = 'rgba(129,168,80,0.15)';
          statusDiv.style.color = '#81A850';
          statusDiv.style.border = '1px solid #81A850';
          statusDiv.innerText = 'Paldies! Ziņa saņemta. Sazināsimies ar Jums tuvākajā laikā.';
          contactForm.reset();
        } else {
          statusDiv.style.backgroundColor = 'rgba(231,76,60,0.15)';
          statusDiv.style.color = '#e74c3c';
          statusDiv.style.border = '1px solid #e74c3c';
          statusDiv.innerText = 'Kļūda nosūtot ziņu. Lūdzu, mēģiniet vēlreiz.';
        }
      } catch (error) {
        statusDiv.style.backgroundColor = 'rgba(231,76,60,0.15)';
        statusDiv.style.color = '#e74c3c';
        statusDiv.style.border = '1px solid #e74c3c';
        statusDiv.innerText = 'Sistēmas kļūda. Lūdzu, mēģiniet vēlāk.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  /* --- PAKALPOJUMU FORMAS (nodarbibas, meistarklases, utt.) --- */
  const serviceForms = document.querySelectorAll('.service-form');
  serviceForms.forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const statusEl = form.querySelector('.form-status');
      const submitBtn = form.querySelector('.form-submit');
      const formId = form.getAttribute('data-form-id') || 'academy';

      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.backgroundColor = 'rgba(213,118,57,0.15)';
        statusEl.style.color = '#D57639';
        statusEl.style.border = '1px solid #D57639';
        statusEl.innerText = 'Sūta pieteikumu...';
      }
      if (submitBtn) submitBtn.disabled = true;

      // Savākt visus formas laukus
      const formDataObj = {};
      form.querySelectorAll('input, textarea, select').forEach(function (field) {
        if (field.name) {
          formDataObj[field.name] = field.value;
        }
      });

      // Izveidot ziņu no visiem laukiem (izņemot email un name)
      var messageLines = [];
      for (var key in formDataObj) {
        if (formDataObj.hasOwnProperty(key) && key !== 'email' && key !== 'name') {
          messageLines.push(key + ': ' + formDataObj[key]);
        }
      }
      var fullMsg = 'Forma: ' + formId + '\n\n' + messageLines.join('\n');

      const payload = {
        name: formDataObj.name || formDataObj.vards || '',
        email: formDataObj.email || formDataObj.epasts || '',
        message: fullMsg,
        form_identifier: formId,
        to: 'akademija@bratus.lv'
      };

      try {
        const response = await fetch('https://shopforms.vercel.app/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok && statusEl) {
          statusEl.style.backgroundColor = 'rgba(129,168,80,0.15)';
          statusEl.style.color = '#81A850';
          statusEl.style.border = '1px solid #81A850';
          statusEl.innerText = 'Paldies! Pieteikums saņemts. Sazināsimies ar Jums tuvākajā laikā.';
          form.reset();
        } else if (statusEl) {
          statusEl.style.backgroundColor = 'rgba(231,76,60,0.15)';
          statusEl.style.color = '#e74c3c';
          statusEl.style.border = '1px solid #e74c3c';
          statusEl.innerText = 'Kļūda nosūtot. Lūdzu, mēģiniet vēlreiz.';
        }
      } catch (error) {
        if (statusEl) {
          statusEl.style.backgroundColor = 'rgba(231,76,60,0.15)';
          statusEl.style.color = '#e74c3c';
          statusEl.style.border = '1px solid #e74c3c';
          statusEl.innerText = 'Sistēmas kļūda. Lūdzu, mēģiniet vēlāk.';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });

});
