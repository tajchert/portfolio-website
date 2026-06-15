/* ───────────────────────────────────────────────────────────────
   <experience-toggle> — collapse/expand wrapper for the EXPERIENCE
   section in the TE × Nothing design language.

   The Experience section is intentionally "soft": a quiet one-line-
   per-company summary is shown by default, and the full timeline is
   revealed on demand. This element owns only the open/closed state —
   all markup is authored in the light DOM (so it's crawlable and
   degrades to the collapsed summary with no JS).

   Expected light-DOM children:
     button[data-act="toggle"]   — the EXPAND / COLLAPSE control
     [data-region="summary"]     — condensed one-line summary
     [data-region="full"]        — full timeline

   State lives on the host as the boolean attribute [data-expanded].
   CSS (portfolio.css) shows the active region; this element flips the
   attribute, updates the button label, and keeps ARIA in sync.
   ─────────────────────────────────────────────────────────────── */

const LABEL_COLLAPSED = '[ + ] EXPAND';
const LABEL_EXPANDED = '[ − ] COLLAPSE';

class ExperienceToggle extends HTMLElement {
  connectedCallback() {
    this._btn = this.querySelector('button[data-act="toggle"]');
    this._full = this.querySelector('[data-region="full"]');
    // Collapsed by default unless the author opted in.
    this._expanded = this.hasAttribute('data-expanded');
    this._sync();
    if (this._btn) {
      this._onClick = () => this.toggle();
      this._btn.addEventListener('click', this._onClick);
    }
  }

  disconnectedCallback() {
    if (this._btn && this._onClick) this._btn.removeEventListener('click', this._onClick);
  }

  toggle() {
    this._expanded = !this._expanded;
    this._sync();
  }

  _sync() {
    if (this._expanded) this.setAttribute('data-expanded', '');
    else this.removeAttribute('data-expanded');
    if (this._btn) {
      this._btn.textContent = this._expanded ? LABEL_EXPANDED : LABEL_COLLAPSED;
      this._btn.setAttribute('aria-expanded', String(this._expanded));
    }
    if (this._full) this._full.setAttribute('aria-hidden', String(!this._expanded));
  }
}

if (!customElements.get('experience-toggle')) customElements.define('experience-toggle', ExperienceToggle);
