/* GREENCUT – moteur de jeu commun (desktop + mobile). Aucune mise en page ici : règles, cartes, combinaisons, scores, bonus, showdown, adversaires, conseils, sons, conversion fees/points. */
(function () {
let NP = 6;
const Z = (v) => Array.from({ length: NP }, () => v);
class GreencutEngineBase {
sfxCheck(p, n) {
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
pars() { return [4, 5, 4, 3, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 5, 3, 4, 4]; }
yards() { return [445, 585, 350, 240, 495, 180, 450, 570, 460, 495, 520, 155, 545, 440, 550, 170, 450, 465]; }
hnames() { return ['Tea Olive', 'Pink Dogwood', 'Flowering Peach', 'Flowering Crab Apple', 'Magnolia', 'Juniper', 'Pampas', 'Yellow Jasmine', 'Carolina Cherry', 'Camellia', 'White Dogwood', 'Golden Bell', 'Azalea', 'Chinese Fir', 'Firethorn', 'Redbud', 'Nandina', 'Holly']; }
combos() { return {"3": [[1, 1], [2, 6, 12], [3, 6, 13, 16], [4, 6, 13, 17], [5, 6, 13, 18], [3, 7, 12], [4, 7, 13, 16], [5, 7, 13, 17], [6, 7, 13, 18], [2, 5, 16], [3, 5, 17], [4, 5, 18], [2, 9, 12], [3, 9, 13, 16], [4, 9, 13, 17], [5, 9, 13, 18], [2, 10, 14], [3, 10, 15, 16], [4, 10, 15, 17], [5, 10, 15, 18], [2, 8, 16], [3, 8, 17], [4, 8, 18], [3, 11, 12], [4, 11, 13, 16], [5, 11, 13, 17], [6, 11, 13, 18]], "4": [[2, 2, 16], [3, 2, 17], [4, 2, 18], [2, 2, 12], [3, 2, 13, 16], [4, 2, 13, 17], [5, 2, 13, 18], [2, 2, 14], [3, 2, 15, 16], [4, 2, 15, 17], [5, 2, 15, 18], [3, 2, 8, 16], [4, 2, 8, 17], [5, 2, 8, 18], [3, 2, 5, 16], [4, 2, 5, 17], [5, 2, 5, 18], [2, 3, 12], [3, 3, 13, 16], [4, 3, 13, 17], [5, 3, 13, 18], [3, 3, 8, 16], [4, 3, 8, 17], [5, 3, 8, 18], [3, 3, 10, 14], [4, 3, 10, 15, 16], [5, 3, 10, 15, 17], [6, 3, 10, 15, 18], [5, 3, 11, 13, 16], [6, 3, 11, 13, 17], [7, 3, 11, 13, 18], [4, 3, 9, 13, 16], [5, 3, 9, 13, 17], [6, 3, 9, 13, 18], [3, 3, 9, 12], [4, 3, 11, 12], [3, 3, 5, 16], [4, 3, 5, 17], [5, 3, 5, 18], [3, 4, 12], [4, 4, 13, 16], [5, 4, 13, 17], [6, 4, 13, 18], [4, 4, 8, 16], [5, 4, 8, 17], [6, 4, 8, 18], [4, 4, 10, 14], [5, 4, 10, 15, 16], [6, 4, 10, 15, 17], [7, 4, 10, 15, 18], [6, 4, 11, 13, 16], [7, 4, 11, 13, 17], [8, 4, 11, 13, 18], [5, 4, 9, 13, 16], [6, 4, 9, 13, 17], [7, 4, 9, 13, 18], [4, 4, 9, 12], [5, 4, 11, 12], [3, 3, 6, 12], [4, 3, 6, 13, 16], [5, 3, 6, 13, 17], [6, 3, 6, 13, 18], [4, 3, 7, 12], [5, 3, 7, 13, 16], [6, 3, 7, 13, 17], [7, 3, 7, 13, 18], [4, 4, 6, 12], [5, 4, 6, 13, 16], [6, 4, 6, 13, 17], [7, 4, 6, 13, 18], [5, 4, 7, 12], [6, 4, 7, 13, 16], [7, 4, 7, 13, 17], [8, 4, 7, 13, 18], [4, 4, 5, 16], [5, 4, 5, 17], [6, 4, 5, 18], [3, 6, 5, 16], [4, 6, 5, 17], [5, 6, 5, 18], [3, 6, 6, 12], [4, 6, 6, 13, 16], [5, 6, 6, 13, 17], [6, 6, 6, 13, 18], [4, 6, 7, 12], [5, 6, 7, 13, 16], [6, 6, 7, 13, 17], [7, 6, 7, 13, 18], [3, 6, 8, 16], [4, 6, 8, 17], [5, 6, 8, 18], [3, 6, 9, 12], [4, 6, 9, 13, 16], [5, 6, 9, 13, 17], [6, 6, 9, 13, 18], [3, 6, 10, 14], [4, 6, 10, 15, 16], [5, 6, 10, 15, 17], [6, 6, 10, 15, 18], [4, 6, 11, 12], [5, 6, 11, 13, 16], [6, 6, 11, 13, 17], [7, 6, 11, 13, 18], [4, 7, 5, 16], [5, 7, 5, 17], [6, 7, 5, 18], [4, 7, 6, 12], [5, 7, 13, 16], [6, 7, 6, 13, 17], [7, 7, 6, 13, 18], [5, 7, 7, 12], [6, 7, 7, 13, 16], [7, 7, 7, 13, 17], [8, 7, 7, 13, 18], [4, 7, 8, 16], [5, 7, 8, 17], [6, 7, 8, 18], [4, 7, 9, 12], [5, 7, 9, 13, 16], [6, 7, 9, 13, 17], [7, 7, 9, 13, 18], [4, 7, 10, 14], [5, 7, 10, 15, 16], [6, 7, 15, 17], [7, 7, 10, 15, 18], [5, 7, 11, 12], [6, 7, 11, 13, 16], [7, 7, 11, 13, 17], [8, 7, 11, 13, 18]], "5": [[2, 2, 12], [3, 2, 13, 16], [4, 2, 13, 17], [5, 2, 13, 18], [2, 2, 14], [3, 2, 15, 16], [4, 2, 15, 17], [5, 2, 15, 18], [3, 2, 8, 16], [4, 2, 8, 17], [5, 2, 8, 18], [3, 2, 5, 16], [4, 2, 5, 17], [5, 2, 5, 18], [3, 3, 6, 12], [4, 3, 6, 13, 16], [5, 3, 6, 13, 17], [6, 3, 6, 13, 18], [4, 3, 6, 10, 14], [5, 3, 6, 10, 15, 16], [6, 3, 6, 10, 15, 17], [7, 3, 6, 10, 15, 18], [4, 3, 6, 8, 16], [5, 3, 6, 8, 17], [6, 3, 6, 8, 18], [4, 3, 6, 5, 16], [5, 3, 6, 5, 17], [6, 3, 6, 5, 18], [4, 3, 7, 12], [5, 3, 7, 13, 16], [6, 3, 7, 13, 17], [7, 3, 7, 13, 18], [5, 3, 7, 10, 14], [6, 3, 7, 10, 15, 16], [7, 3, 7, 10, 15, 17], [8, 3, 7, 10, 15, 18], [5, 3, 7, 8, 16], [6, 3, 7, 8, 17], [7, 3, 7, 8, 18], [5, 3, 7, 5, 16], [6, 3, 7, 5, 17], [7, 3, 7, 5, 18], [4, 3, 9, 8, 16], [5, 3, 9, 8, 17], [6, 3, 9, 8, 18], [4, 3, 9, 5, 16], [5, 3, 9, 5, 17], [6, 3, 9, 5, 18], [4, 3, 9, 9, 12], [5, 3, 9, 9, 13, 16], [6, 3, 9, 9, 13, 17], [7, 3, 9, 9, 13, 18], [5, 3, 9, 11, 12], [6, 3, 11, 11, 12], [6, 3, 9, 11, 13, 16], [7, 3, 9, 11, 13, 17], [8, 3, 9, 11, 13, 18], [7, 3, 11, 11, 13, 16], [8, 3, 11, 11, 13, 17], [9, 3, 11, 11, 13, 18], [4, 3, 9, 10, 14], [5, 3, 11, 10, 14], [5, 3, 9, 10, 15, 16], [6, 3, 9, 10, 15, 17], [7, 3, 9, 10, 15, 18], [6, 3, 11, 10, 15, 16], [7, 3, 11, 10, 15, 17], [8, 3, 11, 10, 15, 18], [5, 3, 11, 8, 16], [6, 3, 11, 8, 17], [7, 3, 11, 8, 18], [5, 3, 11, 5, 16], [6, 3, 11, 5, 17], [7, 3, 11, 5, 18], [5, 3, 11, 9, 12], [6, 3, 11, 9, 13, 16], [7, 3, 11, 9, 13, 17], [8, 3, 11, 9, 13, 18], [4, 4, 6, 12], [5, 4, 6, 13, 16], [6, 4, 6, 13, 17], [7, 4, 6, 13, 18], [5, 4, 6, 10, 14], [6, 4, 6, 10, 15, 16], [7, 4, 6, 10, 15, 17], [8, 4, 6, 10, 15, 18], [5, 4, 6, 8, 16], [6, 4, 6, 8, 17], [7, 4, 6, 8, 18], [5, 4, 6, 5, 16], [6, 4, 6, 5, 17], [7, 4, 6, 5, 18], [5, 4, 7, 12], [6, 4, 7, 13, 16], [7, 4, 7, 13, 17], [8, 4, 7, 13, 18], [6, 4, 7, 10, 14], [7, 4, 7, 10, 15, 16], [8, 4, 7, 10, 15, 17], [9, 4, 7, 10, 15, 18], [6, 4, 7, 8, 16], [7, 4, 7, 8, 17], [8, 4, 7, 8, 18], [6, 4, 7, 5, 16], [7, 4, 7, 5, 17], [8, 4, 7, 5, 18], [5, 4, 9, 8, 16], [6, 4, 9, 8, 17], [7, 4, 9, 8, 18], [5, 4, 9, 5, 16], [6, 4, 9, 5, 17], [7, 4, 9, 5, 18], [5, 4, 9, 9, 12], [6, 4, 9, 9, 13, 16], [7, 4, 9, 9, 13, 17], [8, 4, 9, 9, 13, 18], [6, 4, 9, 11, 12], [7, 4, 11, 11, 12], [7, 4, 9, 11, 13, 16], [8, 4, 9, 11, 13, 17], [9, 4, 9, 11, 13, 18], [8, 4, 11, 11, 13, 16], [9, 4, 11, 11, 13, 17], [5, 4, 9, 10, 14], [6, 4, 11, 10, 14], [6, 4, 9, 10, 15, 16], [7, 4, 9, 10, 15, 17], [8, 4, 9, 10, 15, 18], [7, 4, 11, 10, 15, 16], [8, 4, 11, 10, 15, 17], [9, 4, 11, 10, 15, 18], [6, 4, 11, 8, 16], [7, 4, 11, 8, 17], [8, 4, 11, 8, 18], [6, 4, 11, 5, 16], [7, 4, 11, 5, 17], [8, 4, 11, 5, 18], [6, 4, 11, 9, 12], [7, 4, 11, 9, 13, 16], [8, 4, 11, 9, 13, 17], [9, 4, 11, 9, 13, 18], [3, 6, 6, 12], [4, 6, 6, 13, 16], [5, 6, 6, 13, 17], [6, 6, 6, 13, 18], [4, 6, 6, 10, 14], [5, 6, 6, 10, 15, 16], [6, 6, 6, 10, 15, 17], [7, 6, 6, 10, 15, 18], [4, 6, 6, 8, 16], [5, 6, 6, 8, 17], [6, 6, 6, 8, 18], [4, 6, 6, 5, 16], [5, 6, 6, 5, 17], [6, 6, 6, 5, 18], [4, 6, 7, 12], [5, 6, 7, 13, 16], [6, 6, 7, 13, 17], [7, 6, 7, 13, 18], [5, 6, 7, 10, 14], [6, 6, 7, 10, 15, 16], [7, 6, 7, 10, 15, 17], [8, 6, 7, 10, 15, 18], [5, 6, 7, 8, 16], [6, 6, 7, 8, 17], [7, 6, 7, 8, 18], [5, 6, 7, 5, 16], [6, 6, 7, 5, 17], [7, 6, 7, 5, 18], [4, 6, 9, 5, 16], [5, 6, 9, 5, 17], [6, 6, 9, 5, 18], [4, 6, 9, 8, 16], [5, 6, 9, 8, 17], [6, 6, 9, 8, 18], [5, 6, 11, 5, 16], [6, 6, 11, 5, 17], [7, 6, 11, 5, 18], [5, 6, 11, 8, 16], [6, 6, 11, 8, 17], [7, 6, 11, 8, 18], [4, 7, 6, 12], [5, 7, 6, 13, 16], [6, 7, 6, 13, 17], [7, 7, 6, 13, 18], [5, 7, 6, 10, 14], [6, 7, 6, 10, 15, 16], [7, 7, 6, 10, 15, 17], [8, 7, 6, 10, 15, 18], [5, 7, 6, 8, 16], [6, 7, 6, 8, 17], [7, 7, 6, 8, 18], [5, 7, 6, 5, 16], [6, 7, 6, 5, 17], [7, 7, 6, 5, 18], [5, 7, 7, 12], [6, 7, 7, 13, 16], [7, 7, 7, 13, 17], [8, 7, 7, 13, 18], [6, 7, 7, 10, 14], [7, 7, 7, 10, 15, 16], [8, 7, 7, 10, 15, 17], [9, 7, 7, 10, 15, 18], [6, 7, 7, 8, 16], [7, 7, 7, 8, 17], [8, 7, 7, 8, 18], [6, 7, 7, 5, 16], [7, 7, 7, 5, 17], [8, 7, 7, 5, 18], [5, 7, 9, 5, 16], [6, 7, 9, 5, 17], [7, 7, 9, 5, 18], [5, 7, 9, 8, 16], [6, 7, 9, 8, 17], [7, 7, 9, 8, 18], [6, 7, 11, 5, 16], [7, 7, 11, 5, 17], [8, 7, 11, 5, 18], [6, 7, 11, 8, 16], [7, 7, 11, 8, 17], [8, 7, 11, 8, 18]]}; }
families() { return [[2, 3, 4], [3, 6, 9], [16, 17, 18], [5, 6, 7], [1, 12, 14], [10, 14, 15], [4, 7, 11], [5, 8, 13, 15], [8, 9, 10, 11]]; }
oppNames() { return ['Fairway_Fox', 'BirdieBandit', 'Dune_Queen', 'Sunset_Sam', 'Caddy_Kid', 'Links_Lou', 'Mulligan_Max']; }
nP() { return NP; }
oppBrands() { return ['CALLAWAY', 'TAYLORMADE', 'PING', 'TITLEIST', 'CALLAWAY', 'MIZUNO', 'COBRA']; }
fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
signed(n) { return n === 0 ? 'E' : (n > 0 ? '+' + n : '−' + Math.abs(n)); }
term(rel, par) {
const c = par + rel;
if (c <= 1) return 'Trou en 1';
return ['Albatross', 'Eagle', 'Birdie', 'Par', 'Bogey', 'Double bogey', 'Triple bogey', 'Quadruple bogey'][rel + 3] || 'Quadruple bogey';
}
initial(keep) {
if (keep && keep.nP) { NP = keep.nP; }
let ps = 'MaxFairway'; try { const q = localStorage.getItem('greencut.pseudo'); if (q) { ps = q; } } catch (x) { ps = 'MaxFairway'; }
let snd = { on: true, vol: 60 }; try { const q = JSON.parse(localStorage.getItem('greencut.sound') || 'null'); if (q) { snd = { on: q.on !== false, vol: typeof q.vol === 'number' ? q.vol : 60 }; } } catch (x) { snd = { on: true, vol: 60 }; }
let lvl = 'deb'; try { const d = JSON.parse(localStorage.getItem('greencut.parcours') || '{}'); if (d.expert || d['3a']) { lvl = 'exp'; } } catch (x) { lvl = 'deb'; }
const s = {
screen: 'table', nP: NP, sortBy: 'net', soundOn: snd.on, sndVol: snd.vol, av: 0, pseudo: ps, pseudoDraft: ps, pseudoMsg: '', why: '', club: 'Titleist', ball: 'Pro V1', golf: 0, league: 0,
games: 1, gate: false, reload: false, fees: 1250, pts: 8400, dir: 'f2p', amt: 300, expired: false, feesMsg: '',
hist: [ { a: 'Partie 1 : mise de départ', t: 'À l’instant', d: '−10 000 pts', e: '', cls: 'hf' }, { a: 'Points du jeu → fees', t: 'Aujourd’hui · 19:12', d: '−12 000 pts', e: '+120 fees', cls: 'hp' }, { a: 'Fees → points du jeu', t: '12 nov. · 21:40', d: '−200 fees', e: '+20 000 pts', cls: 'hf' } ],
quit: false, askQuit: false, tuto: false, moreOpt: false, aidDetail: false, stacks: Z(10000), strokes: Array.from({ length: NP }, () => []), hole: 1, prevPos: null, trend: {}, help: lvl === 'deb', level: lvl
};
if (keep) { Object.assign(s, keep); }
Object.assign(s, this.deal(s.stacks, 1, s.strokes, Z(0)), { raiseTo: 200 });
return s;
}
// ---------- moteur de jeu ----------
evalPlayer(hand, comm, par) {
const all = hand.concat(comm); const cnt = {};
all.forEach((r) => { cnt[r] = (cnt[r] || 0) + 1; });
const CB = this.combos()[par]; const CD = this.cards();
let golf = null; let chain = null;
for (let n = 0; n < CB.length; n++) {
const c = CB[n]; const need = {}; let ok = true; let inHand = false;
for (let k = 1; k < c.length; k++) { need[c[k]] = (need[c[k]] || 0) + 1; }
for (const r in need) { if ((cnt[r] || 0) < need[r]) { ok = false; break; } if (hand.indexOf(Number(r)) >= 0) { inHand = true; } }
if (ok && inHand && (golf === null || c[0] < golf)) { golf = c[0]; chain = c.slice(1); }
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
return { rel, type, label, pkH, pkName, pkTxt, chain: type === 'golf' ? chain : null, pkSet };
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
if (who === 0) { h.status[0] = 'À VOUS'; const toCall = h.cur - h.rb[0]; const minTo = h.cur === 0 ? 200 : h.cur + h.minRaise; return { h, stacks: st, log, strokes, tableMsg: this.startMsg(h), raiseTo: Math.min(minTo, h.rb[0] + st[0]) }; }
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
heroAct(kind, toArg) {
const s = this.state; if (s.h.phase !== 'bet') { return; }
const st = s.stacks.slice(); const h = JSON.parse(JSON.stringify(s.h)); const log = s.log.concat([]);
const toCall = h.cur - h.rb[0]; const minTo = h.cur === 0 ? 200 : h.cur + h.minRaise; const maxTo = h.rb[0] + st[0];
if (kind === 'fold') { this.apply(h, st, log, 0, 'fold'); }
else if (kind === 'call') { this.apply(h, st, log, 0, toCall > 0 ? 'call' : 'check'); }
else if (kind === 'allin') { this.apply(h, st, log, 0, 'raise', maxTo); }
else { if (maxTo <= h.cur) { return; } const to = Math.max(Math.min(toArg || s.raiseTo || minTo, maxTo), Math.min(minTo, maxTo)); this.apply(h, st, log, 0, 'raise', to); }
if (!h.folded[0]) { h.status[0] = h.status[0]; }
this.setState(this.run(h, st, log, s.strokes));
}
showdown(h, st, log, strokesIn) {
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
h.boom = !!(h.allin[0] && gains[0] > 0); h.loser = !!(!h.noBet && !h.folded[0] && !(h.out && h.out[0]) && ev[0].rel === null && !(gains[0] > 0)); h.gains = gains.slice();
const rel = []; const how = [];
for (let i = 0; i < NP; i++) {
const base = ev[i].rel === null ? 4 : ev[i].rel;
if (h.out && h.out[i]) { rel[i] = 4; how[i] = 'éliminé'; }
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
const msg = h.noBet ? (h.out && h.out[0] ? 'Vous n’avez plus de jetons : par + 4 sur ce trou (' + (par + 4) + ' coups).' : 'Plus aucun adversaire n’a de jetons : trou joué sans mise. Votre score : ' + this.term(rel[0], par) + ' (' + (par + rel[0]) + ' coups).') : ((gains[0] > 0 ? 'Vous remportez ' + this.fmt(gains[0]) + ' jetons. ' : 'Vous ne remportez pas de pot. ') + 'Votre score sur le trou : ' + this.term(rel[0], par) + ' (' + (par + rel[0]) + ' coups).') + (h.folded[0] && !(h.out && h.out[0]) && ev[0].rel !== null && !h.noBet ? ' Vous vous êtes couché : ' + this.term(ev[0].rel, par) + ' + 1 point de pénalité.' : '');
const rl = (i) => (ev[i].rel === null ? 'aucune combinaison' : ev[i].label) + ' = ' + this.term(rel[i], par) + ' (' + (par + rel[i]) + ' coups)';
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
if (el.length) { wl.push({ n: el.join(', '), role: 'ÉLIMINÉS', cls: 'f', res: 'plus de jetons : par + 4', hand: '', why: '' }); }
if (fl.length) { wl.push({ n: fl.join(', '), role: 'COUCHÉS', cls: 'f', res: '+ 1 coup', hand: '', why: '' }); }
const whyTxt = wl;
return { h, stacks: st, strokes, log, tableMsg: msg, why: whyTxt };
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
settle() {
const s = this.state; const fin = s.stacks[0]; const pts = s.pts + fin;
const hist = [ { a: 'Partie ' + s.games + ' : retour des jetons', t: 'À l’instant', d: '+' + this.fmt(fin) + ' pts', e: '', cls: 'hp' } ].concat(s.hist);
this.setState({ gate: true, pts, hist });
}
newGame(pts, hist) {
const s = this.state; const g = (s.games || 1) + 1;
const keep = { nP: s.nP, soundOn: s.soundOn, sndVol: s.sndVol, av: s.av, pseudo: s.pseudo, pseudoDraft: s.pseudoDraft, club: s.club, ball: s.ball, golf: s.golf, league: s.league, level: s.level, help: s.help, expired: s.expired, fees: s.fees, dir: s.dir, amt: s.amt, games: g, gate: false, reload: false, screen: 'table', pts: pts - 10000, hist: [ { a: 'Partie ' + g + ' : mise de départ', t: 'À l’instant', d: '−10 000 pts', e: '', cls: 'hf' } ].concat(hist) };
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
for (let k = 0; k < played; k++) { brut += s.strokes[i][k]; sum += s.strokes[i][k] - P[k]; }
const net = sum + (played > 0 ? bn[i] : 0);
const lastRel = played ? s.strokes[i][played - 1] - P[played - 1] : null;
let back = 0; let backAbs = 0; for (let k = 9; k < played; k++) { back += s.strokes[i][k] - P[k]; backAbs += s.strokes[i][k]; }
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
const D = [
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
][hole - 1];
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
window.GreencutEngine = {
  version: '1.0.0',
  cards() { return GreencutEngineBase.prototype.cards.call({}); },
  install(C) { Object.getOwnPropertyNames(GreencutEngineBase.prototype).forEach((n) => { if (n !== 'constructor') { C.prototype[n] = GreencutEngineBase.prototype[n]; } }); return C; }
};
})();
