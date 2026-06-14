// Tactile toggle: label + LED + ON/OFF readout. Click flips state and emits 'rf-change'.
class RfToggle extends HTMLElement {
  static get observedAttributes() { return ['on', 'label', 'disabled']; }
  connectedCallback() { this.render(); this.addEventListener('click', () => this.flip()); }
  attributeChangedCallback() { if (this._built) this.render(); }
  get on() { return this.hasAttribute('on'); }
  flip() {
    if (this.hasAttribute('disabled')) return;
    this.toggleAttribute('on');
    this.render();
    this.dispatchEvent(new CustomEvent('rf-change', { detail: { on: this.on }, bubbles: true }));
  }
  render() {
    this._built = true;
    const on = this.on;
    const label = this.getAttribute('label') || '';
    const ledOn = 'width:8px;height:8px;border-radius:50%;background:var(--rf-accent);box-shadow:var(--rf-glow-orange);';
    const ledOff = 'width:8px;height:8px;border-radius:50%;background:var(--rf-border);';
    this.innerHTML = `
      <span role="switch" aria-checked="${on}" tabindex="0"
        style="cursor:pointer;flex:1;min-width:0;border:1px solid var(--rf-border);border-radius:12px;
               background:var(--rf-surface-2);padding:12px 6px 10px;display:flex;flex-direction:column;
               align-items:center;gap:9px;">
        <span style="${on ? ledOn : ledOff}"></span>
        <span class="rf-display" style="font-weight:700;font-size:13px;line-height:1;color:${on ? 'var(--rf-ink)' : 'var(--rf-ink-faint)'};">${on ? 'ON' : 'OFF'}</span>
        <span style="font-family:var(--rf-font-mono);font-size:7.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--rf-ink-dim);">${label}</span>
      </span>`;
  }
}
if (!customElements.get('rf-toggle')) customElements.define('rf-toggle', RfToggle);
