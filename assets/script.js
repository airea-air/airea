
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
    });
  }

  async function loadSequentialLogos(wall) {
    const prefix = wall.dataset.logoPrefix;
    const max = Number(wall.dataset.max || 50);
    if (!prefix) return;
    let misses = 0;

    for (let i = 1; i <= max; i += 1) {
      const src = `${prefix}${i}.webp`;
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
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.alt = '';
      const figure = document.createElement('figure');
      figure.className = 'logo-item';
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

      const route = form.dataset.apiRoute;
      const data = new FormData(form);

      // Backend à brancher plus tard.
      if (!route || route.includes('/api/forms/')) {
        if (status) {
          status.textContent = "Front prêt. Branche ensuite l’endpoint Node.js / Infomaniak pour l’envoi réel.";
        }
        return;
      }

      try {
        const response = await fetch(route, { method: 'POST', body: data });
        if (!response.ok) throw new Error('Erreur API');
        if (status) status.textContent = 'Message envoyé.';
        form.reset();
      } catch (_error) {
        if (status) status.textContent = "L’envoi n’est pas encore configuré.";
      }
    });
  });
});
