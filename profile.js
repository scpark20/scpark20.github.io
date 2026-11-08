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
  function setLinkColor(color, remember = true, announce = true) {
    const selected = colorButtons.find(button => button.dataset.linkColor === color);
    // Keep a previously saved color until another swatch is chosen.
    if (!selected && !/^#[0-9a-f]{6}$/i.test(color || '')) return;
    root.style.setProperty('--work-link', color);
    root.style.setProperty('--work-link-line', `${color}66`);
    colorButtons.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
    if (remember) {
      try { localStorage.setItem(colorStorageKey, color); } catch (_) {}
    }
    if (announce && selected) {
      const label = selected.querySelector('[data-en]').dataset[root.lang === 'ko' ? 'ko' : 'en'];
      document.getElementById('status').textContent = root.lang === 'ko' ? `${label} 링크 색상을 선택했습니다.` : `Link color changed to ${label}.`;
    }
  }
  colorButtons.forEach(button => button.addEventListener('click', () => setLinkColor(button.dataset.linkColor)));
  try { setLinkColor(localStorage.getItem(colorStorageKey), false, false); } catch (_) {}
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
