/* Sonido 100% sintetizado (WebAudio) + voz hablada (speechSynthesis). Cero archivos de audio. */
(function () {
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51]; // pentatónica: siempre suena bien

  const Audio = {
    ctx: null,
    master: null,
    muted: false,
    speaking: false,
    lastSpeechEnd: 0,

    unlock() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.35;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    tone(freq, dur = 0.25, type = 'sine', delay = 0, vol = 0.6, slideTo = null) {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + dur + 0.05);
    },

    collect(step) {
      const f = NOTES[step % NOTES.length];
      this.tone(f, 0.3, 'sine');
      this.tone(f * 2, 0.18, 'triangle', 0.02, 0.15);
    },
    special() {
      [0, 4, 7, 12].forEach((n, i) => this.tone(659.25 * Math.pow(2, n / 12), 0.25, 'triangle', i * 0.06, 0.4));
    },
    celebrate() {
      [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((n, i) =>
        this.tone(523.25 * Math.pow(2, n / 12), 0.35, i % 2 ? 'triangle' : 'sine', i * 0.11, 0.45));
    },
    whoosh(up = true) {
      this.tone(up ? 300 : 700, 0.25, 'sine', 0, 0.25, up ? 900 : 250);
    },
    spin() {
      this.tone(400, 0.6, 'triangle', 0, 0.3, 1600);
    },

    _voice: null,
    _pickVoice() {
      if (this._voice || !('speechSynthesis' in window)) return this._voice;
      const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
      const pref = ['es-419', 'es-ar', 'es-mx', 'es-us', 'es-es'];
      for (const p of pref) {
        const v = vs.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(p));
        if (v) return (this._voice = v);
      }
      return (this._voice = vs[0] || null);
    },

    speak(text) {
      if (this.muted || !('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      const v = this._pickVoice();
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'es-ES';
      u.pitch = 1.6;  // voz aguda y tierna
      u.rate = 1.0;
      u.onstart = () => { this.speaking = true; };
      u.onend = u.onerror = () => { this.speaking = false; this.lastSpeechEnd = performance.now(); };
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    },

    /** true mientras el juego habla (y un ratito después) para que el reconocimiento de voz no se escuche a sí mismo. */
    isSelfTalking() {
      return this.speaking || performance.now() - this.lastSpeechEnd < 700;
    },
  };

  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { Audio._voice = null; };

  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.audio = Audio;
})();
