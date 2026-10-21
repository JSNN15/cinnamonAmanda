# Registro de cambios

Cada versión entra por un Pull Request y se anota aquí: qué cambió, por qué y cómo se probó.
Formato: la más nueva arriba. Las capturas de antes y después de cada versión visual se guardan
fuera del repo, en la carpeta compartida del proyecto (`visual-vNN/`).

## Cómo probar antes de fusionar

```bash
# Linux: indicar Chromium si no hay Google Chrome instalado
export CHROME_PATH=/ruta/a/chromium
python tools/test_digital_bodies_e2e.py     # 44 pruebas de World
python tools/test_v42_ux_regressions.py     # 13 regresiones de UX de World
```

Al publicar una versión, subir `?v=NN` en `index.html` y `controller.html` y `CACHE_NAME` en `sw.js`.

---

## v43 · 2026-10-21 · Caritas fieles a Cinnamoroll y sus amigos

**Por qué:** la v38 cambió los ojos de los personajes de World por ojos de anime humano
(esclerótica blanca, iris con degradado, cejas y pestañas). El diseño real de Sanrio es lo
contrario: ojos ovalados chicos y separados, sin cejas, con un brillo blanco. Julian pidió
volver a algo parecido a los personajes reales.

**Qué cambió** (`js/avatar-world.js`, todo dibujado en canvas, sin imágenes nuevas):
- **Ojos:** óvalos verticales chicos y separados, con un brillo blanco. Cinnamoroll azul; Milk,
  Mocha, Chiffon, Pompompurin y Cappuccino café oscuro. Sin cejas ni pestañas.
- **Emociones:** cambian la forma del ojo en vez de agregar detalles: "^ ^" en Fiesta,
  corazones en Ternura, ojo más grande con chispa en Emocionada, curva cerrada al dormir.
- **Boca:** boquita abierta en "v" con lengüita; Pompompurin con naricita y boca "ω".
  Mejillas rosadas planas debajo de los ojos.
- **Orejas por personaje:** largas hacia los lados (Cinnamoroll, Mocha), medianas (Milk,
  Cappuccino), caídas junto a la cara (Pompompurin) y en nube (Chiffon). Mocha con las orejas
  del mismo color que el cuerpo; Pompompurin amarillo crema.
- **Cabeza** más ancha que alta, con sombreado suave y rulito de Milk dibujado como línea.
- **Tamaño:** personajes 18 % más grandes en la escena (`AV_SCALE`); la zona de toque y la
  burbuja de emoción se ajustaron igual. Las miniaturas del vestidor no cambian de tamaño.
- **Código:** la mirada se calcula en `computeEyeGaze()` y `gazeTargetFor()`.
- **Pruebas:** `tools/test_digital_bodies_e2e.py` encuentra Chromium en Linux (`CHROME_PATH`)
  y agrega `--no-sandbox` cuando corre como root.

**Probado:** 44/44 + 13/13 pruebas automáticas; capturas en tablet horizontal y vertical,
vestidor, 3 amigos juntos y personajes sentados en los 5 cuartos; 0 errores de consola.

---

## Historia anterior (resumen desde `git log`)

| Versión | Fecha | Resumen | Entró por |
|---|---|---|---|
| v42 | 2026-10-21 | World: botón Soltar, miniaturas de objetos, columpio sincronizado, caritas temporales | directo a `main` |
| v41 | 2026-10-21 | World: prioridad de toques, góndola del súper, sillas en la mesa de té | directo a `main` |
| v40 | 2026-10-21 | World: "cuerpos digitales" 2.5D en los 5 cuartos y 44 pruebas E2E | directo a `main` |
| v39 | 2026-10-21 | World: arquitectura 2.5D, cobijas y cajones articulados | directo a `main` |
| v38 | 2026-10-21 | World: ojos "HD" multicapa, súper y panadería, mapa de la ciudad | directo a `main` |
| v37 | 2026-10-20 | Playa, spa, recetas, vuelo de 3 jugadores, tienda del pasaporte | directo a `main` |
| v36 | 2026-10-19 | QA de los 9 juegos, nombre del jugador, mando | directo a `main` |
| v35 | 2026-10-19 | Íconos propios, menú ilustrado, World para tablet | PR #8 |
| v34 | 2026-10-19 | Ñ y sílabas, voz en juegos de acción | PR #7 |
| v33 | 2026-10-19 | Voz para no lectores, ganar solo pensando | PR #6 |
