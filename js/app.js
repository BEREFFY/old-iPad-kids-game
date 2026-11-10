/* Petits Jeux — toddler games for an iPad 3 (iOS 9.3, Safari 9).
   Written in plain ES5 on purpose: no let/const, arrow functions, classes or template strings. */
(function () {
  'use strict';

  // =====================================================================
  // Basics
  // =====================================================================
  var BAR = 96;
  function $(id) { return document.getElementById(id); }
  function W() { return window.innerWidth; }
  function H() { return window.innerHeight; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function each(list, fn) { for (var i = 0; i < list.length; i++) { fn(list[i], i); } }
  function shuffle(list) {
    var a = list.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function el(tag, cls, parent, html) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (html) { e.innerHTML = html; }
    if (parent) { parent.appendChild(e); }
    return e;
  }
  function place(e, x, y, w, h) {
    e.style.left = Math.round(x) + 'px'; e.style.top = Math.round(y) + 'px';
    e.style.width = Math.round(w) + 'px'; e.style.height = Math.round(h) + 'px';
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function store(key, val) {
    try {
      if (val === undefined) { return JSON.parse(localStorage.getItem(key)); }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
    return null;
  }
  function restartAnim(e, cls) {
    e.className = e.className.replace(new RegExp(' ' + cls, 'g'), '');
    void e.offsetWidth;
    e.className += ' ' + cls;
  }
  function hasClass(e, c) { return (' ' + e.className + ' ').indexOf(' ' + c + ' ') >= 0; }
  function addClass(e, c) { if (!hasClass(e, c)) { e.className += ' ' + c; } }
  function removeClass(e, c) { e.className = (' ' + e.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, ''); }

  // Picture (Twemoji SVG). Emoji text cannot be drawn large on iOS 9, pictures can.
  function pic(code, size) {
    size = Math.floor(size);
    return '<img src="e/' + code + '.svg" alt="" style="position:absolute;left:50%;top:50%;width:' + size +
      'px;height:' + size + 'px;margin:' + (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px">';
  }
  function inlinePic(code, size) {
    return '<img src="e/' + code + '.svg" alt="" style="width:' + size + 'px;height:' + size + 'px">';
  }

  // Simple line icons.
  var SVGA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">';
  var ICON = {
    back: SVGA + '<path d="M15 4.5L7.5 12l7.5 7.5"/></svg>',
    restart: SVGA + '<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 4v4.5h4.5"/></svg>',
    home: SVGA + '<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/></svg>',
    speaker: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9h4l5.5-4.5v15L7 15H3z"/>' +
      '<path d="M16 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M7 4.5c0-1 1-1.5 1.8-1L20 10.6c.8.6.8 1.8 0 2.4L8.8 20.5c-.8.5-1.8 0-1.8-1z"/></svg>',
    playSmall: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5c0-1 1-1.5 1.8-1L20 10.6c.8.6.8 1.8 0 2.4L8.8 20.5c-.8.5-1.8 0-1.8-1z"/></svg>',
    trash: SVGA + '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg>',
    random: SVGA + '<path d="M4 7h3c5 0 5 10 10 10h3M17 14l3 3-3 3M4 17h3c1.5 0 2.5-.8 3.3-2M13.7 9c.8-1.2 1.8-2 3.3-2h3M17 4l3 3-3 3"/></svg>'
  };
  function star(filled) {
    return '<svg viewBox="0 0 24 24"><path fill="' + (filled ? '#ffc93c' : '#ece5f5') + '" stroke="' + (filled ? '#e5a90f' : '#ddd3ea') +
      '" stroke-width="1.2" stroke-linejoin="round" d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z"/></svg>';
  }

  // Touch handling.
  // onPress: for buttons; fires when the finger lifts (needed so iOS 9 allows sound).
  // onDown: for game play; fires immediately when the finger touches.
  function onPress(e, fn) {
    var sx = 0, sy = 0;
    e.addEventListener('touchstart', function (ev) { var t = ev.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, false);
    e.addEventListener('touchend', function (ev) {
      ev.preventDefault();
      var t = ev.changedTouches[0];
      if (Math.abs(t.clientX - sx) < 40 && Math.abs(t.clientY - sy) < 40) { unlockAudio(); fn(ev); }
    }, false);
    e.addEventListener('click', function (ev) { unlockAudio(); fn(ev); }, false);
  }
  function onDown(e, fn) {
    e.addEventListener('touchstart', function (ev) {
      ev.preventDefault();
      for (var i = 0; i < ev.changedTouches.length; i++) { fn(ev.changedTouches[i], ev); }
    }, false);
    e.addEventListener('mousedown', function (ev) { fn(ev, ev); }, false);
  }
  document.addEventListener('touchmove', function (ev) { ev.preventDefault(); }, false);
  document.addEventListener('gesturestart', function (ev) { ev.preventDefault(); }, false);

  // =====================================================================
  // Sound
  // =====================================================================
  var actx = null;
  function unlockAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return; }
    if (!actx) {
      actx = new AC();
      // Play a silent sound inside the touch: this unlocks audio on iOS.
      var buf = actx.createBuffer(1, 1, 22050), src = actx.createBufferSource();
      src.buffer = buf; src.connect(actx.destination);
      if (src.start) { src.start(0); } else { src.noteOn(0); }
    }
    if (actx.state === 'suspended' && actx.resume) { actx.resume(); }
  }
  // iOS 9 only unlocks audio on touchend, so listen for it everywhere.
  document.addEventListener('touchend', unlockAudio, false);
  document.addEventListener('mouseup', unlockAudio, false);

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!actx) { return; }
    var t = actx.currentTime + (delay || 0);
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) { o.frequency.exponentialRampToValueAtTime(slideTo, t + dur); }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(actx.destination);
    if (o.start) { o.start(t); o.stop(t + dur + 0.05); } else { o.noteOn(t); o.noteOff(t + dur + 0.05); }
  }
  var SFX = {
    click: function () { tone(660, 0.08, 'sine', 0.2); },
    pop: function () { tone(rand(500, 900), 0.12, 'sine', 0.45, 120); },
    boing: function (f) { tone(f || 300, 0.35, 'triangle', 0.35, (f || 300) * 1.6); },
    good: function () { tone(523, 0.18, 'triangle', 0.35); tone(659, 0.18, 'triangle', 0.35, 0, 0.12); tone(784, 0.3, 'triangle', 0.35, 0, 0.24); },
    bad: function () { tone(300, 0.25, 'sine', 0.25, 200); },
    swoosh: function () { tone(900, 0.35, 'sine', 0.2, 150); },
    fanfare: function () { each([523, 659, 784, 1047, 784, 1047], function (f, i) { tone(f, 0.28, 'triangle', 0.35, 0, i * 0.14); }); }
  };

  var lang = store('lang') || 'fr';
  if (!I18N[lang]) { lang = 'fr'; }
  function T() { return I18N[lang]; }
  function say(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { return; }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = T().voice; u.rate = 0.9; u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function praise() { return pick(T().praise); }

  // =====================================================================
  // Data
  // =====================================================================
  var ANIMALS = [
    { c: '1f42e', k: 'cow', f: 220 }, { c: '1f437', k: 'pig', f: 330 }, { c: '1f436', k: 'dog', f: 392 },
    { c: '1f431', k: 'cat', f: 523 }, { c: '1f411', k: 'sheep', f: 294 }, { c: '1f425', k: 'chick', f: 660 },
    { c: '1f438', k: 'frog', f: 196 }, { c: '1f981', k: 'lion', f: 147 }, { c: '1f435', k: 'monkey', f: 440 },
    { c: '1f434', k: 'horse', f: 262 }, { c: '1f430', k: 'rabbit', f: 587 }, { c: '1f418', k: 'elephant', f: 131 },
    { c: '1f986', k: 'duck', f: 494 }, { c: '1f43b', k: 'bear', f: 165 }, { c: '1f989', k: 'owl', f: 349 }
  ];
  function aName(a) { return T().animals[a.k][0]; }
  function aFull(a) { var x = T().animals[a.k]; return cap(x[0]) + '. ' + x[1]; }
  function where(a) { return T().where.replace('{x}', aName(a)); }

  var COLORS = ['#ef4b5c', '#ff8a2a', '#ffd23f', '#3fc27a', '#3b8beb', '#8f5ce0', '#ff7eb6', '#9a6236'];
  var NOTES = [262, 294, 330, 349, 392, 440, 494, 523];
  var SONGS = [
    [0, 1, 2, 0, 0, 1, 2, 0, 2, 3, 4, 2, 3, 4],
    [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
    [0, 0, 0, 1, 2, 1, 0, 2, 1, 1, 0]
  ];

  // =====================================================================
  // Progress (best stars per game and level)
  // =====================================================================
  var best = store('best') || {};
  function bestOf(id, lv) { return (best[id] && best[id][lv]) || 0; }
  function saveBest(id, lv, s) {
    if (!best[id]) { best[id] = {}; }
    if (s > bestOf(id, lv)) { best[id][lv] = s; store('best', best); }
  }
  function starsFromMistakes(m, a, b) { return m <= a ? 3 : (m <= b ? 2 : 1); }

  // =====================================================================
  // Layout helpers
  // =====================================================================
  // Best grid for n squares in a w x h box.
  function fitGrid(n, w, h, gap) {
    var bestC = 1, bestS = 0;
    for (var c = 1; c <= n; c++) {
      var r = Math.ceil(n / c);
      var s = Math.min((w - gap * (c + 1)) / c, (h - gap * (r + 1)) / r);
      if (s > bestS) { bestS = s; bestC = c; }
    }
    var rows = Math.ceil(n / bestC), out = [];
    var ox = (w - (bestC * bestS + (bestC - 1) * gap)) / 2;
    var oy = (h - (rows * bestS + (rows - 1) * gap)) / 2;
    for (var i = 0; i < n; i++) {
      var row = Math.floor(i / bestC), col = i % bestC;
      var inRow = Math.min(bestC, n - row * bestC);
      var rowOx = ox + (bestC - inRow) * (bestS + gap) / 2; // centre a short last row
      out.push({ x: rowOx + col * (bestS + gap), y: oy + row * (bestS + gap), s: bestS });
    }
    return out;
  }
  function dotsHTML(done, total, color) {
    var h = '<div class="dots">';
    for (var i = 0; i < total; i++) { h += '<div class="dot"' + (i < done ? ' style="background:' + color + '"' : '') + '></div>'; }
    return h + '</div>';
  }

  // =====================================================================
  // Screens and overlay
  // =====================================================================
  var currentScreen = 'start';
  function showScreen(name) {
    $(currentScreen).className = 'screen';
    currentScreen = name;
    $(name).className = 'screen on';
  }
  var overlayOpen = false;
  function openSheet(html) {
    $('sheet').innerHTML = html;
    // restart the pop-in animation
    var s = $('sheet'); s.style.webkitAnimation = 'none'; s.style.animation = 'none'; void s.offsetWidth;
    s.style.webkitAnimation = ''; s.style.animation = '';
    $('overlay').className = 'on';
    overlayOpen = true;
  }
  function closeSheet() { $('overlay').className = ''; overlayOpen = false; }

  // =====================================================================
  // Start screen
  // =====================================================================
  function renderStart() {
    $('appTitle').innerHTML = T().appTitle;
    $('appSub').innerHTML = T().appSub;
    $('soundHint').innerHTML = T().soundHint;
    document.title = T().appTitle;
    each(document.querySelectorAll('.lang'), function (e) {
      e.className = 'lang' + (e.getAttribute('data-lang') === lang ? ' sel' : '');
    });
  }
  (function buildStart() {
    $('playBtn').innerHTML = ICON.play;
    var deco = [['1f42e', 7, 9], ['1f438', 82, 8], ['1f981', 4, 42], ['1f436', 86, 40], ['1f425', 3, 70], ['1f430', 87, 68]];
    each(deco, function (d, i) {
      var e = el('div', 'deco', $('start'), inlinePic(d[0], 110));
      e.style.left = d[1] + '%'; e.style.top = d[2] + '%';
      e.style.webkitAnimationDelay = (i * 0.5) + 's'; e.style.animationDelay = (i * 0.5) + 's';
    });
    each(document.querySelectorAll('.lang'), function (e) {
      onPress(e, function () { setLang(e.getAttribute('data-lang')); SFX.click(); });
    });
    onPress($('playBtn'), function () {
      SFX.good();
      say(T().hello);
      openMenu();
    });
    renderStart();
  })();

  function setLang(l) {
    lang = l; store('lang', l);
    document.documentElement.lang = l;
    renderStart();
    if (currentScreen === 'menu') { renderMenu(); }
    if (currentScreen === 'game') { renderGameBar(); }
  }

  // =====================================================================
  // Menu
  // =====================================================================
  var GAMES = [
    { id: 'animals', icon: '1f42e', color: '#3fbf8f', levels: 3, scored: [0, 1, 1] },
    { id: 'bubbles', icon: '1f388', color: '#3b8beb', levels: 3, scored: [1, 1, 1] },
    { id: 'paint', icon: '1f3a8', color: '#ff8a2a', levels: 3, scored: [0, 0, 0], chips: ['1f58c', '1f308', '1f43e'] },
    { id: 'peek', icon: '1f648', color: '#ef4b6c', levels: 3, scored: [0, 1, 1] },
    { id: 'piano', icon: '1f3b9', color: '#8f5ce0', levels: 3, scored: [0, 1, 1], chips: ['1f3b9', '2728', '1f4a1'] },
    { id: 'memory', icon: '1f0cf', color: '#ff6fa8', levels: 4, scored: [1, 1, 1, 1] }
  ];
  function gameById(id) { for (var i = 0; i < GAMES.length; i++) { if (GAMES[i].id === id) { return GAMES[i]; } } return null; }

  function iconBox(boxEl, code, color, size) {
    boxEl.style.background = color;
    boxEl.innerHTML = pic(code, size);
  }

  function renderMenu() {
    $('menuHome').innerHTML = ICON.home;
    iconBox($('menuLogo'), '1f31f', '#ffc93c', 42);
    $('menuTitle').innerHTML = T().appTitle;
    $('menuSub').innerHTML = T().appSub;
    $('menuLang').innerHTML = T().language + ' · ' + lang.toUpperCase();
    var grid = $('menuGrid');
    grid.innerHTML = '';
    var w = W(), h = H() - BAR, gap = 24;
    var cols = w > h ? 3 : 2, rows = Math.ceil(GAMES.length / cols);
    var cw = (w - gap * (cols + 1)) / cols, ch = (h - gap * (rows + 1)) / rows;
    each(GAMES, function (g, i) {
      var c = el('div', 'gcard', grid);
      place(c, gap + (i % cols) * (cw + gap), gap + Math.floor(i / cols) * (ch + gap), cw, ch);
      var artH = ch - 118;
      var art = el('div', 'art', c);
      art.style.height = artH + 'px'; art.style.background = g.color;
      var ring = el('div', 'ring', art);
      var rs = Math.min(cw, artH) * 0.8;
      place(ring, (cw - rs) / 2, (artH - rs) / 2, rs, rs);
      art.innerHTML += pic(g.icon, Math.min(cw, artH) * 0.58);
      var txt = el('div', 'txt', c);
      var gt = T().games[g.id];
      var total = 0, max = 0;
      for (var lv = 0; lv < g.levels; lv++) { if (g.scored[lv]) { max += 3; total += bestOf(g.id, lv); } }
      txt.innerHTML = '<div class="t">' + gt.t + '</div><div class="s">' + gt.s + '</div>' +
        '<div class="stars">' + (max ? star(total > 0) + total + ' / ' + max : '&nbsp;') + '</div>';
      onPress(c, function () { SFX.boing(300 + i * 60); openGame(g.id); });
    });
  }
  onPress($('menuHome'), function () { SFX.click(); showScreen('start'); });
  onPress($('menuLang'), function () {
    SFX.click();
    var names = { fr: 'Français', en: 'English', de: 'Deutsch', ru: 'Русский' };
    var h = '<h2>' + T().language + '</h2><div style="margin-top:18px">';
    each(['fr', 'en', 'de', 'ru'], function (l) {
      h += '<div class="langbtn' + (l === lang ? ' sel' : '') + '" data-l="' + l + '">' + names[l] + '</div>';
    });
    openSheet(h + '</div>');
    each($('sheet').querySelectorAll('.langbtn'), function (b) {
      onPress(b, function () { setLang(b.getAttribute('data-l')); SFX.click(); closeSheet(); });
    });
  });
  function openMenu() {
    stopGame();
    closeSheet();
    showScreen('menu');
    renderMenu();
  }

  // =====================================================================
  // Game frame: bar, levels, help, win
  // =====================================================================
  var game = null;      // current game definition
  var level = 0;
  var running = null;   // { stop: fn }
  var session = 0;      // increases on every (re)start; old timers check it

  function renderGameBar() {
    var g = game, gt = T().games[g.id];
    $('gBack').innerHTML = ICON.back;
    $('gRestart').innerHTML = ICON.restart;
    iconBox($('gIcon'), g.icon, g.color, 44);
    $('gTitle').innerHTML = gt.t;
    $('gSub').innerHTML = T().level + ' ' + (level + 1) + ' · ' + gt.lv[level];
    var lv = $('gLevels');
    lv.innerHTML = '';
    for (var i = 0; i < g.levels; i++) {
      (function (i) {
        var c = el('div', 'chip' + (i === level ? ' sel' : ''), lv, g.chips ? inlinePic(g.chips[i], 32) : String(i + 1));
        if (i === level) { c.style.background = g.color; }
        onPress(c, function () { if (i !== level) { SFX.click(); startLevel(i); } });
      })(i);
    }
  }

  function openGame(id) {
    game = gameById(id);
    var saved = store('level_' + id);
    level = (saved !== null && saved < game.levels) ? saved : 0;
    showScreen('game');
    startLevel(level);
    if (!store('seen_' + id)) { store('seen_' + id, 1); showHelp(); }
  }

  function startLevel(lv) {
    stopGame();
    closeSheet();
    level = lv;
    store('level_' + game.id, lv);
    renderGameBar();
    $('gInfo').innerHTML = '';
    // A fresh play area each time, so old touch handlers never pile up.
    $('stage').innerHTML = '';
    var stage = el('div', '', $('stage'));
    stage.style.position = 'absolute'; stage.style.left = stage.style.top = stage.style.right = stage.style.bottom = '0';
    stage.style.overflow = 'hidden';
    session++;
    var mySession = session;
    var api = {
      stage: stage, w: W(), h: H() - BAR, level: lv, color: game.color,
      later: function (fn, ms) { setTimeout(function () { if (mySession === session) { fn(); } }, ms); },
      alive: function () { return mySession === session; },
      info: function (html) { $('gInfo').innerHTML = html; return $('gInfo'); },
      sub: function (text) { $('gSub').innerHTML = T().level + ' ' + (lv + 1) + ' · ' + text; },
      win: function (stars) { if (mySession === session) { showWin(stars); } }
    };
    running = GAME_IMPL[game.id](api) || {};
  }
  function stopGame() {
    session++;
    if (running && running.stop) { running.stop(); }
    running = null;
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  onPress($('gBack'), function () { SFX.click(); openMenu(); });
  onPress($('gRestart'), function () { SFX.swoosh(); startLevel(level); });
  onPress($('gHelp'), function () { SFX.click(); showHelp(); });

  function sheetIcon(code, color) {
    return '<div class="sh-icon" style="background:' + color + '">' + pic(code, 72) + '</div>';
  }

  function showHelp() {
    var g = game, gt = T().games[g.id];
    var h = sheetIcon(g.icon, g.color) + '<h2>' + gt.t + '</h2><div class="sub">' + T().howTo + '</div><div class="steps">';
    each(gt.h, function (s, i) {
      h += '<div class="step"><div class="num" style="background:' + g.color + '">' + (i + 1) + '</div><span>' + s + '</span></div>';
    });
    h += '</div><div><div class="btn" id="hListen">' + ICON.speaker + T().listen + '</div>' +
      '<div class="btn primary" id="hGo">' + ICON.playSmall + T().letsGo + '</div></div>';
    openSheet(h);
    onPress($('hListen'), function () { say(gt.t + '. ' + gt.h.join(' ')); });
    onPress($('hGo'), function () { SFX.click(); if (window.speechSynthesis) { window.speechSynthesis.cancel(); } closeSheet(); });
  }

  function showWin(stars) {
    saveBest(game.id, level, stars);
    SFX.fanfare();
    say(T().bravo);
    var h = sheetIcon('1f3c6', '#ffc93c') + '<h2>' + T().bravo + '</h2>' +
      '<div class="sub">' + T().games[game.id].t + ' · ' + T().level + ' ' + (level + 1) + '</div><div class="bigstars">';
    for (var i = 0; i < 3; i++) {
      h += star(i < stars).replace('<svg', '<svg style="-webkit-animation-delay:' + (0.3 + i * 0.25) + 's;animation-delay:' + (0.3 + i * 0.25) + 's"');
    }
    h += '</div><div><div class="btn" id="wMenu">' + ICON.home + T().menu + '</div>' +
      '<div class="btn" id="wAgain">' + ICON.restart + T().replay + '</div>';
    if (level < game.levels - 1) { h += '<div class="btn primary" id="wNext">' + ICON.playSmall + T().next + '</div>'; }
    openSheet(h + '</div>');
    onPress($('wMenu'), function () { SFX.click(); openMenu(); });
    onPress($('wAgain'), function () { SFX.click(); startLevel(level); });
    if ($('wNext')) { onPress($('wNext'), function () { SFX.click(); startLevel(level + 1); }); }
  }

  // =====================================================================
  // The games
  // =====================================================================
  var GAME_IMPL = {};

  // ---------- 1. Animals: listen, then find ----------
  GAME_IMPL.animals = function (api) {
    var stage = api.stage;
    stage.style.background = '#e9f8f1';
    if (api.level === 0) {
      var boxes = fitGrid(ANIMALS.length, api.w, api.h, 18);
      each(ANIMALS, function (a, i) {
        var b = boxes[i], t = el('div', 'tile', stage);
        place(t, b.x, b.y, b.s, b.s);
        t.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;bottom:' + Math.round(b.s * 0.2) + 'px">' + pic(a.c, b.s * 0.58) + '</div>' +
          '<div class="cap" style="font-size:' + Math.max(15, Math.round(b.s * 0.11)) + 'px">' + cap(aName(a)) + '</div>';
        onDown(t, function () { restartAnim(t, 'bounce'); SFX.boing(a.f); say(aFull(a)); });
      });
      return {};
    }
    var n = api.level === 1 ? 3 : 6, goal = 5, done = 0, mistakes = 0, busy = false, target = null, lastTarget = null;
    function renderInfo() {
      var inf = api.info('<div class="ib first" id="askAgain">' + ICON.speaker + '</div>' + dotsHTML(done, goal, api.color));
      onPress(inf.querySelector('#askAgain'), function () { if (target) { say(where(target)); } });
    }
    function round() {
      stage.innerHTML = '';
      busy = false;
      var pool = shuffle(ANIMALS);
      target = pool[0];
      if (lastTarget && target.k === lastTarget.k) { target = pool[1]; pool[1] = pool[0]; pool[0] = target; }
      lastTarget = target;
      var options = shuffle(pool.slice(0, n));
      var boxes = fitGrid(n, api.w, api.h, 34);
      each(options, function (a, i) {
        var b = boxes[i], t = el('div', 'tile', stage, pic(a.c, b.s * 0.72));
        place(t, b.x, b.y, b.s, b.s);
        onDown(t, function () {
          if (busy) { return; }
          if (a.k === target.k) {
            busy = true;
            addClass(t, 'good'); restartAnim(t, 'bounce');
            SFX.good(); say(praise() + ' ' + T().animals[a.k][1]);
            done++; renderInfo();
            api.later(function () {
              if (done >= goal) { api.win(starsFromMistakes(mistakes, 1, 3)); } else { round(); }
            }, 1700);
          } else {
            mistakes++;
            restartAnim(t, 'shake'); SFX.bad(); say(cap(aName(a)));
            busy = true;
            api.later(function () { busy = false; say(where(target)); }, 1300);
          }
        });
      });
      renderInfo();
      api.later(function () { say(where(target)); }, 500);
    }
    round();
    return {};
  };

  // ---------- 2. Bubbles ----------
  GAME_IMPL.bubbles = function (api) {
    var stage = api.stage;
    stage.style.background = '#dff0ff';
    stage.style.backgroundImage = 'linear-gradient(180deg, #e8f6ff 0%, #bfe0ff 100%)';
    var cfg = [
      { v: [45, 75], r: [70, 100], max: 6, animals: 0 },
      { v: [100, 160], r: [52, 80], max: 8, animals: 0.35 },
      { v: [55, 95], r: [62, 92], max: 8, animals: 0, colorMode: true }
    ][api.level];
    var goal = 15, score = 0, mistakes = 0, list = [], alive = true, last = 0;
    var palette = cfg.colorMode ? [0, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6];
    var target = cfg.colorMode ? pick(palette) : -1;

    function renderInfo() {
      var h = '';
      if (cfg.colorMode) {
        h += '<div class="ib first" id="askColor" style="background:' + COLORS[target] + ';color:#fff">' + ICON.speaker + '</div>';
      }
      h += '<div class="counter" style="margin-left:10px">' + inlinePic('1f388', 32) + score + ' / ' + goal + '</div>';
      var inf = api.info(h);
      if (cfg.colorMode) { onPress(inf.querySelector('#askColor'), sayColor); }
    }
    function sayColor() { say(T().colorQ.replace('{c}', T().colors[target])); }

    function add(startInside) {
      var r = rand(cfg.r[0], cfg.r[1]);
      var ci = (cfg.colorMode && Math.random() < 0.45) ? target : pick(palette);
      var b = { r: r, x: rand(r, api.w - r), y: startInside ? rand(api.h * 0.35, api.h + r) : api.h + r,
        v: rand(cfg.v[0], cfg.v[1]), w: rand(0, 6), ci: ci, animal: null };
      if (Math.random() < cfg.animals) { b.animal = pick(ANIMALS); }
      b.e = el('div', 'bub', stage, '<div class="shine"></div>' + (b.animal ? pic(b.animal.c, r * 1.15) : ''));
      b.e.style.width = b.e.style.height = (2 * r) + 'px';
      b.e.style.background = COLORS[ci];
      b.e.style.opacity = b.animal ? '0.95' : '0.85';
      list.push(b);
    }
    for (var i = 0; i < cfg.max - 2; i++) { add(true); }

    function frame(ts) {
      if (!alive) { return; }
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016; last = ts;
      if (list.length < cfg.max && Math.random() < 0.04) { add(false); }
      for (var i = list.length - 1; i >= 0; i--) {
        var b = list[i];
        b.y -= b.v * dt; b.w += dt * 2;
        b.dx = b.x + Math.sin(b.w) * 14;
        if (b.y < -b.r * 2) { stage.removeChild(b.e); list.splice(i, 1); continue; }
        var tr = 'translate3d(' + Math.round(b.dx - b.r) + 'px,' + Math.round(b.y - b.r) + 'px,0)';
        b.e.style.webkitTransform = tr; b.e.style.transform = tr;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function burst(b) {
      for (var k = 0; k < 8; k++) {
        (function (k) {
          var d = el('div', 'bit', stage);
          d.style.background = COLORS[b.ci];
          d.style.left = (b.dx - 9) + 'px'; d.style.top = (b.y - 9) + 'px';
          void d.offsetWidth;
          var a = k / 8 * Math.PI * 2, dist = b.r + 40;
          var tr = 'translate(' + Math.round(Math.cos(a) * dist) + 'px,' + Math.round(Math.sin(a) * dist) + 'px) scale(0.3)';
          d.style.webkitTransform = tr; d.style.transform = tr; d.style.opacity = '0';
          setTimeout(function () { if (d.parentNode) { d.parentNode.removeChild(d); } }, 550);
        })(k);
      }
    }

    onDown(stage, function (pt) {
      if (overlayOpen) { return; }
      var x = pt.clientX, y = pt.clientY - BAR;
      for (var i = list.length - 1; i >= 0; i--) {
        var b = list[i], dx = x - b.dx, dy = y - b.y;
        if (dx * dx + dy * dy < (b.r + 28) * (b.r + 28)) {
          if (cfg.colorMode && b.ci !== target) {
            mistakes++; restartAnim(b.e, 'wobble'); SFX.bad();
            return;
          }
          burst(b); SFX.pop();
          if (b.animal) { say(cap(aName(b.animal))); }
          stage.removeChild(b.e); list.splice(i, 1);
          score++; renderInfo();
          if (score >= goal) {
            alive = false;
            api.later(function () { api.win(cfg.colorMode ? starsFromMistakes(mistakes, 2, 5) : 3); }, 500);
          } else if (cfg.colorMode && score % 5 === 0) {
            var old = target;
            while (target === old) { target = pick(palette); }
            renderInfo();
            api.later(sayColor, 300);
          }
          return;
        }
      }
    });
    renderInfo();
    if (cfg.colorMode) { api.later(sayColor, 500); }
    return { stop: function () { alive = false; } };
  };

  // ---------- 3. Painting ----------
  GAME_IMPL.paint = function (api) {
    var stage = api.stage;
    stage.style.background = '#fffdf8';
    var toolH = 112, ch = api.h - toolH;
    var cv = el('canvas', '', stage);
    cv.style.position = 'absolute'; cv.style.left = '0'; cv.style.top = '0';
    var ratio = window.devicePixelRatio > 1 ? 2 : 1;
    cv.width = api.w * ratio; cv.height = ch * ratio;
    cv.style.width = api.w + 'px'; cv.style.height = ch + 'px';
    var c = cv.getContext('2d');
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
    c.lineCap = 'round'; c.lineJoin = 'round';
    var stamps = el('div', '', stage);
    stamps.style.position = 'absolute'; stamps.style.left = '0'; stamps.style.top = '0';
    stamps.style.width = api.w + 'px'; stamps.style.height = ch + 'px'; stamps.style.overflow = 'hidden';
    stamps.style.pointerEvents = 'none';

    var mode = api.level; // 0 brush, 1 rainbow, 2 stamps
    var color = store('paintColor') || COLORS[0], hue = 0;
    var sizes = mode === 2 ? [90, 130, 180] : [14, 30, 56];
    var size = sizes[1];
    var stampAnimal = null; // null = random

    var bar = el('div', 'toolbar', stage);
    var sizeEls = [];
    each(sizes, function (s, i) {
      var sw = el('div', 'sw' + (s === size ? ' sel' : ''), bar);
      sw.style.background = '#fff';
      var d = Math.round(10 + i * 12);
      sw.innerHTML = '<div class="sizedot" style="width:' + d + 'px;height:' + d + 'px;margin:' + (-d / 2) + 'px 0 0 ' + (-d / 2) + 'px"></div>';
      sizeEls.push(sw);
      onPress(sw, function () {
        size = s; SFX.click();
        each(sizeEls, function (x) { removeClass(x, 'sel'); }); addClass(sw, 'sel');
      });
    });
    el('div', 'sep', bar);
    if (mode === 0) {
      var colorEls = [];
      each(COLORS, function (col, i) {
        var sw = el('div', 'sw' + (col === color ? ' sel' : ''), bar);
        sw.style.background = col;
        colorEls.push(sw);
        onPress(sw, function () {
          color = col; store('paintColor', col);
          each(colorEls, function (x) { removeClass(x, 'sel'); }); addClass(sw, 'sel');
          tone(NOTES[i], 0.15, 'sine', 0.25);
          say(cap(T().colors[i]));
        });
      });
    } else if (mode === 1) {
      var rb = el('div', 'sw sel', bar);
      rb.style.width = '220px'; rb.style.borderRadius = '33px';
      rb.style.backgroundImage = 'linear-gradient(90deg, #ef4b5c, #ff8a2a, #ffd23f, #3fc27a, #3b8beb, #8f5ce0)';
    } else {
      var choice = [null].concat(ANIMALS.slice(0, 7)), stampEls = [];
      each(choice, function (a, i) {
        var sw = el('div', 'sw' + (i === 0 ? ' sel' : ''), bar, a ? pic(a.c, 44) : '');
        sw.style.background = a ? '#fff' : '#f1ebfa';
        if (!a) { sw.innerHTML = '<div style="position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;color:#5b3f86">' + ICON.random + '</div>'; }
        stampEls.push(sw);
        onPress(sw, function () {
          stampAnimal = a; SFX.click();
          each(stampEls, function (x) { removeClass(x, 'sel'); }); addClass(sw, 'sel');
          if (a) { say(cap(aName(a))); }
        });
      });
    }
    el('div', 'sep', bar);
    var tr = el('div', 'sw', bar, '<div style="position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;color:#ef4b5c">' + ICON.trash + '</div>');
    tr.style.background = '#fff0f2';
    onPress(tr, function () {
      c.clearRect(0, 0, api.w, ch);
      stamps.innerHTML = '';
      SFX.swoosh();
    });

    // Narrow screens: shrink the toolbar a bit.
    if (api.w < 900) { bar.style.webkitTransform = 'scale(0.82)'; bar.style.transform = 'scale(0.82)'; bar.style.left = '-10%'; bar.style.right = '-10%'; }

    var lastPts = {};
    function draw(id, x, y, start) {
      if (y > ch) { return; }
      if (mode === 2) {
        if (!start) { return; }
        var a = stampAnimal || pick(ANIMALS);
        var s = el('div', 'stamp', stamps, inlinePic(a.c, size));
        s.style.left = (x - size / 2) + 'px'; s.style.top = (y - size / 2) + 'px';
        var rot = Math.round(rand(-18, 18));
        s.firstChild.style.webkitTransform = 'rotate(' + rot + 'deg)'; s.firstChild.style.transform = 'rotate(' + rot + 'deg)';
        if (stamps.childNodes.length > 80) { stamps.removeChild(stamps.firstChild); }
        SFX.boing(a.f);
        return;
      }
      var p = lastPts[id];
      if (mode === 1) {
        hue = (hue + (p ? Math.sqrt((x - p.x) * (x - p.x) + (y - p.y) * (y - p.y)) * 0.6 : 8)) % 360;
        c.strokeStyle = 'hsl(' + Math.round(hue) + ',90%,56%)';
      } else {
        c.strokeStyle = color;
      }
      c.lineWidth = size;
      c.beginPath();
      if (p) { c.moveTo(p.x, p.y); } else { c.moveTo(x - 0.1, y); }
      c.lineTo(x, y); c.stroke();
      lastPts[id] = { x: x, y: y };
    }
    cv.addEventListener('touchstart', function (ev) {
      ev.preventDefault();
      for (var i = 0; i < ev.changedTouches.length; i++) {
        var t = ev.changedTouches[i]; lastPts[t.identifier] = null;
        draw(t.identifier, t.clientX, t.clientY - BAR, true);
      }
    }, false);
    cv.addEventListener('touchmove', function (ev) {
      ev.preventDefault();
      for (var i = 0; i < ev.changedTouches.length; i++) {
        var t = ev.changedTouches[i]; draw(t.identifier, t.clientX, t.clientY - BAR, false);
      }
    }, false);
    cv.addEventListener('touchend', function (ev) {
      for (var i = 0; i < ev.changedTouches.length; i++) { lastPts[ev.changedTouches[i].identifier] = null; }
    }, false);
    var mouse = false;
    cv.addEventListener('mousedown', function (ev) { mouse = true; lastPts.m = null; draw('m', ev.clientX, ev.clientY - BAR, true); }, false);
    cv.addEventListener('mousemove', function (ev) { if (mouse) { draw('m', ev.clientX, ev.clientY - BAR, false); } }, false);
    window.addEventListener('mouseup', function () { mouse = false; }, false);
    return {};
  };

  // ---------- 4. Peekaboo ----------
  GAME_IMPL.peek = function (api) {
    var stage = api.stage;
    stage.style.background = '#ffe9f1';
    var BLANKETS = [['#8f5ce0', '#a983ee'], ['#3b8beb', '#64a6f2'], ['#ff8a2a', '#ffa75e']];
    function blanketHTML(i) {
      var c = BLANKETS[i];
      return 'background-color:' + c[0] + ';background-image:repeating-linear-gradient(45deg,' + c[0] + ',' + c[0] + ' 30px,' + c[1] + ' 30px,' + c[1] + ' 60px)';
    }
    var n = api.level + 1, goal = 5, done = 0, mistakes = 0, busy = false, target = null;
    var gap = 30, sw = Math.min((api.w - gap * (n + 1)) / n, api.h - 2 * gap), sh = Math.min(api.h - 2 * gap, sw * 1.15);
    var slots = [];
    for (var i = 0; i < n; i++) {
      var s = el('div', 'slot', stage);
      var x = (api.w - (n * sw + (n - 1) * gap)) / 2 + i * (sw + gap);
      place(s, x, (api.h - sh) / 2, sw, sh);
      var face = el('div', '', s); face.style.position = 'absolute'; face.style.left = face.style.top = face.style.right = face.style.bottom = '0';
      var bl = el('div', 'blanket', s, '<div class="face">?</div>');
      bl.setAttribute('style', blanketHTML(i));
      slots.push({ e: s, face: face, bl: bl, animal: null, open: false });
    }
    function fill(animals) {
      each(slots, function (sl, i) { sl.animal = animals[i]; sl.face.innerHTML = pic(animals[i].c, Math.min(sw, sh) * 0.7); });
    }
    function setOpen(sl, o) { sl.open = o; if (o) { addClass(sl.bl, 'open'); } else { removeClass(sl.bl, 'open'); } }

    if (n === 1) {
      fill([pick(ANIMALS)]);
      onDown(slots[0].e, function () {
        if (busy) { return; }
        busy = true; api.later(function () { busy = false; }, 600);
        var sl = slots[0];
        if (!sl.open) {
          setOpen(sl, true); tone(400, 0.25, 'triangle', 0.35, 900);
          say(T().games.peek.t + ' ! ' + aFull(sl.animal));
          restartAnim(sl.face, 'bounce');
        } else {
          setOpen(sl, false); tone(500, 0.25, 'triangle', 0.3, 250);
          var old = sl.animal;
          api.later(function () { var a = pick(ANIMALS); while (a.k === old.k) { a = pick(ANIMALS); } fill([a]); }, 500);
        }
      });
      return {};
    }

    function renderInfo() {
      var inf = api.info('<div class="ib first" id="askPeek">' + ICON.speaker + '</div>' + dotsHTML(done, goal, api.color));
      onPress(inf.querySelector('#askPeek'), function () { if (target) { say(where(target)); } });
    }
    function round() {
      var animals = shuffle(ANIMALS).slice(0, n);
      fill(animals);
      target = pick(animals);
      busy = false;
      renderInfo();
      api.later(function () { say(where(target)); }, 400);
    }
    each(slots, function (sl) {
      onDown(sl.e, function () {
        if (busy || sl.open) { return; }
        setOpen(sl, true);
        tone(400, 0.25, 'triangle', 0.3, 900);
        if (sl.animal.k === target.k) {
          busy = true;
          restartAnim(sl.face, 'bounce');
          SFX.good(); say(praise() + ' ' + T().animals[sl.animal.k][1]);
          done++; renderInfo();
          api.later(function () {
            each(slots, function (x) { setOpen(x, false); });
            api.later(function () { if (done >= goal) { api.win(starsFromMistakes(mistakes, 1, 3)); } else { round(); } }, 600);
          }, 1800);
        } else {
          mistakes++; busy = true;
          say(cap(aName(sl.animal)));
          api.later(function () { setOpen(sl, false); busy = false; api.later(function () { say(where(target)); }, 500); }, 1300);
        }
      });
    });
    round();
    return {};
  };

  // ---------- 5. Piano ----------
  var songIndex = 0;
  GAME_IMPL.piano = function (api) {
    var stage = api.stage;
    stage.style.background = '#fff8ec';
    var mode = api.level, song = null, pos = 0, mistakes = 0, finished = false, songNo = 0;
    if (mode > 0) { songNo = songIndex % SONGS.length; song = SONGS[songNo]; songIndex++; }
    var kw = api.w / NOTES.length, keys = [];
    var NOTE_PICS = ['1f3b5', '2b50', '2764', '2728'];

    function renderInfo() {
      if (!song) { return; }
      api.sub(T().songs[songNo]);
      api.info(inlinePic('1f3b5', 34) + '<div class="progress"><div style="width:' + Math.round(pos / song.length * 100) + '%;background:' + api.color + '"></div></div>');
    }
    function floatNote(i, y) {
      var n = el('div', 'note', stage, inlinePic(pick(NOTE_PICS), 64));
      n.style.left = (i * kw + kw / 2 - 32) + 'px'; n.style.top = (y - 70) + 'px';
      setTimeout(function () { if (n.parentNode) { n.parentNode.removeChild(n); } }, 1300);
    }
    function light(i) {
      addClass(keys[i].e, 'down');
      setTimeout(function () { removeClass(keys[i].e, 'down'); }, 220);
    }
    function showHint() {
      each(keys, function (k) { removeClass(k.e, 'glow'); k.hint.style.display = 'none'; });
      if (mode === 2 && !finished) { addClass(keys[song[pos]].e, 'glow'); keys[song[pos]].hint.style.display = 'block'; }
    }
    function songDone() {
      finished = true; showHint();
      api.later(function () { api.win(mode === 1 ? 3 : starsFromMistakes(mistakes, 2, 5)); }, 700);
    }
    each(NOTES, function (f, i) {
      var k = el('div', 'key', stage, '<div class="gloss"></div>');
      place(k, i * kw, 0, kw, api.h);
      k.style.background = COLORS[i];
      var hint = el('div', 'hint', k, inlinePic('1f31f', 70));
      hint.style.display = 'none';
      keys.push({ e: k, hint: hint });
      onDown(k, function (pt) {
        if (overlayOpen) { return; }
        var y = pt.clientY - BAR;
        if (mode === 0 || finished) { tone(f, 0.6, 'triangle', 0.4); light(i); floatNote(i, y); return; }
        if (mode === 1) {
          var ni = song[pos];
          tone(NOTES[ni], 0.6, 'triangle', 0.4); light(ni); floatNote(ni, y);
          pos++; renderInfo();
          if (pos >= song.length) { songDone(); }
          return;
        }
        if (i === song[pos]) {
          tone(f, 0.6, 'triangle', 0.4); light(i); floatNote(i, y);
          pos++; renderInfo();
          if (pos >= song.length) { songDone(); } else { showHint(); }
        } else {
          mistakes++;
          tone(f, 0.3, 'sine', 0.15);
          restartAnim(keys[song[pos]].hint, 'bounce');
        }
      });
    });
    renderInfo();
    showHint();
    return {};
  };

  // ---------- 6. Memory ----------
  GAME_IMPL.memory = function (api) {
    var stage = api.stage;
    stage.style.background = '#fff1f6';
    var pairs = [2, 3, 4, 6][api.level];
    var deck = [], pool = shuffle(ANIMALS), i;
    for (i = 0; i < pairs; i++) { deck.push(pool[i]); deck.push(pool[i]); }
    deck = shuffle(deck);
    var boxes = fitGrid(deck.length, api.w, api.h, 26);
    var open = [], found = 0, moves = 0, busy = false;
    var backStar = '<svg viewBox="0 0 24 24"><path fill="rgba(255,255,255,0.9)" d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z"/></svg>';

    function renderInfo() {
      api.info('<div class="counter">' + T().moves + ' : ' + moves + '</div>' +
        '<div class="counter" style="margin-left:8px">' + inlinePic('1f0cf', 30) + found + ' / ' + pairs + '</div>');
    }
    function turn(card, faceUp) {
      addClass(card, 'flip');
      setTimeout(function () {
        card.className = 'card ' + (faceUp ? 'face' : 'back-side') + ' flip';
        card.innerHTML = faceUp ? pic(card.animal.c, card.size * 0.68) : backStar;
        void card.offsetWidth;
        removeClass(card, 'flip');
      }, 180);
    }
    each(deck, function (a, n) {
      var b = boxes[n], card = el('div', 'card back-side', stage, backStar);
      place(card, b.x, b.y, b.s, b.s);
      card.animal = a; card.size = b.s;
      onDown(card, function () {
        if (busy || card.isOpen || card.isFound || overlayOpen) { return; }
        card.isOpen = true; open.push(card);
        turn(card, true);
        tone(a.f * 2, 0.15, 'sine', 0.3);
        if (open.length < 2) { return; }
        busy = true; moves++; renderInfo();
        var c1 = open[0], c2 = open[1];
        open = [];
        if (c1.animal.k === c2.animal.k) {
          api.later(function () {
            c1.isFound = c2.isFound = true;
            addClass(c1, 'found'); addClass(c2, 'found');
            restartAnim(c1, 'bounce'); restartAnim(c2, 'bounce');
            SFX.good(); say(aFull(a));
            found++; renderInfo(); busy = false;
            if (found === pairs) {
              var s = moves <= pairs + 1 ? 3 : (moves <= pairs * 2 ? 2 : 1);
              api.later(function () { api.win(s); }, 1500);
            }
          }, 450);
        } else {
          api.later(function () {
            c1.isOpen = c2.isOpen = false;
            turn(c1, false); turn(c2, false);
            tone(330, 0.2, 'sine', 0.15, 260);
            busy = false;
          }, 1200);
        }
      });
    });
    renderInfo();
    return {};
  };

  // =====================================================================
  // Rotation: redraw what is on screen.
  // =====================================================================
  var lastSize = W() + 'x' + H();
  window.addEventListener('resize', function () {
    var s = W() + 'x' + H();
    if (s === lastSize) { return; }
    lastSize = s;
    if (currentScreen === 'menu') { renderMenu(); }
    if (currentScreen === 'game' && game && !overlayOpen) { startLevel(level); }
  }, false);

  // Pick up new versions of the app when online.
  if (window.applicationCache) {
    window.applicationCache.addEventListener('updateready', function () {
      try { window.applicationCache.swapCache(); } catch (e) {}
      if (currentScreen === 'start') { location.reload(); }
    }, false);
  }
})();
