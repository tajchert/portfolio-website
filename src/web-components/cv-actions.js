/* ───────────────────────────────────────────────────────────────
   <cv-actions> — a "file card" with COPY + SAVE actions for the
   TE × Nothing design language. Used for the CV (curriculum vitae).

   The markdown content is supplied at build time as a base64 data
   attribute (UTF-8 safe — the CV contains characters like "ł"):

     <cv-actions
        data-filename="michal-tajchert-cv.md"
        data-label="CURRICULUM VITAE · 履歴書"
        data-md="<base64 of the markdown>"></cv-actions>

   • COPY → navigator.clipboard (execCommand fallback), shows "COPIED ✓".
   • SAVE → client-side Blob download of the .md file (no network).
   ─────────────────────────────────────────────────────────────── */

function decodeB64Utf8(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

class CvActions extends HTMLElement {
  constructor() {
    super();
    this._copied = false;
    this._timer = null;
  }

  connectedCallback() {
    this._md = decodeB64Utf8(this.getAttribute('data-md') || '');
    this._filename = this.getAttribute('data-filename') || 'cv.md';
    this._label = this.getAttribute('data-label') || 'CURRICULUM VITAE';
    this._render();
  }

  disconnectedCallback() {
    if (this._timer) clearTimeout(this._timer);
  }

  _render() {
    const copyLabel = this._copied ? 'COPIED ✓' : 'COPY';
    this.innerHTML = `
      <div style="border:1px solid #242424;border-radius:14px;background:#0d0d0d;overflow:hidden;margin-bottom:12px;position:relative;">
        <div style="position:absolute;top:0;right:0;width:140px;height:64px;background-image:radial-gradient(rgba(255,90,30,.16) 1px,transparent 1.4px);background-size:8px 8px;pointer-events:none;"></div>
        <div style="display:flex;align-items:center;gap:16px;padding:16px 18px 16px 22px;position:relative;flex-wrap:wrap;">
          <span style="display:flex;align-items:center;gap:3px;flex-shrink:0;">
            <span style="width:6px;height:6px;border-radius:50%;background:#f4f4f2;box-shadow:0 0 7px rgba(255,255,255,.5);"></span>
            <span style="width:22px;height:6px;border-radius:3px;background:#f4f4f2;"></span>
            <span style="width:6px;height:6px;border-radius:50%;background:#ff4d12;box-shadow:0 0 7px rgba(255,77,18,.8);"></span>
          </span>
          <div style="flex:1;min-width:160px;">
            <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.18em;color:#7a7a72;margin-bottom:6px;">${this._label}</div>
            <div style="font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.04em;color:#cfcfca;">${this._filename}</div>
          </div>
          <div style="display:flex;gap:10px;flex-shrink:0;">
            <button data-act="copy" aria-label="Copy CV markdown to clipboard" style="border:none;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;color:#0b0b0b;background:#ff4d12;border-radius:999px;padding:9px 18px;font-weight:700;white-space:nowrap;cursor:pointer;">${copyLabel}</button>
            <button data-act="save" aria-label="Download CV markdown file" style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;color:#cfcfca;border:1px solid #2a2a2a;background:#0a0a0a;border-radius:999px;padding:9px 18px;font-weight:700;white-space:nowrap;cursor:pointer;">↓ SAVE</button>
          </div>
        </div>
      </div>`;

    const copyBtn = this.querySelector('button[data-act="copy"]');
    const saveBtn = this.querySelector('button[data-act="save"]');
    copyBtn.addEventListener('mouseenter', () => { if (!this._copied) copyBtn.style.background = '#ff5a1e'; });
    copyBtn.addEventListener('mouseleave', () => { copyBtn.style.background = '#ff4d12'; });
    saveBtn.addEventListener('mouseenter', () => { saveBtn.style.borderColor = '#3a3a3a'; saveBtn.style.color = '#f4f4f2'; });
    saveBtn.addEventListener('mouseleave', () => { saveBtn.style.borderColor = '#2a2a2a'; saveBtn.style.color = '#cfcfca'; });
    copyBtn.addEventListener('click', () => this._copy());
    saveBtn.addEventListener('click', () => this._save());
  }

  _copy() {
    const done = () => {
      this._copied = true;
      this._render();
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => { this._copied = false; this._render(); }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this._md).then(done).catch(() => { this._fallbackCopy(this._md); done(); });
    } else {
      this._fallbackCopy(this._md);
      done();
    }
  }

  _save() {
    const blob = new Blob([this._md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this._filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  _fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
  }
}

if (!customElements.get('cv-actions')) customElements.define('cv-actions', CvActions);
