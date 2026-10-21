/* ==========================================================
   MZIMA — Site behaviour (vanilla JavaScript)
   ========================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CONFIG = window.MZIMA_CONFIG || {};

  document.documentElement.classList.remove('no-js');

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Configured contact details (never fabricated) ---------- */
  if (CONFIG.contactEmail) {
    $$('[data-mzima-email]').forEach(function (el) {
      el.textContent = CONFIG.contactEmail;
      el.setAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONFIG.contactEmail));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
      el.setAttribute('title', 'Compose an email in Gmail');
    });
    $$('[data-email-wrap]').forEach(function (el) { el.hidden = false; });
    $$('[data-business-email-notice]').forEach(function (el) { el.hidden = true; });
  }
  if (CONFIG.whatsappNumber) {
    $$('[data-mzima-whatsapp]').forEach(function (el) {
      el.textContent = CONFIG.whatsappDisplay || CONFIG.whatsappNumber;
      el.setAttribute('href', 'https://wa.me/' + CONFIG.whatsappNumber);
    });
    $$('[data-whatsapp-wrap]').forEach(function (el) { el.hidden = false; });
  }
  var social = CONFIG.social || {};
  $$('[data-social]').forEach(function (el) {
    var url = social[el.getAttribute('data-social')];
    if (url) { el.setAttribute('href', url); el.hidden = false; }
  });

  /* ---------- Header: scrolled state + mobile menu ---------- */
  var header = $('.site-header');
  var toggle = $('#menu-toggle');
  var navLinks = $('#nav-links');

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    var top = $('.to-top');
    if (top) top.classList.toggle('show', window.scrollY > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!toggle || !navLinks) return;
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) { closeMenu(); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) closeMenu(); });
  }

  /* ---------- Back to top ---------- */
  var topBtn = $('.to-top');
  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$('.reveal');
  revealEls.forEach(function (el) {
    var p = el.parentElement;
    if (p && /\b(grid|pillars|timeline|process-detail|tech-groups|filters)\b/.test(p.className)) {
      var idx = Array.prototype.indexOf.call(p.children, el);
      el.style.setProperty('--d', Math.min(idx, 8) * 0.08 + 's');
    }
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Hero: rotating words ---------- */
  var rot = $('#rotator-word');
  if (rot && !reduceMotion) {
    var words = (rot.getAttribute('data-words') || '').split('|').filter(Boolean);
    if (words.length > 1) {
      var wi = 0, ci = words[0].length, deleting = false;
      var tick = function () {
        var word = words[wi];
        rot.textContent = word.slice(0, ci);
        var delay = deleting ? 45 : 95;
        if (!deleting && ci === word.length) { deleting = true; delay = 1600; }
        else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
        else { ci += deleting ? -1 : 1; }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 1800);
    }
  }

  /* ---------- Hero: animated crystal network ---------- */
  (function heroCanvas() {
    var canvas = $('#hero-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var w = 0, h = 0, dpr = 1, nodes = [], rafId = null, visible = true;
    var mouse = { x: -9999, y: -9999 };
    var LINK = 140;

    function resize() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(85, Math.max(26, (w * h) / 17000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.6 + 0.9, gem: Math.random() < 0.16
        });
      }
    }

    function gem(x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.8, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.8, y);
      ctx.closePath();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (!reduceMotion) {
          dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150 && d > 0) { a.x += (dx / d) * 0.6; a.y += (dy / d) * 0.6; }
          a.x += a.vx; a.y += a.vy;
          if (a.x < -10) a.x = w + 10; else if (a.x > w + 10) a.x = -10;
          if (a.y < -10) a.y = h + 10; else if (a.y > h + 10) a.y = -10;
        }
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            var alpha = (1 - Math.sqrt(d) / LINK) * 0.35;
            ctx.strokeStyle = 'rgba(92,200,255,' + alpha.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (a.gem) {
          gem(a.x, a.y, a.r * 3.2);
          ctx.fillStyle = 'rgba(155,227,255,.28)'; ctx.fill();
          ctx.strokeStyle = 'rgba(155,227,255,.7)'; ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832);
          ctx.fillStyle = 'rgba(155,227,255,.75)'; ctx.fill();
        }
      }
      if (!reduceMotion && visible && !document.hidden) rafId = requestAnimationFrame(frame);
      else rafId = null;
    }

    function start() { if (!rafId) rafId = requestAnimationFrame(frame); }

    resize(); frame();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduceMotion) frame(); }, 150); });
    host.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    host.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }).observe(host);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
  })();

  /* ---------- Project filters ---------- */
  var filterBtns = $$('.filter-btn');
  if (filterBtns.length) {
    var cards = $$('.project-card[data-category]');
    var emptyMsg = $('#project-empty');
    var live = $('#filter-live');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        cards.forEach(function (c) {
          var match = f === 'all' || c.getAttribute('data-category').split(' ').indexOf(f) > -1;
          c.hidden = !match; if (match) shown++;
        });
        if (emptyMsg) emptyMsg.hidden = shown !== 0;
        if (live) live.textContent = shown + (shown === 1 ? ' project shown' : ' projects shown');
      });
    });
  }

  /* ---------- Contact form ---------- */
  var form = $('#contact-form');
  if (form) {
    var status = $('#form-status');
    var submitBtn = $('button[type="submit"]', form);
    var loadedAt = Date.now();

    // Pre-select a service from ?service=...
    try {
      var params = new URLSearchParams(window.location.search);
      var pre = params.get('service');
      var sel = $('#service', form);
      if (pre && sel) {
        var opt = $$('option', sel).filter(function (o) { return o.value === pre; })[0];
        if (opt) sel.value = pre;
      }
      var topic = params.get('topic');
      var msg = $('#message', form);
      if (topic === 'partnership' && sel) { sel.value = 'partnership'; }
      if (topic === 'collaboration' && sel) { sel.value = 'collaboration'; }
      if (msg && topic && !msg.value) { /* leave blank – user writes their own message */ }
    } catch (err) { /* ignore */ }

    function setStatus(type, text) {
      status.className = 'form-status show ' + type;
      status.textContent = text;
      status.focus();
    }
    function fieldOf(el) { return el.closest('.field'); }
    function setError(el, message) {
      var f = fieldOf(el); if (!f) return;
      f.classList.add('invalid');
      var em = $('.error-msg', f); if (em) em.textContent = message;
      el.setAttribute('aria-invalid', 'true');
    }
    function clearError(el) {
      var f = fieldOf(el); if (!f) return;
      f.classList.remove('invalid'); el.removeAttribute('aria-invalid');
    }
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validate() {
      var ok = true, first = null;
      var name = $('#name', form), email = $('#email', form), service = $('#service', form), message = $('#message', form);
      [name, email, service, message].forEach(clearError);
      if (name.value.trim().length < 2) { setError(name, 'Please enter your name.'); ok = false; first = first || name; }
      if (!EMAIL_RE.test(email.value.trim())) { setError(email, 'Please enter a valid email address.'); ok = false; first = first || email; }
      if (!service.value) { setError(service, 'Please choose a service.'); ok = false; first = first || service; }
      if (message.value.trim().length < 20) { setError(message, 'Please describe your project in at least 20 characters.'); ok = false; first = first || message; }
      if (first) first.focus();
      return ok;
    }

    $$('input, select, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () { clearError(el); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';

      // Spam protection: honeypot, minimum fill time, simple client-side rate limit
      if ($('#website', form).value) return;
      if (Date.now() - loadedAt < 3000) { setStatus('error', 'That was quick! Please take a moment to review your message and try again.'); return; }
      var sent = 0;
      try { sent = parseInt(sessionStorage.getItem('mzima_sent') || '0', 10); } catch (err) { /* ignore */ }
      if (sent >= 3) { setStatus('error', 'You have sent several messages already. Please wait a while before sending another.'); return; }

      if (!validate()) { setStatus('error', 'Please fix the highlighted fields and try again.'); return; }

      var data = {
        name: $('#name', form).value.trim(),
        email: $('#email', form).value.trim(),
        company: $('#company', form).value.trim(),
        phone: ($('#phone', form) || {}).value ? $('#phone', form).value.trim() : '',
        service: $('#service', form).value,
        budget: $('#budget', form).value,
        message: $('#message', form).value.trim(),
        preferred_contact: (form.querySelector('input[name="contact_method"]:checked') || {}).value || 'Email'
      };

      if (!CONFIG.formEndpoint) {
        var body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\nCompany: ' + data.company + '\nPhone or WhatsApp: ' + data.phone + '\nService: ' + data.service +
          '\nBudget: ' + data.budget + '\nPreferred contact: ' + data.preferred_contact + '\n\n' + data.message;
        if (data.preferred_contact === 'Phone or WhatsApp' && CONFIG.whatsappNumber) {
          window.location.href = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(body);
          setStatus('info', 'WhatsApp should open with your message ready to send.');
        } else if (CONFIG.contactEmail) {
          var composeUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONFIG.contactEmail) +
            '&su=' + encodeURIComponent('Project enquiry from ' + data.name) + '&body=' + encodeURIComponent(body);
          window.open(composeUrl, '_blank', 'noopener');
          setStatus('info', 'Gmail should open with your message ready to send.');
        } else if (CONFIG.whatsappNumber) {
          setStatus('info', 'Our business email will be shared soon. Please choose Phone / WhatsApp to send your enquiry.');
        } else {
          setStatus('info', 'This form is not connected to a mailbox yet.');
        }
        return;
      }

      submitBtn.disabled = true; var original = submitBtn.innerHTML; submitBtn.textContent = 'Sending…';
      fetch(CONFIG.formEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        try { sessionStorage.setItem('mzima_sent', String(sent + 1)); } catch (err) { /* ignore */ }
        form.reset();
        setStatus('success', 'Thank you, ' + data.name.split(' ')[0] + '! Your message has been sent. We will get back to you soon.');
      }).catch(function () {
        setStatus('error', 'Sorry, something went wrong while sending your message. Please try again in a moment.');
      }).then(function () { submitBtn.disabled = false; submitBtn.innerHTML = original; });
    });
  }
})();
