// Global dark/light switch. Sets data-theme on <html> and persists.
// Markup it renders: a Nothing-style pill switch with a glowing LED knob.
const KEY = 'rf-theme';
class RfThemeToggle extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button type="button" aria-label="Toggle theme"
        style="cursor:pointer;display:inline-flex;align-items:center;gap:10px;height:38px;
               padding:0 8px 0 16px;border-radius:9999px;border:1px solid var(--rf-border);
               background:var(--rf-surface-2);font-family:var(--rf-font-mono);font-size:10px;
               letter-spacing:.16em;text-transform:uppercase;color:var(--rf-ink);">
        <span data-label>DARK</span>
        <span style="width:34px;height:18px;border-radius:9999px;background:var(--rf-ink);
                     display:inline-flex;align-items:center;padding:0 2px;">
          <span data-knob style="width:14px;height:14px;border-radius:50%;background:var(--rf-surface-2);
                box-shadow:var(--rf-glow-white);transition:transform .18s ease;"></span>
        </span>
      </button>`;
    this.btn = this.querySelector('button');
    this.label = this.querySelector('[data-label]');
    this.knob = this.querySelector('[data-knob]');
    this.btn.addEventListener('click', () => this.toggle());
    this.sync();
  }
  get theme() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
  toggle() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch {}
    this.sync();
  }
  sync() {
    const t = this.theme;
    this.label.textContent = t.toUpperCase();
    this.knob.style.transform = t === 'light' ? 'translateX(16px)' : 'translateX(0)';
  }
}
customElements.define('rf-theme-toggle', RfThemeToggle);
