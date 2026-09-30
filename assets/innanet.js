(function () {
  // ---- Mobile menu ----
  var menu = document.getElementById('inn-menu');
  var openBtn = document.querySelector('[data-inn-menu-open]');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('inn-lock', open);
  }
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  document.querySelectorAll('[data-inn-menu-close]').forEach(function (b) {
    b.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // ---- Footer "Email signup" link focuses the form ----
  document.querySelectorAll('[data-inn-signup-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var input = document.querySelector('#inn-signup input[type="email"]');
      if (!input) return;
      e.preventDefault();
      document.querySelector('.inn-footer').classList.add('inn-footer--signup');
      input.focus();
    });
  });

  // ---- Sign-up confirmation ----
  // Shopify sends the visitor back to `return_to` after a sign-up and drops the form
  // state on the way, so the page cannot tell from Liquid alone that it worked. The
  // return address carries ?inn_joined=<form>; a submit that comes back without it
  // did not go through.
  (function () {
    var KEY = 'inn_signup_pending';
    var store = null;
    try { store = window.sessionStorage; } catch (e) {}
    var params = new URLSearchParams(window.location.search);
    var joined = params.get('inn_joined');
    var pending = store ? store.getItem(KEY) : null;
    if (store) store.removeItem(KEY);

    function say(box, text, isError) {
      var form = box.tagName === 'FORM' ? box : box.querySelector('form');
      var p = document.createElement('p');
      p.className = 'inn-signup-msg' + (isError ? ' inn-signup-msg--error' : '');
      p.setAttribute('role', isError ? 'alert' : 'status');
      p.textContent = text;
      if (isError) {
        (form || box).appendChild(p);
      } else {
        if (form) form.hidden = true;
        box.hidden = false;
        (form ? form.parentNode : box).insertBefore(p, form || null);
        box.setAttribute('data-inn-signup-done', '');
      }
    }

    document.querySelectorAll('[data-inn-signup]').forEach(function (box) {
      var name = box.getAttribute('data-inn-signup');
      if (joined === name) {
        say(box, box.getAttribute('data-success') || "You're on the list.", false);
        if (name === 'footer') {
          var footer = document.querySelector('.inn-footer');
          if (footer) footer.classList.add('inn-footer--signup');
        }
      } else if (!joined && pending === name) {
        say(box, 'That did not go through. Check the email and try again.', true);
      }
      var form = box.tagName === 'FORM' ? box : box.querySelector('form');
      if (form) form.addEventListener('submit', function () {
        if (store) store.setItem(KEY, name);
      });
    });

    if (joined) {
      params.delete('inn_joined');
      var q = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash);
    }
  })();

  // ---- Whole tour banner is clickable ----
  document.querySelectorAll('[data-inn-href]').forEach(function (el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      window.open(el.getAttribute('data-inn-href'), '_blank', 'noopener');
    });
  });

  // ---- Product page ----
  var root = document.querySelector('[data-inn-product]');
  if (!root) return;

  var main = root.querySelector('[data-inn-main]');
  var thumbs = root.querySelectorAll('[data-inn-thumb]');
  function showMedia(thumb) {
    if (!thumb || !main) return;
    main.src = thumb.getAttribute('data-src');
    thumbs.forEach(function (t) { t.classList.toggle('is-active', t === thumb); });
  }
  thumbs.forEach(function (t) {
    t.addEventListener('click', function () { showMedia(t); });
  });

  var variants = [];
  try { variants = JSON.parse(root.querySelector('[data-inn-variants]').textContent); } catch (e) {}
  var form = root.querySelector('[data-inn-form]');
  if (!form) return;
  var idInput = form.querySelector('[data-inn-variant-id]');
  var selects = form.querySelectorAll('[data-inn-option]');
  var addBtn = form.querySelector('[data-inn-add]');
  var priceEl = root.querySelector('[data-inn-price]');
  var errorEl = form.querySelector('[data-inn-error]');
  var chosen = selects.length === 0;

  function currentVariant() {
    var values = Array.prototype.map.call(selects, function (s) { return s.value; });
    if (values.indexOf('') !== -1) return null;
    return variants.filter(function (v) {
      return v.options.every(function (o, i) { return o === values[i]; });
    })[0] || null;
  }

  var waitlist = root.querySelector('[data-inn-waitlist]');
  var waitlistTags = root.querySelector('[data-inn-waitlist-tags]');
  function syncWaitlist(v) {
    if (!waitlist) return;
    // A finished sign-up stays visible so the fan sees the confirmation.
    if (waitlist.hasAttribute('data-inn-signup-done') || waitlist.querySelector('[data-inn-waitlist-done]')) { waitlist.hidden = false; return; }
    waitlist.hidden = !v || v.available;
    if (!v || !waitlistTags) return;
    var tags = waitlist.getAttribute('data-base-tags');
    var size = v.options.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (size && size !== 'default-title') tags += ',waitlist-size-' + size;
    waitlistTags.value = tags;
  }

  function sync() {
    var v = currentVariant();
    if (!v) { chosen = false; return; }
    syncWaitlist(v);
    chosen = true;
    idInput.value = v.id;
    if (priceEl) priceEl.innerHTML = v.price;
    addBtn.disabled = !v.available;
    addBtn.textContent = v.available ? 'Add to bag' : 'Sold out';
    if (v.media) showMedia(root.querySelector('[data-media-id="' + v.media + '"]'));
    var url = new URL(window.location.href);
    url.searchParams.set('variant', v.id);
    window.history.replaceState({}, '', url);
  }
  selects.forEach(function (s) { s.addEventListener('change', sync); });
  if (selects.length && currentVariant()) chosen = true;

  function fail(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.hidden = true;
    if (!chosen) {
      fail('Select a ' + (selects[0].getAttribute('aria-label') || 'option').toLowerCase() + ' first.');
      selects[0].focus();
      return;
    }
    addBtn.disabled = true;
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [{ id: Number(idInput.value), quantity: 1 }] })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.data.description || res.data.message || 'Could not add this to your bag.');
        return fetch('/cart.js', { headers: { 'Accept': 'application/json' } }).then(function (r) { return r.json(); });
      })
      .then(function (cart) {
        document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = cart.item_count; });
        document.dispatchEvent(new CustomEvent('cart:change', { detail: cart }));
        if (window.openCartDrawer) { window.openCartDrawer(); }
        else { window.location.href = '/cart'; }
      })
      .catch(function (err) { fail(err.message); })
      .finally(function () {
        var v = currentVariant();
        addBtn.disabled = v ? !v.available : false;
      });
  });
})();
