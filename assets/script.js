(() => {
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('.hero');
  const mobileToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const dropdowns = [...document.querySelectorAll('[data-dropdown]')];

  const closeAllDropdowns = (except = null) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown === except) return;
      dropdown.classList.remove('is-open');
      const button = dropdown.querySelector('[data-dropdown-button]');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  };

  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector('[data-dropdown-button]');
    if (!button) return;

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains('is-open');
      closeAllDropdowns(willOpen ? dropdown : null);
      dropdown.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', (event) => {
    const clickedDropdown = event.target.closest('[data-dropdown]');
    if (!clickedDropdown) closeAllDropdowns();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
      if (nav) nav.classList.remove('is-open');
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });

  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
      const willOpen = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', willOpen);
      mobileToggle.setAttribute('aria-expanded', String(willOpen));
      if (!willOpen) closeAllDropdowns();
    });
  }

  if (header && hero) {
    const updateHeader = () => {
      const trigger = hero.offsetHeight - header.offsetHeight - 40;
      const scrolled = window.scrollY > Math.max(40, trigger);
      header.classList.toggle('is-scrolled', scrolled);
      header.classList.toggle('is-overlay', !scrolled);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader);
  }

  const candidateBases = [
    'images/secteurs/{cat}',
    'images/{cat}',
    'images/secteurs/{cat_lower}',
    'images/{cat_lower}'
  ];

  function probeImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function findExistingUrl(category, index) {
    const lower = category.toLowerCase();
    const attempts = candidateBases.map((pattern) => `${pattern.replace('{cat}', category).replace('{cat_lower}', lower)}/${category}${index}.webp`);
    for (const url of attempts) {
      const found = await probeImage(url);
      if (found) return found;
    }
    return null;
  }

  async function loadCategoryLogos(category, wall, options = {}) {
    const max = Number(options.max || 50);
    const perCategory = Number(options.perCategory || max);
    let foundCount = 0;
    let missStreak = 0;

    for (let index = 1; index <= max; index += 1) {
      const url = await findExistingUrl(category, index);
      if (url) {
        const tile = document.createElement('div');
        tile.className = 'logo-tile';
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Logo client ${category} ${index}`;
        img.loading = 'lazy';
        tile.appendChild(img);
        wall.appendChild(tile);
        foundCount += 1;
        missStreak = 0;
      } else if (foundCount > 0) {
        missStreak += 1;
        if (missStreak >= 2) break;
      }

      if (foundCount >= perCategory) break;
    }
  }

  async function buildLogoWalls() {
    const walls = [...document.querySelectorAll('[data-logo-wall]')];
    for (const wall of walls) {
      const categories = (wall.dataset.categories || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const limit = Number(wall.dataset.limit || 12);
      const perCategory = Math.max(1, Math.ceil(limit / Math.max(categories.length, 1)));
      for (const category of categories) {
        await loadCategoryLogos(category, wall, { max: 50, perCategory });
      }
    }
  }

  buildLogoWalls();
})();
