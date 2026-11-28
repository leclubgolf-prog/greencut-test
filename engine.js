/* GREENCUT – moteur de jeu commun (desktop + mobile). Aucune mise en page ici : règles, cartes, combinaisons, scores, bonus, showdown, adversaires, conseils, sons, conversion fees/points. */
(function () {
const MIN_P = 4, MAX_P = 6; // une table compte de 4 à 6 joueurs (décision du 24/11/2026)
let NP = 6;
const Z = (v) => Array.from({ length: NP }, () => v);
const COURSE_DATA = {
augusta: { id: 'augusta', name: 'Augusta National Golf Club', short: 'Augusta National', place: 'Augusta, Géorgie', country: 'États-Unis', tee: 'tees Masters, 2026', plays: 1284, status: 'ok',
  pars: [4, 5, 4, 3, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 5, 3, 4, 4], yards: [445, 585, 350, 240, 495, 180, 450, 570, 460, 495, 520, 155, 545, 440, 550, 170, 450, 465],
  names: ['Tea Olive', 'Pink Dogwood', 'Flowering Peach', 'Flowering Crab Apple', 'Magnolia', 'Juniper', 'Pampas', 'Yellow Jasmine', 'Carolina Cherry', 'Camellia', 'White Dogwood', 'Golden Bell', 'Azalea', 'Chinese Fir', 'Firethorn', 'Redbud', 'Nandina', 'Holly'],
  idx: [9, 1, 13, 15, 5, 17, 11, 3, 7, 6, 8, 16, 4, 12, 2, 18, 14, 10], tip: 'Parcours des Masters : 4 Par 3, 10 Par 4 et 4 Par 5, avec de l’eau (Amen Corner) et des greens rapides.' },
standrews: { id: 'standrews', name: 'Old Course – St Andrews Links', short: 'Old Course', place: 'St Andrews, Écosse', country: 'Royaume-Uni', tee: 'tees Championship (M)', plays: 962, status: 'ok', source: 'golfcore.org',
  pars: [4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 4, 4, 4], yards: [367, 400, 397, 480, 568, 431, 371, 188, 352, 386, 173, 348, 430, 618, 455, 423, 449, 354],
  names: ['Burn', 'Dyke', 'Cartgate Out', 'Ginger Beer', 'Hole o’Cross', 'Heathery Out', 'High Out', 'Short', 'End', 'Bobby Jones', 'High In', 'Heathery In', 'Hole o’Cross', 'Long', 'Cartgate In', 'Corner of the Dyke', 'Road', 'Tom Morris'],
  idx: [11, 3, 7, 1, 13, 9, 5, 15, 17, 18, 6, 14, 2, 12, 8, 10, 4, 16], tip: 'Links écossais : seulement 2 Par 3 et 2 Par 5 sur 18 trous. Les 14 Par 4 donnent un jeu où les cartes du Par 4 comptent presque tout le temps.',
  D: [
[0, [], ['fl'], 'front', 'Trou d’ouverture : très large fairway partagé avec le 18, le Swilcan Burn passe devant le green.'],
[0.2, [[0.55, -1]], ['fr', 'l'], '', 'Fairway large avec des bunkers dans la ligne de jeu ; green partagé avec le 16.'],
[-0.3, [[0.6, 1]], ['fl', 'r'], '', 'Fairway bordé de bunkers de poche (pot bunkers) ; green partagé avec le 15.'],
[0, [[0.5, -1]], ['fr', 'l'], '', 'Le plus difficile du parcours (index 1) : long, exposé au vent ; green partagé avec le 14.'],
[0.2, [[0.4, 1]], ['fl'], '', 'Par 5 : green gigantesque partagé avec le 13 ; deux coups suffisent rarement.'],
[-0.3, [[0.5, -1]], ['l', 'r'], '', 'Fairway étroit entre les bruyères, bunkers de poche ; green partagé avec le 12.'],
[0.3, [], ['fr', 'b'], '', 'Green en hauteur, partagé avec le 11 : approche à placer avec soin.'],
[0, [], ['fl', 'fr', 'b'], '', 'Par 3 court (188 yds) : green gardé par des bunkers, le vent décide ; green partagé avec le 10.'],
[0, [], ['fl'], '', 'Par 4 court (352 yds) : green abordable, bunkers de poche à surveiller.'],
[0.1, [], ['fl', 'fr'], '', 'Par 4 : bunkers de poche qui gardent le green.'],
[0, [], ['fl', 'fr', 'b'], '', 'Par 3 : le Strath bunker garde le green, partagé avec le 7.'],
[0.2, [[0.5, 1]], ['l'], '', 'Fairway étroit, bruyères et bunkers de poche ; green partagé avec le 6.'],
[-0.2, [[0.6, -1]], ['r', 'b'], '', 'Trou long (index 2) : bunkers dans la ligne de jeu, green gigantesque partagé avec le 5.'],
[0.7, [[0.4, -1], [0.55, -1]], ['fl', 'b'], '', 'Par 5 de 618 yds : le Hell bunker coupe le chemin du second coup.'],
[0, [[0.6, 1]], ['fr'], '', 'Par 4 : bunkers devant le green, partagé avec le 3.'],
[-0.4, [[0.5, 1]], ['l', 'fr'], '', 'Il faut contourner les bunkers du coin de départ ; green partagé avec le 2.'],
[0.8, [], ['fl', 'b', 'fr'], '', 'Le Road Hole : bunker de la Road Hole devant le green, la route juste derrière. Le trou le plus redouté.'],
[0, [], ['fl'], 'front', 'Dernier trou : fairway partagé avec le 1, Swilcan Burn à franchir, Valley of Sin devant le green.']
] },
majlis: { id: 'majlis', name: 'Emirates Golf Club – Majlis Course', short: 'Majlis', place: 'Dubaï', country: 'Émirats arabes unis', tee: 'tees Championship', plays: 0, status: 'ok', source: 'golfpass', tourOnly: true,
  pars: [4, 4, 5, 3, 4, 4, 3, 4, 4, 5, 3, 4, 5, 4, 3, 4, 4, 5], yards: [469, 351, 601, 180, 451, 485, 186, 459, 488, 549, 169, 476, 550, 434, 190, 446, 359, 564],
  names: Array(18).fill(''), // décision du 25/11/2026 : pas de nom aux trous du Majlis (numéro, par, yards et index seulement)
  idx: [9, 13, 15, 11, 3, 7, 17, 1, 5, 10, 16, 2, 12, 4, 14, 8, 18, 6], tip: 'Parcours du tournoi Greencut Emirates Golf Club : Par 72 (aller 35, retour 37), 4 Par 3 et 4 Par 5, dans le désert de Dubaï. Tracés simplifiés.',
  D: [
[0.2, [[0.6, 1]], ['fl', 'r'], '', 'Par 4 d’ouverture de 469 yds : départ exigeant, désert de part et d’autre du fairway.'],
[-0.3, [], ['fr', 'l'], '', 'Par 4 court (351 yds) : un trou où viser le birdie, green gardé par des bunkers.'],
[0.4, [[0.45, -1], [0.6, 1]], ['fl', 'b'], '', 'Par 5 de 601 yds, le plus long du parcours : trois coups pour atteindre le green.'],
[0, [], ['fl', 'fr'], '', 'Premier Par 3 (180 yds) : green entouré de bunkers.'],
[-0.5, [[0.55, -1]], ['r', 'fl'], '', 'Par 4 de 451 yds (index 3) : un des trous les plus difficiles de l’aller.'],
[0.3, [[0.6, 1]], ['fl', 'l'], '', 'Par 4 long (485 yds) : le second coup demande un fer long.'],
[0, [], ['fl', 'fr', 'b'], '', 'Par 3 de 186 yds (index 17) : le trou le plus abordable de l’aller.'],
[-0.6, [[0.5, 1]], ['fr', 'l'], '', 'Par 4 de 459 yds, index 1 : le trou le plus difficile du parcours.'],
[0.2, [], ['fl', 'fr'], 'frontpond', 'Par 4 de 488 yds qui ramène au club-house : approche à placer avec soin.'],
[0.5, [[0.5, -1]], ['fr', 'b'], '', 'Par 5 de 549 yds qui ouvre le retour : deux longs coups puis une approche.'],
[0, [], ['fl', 'r'], '', 'Par 3 court (169 yds) : green étroit, bunkers sur les côtés.'],
[-0.4, [[0.6, -1]], ['r', 'fl'], '', 'Par 4 de 476 yds, index 2 : long et exigeant.'],
[0.3, [[0.45, 1]], ['fl', 'fr'], '', 'Par 5 de 550 yds : le green peut s’attaquer en deux après un très bon départ.'],
[-0.2, [[0.55, 1]], ['fl', 'l'], '', 'Par 4 de 434 yds (index 4) : fairway bordé de désert.'],
[0, [], ['fl', 'fr', 'b'], '', 'Dernier Par 3 (190 yds) : green gardé par des bunkers.'],
[0.4, [[0.5, -1]], ['fr', 'b'], '', 'Par 4 de 446 yds : approche vers un green surélevé.'],
[-0.3, [], ['fl', 'r'], '', 'Par 4 court (359 yds, index 18) : le trou le plus facile du parcours.'],
[0.6, [[0.5, 1]], ['b', 'r'], 'front', 'Par 5 final de 564 yds : de l’eau garde le green, attaquer en deux est risqué.']
] }
};
const COURSE_SOON = [
  { id: 'pebble', name: 'Pebble Beach Golf Links', short: 'Pebble Beach', place: 'Californie', country: 'États-Unis', par: 72 },
  { id: 'rcd', name: 'Royal County Down', short: 'Royal County Down', place: 'Newcastle, Irlande du Nord', country: 'Royaume-Uni', par: 71 },
  { id: 'pinehurst', name: 'Pinehurst No. 2', short: 'Pinehurst No. 2', place: 'Caroline du Nord', country: 'États-Unis', par: 70 },
  { id: 'valderrama', name: 'Real Club Valderrama', short: 'Valderrama', place: 'Sotogrande, Andalousie', country: 'Espagne', par: 71 },
  { id: 'albatros', name: 'Le Golf National – Albatros', short: 'Golf National', place: 'Guyancourt, Île-de-France', country: 'France', par: 72 },
  { id: 'rmelb', name: 'Royal Melbourne – West', short: 'Royal Melbourne', place: 'Victoria', country: 'Australie', par: 72 }
];
class GreencutEngineBase {
sfxCheck(p, n) {
try { this.tourHook(p, n); } catch (x) { /* tournoi facultatif */ }
try { this.gameSave(n); } catch (x) { /* sauvegarde facultative */ }
if (n && ['av', 'club', 'ball', 'golf', 'league'].some((k) => k in n)) { profileSave(Object.assign({}, this.state, n)); }
if (!p || !n || !p.h || !n.h) { return; }
if (n.h.hole !== p.h.hole) { this.sfx('deal'); return; }
if (p.h.phase !== 'done' && n.h.phase === 'done') {
const par = n.h.par; const st = n.strokes && n.strokes[0] ? n.strokes[0][n.h.hole - 1] : undefined;
if (st === undefined) { return; }
const rel = st - par; let r = 'bogey';
if (st === 1) { r = 'holeinone'; } else if (rel <= -3) { r = 'albatross'; } else if (rel === -2) { r = 'eagle'; } else if (rel === -1) { r = 'birdie'; } else if (rel === 0) { r = 'par'; }
this.sfx('chip'); this.sfx(r, 0.45); if (n.h.boom) { this.sfx('boom', 0.2); } if (n.h.loser) { this.sfx('loser', 0.9); } return;
}
if (n.h.round > p.h.round && n.h.phase !== 'done') { this.sfx(n.h.round === 1 ? 'flop' : 'card'); return; }
if (!p.h.folded[0] && n.h.folded[0]) { this.sfx('fold'); return; }
if (n.h.allin.some((a, i) => a && !p.h.allin[i])) { this.sfx('allin'); return; }
if (n.h.pot > p.h.pot) { this.sfx('chip'); }
if (n.screen !== p.screen || n.showHole !== p.showHole) { this.sfx('click'); }
}
sfx(name, delay) {
const s = this.state;
if (s && s.soundOn === false) { return; }
const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null; if (!AC) { return; }
if (!this._ac) { this._ac = new AC(); this._mg = this._ac.createGain(); this._mg.connect(this._ac.destination); }
const ac = this._ac; if (ac.state === 'suspended') { ac.resume(); }
this._mg.gain.value = ((s && s.sndVol !== undefined ? s.sndVol : 60) / 100) * 0.5;
const t0 = ac.currentTime + 0.02 + (delay || 0);
const tone = (f, st, d, type, g, f2) => { const o = ac.createOscillator(); const gg = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0 + st); if (f2) { o.frequency.exponentialRampToValueAtTime(f2, t0 + st + d); } gg.gain.setValueAtTime(0.0001, t0 + st); gg.gain.exponentialRampToValueAtTime(g || 0.3, t0 + st + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, t0 + st + d); o.connect(gg); gg.connect(this._mg); o.start(t0 + st); o.stop(t0 + st + d + 0.05); };
const noise = (st, d, fq, g, q) => { const len = Math.max(1, Math.floor(ac.sampleRate * d)); const buf = ac.createBuffer(1, len, ac.sampleRate); const dt = buf.getChannelData(0); for (let i = 0; i < len; i++) { dt[i] = (Math.random() * 2 - 1) * (1 - i / len); } const src = ac.createBufferSource(); src.buffer = buf; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = q || 1; const gg = ac.createGain(); gg.gain.value = g || 0.4; src.connect(bp); bp.connect(gg); gg.connect(this._mg); src.start(t0 + st); };
const run = (fs, step, type, g, d) => { fs.forEach((f, i) => { tone(f, i * step, d || 0.35, type || 'triangle', g || 0.28); }); };
const chord = (fs, st, d, g) => { fs.forEach((f) => { tone(f, st, d, 'sawtooth', g || 0.07); }); };
const chip = (st, f) => { tone(f || 2600, st, 0.05, 'triangle', 0.16); tone((f || 2600) * 0.72, st + 0.045, 0.06, 'triangle', 0.13); noise(st, 0.03, 6000, 0.25, 2); };
const sweep = (st, d, f1, f2, g, q) => { const len = Math.max(1, Math.floor(ac.sampleRate * d)); const buf = ac.createBuffer(1, len, ac.sampleRate); const dt = buf.getChannelData(0); for (let i = 0; i < len; i++) { dt[i] = (Math.random() * 2 - 1); } const src = ac.createBufferSource(); src.buffer = buf; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q || 1.2; bp.frequency.setValueAtTime(f1, t0 + st); bp.frequency.exponentialRampToValueAtTime(f2, t0 + st + d); const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t0 + st); gg.gain.exponentialRampToValueAtTime(g, t0 + st + d * 0.9); gg.gain.exponentialRampToValueAtTime(0.0001, t0 + st + d); src.connect(bp); bp.connect(gg); gg.connect(this._mg); src.start(t0 + st); };
const driver = (st, k) => { sweep(st, 0.26 * k, 500, 4200, 0.55, 1.5); noise(st + 0.26 * k, 0.04, 3000, 1.0, 0.4); noise(st + 0.26 * k, 0.1, 1000, 0.6, 0.6); tone(180, st + 0.26 * k, 0.12, 'sine', 0.5, 80); tone(3400, st + 0.26 * k, 0.28, 'sine', 0.22, 3050); tone(1250, st + 0.26 * k, 0.2, 'triangle', 0.16); tone(5200, st + 0.26 * k, 0.12, 'sine', 0.08); sweep(st + 0.32 * k, 0.6 * k + 0.2, 3200, 900, 0.09, 2); };
switch (name) {
case 'click': tone(1400, 0, 0.04, 'square', 0.06); break;
case 'card': driver(0, 0.6); break;
case 'flop': driver(0, 0.8); break;
case 'deal': driver(0, 1); break;
case 'boom': noise(0, 0.5, 220, 1.0, 0.5); tone(90, 0, 0.45, 'sine', 0.6, 40); noise(0.05, 0.9, 1500, 0.35, 0.5); [0.35, 0.5, 0.65, 0.8, 0.95].forEach((t, i) => { chip(t, 2200 + i * 260); }); run([392, 494, 587, 784, 988], 0.1, 'triangle', 0.26, 0.5); break;
case 'loser': tone(247, 0, 0.32, 'sawtooth', 0.1, 233); tone(220, 0.34, 0.32, 'sawtooth', 0.1, 208); tone(196, 0.68, 0.34, 'sawtooth', 0.1, 185); tone(174, 1.04, 0.9, 'sawtooth', 0.11, 98); try { if (typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined') { const vol = (s && s.sndVol !== undefined ? s.sndVol : 60) / 100; setTimeout(() => { try { const u = new SpeechSynthesisUtterance('Loser'); u.lang = 'en-US'; u.pitch = 0; u.rate = 0.55; u.volume = Math.min(1, vol * 1.3); const vs = window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang) && !/female|zira|samantha|susan|hazel|victoria|karen|moira|tessa|fiona/i.test(v.name)); const man = vs.find((v) => /david|daniel|alex|fred|mark|george|male|guy|james|ryan/i.test(v.name)) || vs[0]; if (man) { u.voice = man; } window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch (x) { /* voix facultative */ } }, 1100 + (delay || 0) * 1000); } } catch (x) { /* voix facultative */ } break;
case 'chip': chip(0); break;
case 'allin': [0, 0.06, 0.12, 0.18, 0.24, 0.3, 0.36].forEach((t, i) => { chip(t, 2800 - i * 120); }); break;
case 'fold': noise(0, 0.25, 700, 0.35, 0.7); break;
case 'holeinone': noise(0, 0.05, 1800, 0.5, 1); run([523, 659, 784, 1047, 1319], 0.12, 'triangle', 0.3, 0.4); chord([523, 659, 784, 1047], 0.65, 1.1, 0.07); [2093, 2637, 3136, 3951].forEach((f, i) => { tone(f, 0.7 + i * 0.1, 0.3, 'sine', 0.09); }); break;
case 'albatross': noise(0, 0.05, 1800, 0.5, 1); run([392, 494, 587, 784], 0.12, 'triangle', 0.3, 0.4); chord([392, 494, 587, 784], 0.5, 0.9, 0.07); break;
case 'eagle': noise(0, 0.05, 1800, 0.5, 1); run([440, 554, 659, 880], 0.11, 'triangle', 0.28, 0.35); break;
case 'birdie': noise(0, 0.05, 1800, 0.5, 1); run([659, 784, 988], 0.13, 'triangle', 0.26, 0.35); break;
case 'par': noise(0, 0.05, 1800, 0.45, 1); tone(220, 0, 0.08, 'sine', 0.3, 110); tone(660, 0.1, 0.3, 'sine', 0.22); break;
case 'bogey': noise(0, 0.05, 1200, 0.4, 1); tone(220, 0.05, 0.3, 'sawtooth', 0.1, 196); tone(175, 0.25, 0.5, 'sawtooth', 0.1, 147); break;
default: break;
}
}
toggleSnd() { const on = this.state.soundOn === false; this.setState({ soundOn: on }); this.saveSnd(on, this.state.sndVol); if (on) { this.sfx('chip'); } }
setVol(v) { this.setState({ sndVol: v }); this.saveSnd(this.state.soundOn !== false, v); this.sfx('chip'); }
saveSnd(on, vol) { try { localStorage.setItem('greencut.sound', JSON.stringify({ on, vol })); } catch (x) { /* ignore */ } }
cards() {
return [null,
['Hole in one', 'Hole', 'In one', 'ho'], ['Big drive', 'Big', 'Drive', 'jk'], ['Drive fairway', 'Drive', 'Fairway', 'fw'], ['Drive water', 'Drive', 'Water', 'wa'],
['Wood green', 'Wood', 'Green', 'gr'], ['Wood fairway', 'Wood', 'Fairway', 'fw'], ['Wood water', 'Wood', 'Water', 'wa'], ['Iron green', 'Iron', 'Green', 'gr'],
['Iron fairway', 'Iron', 'Fairway', 'fw'], ['Iron bunker', 'Iron', 'Bunker', 'bu'], ['Iron water', 'Iron', 'Water', 'wa'], ['Approach in hole', 'Approach', 'In hole', 'ho'],
['Approach green', 'Approach', 'Green', 'gr'], ['Bunker in hole', 'Bunker', 'In hole', 'ho'], ['Bunker green', 'Bunker', 'Green', 'gr'],
['One putt', 'Putt', 'One putt', 'pu'], ['Two putt', 'Putt', 'Two putt', 'pu'], ['Three putt', 'Putt', 'Three putt', 'pu']];
}
cardHelp(r) {
const H = {
1: ['Trou en 1', 'Par 3 uniquement', 'Balle dans le trou'],
2: ['Départ surpuissant', 'Par 4 et 5', 'Green, fairway ou bunker'],
3: ['Coup de départ', 'Par 4 et 5', 'Sur le fairway'],
4: ['Départ dans l’eau', 'Par 4 et 5', 'Pénalité : +1 coup'],
5: ['Départ par 3', 'Intermédiaire par 4 et 5', 'Green : il faut un Putt'],
6: ['Départ par 3, 4 et 5', 'Intermédiaire par 4 et 5', 'Sur le fairway'],
7: ['Départ par 3, 4 et 5', 'Intermédiaire par 4 et 5', 'Dans l’eau : +1 coup'],
8: ['Départ par 3', 'Intermédiaire par 4 et 5', 'Green : il faut un Putt'],
9: ['Départ par 3', 'Intermédiaire par 4 et 5', 'Sur le fairway'],
10: ['Départ par 3', 'Intermédiaire par 4 et 5', 'Bunker de green'],
11: ['Départ par 3', 'Intermédiaire par 4 et 5', 'Dans l’eau : +1 coup'],
12: ['Coup d’approche', 'Par 3, 4 et 5', 'Dans le trou'],
13: ['Coup d’approche', 'Par 3, 4 et 5', 'Green : il faut un Putt'],
14: ['Sortie de bunker', 'Par 3, 4 et 5', 'Dans le trou'],
15: ['Sortie de bunker', 'Par 3, 4 et 5', 'Green : il faut un Putt'],
16: ['Coup final', 'Par 3, 4 et 5', '1 coup pour rentrer'],
17: ['Coup final', 'Par 3, 4 et 5', '2 coups pour rentrer'],
18: ['Coup final', 'Par 3, 4 et 5', '3 coups pour rentrer']
};
const x = H[r] || ['', '', '']; return { a: x[0], b: x[1], c: x[2] };
}
crs() { const id = this._crs || (this.state && this.state.course); return COURSE_DATA[id] || COURSE_DATA.augusta; }
pars() { return this.crs().pars; }
yards() { return this.crs().yards; }
hnames() { return this.crs().names; }
indexes() { return this.crs().idx; }
courseCatalog() {
const sum = (a) => a.reduce((x, y) => x + y, 0);
const ok = Object.keys(COURSE_DATA).filter((k) => !COURSE_DATA[k].tourOnly).map((k) => { const c = COURSE_DATA[k]; const n3 = c.pars.filter((p) => p === 3).length; const n5 = c.pars.filter((p) => p === 5).length; return { id: c.id, name: c.name, short: c.short, place: c.place, country: c.country, par: sum(c.pars), yds: sum(c.yards), tee: c.tee, plays: c.plays, status: 'ok', n3, n4: 18 - n3 - n5, n5, tip: c.tip, source: c.source || '' }; });
ok.sort((a, b) => b.plays - a.plays);
const soon = COURSE_SOON.map((c) => Object.assign({ yds: 0, tee: '', plays: 0, status: 'soon', n3: 0, n4: 0, n5: 0, tip: '', source: '' }, c));
return ok.concat(soon);
}
courseSearch(q) {
const norm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const n = norm(q).trim(); const all = this.courseCatalog();
if (!n) { return all; }
return all.filter((c) => (norm(c.name) + ' ' + norm(c.place) + ' ' + norm(c.country) + ' ' + norm(c.short)).indexOf(n) >= 0);
}
scVals() {
const P = this.pars(), Y = this.yards(), I = this.indexes(), N = this.hnames(); const o = {}; const sum = (a, f, t) => a.slice(f, t).reduce((x, y) => x + y, 0);
for (let k = 1; k <= 18; k++) { o['hn' + k] = N[k - 1]; }
const put = (pre, arr, fmt, tot) => { let n = 0; for (let k = 1; k <= 21; k++) { let v = ''; if (k <= 9) { v = fmt(arr[k - 1]); } else if (k === 10) { v = tot ? fmt(sum(arr, 0, 9)) : ''; } else if (k <= 19) { v = fmt(arr[k - 2]); } else if (k === 20) { v = tot ? fmt(sum(arr, 9, 18)) : ''; } else { v = tot ? fmt(sum(arr, 0, 18)) : ''; } o[pre + k] = v; n++; } };
put('sp', P, (x) => String(x), true); put('sy', Y, (x) => this.fmt(x), true); put('si', I, (x) => String(x), false);
return o;
}
scPartVals() {
const s = this.state; const played = s.strokes && s.strokes[0] ? s.strokes[0].length : 0; const part = s.scPart || (played > 9 ? 'in' : 'out');
const set = (k) => () => this.setState({ scPart: k });
return { scTblCls: 'sc-' + part, scOutCls: part === 'out' ? 'gc-chip--on' : '', scInCls: part === 'in' ? 'gc-chip--on' : '', scTotCls: part === 'tot' ? 'gc-chip--on' : '', scOutTap: set('out'), scInTap: set('in'), scTotTap: set('tot') };
}
courseVals() {
const c = this.crs(); const tp = this.pars().reduce((a, b) => a + b, 0); const ty = this.yards().reduce((a, b) => a + b, 0);
return { courseName: c.name, courseShort: c.short, courseId: c.id, courseSub: c.place + ' · Par ' + tp + ' · ' + this.fmt(ty) + ' yds (' + c.tee + ')', courseNameLbl: c.id === 'augusta' ? 'Fleur' : 'Nom du trou' };
}
chooseCourse(id) { if (!COURSE_DATA[id]) { return false; } try { localStorage.setItem('greencut.course', id); } catch (x) { } this.setState({ course: id }); return true; }
combos() { return {"3": [[1, 1], [2, 6, 12], [3, 6, 13, 16], [4, 6, 13, 17], [5, 6, 13, 18], [3, 7, 12], [4, 7, 13, 16], [5, 7, 13, 17], [6, 7, 13, 18], [2, 5, 16], [3, 5, 17], [4, 5, 18], [2, 9, 12], [3, 9, 13, 16], [4, 9, 13, 17], [5, 9, 13, 18], [2, 10, 14], [3, 10, 15, 16], [4, 10, 15, 17], [5, 10, 15, 18], [2, 8, 16], [3, 8, 17], [4, 8, 18], [3, 11, 12], [4, 11, 13, 16], [5, 11, 13, 17], [6, 11, 13, 18]], "4": [[2, 2, 16], [3, 2, 17], [4, 2, 18], [2, 2, 12], [3, 2, 13, 16], [4, 2, 13, 17], [5, 2, 13, 18], [2, 2, 14], [3, 2, 15, 16], [4, 2, 15, 17], [5, 2, 15, 18], [3, 2, 8, 16], [4, 2, 8, 17], [5, 2, 8, 18], [3, 2, 5, 16], [4, 2, 5, 17], [5, 2, 5, 18], [2, 3, 12], [3, 3, 13, 16], [4, 3, 13, 17], [5, 3, 13, 18], [3, 3, 8, 16], [4, 3, 8, 17], [5, 3, 8, 18], [3, 3, 10, 14], [4, 3, 10, 15, 16], [5, 3, 10, 15, 17], [6, 3, 10, 15, 18], [5, 3, 11, 13, 16], [6, 3, 11, 13, 17], [7, 3, 11, 13, 18], [4, 3, 9, 13, 16], [5, 3, 9, 13, 17], [6, 3, 9, 13, 18], [3, 3, 9, 12], [4, 3, 11, 12], [3, 3, 5, 16], [4, 3, 5, 17], [5, 3, 5, 18], [3, 4, 12], [4, 4, 13, 16], [5, 4, 13, 17], [6, 4, 13, 18], [4, 4, 8, 16], [5, 4, 8, 17], [6, 4, 8, 18], [4, 4, 10, 14], [5, 4, 10, 15, 16], [6, 4, 10, 15, 17], [7, 4, 10, 15, 18], [6, 4, 11, 13, 16], [7, 4, 11, 13, 17], [8, 4, 11, 13, 18], [5, 4, 9, 13, 16], [6, 4, 9, 13, 17], [7, 4, 9, 13, 18], [4, 4, 9, 12], [5, 4, 11, 12], [3, 3, 6, 12], [4, 3, 6, 13, 16], [5, 3, 6, 13, 17], [6, 3, 6, 13, 18], [4, 3, 7, 12], [5, 3, 7, 13, 16], [6, 3, 7, 13, 17], [7, 3, 7, 13, 18], [4, 4, 6, 12], [5, 4, 6, 13, 16], [6, 4, 6, 13, 17], [7, 4, 6, 13, 18], [5, 4, 7, 12], [6, 4, 7, 13, 16], [7, 4, 7, 13, 17], [8, 4, 7, 13, 18], [4, 4, 5, 16], [5, 4, 5, 17], [6, 4, 5, 18], [3, 6, 5, 16], [4, 6, 5, 17], [5, 6, 5, 18], [3, 6, 6, 12], [4, 6, 6, 13, 16], [5, 6, 6, 13, 17], [6, 6, 6, 13, 18], [4, 6, 7, 12], [5, 6, 7, 13, 16], [6, 6, 7, 13, 17], [7, 6, 7, 13, 18], [3, 6, 8, 16], [4, 6, 8, 17], [5, 6, 8, 18], [3, 6, 9, 12], [4, 6, 9, 13, 16], [5, 6, 9, 13, 17], [6, 6, 9, 13, 18], [3, 6, 10, 14], [4, 6, 10, 15, 16], [5, 6, 10, 15, 17], [6, 6, 10, 15, 18], [4, 6, 11, 12], [5, 6, 11, 13, 16], [6, 6, 11, 13, 17], [7, 6, 11, 13, 18], [4, 7, 5, 16], [5, 7, 5, 17], [6, 7, 5, 18], [4, 7, 6, 12], [5, 7, 13, 16], [6, 7, 6, 13, 17], [7, 7, 6, 13, 18], [5, 7, 7, 12], [6, 7, 7, 13, 16], [7, 7, 7, 13, 17], [8, 7, 7, 13, 18], [4, 7, 8, 16], [5, 7, 8, 17], [6, 7, 8, 18], [4, 7, 9, 12], [5, 7, 9, 13, 16], [6, 7, 9, 13, 17], [7, 7, 9, 13, 18], [4, 7, 10, 14], [5, 7, 10, 15, 16], [6, 7, 15, 17], [7, 7, 10, 15, 18], [5, 7, 11, 12], [6, 7, 11, 13, 16], [7, 7, 11, 13, 17], [8, 7, 11, 13, 18]], "5": [[2, 2, 12], [3, 2, 13, 16], [4, 2, 13, 17], [5, 2, 13, 18], [2, 2, 14], [3, 2, 15, 16], [4, 2, 15, 17], [5, 2, 15, 18], [3, 2, 8, 16], [4, 2, 8, 17], [5, 2, 8, 18], [3, 2, 5, 16], [4, 2, 5, 17], [5, 2, 5, 18], [3, 3, 6, 12], [4, 3, 6, 13, 16], [5, 3, 6, 13, 17], [6, 3, 6, 13, 18], [4, 3, 6, 10, 14], [5, 3, 6, 10, 15, 16], [6, 3, 6, 10, 15, 17], [7, 3, 6, 10, 15, 18], [4, 3, 6, 8, 16], [5, 3, 6, 8, 17], [6, 3, 6, 8, 18], [4, 3, 6, 5, 16], [5, 3, 6, 5, 17], [6, 3, 6, 5, 18], [4, 3, 7, 12], [5, 3, 7, 13, 16], [6, 3, 7, 13, 17], [7, 3, 7, 13, 18], [5, 3, 7, 10, 14], [6, 3, 7, 10, 15, 16], [7, 3, 7, 10, 15, 17], [8, 3, 7, 10, 15, 18], [5, 3, 7, 8, 16], [6, 3, 7, 8, 17], [7, 3, 7, 8, 18], [5, 3, 7, 5, 16], [6, 3, 7, 5, 17], [7, 3, 7, 5, 18], [4, 3, 9, 8, 16], [5, 3, 9, 8, 17], [6, 3, 9, 8, 18], [4, 3, 9, 5, 16], [5, 3, 9, 5, 17], [6, 3, 9, 5, 18], [4, 3, 9, 9, 12], [5, 3, 9, 9, 13, 16], [6, 3, 9, 9, 13, 17], [7, 3, 9, 9, 13, 18], [5, 3, 9, 11, 12], [6, 3, 11, 11, 12], [6, 3, 9, 11, 13, 16], [7, 3, 9, 11, 13, 17], [8, 3, 9, 11, 13, 18], [7, 3, 11, 11, 13, 16], [8, 3, 11, 11, 13, 17], [9, 3, 11, 11, 13, 18], [4, 3, 9, 10, 14], [5, 3, 11, 10, 14], [5, 3, 9, 10, 15, 16], [6, 3, 9, 10, 15, 17], [7, 3, 9, 10, 15, 18], [6, 3, 11, 10, 15, 16], [7, 3, 11, 10, 15, 17], [8, 3, 11, 10, 15, 18], [5, 3, 11, 8, 16], [6, 3, 11, 8, 17], [7, 3, 11, 8, 18], [5, 3, 11, 5, 16], [6, 3, 11, 5, 17], [7, 3, 11, 5, 18], [5, 3, 11, 9, 12], [6, 3, 11, 9, 13, 16], [7, 3, 11, 9, 13, 17], [8, 3, 11, 9, 13, 18], [4, 4, 6, 12], [5, 4, 6, 13, 16], [6, 4, 6, 13, 17], [7, 4, 6, 13, 18], [5, 4, 6, 10, 14], [6, 4, 6, 10, 15, 16], [7, 4, 6, 10, 15, 17], [8, 4, 6, 10, 15, 18], [5, 4, 6, 8, 16], [6, 4, 6, 8, 17], [7, 4, 6, 8, 18], [5, 4, 6, 5, 16], [6, 4, 6, 5, 17], [7, 4, 6, 5, 18], [5, 4, 7, 12], [6, 4, 7, 13, 16], [7, 4, 7, 13, 17], [8, 4, 7, 13, 18], [6, 4, 7, 10, 14], [7, 4, 7, 10, 15, 16], [8, 4, 7, 10, 15, 17], [9, 4, 7, 10, 15, 18], [6, 4, 7, 8, 16], [7, 4, 7, 8, 17], [8, 4, 7, 8, 18], [6, 4, 7, 5, 16], [7, 4, 7, 5, 17], [8, 4, 7, 5, 18], [5, 4, 9, 8, 16], [6, 4, 9, 8, 17], [7, 4, 9, 8, 18], [5, 4, 9, 5, 16], [6, 4, 9, 5, 17], [7, 4, 9, 5, 18], [5, 4, 9, 9, 12], [6, 4, 9, 9, 13, 16], [7, 4, 9, 9, 13, 17], [8, 4, 9, 9, 13, 18], [6, 4, 9, 11, 12], [7, 4, 11, 11, 12], [7, 4, 9, 11, 13, 16], [8, 4, 9, 11, 13, 17], [9, 4, 9, 11, 13, 18], [8, 4, 11, 11, 13, 16], [9, 4, 11, 11, 13, 17], [5, 4, 9, 10, 14], [6, 4, 11, 10, 14], [6, 4, 9, 10, 15, 16], [7, 4, 9, 10, 15, 17], [8, 4, 9, 10, 15, 18], [7, 4, 11, 10, 15, 16], [8, 4, 11, 10, 15, 17], [9, 4, 11, 10, 15, 18], [6, 4, 11, 8, 16], [7, 4, 11, 8, 17], [8, 4, 11, 8, 18], [6, 4, 11, 5, 16], [7, 4, 11, 5, 17], [8, 4, 11, 5, 18], [6, 4, 11, 9, 12], [7, 4, 11, 9, 13, 16], [8, 4, 11, 9, 13, 17], [9, 4, 11, 9, 13, 18], [3, 6, 6, 12], [4, 6, 6, 13, 16], [5, 6, 6, 13, 17], [6, 6, 6, 13, 18], [4, 6, 6, 10, 14], [5, 6, 6, 10, 15, 16], [6, 6, 6, 10, 15, 17], [7, 6, 6, 10, 15, 18], [4, 6, 6, 8, 16], [5, 6, 6, 8, 17], [6, 6, 6, 8, 18], [4, 6, 6, 5, 16], [5, 6, 6, 5, 17], [6, 6, 6, 5, 18], [4, 6, 7, 12], [5, 6, 7, 13, 16], [6, 6, 7, 13, 17], [7, 6, 7, 13, 18], [5, 6, 7, 10, 14], [6, 6, 7, 10, 15, 16], [7, 6, 7, 10, 15, 17], [8, 6, 7, 10, 15, 18], [5, 6, 7, 8, 16], [6, 6, 7, 8, 17], [7, 6, 7, 8, 18], [5, 6, 7, 5, 16], [6, 6, 7, 5, 17], [7, 6, 7, 5, 18], [4, 6, 9, 5, 16], [5, 6, 9, 5, 17], [6, 6, 9, 5, 18], [4, 6, 9, 8, 16], [5, 6, 9, 8, 17], [6, 6, 9, 8, 18], [5, 6, 11, 5, 16], [6, 6, 11, 5, 17], [7, 6, 11, 5, 18], [5, 6, 11, 8, 16], [6, 6, 11, 8, 17], [7, 6, 11, 8, 18], [4, 7, 6, 12], [5, 7, 6, 13, 16], [6, 7, 6, 13, 17], [7, 7, 6, 13, 18], [5, 7, 6, 10, 14], [6, 7, 6, 10, 15, 16], [7, 7, 6, 10, 15, 17], [8, 7, 6, 10, 15, 18], [5, 7, 6, 8, 16], [6, 7, 6, 8, 17], [7, 7, 6, 8, 18], [5, 7, 6, 5, 16], [6, 7, 6, 5, 17], [7, 7, 6, 5, 18], [5, 7, 7, 12], [6, 7, 7, 13, 16], [7, 7, 7, 13, 17], [8, 7, 7, 13, 18], [6, 7, 7, 10, 14], [7, 7, 7, 10, 15, 16], [8, 7, 7, 10, 15, 17], [9, 7, 7, 10, 15, 18], [6, 7, 7, 8, 16], [7, 7, 7, 8, 17], [8, 7, 7, 8, 18], [6, 7, 7, 5, 16], [7, 7, 7, 5, 17], [8, 7, 7, 5, 18], [5, 7, 9, 5, 16], [6, 7, 9, 5, 17], [7, 7, 9, 5, 18], [5, 7, 9, 8, 16], [6, 7, 9, 8, 17], [7, 7, 9, 8, 18], [6, 7, 11, 5, 16], [7, 7, 11, 5, 17], [8, 7, 11, 5, 18], [6, 7, 11, 8, 16], [7, 7, 11, 8, 17], [8, 7, 11, 8, 18]]}; }
families() { return [[2, 3, 4], [3, 6, 9], [16, 17, 18], [5, 6, 7], [1, 12, 14], [10, 14, 15], [4, 7, 11], [5, 8, 13, 15], [8, 9, 10, 11]]; }
oppNames() { return this._opp || ['Fairway_Fox', 'BirdieBandit', 'Dune_Queen', 'Sunset_Sam', 'Caddy_Kid', 'Links_Lou', 'Mulligan_Max']; }
isHuman(i) { return i === 0 || !!(this._humans && this._humans[i]); }
nP() { return NP; }
minP() { return MIN_P; }
maxP() { return MAX_P; }
oppBrands() { return ['CALLAWAY', 'TAYLORMADE', 'PING', 'TITLEIST', 'CALLAWAY', 'MIZUNO', 'COBRA']; }
fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
signed(n) { return n === 0 ? 'E' : (n > 0 ? '+' + n : '−' + Math.abs(n)); }
term(rel, par) {
const c = par + rel;
if (c <= 1) return 'Trou en 1';
return ['Albatross', 'Eagle', 'Birdie', 'Par', 'Bogey', 'Double bogey', 'Triple bogey', 'Quadruple bogey'][rel + 3] || 'Quadruple bogey';
}
initial(keep) {
if (this._pace === undefined) { this._pace = typeof document !== 'undefined' && !(typeof window !== 'undefined' && (window.GREENCUT_NOPACE || (window.location && /[?&]nopace/.test(window.location.search || '')))); }
if (keep && keep.nP) { NP = Math.max(MIN_P, Math.min(MAX_P, Math.round(keep.nP) || 6)); }
let ps = 'MaxFairway'; try { const q = localStorage.getItem('greencut.pseudo'); if (q) { ps = q; } } catch (x) { ps = 'MaxFairway'; }
let snd = { on: true, vol: 60 }; try { const q = JSON.parse(localStorage.getItem('greencut.sound') || 'null'); if (q) { snd = { on: q.on !== false, vol: typeof q.vol === 'number' ? q.vol : 60 }; } } catch (x) { snd = { on: true, vol: 60 }; }
const prf = profileGet();
let lvl = 'deb'; try { const d = JSON.parse(localStorage.getItem('greencut.parcours') || '{}'); if (d.expert || d['3a']) { lvl = 'exp'; } } catch (x) { lvl = 'deb'; }
let crsId = (keep && keep.course) || 'augusta'; if (!(keep && keep.course)) { try { const q = localStorage.getItem('greencut.course'); if (q && COURSE_DATA[q]) { crsId = q; } } catch (x) { crsId = 'augusta'; } }
const s = {
course: crsId, screen: 'table', gateHide: false, nP: NP, sortBy: 'net', soundOn: snd.on, sndVol: snd.vol, av: prf.av, pseudo: ps, pseudoDraft: ps, pseudoMsg: '', why: '', club: prf.club, ball: prf.ball, golf: prf.golf, league: prf.league,
games: 1, gate: false, reload: false, fees: 1250, pts: 8400, dir: 'f2p', amt: 300, expired: false, feesMsg: '',
hist: [ { a: 'Partie 1 : mise de départ', t: 'À l’instant', d: '−10 000 pts', e: '', cls: 'hf' }, { a: 'Points du jeu → fees', t: 'Aujourd’hui · 19:12', d: '−12 000 pts', e: '+120 fees', cls: 'hp' }, { a: 'Fees → points du jeu', t: '12 nov. · 21:40', d: '−200 fees', e: '+20 000 pts', cls: 'hf' } ],
quit: false, askQuit: false, tuto: false, moreOpt: false, aidDetail: false, stacks: Z(10000), strokes: Array.from({ length: NP }, () => []), hole: 1, prevPos: null, trend: {}, help: lvl === 'deb', level: lvl
};
s.tour = false; s.tourDone = false; s.fresh = false;
if (!keep && typeof document !== 'undefined') { const sv = this.gameLoad(); if (sv) { NP = Math.max(MIN_P, Math.min(MAX_P, sv.stacks.length)); return sv; } }
if (!keep && typeof document !== 'undefined') { const tk = this.tourStart(); if (tk) { Object.assign(s, tk); } else if (WALLET.saved()) { const w = WALLET.get(); Object.assign(s, { pts: w.pts, fees: w.fees, gate: true, fresh: true, hist: [] }); } }
if (!keep && typeof window !== 'undefined' && window.location) { const g = /[?&]go=(profil|card|board)\b/.exec(window.location.search || ''); if (g) { s.screen = g[1]; } }
if (keep) { Object.assign(s, keep); }
this._crs = s.course; try { Object.assign(s, this.deal(s.stacks, 1, s.strokes, Z(0)), { raiseTo: 200 }); } finally { this._crs = null; }
if (typeof window !== 'undefined' && window.GreencutMP && window.location && /[?&]mp=/.test(window.location.search || '') && !this._mpTried) { this._mpTried = true; setTimeout(() => { window.GreencutMP.autoAttach(this); }, 0); }
return s;
}
parHint(hand, par) {
const CB = this.combos()[par]; const CD = this.cards();
const useful = (r) => CB.some((c) => c.slice(1).indexOf(r) >= 0);
const uniq = hand.filter((r, i) => hand.indexOf(r) === i); const n = hand.filter(useful).length;
const short = n === 2 ? '✓ 2 cartes utiles' : (n === 1 ? '✓ 1 carte utile' : '✗ aucune carte utile au golf');
const long = 'Sur ce Par ' + par + ' : ' + uniq.map((r) => CD[r][0] + (useful(r) ? ' sert' : ' ne sert à aucune combinaison golf')).join(', ') + '.';
return { n, short, long };
}
// ---------- moteur de jeu ----------
evalPlayer(hand, comm, par) {
const all = hand.concat(comm); const cnt = {};
all.forEach((r) => { cnt[r] = (cnt[r] || 0) + 1; });
const CB = this.combos()[par]; const CD = this.cards();
let golf = null; let chain = null; let altChain = null; let hiH = -1;
for (let n = 0; n < CB.length; n++) {
const c = CB[n]; const need = {}; let ok = true; let inHand = false;
for (let k = 1; k < c.length; k++) { need[c[k]] = (need[c[k]] || 0) + 1; }
let hh = -1;
for (const r in need) { if ((cnt[r] || 0) < need[r]) { ok = false; break; } if (hand.indexOf(Number(r)) >= 0) { inHand = true; hh = Math.max(hh, Number(r)); } }
if (ok && inHand) {
if (golf === null || c[0] < golf) { golf = c[0]; chain = c.slice(1); altChain = null; hiH = hh; }
else if (c[0] === golf && chain.join() !== c.slice(1).join()) { /* REG-01 : même score, on garde la combinaison qui utilise la carte la plus haute de la main ; même carte : « ou aussi » */
if (hh > hiH) { chain = c.slice(1); altChain = null; hiH = hh; } else if (hh === hiH && altChain === null) { altChain = c.slice(1); } }
}
}
let pk = null; let pn = '';
const HI = { 'Paire': 1, 'Double paire': 2, 'Série de 3': 3, 'Brelan': 4, 'Série de 4': 5, 'Full': 6, 'Carré': 7 }; let pkH = 0; let pkName = ''; let pkSet = {};
const upd = (rel, name, set) => { if (HI[name] > pkH) { pkH = HI[name]; pkName = name; pkSet = set || {}; } if (pk === null || rel < pk) { pk = rel; pn = name; } };
const inH = (r) => hand.indexOf(r) >= 0;
const ranks = Object.keys(cnt).map(Number);
const pairs = ranks.filter((r) => cnt[r] >= 2); const trips = ranks.filter((r) => cnt[r] >= 3); const quads = ranks.filter((r) => cnt[r] >= 4);
quads.forEach((r) => { if (inH(r)) { upd(r === 1 && par === 5 ? 1 - par : (par === 5 ? -3 : 1 - par), 'Carré', { [r]: 4 }); } });
trips.forEach((t) => { pairs.forEach((p) => { if (p !== t && (inH(t) || inH(p))) { upd(-2, 'Full', { [t]: 3, [p]: 2 }); } }); if (inH(t)) { upd(-1, 'Brelan', { [t]: 3 }); } });
if (pairs.length >= 2 && pairs.some(inH)) { const ds = {}; pairs.forEach((r) => { ds[r] = 2; }); upd(0, 'Double paire', ds); }
if (pairs.some(inH)) { upd(1, 'Paire', { [pairs.filter(inH)[0]]: 2 }); }
this.families().forEach((f) => { if (f.every((r) => cnt[r]) && f.some(inH)) { const fs = {}; f.forEach((r) => { fs[r] = 1; }); upd(f.length === 4 ? -2 : 0, 'Série de ' + f.length, fs); } });
const golfRel = golf === null ? null : Math.min(golf - par, 4);
let type = null; let rel = null; let label = 'Aucune combinaison pour l’instant';
if (golfRel !== null && (pk === null || golfRel <= pk)) { type = 'golf'; rel = golfRel; label = chain.map((r) => CD[r][0]).join(' → '); }
else if (pk !== null) { type = 'poker'; rel = pk; label = pn + ' (poker)'; }
const PR = { 'Paire': 1, 'Double paire': 0, 'Série de 3': 0, 'Brelan': -1, 'Série de 4': -2, 'Full': -2 }; const pkRel = pkName === 'Carré' ? pk : (pkName ? PR[pkName] : null);
const pkTxt = pkName ? pkName + ' = ' + this.term(pkRel, par) + ' (' + (par + pkRel) + ' coups)' : '';
return { rel, type, label, pkH, pkName, pkTxt, chain: type === 'golf' ? chain : null, altLabel: type === 'golf' && altChain ? altChain.map((r) => CD[r][0]).join(' → ') : '', pkSet };
}
// ---------- multijoueur (test) : vues par joueur ----------
mpRot(arr, k) { return arr.map((x, i) => arr[(i + k) % arr.length]); }
mpViewFor(k, worldNames) {
const s = this.state; const n = NP; const ri = (x) => (x - k + n) % n; const R = (a) => this.mpRot(a, k);
const names = []; for (let i = 1; i < n; i++) { names.push(worldNames[(i + k) % n]); }
const keep = this._opp; const keepOn = this._mpOn; this._opp = names; this._mpOn = false;
try {
const mk = (h) => { const g = JSON.parse(JSON.stringify(h)); ['out', 'hands', 'rb', 'tot', 'folded', 'allin', 'acted', 'status', 'tag', 'rec', 'reveal', 'gains'].forEach((f) => { if (Array.isArray(g[f])) { g[f] = R(g[f]); } }); g.dealer = ri(g.dealer); g.turn = ri(g.turn); return g; };
if (s.h.phase === 'done' && s.pre) {
const p = s.pre; const out = this.showdown(mk(p.h), R(p.st), [], R(p.strokes));
return { h: out.h, stacks: out.stacks, strokes: out.strokes, tableMsg: out.tableMsg, why: out.why, log: [], hole: s.hole, nP: n, names, turnSeat: -1 };
}
const h2 = mk(s.h); const mine = s.turnSeat === k; const st2 = R(s.stacks);
if (mine) { h2.status[0] = 'À VOUS'; } else if (h2.status[0] === 'À JOUER') { h2.status[0] = 'EN JEU'; }
const minTo = h2.cur === 0 ? 200 : h2.cur + h2.minRaise;
return { h: h2, stacks: st2, strokes: R(s.strokes), tableMsg: mine ? this.startMsg(h2) : (s.turnSeat >= 0 ? 'Tour de ' + worldNames[s.turnSeat] + '…' : ''), raiseTo: Math.min(minTo, h2.rb[0] + st2[0]), why: s.why || '', log: [], hole: s.hole, nP: n, names, turnSeat: mine ? 0 : (s.turnSeat >= 0 ? ri(s.turnSeat) : -1) };
} finally { this._opp = keep; this._mpOn = keepOn; }
}
mpApplyView(v) {
const s = this.state; const upd = { aiPending: false, h: v.h, stacks: v.stacks, strokes: v.strokes, tableMsg: v.tableMsg, why: v.why || '', log: v.log || [], hole: v.hole, turnSeat: v.turnSeat };
if (typeof v.raiseTo === 'number') { upd.raiseTo = v.raiseTo; }
this._opp = v.names;
if (s.h && v.hole !== s.hole && s.h.phase === 'done') {
const mkPos = (md) => { const m = {}; this.board(md).rows.forEach((r, k) => { m[r.i] = k + 1; }); return m; }; const cur = { net: mkPos('net'), brut: mkPos('brut') }; const trend = { net: {}, brut: {} };
if (s.prevPos) { ['net', 'brut'].forEach((md) => { Object.keys(cur[md]).forEach((kk) => { trend[md][kk] = s.prevPos[md][kk] - cur[md][kk]; }); }); }
upd.prevPos = cur; upd.trend = trend;
}
this.setState(upd);
}
badges(hand, vis, ev) {
const g = { hand: [0, 0], comm: [0, 0, 0, 0, 0] }; const p = { hand: [false, false], comm: [false, false, false, false, false] };
const used = { hand: [false, false], comm: [false, false, false, false, false] };
const take = (r, flag) => { for (let k = 0; k < 2; k++) { if (hand[k] === r && !used.hand[k]) { used.hand[k] = true; return ['hand', k]; } } for (let k = 0; k < vis.length; k++) { if (vis[k] === r && !used.comm[k]) { used.comm[k] = true; return ['comm', k]; } } return null; };
if (ev.chain) { ev.chain.forEach((r, n) => { const t = take(r); if (t) { g[t[0]][t[1]] = n + 1; } }); }
const usedP = { hand: [false, false], comm: [false, false, false, false, false] };
const needP = Object.assign({}, ev.pkSet || {});
if (ev.pkName && (ev.type === 'poker' || ev.type === 'golf')) {
Object.keys(needP).forEach((rk) => { const r = Number(rk); let n = needP[rk]; for (let k = 0; k < 2 && n > 0; k++) { if (hand[k] === r && !usedP.hand[k]) { usedP.hand[k] = true; p.hand[k] = true; n--; } } for (let k = 0; k < vis.length && n > 0; k++) { if (vis[k] === r && !usedP.comm[k]) { usedP.comm[k] = true; p.comm[k] = true; n--; } } });
}
return { g, p };
}
parts() { const cols = ['#ffd166', '#ff4fa3', '#5eead4', '#ffffff', '#ff7a3d', '#9b5de5']; const out = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2 + (i % 3) * 0.13; const d = 160 + ((i * 53) % 260); out.push({ dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d * 0.8), c: cols[i % NP], dl: ((i * 37) % 30) / 100, sz: 6 + ((i * 7) % 9) }); } return out; }
roundName(r) { return ['PRÉ-FLOP', 'FLOP', 'TURN', 'RIVER'][r]; }
shownCount(r) { return [0, 3, 4, 5][r]; }
round50(x) { return Math.max(0, Math.round(x / 50) * 50); }
strength(hand, comm, par, round) {
if (round === 0) { const avg = (hand[0] + hand[1]) / 2; return (avg - 9) / 3 - (hand[0] === hand[1] ? 1.5 : 0) + (Math.random() * 1.2 - 0.6); }
const e = this.evalPlayer(hand, comm, par);
return (e.rel === null ? 5 : e.rel) + (Math.random() * 1.6 - 0.8);
}
put(h, st, i, amount) { const a = Math.max(0, Math.min(amount, st[i])); st[i] -= a; h.rb[i] += a; h.tot[i] += a; h.pot += a; if (st[i] === 0) { h.allin[i] = true; } return a; }
nm(i) { return i === 0 ? 'Vous' : this.oppNames()[i - 1]; }
nextActor(h) {
for (let k = 0; k < NP; k++) { const i = (h.turn + k) % NP; if (h.folded[i] || h.allin[i]) { continue; } if (!h.acted[i] || h.rb[i] < h.cur) { return i; } }
return -1;
}
apply(h, st, log, i, kind, to) {
const nm = this.nm(i);
if (kind === 'fold') { h.folded[i] = true; h.status[i] = 'COUCHÉ'; log.push({ a: nm + (i ? ' se couche' : ' vous couchez'), b: '' }); }
else if (kind === 'check') { h.acted[i] = true; h.status[i] = 'CHECK'; log.push({ a: nm + (i ? ' checke' : ' checkez'), b: '' }); }
else if (kind === 'call') { const a = this.put(h, st, i, h.cur - h.rb[i]); h.acted[i] = true; h.status[i] = h.allin[i] ? 'TAPIS ' + this.fmt(h.rb[i]) : 'SUIVI ' + this.fmt(h.rb[i]); log.push({ a: nm + (i ? ' suit' : ' suivez') + (h.allin[i] ? ' (tapis)' : ''), b: this.fmt(a) }); }
else {
const max = h.rb[i] + st[i]; const target = Math.min(to, max);
if (target <= h.cur) { this.apply(h, st, log, i, 'call'); return; }
const was = h.cur; const size = target - was; const a = this.put(h, st, i, target - h.rb[i]);
if (size >= h.minRaise) { h.minRaise = size; for (let j = 0; j < NP; j++) { if (j !== i) { h.acted[j] = false; } } }
h.cur = target; h.acted[i] = true; if (was > 0) { h.raises += 1; }
h.status[i] = h.allin[i] ? 'TAPIS ' + this.fmt(target) : (was > 0 ? 'RELANCE ' : 'MISE ') + this.fmt(target);
log.push({ a: nm + (h.allin[i] ? (i ? ' fait tapis' : ' faites tapis') : (was > 0 ? (i ? ' relance à ' : ' relancez à ') : (i ? ' mise ' : ' misez ')) + this.fmt(target)), b: this.fmt(a) });
}
h.turn = (i + 1) % NP;
}
aiAct(h, st, log, i) {
const vis = h.comm.slice(0, this.shownCount(h.round)); const str = this.strength(h.hands[i], vis, h.par, h.round);
const toCall = h.cur - h.rb[i]; const stack = st[i]; const rnd = Math.random(); const minTo = h.cur === 0 ? 200 : h.cur + h.minRaise;
if (toCall <= 0) {
if ((str <= -0.75 && rnd < 0.6) || rnd < 0.03) { const cap = str <= -2 ? stack : this.round50(Math.max(minTo, stack * 0.3)); const to = Math.min(Math.max(minTo, this.round50(h.pot * (0.3 + Math.random() * 0.35))), h.rb[i] + cap); this.apply(h, st, log, i, 'raise', to >= h.rb[i] + stack * 0.9 ? h.rb[i] + stack : to); }
else { this.apply(h, st, log, i, 'check'); }
return;
}
const odds = toCall / (h.pot + toCall); const heavy = toCall > stack * 0.4; const limit = (h.round === 0 ? 1.15 : [0, 2.7, 2 , 1.5][h.round]) - odds * 3.8 - (heavy ? 1 : 0);
const strong = (str <= -1.75 && rnd < 0.5) || rnd < 0.02;
if (str <= limit || (rnd > 0.97 && !heavy)) {
if (strong && h.raises < 2 && stack > toCall) { const to = Math.min(h.cur + Math.max(h.minRaise, this.round50(h.pot * (0.4 + Math.random() * 0.4))), h.rb[i] + this.round50(Math.max(stack * 0.4, h.cur - h.rb[i] + h.minRaise))); this.apply(h, st, log, i, 'raise', to >= h.rb[i] + stack * 0.9 ? h.rb[i] + stack : to); }
else { this.apply(h, st, log, i, 'call'); }
} else { this.apply(h, st, log, i, 'fold'); }
}
startMsg(h) {
const toCall = Math.max(0, h.cur - h.rb[0]);
return 'Tour ' + this.roundName(h.round) + ' · pot ' + this.fmt(h.pot) + ' · ' + (toCall > 0 ? 'à suivre : ' + this.fmt(toCall) + '. Suivre, relancer, tapis ou vous coucher ?' : 'personne n’a misé. Checker, miser, tapis ou vous coucher ?');
}
run(h, st, log, strokes) {
for (let guard = 0; guard < 400; guard++) {
const alive = []; for (let i = 0; i < NP; i++) { if (!h.folded[i]) { alive.push(i); } }
if (alive.length === 1) { return this.showdown(h, st, log, strokes); }
const able = alive.filter((i) => !h.allin[i]);
let who = this.nextActor(h);
if (able.length <= 1 && (able.length === 0 || h.rb[able[0]] >= h.cur)) { who = -1; }
if (who === -1) {
if (h.round === 3 || able.length <= 1) { if (h.round < 3) { log.push({ a: 'Les cartes restantes sont posées', b: '' }); } return this.showdown(h, st, log, strokes); }
h.round += 1; h.cur = 0; h.minRaise = 200; h.raises = 0; h.rb = Z(0); h.acted = Z(false); h.turn = (h.dealer + 1) % NP;
const CD = this.cards(); const from = this.shownCount(h.round - 1); const to = this.shownCount(h.round);
log.push({ a: this.roundName(h.round) + ' : ' + h.comm.slice(from, to).map((r) => CD[r][0]).join(', '), b: '' });
for (let i = 0; i < NP; i++) { if (!h.folded[i] && !h.allin[i]) { h.status[i] = i === 0 ? 'À VOUS' : 'EN JEU'; } }
continue;
}
if (this.isHuman(who)) { const minTo = h.cur === 0 ? 200 : h.cur + h.minRaise; if (who === 0) { h.status[0] = 'À VOUS'; } else { h.status[who] = 'À JOUER'; } return { h, stacks: st, log, strokes, tableMsg: who === 0 ? this.startMsg(h) : 'Tour de ' + this.nm(who) + '…', raiseTo: Math.min(minTo, h.rb[who] + st[who]), turnSeat: who, aiPending: false }; }
if (this._pace) { const tok = (this._tok = (this._tok || 0) + 1); h.tok = tok; setTimeout(() => { this.aiStep(tok); }, this._paceMs || 750); return { h, stacks: st, log, strokes, tableMsg: 'Tour de ' + this.nm(who) + '…', turnSeat: who, aiPending: true }; }
this.aiAct(h, st, log, who);
}
}
deal(stacks, hole, strokes, recIn) {
const rc = (recIn || Z(0)).slice(); const st = stacks.slice(); const par = this.pars()[hole - 1]; const dealer = (hole - 1) % NP;
const log = [ { a: 'Trou ' + hole + ' · par ' + par, b: this.yards()[hole - 1] + ' yds' } ];
const outP = st.map((v) => v <= 0);
const noBet = outP.filter((x) => !x).length < 2;
const deck = [];
for (let r = 1; r <= 18; r++) { for (let k = 0; k < 4; k++) { deck.push(r); } }
for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
const hands = []; for (let i = 0; i < NP; i++) { hands.push([deck.pop(), deck.pop()]); }
const comm = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
const z = () => Z(0); const f = () => Z(false);
const h = { rec: rc, out: outP, hole, par, hands, comm, dealer, rb: z(), tot: z(), folded: f(), allin: f(), acted: f(), pot: 0, cur: 0, minRaise: 200, raises: 0, round: 0, status: ['', '', '', '', '', ''], tag: ['', '', '', '', '', ''], phase: 'bet', turn: 0 };
const nextA = (from) => { let k = from; for (let n = 0; n < NP; n++) { k = (k + 1) % NP; if (!outP[k]) { return k; } } return from; };
for (let i = 0; i < NP; i++) { if (outP[i]) { h.folded[i] = true; h.status[i] = 'ÉLIMINÉ'; } }
if (noBet) { h.noBet = true; h.round = 3; log.push({ a: 'Plus d’adversaire avec des jetons : trou joué sans mise', b: '' }); return this.showdown(h, st, log, strokes); }
const sb = nextA(dealer); const bb = nextA(sb);
h.tag[dealer] = 'D'; h.tag[sb] = h.tag[sb] ? 'D · SB' : 'SB'; h.tag[bb] = 'BB';
this.put(h, st, sb, 100); this.put(h, st, bb, 200); h.cur = 200;
h.status[sb] = 'SB 100'; h.status[bb] = 'BB 200';
log.push({ a: 'Blinds : ' + this.nm(sb) + ' 100 · ' + this.nm(bb) + ' 200', b: '' });
h.turn = nextA(bb);
return this.run(h, st, log, strokes);
}
aiStep(tok) {
const s = this.state; if (!s || !s.aiPending || !s.h || s.h.tok !== tok || s.h.phase !== 'bet') { return; }
const h = JSON.parse(JSON.stringify(s.h)); const st = s.stacks.slice(); const log = s.log.concat([]); const who = this.nextActor(h);
if (who < 0 || this.isHuman(who)) { this.setState(this.run(h, st, log, s.strokes)); return; }
this.aiAct(h, st, log, who); this.setState(this.run(h, st, log, s.strokes));
}
turnInfo() {
const s = this.state; const h = s.h; if (!h || h.phase !== 'bet') { return { seat: -1 }; }
const seat = s.turnSeat !== undefined ? s.turnSeat : (h.status[0] === 'À VOUS' ? 0 : -1); return { seat, mine: seat === 0, name: seat === 0 ? 'Vous' : (seat > 0 ? this.nm(seat) : '') };
}
heroAct(kind, toArg, seat) {
const s = this.state; if (s.h.phase !== 'bet' || s.aiPending) { return; }
if (!this._autoAct && seat === undefined && s.idle) { s.idle = 0; }
if (this._mpSend && seat === undefined) { this._mpSend({ kind, to: toArg || s.raiseTo || 0 }); return; }
const i = seat || 0; if (seat !== undefined && s.turnSeat !== seat) { return; }
const st = s.stacks.slice(); const h = JSON.parse(JSON.stringify(s.h)); const log = s.log.concat([]);
const toCall = h.cur - h.rb[i]; const minTo = h.cur === 0 ? 200 : h.cur + h.minRaise; const maxTo = h.rb[i] + st[i];
if (kind === 'fold') { this.apply(h, st, log, i, 'fold'); }
else if (kind === 'call') { this.apply(h, st, log, i, toCall > 0 ? 'call' : 'check'); }
else if (kind === 'allin') { this.apply(h, st, log, i, 'raise', maxTo); }
else { if (maxTo <= h.cur) { return; } const to = Math.max(Math.min(toArg || s.raiseTo || minTo, maxTo), Math.min(minTo, maxTo)); this.apply(h, st, log, i, 'raise', to); }
this.setState(this.run(h, st, log, s.strokes));
}
showdown(h, st, log, strokesIn) {
const pre = this._mpOn ? { h: JSON.parse(JSON.stringify(h)), st: st.slice(), log: log.slice(), strokes: strokesIn.map((a) => a.slice()) } : null;
const par = h.par;
h.phase = 'done'; h.round = 3;
const ev = h.hands.map((hand) => this.evalPlayer(hand, h.comm, par));
const alive = []; for (let i = 0; i < NP; i++) { if (!h.folded[i]) { alive.push(i); } }
const key = (i) => { const hs = h.hands[i].slice().sort((a, b) => a - b); return [ev[i].rel === null ? 9 : ev[i].rel, ev[i].type === 'poker' ? 1 : 0, -ev[i].pkH, hs[0], hs[1]]; };
const cmp = (a, b) => { for (let k = 0; k < 5; k++) { if (a[k] !== b[k]) { return a[k] - b[k]; } } return 0; };
const best = (list) => { let w = [list[0]]; for (let n = 1; n < list.length; n++) { const c = cmp(key(list[n]), key(w[0])); if (c < 0) { w = [list[n]]; } else if (c === 0) { w.push(list[n]); } } return w; };
const levels = Array.from(new Set(h.tot.filter((x) => x > 0))).sort((a, b) => a - b);
let prev = 0; const pots = [];
levels.forEach((l) => {
let amt = 0; for (let i = 0; i < NP; i++) { amt += Math.max(0, Math.min(h.tot[i], l) - Math.min(h.tot[i], prev)); }
let el = alive.filter((i) => h.tot[i] >= l);
if (!el.length) { el = [alive.slice().sort((a, b) => h.tot[b] - h.tot[a])[0]]; }
const last = pots[pots.length - 1];
if (last && last.el.join() === el.join()) { last.amt += amt; } else { pots.push({ amt, el }); }
prev = l;
});
const gains = Z(0); const potLog = []; let mainWinners = null;
pots.forEach((p, n) => {
const w = best(p.el); const share = Math.floor(p.amt / w.length);
w.forEach((x, k) => { const g = share + (k === 0 ? p.amt - share * w.length : 0); st[x] += g; gains[x] += g; });
if (n === 0) { mainWinners = w; }
potLog.push({ a: (n === 0 ? 'Pot principal' : 'Pot annexe ' + n) + ' : ' + w.map((x) => this.nm(x)).join(' / '), b: '+' + this.fmt(p.amt) });
});
if (!mainWinners) { mainWinners = []; }
h.reveal = Z(null); if (alive.length > 1) { alive.forEach((i) => { if (i !== 0) { h.reveal[i] = h.hands[i].slice().sort((a, b) => a - b); } }); }
h.boom = !!(h.allin[0] && gains[0] > 0); h.loser = !!(!h.noBet && !h.folded[0] && !(h.out && h.out[0]) && ev[0].rel === null && !(gains[0] > 0)); h.gains = gains.slice(); h.doneAt = Date.now();
const rel = []; const how = [];
for (let i = 0; i < NP; i++) {
const base = ev[i].rel === null ? 4 : ev[i].rel;
if (h.out && h.out[i]) { rel[i] = UNPLAYED; how[i] = 'éliminé'; }
else if (h.folded[i]) { rel[i] = Math.min(4, base + 1); how[i] = 'couché'; }
else { rel[i] = base; how[i] = ev[i].type === null ? 'bluff raté' : ev[i].type; }
}
mainWinners.forEach((w) => { if (ev[w].rel === null) { rel[w] = h.allin[w] ? 1 - par : 0; how[w] = h.allin[w] ? 'tapis bluff' : 'bluff'; } });
const strokes = strokesIn.map((a) => a.slice());
for (let i = 0; i < NP; i++) { strokes[i][h.hole - 1] = par + rel[i]; }
log.push({ a: '— Showdown —', b: '' });
for (let i = 0; i < NP; i++) {
h.status[i] = this.term(rel[i], par).toUpperCase() + (how[i] === 'golf' ? '' : ' · ' + how[i].toUpperCase());
log.push({ a: this.nm(i) + ' : ' + this.term(rel[i], par) + ' (' + how[i] + ')', b: this.signed(rel[i]) });
}
potLog.forEach((l) => { log.push(l); });
const msg = h.noBet ? (h.out && h.out[0] ? 'Vous n’avez plus de jetons : par + 2 sur ce trou (' + (par + 2) + ' coups).' : 'Plus aucun adversaire n’a de jetons : trou joué sans mise. Votre score : ' + this.term(rel[0], par) + ' (' + (par + rel[0]) + ' coups).') : ((gains[0] > 0 ? 'Vous remportez ' + this.fmt(gains[0]) + ' jetons. ' : 'Vous ne remportez pas de pot. ') + 'Votre score sur le trou : ' + this.term(rel[0], par) + ' (' + (par + rel[0]) + ' coups).') + (h.folded[0] && !(h.out && h.out[0]) && ev[0].rel !== null && !h.noBet ? ' Vous vous êtes couché : ' + this.term(ev[0].rel, par) + ' + 1 point de pénalité.' : '');
const rl = (i) => (ev[i].rel === null ? 'aucune combinaison' : ev[i].label + (ev[i].altLabel ? ' (ou aussi ' + ev[i].altLabel + ')' : '')) + ' = ' + this.term(rel[i], par) + ' (' + (par + rel[i]) + ' coups)';
const who = (i) => (i === 0 ? 'Vous' : this.nm(i));
const w0 = mainWinners[0]; const wl = [];
if (h.noBet) {
alive.forEach((i) => { wl.push({ n: who(i), role: 'SEUL AVEC DES JETONS', cls: 'w', res: rl(i), hand: '', why: 'Plus aucun adversaire n’a de jetons : le trou se joue sans mise, sans bluff possible (sans combinaison : par + 4).' }); });
} else if (alive.length === 1) {
wl.push({ n: who(w0), role: 'Gagne le pot', cls: 'w', res: ev[w0].rel === null ? 'bluff gagnant' : rl(w0), hand: '', why: ev[w0].rel === null ? 'Tous les autres se sont couchés. Sans combinaison, un bluff gagnant vaut ' + (h.allin[w0] ? '1 coup (tapis)' : 'le par (' + par + ' coups)') + ' au lieu de par + 4.' : 'Tous les autres se sont couchés : le pot est gagné sans montrer les cartes.' });
} else {
const CDn = this.cards(); const hand = (i) => { const hs = h.hands[i].slice().sort((x, y) => x - y); return hs.map((r) => CDn[r][0] + ' (rang ' + r + ')').join(' + '); };
wl.push({ n: mainWinners.map(who).join(' + '), role: 'Gagne le pot', cls: 'w', res: rl(w0), hand: 'Main : ' + hand(w0), pk: ev[w0].type === 'golf' && ev[w0].pkName ? '2e combinaison (poker) : ' + ev[w0].pkTxt : '', why: mainWinners.length > 1 ? 'Égalité parfaite : le pot est partagé.' : '' });
alive.filter((i) => !mainWinners.includes(i)).slice(0, 4).forEach((i) => {
let why = 'Moins bon score : ' + (par + rel[i]) + ' coups contre ' + (par + rel[w0]) + '. Le rang des cartes ne compte qu’à égalité de score.';
if (ev[i].rel === null && ev[w0].rel === null) { why = 'Bluff : la meilleure carte en main l’emporte.'; }
else if (ev[i].rel === ev[w0].rel) {
if (ev[i].type !== ev[w0].type) { why = 'Égalité de score : le golf passe avant le poker.'; }
else if (ev[i].pkH !== ev[w0].pkH) { why = 'Égalité de score, départagé par la combinaison poker : ' + (ev[w0].pkName || 'aucune') + ' bat ' + (ev[i].pkName || 'aucune combinaison poker') + '.'; }
else { const hw = h.hands[w0].slice().sort((x, y) => x - y); const hi = h.hands[i].slice().sort((x, y) => x - y); const k = hw[0] !== hi[0] ? 0 : 1; why = 'Égalité de score, départagé par le rang des cartes en main : ' + CDn[hw[k]][0] + ' (rang ' + hw[k] + ') bat ' + CDn[hi[k]][0] + ' (rang ' + hi[k] + ')' + (k === 1 ? ' à la 2e carte' : '') + '.'; }
}
wl.push({ n: who(i), role: 'PERD', cls: 'l', res: rl(i), hand: 'Main : ' + hand(i), pk: ev[i].type === 'golf' && ev[i].pkName ? '2e combinaison (poker) : ' + ev[i].pkTxt : '', why });
});
}
const fl = []; const el = []; for (let i = 0; i < NP; i++) { if (h.out && h.out[i]) { el.push(who(i)); } else if (h.folded[i]) { fl.push(who(i)); } }
if (el.length) { wl.push({ n: el.join(', '), role: 'ÉLIMINÉS', cls: 'f', res: 'plus de jetons : par + 2', hand: '', why: '' }); }
if (fl.length) { wl.push({ n: fl.join(', '), role: 'COUCHÉS', cls: 'f', res: '+ 1 coup', hand: '', why: '' }); }
const whyTxt = wl;
return pre ? { h, stacks: st, strokes, log, tableMsg: msg, why: whyTxt, aiPending: false, pre } : { h, stacks: st, strokes, log, tableMsg: msg, why: whyTxt, aiPending: false };
}
outs(hand, vis, par, cur) {
const cnt = {}; hand.concat(vis).forEach((r) => { cnt[r] = (cnt[r] || 0) + 1; });
const CD = this.cards(); const CB = this.combos()[par]; const targets = {}; let best = null;
for (let n = 0; n < CB.length; n++) {
const c = CB[n]; if (c[0] - par > 0 || (cur !== null && c[0] >= cur)) { continue; }
const need = {}; for (let k = 1; k < c.length; k++) { need[c[k]] = (need[c[k]] || 0) + 1; }
const miss = []; let inHand = false;
for (const r in need) { const have = cnt[r] || 0; if (have < need[r]) { for (let m = 0; m < need[r] - have; m++) { miss.push(Number(r)); } } if (hand.indexOf(Number(r)) >= 0) { inHand = true; } }
if (miss.length !== 1 || !inHand) { continue; }
const r = miss[0]; const left = 4 - (cnt[r] || 0); if (left <= 0) { continue; }
targets[r] = left;
if (best === null || c[0] < best.coups) { best = { coups: c[0], chain: c.slice(1).map((x) => CD[x][0]).join(' → '), card: CD[r][0] }; }
}
let outs = 0; for (const r in targets) { outs += targets[r]; }
const shown = vis.length; const unseen = 72 - 2 - shown; const k = 5 - shown;
let p = 0; if (outs > 0 && k > 0) { let q = 1; for (let j = 0; j < k; j++) { q *= (unseen - outs - j) / (unseen - j); } p = 1 - q; }
return { outs, p, best };
}
advice(h, st) {
const CD = this.cards(); const shown = this.shownCount(h.round); const vis = h.comm.slice(0, shown); const hand = h.hands[0]; const par = h.par;
const ev = this.evalPlayer(hand, vis, par); const toCall = Math.max(0, h.cur - h.rb[0]); const stack = st[0];
const o = shown >= 3 && shown < 5 ? this.outs(hand, vis, par, ev.type === 'golf' ? par + ev.rel : null) : { outs: 0, p: 0, best: null };
let level; let eq; let sLabel; let sDetail;
if (shown === 0) {
const avg = (hand[0] + hand[1]) / 2;
if (hand[0] === hand[1]) { level = 'FORTE'; eq = 0.6; sLabel = 'Paire en main'; sDetail = 'Deux cartes identiques : un bon départ pour faire un brelan ou un carré.'; }
else if (avg <= 7) { level = 'MOYENNE'; eq = 0.35; sLabel = 'Cartes hautes'; sDetail = 'Des cartes de départ ou de green fortes : elles débloquent de bonnes combinaisons.'; }
else if (avg <= 11) { level = 'MOYENNE'; eq = 0.2; sLabel = 'Cartes moyennes'; sDetail = 'Rien d’exceptionnel : attendez de voir le flop avant de miser gros.'; }
else { level = 'FAIBLE'; eq = 0.12; sLabel = 'Cartes basses'; sDetail = 'Des putts surtout : il faudra du flop pour construire un trou.'; }
const ph = this.parHint(hand, par); sDetail += ' ' + ph.long;
if (ph.n === 0 && hand[0] !== hand[1]) { level = 'FAIBLE'; eq = Math.min(eq, 0.12); sLabel = 'Cartes peu utiles sur ce Par'; sDetail += ' Elles restent jouables en poker (paire, série…) avec les cartes du flop.'; }
} else if (ev.rel === null) { level = 'FAIBLE'; eq = 0.12; sLabel = 'Aucune combinaison'; sDetail = 'Sans combinaison, le trou vaut par + 4. Il reste ' + (5 - shown) + ' carte(s) commune(s) à poser.'; }
else if (ev.rel <= -1) { level = 'FORTE'; eq = ev.rel <= -3 ? 0.92 : (ev.rel === -2 ? 0.84 : 0.7); sLabel = this.term(ev.rel, par) + ' en vue'; sDetail = ev.label; }
else { level = 'MOYENNE'; eq = 0.4; sLabel = this.term(ev.rel, par) + ' possible'; sDetail = ev.label; }
eq = Math.min(0.85, eq + o.p * 0.5);
const pct = level === 'FORTE' ? 88 : level === 'MOYENNE' ? 55 : 22;
const odds = toCall > 0 ? toCall / (h.pot + toCall) : 0;
const minTo = h.cur === 0 ? 200 : h.cur + h.minRaise; let maxTo = h.rb[0] + stack;
let oppCap = 0; for (let j = 1; j < st.length; j++) { if (!h.folded[j] && !h.allin[j] && !(h.out && h.out[j])) { oppCap = Math.max(oppCap, h.rb[j] + st[j]); } }
const canRaise = oppCap > h.cur; if (canRaise) { maxTo = Math.min(maxTo, oppCap); }
const size = Math.max(Math.min(minTo, maxTo), Math.min(maxTo, h.cur + Math.max(h.minRaise, this.round50(h.pot * 0.6))));
let title; let why; let apply = false;
if (toCall <= 0) {
if (eq >= 0.55 && maxTo > h.cur && canRaise) { title = 'Miser ' + this.fmt(size); apply = true; why = 'Votre main est forte : misez pour faire payer les autres et grossir le pot.'; }
else { title = 'Checker'; why = o.outs > 0 ? 'Rien à payer : checkez et voyez la carte suivante, il vous manque une carte utile.' : 'Rien à payer : checkez et voyez la suite gratuitement.'; }
} else if (eq >= 0.6 && stack > toCall && canRaise) { title = 'Relancer à ' + this.fmt(size); apply = true; why = 'Main forte face à cette mise : relancez pour grossir le pot.'; }
else if (eq >= odds + 0.08) { title = 'Suivre ' + this.fmt(Math.min(toCall, stack)); why = 'La cote du pot est bonne : vous payez ' + this.fmt(toCall) + ' pour tenter de gagner ' + this.fmt(h.pot) + '.'; }
else if (eq >= odds - 0.04) { title = 'Suivre (limite)'; why = 'Décision serrée : le prix est juste à la hauteur de vos chances. Gardez un œil sur votre pile.'; }
else { title = 'Se coucher'; why = 'La mise est trop chère pour vos chances (' + Math.round(odds * 100) + ' % requis, environ ' + Math.round(eq * 100) + ' % estimés). Se coucher coûte + 1 coup au golf, mais vous gardez vos jetons.'; }
if (title === 'Se coucher' && ev.rel !== null && ev.rel <= -2) { title = 'Suivre (limite)'; why = 'Vous avez une combinaison très forte (' + this.term(ev.rel, par) + ') : même face à une grosse mise, elle gagne très souvent. Surveillez seulement votre pile.'; }
let alt = null; if (apply && stack > size - h.rb[0]) { alt = { title: 'Tapis ' + this.fmt(stack), size: h.rb[0] + stack }; why += ' Vous pouvez aussi faire tapis (' + this.fmt(stack) + ') : c’est à vous de décider.'; }
const tips = ['Au pré-flop, vous ne voyez que vos 2 cartes : jouez prudemment tant que le flop n’est pas posé.', 'Une combinaison doit utiliser au moins une carte de votre main : le flop seul ne vaut rien.', 'À score égal, la combinaison golf bat la combinaison poker.', 'Dernier tour de mises : les cartes ne changeront plus. Si tout le monde se couche, un bluff gagnant vaut le par.'];
let outsTxt = 'Pas de combinaison à compléter pour l’instant.';
if (shown >= 5) { outsTxt = 'Toutes les cartes sont posées : plus de carte à venir.'; }
else if (shown >= 3 && o.outs > 0) { outsTxt = 'Il vous manque une carte : ' + o.outs + ' cartes utiles sur ' + (72 - 2 - shown) + ' restantes (environ ' + Math.round(o.p * 100) + ' %)' + (o.best ? ' · objectif : ' + o.best.chain + ' (' + this.term(o.best.coups - par, par) + ')' : '') + '.'; }
else if (shown === 0) { outsTxt = 'Les cartes utiles se compteront dès le flop.'; }
return { level, pct, sLabel, sDetail, eq: Math.round(eq * 100) + ' %', odds: toCall > 0 ? Math.round(odds * 100) + ' %' : '–', title, why, apply, size, alt, tip: tips[h.round], outsTxt };
}
net(s) { return s.stacks.map((v, i) => v - 10000 - 10000 * (s.h && s.h.rec ? s.h.rec[i] : 0)); }
advance(reloadHero) {
const s = this.state; const h = s.h; const st = s.stacks.slice(); const rec = h.rec.slice(); let fees = s.fees; let hist = s.hist;
if (reloadHero) { st[0] += 10000; rec[0] += 1; fees -= 100; hist = [ { a: 'Recave en cours de partie', t: 'À l’instant', d: '−100 fees', e: '+10 000 pts', cls: 'hf' } ].concat(hist); }
const mkPos = (md) => { const m = {}; this.board(md).rows.forEach((r, n) => { m[r.i] = n + 1; }); return m; }; const curPos = { net: mkPos('net'), brut: mkPos('brut') }; const trend = { net: {}, brut: {} }; if (s.prevPos) { ['net', 'brut'].forEach((md) => { Object.keys(curPos[md]).forEach((k) => { trend[md][k] = s.prevPos[md][k] - curPos[md][k]; }); }); }
const d = this.deal(st, h.hole + 1, s.strokes, rec);
this.setState(Object.assign({}, d, { hole: h.hole + 1, reload: false, fees, hist, prevPos: curPos, trend }));
}
finishNow() {
const pace0 = this._pace; this._pace = false; try { return this.finishNow2(); } finally { this._pace = pace0; this._tok = (this._tok || 0) + 1; }
}
finishNow2() {
const s = this.state; const h = s.h; if (!h || s.stacks[0] > 0) { return false; }
if (this._mpOn || this._mpSend) { this.setState({ watch: true }); return false; }
let st = s.stacks.slice(); let strokes = s.strokes; let hole = h.hole; let d = null;
let cur = null;
if (h.phase !== 'done') {
const pace = this._pace; this._pace = false;
try { const hh = JSON.parse(JSON.stringify(h)); let out = this.run(hh, st.slice(), [], strokes.map((a) => a.slice())); if (!out.h || out.h.phase !== 'done') { const h3 = JSON.parse(JSON.stringify(h)); h3.round = 3; out = this.showdown(h3, st.slice(), [], strokes.map((a) => a.slice())); } cur = out; } finally { this._pace = pace; }
if (cur.stacks[0] > 0) { this.setState(cur); return false; }
st = cur.stacks.slice(); strokes = cur.strokes;
}
for (let i = 0; i < NP; i++) { for (let k = 0; k < hole; k++) { if (typeof strokes[i][k] !== 'number' || isNaN(strokes[i][k])) { strokes[i][k] = this.pars()[k] + UNPLAYED; } } }
while (hole < 18) { d = this.deal(st, hole + 1, strokes, h.rec); hole += 1; st = d.stacks; strokes = d.strokes; }
if (!d) { if (cur) { this.setState(Object.assign({}, cur, { reload: false, finishedEarly: true })); return true; } return false; }
this.setState(Object.assign({}, d, { hole, reload: false, prevPos: null, trend: { net: {}, brut: {} }, finishedEarly: true }));
return true;
}
// ---------- Mode tournoi à la table (Greencut Tour, version solo de test) ----------
// ---------- Partie en cours : sauvegarde, reprise, sortie protégée, couché pour la partie, spectateur (V47) ----------
isLive(s) { return !!(s && s.h && !s.gate && !s.quit && !s.finishedEarly && !(s.h.hole >= 18 && s.h.phase === 'done')); }
gameSave(n) {
if (typeof localStorage === 'undefined' || typeof document === 'undefined' || this._mpOn || this._mpSend || !n || (typeof window !== 'undefined' && window.location && /[?&]mp=/.test(window.location.search || ''))) { return; }
const ss = (typeof sessionStorage !== 'undefined') ? sessionStorage : null;
if (this.isLive(n)) {
  if (n.tour) { if (ss) { ss.setItem(GAME_KEY, JSON.stringify({ v: 1, t: Date.now(), s: n })); } localStorage.removeItem(GAME_KEY); localStorage.setItem(ABD_KEY, JSON.stringify({ chips: Math.max(0, n.stacks[0] || 0), tour: true, games: n.games || 1, at: Date.now() })); }
  else { localStorage.setItem(GAME_KEY, JSON.stringify({ v: 1, t: Date.now(), s: n })); if (ss) { ss.removeItem(GAME_KEY); } }
}
else if (n.h && (n.gate || n.quit || n.finishedEarly || (n.h.hole >= 18 && n.h.phase === 'done'))) { localStorage.removeItem(GAME_KEY); localStorage.removeItem(ABD_KEY); if (ss) { ss.removeItem(GAME_KEY); } }
}
gameClear() { try { localStorage.removeItem(GAME_KEY); localStorage.removeItem(ABD_KEY); if (typeof sessionStorage !== 'undefined') { sessionStorage.removeItem(GAME_KEY); } } catch (x) { /* rien */ } }
gameLoad() {
if (typeof window === 'undefined' || !window.location || /[?&]mp=/.test(window.location.search || '')) { return null; }
let raw = null; try { raw = JSON.parse((typeof sessionStorage !== 'undefined' && sessionStorage.getItem(GAME_KEY)) || 'null'); if (!raw) { const ab = settleAbandoned(); if (ab) { this._abdMsg = ab; } raw = JSON.parse(localStorage.getItem(GAME_KEY) || 'null'); } } catch (x) { raw = null; }
if (!raw || raw.v !== 1 || !raw.s || !raw.s.h || !Array.isArray(raw.s.stacks) || Date.now() - (raw.t || 0) > 12 * 3600 * 1000) { try { localStorage.removeItem(GAME_KEY); if (typeof sessionStorage !== 'undefined') { sessionStorage.removeItem(GAME_KEY); } } catch (x) { /* rien */ } return null; }
let tourgo = false; try { tourgo = localStorage.getItem('greencut.tourgo') === '1' || /[?&]tour=1/.test(window.location.search || ''); } catch (x) { tourgo = false; }
if (tourgo && !raw.s.tour) { try { localStorage.removeItem(GAME_KEY); } catch (x) { /* rien */ } return null; }
if (tourgo) { try { localStorage.removeItem('greencut.tourgo'); } catch (x) { /* rien */ } }
const s = raw.s; if (WALLET.saved()) { const w = WALLET.get(); s.pts = w.pts; s.fees = w.fees; }
Object.assign(s, { aiPending: false, sheet: '', askQuit: false, tuto: false, moreOpt: false, leaveTo: '', resumed: true });
if (['fees', 'profil', 'card', 'board', 'table'].indexOf(s.screen) < 0) { s.screen = 'table'; }
this._resumeKick = true; return s;
}
leaveGuard() {
if (typeof document === 'undefined' || typeof window === 'undefined' || !document.addEventListener) { return; } window.__gcTable = this; if (window.__gcLeave) { return; } window.__gcLeave = true;
document.addEventListener('click', (e) => {
const c = window.__gcTable; if (!c || !c.isLive(c.state)) { return; }
const a = e.target && e.target.closest ? e.target.closest('a[href]') : null; if (!a || a.target === '_blank') { return; }
const href = a.getAttribute('href') || ''; if (!href || href.charAt(0) === '#') { return; }
if (/(TableMobile|TableMobilePaysage|Prototype)(\.dc)?\.html/.test(href) && !/[?&]go=/.test(href)) { return; } // bascule vertical / horizontal : la partie est reprise
e.preventDefault(); e.stopPropagation(); c.setState({ leaveTo: href, askQuit: true, sheet: 'quit', screen: 'table' });
}, true);
}
leaveLabel(href) { return /GreencutTour/.test(href) ? 'le Greencut Tour' : (/ModeJeu/.test(href) ? 'le choix du mode de jeu' : (/ChoixParcours/.test(href) ? 'le choix du parcours' : 'une autre page')); }
autoWatch() {
const s = this.state; if (!s || !s.watch || !s.h || s.gate || s.quit || s.h.phase !== 'done' || this._watchT || typeof setTimeout === 'undefined') { return; }
this._watchT = setTimeout(() => { this._watchT = null; const k = this.state; if (!k || !k.watch || k.gate || k.quit || !k.h || k.h.phase !== 'done') { return; } if (k.h.hole >= 18) { this.setState({ screen: 'board', watch: false }); return; } this.advance(false); }, this._pace === false ? 30 : 3000);
}
foldRest() {
const s = this.state; const h = s.h; if (!this.isLive(s) || s.stacks[0] <= 0 || this._mpOn || this._mpSend) { return false; }
const pace0 = this._pace; this._pace = false;
try {
let st = s.stacks.slice(); let strokes = s.strokes.map((a) => a.slice()); let cur = null;
if (h.phase !== 'done') { const hh = JSON.parse(JSON.stringify(h)); hh.folded[0] = true; let out = this.run(hh, st.slice(), [], strokes.map((a) => a.slice())); if (!out.h || out.h.phase !== 'done') { const h3 = JSON.parse(JSON.stringify(hh)); h3.round = 3; out = this.showdown(h3, st.slice(), [], strokes.map((a) => a.slice())); } cur = out; st = cur.stacks.slice(); strokes = cur.strokes; }
const bank = st[0]; st[0] = 0; let hole = cur && cur.h ? cur.h.hole : h.hole; let d = null;
for (let i = 0; i < NP; i++) { for (let k = 0; k < hole; k++) { if (typeof strokes[i][k] !== 'number' || isNaN(strokes[i][k])) { strokes[i][k] = this.pars()[k] + UNPLAYED; } } }
while (hole < 18) { d = this.deal(st, hole + 1, strokes, h.rec); hole += 1; st = d.stacks; strokes = d.strokes; }
const fin = d || cur || {}; const stacks = (fin.stacks || st).slice(); stacks[0] = bank;
const hist = [ { a: 'Partie ' + (s.games || 1) + ' : couché pour le reste de la partie', t: 'À l’instant', d: 'Score enregistré', e: '', cls: 'hp' } ].concat(s.hist);
this.setState(Object.assign({}, fin, { stacks, strokes: fin.strokes || strokes, hole, reload: false, prevPos: null, trend: { net: {}, brut: {} }, finishedEarly: true, foldedRest: true, watch: false, askQuit: false, sheet: '', screen: 'board', hist }));
} finally { this._pace = pace0; this._tok = (this._tok || 0) + 1; }
if (!this.state.gate) { this.settle(); }
return true;
}
idleTimeout(key) {
const s = this.state; if (!s || !s.tour || !this.isLive(s) || !s.h || s.h.phase !== 'bet' || s.turnSeat !== 0 || [s.h.hole, s.h.round, s.h.pot, s.h.cur].join('|') !== key) { return; }
const n = (s.idle || 0) + 1; const toCall = s.h.cur - s.h.rb[0];
this._autoAct = true; try { this.heroAct(toCall > 0 ? 'fold' : 'call'); } finally { this._autoAct = false; }
this._idleKey = '';
if (n < 3) { this.setState({ idle: n, tableMsg: 'Temps écoulé : ' + (toCall > 0 ? 'couché' : 'check') + ' automatique.' }); return; }
const k = this.state; const c = Math.max(0, k.stacks[0]);
const hist = [ { a: 'Carte de tournoi abandonnée (3 tours sans action) : mise perdue', t: 'À l’instant', d: c ? '+' + this.fmt(c) + ' pts rendus' : '0 pt rendu', e: '', cls: 'hf' } ].concat(k.hist);
this.setState({ idle: 0, quit: true, gate: true, refunded: true, abdReason: 'Carte abandonnée après 3 tours sans action', pts: k.pts + c, askQuit: false, sheet: '', screen: 'table', hist });
}
gamePatch(v) {
const s = this.state; if (!v || !s) { return v; }
if (typeof document !== 'undefined') { this.leaveGuard(); }
if (this._resumeKick && typeof setTimeout !== 'undefined') { this._resumeKick = false; setTimeout(() => { const k = this.state; if (k && k.h && k.h.phase === 'bet' && !k.gate && !k.quit) { const tok = (this._tok = (this._tok || 0) + 1); const h2 = JSON.parse(JSON.stringify(k.h)); h2.tok = tok; this.setState({ h: h2, aiPending: true }); setTimeout(() => { this.aiStep(tok); }, this._pace === false ? 0 : 400); } }, 30); }
this.autoWatch();
const live = this.isLive(s); if (this._abdMsg && live) { this._abdMsg = ''; } const elim = !!(s.stacks && s.stacks[0] <= 0); const left = s.h ? 18 - s.h.hole + (s.h.phase === 'done' ? 0 : 1) : 0;
v.gameLive = live; v.canFoldRest = live && !elim && !this._mpOn && !this._mpSend;
v.foldRestTxt = 'Vous vous couchez pour ' + (left > 1 ? 'les ' + left + ' trous restants' : 'le dernier trou') + ' : ' + (s.h && s.h.phase !== 'done' ? 'le trou en cours compte comme un coup couché (score de votre combinaison + 1, sinon par + 4), les suivants par + 2. ' : 'chacun compte par + 2. ') + 'Votre score est enregistré tout de suite et vos ' + this.fmt(s.stacks ? s.stacks[0] : 0) + ' pts de jetons reviennent sur votre solde. Ce n’est pas un abandon.' + (s.tour ? ' Votre carte est déposée au tournoi avec ce score.' : '');
v.hasLeave = !!s.leaveTo; v.leaveNote = s.leaveTo ? 'Vous allez quitter la table pour ' + this.leaveLabel(s.leaveTo) + ' : la partie en cours ne pourra pas être reprise.' : '';
const to = s.leaveTo; const go = () => { if (to && typeof window !== 'undefined') { window.location.href = to; } };
v.foldRestAct = () => { if (this.foldRest()) { go(); } };
v.mFoldRest = () => this.setState({ sheet: 'fold' });
// Profil : « Enregistrer et fermer » (V51) : enregistre le pseudo puis revient là d'où l'on vient (Tour, Mode de jeu, ou la partie)
v.saveClose = () => { const k = this.state; const d = (k.pseudoDraft || '').trim();
  if (d && d !== k.pseudo) { if (d.length < 2) { this.setState({ pseudoMsg: '2 caractères minimum' }); return; } try { localStorage.setItem('greencut.pseudo', d); } catch (x) { /* stockage */ } this.setState({ pseudo: d, pseudoDraft: d }); }
  profileSave(this.state);
  const m = typeof window !== 'undefined' && window.location ? /[?&]from=(tour|mode)\b/.exec(window.location.search || '') : null;
  if (m && !this.isLive(this.state)) { window.location.href = this.tourLink(m[1]); return; }
  const q = this.state; this.setState(q.quit ? { screen: 'table', gate: true, sheet: '' } : { screen: 'table', sheet: '' }); }; v.shFold = s.sheet === 'fold';
const refund = () => { const k = this.state; if (!k.quit || k.refunded) { return; } const c = Math.max(0, k.stacks ? k.stacks[0] : 0);
  if (this._mpQuit) { try { this._mpQuit(c); } catch (x) { /* multijoueur */ } }
  let hist = k.hist; if (!k.tour && hist[0] && /abandonnée : mise perdue/.test(hist[0].a)) { hist = [ Object.assign({}, hist[0], { a: hist[0].a + ', jetons restants rendus', d: '+' + this.fmt(c) + ' pts rendus', cls: c ? 'hp' : 'hf' }) ].concat(hist.slice(1)); }
  else if (c > 0) { hist = [ { a: (k.tour ? 'Carte de tournoi abandonnée' : 'Partie abandonnée') + ' : jetons restants rendus', t: 'À l’instant', d: '+' + this.fmt(c) + ' pts', e: '', cls: 'hp' } ].concat(hist); }
  this.setState({ pts: k.pts + c, refunded: true, refundAmt: c, hist }); };
if (typeof v.quitGame === 'function') { const q = v.quitGame; v.quitGame = () => { q(); refund(); this.gameClear(); go(); }; }
if (typeof v.quitNow === 'function') { const q = v.quitNow; v.quitNow = () => { q(); refund(); this.gameClear(); go(); }; }
if (s.tour && live && !elim) { v.quitNoElim = false; v.quitTour = true; v.quitTourTxt = 'Abandonner la carte : elle ne compte pas pour le tournoi et la mise de départ (10 000 pts) est perdue ; vos ' + this.fmt(s.stacks[0]) + ' pts de jetons reviennent sur votre solde. Vous pouvez rejouer une carte tant que le tour est ouvert.'; v.quitBtnLbl = 'Abandonner la carte'; }
else if (live && !elim) { v.quitNoElim = false; v.quitTour = true; v.quitTourTxt = 'Quitter, c’est abandonner la partie : la mise de départ (10 000 pts) est perdue et la partie ne compte pas ; vos ' + this.fmt(s.stacks[0]) + ' pts de jetons restants reviennent sur votre solde (les jetons déjà misés sur le trou en cours restent dans le pot). Une nouvelle partie demandera une nouvelle mise de départ, avec votre accord.'; }
else { v.quitTour = false; v.quitTourTxt = ''; }
// Tournoi : 60 s pour jouer ; au bout de 3 tours d'affilée sans action, la carte est abandonnée (règle du 25/11/2026)
const myTurn = !!(s.tour && live && s.h.phase === 'bet' && !s.aiPending && s.turnSeat === 0 && !(s.h.folded && s.h.folded[0]) && s.stacks[0] > 0);
if (myTurn && typeof setTimeout !== 'undefined') { const key = [s.h.hole, s.h.round, s.h.pot, s.h.cur].join('|'); if (this._idleKey !== key) { clearTimeout(this._idleT); clearTimeout(this._cdT); clearInterval(this._cdI); this._idleKey = key; const ms = (typeof window !== 'undefined' && window.GREENCUT_IDLE_MS) || IDLE_MS; this._idleEnd = Date.now() + ms; this._idleT = setTimeout(() => { clearInterval(this._cdI); this.idleTimeout(key); }, ms);
  // compte à rebours affiché seulement pendant les 15 dernières secondes (V51)
  this._cdT = setTimeout(() => { if (this._idleKey !== key) { return; } this.setState({ cdTick: Date.now() }); this._cdI = setInterval(() => { if (this._idleKey !== key) { clearInterval(this._cdI); return; } this.setState({ cdTick: Date.now() }); }, 1000); }, Math.max(0, ms - 15000)); } }
else if (this._idleKey) { clearTimeout(this._idleT); clearTimeout(this._cdT); clearInterval(this._cdI); this._idleKey = ''; }
// bandeau de tour (V51) : « C’est à vous de jouer », temps restant seulement sous 15 s, aucun compteur d’inactivité
if (myTurn && typeof v.turnTxt === 'string') { const base = v.turnTxt.split(' · ')[0]; const rem = this._idleEnd ? Math.ceil((this._idleEnd - Date.now()) / 1000) : 99; v.turnTxt = base + (rem <= 15 ? ' · ' + Math.max(0, rem) + ' s' : ''); }
// multijoueur (V53) : bouton de fin de trou avec le décompte partagé (« Trou suivant dans 10 s », « Prêt ✓ · encore 7 s », « Décompte en pause ») ; libellés courts pour tenir dans le bouton en horizontal
{ const nxi = this._mpNext; if (nxi && s.h && s.h.phase === 'done' && s.h.hole < 18 && nxi.hole === s.hole && typeof v.nextLabel === 'string') {
  const me = this._mpCtl ? this._mpCtl.seat : 0;
  const wait = nxi.wait || []; const iAmReady = (nxi.ready || []).indexOf(me) >= 0;
  const sec = Math.max(0, Math.ceil(((nxi.end || Date.now()) - Date.now()) / 1000)); v.nextLabel = nxi.paused ? 'Décompte en pause' : (iAmReady && wait.length ? 'Prêt ✓ · encore ' + sec + ' s' : 'Trou suivant dans ' + sec + ' s');
  if (v.doneCols !== undefined) { v.doneCols = '1fr'; } v.nextFs = '15px'; } }
// un seul avertissement, après 2 tours d’affilée sans action (V51)
// fenêtre de mise / fin de partie (V58) : on peut la fermer (✕) ; un bouton la rouvre
v.gateClose = () => this.setState({ gateHide: true });
v.gateReopen = () => this.setState({ gateHide: false });
v.gateReopenLbl = s.tour ? 'Jouer une carte ▶' : 'Nouvelle partie ▶';
v.gateHidden = !!(s.gateHide && (v.gate || v.gateOver || v.gateHidden));
if (s.gateHide) { if (v.gate !== undefined) { v.gate = false; } if (v.gateOver !== undefined) { v.gateOver = false; } }
// desktop (V57) : pas de ligne de conseil courte -> l'avertissement unique s'ajoute au message de la table
if (s.tour && live && s.idle >= 2 && v.advLine === undefined && typeof v.tableMsg === 'string' && v.tableMsg.indexOf('Encore un tour sans jouer') < 0) { v.tableMsg = (v.tableMsg ? v.tableMsg + ' ' : '') + 'Encore un tour sans jouer et la carte sera abandonnée (jetons rendus).'; }
if (s.tour && live && s.idle >= 2 && v.advLine === undefined && v.advTitle !== undefined && s.h && s.h.phase !== 'done') { v.advTitle = 'dernier avertissement'; v.advWhy = 'Encore un tour sans jouer et la carte sera abandonnée (jetons rendus).'; v.advCanApply = false; if (v.helpOn !== undefined) { v.helpOn = true; } }
if (s.tour && live && s.idle >= 2 && typeof v.advLine === 'string') { v.advLine = 'Encore un tour sans jouer et la carte sera abandonnée (jetons rendus).'; v.advCanApply = false; v.advHasAlt = false; if (v.showAdvice !== undefined && s.h && s.h.phase !== 'done') { v.showAdvice = true; } }

if (typeof v.cancelQuit === 'function') { const c = v.cancelQuit; v.cancelQuit = () => { c(); this.setState({ leaveTo: '' }); }; }
if (typeof v.closeSheet === 'function') { const c = v.closeSheet; v.closeSheet = () => { c(); if (this.state.leaveTo) { this.setState({ leaveTo: '' }); } }; }
return v;
}
tourStart() {
let on = false; try { on = /[?&]tour=1/.test(window.location.search || '') || localStorage.getItem('greencut.tourgo') === '1'; localStorage.removeItem('greencut.tourgo'); } catch (x) { on = false; }
if (!on) { return null; }
if (!WALLET.saved()) { WALLET.set(WALLET.get()); }
const w = WALLET.get(); return { tour: true, course: TOUR_CFG.course, pts: w.pts, fees: w.fees, gate: true, fresh: true, hist: [] };
}
// Menu général commun (V42) : mêmes entrées, même ordre sur tous les écrans hors table
navMenu(open, toggle) {
let ps = ''; try { ps = localStorage.getItem('greencut.pseudo') || ''; } catch (x) { ps = ''; }
ps = ps || TOUR.heroName();
const L = (k) => this.tourLink(k);
return { menuOpen: !!open, toggleMenu: toggle, closeMenu: () => { if (open) { toggle(); } }, pseudo: ps, initials: initialsOf(ps),
  profilHref: L('profil'), classicHref2: L('classic'), tourHref2: L('tour'), modeHref2: L('mode'), cardHref: L('card'), boardHref: L('board'), learnHref: L('learn') };
}
tourLink(kind) {
const href = (typeof window !== 'undefined' && window.location && window.location.href) || ''; const dc = /\.dc\.html/.test(href); const desk = /(Prototype|GreencutTour|ModeJeu)\.dc\.html/.test(href); const land = /Paysage/.test(href);
// V56 : sur le site, depuis une page desktop (Prototype.html, GreencutTour.html…), les liens mènent aux pages desktop
const siteDesk = !dc && /\/(Prototype|GreencutTour|ModeJeu|Parcours|Connexion|Ouverture)\.html/.test(href);
const SD = { 'TableMobile.html': 'Prototype.html', 'ModeJeuMobile.html': 'ModeJeu.html', 'ParcoursMobile.html': 'Parcours.html', 'GreencutTourMobile.html': 'GreencutTour.html' };
const pick = (d, m, l, site) => (dc ? (desk ? d : (land ? l : m)) : (siteDesk ? (SD[site] || site) : site));
if (kind === 'game' || kind === 'classic') { return pick('Prototype.dc.html', 'TableMobile.dc.html', 'TableMobilePaysage.dc.html', kind === 'classic' ? 'ChoixParcoursMobile.html' : 'TableMobile.html'); }
if (kind === 'mode') { return pick('ModeJeu.dc.html', 'ModeJeuMobile.dc.html', 'ModeJeuMobilePaysage.dc.html', 'ModeJeuMobile.html'); }
if (kind === 'learn') { return pick('Parcours.dc.html', 'ParcoursMobile.dc.html', 'ParcoursMobilePaysage.dc.html', 'ParcoursMobile.html'); }
if (kind === 'profil' || kind === 'card' || kind === 'board') { const from = /GreencutTour/.test(href) ? 'tour' : (/ModeJeu/.test(href) ? 'mode' : ''); return pick('Prototype.dc.html', 'TableMobile.dc.html', 'TableMobilePaysage.dc.html', 'TableMobile.html') + '?go=' + kind + (from ? '&from=' + from : ''); }
return pick('GreencutTour.dc.html', 'GreencutTourMobile.dc.html', 'GreencutTourMobilePaysage.dc.html', 'GreencutTourMobile.html');
}
tourHook(p, n) {
if (!n) { return; }
if (typeof document !== 'undefined' && (n.tour || WALLET.saved()) && p && (n.pts !== p.pts || n.fees !== p.fees) && typeof n.pts === 'number') { WALLET.set({ pts: n.pts, fees: n.fees }); }
if (!n.tour || n.tourDone || !n.h || n.h.hole < 18 || n.h.phase !== 'done' || !n.strokes || !n.strokes[0] || n.strokes[0].length < 18) { return; }
const key = (n.games || 1) + ':' + (n.tourAt || 0); if (this._tourKey === key) { return; } this._tourKey = key;
const T = TOUR.load(); const bn = this.bonus(this.net(n))[0];
const c = TOUR.depositCard(T, { strokes: n.strokes[0], bonus: bn, nP: n.nP, chips: n.stacks[0] });
const best = TOUR.bestCard(T, T.phase);
const card = c ? { round: c.r, net: c.net, brut: c.brut, bonus: c.bonus, kept: best === c || (best && best.net === c.net && best.dep === c.dep), best: best ? best.net : null, at: TOUR.hhmm(c.dep) } : null;
this.setState({ tourDone: true, tourCard: card });
}
tourPatch(v) {
v = this.tourPatch0(v); if (v && this._abdMsg) { if (typeof v.gateIntro === 'string') { v.gateIntro = this._abdMsg + ' ' + v.gateIntro; } if (typeof v.tableMsg === 'string') { v.tableMsg = this._abdMsg; } } return v;
}
tourPatch0(v) {
v = this.gamePatch(v);
if (v && s0q(this.state)) { const k = this.state; v.gateIntro = 'Vous avez quitté la table : la mise de départ (10 000 pts) est perdue ; ' + (k.refundAmt ? 'vos ' + this.fmt(k.refundAmt) + ' pts de jetons restants sont revenus sur votre solde.' : 'il ne vous restait aucun jeton à rendre.'); }
const s = this.state; if (v) { v.modeCls = s && s.tour ? 'tourmode' : 'classicmode'; v.modeHref = this.tourLink('mode'); v.classicHref = this.tourLink('classic'); v.lowFunds = !!(s && s.gate && s.pts < 10000 && (s.fees < 100 || s.expired)); v.lowLbl = 'Recharger le solde'; }
if (!s || (!s.tour && !s.fresh)) { if (v) { v.tourOn = false; v.tourHref = this.tourLink('tour'); v.tourBackLbl = 'Greencut Tour'; } return v; }
const U = TOUR; const T = U.load(); const cp = U.canPlay(T); const f = (n) => this.fmt(n);
v.tourHref = this.tourLink('tour'); v.tourOn = !!s.tour; v.tourBackLbl = '← Retour au Greencut Tour'; v.tourGateLbl = '← Greencut Tour';
if (!s.tour) { if (s.fresh && v.gateTitle !== undefined && !s.quit) { v.gateTitle = 'Nouvelle partie classique'; v.gateIntro = 'Mise de départ : 10 000 pts, prise sur votre solde avec votre accord ; vos jetons restants reviennent sur votre solde à la fin.'; } if (v.lowFunds && v.gateIntro !== undefined) { v.gateIntro += ' Solde insuffisant pour la mise (moins de 10 000 pts et moins de 100 fees) : pour continuer le test, rechargez le solde de démonstration.'; } return v; }
const c = s.tourCard; const st = s.pts >= 10000 ? 'Je confirme : 10 000 pts' : 'Convertir 100 fees et jouer';
if (s.gate) {
  if (!cp.ok) { v.gateTitle = 'Carte de tournoi impossible'; v.gateIntro = cp.why; v.gateTxt = ''; v.startCls = 'off'; v.startGame = () => {}; v.startLabel = 'Tour fermé'; }
  else if (s.tourDone && c) { v.gateTitle = 'Carte déposée au tournoi'; v.gateIntro = 'Tour ' + c.round + ' · net ' + U.signed(c.net) + ' (brut ' + U.signed(c.brut) + ', bonus de jetons ' + U.signed(c.bonus) + '), déposée à ' + c.at + '. ' + (c.kept ? 'C’est votre carte retenue du jour.' : 'Votre meilleure carte du jour reste à ' + U.signed(c.best) + '.') + ' Vos jetons ont été rendus à votre solde. Vous pouvez rejouer une carte (nouvelle mise de 10 000 pts) ou revenir au Greencut Tour.'; v.startLabel = st; }
  else if (s.quit) { v.gateTitle = 'Carte abandonnée'; v.gateIntro = (s.abdReason || 'Vous avez quitté la table') + ' : cette carte ne compte pas et sa mise de 10 000 pts est perdue ; vos jetons sont revenus sur votre solde. Vous pouvez rejouer une carte tant que le tour est ouvert.'; v.startLabel = st; }
  else { v.gateTitle = 'Mode tournoi · carte du tour ' + T.phase; v.gateIntro = TOUR_CFG.name + ' · parcours Majlis, Par 72 · ' + TOUR_CFG.days[T.phase - 1] + '. Votre solde : ' + f(s.pts) + ' pts. Seule votre meilleure carte du jour (au net) compte.'; v.startLabel = st; }
  if (cp.ok && typeof v.startGame === 'function') { const go = v.startGame; v.startGame = () => { const k = this.state; const can = k.pts >= 10000 || (!k.expired && k.fees >= 100); const n = k.nP; go(); if (can) { const T2 = TOUR.load(); TOUR.dropCard(T2); TOUR.startCard(T2, n); } }; }
}
if (v.finalTxt !== undefined && s.tourDone && c) { v.finalTxt = (v.finalTxt ? v.finalTxt + ' ' : '') + 'Carte déposée au tournoi : net ' + U.signed(c.net) + (c.kept ? ' (retenue).' : ' (votre meilleure du jour reste ' + U.signed(c.best) + ').'); }
if (Array.isArray(v.nOpts)) { v.nOpts = v.nOpts.map((o) => Object.assign({}, o, { pick: () => { if (!this.state.gate) { return; } const k = this.state; this.setState(this.initial({ nP: Number(o.n), tour: true, course: TOUR_CFG.course, gate: true, fresh: true, pts: k.pts, fees: k.fees, hist: k.hist, soundOn: k.soundOn, sndVol: k.sndVol, av: k.av, pseudo: k.pseudo, pseudoDraft: k.pseudoDraft, club: k.club, ball: k.ball, level: k.level, help: k.help, tourDone: k.tourDone, tourCard: k.tourCard, sheet: '' })); } })); }
if (v.lowFunds && v.gateIntro) { v.gateIntro += ' Solde insuffisant pour la mise : pour continuer le test, rechargez le solde de démonstration.'; }
v.tourChip = 'GREENCUT TOUR · TOUR ' + Math.min(T.phase, 4); v.tourRound = String(Math.min(T.phase, 4));
return v;
}
settle() {
const s = this.state; const fin = s.stacks[0]; const pts = s.pts + fin;
const hist = [ { a: 'Partie ' + s.games + ' : retour des jetons', t: 'À l’instant', d: '+' + this.fmt(fin) + ' pts', e: '', cls: 'hp' } ].concat(s.hist);
this.setState({ gate: true, pts, hist });
}
newGame(pts, hist) {
const s = this.state; const g = (s.games || 1) + 1;
const keep = { tour: !!s.tour, tourAt: s.tour ? Date.now() : 0, course: s.course, nP: s.nP, soundOn: s.soundOn, sndVol: s.sndVol, av: s.av, pseudo: s.pseudo, pseudoDraft: s.pseudoDraft, club: s.club, ball: s.ball, golf: s.golf, league: s.league, level: s.level, help: s.help, expired: s.expired, fees: s.fees, dir: s.dir, amt: s.amt, games: g, gate: false, reload: false, screen: 'table', pts: pts - 10000, hist: [ { a: 'Partie ' + g + ' : mise de départ', t: 'À l’instant', d: '−10 000 pts', e: '', cls: 'hf' } ].concat(hist) };
this.setState(this.initial(keep));
}
bonus(stacks) {
const table = [-4, -2, -1, 2, 2, 2, 2, 2]; return stacks.map((v) => table[stacks.filter((x) => x > v).length]);
}
board(mode) {
const s = this.state; const P = this.pars(); const finished = s.strokes[0].length >= 18; const bn = this.bonus(this.net(s));
const nm = this.displayName(); const rows = [];
const names = [nm].concat(this.oppNames()); const brands = [s.club.toUpperCase()].concat(this.oppBrands());
for (let i = 0; i < NP; i++) {
const played = s.strokes[i].length; let brut = 0; let sum = 0;
for (let k = 0; k < played; k++) { const sv = (typeof s.strokes[i][k] === 'number' && isFinite(s.strokes[i][k])) ? s.strokes[i][k] : P[k] + UNPLAYED; brut += sv; sum += sv - P[k]; }
const net = sum + (played > 0 ? bn[i] : 0);
const lastRel = played ? ((isFinite(s.strokes[i][played - 1]) ? s.strokes[i][played - 1] : P[played - 1] + UNPLAYED) - P[played - 1]) : null;
let back = 0; let backAbs = 0; for (let k = 9; k < played; k++) { const sv = isFinite(s.strokes[i][k]) ? s.strokes[i][k] : P[k] + UNPLAYED; back += sv - P[k]; backAbs += sv; }
rows.push({ i, bonus0: played > 0, name: names[i], brand: brands[i], played, brut, sum, net, bonus: bn[i], last: lastRel, stack: s.stacks[i], back, backAbs });
}
const sb = (mode || s.sortBy) === 'brut' ? 'sum' : 'net'; const ob = sb === 'sum' ? 'back' : 'sum'; const tb3 = sb === 'sum' ? 'net' : 'back';
rows.sort((a, b) => (a[sb] - b[sb]) || (a[ob] - b[ob]) || (a[tb3] - b[tb3]) || (b.stack - a.stack));
const sameKey = (a, b) => a[sb] === b[sb] && a[ob] === b[ob] && a[tb3] === b[tb3];
rows.forEach((r) => { const same = rows.filter((x) => sameKey(x, r)); r.pos = (same.length > 1 ? 'T' : '') + (rows.indexOf(same[0]) + 1); });
rows.forEach((r, n) => { r.tb = ''; const g = rows.filter((x) => x !== r && x[sb] === r[sb]); if (!g.length || r.played === 0) { return; } const o = g.indexOf(rows[n - 1]) >= 0 ? rows[n - 1] : g[0];
if (sb === 'net') { if (o.sum !== r.sum) { r.tb = 'départagé au brut'; } else if (o.back !== r.back) { r.tb = 'départagé au retour : ' + r.backAbs + ' contre ' + o.backAbs; } else { r.tb = 'égalité parfaite'; } }
else if (o.back !== r.back) { r.tb = 'départagé au retour : ' + r.backAbs + ' contre ' + o.backAbs; } else if (o.net !== r.net) { r.tb = 'départagé au net'; } else { r.tb = 'égalité parfaite'; } });
return { rows, finished };
}
displayName() { return (this.state.pseudo || '').trim() || 'Joueur'; }
cellCls(rel) { return rel <= -2 ? 'e' : rel === -1 ? 'b' : rel === 1 ? 'g' : rel >= 2 ? 'd' : ''; }
maxAmt() { const s = this.state; return s.dir === 'f2p' ? Math.floor(s.fees / 100) * 100 : Math.floor(s.pts / 10000) * 100; }
holeMap(hole) {
const par = this.pars()[hole - 1];
const DA = [
[0.5, [[0.6, 1]], ['fl', 'r'], '', 'Léger dogleg à droite, fairway en montée, bunker à droite du fairway.'],
[-0.8, [[0.5, 1]], ['r', 'l'], '', 'Dogleg à gauche, trou très descendant : le plus long du parcours.'],
[0, [[0.6, -1], [0.6, 1], [0.45, 1]], ['fr', 'l', 'r'], '', 'Par 4 très court : green étroit, bunkers nombreux autour du fairway et du green.'],
[0, [], ['fl', 'fr'], '', 'Par 3 le plus long : green surélevé, gros bunker devant, vent difficile à lire.'],
[-0.7, [[0.5, -1]], ['fl', 'r'], '', 'Dogleg à gauche en montée, bunker de fairway dans le coude.'],
[0, [], ['fl', 'r'], '', 'Par 3 en descente : bunker devant à gauche, green qui penche vers la droite.'],
[0, [], ['fl', 'fr', 'l', 'r', 'b'], '', 'Fairway étroit entre les pins, green surélevé gardé par cinq bunkers.'],
[0.7, [], ['fr', 'l'], '', 'Dogleg à droite, second coup en montée et sans visibilité vers un green étroit.'],
[-0.3, [], ['fl', 'l'], '', 'Départ en descente ; deux bunkers à gauche du green, qui penche de l’arrière vers l’avant.'],
[-0.9, [[0.5, 1]], ['l', 'fr'], '', 'Dogleg à gauche très descendant, green surélevé : manquer à droite coûte cher.'],
[-0.2, [], ['r'], 'left', 'Début d’Amen Corner : approche en descente, étang à gauche du green.'],
[0, [], ['f', 'bl', 'br'], 'front', 'Par 3 mythique : Rae’s Creek devant le green, très étroit. Trop court = dans l’eau.'],
[-0.8, [], ['bl', 'b', 'br'], 'front', 'Dogleg à gauche : au 2e coup, il faut passer Rae’s Creek devant le green.'],
[-0.2, [], [], '', 'Le seul trou sans bunker ni eau : green à fausse avant, il penche de gauche à droite.'],
[0.2, [], ['b', 'r'], 'frontpond', 'Étang devant le green : tenter le green en 2 ou se placer avant l’eau.'],
[0, [], ['r', 'b'], 'left', 'Par 3 au-dessus d’un étang côté gauche ; green à deux niveaux.'],
[0.1, [], ['fl', 'fr'], '', 'Bunkers devant le green, qui a une forme de soucoupe.'],
[0.6, [[0.5, -1]], ['fl', 'fr'], '', 'Dogleg à droite, fairway qui monte vers le green ; bunker de fairway à gauche.']
];
const D = (this.crs().D || DA)[hole - 1];
const d = D[0]; const sh = [];
const P0 = [150 - d * 20, 272]; const P1 = [150 - d * 30, 118]; const P2 = [150 + d * 70, 52];
const at = (t) => [(1 - t) * (1 - t) * P0[0] + 2 * t * (1 - t) * P1[0] + t * t * P2[0], (1 - t) * (1 - t) * P0[1] + 2 * t * (1 - t) * P1[1] + t * t * P2[1]];
const put = (cx, cy, w, h, c, extra) => { sh.push(Object.assign({ x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h, c, rad: '50%', sh: 'none', r: 0 }, extra || {})); };
if (par > 3) { const fw = par === 5 ? 46 : 42; for (let k = 0; k <= 30; k++) { const p = at(k / 30); put(p[0], p[1], fw, fw, '#3aa866'); } }
else { for (let k = 0; k <= 12; k++) { const p = at(k / 12); put(p[0], p[1], 12, 12, '#2f8a55'); } }
const g = P2;
if (D[3] === 'front') { put(g[0], g[1] + 38, 150, 18, '#3aa7ff'); }
if (D[3] === 'frontpond') { put(g[0], g[1] + 44, 120, 30, '#3aa7ff'); }
if (D[3] === 'left') { put(g[0] - 62, g[1] + 8, 40, 64, '#3aa7ff'); }
const OFF = { fl: [-34, 20], fr: [34, 20], l: [-44, -2], r: [44, -2], bl: [-30, -26], br: [30, -26], b: [0, -32], f: [0, 28] };
D[2].forEach((k) => { put(g[0] + OFF[k][0], g[1] + OFF[k][1], 32, 20, '#f1d9a0'); });
D[1].forEach((b) => { const p = at(b[0]); put(p[0] + b[1] * 36, p[1], 28, 20, '#f1d9a0'); });
put(g[0], g[1], 66, 46, '#8af0b2', { sh: '0 0 0 2px #c9ffe0' });
put(g[0] + 1, g[1] - 14, 3, 26, '#ffffff', { rad: '1px' });
put(g[0] + 8, g[1] - 24, 14, 8, '#ff4fa3', { rad: '1px' });
put(P0[0], P0[1] + 8, 34, 12, '#b9acd6', { rad: '3px' });
const need = par === 3 ? '1 coup' : (par === 4 ? '2 coups' : '3 coups');
return { shapes: sh, note: D[4], tip: 'Par ' + par + ' : ' + need + ' pour atteindre le green, puis le putt.' };
}
}
/* ---------- GREENCUT TOUR : mode Tournoi (version solo de test, données locales) ----------
   Règles : claude/tournoi_greencut_tour.md (plan de test validé le 24/11/2026). Tout reste sur l'appareil (points de démonstration). */
const TOUR_CFG = {
  id: 'emirates-2027', name: 'Greencut Emirates Golf Club', course: 'majlis', place: 'Dubaï · parcours Majlis', par: 72,
  partner: 'Callaway', partnerUrl: 'https://eu.callawaygolf.com/', dates: '21–24 janvier 2027',
  days: ['Jeudi 21 janvier', 'Vendredi 22 janvier', 'Samedi 23 janvier', 'Dimanche 24 janvier'], dayShort: ['Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
  stake: 10000, purse: 2000000, cut: 50, base: 10000, field: 311, seed: 20270121, finale: false,
  lots: [[1, 1, 'Driver + fitting complet + sac Tour'], [2, 2, 'Série de fers avec fitting'], [3, 3, 'Putter Odyssey'], [4, 10, '3 douzaines de balles Chrome Tour + casquette'], [11, 50, '1 douzaine de balles Chrome Tour']]
};
const TOUR_Q = [-15, -3, 0, 2, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 20, 22, 25, 28, 34]; // brut / par sur 2 000 cartes simulées par le moteur (V37)
// Profil du joueur (V52) : avatar, marques, golf de rattachement et ligue, gardés sur l'appareil
const PROFILE_KEY = 'greencut.profil';
const PROFILE_DEF = { av: 0, club: 'Titleist', ball: 'Pro V1', golf: 0, league: 0 };
const GOLF_NAMES = ['Golf National', 'UGOLF Rosny sous Bois', 'Real Club Sevilla Golf'];
function profileGet() { const d = Object.assign({}, PROFILE_DEF); try { const q = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); if (q && typeof q === 'object') {
  if (Number.isInteger(q.av) && q.av >= 0 && q.av < 50) { d.av = q.av; } if (typeof q.club === 'string' && q.club.length < 40) { d.club = q.club; } if (typeof q.ball === 'string' && q.ball.length < 40) { d.ball = q.ball; }
  if (Number.isInteger(q.golf) && q.golf >= 0 && q.golf < GOLF_NAMES.length) { d.golf = q.golf; } if (Number.isInteger(q.league) && q.league >= 0 && q.league < 3) { d.league = q.league; } } } catch (x) { /* profil par défaut */ } return d; }
function profileSave(k) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ av: k.av, club: k.club, ball: k.ball, golf: k.golf, league: k.league })); } catch (x) { /* stockage indisponible */ } }
// Trous non joués (V54, décision de Cédric du 28/11/2026) : joueur éliminé, abandon, « Me coucher pour le reste de la partie » -> par + 2
// (un trou joué jusqu'au bout sans combinaison reste à par + 4, couché : combinaison + 1, sinon par + 4)
const UNPLAYED = 2;
const s0q = (k) => !!(k && !k.tour && k.quit && k.refunded);
const IDLE_MS = 60000; const TOUR_KEY = 'greencut.tour', WALLET_KEY = 'greencut.wallet', GAME_KEY = 'greencut.partie', ABD_KEY = 'greencut.abandon';
const tourRng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const tourStore = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) { /* stockage indisponible */ } },
  del(k) { try { localStorage.removeItem(k); } catch (x) { /* stockage indisponible */ } }
};
// Solde de démonstration : 18 400 pts (les 8 400 pts affichés au départ d'une partie + les 10 000 pts de sa mise, pas encore engagée) et 1 250 fees.
// v2 (V39) : un solde enregistré en V38 (créé à 8 400 pts, sans la mise de départ) reçoit une seule fois les 10 000 pts manquants.
const WALLET_DEMO = { pts: 18400, fees: 1250 };
const WALLET = {
  get() { const w = tourStore.get(WALLET_KEY); if (!(w && typeof w.pts === 'number' && typeof w.fees === 'number')) { return { pts: WALLET_DEMO.pts, fees: WALLET_DEMO.fees }; } if (w.v !== 2) { w.pts += 10000; w.v = 2; tourStore.set(WALLET_KEY, w); } return { pts: w.pts, fees: w.fees }; },
  set(w) { tourStore.set(WALLET_KEY, { v: 2, pts: Math.max(0, Math.round(w.pts)), fees: Math.max(0, Math.round(w.fees)) }); },
  saved() { return !!tourStore.get(WALLET_KEY); },
  reset() { this.set(WALLET_DEMO); return this.get(); },
  demo: WALLET_DEMO,
  low(w) { w = w || this.get(); return w.pts < 10000 && w.fees < 100; }
};
const TOUR = {
  cfg: TOUR_CFG,
  signed(n) { return n === 0 ? 'E' : (n > 0 ? '+' + n : '−' + Math.abs(n)); },
  fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); },
  hhmm(m) { const t = Math.floor(m); return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); },
  // Barème : N places, M pts de base chacune, reste B = X − N × M partagé en 1/r ; arrondi à 100 pts vers le bas ; reliquat au 1er
  payoutTable(X, N, M) {
    N = N || 50; M = M === undefined ? 10000 : M; const B = X - N * M; let S = 0; for (let r = 1; r <= N; r++) { S += 1 / r; }
    const p = []; for (let r = 1; r <= N; r++) { p.push(M + Math.floor(B * (1 / r) / S / 100) * 100); }
    p[0] += X - p.reduce((a, b) => a + b, 0); return p;
  },
  // groups : liste ordonnée de groupes d'ex aequo (tableaux d'identifiants) ; le 1er groupe est toujours seul (victoire départagée)
  distribute(groups, X, N) {
    N = N || 50; const tab = this.payoutTable(X, N); const pay = {}; let place = 0; let extra = 0; const ties = [];
    groups.forEach((g) => {
      if (place >= N) { g.forEach((id) => { pay[id] = 0; }); place += g.length; return; }
      const slots = tab.slice(place, Math.min(N, place + g.length)); const sum = slots.reduce((a, b) => a + b, 0);
      const share = Math.floor(sum / g.length / 100) * 100; extra += sum - share * g.length;
      if (g.length > 1) { ties.push({ place: place + 1, n: g.length, share }); }
      g.forEach((id) => { pay[id] = share; }); // ex aequo à cheval sur la 50e place : ils se partagent les montants des places 50 et moins
      place += g.length;
    });
    const first = groups.length ? groups[0][0] : null; if (first !== null && extra) { pay[first] += extra; }
    const paid = Object.keys(pay).reduce((a, k) => a + pay[k], 0);
    return { pay, paid, unpaid: X - paid, table: tab, ties };
  },
  lotFor(pos) { const l = TOUR_CFG.lots.find((x) => pos >= x[0] && pos <= x[1]); return l ? l[2] : ''; },
  // Champ simulé : 311 joueurs fictifs, graine fixe, scores nets plausibles (bonus −4 / −2 / −1 / +2 selon la table)
  field(seed) {
    const rnd = tourRng(seed || TOUR_CFG.seed); const A = ['Fairway', 'Birdie', 'Bogey', 'Eagle', 'Links', 'Wedge', 'Putt', 'Chip', 'Draw', 'Fade', 'Bunker', 'Albatros', 'Green', 'Flop', 'Caddie', 'Divot', 'Slice', 'Ace', 'Par', 'Iron'];
    const B = ['_fox', 'Queen', 'Max', 'Lady', 'Pro', 'Boss', 'Kid', '_jo', 'man', 'Flyer', '_pp', '42', '_77', 'Sam', 'Lou'];
    const G = ['Golf des Pins', 'Golf du Château', 'Golf des Étangs', 'Golf des Dunes', 'Golf du Lac', 'Golf de la Vallée', 'Golf du Domaine', 'Golf de la Forêt'];
    const q = (u) => { const x = u * 20; const i = Math.min(19, Math.floor(x)); return TOUR_Q[i] + (TOUR_Q[i + 1] - TOUR_Q[i]) * (x - i); };
    const seen = {}; const out = [];
    for (let n = 0; n < TOUR_CFG.field; n++) {
      let nm = ''; for (let t = 0; t < 20 && (!nm || seen[nm]); t++) { nm = A[Math.floor(rnd() * A.length)] + B[Math.floor(rnd() * B.length)] + (t > 2 || rnd() < 0.35 ? '_' + (10 + Math.floor(rnd() * 90)) : ''); }
      seen[nm] = 1; const skill = (rnd() + rnd() + rnd() - 1.5) * 4; const golf = G[Math.floor(rnd() * G.length)];
      let abd = 0; [0.015, 0.02, 0.008, 0.008].forEach((p, r) => { if (!abd && rnd() < p) { abd = r + 1; } });
      const rounds = [];
      for (let r = 0; r < 4; r++) {
        const u0 = rnd(); const k = u0 < 0.45 ? 1 : (u0 < 0.75 ? 2 : (u0 < 0.9 ? 3 : 4)); let best = null;
        for (let c = 0; c < k; c++) {
          const u = rnd(); const brut = Math.max(-18, Math.round(q(u) + skill)); const nP = 4 + Math.floor(rnd() * 3);
          const pos = Math.floor(Math.max(0, Math.min(0.999, u + (rnd() - 0.5) * 0.5)) * nP); const bonus = [-4, -2, -1, 2, 2, 2][pos];
          const card = { net: brut + bonus, brut, bonus, b9: Math.max(27, 37 + Math.round(brut * 0.5 + (rnd() - 0.5) * 4)), dep: 420 + rnd() * 990 + n / 1000 };
          if (!best || card.net < best.net) { best = card; }
        }
        rounds.push(abd && r + 1 >= abd ? null : best);
      }
      out.push({ id: 'f' + n, name: nm, golf, abd, rounds });
    }
    return out;
  },
  heroName() { try { return localStorage.getItem('greencut.pseudo') || 'MaxFairway'; } catch (x) { return 'MaxFairway'; } },
  create(o) { o = o || {}; return { v: 1, id: TOUR_CFG.id, phase: 1, seed: o.seed || TOUR_CFG.seed, hero: { name: o.name || this.heroName(), golf: o.golf || GOLF_NAMES[profileGet().golf], cards: { 1: [], 2: [], 3: [], 4: [] }, abd: 0 }, cut: null, results: null, log: [] }; },
  load() { const T = tourStore.get(TOUR_KEY); if (T && T.v === 1 && T.id === TOUR_CFG.id) { T.hero.name = this.heroName(); T.hero.golf = GOLF_NAMES[profileGet().golf]; return T; } return this.create(); },
  save(T) { tourStore.set(TOUR_KEY, T); return T; },
  reset() { tourStore.del(TOUR_KEY); return this.save(this.create()); },
  _field: null, _seed: 0,
  fieldOf(T) { if (!this._field || this._seed !== T.seed) { this._field = this.field(T.seed); this._seed = T.seed; } return this._field; },
  // carte retenue du jour = meilleure carte au net ; à net égal, la première déposée
  bestCard(T, r) { const cs = (T.hero.cards[r] || []).filter((c) => c.done); let b = null; cs.forEach((c) => { if (!b || c.net < b.net) { b = c; } }); return b; },
  heroRounds(T) { const out = []; for (let r = 1; r <= 4; r++) { out.push(T.hero.abd && r >= T.hero.abd ? null : this.bestCard(T, r)); } return out; },
  players(T) { return [{ id: 'me', name: T.hero.name, golf: T.hero.golf, me: true, abd: T.hero.abd, rounds: this.heroRounds(T) }].concat(this.fieldOf(T)); },
  sumR(p, a, b, f) { let s = 0; for (let r = a; r <= b; r++) { s += p.rounds[r - 1][f]; } return s; },
  playedAll(p, n) { for (let r = 1; r <= n; r++) { if (!p.rounds[r - 1]) { return false; } } return true; },
  // clé de départage après n tours : net cumulé, brut cumulé, net du dernier tour, 9 derniers trous du dernier tour, heure de dépôt (la plus tôt)
  key(p, n) { const L = p.rounds[n - 1]; return [this.sumR(p, 1, n, 'net'), this.sumR(p, 1, n, 'brut'), L.net, L.b9, L.dep]; },
  cmp(a, b) { for (let k = 0; k < a.length; k++) { if (a[k] !== b[k]) { return a[k] - b[k]; } } return 0; },
  order(list, n) { return list.slice().sort((x, y) => this.cmp(this.key(x, n), this.key(y, n)) || (x.id < y.id ? -1 : 1)); },
  computeCut(T) {
    const el = this.players(T).filter((p) => this.playedAll(p, 2)); const ord = this.order(el, 2); const q = ord.slice(0, TOUR_CFG.finale ? ord.length : TOUR_CFG.cut);
    const last = q[q.length - 1]; const next = ord[q.length];
    return { ids: q.map((p) => p.id), n: q.length, eligible: ord.length, line: last ? this.sumR(last, 1, 2, 'net') : null, nextLine: next ? this.sumR(next, 1, 2, 'net') : null, tieBroken: !!(last && next && this.sumR(last, 1, 2, 'net') === this.sumR(next, 1, 2, 'net')) };
  },
  qualified(T, id) { return !T.cut || T.cut.ids.indexOf(id) >= 0; },
  finalGroups(T) {
    const fin = this.players(T).filter((p) => this.qualified(T, p.id) && this.playedAll(p, 4)); const ord = this.order(fin, 4); const groups = [];
    ord.forEach((p, i) => { const t = this.sumR(p, 1, 4, 'net'); const g = groups[groups.length - 1]; if (i > 1 && g && g.t === t) { g.ids.push(p.id); } else { groups.push({ t, ids: [p.id] }); } });
    return { ord, groups };
  },
  computeResults(T) {
    const { ord, groups } = this.finalGroups(T); const d = this.distribute(groups.map((g) => g.ids), TOUR_CFG.purse); const pos = {}; let k = 1;
    groups.forEach((g) => { g.ids.forEach((id) => { pos[id] = { pos: k, tie: g.ids.length > 1 }; }); k += g.ids.length; });
    const me = pos.me ? pos.me.pos : 0;
    return { finishers: ord.length, paidCount: Object.keys(d.pay).filter((x) => d.pay[x] > 0).length, paid: d.paid, unpaid: d.unpaid, winner: ord[0] ? ord[0].name : '', heroPos: me, heroTie: pos.me ? pos.me.tie : false, heroPay: d.pay.me || 0, heroLot: me ? this.lotFor(me) : '', pay: d.pay, pos };
  },
  canPlay(T) {
    const p = T.phase; if (p > 4) { return { ok: false, why: 'Le tournoi est terminé : résultats publiés.' }; }
    if (T.hero.abd) { return { ok: false, why: 'Abandon (ABD) au tour ' + T.hero.abd + ' : vous ne pouvez plus jouer les tours suivants.' }; }
    if (p >= 3 && !this.qualified(T, 'me')) { return { ok: false, why: 'Vous n’avez pas passé le cut : le tournoi s’arrête pour vous après le tour 2.' }; }
    return { ok: true, why: '', round: p };
  },
  // Début d'une carte : la mise de 10 000 pts est engagée (prise sur le solde, accord du joueur demandé par la table)
  startCard(T, nP) { const c = this.canPlay(T); if (!c.ok) { return null; } const card = { r: T.phase, n: (T.hero.cards[T.phase] || []).length + 1, nP: Math.max(4, Math.min(6, nP || 6)), started: Date.now(), done: false }; T.hero.cards[T.phase].push(card); this.save(T); return card; },
  // Dépôt de la carte terminée : 18 trous, bonus de jetons de la table, heure de dépôt (minutes depuis minuit)
  depositCard(T, o) {
    const r = T.phase; const cs = T.hero.cards[r] || []; let card = cs.filter((c) => !c.done).pop(); if (!card) { const c = this.canPlay(T); if (!c.ok) { return null; } card = { r, n: cs.length + 1, nP: o.nP || 6 }; cs.push(card); T.hero.cards[r] = cs; }
    const st = o.strokes.slice(0, 18); const P = COURSE_DATA[TOUR_CFG.course].pars; const sum = st.reduce((a, b) => a + b, 0);
    const now = new Date(); const dep = typeof o.dep === 'number' ? o.dep : now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    Object.assign(card, { done: true, strokes: st, brut: sum - 72, bonus: o.bonus, net: sum - 72 + o.bonus, b9: st.slice(9).reduce((a, b) => a + b, 0), out: st.slice(0, 9).reduce((a, b) => a + b, 0), dep, chips: o.chips || 0, nP: card.nP || o.nP || 6, pars: P });
    const best = this.bestCard(T, r); card.kept = best === card; this.save(T); return card;
  },
  // Carte commencée puis abandonnée (« Quitter la table ») : elle ne compte pas ; la mise est perdue comme en partie normale
  dropCard(T) { const cs = T.hero.cards[T.phase] || []; T.hero.cards[T.phase] = cs.filter((c) => c.done); this.save(T); return T; },
  // Horloge de test : jeudi → vendredi → (cut publié) samedi → dimanche → résultats
  advance(T) {
    const p = T.phase; const msg = []; if (p > 4) { return { T, msg: ['Le tournoi est terminé. Utilisez « Recommencer le tournoi ».'], credit: 0 }; }
    T.hero.cards[p] = (T.hero.cards[p] || []).filter((c) => c.done);
    const inPlay = !T.hero.abd && (p <= 2 || this.qualified(T, 'me'));
    if (inPlay && !this.bestCard(T, p)) { T.hero.abd = p; msg.push('Aucune carte déposée au tour ' + p + ' : abandon (ABD). Mise de départ non engagée, vous ne pouvez plus jouer les tours suivants.'); }
    let credit = 0;
    if (p === 2) { T.cut = this.computeCut(T); const me = this.qualified(T, 'me') && !T.hero.abd; msg.push('Cut publié : ' + T.cut.n + ' qualifiés à ' + this.signed(T.cut.line) + (T.cut.tieBroken ? ' (égalité sur la ligne départagée)' : '') + '.' + (T.hero.abd ? '' : (me ? ' Vous êtes qualifié(e) pour le week-end !' : ' Vous n’avez pas passé le cut.'))); }
    if (p === 4) {
      const R = this.computeResults(T); T.results = { heroPos: R.heroPos, heroTie: R.heroTie, heroPay: R.heroPay, heroLot: R.heroLot, paid: R.paid, unpaid: R.unpaid, paidCount: R.paidCount, finishers: R.finishers, winner: R.winner, credited: false };
      if (R.heroPay > 0) { const w = WALLET.get(); w.pts += R.heroPay; WALLET.set(w); credit = R.heroPay; T.results.credited = true; msg.push('Résultats : vous terminez ' + (R.heroTie ? 'T' : '') + R.heroPos + (R.heroPos === 1 ? 'er' : 'e') + '. ' + this.fmt(R.heroPay) + ' pts (' + this.fmt(R.heroPay / 100) + ' fees) crédités sur votre solde.'); }
      else { msg.push('Résultats publiés : vainqueur ' + R.winner + '.' + (R.heroPos ? ' Vous terminez ' + R.heroPos + 'e.' : '')); }
    }
    T.phase = p + 1; if (!msg.length) { msg.push(TOUR_CFG.days[T.phase - 1] + ' : tour ' + T.phase + ' ouvert.'); } T.log = (T.log || []).concat(msg); this.save(T);
    return { T, msg, credit };
  },
  phaseLabel(T) { const p = T.phase; if (p > 4) { return 'Résultats · lundi 25 janvier'; } return TOUR_CFG.days[p - 1] + ' · tour ' + p + (p === 3 ? ' (cut publié)' : ''); },
  nextLabel(T) { return ['', 'Passer au vendredi (tour 2)', 'Publier le cut et passer au samedi', 'Passer au dimanche (tour 4)', 'Clore le tournoi et publier les résultats', ''][T.phase] || ''; },
  // Classement : vue d'un tour (1 à 4), net (officiel) ou brut ; joueurs en abandon en bas, sous la ligne « Abandons »
  standings(T, o) {
    o = o || {}; const P = Math.min(T.phase, 4); const view = Math.max(1, Math.min(o.round || P, P)); const mode = o.mode === 'brut' ? 'brut' : 'net'; const closed = T.phase > view;
    const all = this.players(T); const isAbd = (p) => !!p.abd && p.abd <= view && p.abd < T.phase && (p.abd <= 2 || this.qualified(T, p.id));
    const cutOn = !!T.cut && view >= 3; const rows = []; const tot = (p, n, f) => { let s = 0; let k = 0; for (let r = 1; r <= n; r++) { if (p.rounds[r - 1]) { s += p.rounds[r - 1][f]; k++; } } return { s, k }; };
    const sortKey = (p, n) => { const a = tot(p, n, mode); const b = tot(p, n, mode === 'net' ? 'brut' : 'net'); const L = p.rounds[Math.min(n, a.k) - 1] || { net: 0, b9: 99, dep: 9999 }; return [a.s, b.s, L[mode] || 0, L.b9, L.dep]; };
    const rank = (list, n) => list.slice().sort((x, y) => this.cmp(sortKey(x, n), sortKey(y, n)) || (x.id < y.id ? -1 : 1));
    const prevPos = {}; if (view >= 2) { rank(all.filter((p) => !(p.abd && p.abd <= view - 1) && this.playedAll(p, view - 1) && (!(T.cut && view - 1 >= 3) || this.qualified(T, p.id))), view - 1).forEach((p, i) => { prevPos[p.id] = i + 1; }); }
    const live = all.filter((p) => !isAbd(p)); const inQ = cutOn ? live.filter((p) => this.qualified(T, p.id)) : live; const outQ = cutOn ? live.filter((p) => !this.qualified(T, p.id)) : [];
    const mk = (p, pos, tie, sect) => {
      const cells = []; for (let r = 1; r <= 4; r++) { const x = p.rounds[r - 1]; let t = ''; if (r > view) { t = ''; } else if (sect === 'cut' && r >= 3) { t = 'CUT'; } else if (p.abd && r >= p.abd && p.abd < T.phase) { t = 'ABD'; } else if (x) { t = this.signed(x[mode]); } else { t = r === T.phase ? '—' : ''; } cells.push(t); }
      const n = sect === 'cut' ? Math.min(view, 2) : view; const t = tot(p, n, mode); const mv = prevPos[p.id] && pos ? prevPos[p.id] - pos : 0;
      return { id: p.id, me: !!p.me, name: p.name, golf: p.golf, pos: pos ? (tie ? 'T' : '') + pos : '', cells, tot: t.k ? this.signed(t.s) : '—', thru: t.k, move: mv > 0 ? '▲' + mv : (mv < 0 ? '▼' + (-mv) : ''), moveCls: mv > 0 ? 'up' : (mv < 0 ? 'dn' : ''), sect, toPlay: !p.rounds[view - 1] && view === T.phase && sect !== 'abd' };
    };
    const place = (list, n, sect, start) => {
      const none = list.filter((p) => tot(p, n, mode).k === 0); const ord = rank(list.filter((p) => tot(p, n, mode).k > 0), n); const out = []; ord.forEach((p) => { const t = tot(p, n, mode).s; const g = out[out.length - 1]; if (g && g.t === t) { g.ps.push(p); } else { out.push({ t, ps: [p] }); } });
      let k = (start || 0) + 1; const fin = !!(T.results && view === 4 && sect === 'in');
      out.forEach((g, gi) => {
        if (fin && gi === 0 && g.ps.length > 1) { rows.push(mk(g.ps[0], 1, false, sect)); const rest = g.ps.slice(1); rest.forEach((p) => { rows.push(mk(p, 2, rest.length > 1, sect)); }); }
        else { g.ps.forEach((p) => { rows.push(mk(p, k, g.ps.length > 1, sect)); }); }
        k += g.ps.length;
      });
      none.forEach((p) => { rows.push(mk(p, 0, false, sect)); });
    };
    place(inQ, view, 'in'); const nIn = rows.length; place(outQ, 2, 'cut', nIn);
    all.filter(isAbd).forEach((p) => { rows.push(mk(p, 0, false, 'abd')); });
    const meIdx = rows.findIndex((r) => r.me);
    return { rows, view, mode, closed, cutOn, nIn, cutLine: T.cut ? this.signed(T.cut.line) : '', cutN: T.cut ? T.cut.n : 0, nAbd: rows.filter((r) => r.sect === 'abd').length, nCut: rows.filter((r) => r.sect === 'cut').length, meIdx, me: rows[meIdx] || null, total: all.length };
  },
  // Projection du cut pendant les tours 1 et 2 : 50e place provisoire
  cutProjection(T) { if (T.cut || T.phase > 2) { return null; } const n = T.phase; const el = this.players(T).filter((p) => !(p.abd && p.abd <= n) && this.playedAll(p, n)); const ord = this.order(el, n); const p = ord[Math.min(ord.length, TOUR_CFG.cut) - 1]; return p ? this.signed(this.sumR(p, 1, n, 'net')) : ''; }
};
// Initiales du pseudo : « Tiger Woods » → TW, « MaxFairway » → MF, « Max » → MA
function initialsOf(name) {
  const n = String(name || '').trim(); if (!n) { return '?'; }
  const w = n.replace(/([a-zà-ÿ])([A-ZÀ-Þ])/g, '$1 $2').split(/[\s._-]+/).filter(Boolean);
  const s = w.length > 1 ? w[0].charAt(0) + w[1].charAt(0) : w[0].slice(0, 2);
  return s.toUpperCase();
}
// Carte de tournoi abandonnée (page ou appli fermée en cours de carte) : la carte ne compte pas, la mise est perdue,
// les jetons restants reviennent sur le solde (règle du 25/11/2026). Appelée au chargement de la table, du Tour et du Mode de jeu.
function settleAbandoned() {
  if (typeof localStorage === 'undefined') { return ''; }
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(GAME_KEY)) { return ''; }
    const a = JSON.parse(localStorage.getItem(ABD_KEY) || 'null'); localStorage.removeItem(ABD_KEY); if (!a) { return ''; }
    const chips = Math.max(0, Math.round(a.chips || 0)); const w = WALLET.get(); w.pts += chips; WALLET.set(w);
    const T = TOUR.load(); TOUR.dropCard(T);
    return 'Carte de tournoi abandonnée (page fermée en cours de partie) : elle ne compte pas et la mise de 10 000 pts est perdue ; vos ' + chips.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ') + ' pts de jetons sont revenus sur votre solde.';
  } catch (x) { return ''; }
}
window.GreencutEngine = {
  version: '1.2.0',
  initials: initialsOf,
  settleAbandoned,
  tour: TOUR,
  wallet: WALLET,
  cards() { return GreencutEngineBase.prototype.cards.call({}); },
  cardHelp(r) { return GreencutEngineBase.prototype.cardHelp.call({}, r); },
  courseCatalog() { return GreencutEngineBase.prototype.courseCatalog.call({}); },
  courseSearch(q) { return GreencutEngineBase.prototype.courseSearch.call({ courseCatalog: GreencutEngineBase.prototype.courseCatalog }, q); },
  courseInfo(id) { const c = COURSE_DATA[id]; if (!c) { return null; } return { id: c.id, name: c.name, place: c.place, country: c.country, tee: c.tee, source: c.source || '', tip: c.tip, holes: c.pars.map((p, i) => ({ n: i + 1, par: p, yds: c.yards[i], name: c.names[i], idx: c.idx[i] })) }; },
  fmt(n) { return GreencutEngineBase.prototype.fmt.call({}, n); },
  courseSaved() { try { const q = localStorage.getItem('greencut.course'); if (q && COURSE_DATA[q]) { return q; } } catch (x) { } return 'augusta'; },
  courseSave(id) { if (!COURSE_DATA[id]) { return false; } try { localStorage.setItem('greencut.course', id); } catch (x) { } return true; },
  install(C) { Object.getOwnPropertyNames(GreencutEngineBase.prototype).forEach((n) => { if (n !== 'constructor') { C.prototype[n] = GreencutEngineBase.prototype[n]; } }); return C; }
};
})();
