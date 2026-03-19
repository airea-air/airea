document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const heroHome = document.querySelector('.hero-home');

  function setHeaderState() {
    if (!header) return;
    if (!body.classList.contains('page-home') || !heroHome) {
      header.classList.add('is-solid');
      return;
    }

    const threshold = Math.max(heroHome.offsetHeight - header.offsetHeight - 48, 120);
    const isSolid = window.scrollY > threshold;
    header.classList.toggle('is-solid', isSolid);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });
  window.addEventListener('resize', setHeaderState);

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
    });
  }

  const dropdownItems = Array.from(document.querySelectorAll('.has-dropdown'));

  function closeDropdowns(except = null) {
    dropdownItems.forEach((item) => {
      if (item === except) return;
      item.classList.remove('is-open');
      const trigger = item.querySelector('.nav-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  dropdownItems.forEach((item) => {
    const trigger = item.querySelector('.nav-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const open = item.classList.contains('is-open');
      closeDropdowns(item);
      item.classList.toggle('is-open', !open);
      trigger.setAttribute('aria-expanded', String(!open));
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.has-dropdown')) closeDropdowns();
  });

  document.querySelectorAll('.mobile-accordion-trigger').forEach((trigger) => {
    const panel = trigger.nextElementSibling;
    if (!panel) return;
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  async function loadSequentialLogos(wall) {
    const prefix = wall.dataset.logoPrefix;
    const max = Number(wall.dataset.max || 50);
    if (!prefix) return;

    let misses = 0;
    for (let index = 1; index <= max; index += 1) {
      const src = `${prefix}${index}.webp`;
      const exists = await new Promise((resolve) => {
        const probe = new Image();
        probe.onload = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = src;
      });

      if (!exists) {
        misses += 1;
        if (misses >= 3) break;
        continue;
      }

      misses = 0;
      const figure = document.createElement('figure');
      figure.className = 'logo-item';
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.alt = '';
      figure.appendChild(img);
      wall.appendChild(figure);
    }
  }

  document.querySelectorAll('.logo-wall').forEach((wall) => {
    loadSequentialLogos(wall);
  });

  document.querySelectorAll('.site-form').forEach((form) => {
    const status = form.querySelector('.form-status');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const honeypot = form.querySelector('input[name="company_website"]');
      if (honeypot && honeypot.value.trim() !== '') return;

      const route = form.dataset.apiRoute || '';
      const data = new FormData(form);

      if (!route || route.includes('api/forms/')) {
        if (status) {
          status.textContent = 'Interface prête. Le raccordement Node.js / Infomaniak sera branché ensuite.';
        }
        return;
      }

      try {
        const response = await fetch(route, { method: 'POST', body: data });
        if (!response.ok) throw new Error('API_ERROR');
        if (status) status.textContent = 'Message envoyé.';
        form.reset();
      } catch {
        if (status) status.textContent = 'L’envoi n’est pas encore configuré.';
      }
    });
  });
});
