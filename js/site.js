(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 스크롤 등장
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.rv').forEach(el => io.observe(el));

  // 전체 메뉴
  const burger = $('.burger'), menu = $('#menu');
  const setMenu = open => {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('open', open);
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  // 히어로: 영상이 없거나 재생이 막히면 배경만 보이게
  const hv = $('.hero-v');
  if (hv) {
    // 마지막 source까지 실패했을 때만 영상을 지움 (휴대폰용 source는 PC에서 건너뛰며 error가 나는 게 정상)
    hv.addEventListener('error', e => { if (e.target === hv || e.target === hv.querySelector('source:last-of-type')) hv.remove(); }, true);
    if (reduce) hv.pause(); else hv.play().catch(() => {});
  }

  // 히어로가 뒤에 남고 본문이 덮이며 올라올 때 살짝 줄어드는 효과
  const hero = $('.hero');
  if (hero && !reduce && matchMedia('(min-width: 901px)').matches) {
    let tick = false;
    addEventListener('scroll', () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => {
        const p = Math.min(1, scrollY / innerHeight);
        hero.style.transform = `scale(${1 - p * 0.04})`;
        hero.style.filter = `brightness(${1 - p * 0.35})`;
        tick = false;
      });
    }, { passive: true });
  }

  // 카드 영상: 화면에 보일 때만 재생 (파일이 없으면 사진만 보임)
  const vio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !reduce) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: 0.35 });
  $$('video[data-inview]').forEach(v => {
    v.addEventListener('error', () => v.remove(), true);
    vio.observe(v);
  });

  // 섬기는 사람들 슬라이드
  const slides = $$('.slide'); let cur = 0;
  const go = d => {
    slides[cur].classList.remove('on');
    cur = (cur + d + slides.length) % slides.length;
    slides[cur].classList.add('on');
  };
  $('[data-prev]')?.addEventListener('click', () => go(-1));
  $('[data-next]')?.addEventListener('click', () => go(1));

  // 사역 캐러셀 화살표
  const rail = $('.rail');
  $$('[data-rail]').forEach(b => b.addEventListener('click', () => {
    const step = (rail.firstElementChild.offsetWidth + 30) * 2;
    rail.scrollBy({ left: step * +b.dataset.rail, behavior: reduce ? 'auto' : 'smooth' });
  }));

  // 카드 영상을 누르면 소리와 함께 크게 재생 (닫기: X, 바깥 누르기, Esc)
  $$('.ph[data-film]').forEach(ph => ph.addEventListener('click', e => {
    e.preventDefault();
    const box = document.createElement('div');
    box.className = 'film-box';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', ph.dataset.filmTitle || 'Film');
    box.innerHTML = '<button class="film-x" aria-label="Close">×</button><video controls autoplay playsinline></video>';
    const v = box.querySelector('video');
    v.src = ph.dataset.film;
    const close = () => { v.pause(); box.remove(); document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    const onKey = k => { if (k.key === 'Escape') close(); };
    box.addEventListener('click', c => { if (c.target !== v) close(); });
    document.addEventListener('keydown', onKey);
    $$('video[data-inview]').forEach(x => x.pause());
    document.body.style.overflow = 'hidden';
    document.body.appendChild(box);
    box.querySelector('.film-x').focus();
    v.play().catch(() => {});
  }));
})();
