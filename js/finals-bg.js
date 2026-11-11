/* Finals site-wide backgrounds (Settings → Backgrounds).
   Default = current look (mood colours + existing skin/effects).
   Unlocks add Bubbles (RSO), Orbit particles (ATC-Math / Med Physics formulas excl. ch3),
   and theme-selector skins. Auto-enable on unlock applies across the whole site. */
(function (global) {
  'use strict';

  var KEY = 'finals_bg_v1';
  var root = document.documentElement;

  /* Theme-selector skins available as unlockable backgrounds (grid-haze stays with Default). */
  var SKIN_BGS = [
    { id: 'aurora', label: 'Aurora', hint: 'Soft cyan dots' },
    { id: 'violet-mist', label: 'Violet Mist', hint: 'Lavender haze' },
    { id: 'copper-ember', label: 'Copper Ember', hint: 'Warm grid' },
    { id: 'deep-ink', label: 'Deep Ink', hint: 'Dark diagonal wash' },
    { id: 'teal-rift', label: 'Teal Rift', hint: 'Teal and gold lines' },
    { id: 'amber-tide', label: 'Amber Tide', hint: 'Gold lattice' },
    { id: 'summit-amber', label: 'Summit Amber', hint: 'Warm gold field' },
    { id: 'rib-haze', label: 'Rib Haze', hint: 'Vertical ribs' }
  ];

  var FX_BGS = [
    { id: 'bubbles', label: 'Bubbles', hint: 'Soft drifting blobs', unlock: 'bg:bubbles' },
    { id: 'particles', label: 'Orbit', hint: 'Orbiting formula particles', unlock: 'bg:particles' }
  ];

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && typeof v.id === 'string') return v;
    } catch (e) {}
    return { id: 'default' };
  }

  function write(st) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
  }

  function unlocked() {
    try { return JSON.parse(localStorage.getItem('finals_emoji_unlocked_v1') || '{}') || {}; } catch (e) { return {}; }
  }

  function has(key) {
    if (!key) return true;
    if (global.FinalsUnlocks && typeof FinalsUnlocks.has === 'function') return !!FinalsUnlocks.has(key);
    return !!unlocked()[key];
  }

  function skinUnlockKey(skinId) { return 'bg:skin:' + skinId; }

  function options() {
    var list = [{ id: 'default', label: 'Default', hint: 'Current colours and effects', unlock: null }];
    FX_BGS.forEach(function (b) { list.push(b); });
    SKIN_BGS.forEach(function (b) {
      list.push({ id: b.id, label: b.label, hint: b.hint, unlock: skinUnlockKey(b.id), skin: true });
    });
    return list;
  }

  function stopFx() {
    try { if (global.FinalsBgBubbles) FinalsBgBubbles.stop(); } catch (e) {}
    try { if (global.FinalsBgOrbit) FinalsBgOrbit.stop(); } catch (e) {}
  }

function apply(id, opts) {
  var quiet = opts && opts.quiet;
  var st = { id: id || 'default' };
  var got = unlocked();
  var opt = options().filter(function (o) { return o.id === st.id; })[0];
  if (!opt) st.id = 'default';
  else if (opt.unlock && !got[opt.unlock] && !(global.FinalsUnlocks && FinalsUnlocks.has(opt.unlock))) {
    st.id = 'default';
    opt = options()[0];
  }

    stopFx();
    root.removeAttribute('data-finals-bg');
    root.classList.remove('finals-bg-bubbles', 'finals-bg-particles', 'finals-bg-skin');
    root.removeAttribute('data-skin');

if (st.id === 'default' || st.id === 'bubbles' || st.id === 'particles') {
  if (st.id === 'default') {
    root.classList.remove('finals-no-grid');
  } else {
    root.classList.add('finals-no-grid');
  }
} else {
  root.classList.remove('finals-no-grid');
}

    if (st.id === 'default') {
    root.setAttribute('data-finals-bg', 'default');
    if (typeof applySkin === 'function') try { applySkin(); } catch (e) {}
    else root.setAttribute('data-skin', 'grid-haze');
  } else {
    root.setAttribute('data-finals-bg', st.id);
    if (st.id === 'bubbles') {
      root.classList.add('finals-bg-bubbles');
      if (global.FinalsBgBubbles) FinalsBgBubbles.start();
    } else if (st.id === 'particles') {
      root.classList.add('finals-bg-particles');
      if (global.FinalsBgOrbit) FinalsBgOrbit.start();
    } else {
      root.classList.add('finals-bg-skin');
      root.setAttribute('data-skin', st.id);
    }
  }

  write(st);
  paintPicker();
  if (!quiet) {
    try { document.dispatchEvent(new CustomEvent('finals-bg-changed', { detail: st.id })); } catch (e) {}
  }
  return st.id;
}

  function select(id) { return apply(id, { quiet: false }); }

  function current() { return read().id || 'default'; }

  /* Auto-enable a newly unlocked background site-wide. */
  function onUnlock(keys) {
    if (!keys || !keys.length) return;
    var map = {
      'bg:bubbles': 'bubbles',
      'bg:particles': 'particles'
    };
    SKIN_BGS.forEach(function (b) { map[skinUnlockKey(b.id)] = b.id; });
    /* Prefer the highest-tier unlock in this batch (last matching). */
    var pick = null;
    keys.forEach(function (k) {
      if (map[k]) pick = map[k];
      if (global.FinalsUnlocks && FinalsUnlocks.list) {
        FinalsUnlocks.list.forEach(function (u) {
          if ((u.emoji === k || u.key === k || u.bgKey === k) && u.bg) pick = u.bg;
        });
      }
    });
    if (pick) apply(pick, { quiet: false });
  }

  function paintPicker() {
    var host = document.getElementById('finalsBgList');
    if (!host) return;
    var cur = current();
    var got = unlocked();
    host.innerHTML = '';
    options().forEach(function (o) {
      var open = !o.unlock || !!got[o.unlock] || (global.FinalsUnlocks && FinalsUnlocks.has(o.unlock));
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'finals-bg-opt' + (o.id === cur ? ' active' : '') + (open ? '' : ' locked');
      btn.dataset.bg = o.id;
      btn.disabled = !open;
      btn.setAttribute('aria-pressed', o.id === cur ? 'true' : 'false');
      btn.innerHTML = '<span class="finals-bg-opt-name">' + o.label + (open ? '' : ' 🔒') + '</span>'
        + '<span class="finals-bg-opt-hint">' + (open ? o.hint : 'Solve Medical Physics questions to unlock') + '</span>';
      if (open) {
        btn.addEventListener('click', function () { select(o.id); });
      }
      host.appendChild(btn);
    });
  }

  function ensurePanel() {
    if (document.getElementById('settings-panel-backgrounds')) return;
    var nav = document.querySelector('.settings-nav');
    var panels = document.querySelector('.settings-panels');
    if (!nav || !panels) return;
    var btn = document.createElement('button');
    btn.className = 'settings-nav-btn';
    btn.setAttribute('data-panel', 'backgrounds');
    btn.setAttribute('onclick', "openSettingsPanel('backgrounds')");
    btn.textContent = 'Backgrounds';
    /* Insert after Theme */
    var themeBtn = nav.querySelector('[data-panel="general"]');
    if (themeBtn && themeBtn.nextSibling) nav.insertBefore(btn, themeBtn.nextSibling);
    else nav.appendChild(btn);

    var panel = document.createElement('div');
    panel.className = 'settings-panel';
    panel.id = 'settings-panel-backgrounds';
    panel.innerHTML = '<div class="settings-panel-title">Backgrounds</div>'
      + '<p class="setting-item-desc" style="margin:0 0 14px;">Default keeps your current look. Unlocks from Medical Physics add more backgrounds for the whole site.</p>'
      + '<div class="finals-bg-list" id="finalsBgList" role="listbox" aria-label="Backgrounds"></div>';
    panels.appendChild(panel);
  }

  function wire() {
    ensurePanel();
    apply(read().id || 'default', { quiet: true });
    paintPicker();
    document.addEventListener('finals-unlocked', function (e) {
      onUnlock(e.detail || []);
      paintPicker();
    });
    /* Re-apply skin choice when mood changes if a skin bg is active */
    document.addEventListener('finals-basic', function () { apply(current(), { quiet: true }); });
  }

  /* Hook applySkin so a chosen skin background is not overwritten by the fixed grid-haze default. */
function patchApplySkin() {
  if (typeof global.applySkin !== 'function' || global.applySkin._finalsBg) return;
  var orig = global.applySkin;
  global.applySkin = function () {
    var id = current();
    if (id && id !== 'default') {
      return;
    }
    return orig.apply(this, arguments);
  };
  global.applySkin._finalsBg = true;
}

  global.FinalsBg = {
    select: select,
    apply: apply,
    current: current,
    options: options,
    skinUnlockKey: skinUnlockKey,
    skins: SKIN_BGS,
    paint: paintPicker,
    onUnlock: onUnlock
  };


  function patchAccentLock() {
    if (typeof global.changeAccentColor !== 'function' || global.changeAccentColor._finalsLock) return;
    var orig = global.changeAccentColor;
    global.changeAccentColor = function (hex, strength) {
      try { if (localStorage.getItem('finals_accent_lock') === '1') return; } catch (e) {}
      return orig.apply(this, arguments);
    };
    global.changeAccentColor._finalsLock = true;
  }
  function boot() {
    patchApplySkin();
    patchAccentLock();
    wire();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : globalThis);
