import '../../web-components/contrib-graph.js';
import { rollDigits, bumpField, todayCellIndex, bucket, CONTRIB_BG, CONTRIB_GLOW } from './contrib-live';

const TICK_DELAY_MS = 1100; // after the graph is on screen with data
const ROLL_MS = 900;        // keep in sync with .pf-roll-strip in portfolio.css

// Keep the vendored graph as-is; once it has scrolled into view, add a single
// "+1 today" tick with an odometer roll so the board feels live.
class PortfolioContribGraph extends customElements.get('contrib-graph') {
  constructor() {
    super();
    this._seen = false;
    this._tickTimer = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this._io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      this._seen = true;
      this._io.disconnect();
      this._scheduleTick();
    }, { threshold: 0.4 });
    this._io.observe(this);
  }

  disconnectedCallback() {
    this._io?.disconnect();
    clearTimeout(this._tickTimer);
  }

  _render() {
    super._render();
    this._scheduleTick(); // real data may arrive after the graph is already visible
  }

  _scheduleTick() {
    if (!this._seen || this._loading || this._tickTimer) return;
    this._tickTimer = setTimeout(() => this._tick(), TICK_DELAY_MS);
  }

  _tick() {
    const idx = todayCellIndex(!!this.getAttribute('data-src'), new Date().getUTCDay(), this._days.length);
    const day = this._days[idx];
    if (!day) return;
    const before = this._stats();
    const field = bumpField(this._src);
    this._days[idx] = { ...day, [field]: day[field] + 1 };
    const after = this._stats();

    const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._roll(this._valueFor('CONTRIBUTIONS'), before.total, after.total, motion);
    this._roll(this._valueFor('TOTAL'), before.total, after.total, motion);
    this._roll(this._valueFor('LONGEST STREAK'), before.longest, after.longest, motion);
    this._roll(this._valueFor('CURRENT STREAK'), before.current, after.current, motion);
    this._roll(this._valueFor('BUSIEST DAY'), before.best, after.best, motion);

    const cell = this.querySelector('[data-cg-scroll] [aria-busy] > div')?.children[idx];
    if (cell) {
      const lvl = bucket(this._src === 'all' ? this._days[idx].gh + this._days[idx].gl : this._days[idx][field]);
      cell.style.background = CONTRIB_BG[lvl];
      cell.style.boxShadow = CONTRIB_GLOW[lvl];
      if (motion) cell.classList.add('pf-tick-cell');
    }
  }

  /** The readout rendered right before a label (vendored markup has no hooks). */
  _valueFor(label) {
    for (const el of this.querySelectorAll('span, div')) {
      if (!el.children.length && el.textContent.trim() === label) return el.previousElementSibling;
    }
    return null;
  }

  _roll(el, from, to, motion) {
    if (!el || from === to) return;
    if (!motion) { el.textContent = String(to); return; }
    el.setAttribute('aria-label', String(to));
    el.innerHTML = rollDigits(from, to).map(({ from: a, to: b }, i, all) => a === b
      ? `<span class="pf-roll"><span>${b}</span></span>`
      : `<span class="pf-roll"><span class="pf-roll-strip" style="animation-delay:${(all.length - 1 - i) * 70}ms"><span>${a}</span><span>${b}</span></span></span>`
    ).join('');
    el.classList.add('pf-tick-glow');
    setTimeout(() => {
      el.textContent = String(to);
      el.removeAttribute('aria-label');
      el.classList.remove('pf-tick-glow');
    }, ROLL_MS + 400);
  }
}

if (!customElements.get('portfolio-contrib-graph')) {
  customElements.define('portfolio-contrib-graph', PortfolioContribGraph);
}
