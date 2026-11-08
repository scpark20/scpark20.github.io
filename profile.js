(() => {
  const root = document.documentElement;
  // Academic is the sole design; discard obsolete theme preferences and URLs.
  try { localStorage.removeItem('soochul-homepage-design'); } catch (_) {}
  const url = new URL(location.href);
  if (url.searchParams.has('design')) {
    url.searchParams.delete('design');
    history.replaceState(null, '', url);
  }
  const languages = [...document.querySelectorAll('[data-language]')];

  const colorButtons = [...document.querySelectorAll('[data-link-color]')];
  const colorStorageKey = 'soochul-homepage-link-color';
  const colorSettingsKey = 'soochul-homepage-link-settings-v1';
  const brightness = document.getElementById('link-brightness');
  const saturation = document.getElementById('link-saturation');
  let colorSettings;
  function colorToHsl(hex) {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    const lightness = (max + min) / 2;
    const hue = !delta ? 0 : 60 * (max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4);
    return { hue, saturation: delta ? delta / (1 - Math.abs(2 * lightness - 1)) * 100 : 0, lightness: lightness * 100 };
  }
  function hslToColor(hue, saturation, lightness) {
    const s = saturation / 100, l = lightness / 100;
    const a = s * Math.min(l, 1 - l);
    const channel = n => {
      const k = (n + hue / 30) % 12;
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0');
    };
    return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase();
  }
  function applyLinkColor(announce = false) {
    const selected = colorButtons.find(button => button.dataset.linkColor === colorSettings.base);
    const color = hslToColor(colorToHsl(colorSettings.base).hue, colorSettings.saturation, colorSettings.lightness);
    root.style.setProperty('--work-link', color);
    root.style.setProperty('--work-link-line', `${color}66`);
    colorButtons.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
    for (const [input, value] of [[brightness, colorSettings.lightness], [saturation, colorSettings.saturation]]) {
      input.value = Math.round(value);
      document.getElementById(`${input.id}-value`).value = `${Math.round(value)}%`;
      input.setAttribute('aria-valuetext', `${Math.round(value)}%`);
    }
    try {
      localStorage.setItem(colorStorageKey, color);
      localStorage.setItem(colorSettingsKey, JSON.stringify(colorSettings));
    } catch (_) {}
    if (announce && selected) {
      const label = selected.querySelector('[data-en]').dataset[root.lang === 'ko' ? 'ko' : 'en'];
      document.getElementById('status').textContent = root.lang === 'ko' ? `${label} 링크 색상을 선택했습니다.` : `Link color changed to ${label}.`;
    }
  }
  function selectLinkColor(base, announce = true) {
    const { saturation, lightness } = colorToHsl(base);
    colorSettings = { base, saturation, lightness };
    applyLinkColor(announce);
  }
  colorButtons.forEach(button => button.addEventListener('click', () => selectLinkColor(button.dataset.linkColor)));
  for (const [input, property] of [[brightness, 'lightness'], [saturation, 'saturation']]) {
    input.addEventListener('input', () => {
      colorSettings[property] = Number(input.value);
      applyLinkColor();
    });
  }
  document.querySelector('[data-reset-link-color]').addEventListener('click', () => selectLinkColor(colorSettings.base));
  try {
    const saved = JSON.parse(localStorage.getItem(colorSettingsKey));
    if (saved && colorButtons.some(button => button.dataset.linkColor === saved.base)
      && Number.isFinite(saved.lightness) && saved.lightness >= 20 && saved.lightness <= 70
      && Number.isFinite(saved.saturation) && saved.saturation >= 0 && saved.saturation <= 90) colorSettings = saved;
  } catch (_) {}
  if (colorSettings) applyLinkColor();
  else selectLinkColor('#426DB5', false);
  function setLanguage(value, announce = true) {
    const lang = value === 'ko' ? 'ko' : 'en';
    root.lang = lang;
    document.querySelectorAll('[data-en][data-ko]').forEach(el => { el.innerHTML = el.dataset[lang]; });
    languages.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === lang)));
    document.title = lang === 'ko' ? '박수철 — 경력과 활동' : 'Soochul Park — Experience & Activities';
    document.querySelector('meta[property="og:title"]').content = document.title;
    if (announce) document.getElementById('status').textContent = lang === 'ko' ? '한국어로 전환했습니다.' : 'Switched to English.';
  }
  languages.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));

  const imageDialog = document.getElementById('image-dialog');
  const enlargedImage = document.getElementById('enlarged-image');
  const imageContent = imageDialog.querySelector('.image-dialog-content');
  function fitEnlargedImage() {
    if (!enlargedImage.naturalWidth) return;
    const rotation = Number(enlargedImage.dataset.rotate || 0);
    const width = enlargedImage.naturalWidth;
    const height = enlargedImage.naturalHeight;
    const displayWidth = rotation ? height : width;
    const displayHeight = rotation ? width : height;
    const scale = Math.min(1, (window.innerWidth - 94) / displayWidth, (window.innerHeight - 200) / displayHeight);
    imageContent.style.width = `${displayWidth * scale}px`;
    imageContent.style.height = `${displayHeight * scale}px`;
    enlargedImage.style.width = `${width * scale}px`;
    enlargedImage.style.height = `${height * scale}px`;
    enlargedImage.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  }
  enlargedImage.addEventListener('load', fitEnlargedImage);
  window.addEventListener('resize', () => { if (imageDialog.open) fitEnlargedImage(); });
  document.addEventListener('click', event => {
      const button = event.target.closest('[data-enlarge-src]');
      if (!button) return;
      enlargedImage.dataset.rotate = button.dataset.enlargeRotate || "0";
      enlargedImage.src = button.dataset.enlargeSrc;
      enlargedImage.alt = button.dataset.enlargeTitle;
      document.getElementById('image-dialog-title').textContent = button.dataset.enlargeTitle;
      imageDialog.showModal();
      fitEnlargedImage();
      document.body.classList.add('image-open');
  });
  document.querySelector('[data-close-image]').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => {
    const bounds = imageDialog.getBoundingClientRect();
    if (event.target === imageDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) imageDialog.close();
  });
  imageDialog.addEventListener('close', () => document.body.classList.remove('image-open'));
  const sectionLinks = [...document.querySelectorAll('.section-link')];
  const sections = [...document.querySelectorAll('.section')];
  function updateNavigation() {
    const threshold = 80;
    const active = sections.filter(section => section.getBoundingClientRect().top <= threshold).pop() || sections[0];
    sectionLinks.forEach(link => link.setAttribute('aria-current', String(link.hash === `#${active.id}`)));
  }
  window.addEventListener('scroll', updateNavigation, {passive:true});
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
  setLanguage('en', false);
})();
