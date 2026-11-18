/* Mini-runtime GREENCUT : rend les modèles <x-dc> (sc-if, sc-for, {{chemin}}) hors de l'outil de maquette. */
(function () {
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(o) { Object.assign(this.state, o); if (this.__r) this.__r(); }
  }
  window.DCLogic = DCLogic;
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const get = (ctx, path) => { let c = ctx; for (const k of path.split('.')) { if (c == null) return ''; c = c[k]; } return c == null ? '' : c; };
  function closeIdx(s, i, tag) {
    const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'g'); re.lastIndex = i; let d = 0, m;
    while ((m = re.exec(s))) { if (!m[1]) d++; else { d--; if (d === 0) return [m.index, re.lastIndex]; } }
    return [s.length, s.length];
  }
  let handlers = [];
  function render(s, ctx) {
    let out = '', i = 0; const pat = /<sc-(if|for)\b([^>]*)>/g;
    for (;;) {
      pat.lastIndex = i; const m = pat.exec(s);
      if (!m) { out += s.slice(i); break; }
      out += s.slice(i, m.index);
      const tag = 'sc-' + m[1]; const [cs, ce] = closeIdx(s, m.index, tag); const inner = s.slice(m.index + m[0].length, cs);
      if (m[1] === 'if') {
        const val = /value="\{\{\s*([\w.]+)\s*\}\}"/.exec(m[2]);
        if (val && get(ctx, val[1])) out += render(inner, ctx);
      } else {
        const lst = /list="\{\{\s*([\w.]+)\s*\}\}"/.exec(m[2])[1]; const as = /as="(\w+)"/.exec(m[2])[1];
        for (const it of (get(ctx, lst) || [])) { const c2 = Object.assign({}, ctx); c2[as] = it; out += render(inner, c2); }
      }
      i = ce;
    }
    out = out.replace(/\son(Click|Input|Change)="\{\{\s*([\w.]+)\s*\}\}"/g, (_, ev, p) => {
      const f = get(ctx, p); if (typeof f !== 'function') return ''; handlers.push(f); return ' data-dc-' + ev.toLowerCase() + '="' + (handlers.length - 1) + '"';
    });
    return out.replace(/\{\{([^}]+)\}\}/g, (_, e) => { const v = get(ctx, e.trim()); return (typeof v === 'object' || typeof v === 'function') ? '' : esc(v); });
  }
  function sync(a, b) { // a = nœud existant, b = nouveau
    if (a.nodeType === 3) { if (a.data !== b.data) a.data = b.data; return; }
    if (a.nodeType !== 1) return;
    for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
    for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    if (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') { const v = b.getAttribute('value') || ''; if (a.value !== v && a !== document.activeElement) a.value = v; if (a.type === 'checkbox') a.checked = b.hasAttribute('checked'); }
    patch(a, b);
  }
  function patch(pa, pb) {
    const A = [...pa.childNodes], B = [...pb.childNodes];
    for (let i = 0; i < B.length; i++) {
      const x = A[i], y = B[i];
      if (!x) pa.appendChild(y);
      else if (x.nodeType === y.nodeType && x.nodeName === y.nodeName) sync(x, y);
      else pa.replaceChild(y, x);
    }
    for (let i = A.length - 1; i >= B.length; i--) pa.removeChild(A[i]);
  }
  window.GCMount = function (tpls, Component, root) {
    const inst = new Component({});
    const q = (location.search.match(/[?&]o=(v|h)/) || [])[1];
    const mq = window.matchMedia('(orientation: landscape)');
    const land = () => q ? q === 'h' : mq.matches;
    let last = null;
    const draw = () => {
      handlers = [];
      const k = land() ? 'h' : 'v';
      if (k !== last) { last = k; document.documentElement.setAttribute('data-o', k); }
      const html = render(tpls[k], inst.renderVals());
      const t = document.createElement('div'); t.innerHTML = html; patch(root, t);
    };
    inst.__r = draw;
    ['click', 'input', 'change'].forEach((ev) => root.addEventListener(ev, (e) => {
      const el = e.target.closest && e.target.closest('[data-dc-' + ev + ']'); if (!el) return;
      const f = handlers[+el.getAttribute('data-dc-' + ev)]; if (f) f(e);
    }));
    const redraw = () => draw();
    if (mq.addEventListener) mq.addEventListener('change', redraw); else if (mq.addListener) mq.addListener(redraw);
    window.addEventListener('orientationchange', () => setTimeout(redraw, 150));
    window.addEventListener('resize', redraw);
    draw(); return inst;
  };
})();
