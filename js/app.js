/* Petits Jeux — toddler games for an iPad 3 (iOS 9.3, Safari 9).
   Written in plain ES5 on purpose: no let/const, arrow functions, classes or template strings. */
(function () {
  'use strict';

  // =====================================================================
  // Basics
  // =====================================================================
  var BAR = 84;
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
    if (w !== undefined) { e.style.width = Math.round(w) + 'px'; }
    if (h !== undefined) { e.style.height = Math.round(h) + 'px'; }
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function store(key, val) {
    try {
      if (val === undefined) { return JSON.parse(localStorage.getItem(key)); }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
    return null;
  }
  function hasClass(e, c) { return (' ' + e.className + ' ').indexOf(' ' + c + ' ') >= 0; }
  function addClass(e, c) { if (!hasClass(e, c)) { e.className += ' ' + c; } }
  function removeClass(e, c) { e.className = (' ' + e.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, ''); }
  function restartAnim(e, cls) { removeClass(e, cls); void e.offsetWidth; addClass(e, cls); }
  function setTransform(e, v) { e.style.webkitTransform = v; e.style.transform = v; }

  // Pictures (Twemoji SVG files). Emoji text cannot be drawn large on iOS 9, pictures can.
  function pic(code, size) {
    size = Math.floor(size);
    return '<img src="e/' + code + '.svg" alt="" style="position:absolute;left:50%;top:50%;width:' + size +
      'px;height:' + size + 'px;margin:' + (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px">';
  }
  function img(code, size) { return '<img src="e/' + code + '.svg" alt="" style="width:' + size + 'px;height:' + size + 'px">'; }

  var SVGA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">';
  var ICON = {
    back: SVGA + '<path d="M15 4.5L7.5 12l7.5 7.5"/></svg>',
    restart: SVGA + '<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 4v4.5h4.5"/></svg>',
    home: SVGA + '<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/></svg>',
    speaker: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9h4l5.5-4.5v15L7 15H3z"/>' +
      '<path d="M16 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M7 4.5c0-1 1-1.5 1.8-1L20 10.6c.8.6.8 1.8 0 2.4L8.8 20.5c-.8.5-1.8 0-1.8-1z"/></svg>',
    playSmall: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5c0-1 1-1.5 1.8-1L20 10.6c.8.6.8 1.8 0 2.4L8.8 20.5c-.8.5-1.8 0-1.8-1z"/></svg>',
    undo: SVGA + '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a5.5 5.5 0 0 1 0 11h-3"/></svg>',
    trash: SVGA + '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg>'
  };
  function star(filled) {
    return '<svg viewBox="0 0 24 24"><path fill="' + (filled ? '#ffc93c' : 'rgba(255,255,255,0.55)') + '" stroke="' + (filled ? '#e5a90f' : 'rgba(150,130,170,0.35)') +
      '" stroke-width="1.2" stroke-linejoin="round" d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z"/></svg>';
  }

  // Touch handling.
  // onPress: buttons; fires when the finger lifts (iOS 9 only allows sound to start then).
  // onDown: game play; fires as soon as the finger touches.
  function onPress(e, fn) {
    var sx = 0, sy = 0;
    e.addEventListener('touchstart', function (ev) { var t = ev.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, false);
    e.addEventListener('touchend', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var t = ev.changedTouches[0];
      unlockAudio();
      if (Math.abs(t.clientX - sx) < 40 && Math.abs(t.clientY - sy) < 40) { fn(ev); }
    }, false);
    e.addEventListener('click', function (ev) { ev.stopPropagation(); unlockAudio(); fn(ev); }, false);
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
  // Web Audio on old iPads is treated as "ambient" sound and is silenced by the mute setting.
  // Playing a silent <audio> track in a loop moves the page to "media" sound (like YouTube),
  // which is not muted.
  // From a home-screen icon (full screen) iOS 9 cannot play <audio>, and trying cuts all
  // other sound, so the trick is used in Safari only.
  var STANDALONE = !!window.navigator.standalone;
  var actx = null, silentAudio = null;
  function unlockAudio() {
    if (!STANDALONE) try {
      if (!silentAudio) {
        silentAudio = new Audio('sounds/silence.wav');
        silentAudio.loop = true;
      }
      if (silentAudio.paused) { var p = silentAudio.play(); if (p && p['catch']) { p['catch'](function () {}); } }
    } catch (e) {}
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return; }
    if (!actx) {
      actx = new AC();
      var buf = actx.createBuffer(1, 1, 22050), src = actx.createBufferSource();
      src.buffer = buf; src.connect(actx.destination);
      if (src.start) { src.start(0); } else { src.noteOn(0); }
    }
    if (actx.state === 'suspended' && actx.resume) { actx.resume(); }
    loadRecordings();
  }
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
    whoosh: function () { tone(250, 0.4, 'sine', 0.18, 500); },
    fill: function () { tone(400, 0.25, 'sine', 0.3, 800); },
    fanfare: function () { each([523, 659, 784, 1047, 784, 1047], function (f, i) { tone(f, 0.28, 'triangle', 0.35, 0, i * 0.14); }); }
  };

  var lang = store('lang') || 'fr';
  if (!I18N[lang]) { lang = 'fr'; }
  function T() { return I18N[lang]; }
  // Pick the nicest voice installed for the language. iPads can download "Enhanced" voices
  // (Settings > General > Accessibility > Speech > Voices), which sound much less robotic.
  function bestVoice() {
    try {
      var vs = window.speechSynthesis.getVoices() || [], want = T().voice.substr(0, 2), best = null, score = -1;
      for (var i = 0; i < vs.length; i++) {
        var v = vs[i], l = (v.lang || '').replace('_', '-');
        if (l.substr(0, 2) !== want) { continue; }
        var id = ((v.voiceURI || '') + ' ' + (v.name || '')).toLowerCase(), sc = 0;
        if (l === T().voice) { sc += 1; }
        if (id.indexOf('premium') >= 0 || id.indexOf('enhanced') >= 0) { sc += 10; }
        if (id.indexOf('compact') >= 0) { sc -= 1; }
        if (sc > score) { score = sc; best = v; }
      }
      return best;
    } catch (e) { return null; }
  }
  function say(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { return; }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = T().voice; u.rate = 0.85; u.pitch = 1.1;
      var v = bestVoice(); if (v) { u.voice = v; }
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
  // Real animal recordings (sounds/animals/*.mp3), decoded once and played with Web Audio.
  var ANIMAL_REC = { cat: 1, cow: 1, dog: 1, elephant: 1, frog: 1, horse: 1, lion: 1, pig: 1, sheep: 1 };
  var recBuf = {}, recLoading = false;
  function loadRecordings() {
    if (recLoading || !actx) { return; }
    recLoading = true;
    each(ANIMALS, function (a) {
      if (!ANIMAL_REC[a.k]) { return; }
      var x = new XMLHttpRequest();
      x.open('GET', 'sounds/animals/' + a.k + '.mp3', true);
      x.responseType = 'arraybuffer';
      x.onload = function () {
        if (x.status && x.status !== 200) { return; }
        try { actx.decodeAudioData(x.response, function (b) { recBuf[a.k] = b; }, function () {}); } catch (e) {}
      };
      x.send();
    });
  }
  var recSrc = null;
  // Plays the animal's real sound; returns how long it lasts (seconds).
  function animalSound(a) {
    var b = recBuf[a.k];
    if (!actx || !b) { SFX.boing(a.f); return 0.4; }
    try { if (recSrc) { if (recSrc.stop) { recSrc.stop(0); } else { recSrc.noteOff(0); } } } catch (e) {}
    var src = actx.createBufferSource(), g = actx.createGain();
    src.buffer = b; g.gain.value = 0.9;
    src.connect(g); g.connect(actx.destination);
    if (src.start) { src.start(0); } else { src.noteOn(0); }
    recSrc = src;
    return b.duration;
  }
  // Real sound first, then the voice says the name.
  var nameTimer = null;
  function animalHello(a, prefix) {
    var d = animalSound(a);
    if (nameTimer) { clearTimeout(nameTimer); }
    nameTimer = setTimeout(function () { say((prefix ? prefix + ' ' : '') + cap(aName(a))); }, Math.round(d * 1000) + 150);
  }
  function where(a) { return T().where.replace('{x}', aName(a)); }

  var COLORS = ['#ef4b5c', '#ff8a2a', '#ffd23f', '#3fc27a', '#3b8beb', '#8f5ce0', '#ff7eb6', '#9a6236'];
  var PASTELS = ['#ffd6dc', '#ffe3c7', '#fff1b8', '#d4f5df', '#d6e8ff', '#e8dcff', '#ffdcee', '#f0e2d4'];

  // Piano: 10 white keys, G3 to B4.
  // key index: 0 G3, 1 A3, 2 B3, 3 C4, 4 D4, 5 E4, 6 F4, 7 G4, 8 A4, 9 B4
  var NOTES = [196, 220, 247, 262, 294, 330, 349, 392, 440, 494];
  var WHITE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midiOf(n) { return 12 * (parseInt(n.charAt(1), 10) + 1) + WHITE[n.charAt(0)]; }
  function freqOf(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  var WHITE_STEPS = [0, 2, 4, 5, 7, 9, 11];
  function nextWhite(m, dir) { do { m += dir; } while (WHITE_STEPS.indexOf(((m % 12) + 12) % 12) < 0); return m; }
  var DEFAULT_KEYS = ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
  // Keyboard for a song: every white key from its lowest to its highest note (at least 8 keys).
  function songKeys(notes) {
    var lo = 999, hi = -1, keys = [], m;
    each(notes, function (n) { var x = midiOf(n); if (x < lo) { lo = x; } if (x > hi) { hi = x; } });
    for (m = lo; m <= hi; m = nextWhite(m, 1)) { keys.push(m); }
    var up = true;
    while (keys.length < 8) {
      if (up) { keys.push(nextWhite(keys[keys.length - 1], 1)); } else { keys.unshift(nextWhite(keys[0], -1)); }
      up = !up;
    }
    return keys;
  }
  var KEY_COLORS = ['#ef4b5c', '#ff6f3c', '#ff9f1c', '#ffd23f', '#9ed84b', '#3fc27a', '#2ec4b6', '#3b8beb', '#8f5ce0', '#ff7eb6', '#ef4b5c'];
  var SONGS = [
    { flag: '1f1eb-1f1f7', n: { fr: 'Frère Jacques', en: 'Frère Jacques', de: 'Bruder Jakob', ru: 'Братец Яков' },
      notes: 'C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4 E4 F4 G4 G4 A4 G4 F4 E4 C4 G4 A4 G4 F4 E4 C4 C4 G3 C4 C4 G3 C4' },
    { flag: '1f1eb-1f1f7', n: { fr: 'Ah ! vous dirai-je maman', en: 'Twinkle Twinkle Little Star', de: 'Morgen kommt der Weihnachtsmann', ru: 'Ах, скажу я вам, мама' },
      notes: 'C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4 G4 G4 F4 F4 E4 E4 D4 G4 G4 F4 F4 E4 E4 D4 C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4' },
    { flag: '1f1eb-1f1f7', n: { fr: 'Au clair de la lune', en: 'Au clair de la lune', de: 'Au clair de la lune', ru: 'При свете луны' },
      notes: 'C4 C4 C4 D4 E4 D4 C4 E4 D4 D4 C4 C4 C4 C4 D4 E4 D4 C4 E4 D4 D4 C4 D4 D4 D4 D4 A3 A3 D4 C4 B3 A3 G3 C4 C4 C4 D4 E4 D4 C4 E4 D4 D4 C4' },
    { flag: '1f1f7-1f1fa', n: { fr: 'В лесу родилась ёлочка', en: 'В лесу родилась ёлочка', de: 'В лесу родилась ёлочка', ru: 'В лесу родилась ёлочка' },
      notes: 'G3 E4 E4 D4 E4 C4 G3 G3 G3 E4 E4 F4 D4 G4 G4 A4 A4 F4 F4 E4 D4 C4 G4 E4 E4 D4 E4 C4' },
    { flag: '1f1f7-1f1fa', n: { fr: 'Маленькой ёлочке', en: 'Маленькой ёлочке', de: 'Маленькой ёлочке', ru: 'Маленькой ёлочке холодно зимой' },
      notes: 'G4 E4 E4 G4 E4 E4 G4 F4 E4 D4 C4 A4 C5 A4 G4 E4 E4 G4 F4 E4 D4 C4' },
    { flag: '1f1f7-1f1fa', n: { fr: 'Жили у бабуси', en: 'Жили у бабуси', de: 'Жили у бабуси', ru: 'Жили у бабуси' },
      notes: 'F4 E4 D4 C4 G4 G4 F4 E4 D4 C4 G4 G4 F4 A4 A4 F4 E4 G4 G4 E4 D4 E4 F4 D4 C4 C4' },
    { flag: '1f30d', n: { fr: 'Joyeux anniversaire', en: 'Happy Birthday', de: 'Zum Geburtstag viel Glück', ru: 'С днём рождения' },
      notes: 'G3 G3 A3 G3 C4 B3 G3 G3 A3 G3 D4 C4 G3 G3 G4 E4 C4 B3 A3 F4 F4 E4 C4 D4 C4' },
    { flag: '1f30d', n: { fr: 'Ode à la joie', en: 'Ode to Joy', de: 'Ode an die Freude', ru: 'Ода к радости' },
      notes: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4' }
  ];

  // Memory themes (pictures).
  var THEMES = [
    { icon: '1f436', items: ['1f42e', '1f437', '1f436', '1f431', '1f425', '1f438', '1f981', '1f435', '1f430', '1f418', '1f986', '1f43b',
      '1f411', '1f434', '1f989', '1f42f', '1f992', '1f427', '1f98a', '1f43c', '1f42d', '1f422'] },
    { icon: '1f697', items: ['1f697', '1f68c', '1f692', '1f693', '1f69c', '1f682', '2708', '1f680', '1f6b2', '26f5', '1f681',
      '1f695', '1f691', '1f69a', '1f6f5', '1f3ce', '1f6a2', '1f68b', '1f6fb', '1f6f4'] },
    { icon: '1f34e', items: ['1f34e', '1f34c', '1f353', '1f349', '1f347', '1f955', '1f350', '1f34a', '1f352', '1f351', '1f34d',
      '1f34b', '1f95d', '1f966', '1f33d', '1f952', '1f951', '1f346', '1f344', '1f34f', '1f965'] },
    { icon: '1f420', items: ['1f420', '1f421', '1f42c', '1f433', '1f419', '1f980', '1f991', '1f422', '1f988', '1f41a', '1f99e',
      '1f9ad', '1fab8', '1fabc', '1f427'] }
  ];
  // Paint stamp picker categories.
  var STAMP_CATS = [
    ['1f436', ['1f42e', '1f437', '1f436', '1f431', '1f411', '1f425', '1f438', '1f981', '1f435', '1f434', '1f430', '1f418', '1f986', '1f43b', '1f989', '1f42c']],
    ['1f338', ['1f338', '1f33b', '1f333', '1f344', '2600', '1f319', '2b50', '1f308', '2744', '2764', '1f41e', '1f98b']],
    ['1f34e', ['1f34e', '1f34c', '1f353', '1f349', '1f347', '1f955', '1f366', '1f36a', '1f382']],
    ['1f697', ['1f697', '1f68c', '1f692', '1f693', '1f69c', '1f682', '2708', '1f680', '1f6b2', '26f5', '1f681']],
    ['1f388', ['1f388', '1f381', '26bd', '1f984', '1f420', '1f996', '1f451', '1f31f', '2728']]
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

  // Best grid for n squares in a w x h box (offset by x0, y0).
  // fullRows: only use layouts where every row is complete (e.g. 16 cards = 4 x 4).
  function fitGrid(n, w, h, gap, x0, y0, fullRows) {
    var bestC = 1, bestS = 0;
    for (var c = 1; c <= n; c++) {
      if (fullRows && n % c) { continue; }
      var r = Math.ceil(n / c);
      var s = Math.min((w - gap * (c + 1)) / c, (h - gap * (r + 1)) / r);
      if (s > bestS) { bestS = s; bestC = c; }
    }
    var rows = Math.ceil(n / bestC), out = [];
    var ox = (x0 || 0) + (w - (bestC * bestS + (bestC - 1) * gap)) / 2;
    var oy = (y0 || 0) + (h - (rows * bestS + (rows - 1) * gap)) / 2;
    for (var i = 0; i < n; i++) {
      var row = Math.floor(i / bestC), col = i % bestC;
      var inRow = Math.min(bestC, n - row * bestC);
      out.push({ x: ox + (bestC - inRow) * (bestS + gap) / 2 + col * (bestS + gap), y: oy + row * (bestS + gap), s: bestS });
    }
    return out;
  }

  // =====================================================================
  // Screens, overlay, confetti
  // =====================================================================
  var currentScreen = 'start';
  function showScreen(name) { $(currentScreen).className = 'screen'; currentScreen = name; $(name).className = 'screen on'; }
  var overlayOpen = false;
  function openSheet(html) {
    var s = $('sheet');
    s.innerHTML = html;
    s.style.webkitAnimation = 'none'; s.style.animation = 'none'; void s.offsetWidth;
    s.style.webkitAnimation = ''; s.style.animation = '';
    $('overlay').className = 'on';
    overlayOpen = true;
  }
  function closeSheet() {
    $('overlay').className = ''; overlayOpen = false;
    each($('overlay').querySelectorAll('.confetti'), function (c) { c.parentNode.removeChild(c); });
  }
  function confetti() {
    var ov = $('overlay');
    for (var i = 0; i < 36; i++) {
      var c = el('div', 'confetti', ov);
      c.style.left = Math.round(rand(0, W())) + 'px';
      c.style.background = pick(COLORS);
      var d = rand(0, 1.2).toFixed(2) + 's';
      c.style.webkitAnimationDelay = d; c.style.animationDelay = d;
    }
  }

  // =====================================================================
  // Start screen
  // =====================================================================
  function renderStart() {
    $('appTitle').innerHTML = T().appTitle;
    $('appSub').innerHTML = T().appSub;
    $('soundHint').innerHTML = T().soundHint;
    document.title = T().appTitle;
    each(document.querySelectorAll('.lang'), function (e) { e.className = 'lang' + (e.getAttribute('data-lang') === lang ? ' sel' : ''); });
  }
  (function buildStart() {
    $('playBtn').innerHTML = ICON.play;
    var deco = [['1f42e', 7, 9], ['1f438', 82, 8], ['1f981', 4, 42], ['1f436', 86, 40], ['1f425', 3, 70], ['1f430', 87, 68]];
    each(deco, function (d, i) {
      var e = el('div', 'deco', $('start'), img(d[0], 110));
      e.style.left = d[1] + '%'; e.style.top = d[2] + '%';
      e.style.webkitAnimationDelay = (i * 0.5) + 's'; e.style.animationDelay = (i * 0.5) + 's';
    });
    each(document.querySelectorAll('.lang'), function (e) { onPress(e, function () { setLang(e.getAttribute('data-lang')); SFX.click(); }); });
    onPress($('playBtn'), function () { SFX.good(); say(T().hello); openMenu(); });
    renderStart();
  })();

  var FLAGS = { fr: '1f1eb-1f1f7', en: '1f1ec-1f1e7', de: '1f1e9-1f1ea', ru: '1f1f7-1f1fa' };
  var LANG_NAMES = { fr: 'Français', en: 'English', de: 'Deutsch', ru: 'Русский' };
  function setLang(l) {
    lang = l; store('lang', l);
    document.documentElement.lang = l;
    renderStart();
    if (currentScreen === 'menu') { renderMenu(); }
    if (currentScreen === 'game' && game) { startLevel(level); }
  }

  // =====================================================================
  // Menu
  // =====================================================================
  var GAMES = [
    { id: 'animals', icon: '1f42e', color: '#2fbf87', color2: '#7be0a9', bg: '#e7f9ef', levels: 3, scored: [0, 1, 1] },
    { id: 'bubbles', icon: '1f388', color: '#3b8beb', color2: '#7cc4ff', bg: '#dff0ff', levels: 3, scored: [1, 1, 1] },
    { id: 'paint', icon: '1f3a8', color: '#ff8a2a', color2: '#ffc15e', bg: '#fffdf8', levels: 1, scored: [0], noBar: true },
    { id: 'peek', icon: '1f648', color: '#ef4b6c', color2: '#ff9aa8', bg: '#ffeef3', levels: 3, scored: [0, 1, 1] },
    { id: 'piano', icon: '1f3b9', color: '#8f5ce0', color2: '#c39bff', bg: '#fff', levels: 3, scored: [0, 1, 1], chips: ['1f3b9', '2728', '1f31f'] },
    { id: 'memory', icon: '1f0cf', color: '#ff5d9e', color2: '#ffa3c8', bg: '#fff1f6', levels: 5, scored: [1, 1, 1, 1, 1], auto: 3 }
  ];
  function gameById(id) { for (var i = 0; i < GAMES.length; i++) { if (GAMES[i].id === id) { return GAMES[i]; } } return null; }

  (function buildMenuDeco() {
    var d = $('menuDeco');
    each([[6, 30, 120], [70, 18, 150], [40, 60, 100], [85, 75, 130], [15, 85, 110]], function (c, i) {
      var e = el('div', 'cloud', d);
      e.style.left = c[0] + '%'; e.style.top = c[1] + '%'; e.style.width = c[2] + 'px'; e.style.height = Math.round(c[2] * 0.36) + 'px';
      e.style.webkitAnimationDelay = (-i * 7) + 's'; e.style.animationDelay = (-i * 7) + 's';
    });
  })();

  function renderMenu() {
    $('menuHome').innerHTML = ICON.home;
    $('menuLang').innerHTML = img(FLAGS[lang], 36);
    // Big title, one colour per letter.
    var t = T().appTitle, h = '', ci = 0;
    for (var i = 0; i < t.length; i++) {
      var ch = t.charAt(i);
      if (ch === ' ') { h += '<span>&nbsp;</span>'; continue; }
      h += '<span style="color:' + COLORS[ci % 7] + ';-webkit-animation-delay:' + (ci * 0.15) + 's;animation-delay:' + (ci * 0.15) + 's">' + ch + '</span>';
      ci++;
    }
    $('menuTitle').innerHTML = h;
    var grid = $('menuGrid');
    grid.innerHTML = '';
    var top = W() > 900 ? 110 : 120;
    grid.style.top = top + 'px';
    var w = W(), hh = H() - top, gap = 26;
    var cols = w > hh ? 3 : 2, rows = Math.ceil(GAMES.length / cols);
    var cw = (w - gap * (cols + 1)) / cols, chh = (hh - gap * (rows + 1)) / rows;
    each(GAMES, function (g, i) {
      var c = el('div', 'gcard', grid);
      place(c, gap + (i % cols) * (cw + gap), gap + Math.floor(i / cols) * (chh + gap), cw, chh);
      c.style.background = g.color;
      c.style.backgroundImage = 'linear-gradient(160deg, ' + g.color2 + ' 0%, ' + g.color + ' 70%)';
      setTransform(c, 'rotate(' + (i % 2 ? 1.5 : -1.5) + 'deg)');
      var ps = Math.min(cw, chh - 50) * 0.62;
      var b2 = el('div', 'blob2', c); place(b2, cw * 0.62, -cw * 0.12, cw * 0.55, cw * 0.55);
      var blob = el('div', 'blob', c); place(blob, (cw - ps * 1.3) / 2 - 6, (chh - 50 - ps * 1.3) / 2 - 6, ps * 1.3, ps * 1.3);
      var p = el('div', 'pic', c, img(g.icon, ps)); place(p, (cw - ps) / 2 - 6, (chh - 50 - ps) / 2 - 6);
      p.style.webkitAnimationDelay = (i * 0.4) + 's'; p.style.animationDelay = (i * 0.4) + 's';
      el('div', 't', c, T().games[g.id].t);
      var total = 0, max = 0;
      for (var lv = 0; lv < g.levels; lv++) { if (g.scored[lv]) { max += 3; total += bestOf(g.id, lv); } }
      if (max) { el('div', 'pill', c, star(total > 0) + total + ' / ' + max); }
      onPress(c, function () { SFX.boing(300 + i * 60); openGame(g.id); });
    });
  }
  onPress($('menuHome'), function () { SFX.click(); showScreen('start'); });
  onPress($('menuLang'), function () {
    SFX.click();
    var h = '<h2>' + T().language + '</h2><div style="margin-top:16px">';
    each(['fr', 'en', 'de', 'ru'], function (l) {
      h += '<div class="listbtn' + (l === lang ? ' sel' : '') + '" data-l="' + l + '">' + img(FLAGS[l], 44) + LANG_NAMES[l] + '</div>';
    });
    openSheet(h + '</div>');
    each($('sheet').querySelectorAll('.listbtn'), function (b) {
      onPress(b, function () { setLang(b.getAttribute('data-l')); SFX.click(); closeSheet(); });
    });
  });
  function openMenu() { stopGame(); closeSheet(); showScreen('menu'); renderMenu(); }

  // =====================================================================
  // Game frame
  // =====================================================================
  var game = null, level = 0, running = null, session = 0;

  function renderGameBar() {
    var g = game, gt = T().games[g.id];
    $('gBar').style.background = g.color;
    $('gBack').innerHTML = ICON.back;
    $('gRestart').innerHTML = ICON.restart;
    $('gIcon').innerHTML = pic(g.icon, 42);
    $('gTitle').innerHTML = gt.t;
    $('gSub').innerHTML = gt.lv[level];
    var lv = $('gLevels');
    lv.innerHTML = '';
    lv.style.display = g.levels > 1 ? '' : 'none';
    lv.className = 'levels' + (g.levels > 4 ? ' many' : '');
    for (var i = 0; i < g.levels; i++) {
      (function (i) {
        var c = el('div', 'chip' + (i === level ? ' sel' : ''), lv, g.chips ? img(g.chips[i], 34) : String(i + 1));
        if (i === level) { c.style.color = g.color; }
        onPress(c, function () { if (i !== level) { SFX.click(); startLevel(i); } });
      })(i);
    }
  }

  function openGame(id) {
    game = gameById(id);
    var saved = store('level_' + id);
    level = (saved !== null && saved < game.levels) ? saved : 0;
    // Games with automatic levels always start fresh at level 1.
    if (game.auto) { level = 0; autoWins[id] = {}; store('autoWins', autoWins); }
    showScreen('game');
    startLevel(level);
  }

  function startLevel(lv) {
    stopGame();
    closeSheet();
    level = lv;
    store('level_' + game.id, lv);
    var top = game.noBar ? 0 : BAR - 10;
    $('gBar').style.display = game.noBar ? 'none' : '';
    if (!game.noBar) { renderGameBar(); }
    $('gInfo').innerHTML = '';
    $('game').style.background = game.bg;
    // A fresh play area each time, so old touch handlers never pile up.
    $('stage').innerHTML = '';
    var stage = el('div', '', $('stage'));
    stage.style.position = 'absolute'; stage.style.left = '0'; stage.style.right = '0'; stage.style.bottom = '0';
    stage.style.top = top + 'px'; stage.style.overflow = 'hidden';
    session++;
    var mySession = session;
    var api = {
      stage: stage, w: W(), h: H() - top, top: top, level: lv, color: game.color,
      later: function (fn, ms) { setTimeout(function () { if (mySession === session) { fn(); } }, ms); },
      alive: function () { return mySession === session; },
      info: function (html) { $('gInfo').innerHTML = html; return $('gInfo'); },
      sub: function (text) { $('gSub').innerHTML = text; },
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

  function sheetIcon(code, color) { return '<div class="sh-icon" style="background:' + color + '">' + pic(code, 70) + '</div>'; }

  // Picture help: rows of pictures with a short sentence under each.
  var BLANKET_MINI = '<div class="mini" style="background:#8f5ce0;background-image:repeating-linear-gradient(45deg,#8f5ce0,#8f5ce0 8px,#a983ee 8px,#a983ee 16px)"></div>';
  var CARD_MINI = '<div class="mini" style="background-image:linear-gradient(135deg,#a07cf5,#ff7eb6)"></div>';
  var KEYS_MINI = '<div class="mini" style="width:90px;background-image:linear-gradient(90deg,#ef4b5c 0,#ef4b5c 20%,#ffd23f 20%,#ffd23f 40%,#3fc27a 40%,#3fc27a 60%,#3b8beb 60%,#3b8beb 80%,#8f5ce0 80%)"></div>';
  var HELP_PICS = {
    animals: [[['1f446', '1f42e', '>', '1f50a']], [['1f442', '>', '1f446', '1f431', '>', '2b50']], [['1f442', '>', '1f446', '1f431', '>', '2b50']]],
    bubbles: [[['1f446', '1f388', '>', '1f4a5']], [['1f446', '1f388', '>', '1f4a5'], ['1f388', '>', '1f436']], [['1f442', 'red', '>', '1f446', 'red', '>', '1f4a5']]],
    peek: [[['1f446', 'blanket', '>', '1f436']], [['1f440', '1f436', '1f431'], ['blanket', 'blanket', '>', '1f442', '>', '1f446']],
      [['1f440', '1f436'], ['blanket', '1f504', 'blanket', '1f504', 'blanket'], ['1f442', '>', '1f446', 'blanket', '>', '2b50']]],
    piano: [[['1f446', 'keys', '>', '1f3b5']], [['1f446', 'keys', '>', '1f3b6', '2728']], [['1f31f', '1f447', '>', '1f446', '>', '1f3b6']]],
    memory: [[['1f446', 'card', '1f446', 'card'], ['1f436', '=', '1f436', '>', '2705']]]
  };
  function helpPics(list) {
    var h = '<div class="hpics">';
    each(list, function (p) {
      if (p === '>') { h += '<div class="arrow">→</div>'; }
      else if (p === '=') { h += '<div class="arrow">=</div>'; }
      else if (p === 'blanket') { h += BLANKET_MINI; }
      else if (p === 'card') { h += CARD_MINI; }
      else if (p === 'keys') { h += KEYS_MINI; }
      else if (p === 'red') { h += '<div class="mini" style="width:60px;border-radius:30px;background:#ef4b5c"></div>'; }
      else { h += img(p, 66); }
    });
    return h + '</div>';
  }
  function showHelp() {
    var g = game, gt = T().games[g.id];
    var pics = HELP_PICS[g.id], caps = T().help[g.id];
    var lv = Math.min(level, pics.length - 1), lvc = Math.min(level, caps.length - 1);
    var h = sheetIcon(g.icon, g.color) + '<h2>' + gt.t + '</h2><div class="sub">' + gt.lv[level] + '</div>';
    each(pics[lv], function (row, i) {
      h += '<div class="hrow">' + helpPics(row) + '<div class="hcap">' + (caps[lvc][i] || '') + '</div></div>';
    });
    h += '<div><div class="btn" id="hListen">' + ICON.speaker + T().listen + '</div>' +
      '<div class="btn primary" id="hGo">' + ICON.playSmall + T().letsGo + '</div></div>';
    openSheet(h);
    onPress($('hListen'), function () { say(caps[lvc].join(' ')); });
    onPress($('hGo'), function () { SFX.click(); if (window.speechSynthesis) { window.speechSynthesis.cancel(); } closeSheet(); });
  }

  // Games with "auto": one big play button; after that many wins the next level starts by itself.
  var autoWins = store('autoWins') || {};
  function showWin(stars) {
    saveBest(game.id, level, stars);
    if (game.auto) { showAutoWin(stars); return; }
    SFX.fanfare();
    say(T().bravo);
    var h = sheetIcon('1f3c6', '#ffc93c') + '<h2>' + T().bravo + '</h2>' +
      '<div class="sub">' + T().games[game.id].t + ' · ' + T().games[game.id].lv[level] + '</div><div class="bigstars">';
    for (var i = 0; i < 3; i++) {
      var s = star(i < stars).replace('rgba(255,255,255,0.55)', '#ece5f5');
      h += s.replace('<svg', '<svg style="-webkit-animation-delay:' + (0.3 + i * 0.25) + 's;animation-delay:' + (0.3 + i * 0.25) + 's"');
    }
    h += '</div><div><div class="btn" id="wMenu">' + ICON.home + T().menu + '</div>' +
      '<div class="btn" id="wAgain">' + ICON.restart + T().replay + '</div>';
    if (level < game.levels - 1) { h += '<div class="btn primary" id="wNext">' + ICON.playSmall + T().next + '</div>'; }
    openSheet(h + '</div>');
    confetti();
    onPress($('wMenu'), function () { SFX.click(); openMenu(); });
    onPress($('wAgain'), function () { SFX.click(); startLevel(level); });
    if ($('wNext')) { onPress($('wNext'), function () { SFX.click(); startLevel(level + 1); }); }
  }

  function showAutoWin(stars) {
    var id = game.id, n = ((autoWins[id] && autoWins[id][level]) || 0) + 1;
    var last = level >= game.levels - 1, levelUp = !last && n >= game.auto;
    autoWins[id] = autoWins[id] || {};
    autoWins[id][level] = levelUp ? 0 : n;
    store('autoWins', autoWins);
    SFX.fanfare();
    say(praise());
    var h = '<div class="bigstars" style="margin-top:6px">';
    for (var i = 0; i < 3; i++) {
      var s = star(i < stars).replace('rgba(255,255,255,0.55)', '#ece5f5');
      h += s.replace('<svg', '<svg style="-webkit-animation-delay:' + (0.3 + i * 0.25) + 's;animation-delay:' + (0.3 + i * 0.25) + 's"');
    }
    h += '</div>';
    if (!last) {
      // Little dots: how many more games before the next level.
      h += '<div class="lvdots">';
      for (var d = 0; d < game.auto; d++) { h += '<span class="' + (levelUp || d < n ? 'on' : '') + '"></span>'; }
      h += '</div>';
    }
    h += '<div class="gobtn' + (levelUp ? ' up' : '') + '" id="wGo" style="background:' + game.color + '">' + ICON.play + '</div>';
    openSheet(h);
    confetti();
    onPress($('wGo'), function () { SFX.click(); startLevel(levelUp ? level + 1 : level); });
  }

  // Big in-game "listen again" button plus a row of progress stars.
  function questUI(api, onListen, goal) {
    var size = Math.min(130, api.h * 0.2);
    var q = el('div', 'quest', api.stage, ICON.speaker);
    q.style.background = api.color;
    var starsW = goal * 58;
    var totalW = size + 30 + starsW;
    var x0 = (api.w - totalW) / 2;
    place(q, x0, 18, size, size);
    onPress(q, onListen);
    var row = el('div', 'starsrow', api.stage);
    place(row, x0 + size + 30, 18 + size / 2 - 26);
    function set(n) { var h = ''; for (var i = 0; i < goal; i++) { h += star(i < n); } row.innerHTML = h; }
    set(0);
    return { set: set, height: size + 30 };
  }

  // =====================================================================
  // The games
  // =====================================================================
  var GAME_IMPL = {};

  // ---------- 1. Animals ----------
  GAME_IMPL.animals = function (api) {
    var stage = api.stage;
    if (api.level === 0) {
      var boxes = fitGrid(ANIMALS.length, api.w, api.h, 16);
      each(ANIMALS, function (a, i) {
        var b = boxes[i], t = el('div', 'tile', stage);
        place(t, b.x, b.y, b.s, b.s);
        t.style.background = PASTELS[i % PASTELS.length];
        t.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;bottom:' + Math.round(b.s * 0.2) + 'px">' + pic(a.c, b.s * 0.6) + '</div>' +
          '<div class="cap" style="font-size:' + Math.max(15, Math.round(b.s * 0.11)) + 'px;color:#5b4a6d;text-shadow:none">' + cap(aName(a)) + '</div>';
        onDown(t, function () { restartAnim(t, 'bounce'); animalHello(a); });
      });
      return {};
    }
    var n = api.level === 1 ? 3 : 6, goal = 5, done = 0, mistakes = 0, busy = false, target = null, lastTarget = null;
    var area = el('div', '', stage);
    var ui = questUI(api, function () { if (target) { SFX.click(); say(where(target)); } }, goal);
    function round() {
      area.innerHTML = '';
      busy = false;
      var pool = shuffle(ANIMALS);
      target = pool[0];
      if (lastTarget && target.k === lastTarget.k) { target = pool[1]; pool[1] = pool[0]; pool[0] = target; }
      lastTarget = target;
      var options = shuffle(pool.slice(0, n));
      var boxes = fitGrid(n, api.w, api.h - ui.height, 30, 0, ui.height - 10);
      each(options, function (a, i) {
        var b = boxes[i], t = el('div', 'tile', area, pic(a.c, b.s * 0.72));
        place(t, b.x, b.y, b.s, b.s);
        t.style.background = PASTELS[(i * 3) % PASTELS.length];
        onDown(t, function () {
          if (busy) { return; }
          if (a.k === target.k) {
            busy = true;
            addClass(t, 'good'); restartAnim(t, 'bounce');
            SFX.good(); animalSound(a); api.later(function () { say(praise()); }, 1300);
            done++; ui.set(done);
            api.later(function () { if (done >= goal) { api.win(starsFromMistakes(mistakes, 1, 3)); } else { round(); } }, 1700);
          } else {
            mistakes++; busy = true;
            restartAnim(t, 'shake'); SFX.bad(); say(cap(aName(a)));
            api.later(function () { busy = false; say(where(target)); }, 1300);
          }
        });
      });
      api.later(function () { say(where(target)); }, 500);
    }
    round();
    return {};
  };

  // ---------- 2. Bubbles ----------
  GAME_IMPL.bubbles = function (api) {
    var stage = api.stage;
    stage.style.backgroundImage = 'linear-gradient(180deg, #e8f6ff 0%, #bfe0ff 100%)';
    var cfg = [
      { v: [45, 75], r: [70, 100], max: 6, animals: 0 },
      { v: [100, 160], r: [52, 80], max: 8, animals: 0.35 },
      { v: [55, 95], r: [62, 92], max: 8, animals: 0, colorMode: true }
    ][api.level];
    var goal = 15, score = 0, mistakes = 0, list = [], alive = true, last = 0;
    var palette = cfg.colorMode ? [0, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6];
    var target = cfg.colorMode ? pick(palette) : -1;

    var pill = el('div', 'scorepill', stage);
    place(pill, api.w - 190, 24);
    var qb = null;
    if (cfg.colorMode) {
      qb = el('div', 'quest', stage, ICON.speaker);
      place(qb, 24, 18, 110, 110); qb.style.zIndex = '5';
      onPress(qb, function () { sayColor(); });
    }
    function renderInfo() {
      pill.innerHTML = img('1f388', 40) + score + ' / ' + goal;
      if (qb) { qb.style.background = COLORS[target]; }
    }
    function sayColor() { say(T().colorQ.replace('{c}', T().colors[target])); }

    function add(startInside) {
      var r = rand(cfg.r[0], cfg.r[1]);
      var ci = (cfg.colorMode && Math.random() < 0.45) ? target : pick(palette);
      var b = { r: r, x: rand(r, api.w - r), y: startInside ? rand(api.h * 0.35, api.h + r) : api.h + r,
        v: rand(cfg.v[0], cfg.v[1]), w: rand(0, 6), ci: ci, animal: null };
      if (Math.random() < cfg.animals) { b.animal = pick(ANIMALS); }
      b.e = el('div', 'bub', null, '<div class="shine"></div>' + (b.animal ? pic(b.animal.c, r * 1.15) : ''));
      b.e.style.width = b.e.style.height = (2 * r) + 'px';
      b.e.style.background = COLORS[ci];
      b.e.style.opacity = b.animal ? '0.95' : '0.85';
      stage.insertBefore(b.e, pill);
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
        setTransform(b.e, 'translate3d(' + Math.round(b.dx - b.r) + 'px,' + Math.round(b.y - b.r) + 'px,0)');
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
          setTransform(d, 'translate(' + Math.round(Math.cos(a) * dist) + 'px,' + Math.round(Math.sin(a) * dist) + 'px) scale(0.3)');
          d.style.opacity = '0';
          setTimeout(function () { if (d.parentNode) { d.parentNode.removeChild(d); } }, 550);
        })(k);
      }
    }
    onDown(stage, function (pt) {
      if (overlayOpen) { return; }
      var x = pt.clientX, y = pt.clientY - api.top;
      for (var i = list.length - 1; i >= 0; i--) {
        var b = list[i], dx = x - b.dx, dy = y - b.y;
        if (dx * dx + dy * dy < (b.r + 28) * (b.r + 28)) {
          if (cfg.colorMode && b.ci !== target) { mistakes++; restartAnim(b.e, 'wobble'); SFX.bad(); return; }
          burst(b); SFX.pop();
          if (b.animal) { animalSound(b.animal); }
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

  // ---------- 3. Painting (full screen, no title bar) ----------
  // Colouring pages: shapes in a 100 x 100 box.
  // c: circle, e: ellipse, r: rounded rectangle, p: closed polygon, l: open line
  var PAGES = [
    { id: 'car', s: [['r', 8, 45, 84, 25, 8], ['p', 24, 45, 34, 27, 64, 27, 78, 45], ['l', 51, 29, 51, 45], ['c', 28, 72, 10], ['c', 72, 72, 10], ['c', 28, 72, 4], ['c', 72, 72, 4], ['c', 87, 53, 3]] },
    { id: 'train', s: [['r', 40, 36, 44, 34, 4], ['r', 62, 18, 22, 22, 3], ['r', 66, 22, 14, 10, 2], ['r', 45, 21, 9, 15, 2], ['c', 50, 12, 4], ['c', 58, 6, 3], ['p', 84, 58, 94, 70, 84, 70],
      ['r', 5, 43, 30, 27, 4], ['r', 10, 48, 20, 10, 2], ['l', 35, 62, 40, 62], ['c', 14, 74, 6], ['c', 27, 74, 6], ['c', 50, 74, 7], ['c', 74, 74, 7], ['l', 2, 83, 98, 83]] },
    { id: 'plane', s: [['e', 50, 50, 40, 10], ['p', 42, 47, 28, 18, 38, 18, 58, 47], ['p', 42, 53, 28, 82, 38, 82, 58, 53], ['p', 15, 46, 8, 28, 16, 28, 25, 45],
      ['c', 62, 48, 2.6], ['c', 70, 48, 2.6], ['c', 78, 48, 2.6], ['c', 15, 15, 5]] },
    { id: 'house', s: [['r', 22, 46, 56, 44, 2], ['p', 14, 48, 50, 16, 86, 48], ['r', 43, 66, 14, 24, 3], ['r', 28, 55, 12, 12, 2], ['r', 60, 55, 12, 12, 2],
      ['r', 64, 18, 8, 17, 1], ['c', 88, 12, 7], ['l', 2, 90, 98, 90]] },
    { id: 'fish', s: [['e', 45, 50, 30, 20], ['p', 72, 50, 93, 32, 93, 68], ['c', 28, 45, 4], ['p', 40, 32, 52, 18, 58, 33], ['p', 42, 66, 52, 78, 56, 66], ['c', 10, 25, 3], ['c', 7, 14, 2]] },
    { id: 'butterfly', s: [['e', 32, 34, 18, 15], ['e', 68, 34, 18, 15], ['e', 36, 64, 13, 11], ['e', 64, 64, 13, 11], ['c', 30, 33, 5], ['c', 70, 33, 5],
      ['e', 50, 50, 4.5, 24], ['l', 48, 27, 41, 13], ['l', 52, 27, 59, 13]] },
    { id: 'cat', s: [['c', 50, 55, 28], ['p', 27, 41, 28, 15, 44, 30], ['p', 73, 41, 72, 15, 56, 30], ['e', 40, 52, 4, 6], ['e', 60, 52, 4, 6], ['p', 46, 62, 54, 62, 50, 67],
      ['l', 18, 62, 38, 64], ['l', 18, 70, 38, 68], ['l', 82, 62, 62, 64], ['l', 82, 70, 62, 68]] },
    { id: 'flower', s: [['l', 50, 55, 50, 96], ['e', 39, 78, 11, 5], ['e', 61, 72, 11, 5], ['c', 50, 20, 11], ['c', 64, 29, 11], ['c', 64, 45, 11], ['c', 50, 53, 11], ['c', 36, 45, 11], ['c', 36, 29, 11], ['c', 50, 37, 10]] },
    { id: 'boat', s: [['p', 14, 62, 86, 62, 75, 78, 25, 78], ['l', 50, 62, 50, 14], ['p', 53, 17, 53, 58, 80, 58], ['p', 47, 24, 47, 58, 24, 58],
      ['l', 4, 86, 14, 82, 24, 86, 34, 82, 44, 86, 54, 82, 64, 86, 74, 82, 84, 86, 96, 82], ['c', 86, 14, 7]] }
  ];
  // Fit a drawing as large as possible into a w x h box.
  function fitPage(page, w, h, margin) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    function add(x, y) { if (x < x0) { x0 = x; } if (x > x1) { x1 = x; } if (y < y0) { y0 = y; } if (y > y1) { y1 = y; } }
    each(page.s, function (sh) {
      var t = sh[0], i;
      if (t === 'c') { add(sh[1] - sh[3], sh[2] - sh[3]); add(sh[1] + sh[3], sh[2] + sh[3]); }
      else if (t === 'e') { add(sh[1] - sh[3], sh[2] - sh[4]); add(sh[1] + sh[3], sh[2] + sh[4]); }
      else if (t === 'r') { add(sh[1], sh[2]); add(sh[1] + sh[3], sh[2] + sh[4]); }
      else { for (i = 1; i < sh.length; i += 2) { add(sh[i], sh[i + 1]); } }
    });
    var sc = Math.min((w - 2 * margin) / (x1 - x0), (h - 2 * margin) / (y1 - y0));
    return { sc: sc, ox: (w - (x1 - x0) * sc) / 2 - x0 * sc, oy: (h - (y1 - y0) * sc) / 2 - y0 * sc };
  }
  function drawPage(c, page, ox, oy, sc, lw) {
    c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round';
    each(page.s, function (sh) {
      var t = sh[0], i;
      c.beginPath();
      if (t === 'c') { c.arc(ox + sh[1] * sc, oy + sh[2] * sc, sh[3] * sc, 0, Math.PI * 2); }
      else if (t === 'e') {
        var cx = ox + sh[1] * sc, cy = oy + sh[2] * sc, rx = sh[3] * sc, ry = sh[4] * sc, k = 0.5523;
        c.moveTo(cx - rx, cy);
        c.bezierCurveTo(cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry);
        c.bezierCurveTo(cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy);
        c.bezierCurveTo(cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry);
        c.bezierCurveTo(cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy);
      } else if (t === 'r') {
        var x = ox + sh[1] * sc, y = oy + sh[2] * sc, w = sh[3] * sc, h = sh[4] * sc, r = sh[5] * sc;
        c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y);
      } else {
        c.moveTo(ox + sh[1] * sc, oy + sh[2] * sc);
        for (i = 3; i < sh.length; i += 2) { c.lineTo(ox + sh[i] * sc, oy + sh[i + 1] * sc); }
        if (t === 'p') { c.closePath(); }
      }
      c.stroke();
    });
  }

  GAME_IMPL.paint = function (api) {
    var stage = api.stage;
    var toolH = 104, w = api.w, ch = api.h - toolH + 20;
    var ratio = window.devicePixelRatio > 1 ? 2 : 1;
    function mkCanvas(z) {
      var cv = el('canvas', '', stage);
      cv.style.position = 'absolute'; cv.style.left = '0'; cv.style.top = '0'; cv.style.zIndex = z;
      cv.width = w * ratio; cv.height = ch * ratio; cv.style.width = w + 'px'; cv.style.height = ch + 'px';
      var c = cv.getContext('2d'); c.setTransform(ratio, 0, 0, ratio, 0, 0);
      return { cv: cv, c: c };
    }
    var paint = mkCanvas(1);
    var c = paint.c; c.lineCap = 'round'; c.lineJoin = 'round';
    var stamps = el('div', '', stage);
    stamps.style.position = 'absolute'; stamps.style.left = '0'; stamps.style.top = '0'; stamps.style.zIndex = '2';
    stamps.style.width = w + 'px'; stamps.style.height = ch + 'px'; stamps.style.overflow = 'hidden'; stamps.style.pointerEvents = 'none';
    var outline = mkCanvas(3);
    outline.cv.style.pointerEvents = 'none';

    var back = el('div', 'floatbtn', stage, ICON.back);
    place(back, 16, 16);
    onPress(back, function () { SFX.click(); openMenu(); });

    // Painting colours: the 8 game colours plus black; the rainbow comes last.
    var PCOLORS = COLORS.concat(['#2b2730']), RAINBOW = PCOLORS.length;
    var mode = 'brush', colorIdx = store('paintColor2');
    if (colorIdx === null || colorIdx > RAINBOW) { colorIdx = 0; }
    var hue = 0, SIZES = [12, 28, 52], STAMP_SIZES = [80, 120, 170], sizeIdx = 1, stampCode = null;
    var page = null, mask = null, mw = Math.round(w), mh = Math.round(ch);

    // ----- toolbar -----
    var bar = el('div', 'toolbar', stage);
    var sizeBtn = el('div', 'sw tool', bar);
    function renderSizeBtn() {
      var d = 10 + sizeIdx * 12;
      sizeBtn.innerHTML = '<div class="sizedot" style="width:' + d + 'px;height:' + d + 'px;margin:' + (-d / 2) + 'px 0 0 ' + (-d / 2) + 'px"></div>';
    }
    renderSizeBtn();
    el('div', 'sep', bar);
    var colorEls = [];
    for (var ci = 0; ci <= RAINBOW; ci++) {
      (function (ci) {
        var sw = el('div', 'sw', bar);
        if (ci < RAINBOW) { sw.style.background = PCOLORS[ci]; }
        else { sw.style.backgroundImage = 'linear-gradient(135deg, #ef4b5c, #ff8a2a, #ffd23f, #3fc27a, #3b8beb, #8f5ce0)'; }
        colorEls.push(sw);
        onPress(sw, function () {
          colorIdx = ci; store('paintColor2', ci); mode = 'brush';
          renderSel();
          tone(NOTES[ci], 0.15, 'sine', 0.25);
          if (ci < 8) { say(cap(T().colors[ci])); } else if (ci < RAINBOW) { say(cap(T().black)); }
        });
      })(ci);
    }
    el('div', 'sep', bar);
    var stampBtn = el('div', 'sw tool', bar);
    var pageBtn = el('div', 'sw tool', bar, pic('1f5bc', 36));
    el('div', 'sep', bar);
    var undoBtn = el('div', 'sw tool', bar, ICON.undo);
    undoBtn.style.color = '#3d2c4f';
    var trashBtn = el('div', 'sw tool', bar, ICON.trash);
    trashBtn.style.color = '#ef4b5c'; trashBtn.style.background = '#fff0f2';
    function renderSel() {
      each(colorEls, function (x, i) { if (mode === 'brush' && i === colorIdx) { addClass(x, 'sel'); } else { removeClass(x, 'sel'); } });
      stampBtn.innerHTML = pic(stampCode || '1f436', 38);
      if (mode === 'stamp') { addClass(stampBtn, 'sel'); } else { removeClass(stampBtn, 'sel'); }
    }
    renderSel();

    // ----- pop-up panels (like a keyboard emoji picker) -----
    var panel = null, backdrop = null;
    function closePanel() {
      if (panel) { stage.removeChild(panel); stage.removeChild(backdrop); panel = null; backdrop = null; }
    }
    function openPanel(anchor, width) {
      closePanel();
      backdrop = el('div', 'backdrop', stage);
      onDown(backdrop, function () { closePanel(); });
      panel = el('div', 'popup', stage);
      panel.style.width = width + 'px';
      var r = anchor.getBoundingClientRect();
      var x = Math.max(10, Math.min(w - width - 10, r.left + r.width / 2 - width / 2));
      panel.style.left = Math.round(x) + 'px';
      panel.style.bottom = (toolH + 10) + 'px';
      return panel;
    }
    onPress(sizeBtn, function () {
      SFX.click();
      var p = openPanel(sizeBtn, 290);
      var row = el('div', 'pgrid', p);
      each(SIZES, function (s, i) {
        var it = el('div', 'pitem' + (i === sizeIdx ? ' sel' : ''), row);
        var d = 10 + i * 14;
        it.innerHTML = '<div class="sizedot" style="width:' + d + 'px;height:' + d + 'px;margin:' + (-d / 2) + 'px 0 0 ' + (-d / 2) + 'px"></div>';
        onPress(it, function () { sizeIdx = i; renderSizeBtn(); SFX.click(); closePanel(); });
      });
    });
    var stampCat = 0;
    function openStamps() {
      var p = openPanel(stampBtn, Math.min(w - 20, 620));
      var tabs = el('div', 'tabs', p), grid = el('div', 'pgrid', p);
      function fillGrid() {
        grid.innerHTML = '';
        each(STAMP_CATS[stampCat][1], function (code) {
          var it = el('div', 'pitem' + (code === stampCode && mode === 'stamp' ? ' sel' : ''), grid, pic(code, 60));
          onPress(it, function () {
            stampCode = code; mode = 'stamp'; renderSel(); SFX.boing(400); closePanel();
          });
        });
      }
      each(STAMP_CATS, function (cat, i) {
        var tb = el('div', 'tab' + (i === stampCat ? ' sel' : ''), tabs, pic(cat[0], 40));
        onPress(tb, function () {
          stampCat = i; SFX.click();
          each(tabs.childNodes, function (x, j) { x.className = 'tab' + (j === i ? ' sel' : ''); });
          fillGrid();
        });
      });
      fillGrid();
    }
    onPress(stampBtn, function () { SFX.click(); openStamps(); });

    // ----- undo: a few snapshots of the drawing and the stamps -----
    var history = [], snapped = false;
    function renderUndo() { undoBtn.style.opacity = history.length ? '1' : '0.35'; }
    function snapshot(withCanvas) {
      var copy = null;
      if (withCanvas) {
        copy = document.createElement('canvas');
        copy.width = paint.cv.width; copy.height = paint.cv.height;
        copy.getContext('2d').drawImage(paint.cv, 0, 0);
      }
      history.push({ img: copy, stamps: stamps.innerHTML });
      if (history.length > 8) { history.shift(); }
      renderUndo();
    }
    // Called just before a stroke or fill changes the drawing (once per touch).
    function snapOnce() { if (!snapped) { snapped = true; snapshot(true); } }
    function undo() {
      var h = history.pop();
      if (!h) { return; }
      if (h.img) {
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, paint.cv.width, paint.cv.height); c.drawImage(h.img, 0, 0);
        c.restore();
      }
      stamps.innerHTML = h.stamps;
      renderUndo();
    }
    onPress(undoBtn, function () { if (history.length) { SFX.swoosh(); undo(); } });
    renderUndo();

    function clearAll() { c.clearRect(0, 0, w, ch); stamps.innerHTML = ''; }
    function setPage(pg) {
      clearAll();
      history = []; renderUndo();
      page = pg; mask = null;
      outline.c.clearRect(0, 0, w, ch);
      if (!pg) { return; }
      var fit = fitPage(pg, w, ch - 24, 26), sc = fit.sc, ox = fit.ox, oy = fit.oy;
      outline.c.strokeStyle = '#3d2c4f';
      drawPage(outline.c, pg, ox, oy, sc, 6);
      // Boundary map for the fill tool, at 1 pixel per screen point.
      var mc = document.createElement('canvas');
      mc.width = mw; mc.height = mh;
      var mctx = mc.getContext('2d');
      mctx.strokeStyle = '#000';
      drawPage(mctx, pg, ox, oy, sc, 6);
      var data = mctx.getImageData(0, 0, mw, mh).data;
      mask = new Uint8Array(mw * mh);
      for (var i = 0; i < mw * mh; i++) { mask[i] = data[i * 4 + 3] > 60 ? 1 : 0; }
    }
    onPress(pageBtn, function () {
      SFX.click();
      var p = openPanel(pageBtn, Math.min(w - 20, 540));
      var grid = el('div', 'pgrid', p);
      var blank = el('div', 'page', grid);
      blank.style.background = '#fff';
      onPress(blank, function () { setPage(null); SFX.swoosh(); closePanel(); });
      each(PAGES, function (pg) {
        var it = el('div', 'page', grid);
        var tc = el('canvas', '', it);
        tc.width = 144 * ratio; tc.height = 106 * ratio; tc.style.width = '144px'; tc.style.height = '106px';
        var tctx = tc.getContext('2d'); tctx.setTransform(ratio, 0, 0, ratio, 0, 0); tctx.strokeStyle = '#3d2c4f';
        var tf = fitPage(pg, 144, 106, 8); drawPage(tctx, pg, tf.ox, tf.oy, tf.sc, 2.5);
        onPress(it, function () { setPage(pg); SFX.fill(); closePanel(); });
      });
    });
    onPress(trashBtn, function () {
      // Clearing can be undone too: keep the history across setPage.
      snapshot(true);
      var h = history;
      setPage(page); history = h; renderUndo(); SFX.swoosh();
    });

    // ----- fill (colouring pages) -----
    function currentColor() { return colorIdx === RAINBOW ? pick(COLORS) : PCOLORS[colorIdx]; }
    function fillAt(x, y) {
      if (!mask) { return; }
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= mw || y >= mh || mask[y * mw + x]) { return; }
      var region = new Uint8Array(mw * mh), stack = [x, y], count = 0;
      while (stack.length) {
        var py = stack.pop(), px = stack.pop(), row = py * mw;
        if (region[row + px] || mask[row + px]) { continue; }
        var l = px, r = px;
        while (l > 0 && !mask[row + l - 1] && !region[row + l - 1]) { l--; }
        while (r < mw - 1 && !mask[row + r + 1] && !region[row + r + 1]) { r++; }
        for (var xx = l; xx <= r; xx++) {
          var j = row + xx;
          region[j] = 1; count++;
          if (py > 0 && !region[j - mw] && !mask[j - mw]) { stack.push(xx, py - 1); }
          if (py < mh - 1 && !region[j + mw] && !mask[j + mw]) { stack.push(xx, py + 1); }
        }
      }
      if (!count) { return; }
      snapOnce();
      var col = currentColor();
      var rr = parseInt(col.substr(1, 2), 16), gg = parseInt(col.substr(3, 2), 16), bb = parseInt(col.substr(5, 2), 16);
      var tmp = document.createElement('canvas'); tmp.width = mw; tmp.height = mh;
      var tctx = tmp.getContext('2d'), id = tctx.createImageData(mw, mh), d = id.data;
      for (var k = 0; k < mw * mh; k++) {
        // Colour the region, and the edge pixels next to it (they sit under the outline).
        var on = region[k] || (mask[k] && (region[k - 1] || region[k + 1] || region[k - mw] || region[k + mw] ||
          region[k - 2] || region[k + 2] || region[k - 2 * mw] || region[k + 2 * mw]));
        if (on) { var o = k * 4; d[o] = rr; d[o + 1] = gg; d[o + 2] = bb; d[o + 3] = 255; }
      }
      tctx.putImageData(id, 0, 0);
      c.drawImage(tmp, 0, 0, mw, mh);
      SFX.fill();
    }

    // ----- drawing -----
    var pts = {};
    function strokeTo(id, x, y) {
      var p = pts[id];
      snapOnce();
      if (colorIdx === RAINBOW) {
        hue = (hue + (p && p.x !== null ? Math.sqrt((x - p.x) * (x - p.x) + (y - p.y) * (y - p.y)) * 0.6 : 8)) % 360;
        c.strokeStyle = 'hsl(' + Math.round(hue) + ',90%,56%)';
      } else { c.strokeStyle = PCOLORS[colorIdx]; }
      c.lineWidth = SIZES[sizeIdx];
      c.beginPath();
      if (p && p.x !== null) { c.moveTo(p.x, p.y); } else { c.moveTo(x - 0.1, y); }
      c.lineTo(x, y); c.stroke();
      pts[id] = { x: x, y: y, sx: p ? p.sx : x, sy: p ? p.sy : y, moved: true };
    }
    function down(id, x, y) {
      if (y > ch) { return; }
      if (mode === 'stamp') {
        var size = STAMP_SIZES[sizeIdx];
        snapshot(false);
        var s = el('div', 'stamp', stamps, img(stampCode, size));
        s.style.left = (x - size / 2) + 'px'; s.style.top = (y - size / 2) + 'px';
        setTransform(s.firstChild, 'rotate(' + Math.round(rand(-15, 15)) + 'deg)');
        if (stamps.childNodes.length > 80) { stamps.removeChild(stamps.firstChild); }
        SFX.boing(rand(250, 500));
        return;
      }
      // On a colouring page: a tap fills, a drag paints.
      if (page) { pts[id] = { x: null, y: null, sx: x, sy: y, moved: false }; return; }
      pts[id] = null;
      strokeTo(id, x, y);
    }
    function move(id, x, y) {
      var p = pts[id];
      if (mode === 'stamp' || p === undefined) { return; }
      if (page && p && !p.moved) {
        if (Math.abs(x - p.sx) + Math.abs(y - p.sy) < 12) { return; }
        pts[id] = { x: p.sx, y: p.sy, sx: p.sx, sy: p.sy, moved: true };
      }
      strokeTo(id, x, y);
    }
    function up(id) {
      var p = pts[id];
      if (page && p && !p.moved && mode === 'brush') { fillAt(p.sx, p.sy); }
      delete pts[id];
      // All fingers lifted: the next touch is a new step for undo.
      var any = false; for (var k in pts) { if (pts.hasOwnProperty(k)) { any = true; } }
      if (!any) { snapped = false; }
    }
    var cv = paint.cv;
    cv.addEventListener('touchstart', function (ev) {
      ev.preventDefault();
      for (var i = 0; i < ev.changedTouches.length; i++) { var t = ev.changedTouches[i]; down(t.identifier, t.clientX, t.clientY - api.top); }
    }, false);
    cv.addEventListener('touchmove', function (ev) {
      ev.preventDefault();
      for (var i = 0; i < ev.changedTouches.length; i++) { var t = ev.changedTouches[i]; move(t.identifier, t.clientX, t.clientY - api.top); }
    }, false);
    function ends(ev) { for (var i = 0; i < ev.changedTouches.length; i++) { up(ev.changedTouches[i].identifier); } }
    cv.addEventListener('touchend', ends, false);
    cv.addEventListener('touchcancel', ends, false);
    var mouse = false;
    cv.addEventListener('mousedown', function (ev) { mouse = true; down('m', ev.clientX, ev.clientY - api.top); }, false);
    cv.addEventListener('mousemove', function (ev) { if (mouse) { move('m', ev.clientX, ev.clientY - api.top); } }, false);
    cv.addEventListener('mouseup', function () { if (mouse) { mouse = false; up('m'); } }, false);
    return {};
  };

  // ---------- 4. Peekaboo ----------
  GAME_IMPL.peek = function (api) {
    var stage = api.stage;
    var BL = [['#8f5ce0', '#a983ee'], ['#3b8beb', '#64a6f2'], ['#ff8a2a', '#ffa75e']];
    function blanketStyle(i) {
      var c = BL[i];
      return 'background-color:' + c[0] + ';background-image:repeating-linear-gradient(45deg,' + c[0] + ',' + c[0] + ' 30px,' + c[1] + ' 30px,' + c[1] + ' 60px)';
    }
    function makeSlots(n, x0, y0, aw, ah) {
      var gap = 30, sw = Math.min((aw - gap * (n + 1)) / n, ah - 20), sh = Math.min(ah - 20, sw * 1.12);
      var xs = [], slots = [];
      for (var i = 0; i < n; i++) { xs.push(x0 + (aw - (n * sw + (n - 1) * gap)) / 2 + i * (sw + gap)); }
      for (i = 0; i < n; i++) {
        var s = el('div', 'slot', stage);
        place(s, xs[i], y0 + (ah - sh) / 2, sw, sh);
        var face = el('div', '', s); face.style.position = 'absolute'; face.style.left = face.style.top = face.style.right = face.style.bottom = '0';
        var bl = el('div', 'blanket', s, '<div class="face">?</div>');
        bl.setAttribute('style', blanketStyle(i));
        slots.push({ e: s, face: face, bl: bl, animal: null, open: false, pos: i });
      }
      return { slots: slots, xs: xs, size: Math.min(sw, sh), sw: sw, gap: gap };
    }
    function setAnimal(sl, a, size) { sl.animal = a; sl.face.innerHTML = a ? pic(a.c, size * 0.7) : ''; }
    function setOpen(sl, o) { sl.open = o; if (o) { addClass(sl.bl, 'open'); } else { removeClass(sl.bl, 'open'); } }

    // Level 1: classic peekaboo.
    if (api.level === 0) {
      var one = makeSlots(1, 0, 0, api.w, api.h), sl0 = one.slots[0], busy0 = false;
      setAnimal(sl0, pick(ANIMALS), one.size);
      onDown(sl0.e, function () {
        if (busy0) { return; }
        busy0 = true; api.later(function () { busy0 = false; }, 600);
        if (!sl0.open) {
          setOpen(sl0, true); tone(400, 0.25, 'triangle', 0.35, 900);
          animalHello(sl0.animal, T().games.peek.t + ' !');
          restartAnim(sl0.face, 'bounce');
        } else {
          setOpen(sl0, false); tone(500, 0.25, 'triangle', 0.3, 250);
          var old = sl0.animal;
          api.later(function () { var a = pick(ANIMALS); while (a.k === old.k) { a = pick(ANIMALS); } setAnimal(sl0, a, one.size); }, 500);
        }
      });
      return {};
    }

    var goal = 5, done = 0, mistakes = 0, busy = true, target = null;
    var ui = questUI(api, function () { if (target && !busy) { SFX.click(); say(where(target)); } }, goal);
    var g = makeSlots(3, 0, ui.height - 10, api.w, api.h - ui.height);
    var slots = g.slots;
    function closeAll() { each(slots, function (s) { setOpen(s, false); }); }
    function openAll() { each(slots, function (s) { if (s.e.style.display !== 'none') { setOpen(s, true); } }); }
    function moveTo(sl, pos) { sl.pos = pos; sl.e.style.left = Math.round(g.xs[pos]) + 'px'; }

    // Level 2: look at the animals, they hide, find the one asked for.
    function roundRemember() {
      busy = true;
      var count = done < 2 ? 2 : 3;
      var animals = shuffle(ANIMALS).slice(0, 3);
      each(slots, function (s, i) {
        s.e.style.display = (count === 2 && i === 2) ? 'none' : '';
        setAnimal(s, animals[i], g.size);
        moveTo(s, i);
      });
      if (count === 2) { // centre the two cards
        var shift = (g.sw + g.gap) / 2;
        slots[0].e.style.left = Math.round(g.xs[0] + shift) + 'px';
        slots[1].e.style.left = Math.round(g.xs[1] + shift) + 'px';
      }
      target = animals[Math.floor(Math.random() * count)];
      openAll();
      say(T().look);
      api.later(function () {
        closeAll(); SFX.whoosh();
        api.later(function () { busy = false; say(where(target)); }, 700);
      }, 2600 + count * 300);
    }
    // Level 3: one animal hides, the blankets swap places, follow it with your eyes.
    function roundFollow() {
      busy = true;
      var a = pick(ANIMALS), hidden = Math.floor(Math.random() * 3);
      each(slots, function (s, i) { s.e.style.display = ''; moveTo(s, i); setAnimal(s, i === hidden ? a : null, g.size); });
      target = a;
      setOpen(slots[hidden], true);
      say(T().look); api.later(function () { animalSound(a); }, 900);
      var swaps = 2 + Math.min(done, 3), k = 0;
      function swapOnce() {
        if (k >= swaps) { api.later(function () { busy = false; say(where(target)); }, 500); return; }
        k++;
        var p1 = Math.floor(Math.random() * 3), p2 = (p1 + 1 + Math.floor(Math.random() * 2)) % 3, s1 = null, s2 = null;
        each(slots, function (s) { if (s.pos === p1) { s1 = s; } if (s.pos === p2) { s2 = s; } });
        moveTo(s1, p2); moveTo(s2, p1);
        SFX.whoosh();
        api.later(swapOnce, 950);
      }
      api.later(function () { closeAll(); SFX.whoosh(); api.later(swapOnce, 900); }, 2400);
    }
    var round = api.level === 1 ? roundRemember : roundFollow;

    each(slots, function (sl) {
      onDown(sl.e, function () {
        if (busy || sl.open || overlayOpen) { return; }
        setOpen(sl, true);
        tone(400, 0.25, 'triangle', 0.3, 900);
        if (sl.animal && sl.animal.k === target.k) {
          busy = true;
          restartAnim(sl.face, 'bounce');
          SFX.good(); animalSound(sl.animal); api.later(function () { say(praise()); }, 1300);
          done++; ui.set(done);
          api.later(function () {
            closeAll();
            api.later(function () { if (done >= goal) { api.win(starsFromMistakes(mistakes, 1, 3)); } else { round(); } }, 700);
          }, 1800);
        } else {
          mistakes++; busy = true;
          restartAnim(sl.e, 'shake');
          if (sl.animal) { say(cap(aName(sl.animal))); } else { SFX.bad(); }
          api.later(function () {
            setOpen(sl, false);
            api.later(function () { busy = false; say(where(target)); }, 500);
          }, 1300);
        }
      });
    });
    api.later(round, 400);
    return {};
  };

  // ---------- 5. Piano ----------
  var songIdx = store('song') || 0;
  GAME_IMPL.piano = function (api) {
    var stage = api.stage;
    var mode = api.level, pos = 0, mistakes = 0, finished = false;
    if (songIdx >= SONGS.length) { songIdx = 0; }
    var songNotes = SONGS[songIdx].notes.split(' ');
    var keyMidi = mode === 0 ? DEFAULT_KEYS.map(midiOf) : songKeys(songNotes);
    var KF = keyMidi.map(freqOf);
    var song = songNotes.map(function (n) { return keyMidi.indexOf(midiOf(n)); });
    var nk = KF.length, kw = api.w / nk, keys = [];
    var NOTE_PICS = ['1f3b5', '1f3b6', '2b50', '2764', '2728'];

    function renderInfo() {
      if (mode === 0) { return; }
      var pct = Math.round(pos / song.length * 100);
      var inf = api.info('<div class="pillw press" id="songBtn"><div class="fill" style="width:' + pct + '%"></div>' + img('1f3b5', 30) +
        '<span style="max-width:230px;overflow:hidden;text-overflow:ellipsis">' + SONGS[songIdx].n[lang] + '</span></div>');
      onPress(inf.querySelector('#songBtn'), openSongs);
    }
    function openSongs() {
      SFX.click();
      var h = '<h2>' + T().songsLabel + '</h2><div style="margin-top:16px">';
      each(SONGS, function (s, i) { h += '<div class="listbtn' + (i === songIdx ? ' sel' : '') + '" data-i="' + i + '">' + img(s.flag, 44) + s.n[lang] + '</div>'; });
      openSheet(h + '</div>');
      each($('sheet').querySelectorAll('.listbtn'), function (b) {
        onPress(b, function () { songIdx = +b.getAttribute('data-i'); store('song', songIdx); SFX.click(); startLevel(level); });
      });
    }
    function floatNote(i, y) {
      var n = el('div', 'note', stage, img(pick(NOTE_PICS), 64));
      n.style.left = (i * kw + kw / 2 - 32) + 'px'; n.style.top = (y - 70) + 'px';
      setTimeout(function () { if (n.parentNode) { n.parentNode.removeChild(n); } }, 1300);
    }
    function light(i) { addClass(keys[i].e, 'down'); setTimeout(function () { removeClass(keys[i].e, 'down'); }, 220); }
    function showHint() {
      each(keys, function (k, i) {
        removeClass(k.e, 'glow'); removeClass(k.e, 'dim'); k.hint.style.display = 'none';
        if (mode === 2 && !finished) {
          if (i === song[pos]) { addClass(k.e, 'glow'); k.hint.style.display = 'block'; } else { addClass(k.e, 'dim'); }
        }
      });
    }
    function songDone() {
      finished = true; showHint();
      api.later(function () { api.win(mode === 1 ? 3 : starsFromMistakes(mistakes, 2, 5)); }, 800);
    }
    each(KF, function (f, i) {
      var k = el('div', 'key', stage, '<div class="gloss"></div>');
      place(k, i * kw, 0, kw, api.h);
      k.style.background = KEY_COLORS[i % KEY_COLORS.length];
      var hint = el('div', '', k, '<div class="hand">' + img('1f447', 80) + '</div><div class="hint">' + img('1f31f', 70) + '</div>');
      hint.style.display = 'none';
      keys.push({ e: k, hint: hint });
      onDown(k, function (pt) {
        if (overlayOpen) { return; }
        var y = pt.clientY - api.top;
        if (mode === 0 || finished) { tone(f, 0.6, 'triangle', 0.4); light(i); floatNote(i, y); return; }
        if (mode === 1) {
          var ni = song[pos];
          tone(KF[ni], 0.6, 'triangle', 0.4); light(ni); floatNote(ni, y);
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
          tone(f, 0.25, 'sine', 0.12);
          restartAnim(keys[song[pos]].e, 'shake');
        }
      });
    });
    renderInfo();
    showHint();
    return {};
  };

  // ---------- 6. Memory ----------
  var memTheme = store('memTheme') || 0;
  GAME_IMPL.memory = function (api) {
    var stage = api.stage;
    if (memTheme >= THEMES.length) { memTheme = 0; }
    var pairs = [2, 3, 4, 6, 8][api.level];
    var items = shuffle(THEMES[memTheme].items).slice(0, pairs);
    var deck = [];
    each(items, function (x) { deck.push(x); deck.push(x); });
    deck = shuffle(deck);
    var boxes = fitGrid(deck.length, api.w, api.h, 24, 0, 0, true);
    var open = [], found = 0, moves = 0, busy = true, cards = [];
    var backStar = '<svg viewBox="0 0 24 24"><path fill="rgba(255,255,255,0.9)" d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z"/></svg>';

    function renderInfo() {
      var inf = api.info('<div class="pillw press" id="themeBtn">' + img(THEMES[memTheme].icon, 30) + '<span style="opacity:.5">▾</span></div>' +
        '<div class="pillw">' + img('2705', 30) + '<span>' + found + ' / ' + pairs + '</span></div>');
      onPress(inf.querySelector('#themeBtn'), function () {
        SFX.click();
        var h = '<h2>' + T().themeLabel + '</h2><div style="margin-top:16px">';
        each(THEMES, function (t, i) { h += '<div class="listbtn' + (i === memTheme ? ' sel' : '') + '" data-i="' + i + '">' + img(t.icon, 44) + T().themes[i] + '</div>'; });
        openSheet(h + '</div>');
        each($('sheet').querySelectorAll('.listbtn'), function (b) {
          onPress(b, function () { memTheme = +b.getAttribute('data-i'); store('memTheme', memTheme); SFX.click(); startLevel(level); });
        });
      });
    }
    function turn(card, faceUp) {
      addClass(card, 'flip');
      setTimeout(function () {
        card.className = 'card ' + (faceUp ? 'face' : 'back-side') + ' flip' + (card.isFound ? ' found' : '');
        card.innerHTML = faceUp ? pic(card.code, card.size * 0.66) : backStar;
        void card.offsetWidth;
        removeClass(card, 'flip');
      }, 180);
    }
    function animalFor(code) {
      for (var k = 0; k < ANIMALS.length; k++) { if (ANIMALS[k].c === code) { return ANIMALS[k]; } }
      return null;
    }
    each(deck, function (code, n) {
      var b = boxes[n], card = el('div', 'card back-side', stage, backStar);
      place(card, b.x, b.y, b.s, b.s);
      card.code = code; card.size = b.s;
      cards.push(card);
      onDown(card, function () {
        if (busy || card.isOpen || card.isFound || overlayOpen) { return; }
        card.isOpen = true; open.push(card);
        turn(card, true);
        tone(400 + n * 30, 0.15, 'sine', 0.3);
        if (open.length < 2) { return; }
        busy = true; moves++;
        var c1 = open[0], c2 = open[1];
        open = [];
        if (c1.code === c2.code) {
          api.later(function () {
            c1.isFound = c2.isFound = true;
            addClass(c1, 'found'); addClass(c2, 'found');
            restartAnim(c1, 'bounce'); restartAnim(c2, 'bounce');
            SFX.good();
            // A happy phrase, or sometimes the animal's real sound. Never its name.
            var an = animalFor(c1.code);
            if (an && recBuf[an.k] && Math.random() < 0.5) { animalSound(an); } else { say(praise()); }
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
    // Big play button. On tap: show all the cards for a moment, then turn them over.
    var size = Math.min(190, api.h * 0.3);
    var go = el('div', 'quest bigplay', stage, ICON.play);
    go.style.background = api.color; go.style.zIndex = '5';
    place(go, (api.w - size) / 2, (api.h - size) / 2, size, size);
    onPress(go, function () {
      if (go.parentNode) { stage.removeChild(go); } else { return; }
      say(T().look);
      each(cards, function (cd) { turn(cd, true); });
      api.later(function () { each(cards, function (cd) { turn(cd, false); }); SFX.whoosh(); busy = false; }, 1600 + pairs * 350);
    });
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

  if (window.applicationCache) {
    window.applicationCache.addEventListener('updateready', function () {
      try { window.applicationCache.swapCache(); } catch (e) {}
      if (currentScreen === 'start') { location.reload(); }
    }, false);
  }
})();
