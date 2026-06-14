// <rf-playground> wraps a preview slot + auto-builds controls from data-controls JSON.
// Each control: { attr, label, type:'select'|'toggle'|'text', options?:[...], default?:string }
// It mutates the FIRST element with [data-preview] inside it.
class RfPlayground extends HTMLElement {
  connectedCallback() {
    const controls = JSON.parse(this.getAttribute('data-controls') || '[]');
    const panel = document.createElement('div');
    panel.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;margin-top:20px;padding-top:18px;border-top:1px solid var(--rf-border);';
    this.preview = this.querySelector('[data-preview]');
    controls.forEach((c) => {
      const el = this._control(c);
      panel.appendChild(el);
      // apply default value immediately
      if (c.default != null) {
        this._apply(c.attr, c.default);
      }
    });
    this.appendChild(panel);
  }

  _control(c) {
    const wrap = document.createElement('label');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;font-family:var(--rf-font-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--rf-ink-dim);';
    const span = document.createElement('span');
    span.textContent = c.label;
    wrap.appendChild(span);

    let field;
    if (c.type === 'select') {
      field = document.createElement('select');
      field.style.cssText = 'background:var(--rf-surface-2);border:1px solid var(--rf-border);border-radius:8px;padding:8px 12px;font-family:var(--rf-font-mono);font-size:11px;color:var(--rf-ink);cursor:pointer;min-width:100px;';
      (c.options || []).forEach((o) => {
        const opt = document.createElement('option');
        opt.value = o;
        opt.textContent = o;
        if (c.default != null && o === c.default) opt.selected = true;
        field.appendChild(opt);
      });
      field.addEventListener('change', () => this._apply(c.attr, field.value));
    } else if (c.type === 'toggle') {
      field = document.createElement('button');
      field.type = 'button';
      field.textContent = c.default ? 'ON' : 'OFF';
      field.style.cssText = 'background:var(--rf-surface-2);border:1px solid var(--rf-border);border-radius:8px;padding:8px 12px;font-family:var(--rf-font-mono);font-size:11px;color:var(--rf-ink);cursor:pointer;';
      field.addEventListener('click', () => {
        const on = field.textContent === 'OFF';
        field.textContent = on ? 'ON' : 'OFF';
        this._apply(c.attr, on ? '' : null);
      });
    } else {
      field = document.createElement('input');
      field.type = 'text';
      field.style.cssText = 'background:var(--rf-surface-2);border:1px solid var(--rf-border);border-radius:8px;padding:8px 12px;font-family:var(--rf-font-mono);font-size:11px;color:var(--rf-ink);cursor:pointer;min-width:120px;';
      if (c.default != null) field.value = c.default;
      field.addEventListener('input', () => this._apply(c.attr, field.value));
    }

    wrap.appendChild(field);
    return wrap;
  }

  _apply(attr, value) {
    if (!this.preview) return;
    if (attr === 'label') {
      this.preview.textContent = value;
      return;
    }
    if (value === null) {
      this.preview.removeAttribute(attr);
    } else {
      this.preview.setAttribute(attr, value);
    }
    // if the preview is a custom element with .set, also call it for value attrs
    if (attr === 'value' && typeof this.preview.set === 'function') {
      this.preview.set(value);
    }
  }
}
if (!customElements.get('rf-playground')) customElements.define('rf-playground', RfPlayground);
