const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/XTDUDL53MV';

(() => {
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header
  const header = document.getElementById('header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const setMenu = open => {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger?.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Phone mask
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  // ===== CALCULATOR =====
  const MATERIALS = {
    msd:    { label: 'ПВХ MSD Premium',       low: 1150, high: 1100 },
    bauf:   { label: 'ПВХ Bauf 205',          low: 1450, high: 1400 },
    color:  { label: 'ПВХ цветное',           low: 1300, high: 1200 },
    teqtum: { label: 'ПВХ TEQTUM',            low: 2100, high: 2000 },
    descor: { label: 'Ткань Descor',          low: 2000, high: 1900 },
    clipso: { label: 'Ткань Clipso',          low: 3000, high: 3000 },
  };
  const MIN_ORDER = 16000;
  const el = id => document.getElementById(id);
  const num = id => Math.max(0, parseFloat(el(id).value) || 0);
  let lastCalc = '';

  const calc = () => {
    const area = num('cArea');
    const mat = MATERIALS[el('cMat').value];
    const spots = Math.floor(num('cSpots'));
    const chand = Math.floor(num('cChand'));
    const floatM = num('cFloat');
    const twoM = num('cTwo');

    const canvas = area * (area > 20 ? mat.high : mat.low);
    const spotsSum = spots * (spots >= 15 ? 700 : 750);
    const chandSum = chand * (chand >= 10 ? 800 : 900);
    const raw = canvas + spotsSum + chandSum + floatM * 2000 + twoM * 2500;
    const total = raw > 0 ? Math.max(raw, MIN_ORDER) : 0;

    el('cTotal').textContent = fmt(total);
    el('cNote').textContent = total > 0 && raw < MIN_ORDER
      ? 'Применён минимальный заказ 16 000 ₽.'
      : 'Окончательную цену мастер впишет в договор после замера.';

    lastCalc = total > 0
      ? `Расчёт с сайта: ${area} м², ${mat.label}, светильников ${spots}, люстр ${chand}` +
        (floatM ? `, парящий ${floatM} м` : '') + (twoM ? `, двухуровневый ${twoM} м` : '') +
        `. Итого ориентировочно ${fmt(total)}.`
      : '';
  };
  document.getElementById('calcForm')?.addEventListener('input', calc);
  calc();

  el('cSend')?.addEventListener('click', () => {
    const comment = document.querySelector('#leadForm [name="comment"]');
    if (comment && lastCalc) comment.value = lastCalc;
  });

  // ===== FORM SUBMIT → CLOUDFLARE WORKER =====
  const form = document.getElementById('leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;

    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;

    if (!payload.name || !payload.phone || payload.phone.replace(/\D/g, '').length < 11) {
      alert('Укажите имя и телефон полностью');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
    }
  });

  // Reveal on scroll
  const targets = document.querySelectorAll('.adv, .srv, .step, .case, .price-box, .faq__item, .calc');
  targets.forEach(t => t.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(t => io.observe(t));
})();
