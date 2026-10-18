/* Progreso adaptativo de la Pastelería Mágica (matemáticas).
 *
 * Cada operación (sumas, restas, tablas) tiene su propio nivel. Sólo cuenta la
 * PRIMERA respuesta de cada pregunta:
 *  - Sube un nivel con 4 aciertos a la primera de los últimos 5 en ese nivel.
 *  - Baja un nivel con 2 errores seguidos (para que Amanda no se frustre).
 *  - Una operación queda "dominada" con 8 de 10 aciertos a la primera en su nivel más alto.
 *
 * Sumas y restas: 6 niveles (2 pasos por cada tramo de edad).
 * Tablas: 3 niveles (sólo aparecen en el tramo 7-8 años).
 * Todo se guarda en localStorage (cinna_math_progress_v1).
 */
(function () {
  const STORAGE_KEY = 'cinna_math_progress_v1';
  const TIERS = ['5-6', '6-7', '7-8'];
  const MAX_LEVEL = { add: 5, sub: 5, mult: 2 };
  const UP_WINDOW = 5, UP_NEEDED = 4;
  const DOWN_STREAK = 2;
  const MASTER_WINDOW = 10, MASTER_NEEDED = 8;

  const freshSkill = () => ({
    level: 0, levelHist: [], recent: [], total: 0, firstTry: 0,
    lastPlayed: null, masteredAt: null
  });

  const freshState = () => ({
    auto: true,
    skills: { add: freshSkill(), sub: freshSkill(), mult: freshSkill() }
  });

  function load(storage) {
    try {
      const raw = storage && storage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      const st = freshState();
      st.auto = parsed.auto !== false;
      for (const op of Object.keys(st.skills)) {
        const s = Object.assign(freshSkill(), (parsed.skills || {})[op] || {});
        s.level = Math.max(0, Math.min(MAX_LEVEL[op], s.level | 0));
        st.skills[op] = s;
      }
      return st;
    } catch (e) {
      return freshState();
    }
  }

  function save(storage, state) {
    try { storage && storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ }
  }

  // Tramo de edad que corresponde a un nivel de sumas/restas
  const tierForLevel = (level) => TIERS[Math.min(2, Math.floor(level / 2))];
  const levelForTier = (tier) => Math.max(0, TIERS.indexOf(tier)) * 2;

  /* Registra la primera respuesta de una pregunta.
   * Devuelve 'up', 'down', 'mastered' o null según lo que pasó. */
  function record(state, op, correct, now = Date.now()) {
    const s = state.skills[op];
    if (!s) return null;
    s.total++;
    if (correct) s.firstTry++;
    s.lastPlayed = now;
    s.recent.push(!!correct);
    if (s.recent.length > MASTER_WINDOW) s.recent.shift();
    s.levelHist.push(!!correct);
    if (s.levelHist.length > MASTER_WINDOW) s.levelHist.shift();

    let event = null;
    const top = MAX_LEVEL[op];

    if (!s.masteredAt && s.level === top) {
      const hits = s.levelHist.slice(-MASTER_WINDOW).filter(Boolean).length;
      if (s.levelHist.length >= MASTER_WINDOW && hits >= MASTER_NEEDED) {
        s.masteredAt = now;
        event = 'mastered';
      }
    }

    if (state.auto) {
      const lastUp = s.levelHist.slice(-UP_WINDOW);
      const lastDown = s.levelHist.slice(-DOWN_STREAK);
      if (s.level < top && lastUp.length >= UP_WINDOW && lastUp.filter(Boolean).length >= UP_NEEDED) {
        s.level++;
        s.levelHist = [];
        event = 'up';
      } else if (s.level > 0 && lastDown.length >= DOWN_STREAK && lastDown.every(v => !v)) {
        s.level--;
        s.levelHist = [];
        event = 'down';
      }
    }
    return event;
  }

  // Fija el punto de partida de sumas/restas en un tramo de edad (botones de papás o el mando)
  function setStartTier(state, tier) {
    const lvl = levelForTier(tier);
    for (const op of ['add', 'sub']) {
      if (state.skills[op].level !== lvl) {
        state.skills[op].level = lvl;
        state.skills[op].levelHist = [];
      }
    }
  }

  const api = {
    STORAGE_KEY, TIERS, MAX_LEVEL,
    freshState, load, save, record, setStartTier, tierForLevel, levelForTier
  };

  if (typeof window !== 'undefined') {
    window.Cinnamo = window.Cinnamo || {};
    window.Cinnamo.mathProgress = api;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
