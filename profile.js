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

  // Preserve the shade already chosen in this browser after removing the controls.
  try {
    const savedColor = localStorage.getItem('soochul-homepage-link-color');
    if (/^#[0-9a-f]{6}$/i.test(savedColor || '')) {
      root.style.setProperty('--work-link', savedColor);
      root.style.setProperty('--work-link-line', `${savedColor}66`);
    }
  } catch (_) {}
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
