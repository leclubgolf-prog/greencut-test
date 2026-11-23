/* GREENCUT – table multijoueur de TEST (Firebase Realtime Database).
   Principe : l'appareil de l'hôte (place 0) fait tourner le jeu ; les autres joueurs envoient leurs actions et reçoivent
   une « vue » de leur point de vue (cartes des autres non incluses dans l'écran). Limite assumée : l'hôte voit tout ; pas pour la production.
   Données : tables/{code}/meta, seats/{n}, view/{n} (texte JSON), act/{id}, ready/{n}. */
(function () {
  const TURN_MS = 60000;
  const AI_NAMES = ['Fairway_Fox', 'BirdieBandit', 'Dune_Queen', 'Sunset_Sam', 'Caddy_Kid', 'Links_Lou', 'Mulligan_Max'];
  // ---------- base simulée (tests) ----------
  function memAdapter(bus, uid) {
    bus.store = bus.store || {}; bus.ls = bus.ls || []; bus.n = bus.n || 0;
    const get = (p) => p.split('/').filter(Boolean).reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), bus.store);
    const put = (p, v) => { const ks = p.split('/').filter(Boolean); let o = bus.store; ks.slice(0, -1).forEach((k) => { if (typeof o[k] !== 'object' || o[k] === null) { o[k] = {}; } o = o[k]; }); if (v === null || v === undefined) { delete o[ks[ks.length - 1]]; } else { o[ks[ks.length - 1]] = JSON.parse(JSON.stringify(v)); } };
    const fire = () => { bus.ls.slice().forEach((l) => { const v = get(l.p); const j = JSON.stringify(v === undefined ? null : v); if (l.kind === 'value' && j !== l.last) { l.last = j; l.cb(v === undefined ? null : JSON.parse(j)); } if (l.kind === 'child' && v) { Object.keys(v).forEach((k) => { if (!l.seen[k]) { l.seen[k] = 1; l.cb(k, JSON.parse(JSON.stringify(v[k]))); } }); } }); };
    return {
      uid: () => uid, kind: 'mem',
      set: (p, v) => { put(p, v); Promise.resolve().then(fire); return Promise.resolve(); },
      get: (p) => { const v = get(p); return Promise.resolve(v === undefined ? null : JSON.parse(JSON.stringify(v))); },
      on: (p, cb) => { const l = { p, kind: 'value', cb, last: undefined }; bus.ls.push(l); Promise.resolve().then(() => { const v = get(p); l.last = JSON.stringify(v === undefined ? null : v); cb(v === undefined ? null : JSON.parse(l.last)); }); return () => { bus.ls = bus.ls.filter((x) => x !== l); }; },
      onChildAdded: (p, cb) => { const l = { p, kind: 'child', cb, seen: {} }; bus.ls.push(l); Promise.resolve().then(fire); return () => { bus.ls = bus.ls.filter((x) => x !== l); }; },
      push: (p, v) => { const id = 'k' + String(++bus.n).padStart(6, '0'); put(p + '/' + id, v); Promise.resolve().then(fire); return Promise.resolve(id); },
      transaction: (p, fn) => { const cur = get(p); const nv = fn(cur === undefined ? null : JSON.parse(JSON.stringify(cur))); if (nv === undefined) { return Promise.resolve(false); } put(p, nv); Promise.resolve().then(fire); return Promise.resolve(true); },
      remove: (p) => { put(p, null); Promise.resolve().then(fire); return Promise.resolve(); }
    };
  }
  // ---------- Firebase réel ----------
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('chargement ' + src)); document.head.appendChild(s); }); }
  async function fbAdapter() {
    const cfg = window.GREENCUT_FIREBASE; if (!cfg || !cfg.databaseURL) { throw new Error('Configuration Firebase absente'); }
    const v = '10.12.5'; const base = 'https://www.gstatic.com/firebasejs/' + v + '/';
    if (!window.firebase) { await loadScript(base + 'firebase-app-compat.js'); await loadScript(base + 'firebase-auth-compat.js'); await loadScript(base + 'firebase-database-compat.js'); }
    if (!firebase.apps.length) { firebase.initializeApp(cfg); }
    const cred = await firebase.auth().signInAnonymously(); const db = firebase.database(); const uid = cred.user.uid;
    return {
      uid: () => uid, kind: 'firebase',
      set: (p, v) => db.ref(p).set(v),
      get: (p) => db.ref(p).get().then((s) => s.val()),
      on: (p, cb) => { const r = db.ref(p); const f = r.on('value', (s) => cb(s.val())); return () => r.off('value', f); },
      onChildAdded: (p, cb) => { const r = db.ref(p); const f = r.on('child_added', (s) => cb(s.key, s.val())); return () => r.off('child_added', f); },
      push: (p, v) => { const r = db.ref(p).push(); return r.set(v).then(() => r.key); },
      transaction: (p, fn) => db.ref(p).transaction(fn).then((r) => r.committed),
      remove: (p) => db.ref(p).remove()
    };
  }
  const T = (code) => 'tables/' + code;
  const genCode = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 5; i++) { c += a[Math.floor(Math.random() * a.length)]; } return c; };
  // ---------- salon ----------
  async function createTable(ad, o) {
    for (let k = 0; k < 8; k++) {
      const code = genCode(); const ok = await ad.transaction(T(code) + '/meta', (cur) => (cur ? undefined : { host: ad.uid(), nP: o.nP, course: o.course, state: 'lobby', created: Date.now() }));
      if (ok) { await ad.set(T(code) + '/seats/0', { uid: ad.uid(), pseudo: o.pseudo, av: o.av || 0 }); return code; }
    }
    throw new Error('Impossible de créer une table');
  }
  async function joinTable(ad, code, o) {
    code = String(code || '').trim().toUpperCase(); const meta = await ad.get(T(code) + '/meta');
    if (!meta) { return { error: 'Table introuvable. Vérifiez le code.' }; }
    if (meta.state !== 'lobby') { return { error: 'La partie a déjà commencé.' }; }
    const seats = (await ad.get(T(code) + '/seats')) || {};
    for (const k of Object.keys(seats)) { if (seats[k] && seats[k].uid === ad.uid()) { return { seat: Number(k), code, meta }; } }
    for (let n = 1; n < meta.nP; n++) { const ok = await ad.transaction(T(code) + '/seats/' + n, (cur) => (cur ? undefined : { uid: ad.uid(), pseudo: o.pseudo, av: o.av || 0 })); if (ok) { return { seat: n, code, meta }; } }
    return { error: 'La table est complète.' };
  }
  function watchLobby(ad, code, cb) {
    let meta = null; let seats = null; const push = () => { if (meta) { const list = []; Object.keys(seats || {}).sort().forEach((k) => { if (seats[k]) { list.push(Object.assign({ seat: Number(k) }, seats[k])); } }); cb({ meta, seats: list }); } };
    const u1 = ad.on(T(code) + '/meta', (v) => { meta = v; push(); }); const u2 = ad.on(T(code) + '/seats', (v) => { seats = v; push(); });
    return () => { u1(); u2(); };
  }
  function startGame(ad, code) { return ad.get(T(code) + '/meta').then((m) => ad.set(T(code) + '/meta', Object.assign({}, m, { state: 'playing', started: Date.now() }))); }
  // ---------- jeu ----------
  async function attach(eng, o) {
    const ad = o.adapter; const code = o.code; const seat = o.seat; const meta = await ad.get(T(code) + '/meta'); const seatsObj = (await ad.get(T(code) + '/seats')) || {};
    const humans = Object.keys(seatsObj).map(Number).filter((k) => seatsObj[k]).sort((a, b) => a - b);
    const nP = meta.nP; const names = []; let ai = 0; for (let i = 0; i < nP; i++) { names[i] = seatsObj[i] ? seatsObj[i].pseudo : AI_NAMES[ai++ % AI_NAMES.length]; }
    const ctl = { code, seat, nP, humans, names, stop: [], turnTimer: null };
    eng._mpCtl = ctl;
    if (seat !== 0) {
      // ----- joueur invité : reçoit sa vue, envoie ses actions -----
      eng._pace = false; eng.setState(eng.initial({ nP, course: meta.course, pseudo: names[seat], pseudoDraft: names[seat] }));
      eng._mpSend = (a) => { ad.push(T(code) + '/act', { seat, kind: a.kind, to: a.to || 0, hole: eng.state.hole, t: Date.now() }); };
      eng._opp = names.filter((x, i) => i !== 0).slice(0, nP - 1);
      const realAdvance = eng.advance.bind(eng); eng._mpRealAdvance = realAdvance;
      eng.advance = () => { ad.set(T(code) + '/ready/' + seat, eng.state.hole); };
      let last = -1; ctl.stop.push(ad.on(T(code) + '/view/' + seat, (txt) => { if (!txt) { return; } let v; try { v = JSON.parse(txt); } catch (x) { return; } if (v.seq <= last) { return; } last = v.seq; eng.mpApplyView(v); }));
      return ctl;
    }
    // ----- hôte : fait tourner la partie -----
    eng._mpOn = true; eng._humans = {}; humans.forEach((k) => { if (k > 0) { eng._humans[k] = true; } }); eng._opp = names.slice(1);
    const ps = names[0]; eng.setState(eng.initial({ nP, course: meta.course, pseudo: ps, pseudoDraft: ps }));
    let seq = 0; let lastH = null; let lastKey = ''; let timer = null; let pending = false;
    const holeKey = () => { const s = eng.state; return s.hole + '|' + s.h.phase + '|' + s.h.turn + '|' + s.h.round + '|' + s.h.pot + '|' + (s.turnSeat === undefined ? '' : s.turnSeat); };
    const publish = () => {
      pending = false; const s = eng.state; if (!s.h) { return; } const key = holeKey() + '|' + s.h.status.join(','); if (key === lastKey) { return; } lastKey = key; seq++;
      humans.filter((k) => k > 0).forEach((k) => { const v = eng.mpViewFor(k, names); v.seq = seq; ad.set(T(code) + '/view/' + k, JSON.stringify(v)); });
      clearTimeout(ctl.turnTimer);
      if (s.h.phase === 'bet' && s.turnSeat > 0) { const who = s.turnSeat; const hk = holeKey(); ctl.turnTimer = setTimeout(() => { const t = eng.state; if (holeKey() === hk) { const toCall = t.h.cur - t.h.rb[who]; eng.heroAct(toCall > 0 ? 'fold' : 'call', 0, who); } }, o.turnMs || TURN_MS); }
    };
    const origSet = eng.setState.bind(eng); eng.setState = (u) => { origSet(u); if (u && (u.h || u.stacks) && !pending) { pending = true; Promise.resolve().then(publish); } };
    ctl.stop.push(ad.onChildAdded(T(code) + '/act', (id, a) => { if (!a || a.done) { return; } if (a.hole !== eng.state.hole) { return; } eng.heroAct(a.kind, a.to, a.seat); }));
    const ready = {}; const realAdvance = eng.advance.bind(eng);
    const tryNext = () => { const s = eng.state; if (!s.h || s.h.phase !== 'done' || s.h.hole >= 18) { return; } if (humans.every((k) => ready[k] === s.hole)) { realAdvance(false); } };
    humans.filter((k) => k > 0).forEach((k) => { ctl.stop.push(ad.on(T(code) + '/ready/' + k, (v) => { ready[k] = v; tryNext(); })); });
    eng.advance = (r) => { ready[0] = eng.state.hole; tryNext(); };
    ctl.hostReadyState = () => ready;
    pending = true; Promise.resolve().then(publish);
    return ctl;
  }
  async function autoAttach(eng) {
    const q = new URLSearchParams(location.search); const code = q.get('mp'); const seat = Number(q.get('seat') || 0);
    try { const ad = await fbAdapter(); await attach(eng, { adapter: ad, code, seat }); eng.setState({ mpCode: code, mpSeat: seat, mpError: '' }); }
    catch (e) { eng.setState({ mpError: String(e && e.message || e) }); }
  }
  window.GreencutMP = { memAdapter, fbAdapter, createTable, joinTable, watchLobby, startGame, attach, autoAttach, TURN_MS };
})();
