(function () {
  // 360 turnaround viewer: steps through a preloaded frame sequence as the
  // visitor drags, swipes sideways, or uses the arrow keys. Not true 3D.
  var root = document.querySelector('[data-inn-spin]');
  if (!root) return;

  var stage = root.querySelector('[data-inn-spin-stage]');
  var canvas = root.querySelector('[data-inn-spin-canvas]');
  var hint = root.querySelector('[data-inn-spin-hint]');
  var bar = root.querySelector('[data-inn-spin-bar] i');
  var modes = document.querySelector('[data-inn-spin-modes]');
  var sets;
  try { sets = JSON.parse(document.querySelector('[data-inn-spin-frames]').textContent); } catch (e) { return; }

  // Phones always get the light set; so does any stage too small to need more.
  var need = stage.clientWidth * Math.min(window.devicePixelRatio || 1, 2);
  var small = window.matchMedia('(max-width: 749px)').matches || need <= 620;
  var urls = (small ? sets.m : sets.d) || [];
  var count = urls.length;
  if (count < 2 || !canvas.getContext) return;

  var conn = navigator.connection || {};
  var saver = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dir = root.hasAttribute('data-reverse') ? -1 : 1;
  var ctx = canvas.getContext('2d');
  var frames = new Array(count);
  var loaded = 0;
  var started = false;
  var pos = 0;        // fractional frame position, unbounded
  var shown = -1;
  var raf = 0;

  function wrap(i) { return ((i % count) + count) % count; }

  // Nearest frame that has finished loading, so a drag works mid-download.
  function nearest(i) {
    if (frames[i]) return i;
    for (var d = 1; d <= count / 2; d++) {
      if (frames[wrap(i + d)]) return wrap(i + d);
      if (frames[wrap(i - d)]) return wrap(i - d);
    }
    return -1;
  }

  function draw() {
    raf = 0;
    var i = nearest(wrap(Math.round(pos)));
    if (i < 0 || i === shown) return;
    var img = frames[i];
    if (canvas.width !== img.naturalWidth) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    shown = i;
    root.classList.add('is-live');
  }
  function queue() {
    if (document.hidden) { draw(); return; }  // no animation frames in a hidden tab
    if (!raf) raf = requestAnimationFrame(draw);
  }

  // Coarse pass first (every 6th frame), then fill in, so rotation is usable early.
  function order() {
    var out = [], seen = {};
    [6, 3, 1].forEach(function (step) {
      for (var i = 0; i < count; i += step) if (!seen[i]) { seen[i] = 1; out.push(i); }
    });
    return out;
  }

  function load() {
    if (started) return;
    started = true;
    root.classList.remove('is-waiting');
    hint.textContent = 'Drag to rotate';
    var list = order();
    var active = 0;
    function next() {
      while (active < 6 && list.length) pull(list.shift());
    }
    function pull(i) {
      active++;
      var img = new Image();
      img.decoding = 'async';
      function done(ok) {
        active--;
        loaded++;
        if (ok) { frames[i] = img; shown = -1; queue(); }
        if (bar) bar.style.width = Math.round(loaded / count * 100) + '%';
        if (loaded === count) { root.classList.add('is-loaded'); intro(); }
        next();
      }
      // decode() is a warm-up only; it can hang in a hidden tab, so never wait on it.
      img.onload = function () {
        if (img.decode) img.decode().catch(function () {});
        done(true);
      };
      img.onerror = function () { done(false); };
      img.src = urls[i];
    }
    next();
  }

  // One small back-and-forth so the visitor sees that it turns.
  var touched = false;
  function intro() {
    if (still || touched) return;
    var t0 = performance.now(), span = Math.min(4, count / 6), base = pos;
    (function tick(t) {
      if (touched) return;
      var k = Math.min(1, (t - t0) / 1400);
      pos = base + Math.sin(k * Math.PI) * span;
      queue();
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  function touch() {
    if (touched) return;
    touched = true;
    root.classList.add('is-touched');
  }

  // ---- Drag (mouse, finger, pen) ----
  var dragging = false, lastX = 0, lastT = 0, vel = 0, glide = 0;
  function perFrame() { return Math.max(4, stage.clientWidth * 1.15 / count); }

  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!started) { load(); return; }
    touch();
    cancelAnimationFrame(glide);
    dragging = true;
    lastX = e.clientX; lastT = e.timeStamp; vel = 0;
    stage.classList.add('is-dragging');
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    var dt = Math.max(1, e.timeStamp - lastT);
    var step = dir * dx / perFrame();
    pos += step;
    vel = 0.7 * vel + 0.3 * (step / dt);
    lastX = e.clientX; lastT = e.timeStamp;
    queue();
  });
  function release(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    if (still || e.type === 'pointercancel' || Math.abs(vel) < 0.004) return;
    var prev = performance.now();
    (function coast(t) {
      var dt = Math.min(40, t - prev); prev = t;
      pos += vel * dt;
      vel *= Math.pow(0.94, dt / 16);
      queue();
      if (Math.abs(vel) > 0.002) glide = requestAnimationFrame(coast);
    })(prev);
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

  // ---- Sideways trackpad / wheel swipe. Vertical scroll is left alone. ----
  stage.addEventListener('wheel', function (e) {
    if (!started || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    touch();
    pos -= dir * e.deltaX / perFrame();
    queue();
  }, { passive: false });

  // ---- Keyboard ----
  stage.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    if (!started) load();
    touch();
    pos += (e.key === 'ArrowRight' ? 1 : -1) * dir;
    queue();
  });

  // ---- 360 / Photo switch. Picking a thumbnail or a variant shows the photo. ----
  var main = document.querySelector('[data-inn-main]');
  function setMode(mode) {
    var spin = mode === 'spin';
    root.classList.toggle('is-active', spin);
    if (modes) modes.querySelectorAll('[data-inn-spin-mode]').forEach(function (b) {
      var on = b.getAttribute('data-inn-spin-mode') === mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  if (modes && main) {
    modes.hidden = false;
    modes.addEventListener('click', function (e) {
      var b = e.target.closest('[data-inn-spin-mode]');
      if (b) setMode(b.getAttribute('data-inn-spin-mode'));
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-inn-thumb]')) setMode('photo');
    });
    new MutationObserver(function () { setMode('photo'); })
      .observe(main, { attributes: true, attributeFilter: ['src'] });
  }

  // ---- Start ----
  if (saver) {
    // Data saver or a very slow link: one frame only until the visitor asks.
    root.classList.add('is-waiting');
    hint.textContent = 'Tap to load 360';
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (en) { return en.isIntersecting; })) { io.disconnect(); load(); }
    }, { rootMargin: '200px' });
    io.observe(stage);
  } else {
    load();
  }
})();
