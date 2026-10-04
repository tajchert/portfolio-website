import '../../web-components/cv-actions.js';

// Keep the vendored clipboard/download behavior while using the page's static card.
// Only the copy label changes; PDF and Markdown controls stay in the same card.
class PortfolioCvActions extends customElements.get('cv-actions') {
  constructor() {
    super();
    this._handleCopy = () => this._copy();
    this._handleSave = () => this._save();
  }

  connectedCallback() {
    super.connectedCallback();
    const copy = this.querySelector('[data-act="copy"]');
    const save = this.querySelector('[data-act="save"]');
    copy.addEventListener('click', this._handleCopy);
    save.addEventListener('click', this._handleSave);
    copy.disabled = false;
    save.disabled = false;
  }

  disconnectedCallback() {
    this.querySelector('[data-act="copy"]').removeEventListener('click', this._handleCopy);
    this.querySelector('[data-act="save"]').removeEventListener('click', this._handleSave);
    super.disconnectedCallback();
  }

  _render() {
    this.querySelector('[data-act="copy"]').textContent = this._copied ? 'COPIED ✓' : 'COPY';
  }
}

if (!customElements.get('portfolio-cv-actions')) {
  customElements.define('portfolio-cv-actions', PortfolioCvActions);
}
