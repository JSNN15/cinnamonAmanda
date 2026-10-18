/* ==========================================================================
   NOMBRE DEL JUGADOR · "¿Cómo te llamas?"
   - La niña o el niño arma su nombre arrastrando letras del abecedario,
     tocándolas, escribiéndolas con el teclado o con el mando (celular o físico).
   - Se pide UNA sola vez por visita: se guarda en sessionStorage, así se
     recuerda de juego en juego (y al recargar) hasta que se cierra la web.
   - Todos los juegos leen el nombre con cinnaName() / Cinnamo.playerName.get().
   ========================================================================== */
(function () {
  const STORAGE_KEY = 'cinna_player_name';
  const MAX_LEN = 10;
  const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  const VOWELS = 'AEIOU';
  const FALLBACK = 'Peque';
  const LETTER_SAY = { Ñ: 'eñe', Y: 'ye', W: 'doble ve', V: 've', B: 'be', Q: 'cu', X: 'equis', H: 'hache', K: 'ka', G: 'ge', J: 'jota', Z: 'zeta', R: 'erre' };

  const storageGet = () => { try { return sessionStorage.getItem(STORAGE_KEY) || ''; } catch (_) { return ''; } };
  const storageSet = (v) => { try { sessionStorage.setItem(STORAGE_KEY, v); } catch (_) {} };

  // "SOFIA" -> "Sofia"
  const pretty = (raw) => raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : '';

  const speak = (text, rate = 0.9) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      u.rate = rate;
      u.pitch = 1.2;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  };
  const sfx = (kind) => {
    const A = window.Cinnamo && window.Cinnamo.audio;
    if (!A) return;
    try {
      A.unlock && A.unlock();
      if (kind === 'pop' && A.bubblePop) A.bubblePop(1);
      if (kind === 'back' && A.softBoing) A.softBoing();
      if (kind === 'cheer' && A.kawaiiChirp) A.kawaiiChirp('cheer');
    } catch (_) {}
  };

  const CSS = `
  .pn-overlay { position: fixed; inset: 0; z-index: 99990; display: flex; align-items: center; justify-content: center;
    padding: 12px; background: radial-gradient(circle at 50% 20%, #fff8fc 0%, #ffd6ea 45%, #a9d8ff 100%);
    font-family: var(--font, "Baloo 2", system-ui, sans-serif); color: #4b5f8f; touch-action: none; }
  .pn-overlay.pn-hidden { display: none; }
  .pn-card { width: min(960px, 100%); max-height: 100%; overflow: auto; background: rgba(255,255,255,0.92);
    border-radius: 32px; box-shadow: 0 18px 50px rgba(107,143,199,0.35); padding: clamp(14px, 3vw, 28px);
    display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2vh, 18px); }
  .pn-head { display: flex; align-items: center; gap: 14px; }
  .pn-head img { width: clamp(90px, 14vw, 150px); height: auto; animation: pnFloat 2.6s ease-in-out infinite; }
  .pn-head h1 { margin: 0; font-size: clamp(26px, 4.6vw, 46px); color: #e8679f; line-height: 1.05; }
  .pn-head p { margin: 4px 0 0; font-size: clamp(14px, 2vw, 19px); }
  .pn-slots { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; min-height: 84px; width: 100%;
    padding: 12px; border-radius: 26px; border: 4px dashed #ff8fbf; background: #fff1f8; transition: background .2s, transform .2s; }
  .pn-slots.pn-over { background: #ffe1f0; transform: scale(1.02); border-style: solid; }
  .pn-slot { width: clamp(44px, 7vw, 68px); height: clamp(56px, 8.5vw, 80px); border-radius: 16px; display: flex;
    align-items: center; justify-content: center; font-size: clamp(30px, 5vw, 50px); font-weight: 800; background: #fff;
    color: #47689e; box-shadow: inset 0 -4px 0 #ffd6ea; }
  .pn-slot.pn-new { animation: pnPop .35s ease; }
  .pn-slot.pn-cursor { background: transparent; box-shadow: none; color: #ff8fbf; animation: pnBlink 1s steps(2) infinite; }
  .pn-grid { display: grid; grid-template-columns: repeat(9, 1fr); gap: clamp(5px, 1vw, 10px); width: 100%; }
  .pn-key { border: none; border-radius: 16px; padding: 0; height: clamp(46px, 7.5vh, 66px); font-size: clamp(24px, 3.6vw, 36px);
    font-weight: 800; cursor: grab; color: #47689e; background: linear-gradient(#ffffff, #e6f1ff);
    box-shadow: 0 5px 0 #b9d3f5; transition: transform .1s; touch-action: none; }
  .pn-key.pn-vowel { color: #c2185b; background: linear-gradient(#ffffff, #ffe3f0); box-shadow: 0 5px 0 #f7b6d2; }
  .pn-key:active { transform: translateY(3px); box-shadow: 0 2px 0 #b9d3f5; }
  .pn-actions { display: flex; gap: 12px; width: 100%; justify-content: center; flex-wrap: wrap; }
  .pn-btn { border: none; border-radius: 22px; padding: 12px 26px; font-size: clamp(18px, 2.6vw, 26px); font-weight: 800;
    cursor: pointer; color: #fff; box-shadow: 0 5px 0 rgba(0,0,0,0.15); }
  .pn-btn-back { background: #9fb6dd; }
  .pn-btn-ok { background: linear-gradient(#5fd38d, #2fb36b); min-width: 200px; }
  .pn-btn-ok:disabled { opacity: .45; cursor: default; }
  .pn-focus { outline: 5px solid #f5a623; outline-offset: 3px; transform: scale(1.08); }
  .pn-hint { margin: 0; font-size: clamp(12px, 1.7vw, 15px); opacity: .8; text-align: center; }
  .pn-ghost { position: fixed; z-index: 99999; pointer-events: none; width: 64px; height: 64px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: #c2185b;
    background: #fff; box-shadow: 0 10px 24px rgba(0,0,0,0.25); transform: translate(-50%, -60%) rotate(-6deg); }
  .pn-hello { font-size: clamp(30px, 6vw, 60px); color: #e8679f; font-weight: 800; text-align: center; animation: pnPop .5s ease; }
  .pn-chip { display: inline-flex; align-items: center; gap: 8px; margin: 6px auto 0; padding: 6px 14px; border-radius: 999px;
    border: none; background: rgba(255,255,255,0.85); color: #e8679f; font-size: 17px; font-weight: 800; cursor: pointer;
    box-shadow: 0 3px 0 #f7b6d2; font-family: inherit; }
  .pn-chip small { color: #6b8fc7; font-weight: 700; }
  @keyframes pnFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes pnPop { 0% { transform: scale(.4); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
  @keyframes pnBlink { 50% { opacity: 0; } }
  @media (max-width: 560px) { .pn-grid { grid-template-columns: repeat(7, 1fr); } .pn-head { flex-direction: column; text-align: center; } }
  @media (max-height: 520px) { .pn-head img { display: none; } .pn-key { height: 42px; } }
  `;

  class PlayerName {
    constructor() {
      // En MAYÚSCULAS, solo letras A-Z y Ñ (así nunca entra HTML en los textos de los juegos)
      this.name = storageGet().toUpperCase().replace(/[^A-ZÑ]/g, '').slice(0, MAX_LEN);
      this.draft = '';
      this.open_ = false;
      this.focusIdx = 0;
      this.navMode = false;            // true cuando se navega con flechas/mando
      this.listeners = [];
    }

    /* ---------- API pública ---------- */
    get() { return pretty(this.name); }
    upper() { return this.name; }
    has() { return !!this.name; }
    isOpen() { return this.open_; }
    onChange(fn) { this.listeners.push(fn); }

    open(forceNew = false) {
      this.build();
      this.draft = forceNew ? '' : this.name;
      this.focusIdx = 0;
      this.navMode = false;
      this.open_ = true;
      this.overlay.classList.remove('pn-hidden');
      this.overlay.setAttribute('aria-hidden', 'false');
      this.renderAsk();
      this.syncController();
      speak('¡Hola! ¿Cómo te llamas? Arma tu nombre con las letras.');
    }

    /* ---------- Construcción del DOM ---------- */
    build() {
      if (this.overlay) return;
      const style = document.createElement('style');
      style.textContent = CSS;
      document.head.appendChild(style);

      this.overlay = document.createElement('div');
      this.overlay.className = 'pn-overlay pn-hidden';
      this.overlay.setAttribute('role', 'dialog');
      this.overlay.setAttribute('aria-label', 'Escribe tu nombre');
      this.overlay.innerHTML = '<div class="pn-card"></div>';
      document.body.appendChild(this.overlay);
      this.card = this.overlay.firstElementChild;

      window.addEventListener('keydown', (e) => this.onKey(e), true);
      window.addEventListener('keyup', (e) => { if (this.open_) { e.stopImmediatePropagation(); } }, true);
    }

    renderAsk() {
      this.card.innerHTML = `
        <div class="pn-head">
          <img src="assets/cinnamoroll_fly.png" alt="Cinnamoroll" />
          <div>
            <h1>¡Hola! ¿Cómo te llamas?</h1>
            <p>Arrastra o toca las letras para armar tu nombre ✨</p>
          </div>
        </div>
        <div class="pn-slots" aria-live="polite"></div>
        <div class="pn-grid">
          ${LETTERS.map(ch => `<button class="pn-key ${VOWELS.includes(ch) ? 'pn-vowel' : ''}" data-char="${ch}" aria-label="Letra ${ch}">${ch}</button>`).join('')}
        </div>
        <div class="pn-actions">
          <button class="pn-btn pn-btn-back" data-act="back">⌫ Borrar</button>
          <button class="pn-btn pn-btn-ok" data-act="ok">✅ ¡Listo!</button>
        </div>
        <p class="pn-hint">⌨️ También puedes escribir con el teclado · 🎮 Con el mando: flechas para moverte, A para elegir, B para borrar</p>
      `;
      this.slotsEl = this.card.querySelector('.pn-slots');
      this.okBtn = this.card.querySelector('[data-act="ok"]');
      this.focusables = Array.from(this.card.querySelectorAll('.pn-key, .pn-btn'));

      this.card.querySelectorAll('.pn-key').forEach(btn => this.bindDrag(btn));
      this.card.querySelector('[data-act="back"]').addEventListener('click', () => this.backspace());
      this.okBtn.addEventListener('click', () => this.confirm());
      this.renderSlots();
      this.renderFocus();
    }

    renderSlots() {
      if (!this.slotsEl) return;
      const letters = this.draft.split('');
      let html = letters.map((ch, i) => `<div class="pn-slot${this.justAdded && i === letters.length - 1 ? ' pn-new' : ''}">${ch}</div>`).join('');
      if (letters.length < MAX_LEN) html += '<div class="pn-slot pn-cursor">▍</div>';
      this.slotsEl.innerHTML = html;
      if (this.okBtn) this.okBtn.disabled = letters.length === 0;
      this.justAdded = false;
    }

    renderFocus() {
      if (!this.focusables) return;
      this.focusables.forEach((el, i) => el.classList.toggle('pn-focus', this.navMode && i === this.focusIdx));
    }

    /* ---------- Arrastrar (o tocar) letras ---------- */
    bindDrag(btn) {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const ch = btn.dataset.char;
        const startX = e.clientX, startY = e.clientY;
        let ghost = null;
        try { btn.setPointerCapture(e.pointerId); } catch (_) {}

        const overSlots = (x, y) => {
          const r = this.slotsEl.getBoundingClientRect();
          return x >= r.left - 20 && x <= r.right + 20 && y >= r.top - 20 && y <= r.bottom + 20;
        };
        const move = (ev) => {
          if (!ghost && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 10) {
            ghost = document.createElement('div');
            ghost.className = 'pn-ghost';
            ghost.textContent = ch;
            document.body.appendChild(ghost);
          }
          if (ghost) {
            ghost.style.left = ev.clientX + 'px';
            ghost.style.top = ev.clientY + 'px';
            this.slotsEl.classList.toggle('pn-over', overSlots(ev.clientX, ev.clientY));
          }
        };
        const end = (ev) => {
          btn.removeEventListener('pointermove', move);
          btn.removeEventListener('pointerup', end);
          btn.removeEventListener('pointercancel', end);
          try { btn.releasePointerCapture(e.pointerId); } catch (_) {}
          this.slotsEl.classList.remove('pn-over');
          if (ghost) {
            ghost.remove();
            // Soltar sobre la nube de letras = agregar; soltar fuera = no pasa nada
            if (ev.type === 'pointerup' && overSlots(ev.clientX, ev.clientY)) this.addLetter(ch);
          } else if (ev.type === 'pointerup') {
            this.addLetter(ch); // Toque simple
          }
        };
        btn.addEventListener('pointermove', move);
        btn.addEventListener('pointerup', end);
        btn.addEventListener('pointercancel', end);
      });
    }

    /* ---------- Edición ---------- */
    addLetter(ch) {
      if (!this.open_ || !LETTERS.includes(ch)) return;
      if (this.draft.length >= MAX_LEN) { sfx('back'); return; }
      this.draft += ch;
      this.justAdded = true;
      sfx('pop');
      speak(LETTER_SAY[ch] || ch.toLowerCase(), 1);
      this.renderSlots();
    }

    backspace() {
      if (!this.open_ || !this.draft) return;
      this.draft = this.draft.slice(0, -1);
      sfx('back');
      this.renderSlots();
    }

    confirm() {
      if (!this.open_ || !this.draft) return;
      this.name = this.draft;
      storageSet(this.name);
      const nice = this.get();
      sfx('cheer');
      speak(`¡Hola, ${nice}! ¡Vamos a jugar!`);
      this.card.innerHTML = `
        <div class="pn-head"><img src="assets/cinnamoroll_fly.png" alt="Cinnamoroll" /></div>
        <div class="pn-hello">¡Hola, ${nice}! 💖</div>
        <p class="pn-hint" style="font-size:20px">¡Vamos a jugar con Cinnamoroll!</p>`;
      this.focusables = null;
      this.listeners.forEach(fn => { try { fn(nice); } catch (_) {} });
      this.updateHubChip();
      setTimeout(() => this.close(), 1600);
    }

    close() {
      this.open_ = false;
      this.overlay.classList.add('pn-hidden');
      this.overlay.setAttribute('aria-hidden', 'true');
      this.syncController();
    }

    /* ---------- Teclado físico ---------- */
    onKey(e) {
      if (!this.open_) return;
      e.stopImmediatePropagation();
      if (!this.focusables) { e.preventDefault(); return; } // pantalla de saludo
      const k = e.key || '';
      const code = e.code || '';
      if (k.length === 1 && /[a-zñA-ZÑ]/.test(k)) {
        e.preventDefault();
        this.navMode = false;
        this.renderFocus();
        this.addLetter(k.toUpperCase());
        return;
      }
      if (k === 'Backspace' || k === 'Delete' || code === 'KeyE') { e.preventDefault(); this.backspace(); return; }
      if (k === 'Escape') { e.preventDefault(); return; }
      const dir = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[code || k];
      if (dir) { e.preventDefault(); this.moveFocus(dir); return; }
      if (k === 'Enter' || code === 'Space' || k === ' ') {
        e.preventDefault();
        // Enter tras escribir con el teclado = Listo; con flechas = elegir la letra resaltada
        if (this.navMode) this.activateFocused();
        else if (k === 'Enter') this.confirm();
      }
    }

    moveFocus(dir) {
      if (!this.focusables) return;
      if (!this.navMode) { this.navMode = true; this.renderFocus(); return; }
      const cols = getComputedStyle(this.card.querySelector('.pn-grid')).gridTemplateColumns.split(' ').length || 9;
      const nKeys = LETTERS.length;
      const total = this.focusables.length; // letras + Borrar + Listo
      let i = this.focusIdx;
      if (dir === 'left') i = Math.max(0, i - 1);
      if (dir === 'right') i = Math.min(total - 1, i + 1);
      if (dir === 'down') {
        if (i < nKeys) i = (i + cols < nKeys) ? i + cols : nKeys + 1; // fila final -> ¡Listo!
      }
      if (dir === 'up') {
        if (i >= nKeys) i = nKeys - 1 - ((nKeys - 1) % cols);
        else i = Math.max(0, i - cols);
      }
      this.focusIdx = i;
      sfx('pop');
      this.renderFocus();
    }

    activateFocused() {
      const el = this.focusables && this.focusables[this.focusIdx];
      if (!el) return;
      if (el.dataset.char) this.addLetter(el.dataset.char);
      else if (el.dataset.act === 'back') this.backspace();
      else if (el.dataset.act === 'ok') this.confirm();
    }

    /* ---------- Mando (celular o físico) ---------- */
    handlePad(btn, pressed) {
      if (!pressed || !this.focusables) return;
      if (['left', 'right', 'up', 'down'].includes(btn)) this.moveFocus(btn);
      else if (btn === 'jump') { if (!this.navMode) { this.navMode = true; this.renderFocus(); } else this.activateFocused(); }
      else if (btn === 'treat') this.backspace();
    }

    // Teclado A-Z del celular: letra, 'BACK' o 'OK'
    pressKey(ch) {
      if (!this.open_) return;
      if (ch === 'BACK') this.backspace();
      else if (ch === 'OK') this.confirm();
      else this.addLetter(String(ch || '').toUpperCase());
    }

    syncController() {
      const bridge = window.Cinnamo && window.Cinnamo.controllerBridge;
      if (bridge && bridge.broadcastGameContext) {
        bridge.broadcastGameContext(bridge.lastGameContext || { screen: (window.Cinnamo.hub && window.Cinnamo.hub.currentScreen) || 'hub' });
      }
    }

    /* ---------- Saludo en el menú principal ---------- */
    updateHubChip() {
      const header = document.querySelector('#screen-hub .hub-header');
      if (!header) return;
      let chip = document.getElementById('pnHubChip');
      if (!chip) {
        chip = document.createElement('button');
        chip.id = 'pnHubChip';
        chip.className = 'pn-chip';
        chip.title = 'Cambiar de jugador';
        chip.addEventListener('click', () => this.open(true));
        const h1 = header.querySelector('h1');
        if (h1 && h1.nextSibling) header.insertBefore(chip, h1.nextSibling);
        else header.appendChild(chip);
      }
      chip.innerHTML = this.name ? `👋 ¡Hola, ${this.get()}! <small>· cambiar</small>` : '✏️ Escribe tu nombre';
    }

    init() {
      this.build();
      this.updateHubChip();
      if (!this.name) this.open(true);
    }
  }

  const pn = new PlayerName();
  const pre = document.querySelector('#appPreloader .preloader-sub');
  if (pre && pn.has()) pre.textContent = `¡Preparando dulces para ${pn.get()}! ✨`;
  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.playerName = pn;
  // Atajo para los textos de los juegos: `¡Bravo ${cinnaName()}!`
  window.cinnaName = () => pn.get() || FALLBACK;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => pn.init());
  else pn.init();
})();
