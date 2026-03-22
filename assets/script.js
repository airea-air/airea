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

  const shuffle = (items) => {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const candidateBases = [
    'images/{cat}',
    'images/secteurs/{cat}',
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

  async function collectCategoryLogos(category, max = 80) {
    const urls = [];
    let foundOne = false;
    let missStreak = 0;

    for (let index = 1; index <= max; index += 1) {
      const url = await findExistingUrl(category, index);
      if (url) {
        urls.push(url);
        foundOne = true;
        missStreak = 0;
      } else if (foundOne) {
        missStreak += 1;
        if (missStreak >= 3) break;
      }
    }

    return urls;
  }

  function makeLogoTile(url) {
    const tile = document.createElement('div');
    tile.className = 'logo-square';
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Logo client';
    img.loading = 'lazy';
    tile.appendChild(img);
    return tile;
  }

  async function buildLogoMarquee() {
    const marquee = document.querySelector('[data-logo-marquee]');
    if (!marquee) return;

    const categories = (marquee.dataset.categories || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    let allLogos = [];
    for (const category of categories) {
      const urls = await collectCategoryLogos(category, 80);
      allLogos = allLogos.concat(urls);
    }

    allLogos = shuffle(allLogos);
    if (!allLogos.length) return;

    const rows = 3;
    const chunkSize = Math.max(8, Math.ceil(allLogos.length / rows));

    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
      const row = document.createElement('div');
      row.className = 'logos-row';

      const track = document.createElement('div');
      track.className = 'logos-track';
      if (rowIndex === 1) track.classList.add('is-reverse');
      if (rowIndex === 2) track.classList.add('is-slower');

      const slice = allLogos.slice(rowIndex * chunkSize, (rowIndex + 1) * chunkSize);
      const rowLogos = shuffle(slice.length ? slice : allLogos).slice(0, Math.min(chunkSize, allLogos.length));

      [...rowLogos, ...rowLogos].forEach((url) => {
        track.appendChild(makeLogoTile(url));
      });

      row.appendChild(track);
      marquee.appendChild(row);
    }
  }

  const scrollCue = document.querySelector('.scroll-cue');
  if (scrollCue) {
    scrollCue.addEventListener('click', (event) => {
      const href = scrollCue.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      scrollCue.classList.add('is-pressed');
      window.setTimeout(() => scrollCue.classList.remove('is-pressed'), 450);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  buildLogoMarquee();
})();
