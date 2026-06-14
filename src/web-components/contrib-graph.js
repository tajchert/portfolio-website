/* ───────────────────────────────────────────────────────────────
   <contrib-graph> — GitHub/GitLab-style contribution heatmap for the
   TE × Nothing design language.

   • 53×7 dot-matrix grid, intensity ramp white→orange.
   • Source toggle: ALL / GITHUB / GITLAB. Recomputes cells + stats.
   • Live total readout + four stat tiles (total / longest / current / busiest).
   • Placeholder data is generated deterministically (seeded LCG) so the
     board is identical on every load; pass a real dataset later if wanted.

   Attributes
   ──────────
   seed     integer seed for the placeholder generator (default 20260613)
   source   initial source: "all" (default) | "gh" | "gl"
   ─────────────────────────────────────────────────────────────── */

const CONTRIB_BG = ['#161616', 'rgba(244,244,242,.24)', 'rgba(244,244,242,.46)', 'rgba(244,244,242,.74)', '#ff5a1e'];
const CONTRIB_GLOW = ['none', 'none', 'none', '0 0 4px rgba(244,244,242,.4)', '0 0 7px rgba(255,90,30,.75)'];

function generateDays(seed) {
  let s = seed >>> 0;
  const r = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const out = [];
  for (let w = 0; w < 53; w++) {
    for (let d = 0; d < 7; d++) {
      const wk = d >= 1 && d <= 5;
      const base = wk ? 1 : 0.45;
      let gh = Math.floor(Math.pow(r(), 2.1) * 11 * base);
      let gl = Math.floor(Math.pow(r(), 2.4) * 7 * base);
      if (r() > 0.93) gh += 5 + Math.floor(r() * 9);
      if (r() > 0.965) gl += 4 + Math.floor(r() * 7);
      if (r() > 0.88 && !wk) { gh = 0; gl = 0; }
      out.push({ gh, gl });
    }
  }
  return out;
}
const dayValue = (day, src) => src === 'gh' ? day.gh : src === 'gl' ? day.gl : day.gh + day.gl;
const bucket = (c) => !c ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 9 ? 3 : 4;

class ContribGraph extends HTMLElement {
  static get observedAttributes() { return ['seed', 'source']; }

  constructor() {
    super();
    this._days = [];
    this._src = 'all';
    this._ready = false;
  }

  connectedCallback() {
    const seed = parseInt(this.getAttribute('seed') || '20260613', 10);
    this._days = generateDays(seed);
    const s = this.getAttribute('source');
    if (s === 'gh' || s === 'gl' || s === 'all') this._src = s;
    this._render();
    this._ready = true;
  }

  attributeChangedCallback(name, oldV, newV) {
    if (oldV === newV || !this._ready) return;
    if (name === 'seed') {
      this._days = generateDays(parseInt(newV || '20260613', 10));
    } else if (name === 'source' && (newV === 'all' || newV === 'gh' || newV === 'gl')) {
      this._src = newV;
    }
    this._render();
  }

  _chipStyle(on) {
    const base = "font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;font-weight:700;border-radius:999px;padding:7px 15px;cursor:pointer;";
    return on
      ? base + 'border:1px solid #ff4d12;background:#ff4d12;color:#0b0b0b;'
      : base + 'border:1px solid #2a2a2a;background:#0d0d0d;color:#8a8a82;';
  }

  _stats() {
    const days = this._days, src = this._src;
    const total = days.reduce((a, d) => a + dayValue(d, src), 0);
    let longest = 0, run = 0;
    for (const d of days) { if (dayValue(d, src) > 0) { run++; longest = Math.max(longest, run); } else run = 0; }
    let current = 0;
    for (let i = days.length - 1; i >= 0; i--) { if (dayValue(days[i], src) > 0) current++; else break; }
    let best = 0;
    for (const d of days) best = Math.max(best, dayValue(d, src));
    return { total, longest, current, best };
  }

  _render() {
    const src = this._src;
    const st = this._stats();
    const cells = this._days.map((d) => {
      const lvl = bucket(dayValue(d, src));
      return `<div style="width:11px;height:11px;border-radius:2px;background:${CONTRIB_BG[lvl]};box-shadow:${CONTRIB_GLOW[lvl]};"></div>`;
    }).join('');

    const tile = (val, label, accent) =>
      `<div style="border:1px solid #1f1f1f;border-radius:12px;background:#0a0a0a;padding:16px;">
         <div style="font-family:'Doto',monospace;font-weight:700;font-size:30px;line-height:1;color:${accent ? '#ff5a1e' : '#f4f4f2'};">${val}</div>
         <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.14em;color:${accent ? '#8a5a44' : '#7a7a72'};margin-top:8px;">${label}</div>
       </div>`;

    const legendSwatch = (bg, glow) =>
      `<span style="width:11px;height:11px;border-radius:2px;background:${bg};box-shadow:${glow || 'none'};"></span>`;

    this.innerHTML = `
      <div style="border:1px solid #1f1f1f;border-radius:14px;background:#0a0a0a;padding:clamp(16px,3vw,24px);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:22px;">
          <div role="group" aria-label="contribution source" style="display:flex;gap:8px;">
            <button data-src="all" aria-pressed="${src === 'all'}" style="${this._chipStyle(src === 'all')}">ALL</button>
            <button data-src="gh" aria-pressed="${src === 'gh'}" style="${this._chipStyle(src === 'gh')}">GITHUB</button>
            <button data-src="gl" aria-pressed="${src === 'gl'}" style="${this._chipStyle(src === 'gl')}">GITLAB</button>
          </div>
          <div style="display:flex;align-items:baseline;gap:8px;">
            <span style="font-family:'Doto',monospace;font-weight:700;font-size:30px;line-height:1;color:#ff5a1e;text-shadow:0 0 12px rgba(255,90,30,.45);">${st.total}</span>
            <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;color:#7a7a72;">CONTRIBUTIONS</span>
          </div>
        </div>

        <div style="overflow-x:auto;padding-bottom:6px;">
          <div style="display:inline-flex;gap:8px;">
            <div style="display:grid;grid-template-rows:repeat(7,11px);gap:3px;font-family:'Space Mono',monospace;font-size:8px;color:#6c6c6c;align-items:center;">
              <span></span><span>MON</span><span></span><span>WED</span><span></span><span>FRI</span><span></span>
            </div>
            <div style="display:grid;grid-template-rows:repeat(7,11px);grid-auto-flow:column;grid-auto-columns:11px;gap:3px;">
              ${cells}
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:7px;margin-top:18px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.1em;color:#6c6c6c;">
          <span>LESS</span>
          ${legendSwatch(CONTRIB_BG[0])}
          ${legendSwatch(CONTRIB_BG[1])}
          ${legendSwatch(CONTRIB_BG[2])}
          ${legendSwatch(CONTRIB_BG[3], CONTRIB_GLOW[3])}
          ${legendSwatch(CONTRIB_BG[4], '0 0 6px rgba(255,90,30,.6)')}
          <span>MORE</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:14px;">
        ${tile(st.total, 'TOTAL', false)}
        ${tile(st.longest, 'LONGEST STREAK', false)}
        ${tile(st.current, 'CURRENT STREAK', false)}
        ${tile(st.best, 'BUSIEST DAY', true)}
      </div>
    `;

    this.querySelectorAll('button[data-src]').forEach((b) => {
      b.addEventListener('click', () => {
        this._src = b.getAttribute('data-src');
        this._render();
      });
    });
  }
}

if (!customElements.get('contrib-graph')) {
  customElements.define('contrib-graph', ContribGraph);
}
