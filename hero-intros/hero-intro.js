/*!
 * HERO INTRO ENGINE v1 · PURPLEROSA
 * Vanilla JS, no dependencies (~4KB). Powers every hero in /hero-intros.
 *
 * Markup contract
 * ───────────────
 * <section data-hero data-scroll="260">        scroll length in vh (0 = no pin, intro only)
 *   <div class="hi-stage">                     sticky, 100vh (CSS below)
 *     <video data-hero-video data-mode="scrub" muted playsinline preload="auto" src="hero.mp4"></video>
 *       data-mode="scrub"    → playback follows scroll (needs an all-keyframe encode, see README)
 *       data-mode="autoplay" → plays once on load, intro clock is synced to it
 *
 *     <h1 data-in="letters" data-at="200" data-dur="900" data-stagger="110" data-fx="rise">PRIMAL</h1>
 *       data-in     fade-up | fade | blur | scale | drop | rise | line | slide-r | slide-l
 *                   letters | words  (split + stagger, child effect taken from data-fx)
 *       data-at     start time in ms, relative to the intro start
 *       data-dur    duration in ms (default 900)
 *       data-ease   out | back | inout | soft (default out)
 *
 *     <div data-scroll-range="0.35,0.8">…</div>  gets .is-on while scroll progress is inside the range
 *
 * Split / reduced-motion elements get .hi-on (visible) — their own CSS opacity still applies.
 * CSS hooks on the section: --p (scroll progress 0→1), .hi-started, .has-video, .hi-reduced
 * Test any template with your own clip: page.html?video=https://…/clip.mp4
 */
(function () {
  'use strict';
  var EASE = {
    out: 'cubic-bezier(.16,1,.3,1)',     // expo-out — the signature "lands softly" curve
    back: 'cubic-bezier(.34,1.56,.64,1)', // slight overshoot for buttons / pills
    inout: 'cubic-bezier(.65,0,.35,1)',
    soft: 'cubic-bezier(.25,.1,.25,1)'
  };
  var FX = {
    'fade-up': [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }],
    'fade': [{ opacity: 0 }, { opacity: 1 }],
    'blur': [{ opacity: 0, filter: 'blur(18px)', transform: 'scale(1.06)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
    'scale': [{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'none' }],
    'drop': [{ opacity: 0, transform: 'translateY(-120%)' }, { opacity: 1, transform: 'none' }],
    'rise': [{ opacity: 0, transform: 'translateY(110%)' }, { opacity: 1, transform: 'none' }],
    'line': [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
    'slide-r': [{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 1, transform: 'none' }],
    'slide-l': [{ opacity: 0, transform: 'translateX(60px)' }, { opacity: 1, transform: 'none' }],
    'letter-blur': [{ opacity: 0, filter: 'blur(12px)', transform: 'translateY(40%)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }]
  };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function split(el, byWord) {
    var text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    var units = [];
    function unit(parent, str) {
      var mask = document.createElement('span');
      mask.className = 'hi-mask';
      var u = document.createElement('span');
      u.className = 'hi-u';
      u.textContent = str;
      mask.appendChild(u);
      parent.appendChild(mask);
      units.push(u);
    }
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
      // each word is an unbreakable box, so letter splits never wrap mid-word
      var word = document.createElement('span');
      word.className = 'hi-word';
      word.setAttribute('aria-hidden', 'true');
      if (byWord) unit(word, part); else Array.from(part).forEach(function (ch) { unit(word, ch); });
      el.appendChild(word);
    });
    return units;
  }

  function play(el, base) {
    var type = el.getAttribute('data-in');
    var at = base + (+el.getAttribute('data-at') || 0);
    var dur = +el.getAttribute('data-dur') || 900;
    var ease = EASE[el.getAttribute('data-ease')] || EASE.out;
    if (type === 'letters' || type === 'words') {
      var stagger = +el.getAttribute('data-stagger') || (type === 'letters' ? 60 : 120);
      var fx = FX[el.getAttribute('data-fx')] || FX['letter-blur'];
      var units = split(el, type === 'words');
      el.classList.add('hi-on');
      units.forEach(function (u, i) {
        u.animate(fx, { delay: at + i * stagger, duration: dur, easing: ease, fill: 'both' });
      });
      return;
    }
    el.animate(FX[type] || FX['fade-up'], { delay: at, duration: dur, easing: ease, fill: 'both' });
  }

  function init(hero) {
    var video = hero.querySelector('[data-hero-video]');
    var mode = video ? (video.getAttribute('data-mode') || 'scrub') : null;
    var override = new URLSearchParams(location.search).get('video');
    if (video && override && /^https?:\/\//.test(override)) video.src = override;
    if (reduced) hero.classList.add('hi-reduced');

    var started = false;
    function start() {
      if (started) return;
      started = true;
      hero.classList.add('hi-started');
      if (video && mode === 'autoplay' && !reduced) video.play().catch(function () {});
      var items = hero.querySelectorAll('[data-in]');
      if (reduced) { items.forEach(function (el) { el.classList.add('hi-on'); }); return; }
      items.forEach(function (el) { play(el, 60); });
    }

    var src = video && video.getAttribute('src');
    if (src) {
      video.addEventListener('loadeddata', function () { hero.classList.add('has-video'); start(); }, { once: true });
      setTimeout(start, 1600); // never hold the intro hostage to a slow network
      if (mode === 'scrub') {
        // scrubbing needs random access: load the whole clip into memory once.
        // Works even on hosts without HTTP Range support; falls back to streaming on CORS errors.
        video.removeAttribute('src');
        fetch(src).then(function (r) { if (!r.ok) throw r; return r.blob(); })
          .then(function (b) { video.src = URL.createObjectURL(b); })
          .catch(function () { video.src = src; });
      } else {
        video.addEventListener('error', start, { once: true });
        video.load();
      }
    } else {
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
    }

    // scroll progress + scrub
    var vh = +hero.getAttribute('data-scroll');
    if (!vh) return;
    hero.style.height = vh + 'vh';
    var ranges = Array.from(hero.querySelectorAll('[data-scroll-range]')).map(function (el) {
      var r = el.getAttribute('data-scroll-range').split(',').map(Number);
      return { el: el, a: r[0], b: r[1] };
    });
    var target = 0, current = 0;
    function measure() {
      var r = hero.getBoundingClientRect();
      var span = r.height - innerHeight;
      target = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    }
    function tick() {
      current += (target - current) * 0.12; // inertia — makes scrub feel like film, not slides
      if (Math.abs(target - current) < 0.0005) current = target;
      hero.style.setProperty('--p', current.toFixed(4));
      ranges.forEach(function (x) { x.el.classList.toggle('is-on', current >= x.a && current < x.b); });
      if (video && mode === 'scrub' && video.duration && !reduced) {
        var t = current * (video.duration - 0.05);
        if (Math.abs(video.currentTime - t) > 0.02) video.currentTime = t;
      }
      requestAnimationFrame(tick);
    }
    addEventListener('scroll', measure, { passive: true });
    addEventListener('resize', measure);
    measure();
    tick();
  }

  function boot() { document.querySelectorAll('[data-hero]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
