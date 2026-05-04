// Homepage scroll mechanics — guide, do not control.
// No snap, no hijacking, no positional movement, no colour transitions on hero.

function clamp(v: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, v));
}

function prog(val: number, start: number, end: number): number {
  return clamp((val - start) / (end - start));
}

function init(): void {
  const heroSection  = document.getElementById('hero');
  const line1        = document.getElementById('hero-line-1') as HTMLElement | null;
  const line2        = document.getElementById('hero-line-2') as HTMLElement | null;
  const nav          = document.getElementById('site-nav')    as HTMLElement | null;
  const closing      = document.getElementById('contact');
  const closingInner = closing?.querySelector<HTMLElement>('.closing-inner') ?? null;

  // Thesis sticky canvas
  const thesisContainer = document.getElementById('thesis');
  const thesisLine1     = thesisContainer?.querySelectorAll<HTMLElement>('.thesis-line')[0] ?? null;
  const thesisLine2     = thesisContainer?.querySelectorAll<HTMLElement>('.thesis-line')[1] ?? null;
  const thesisBeat2     = thesisContainer?.querySelector<HTMLElement>('.positioning') ?? null;
  const thesisBeat3     = thesisContainer?.querySelector<HTMLElement>('.service')     ?? null;

  if (!heroSection || !line1 || !line2) return;

  if (import.meta.env.DEV && thesisContainer) {
    if (!thesisLine1 || !thesisLine2) console.warn('[scroll] thesis .thesis-line elements missing');
    if (!thesisBeat2)                 console.warn('[scroll] thesis .positioning element missing');
    if (!thesisBeat3)                 console.warn('[scroll] thesis .service element missing');
  }

  // Geometry — remeasured on resize via ResizeObserver below.
  let vh               = window.innerHeight;
  let heroHeight       = heroSection.offsetHeight;
  let stickyRange      = heroHeight - vh;
  // scrollTravel = distance the container scrolls while the sticky panel is active.
  // Equals containerHeight - viewportHeight (same logic as the hero sticky).
  let thesisScrollTravel = Math.max(1, (thesisContainer?.offsetHeight ?? 0) - vh);
  // thesis offsetTop for scrollY-based coordinate (avoids per-frame getBoundingClientRect).
  let thesisTop        = thesisContainer
    ? thesisContainer.getBoundingClientRect().top + window.scrollY
    : 0;
  let closingTop       = closing
    ? closing.getBoundingClientRect().top + window.scrollY
    : 0;

  // ── Scroll handler ────────────────────────────────────────────────
  let rafPending = false;

  function update(): void {
    const y = window.scrollY;

    // 1. Line 1: fades in 80px → 680px (600px window), max opacity 0.75
    line1.style.opacity = (prog(y, 80, 680) * 0.75).toFixed(3);

    // 2. Line 2: fades in 420px → 1020px (600px window) — held back a beat vs. Line 1
    line2.style.opacity = (prog(y, 420, 1020) * 0.75).toFixed(3);

    // 3. Nav: fully visible during sticky phase, fades as hero scrolls off.
    //    Disable pointer events once invisible so it doesn't block thesis clicks.
    if (nav) {
      const navOpacity = 1 - prog(y, stickyRange, heroHeight);
      nav.style.opacity = navOpacity.toFixed(3);
      nav.style.pointerEvents = navOpacity < 0.05 ? 'none' : '';
    }

    // 4. Thesis sticky canvas — map container scroll progress to element opacity.
    //    p = 0 when sticky attaches, 1 when sticky releases.
    //    prog() clamps to [0,1] — once revealed an element stays at full opacity.
    //
    //    0.00–0.14  breathing room (white canvas)
    //    0.14–0.26  line 1 fades in
    //    0.31–0.43  line 2 fades in  — small breath after line 1 settles
    //    0.43–0.46  brief settle before positioning
    //    0.46–0.58  positioning fades in
    //    0.58–0.69  shorter pause — lines+positioning settled
    //    0.69–0.81  service fades in
    //    0.81–1.00  composed state holds until sticky releases
    if (thesisContainer && thesisLine1 && thesisLine2 && thesisBeat2 && thesisBeat3) {
      const p = clamp((y - thesisTop) / thesisScrollTravel);
      thesisLine1.style.opacity  = prog(p, 0.14, 0.26).toFixed(3);
      thesisLine2.style.opacity  = prog(p, 0.31, 0.43).toFixed(3);
      thesisBeat2.style.opacity  = prog(p, 0.46, 0.58).toFixed(3);
      thesisBeat3.style.opacity  = prog(p, 0.69, 0.81).toFixed(3);
    }

    // 5. Closing: content sharpens 0.75 → 1.0 as section rises into view
    if (closing && closingInner) {
      closingInner.style.opacity = (0.75 + 0.25 * prog(closingTop - y, 0.4 * vh, vh)).toFixed(3);
    }

    rafPending = false;
  }

  // ── Resize handling ───────────────────────────────────────────────
  // Remeasure document-relative offsets and derived geometry when layout changes.
  const ro = new ResizeObserver(() => {
    vh               = window.innerHeight;
    heroHeight       = heroSection.offsetHeight;
    stickyRange      = heroHeight - vh;
    thesisScrollTravel = Math.max(1, (thesisContainer?.offsetHeight ?? 0) - vh);
    thesisTop        = thesisContainer
      ? thesisContainer.getBoundingClientRect().top + window.scrollY
      : 0;
    closingTop       = closing
      ? closing.getBoundingClientRect().top + window.scrollY
      : 0;
    update();
  });
  ro.observe(document.documentElement);

  // ── Scroll listener with teardown for Astro ViewTransitions ───────
  const ac = new AbortController();

  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }, { passive: true, signal: ac.signal });

  document.addEventListener('astro:before-swap', () => {
    ac.abort();
    ro.disconnect();
  }, { once: true });

  update();
}

init();
