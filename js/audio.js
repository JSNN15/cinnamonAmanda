/* Audio Engine 100% sintetizado con Web Audio API:
 *  - Sistema de Música Relajante de Alta Calidad (Lofi Lullaby, Celesta Aterciopelada y Warm Pads)
 *  - ARQUITECTURA ROBUSTA ANTI-SUPERPOSICIÓN:
 *      * Bus dinámico exclusivo por pista con desvanecimiento inmediato de 35ms al cambiar o pausar.
 *      * Rastreo y corte inmediato de osciladores activos (cero colas de audio superpuestas).
 *  - RITMOS CALMANTES Y TRANQUILOS:
 *      * Tempo pausado de 50 a 56 BPM, compases largos de 3.8 a 4.5 segundos con silencios para respirar.
 *      * Frecuencias cálidas y redondas (filtro lowpass en 1400 Hz) que eliminan cualquier estridencia.
 *      * Colchón armónico envolvente (warm pad) que transmite paz y seguridad a las niñas.
 *  - Efectos kawaii y tiernos (burbujas para contar, arpas mágicas, risitas y campanitas).
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
      this.musicFilter = null;
      this.musicDelay = null;
      this.musicDelayGain = null;
      this.activeMusicBus = null;
      this.activeMusicOscillators = [];
      this.sfxGain = null;
      this.musicPlaying = false;
      this.musicTimer = null;
      this.muted = false;
      this.currentTrackIndex = 0;
      this.currentMeasureIndex = 0;
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
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.55;
      this.sfxGain.connect(this.masterGain);

      // Music master bus (con filtro cálido tipo lofi / celesta aterciopelada)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.20;

      // Filtro de calidez acústica (elimina cualquier frecuencia aguda o estridente)
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.value = 1400;

      // Eco / reverb espacial sutil y relajante
      this.musicDelay = this.ctx.createDelay();
      this.musicDelay.delayTime.value = 0.45;
      this.musicDelayGain = this.ctx.createGain();
      this.musicDelayGain.gain.value = 0.20;

      this.musicGain.connect(this.musicFilter);
      this.musicFilter.connect(this.masterGain);
      this.musicFilter.connect(this.musicDelay);
      this.musicDelay.connect(this.musicDelayGain);
      this.musicDelayGain.connect(this.musicFilter);

      // Bus de música dedicado para la pista activa
      this.activeMusicBus = this.ctx.createGain();
      this.activeMusicBus.gain.value = 1.0;
      this.activeMusicBus.connect(this.musicGain);
    }

    unlock() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    setMuted(m) {
      this.muted = !!m;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.35, this.ctx.currentTime);
      }
      return this.muted;
    }

    toggleMute() {
      return this.setMuted(!this.muted);
    }

    /* ---------- SÍNTESIS DE INSTRUMENTOS MUSICALES CALMANTES ---------- */

    // Nota melódica cálida y aterciopelada (Felt Piano / Celesta suave)
    playCalmNote(freq, time, vol = 0.18, dur = 2.4) {
      if (!this.ctx || this.muted || !this.activeMusicBus) return;
      const t = time || this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sine pura para suavidad celestial y cero estridencia
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Filtro dinámico de calidez (corta agudos duros)
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(920, freq * 1.5), t);
      filter.frequency.exponentialRampToValueAtTime(320, t + dur);

      // Envolvente de cuna: ataque suave de 35ms (sin "click"), caída orgánica
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.035);
      gain.gain.exponentialRampToValueAtTime(vol * 0.42, t + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.activeMusicBus);

      osc.start(t);
      osc.stop(t + dur + 0.08);

      this.activeMusicOscillators.push(osc);
      osc.onended = () => {
        const idx = this.activeMusicOscillators.indexOf(osc);
        if (idx !== -1) this.activeMusicOscillators.splice(idx, 1);
      };
    }

    // Colchón armónico envolvente (Pad cálido de ensueño)
    playWarmPadChord(freqs, time, vol = 0.065, dur = 4.2) {
      if (!this.ctx || this.muted || !this.activeMusicBus) return;
      const t = time || this.ctx.currentTime;

      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        // Desafinación micrométrica orgánica (chorus cálido y acogedor)
        osc.detune.setValueAtTime(i % 2 === 0 ? 3.5 : -3.5, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.75); // Ataque ultra suave de 750ms
        gain.gain.setValueAtTime(vol * 0.85, t + dur - 0.85);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.activeMusicBus);

        osc.start(t);
        osc.stop(t + dur + 0.08);

        this.activeMusicOscillators.push(osc);
        osc.onended = () => {
          const idx = this.activeMusicOscillators.indexOf(osc);
          if (idx !== -1) this.activeMusicOscillators.splice(idx, 1);
        };
      });
    }

    // Compatibilidad para campanitas tradicionales
    playMusicBoxTine(freq, time, vol = 0.18, dur = 2.0) {
      this.playCalmNote(freq, time, vol, dur);
    }

    /* ---------- EFECTOS DE SONIDO KAWAII ---------- */

    // Efecto Kawaii de formantes (sonido tierno tipo "¡Waaai!" o "¡Kyu!")
    kawaiiChirp(type = 'cheer') {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

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
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(980, t + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1180, t + 0.28);
      } else {
        osc.frequency.setValueAtTime(700, t);
        osc.frequency.exponentialRampToValueAtTime(540, t + 0.12);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.26);
      }

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
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

      const base = 440 * Math.pow(1.08, step % 12);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * 1.6, t + 0.04);
      osc.frequency.exponentialRampToValueAtTime(base * 0.8, t + 0.09);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.40, t + 0.015);
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
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
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
        g.gain.linearRampToValueAtTime(0.32, t + i * 0.06 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.45);
        o.connect(g).connect(this.sfxGain);
        o.start(t + i * 0.06);
        o.stop(t + i * 0.06 + 0.5);
      });

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
      g.gain.linearRampToValueAtTime(0.30, t + 0.01);
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
      g.gain.linearRampToValueAtTime(0.28, t + 0.02);
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
      g.gain.linearRampToValueAtTime(0.18, t + 0.01);
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
      gain.gain.linearRampToValueAtTime(0.28, t + 0.015);
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
        gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.28);

        osc.connect(gain).connect(this.sfxGain);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.3);
      });
    }

    /* ---------- SISTEMA DE MÚSICA ANTI-SUPERPOSICIÓN ---------- */

    getTracks() {
      return TRACKS;
    }

    getCurrentTrack() {
      return TRACKS[this.currentTrackIndex % TRACKS.length];
    }

    // Detiene todos los sonidos de la música anterior sin pops ni colas
    stopAllMusicVoices() {
      if (this.musicTimer) {
        clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }

      if (this.ctx && this.activeMusicBus) {
        const now = this.ctx.currentTime;
        try {
          this.activeMusicBus.gain.cancelScheduledValues(now);
          this.activeMusicBus.gain.setValueAtTime(this.activeMusicBus.gain.value, now);
          this.activeMusicBus.gain.linearRampToValueAtTime(0.0001, now + 0.035);
        } catch (_) {}
      }

      if (this.activeMusicOscillators && this.activeMusicOscillators.length) {
        const now = this.ctx ? this.ctx.currentTime : 0;
        this.activeMusicOscillators.forEach(osc => {
          try {
            osc.stop(now + 0.04);
            osc.disconnect();
          } catch (_) {}
        });
        this.activeMusicOscillators = [];
      }

      // Crear bus de música limpio para la próxima pista
      if (this.ctx && this.musicGain) {
        this.activeMusicBus = this.ctx.createGain();
        this.activeMusicBus.gain.value = 1.0;
        this.activeMusicBus.connect(this.musicGain);
      }
    }

    setTrack(index) {
      this.stopAllMusicVoices();
      this.currentTrackIndex = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
      this.currentMeasureIndex = 0;
      if (this.musicPlaying) {
        this.tickMusic();
      }
      return this.getCurrentTrack();
    }

    nextTrack() {
      this.unlock();
      return this.setTrack(this.currentTrackIndex + 1);
    }

    startMusic() {
      this.unlock();
      if (this.musicPlaying) return;
      this.musicPlaying = true;
      this.stopAllMusicVoices();
      this.tickMusic();
    }

    stopMusic() {
      this.musicPlaying = false;
      this.stopAllMusicVoices();
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
      if (!this.musicPlaying || !this.ctx) return;

      const track = this.getCurrentTrack();
      const measures = track.measures;
      const measureIdx = this.currentMeasureIndex % measures.length;
      const measure = measures[measureIdx];
      const now = this.ctx.currentTime;
      const dur = measure.dur || 4.0;

      // 1. Colchón armónico envolvente (Pad de cuna cálido)
      if (measure.pad && measure.pad.length) {
        this.playWarmPadChord(measure.pad, now, 0.065, dur + 0.6);
      }

      // 2. Notas melódicas pausadas y tranquilas (Felt Piano / Celesta)
      if (measure.melody && measure.melody.length) {
        measure.melody.forEach(([offset, freq, vol, noteDur]) => {
          this.playCalmNote(freq, now + offset, vol || 0.18, noteDur || 2.4);
        });
      }

      this.currentMeasureIndex++;

      // Programar el siguiente compás pausado
      this.musicTimer = setTimeout(() => {
        if (this.musicPlaying) this.tickMusic();
      }, dur * 1000 - 35);
    }
  }

  /* 4 MELODÍAS TRANQUILAS, SERENAS Y NO REPETITIVAS PARA NIÑAS (50 - 56 BPM) */
  const TRACKS = [
    {
      id: 'lullaby',
      name: 'Nubes de Algodón',
      icon: '🌸',
      measures: [
        // Compás 1: Cmaj7 - Calma y vaivén suave
        {
          dur: 3.8,
          pad: [130.81, 196.00, 246.94, 329.63], // C3, G3, B3, E4
          melody: [
            [0.1, 392.00, 0.18, 2.6],  // G4
            [1.2, 329.63, 0.16, 2.2],  // E4
            [2.3, 493.88, 0.17, 2.4]   // B4
          ]
        },
        // Compás 2: Fmaj7 - Brisa cálida
        {
          dur: 3.8,
          pad: [174.61, 220.00, 261.63, 329.63], // F3, A3, C4, E4
          melody: [
            [0.1, 523.25, 0.18, 2.5],  // C5
            [1.3, 440.00, 0.15, 2.2],  // A4
            [2.4, 392.00, 0.16, 2.4]   // G4
          ]
        },
        // Compás 3: Am9 - Dulzura de cuna
        {
          dur: 3.8,
          pad: [110.00, 164.81, 261.63, 392.00], // A2, E3, C4, G4
          melody: [
            [0.1, 493.88, 0.17, 2.5],  // B4
            [1.2, 440.00, 0.15, 2.2],  // A4
            [2.3, 329.63, 0.16, 2.4]   // E4
          ]
        },
        // Compás 4: Gsus4 ➔ G - Reposo
        {
          dur: 4.2,
          pad: [98.00, 146.83, 196.00, 261.63], // G2, D3, G3, C4
          melody: [
            [0.1, 293.66, 0.16, 2.8],  // D4
            [1.4, 392.00, 0.17, 2.6],  // G4
            [2.8, 329.63, 0.15, 2.4]   // E4
          ]
        },
        // Compás 5: Cmaj7 - Frase de descanso (aire y silencio relajante)
        {
          dur: 4.0,
          pad: [130.81, 196.00, 329.63], // C3, G3, E4
          melody: [
            [0.2, 523.25, 0.16, 3.0],  // C5
            [1.8, 392.00, 0.14, 2.8]   // G4
          ]
        },
        // Compás 6: Fmaj7 - Paseo de nubes
        {
          dur: 3.8,
          pad: [174.61, 261.63, 329.63, 440.00], // F3, C4, E4, A4
          melody: [
            [0.1, 440.00, 0.16, 2.4],  // A4
            [1.2, 523.25, 0.18, 2.5],  // C5
            [2.4, 493.88, 0.15, 2.4]   // B4
          ]
        },
        // Compás 7: Dm7 - Respiro nocturno
        {
          dur: 3.8,
          pad: [146.83, 220.00, 261.63, 349.23], // D3, A3, C4, F4
          melody: [
            [0.1, 349.23, 0.15, 2.4],  // F4
            [1.3, 440.00, 0.16, 2.4],  // A4
            [2.4, 523.25, 0.17, 2.5]   // C5
          ]
        },
        // Compás 8: G7sus2 ➔ C - Final sereno
        {
          dur: 4.5,
          pad: [98.00, 146.83, 246.94, 293.66], // G2, D3, B3, D4
          melody: [
            [0.1, 493.88, 0.16, 2.8],  // B4
            [1.5, 392.00, 0.15, 2.6],  // G4
            [2.8, 261.63, 0.17, 3.2]   // C4
          ]
        }
      ]
    },
    {
      id: 'starlight',
      name: 'Paseo Estrellado',
      icon: '🌙',
      measures: [
        // Compás 1: Fadd9 - Manto de estrellas
        {
          dur: 4.2,
          pad: [87.31, 130.81, 220.00, 392.00], // F2, C3, A3, G4
          melody: [
            [0.2, 523.25, 0.17, 2.8],  // C5
            [1.6, 392.00, 0.15, 2.5],  // G4
            [2.8, 440.00, 0.16, 2.5]   // A4
          ]
        },
        // Compás 2: Em7 - Silencio sereno
        {
          dur: 4.2,
          pad: [82.41, 123.47, 196.00, 293.66], // E2, B2, G3, D4
          melody: [
            [0.1, 493.88, 0.17, 2.8],  // B4
            [1.5, 392.00, 0.14, 2.4],  // G4
            [2.8, 329.63, 0.15, 2.6]   // E4
          ]
        },
        // Compás 3: Dm9 - Gota cristalina
        {
          dur: 4.2,
          pad: [73.42, 110.00, 174.61, 329.63], // D2, A2, F3, E4
          melody: [
            [0.1, 349.23, 0.15, 2.5],  // F4
            [1.4, 329.63, 0.14, 2.4],  // E4
            [2.7, 293.66, 0.16, 2.8]   // D4
          ]
        },
        // Compás 4: Cmaj7 - Paz profunda
        {
          dur: 4.5,
          pad: [65.41, 98.00, 164.81, 246.94], // C2, G2, E3, B3
          melody: [
            [0.2, 329.63, 0.16, 3.0],  // E4
            [1.6, 293.66, 0.14, 2.8],  // D4
            [3.0, 261.63, 0.17, 3.4]   // C4
          ]
        },
        // Compás 5: Bbmaj7 - Sueño dorado
        {
          dur: 4.2,
          pad: [116.54, 174.61, 293.66, 349.23], // Bb2, F3, D4, F4
          melody: [
            [0.2, 440.00, 0.16, 2.8],  // A4
            [1.6, 349.23, 0.14, 2.5],  // F4
            [2.8, 293.66, 0.15, 2.6]   // D4
          ]
        },
        // Compás 6: Cadd9 - Regreso a casa
        {
          dur: 4.8,
          pad: [130.81, 196.00, 293.66, 329.63], // C3, G3, D4, E4
          melody: [
            [0.2, 392.00, 0.16, 3.2],  // G4
            [1.8, 329.63, 0.15, 3.0],  // E4
            [3.2, 261.63, 0.16, 3.5]   // C4
          ]
        }
      ]
    },
    {
      id: 'cozy_tea',
      name: 'Té y Chocolate',
      icon: '☕',
      measures: [
        // Compás 1: Gmaj7 - Calidez de hogar
        {
          dur: 4.0,
          pad: [98.00, 146.83, 246.94, 369.99], // G2, D3, B3, F#4
          melody: [
            [0.1, 587.33, 0.17, 2.8],  // D5
            [1.3, 493.88, 0.15, 2.4],  // B4
            [2.5, 440.00, 0.15, 2.5]   // A4
          ]
        },
        // Compás 2: Em7 - Melodía acogedora
        {
          dur: 4.0,
          pad: [82.41, 123.47, 196.00, 293.66], // E2, B2, G3, D4
          melody: [
            [0.1, 392.00, 0.16, 2.6],  // G4
            [1.2, 369.99, 0.14, 2.4],  // F#4
            [2.4, 329.63, 0.16, 2.6]   // E4
          ]
        },
        // Compás 3: Cadd9 - Dulce aroma
        {
          dur: 4.0,
          pad: [65.41, 98.00, 164.81, 293.66], // C2, G2, E3, D4
          melody: [
            [0.1, 329.63, 0.15, 2.5],  // E4
            [1.3, 392.00, 0.16, 2.5],  // G4
            [2.5, 493.88, 0.17, 2.6]   // B4
          ]
        },
        // Compás 4: D6 - Serenidad
        {
          dur: 4.4,
          pad: [73.42, 110.00, 185.00, 246.94], // D2, A2, F#3, B3
          melody: [
            [0.1, 440.00, 0.16, 2.8],  // A4
            [1.4, 369.99, 0.14, 2.5],  // F#4
            [2.7, 293.66, 0.16, 3.0]   // D4
          ]
        },
        // Compás 5: Bm7 - Espacio de calma
        {
          dur: 4.0,
          pad: [123.47, 185.00, 293.66, 440.00], // B2, F#3, D4, A4
          melody: [
            [0.2, 369.99, 0.15, 2.6],  // F#4
            [1.4, 440.00, 0.16, 2.6],  // A4
            [2.6, 587.33, 0.17, 2.8]   // D5
          ]
        },
        // Compás 6: Cmaj7 ➔ G - Paz total
        {
          dur: 4.6,
          pad: [130.81, 196.00, 246.94, 329.63], // C3, G3, B3, E4
          melody: [
            [0.1, 493.88, 0.16, 2.8],  // B4
            [1.5, 440.00, 0.15, 2.6],  // A4
            [2.8, 392.00, 0.17, 3.4]   // G4
          ]
        }
      ]
    },
    {
      id: 'zen_harp',
      name: 'Brisa de Cinnamoroll',
      icon: '🪽',
      measures: [
        // Compás 1: Dmaj7 - Vuelo ingrávido
        {
          dur: 4.2,
          pad: [146.83, 220.00, 277.18, 369.99], // D3, A3, C#4, F#4
          melody: [
            [0.2, 440.00, 0.17, 2.8],  // A4
            [1.5, 369.99, 0.15, 2.5],  // F#4
            [2.8, 277.18, 0.16, 2.8]   // C#4
          ]
        },
        // Compás 2: Gmaj7 - Suavidad de plumas
        {
          dur: 4.2,
          pad: [98.00, 146.83, 246.94, 369.99], // G2, D3, B3, F#4
          melody: [
            [0.1, 493.88, 0.17, 2.8],  // B4
            [1.4, 440.00, 0.15, 2.5],  // A4
            [2.7, 392.00, 0.16, 2.6]   // G4
          ]
        },
        // Compás 3: F#m7 - Silencio celestial
        {
          dur: 4.2,
          pad: [92.50, 138.59, 220.00, 329.63], // F#2, C#3, A3, E4
          melody: [
            [0.2, 554.37, 0.17, 2.8],  // C#5
            [1.5, 440.00, 0.15, 2.4],  // A4
            [2.7, 369.99, 0.16, 2.6]   // F#4
          ]
        },
        // Compás 4: A7sus4 ➔ D - Aterrizaje suave
        {
          dur: 4.6,
          pad: [110.00, 164.81, 196.00, 293.66], // A2, E3, G3, D4
          melody: [
            [0.1, 329.63, 0.15, 2.8],  // E4
            [1.5, 369.99, 0.15, 2.6],  // F#4
            [2.9, 293.66, 0.17, 3.4]   // D4
          ]
        }
      ]
    }
  ];

  const audioInstance = new SoundEngine();
  audioInstance.currentTrackIndex = 0;
  window.Cinnamo = window.Cinnamo || {};
  window.Cinnamo.audio = audioInstance;
})();
