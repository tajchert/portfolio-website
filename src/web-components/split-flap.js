/* ───────────────────────────────────────────────────────────────
   <split-flap> — mechanical split-flap (Solari) display web component
   for the TE × Nothing design language.

   • Every character is its own flap "cell".
   • Cells join into one display element (the whole component).
   • On a value change each cell flips FORWARD through the charset one
     step at a time until it lands on its target glyph — going A→C
     rattles through B, exactly like an airport / station board.
     (Forward-only with wrap-around, the way real boards spin.)

   Attributes
   ──────────
   value      string shown (static mode)
   length     fixed number of cells (else derived from value/values)
   charset    "alpha" | "num" | any literal string of glyphs (order = flip order)
   theme      "dark" (default) | "light" | "orange" | "paper"
              (paper = white flap, black letter, black hinge infill + dark border)
   size       cell height in px (default 64)
   gap        px gap between cells (default 6)
   align      "left" | "center" (default) | "right"
   flapms     ms per single flap step (default 78)
   mode       "static" (default) | "clock" | "cycle"
   values     comma-separated list for mode="cycle"
   interval   cycle dwell: ms a word is held AFTER the flaps settle (default 3200)

   Public API
   ──────────
   el.value = "NOTHING"      // setter, triggers the flip
   el.set("NOTHING")         // same
   ─────────────────────────────────────────────────────────────── */

const SF_CHARSETS = {
  alpha: " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-:/!",
  num:   " 0123456789.,:-",
};

class SplitFlap extends HTMLElement {
  static get observedAttributes() {
    return ["value", "values", "mode", "length", "charset", "theme", "size", "gap", "flapms", "interval", "align"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cells = [];
    this._built = false;
    this._timer = null;
    this._cycleTimer = null;
    this._cycleStopped = false;
    this._value = "";
  }

  connectedCallback() {
    if (!this._built) this._build();
    this._startMode();
  }
  disconnectedCallback() { this._stop(); }

  attributeChangedCallback(name, oldV, newV) {
    if (oldV === newV || !this._built) return;
    if (["length", "charset", "theme", "size", "gap", "align"].includes(name)) {
      this._build();
      this._startMode();
    } else if (name === "value") {
      this._render(newV);
    } else if (name === "mode" || name === "values" || name === "interval") {
      this._stop();
      this._startMode();
    }
  }

  /* ── config readers ── */
  _cfg() {
    const csAttr = this.getAttribute("charset") || "alpha";
    const charset = SF_CHARSETS[csAttr] || csAttr;
    const h = parseInt(this.getAttribute("size") || "64", 10);
    const gap = parseInt(this.getAttribute("gap") || "6", 10);
    const theme = this.getAttribute("theme") || "dark";
    const align = this.getAttribute("align") || "center";
    const flapms = parseInt(this.getAttribute("flapms") || "78", 10);
    let len = parseInt(this.getAttribute("length") || "0", 10);
    if (!len) {
      const v = this.getAttribute("value") || "";
      const vals = (this.getAttribute("values") || "").split(",");
      len = Math.max(v.length, ...vals.map((s) => s.trim().length), 1);
    }
    return { charset, h, gap, theme, align, flapms, len };
  }

  set value(v) { this.setAttribute("value", v); }
  get value() { return this._value; }
  set(v) { this.value = v; }

  /* ── build the cell DOM ── */
  _build() {
    const { charset, h, gap, theme, align, len } = this._cfg();
    this._charset = charset;
    this._idxOf = {};
    for (let i = 0; i < charset.length; i++) this._idxOf[charset[i]] = i;

    const w = Math.round(h * 0.72);
    const fs = Math.round(h * 0.64);
    const rad = Math.max(4, Math.round(h * 0.09));

    // seamH = thickness of the hinge line, seamOp = its opacity, bw = cell border
    // width, pin = side-hinge colour (falls back to faceBot). Seam is 1px on the
    // standard themes so it no longer cuts into the glyph; "paper" keeps a bolder
    // black hinge as a deliberate design cue.
    const DEFAULTS = { seamH: 1, seamOp: 0.9, bw: 1, pin: null };
    const FALLBACK = { face: "#0c0c0c", faceTop: "#161616", faceBot: "#070707", ink: "#f4f4f2", seam: "#000", edge: "#242424", shade: "rgba(0,0,0,.55)" };
    const T = {
      dark:   { face: "#0c0c0c", faceTop: "#161616", faceBot: "#070707", ink: "#f4f4f2", seam: "#000", edge: "#242424", shade: "rgba(0,0,0,.55)" },
      light:  { face: "#eceae3", faceTop: "#f4f2ec", faceBot: "#e2dfd5", ink: "#0c0c0d", seam: "#cfccc2", edge: "#d6d3c8", shade: "rgba(0,0,0,.18)" },
      orange: { face: "#0c0c0c", faceTop: "#161616", faceBot: "#070707", ink: "#ff5a1e", seam: "#000", edge: "#2a1a12", shade: "rgba(0,0,0,.55)" },
      // paper — white card, black letter, crisp black hinge "infill" + dark frame
      paper:  { face: "#ffffff", faceTop: "#ffffff", faceBot: "#f4f3ec", ink: "#0b0b0c", seam: "#0a0a0a", edge: "#141414", shade: "rgba(0,0,0,.14)", seamH: 1.5, seamOp: 1, bw: 2, pin: "#1a1a1a" },
    }[theme];
    const t = { ...DEFAULTS, ...(T || FALLBACK) };

    this.shadowRoot.innerHTML = `
      <style>
        :host{ display:inline-block; }
        .board{ display:flex; gap:${gap}px; align-items:center; }
        .cell{
          position:relative; width:${w}px; height:${h}px; flex:0 0 auto;
          perspective:${h * 4}px; border-radius:${rad}px;
          background:${t.face};
          box-shadow: inset 0 0 0 ${t.bw}px ${t.edge}, 0 2px 4px rgba(0,0,0,.18);
          font-family:'Helvetica Neue', Arial, sans-serif; font-weight:700;
          font-size:${fs}px; color:${t.ink}; user-select:none;
        }
        .panel,.fold{ position:absolute; left:0; width:100%; height:50%; overflow:hidden; }
        .panel.top,.fold.top{ top:0; border-radius:${rad}px ${rad}px 0 0; }
        .panel.bottom,.fold.bottom{ bottom:0; border-radius:0 0 ${rad}px ${rad}px; }
        .panel.top{ background:linear-gradient(${t.faceTop},${t.face}); }
        .panel.bottom{ background:linear-gradient(${t.face},${t.faceBot}); }
        .fold.top{ background:linear-gradient(${t.faceTop},${t.face}); transform-origin:50% 100%; z-index:3; }
        .fold.bottom{ background:linear-gradient(${t.face},${t.faceBot}); transform-origin:50% 0%; transform:rotateX(90deg); z-index:2; }
        .fold{ backface-visibility:hidden; will-change:transform; }
        .txt{ position:absolute; left:0; width:100%; height:200%; line-height:${h}px; text-align:center; letter-spacing:-.02em; }
        .panel.top .txt,.fold.top .txt{ top:0; }
        .panel.bottom .txt,.fold.bottom .txt{ top:-100%; }
        .seam{ position:absolute; left:0; right:0; top:50%; height:${t.seamH}px; transform:translateY(${-t.seamH / 2}px);
               background:${t.seam}; opacity:${t.seamOp}; z-index:4; pointer-events:none; }
        .pin{ position:absolute; top:50%; width:${Math.max(2, Math.round(h * 0.04))}px;
              height:${Math.max(4, Math.round(h * 0.1))}px; transform:translateY(-50%);
              background:${t.pin || t.faceBot}; box-shadow:inset 0 0 0 1px ${t.edge}; z-index:5; }
        .pin.l{ left:-1px; border-radius:0 ${rad}px ${rad}px 0; }
        .pin.r{ right:-1px; border-radius:${rad}px 0 0 ${rad}px; }
        .shade{ position:absolute; left:0; right:0; bottom:0; height:60%;
                background:linear-gradient(to bottom, transparent, ${t.shade}); opacity:0;
                pointer-events:none; z-index:3; }
      </style>
      <div class="board" part="board"></div>
    `;
    const board = this.shadowRoot.querySelector(".board");
    this._cells = [];
    const blank = charset[0];
    for (let i = 0; i < len; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.innerHTML = `
        <div class="panel top"><div class="txt">${blank}</div></div>
        <div class="panel bottom"><div class="txt">${blank}</div></div>
        <div class="fold top"><div class="txt">${blank}</div><div class="shade"></div></div>
        <div class="fold bottom"><div class="txt">${blank}</div></div>
        <div class="seam"></div><div class="pin l"></div><div class="pin r"></div>`;
      const refs = {
        el: cell,
        topTxt: cell.querySelector(".panel.top .txt"),
        botTxt: cell.querySelector(".panel.bottom .txt"),
        foldTop: cell.querySelector(".fold.top"),
        foldTopTxt: cell.querySelector(".fold.top .txt"),
        foldTopShade: cell.querySelector(".fold.top .shade"),
        foldBottom: cell.querySelector(".fold.bottom"),
        foldBottomTxt: cell.querySelector(".fold.bottom .txt"),
        idx: 0, cur: blank, target: blank, animating: false,
      };
      this._cells.push(refs);
      board.appendChild(cell);
    }
    this._built = true;
  }

  /* ── normalise a string into one char per cell ── */
  _normalize(str) {
    const { align } = this._cfg();
    const blank = this._charset[0];
    let s = (str == null ? "" : String(str)).toUpperCase();
    s = s.split("").map((c) => (c in this._idxOf ? c : blank)).join("");
    const n = this._cells.length;
    if (s.length > n) s = s.slice(0, n);
    const pad = n - s.length;
    if (pad > 0) {
      if (align === "right") s = blank.repeat(pad) + s;
      else if (align === "left") s = s + blank.repeat(pad);
      else { const l = Math.floor(pad / 2); s = blank.repeat(l) + s + blank.repeat(pad - l); }
    }
    return s;
  }

  _render(str) {
    if (!this._built) this._build();
    this._value = str == null ? "" : String(str);
    const norm = this._normalize(str);
    const spins = [];
    for (let i = 0; i < this._cells.length; i++) {
      spins.push(this._spin(this._cells[i], norm[i]));
    }
    // resolves once every cell has flipped to its target (board is static)
    return Promise.all(spins);
  }

  /* ── one flap step: cur → next ── */
  _flipStep(cell, curCh, nextCh) {
    const { flapms } = this._cfg();
    cell.foldTopTxt.textContent = curCh;
    cell.foldTop.style.transform = "rotateX(0deg)";
    cell.foldTop.style.display = "block";
    cell.foldTopShade.style.opacity = "0";
    cell.botTxt.textContent = curCh;     // bottom keeps current until leaf falls
    cell.topTxt.textContent = nextCh;    // static top already shows next (revealed)
    cell.foldBottomTxt.textContent = nextCh;
    cell.foldBottom.style.transform = "rotateX(90deg)";
    cell.foldBottom.style.display = "block";

    return new Promise((res) => {
      // setTimeout drives the tween (not rAF): it keeps firing even when the
      // board is offscreen/backgrounded, so a hidden flap snaps to target
      // rather than freezing mid-flip. Visible → ~60fps; hidden → instant.
      const t0 = performance.now();
      const frame = () => {
        let p = (performance.now() - t0) / flapms;
        if (p > 1) p = 1;
        if (p < 0.5) {
          const a = p / 0.5;
          cell.foldTop.style.transform = `rotateX(${-90 * a}deg)`;
          cell.foldTopShade.style.opacity = String(a * 0.85);
        } else {
          cell.foldTop.style.display = "none";
          const a = (p - 0.5) / 0.5;
          cell.foldBottom.style.transform = `rotateX(${90 - 90 * a}deg)`;
        }
        if (p < 1) setTimeout(frame, 16);
        else {
          cell.botTxt.textContent = nextCh;
          cell.foldBottom.style.transform = "rotateX(90deg)";
          cell.foldBottom.style.display = "none";
          res();
        }
      };
      setTimeout(frame, 16);
    });
  }

  async _spin(cell, targetCh) {
    if (!(targetCh in this._idxOf)) targetCh = this._charset[0];
    cell.target = targetCh;
    if (cell.animating) return;          // running loop will chase the new target
    cell.animating = true;
    const N = this._charset.length;
    while (cell.cur !== cell.target) {
      const nextIdx = (cell.idx + 1) % N;
      const nextCh = this._charset[nextIdx];
      await this._flipStep(cell, this._charset[cell.idx], nextCh);
      cell.idx = nextIdx;
      cell.cur = nextCh;
    }
    cell.animating = false;
  }

  /* ── self-driving modes ── */
  _stop() {
    this._cycleStopped = true;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    if (this._cycleTimer) { clearTimeout(this._cycleTimer); this._cycleTimer = null; }
  }
  _startMode() {
    this._stop();
    this._cycleStopped = false;
    const mode = this.getAttribute("mode") || "static";
    if (mode === "clock") {
      const tick = () => {
        const d = new Date();
        const p = (n) => String(n).padStart(2, "0");
        this._render(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
      };
      tick();
      this._timer = setInterval(tick, 1000);
    } else if (mode === "cycle") {
      const list = (this.getAttribute("values") || "").split(",").map((s) => s.trim()).filter(Boolean);
      if (!list.length) return;
      // interval = dwell time the word is held AFTER the flaps settle (static)
      const dwell = parseInt(this.getAttribute("interval") || "3200", 10);
      let i = 0;
      const step = async () => {
        if (this._cycleStopped) return;
        await this._render(list[i]);          // wait until the board is static
        if (this._cycleStopped) return;
        this._cycleTimer = setTimeout(() => {
          // pick a random next word, never repeating the one currently shown
          if (list.length > 1) {
            let next;
            do { next = Math.floor(Math.random() * list.length); } while (next === i);
            i = next;
          }
          step();
        }, dwell);
      };
      step();
    } else {
      if (this.hasAttribute("value")) this._render(this.getAttribute("value"));
    }
  }
}

if (!customElements.get("split-flap")) customElements.define("split-flap", SplitFlap);
