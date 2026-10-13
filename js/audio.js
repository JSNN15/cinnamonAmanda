/* Audio Engine 100% sintetizado con Web Audio API:
 *  - Música relajante procedural de Caja de Música / Celesta (tipo cuna / Sanrio lullaby)
 *  - Efectos kawaii y tiernos (burbujas para contar, arpas mágicas, risitas y campanitas)
 *  - CERO voces robóticas espeluznantes.
 */
(function () {
  // Escala pentatónica y acordes mágicos (C Mayor / F Mayor / G Mayor)
  const PENTATONIC = [
    261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
    523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
    1046.50, 1174.66, 1318.51, 1567.98       // C6, D6, E6, G6
  ];

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.musicPlaying = false;
      this.musicTimer = null;
      this.muted = false;
      this.currentMelodyIndex = 0;
    }

    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      // Music bus (con filtro cálido tipo caja de música de cuerda)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.28;

      // Filtro para sonido aterciopelado
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.value = 2400;

      // Eco sutil (delay / reverb cálido)
      this.musicDelay = this.ctx.createDelay();
      this.musicDelay.delayTime.value = 0.28;
      this.musicDelayGain = this.ctx.createGain();
      this.musicDelayGain.gain.value = 0.25;

      this.musicGain.connect(this.musicFilter);
      this.musicFilter.connect(this.masterGain);
      this.musicFilter.connect(this.musicDelay);
      this.musicDelay.connect(this.musicDelayGain);
      this.musicDelayGain.connect(this.musicFilter);
    }

    unlock() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    setMuted(m) {
      this.muted = m;
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(m ? 0 : 0.4, this.ctx.currentTime);
      }
    }

    /* ---------- SÍNTESIS DE INSTRUMENTOS ---------- */

    // Campana de caja de música (Music box tine)
    playMusicBoxTine(freq, time, vol = 0.5, dur = 1.4) {
      if (!this.ctx || this.muted) return;
      const t = time || this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      // Armónico sutil metálico agudo característico de las láminas de acero
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 3.01, t);

      const g2 = this.ctx.createGain();
      g2.gain.value = 0.15;
      osc2.connect(g2).connect(gain);
      osc1.connect(gain);

      // Envolvente percusiva de campana de música
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      gain.connect(this.musicGain);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur + 0.05);
      osc2.stop(t + dur + 0.05);
    }

    // Efecto Kawaii de formantes (sonido tierno tipo "¡Waaai!" o "¡Kyu!")
    kawaiiChirp(type = 'cheer') {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Doble filtro de formantes para simular fonética tierna
      const f1 = this.ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.Q.value = 4.0;
      f1.frequency.value = 1100;

      const f2 = this.ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.Q.value = 5.0;
      f2.frequency.value = 2600;

      osc.type = 'triangle';
      if (type === 'cheer') {
        // Barrido ascendente alegre
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(980, t + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1180, t + 0.28);
      } else {
        // Suspiro curioso
        osc.frequency.setValueAtTime(700, t);
        osc.frequency.exponentialRampToValueAtTime(540, t + 0.12);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.26);
      }

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(f1);
      osc.connect(f2);
      f1.connect(gain);
      f2.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.35);
    }

    // Burbuja suave para contar (Pop acústico)
    bubblePop(step = 0) {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Frecuencia que escala según el número que se cuenta
      const base = 440 * Math.pow(1.08, step % 12);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * 1.6, t + 0.04);
      osc.frequency.exponentialRampToValueAtTime(base * 0.8, t + 0.09);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

      osc.connect(gain).connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.13);
    }

    // Pincel mágico / pintar zona (shimmer brillante)
    colorSplat() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      [587.33, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, t + idx * 0.035);
        g.gain.setValueAtTime(0.001, t + idx * 0.035);
        g.gain.exponentialRampToValueAtTime(0.2, t + idx * 0.035 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.035 + 0.28);
        o.connect(g).connect(this.sfxGain);
        o.start(t + idx * 0.035);
        o.stop(t + idx * 0.035 + 0.3);
      });
    }

    // Resorte suave y tierno para intentar de nuevo (CERO bocina fea de error)
    softBoing() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.22);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);

      osc.connect(gain).connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.28);
    }

    // Arpa de celebración y aplauso mágico
    celebrate() {
      if (!this.ctx || this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
      const t = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.setValueAtTime(freq, t + i * 0.06);
        g.gain.setValueAtTime(0.001, t + i * 0.06);
        g.gain.linearRampToValueAtTime(0.35, t + i * 0.06 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.45);
        o.connect(g).connect(this.sfxGain);
        o.start(t + i * 0.06);
        o.stop(t + i * 0.06 + 0.5);
      });

      // Risita alegre de fondo
      setTimeout(() => this.kawaiiChirp('cheer'), 280);
    }

    // Recolección de estrellas en el juego de volar
    collect(step) {
      if (!this.ctx || this.muted) return;
      const f = PENTATONIC[(step + 5) % PENTATONIC.length];
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g).connect(this.sfxGain);
      o.start(t);
      o.stop(t + 0.38);
    }

    spin() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(420, t);
      o.frequency.exponentialRampToValueAtTime(1400, t + 0.5);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      o.connect(g).connect(this.sfxGain);
      o.start(t);
      o.stop(t + 0.6);
      this.kawaiiChirp('cheer');
    }

    whoosh(up = true) {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(up ? 350 : 700, t);
      o.frequency.exponentialRampToValueAtTime(up ? 850 : 320, t + 0.22);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      o.connect(g).connect(this.sfxGain);
      o.start(t);
      o.stop(t + 0.26);
    }

    // Campanita cristalina suave para encaje de letras y piezas de rompecabezas
    bellChime(freq = 587.33) {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t + 0.08);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.32, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);

      osc.connect(gain).connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.4);
    }

    // Campanitas mágicas en cascada de estrellas
    sparkleChime() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const freqs = [880, 1046.50, 1318.51, 1760];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + idx * 0.04);

        gain.gain.setValueAtTime(0.001, t + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.28);

        osc.connect(gain).connect(this.sfxGain);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.3);
      });
    }

    /* ---------- MÚSICA PROCEDURAL DE CAJA DE MÚSICA ---------- */

    getTracks() {
      return TRACKS;
    }

    getCurrentTrack() {
      return TRACKS[this.currentTrackIndex % TRACKS.length];
    }

    setTrack(index) {
      this.currentTrackIndex = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
      this.currentMelodyIndex = 0;
      this.loopsInCurrentTrack = 0;
      if (this.musicPlaying) {
        if (this.musicTimer) clearTimeout(this.musicTimer);
        this.tickMusic();
      }
      return this.getCurrentTrack();
    }

    nextTrack() {
      const next = this.setTrack(this.currentTrackIndex + 1);
      this.kawaiiChirp('cheer');
      return next;
    }

    startMusic() {
      this.unlock();
      if (this.musicPlaying) return;
      this.musicPlaying = true;
      this.tickMusic();
    }

    stopMusic() {
      this.musicPlaying = false;
      if (this.musicTimer) {
        clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }
    }

    toggleMusic() {
      if (this.musicPlaying) {
        this.stopMusic();
        return false;
      } else {
        this.startMusic();
        return true;
      }
    }

    tickMusic() {
      if (!this.musicPlaying) return;

      const track = this.getCurrentTrack();
      const bars = track.bars;
      const barIndex = this.currentMelodyIndex % bars.length;
      const bar = bars[barIndex];
      const now = this.ctx.currentTime;
      const stepTime = track.stepTime;

      bar.forEach((note, idx) => {
        // La nota principal suena con campanita dulce de caja de música
        this.playMusicBoxTine(note, now + idx * stepTime, idx === 0 ? 0.35 : 0.22, 1.2);
        // En el primer tiempo de cada compás, nota baja de bajo
        if (idx === 0) {
          this.playMusicBoxTine(note / 2, now, 0.26, 1.6);
        }
      });

      this.currentMelodyIndex++;
      // Si completó 2 vueltas de la canción, pasar suavemente a la siguiente melodía
      if (this.currentMelodyIndex >= bars.length * 2) {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % TRACKS.length;
        this.currentMelodyIndex = 0;
      }

      this.musicTimer = setTimeout(() => this.tickMusic(), bar.length * stepTime * 1000 - 45);
    }
  }

  const TRACKS = [
    {
      id: 'lullaby',
      name: 'Nubes de Algodón',
      icon: '🌸',
      stepTime: 0.38,
      bars: [
        // C - Am (3/4 dulce de cuna)
        [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25],
        [440.00, 523.25, 659.25, 880.00, 659.25, 523.25],
        // F - G
        [349.23, 440.00, 523.25, 698.46, 523.25, 440.00],
        [392.00, 493.88, 587.33, 783.99, 987.77, 783.99],
        // C - Em
        [523.25, 659.25, 783.99, 1318.51, 1046.50, 783.99],
        [329.63, 392.00, 493.88, 659.25, 493.88, 392.00],
        // Dm - G (resolución dulce)
        [293.66, 349.23, 440.00, 587.33, 523.25, 440.00],
        [392.00, 493.88, 587.33, 783.99, 659.25, 523.25]
      ]
    },
    {
      id: 'bakery',
      name: 'Paseo por la Pastelería',
      icon: '🧁',
      stepTime: 0.24,
      bars: [
        // Marchita alegre en F y C
        [698.46, 783.99, 880.00, 1046.50, 880.00, 698.46],
        [523.25, 659.25, 783.99, 1046.50, 783.99, 523.25],
        [587.33, 698.46, 880.00, 1174.66, 880.00, 698.46],
        [783.99, 987.77, 1174.66, 1318.51, 1174.66, 987.77],
        [1046.50, 880.00, 698.46, 880.00, 1046.50, 1318.51],
        [1174.66, 987.77, 783.99, 987.77, 1174.66, 1046.50]
      ]
    },
    {
      id: 'tea',
      name: 'Hora del Té con Mocha',
      icon: '☕',
      stepTime: 0.32,
      bars: [
        // Vals en G y Em
        [392.00, 587.33, 783.99, 987.77, 783.99, 587.33],
        [329.63, 493.88, 659.25, 880.00, 659.25, 493.88],
        [440.00, 659.25, 880.00, 1100.00, 880.00, 659.25],
        [587.33, 880.00, 1174.66, 987.77, 783.99, 587.33],
        [523.25, 659.25, 783.99, 1046.50, 880.00, 783.99],
        [392.00, 493.88, 587.33, 783.99, 659.25, 587.33]
      ]
    },
    {
      id: 'rainbow',
      name: 'Aventura en el Arcoíris',
      icon: '🌈',
      stepTime: 0.22,
      bars: [
        // Aventura pentatónica saltarina
        [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50],
        [1174.66, 1046.50, 880.00, 783.99, 659.25, 523.25],
        [659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99],
        [880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1318.51],
        [1046.50, 783.99, 659.25, 587.33, 523.25, 659.25],
        [783.99, 880.00, 1046.50, 1174.66, 1046.50, 783.99]
      ]
    }
  ];

  const audioInstance = new SoundEngine();
  audioInstance.currentTrackIndex = 0;
  audioInstance.loopsInCurrentTrack = 0;
  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.audio = audioInstance;
})();
