# Cinnamoroll · ¡A volar!

Juego web liviano (~40 KB, sin dependencias ni imágenes) para una nena de 5 años.
Cinnamoroll vuela con sus orejas y junta estrellas ⭐, rollitos de canela 🍥 y corazones 💗.
Cada 10, hay fiesta: confeti, una voz que la felicita y el cielo cambia (día → atardecer → noche → amanecer).

## Cómo jugar

| Control | Cómo | Estado |
|---|---|---|
| ⌨️ Teclado | `↑`/`↓` o `W`/`S` · `Espacio` = pirueta · `H` = hola · `P` = pausa · `M` = mute | ✅ |
| 👆 Toque / mouse | Apoyar el dedo y arrastrar: Cinnamoroll lo sigue | ✅ |
| 🗣️ Voz | “arriba / subí / volá”, “abajo / bajá”, “gira / vuelta”, “hola / Cinnamoroll” | ✅ Chrome/Edge |
| 🌬️ Soplar / cantar | Más fuerte = más alto. Silencio = baja suave | ✅ |
| 📱 Inclinar | Giroscopio del celular/tablet (se calibra donde lo agarres) | ✅ requiere HTTPS en móvil |
| 🔌 Sensor externo | WebSocket: `index.html?ws=ws://IP:PUERTO` | ✅ listo para conectar |

Los controles se activan en **“Para papás”** dentro del menú.

## Correr

- **Visual / teclas:** doble clic en `index.html`.
- **Con voz / micrófono:** doble clic en `start.bat` → abre `http://localhost:8080`.
- **En tablet/celular (inclinación):** necesita HTTPS. Opción rápida: `npx localtunnel --port 8080` o publicar en GitHub Pages / Netlify.

## Arquitectura

```
index.html      UI (HUD con íconos, menú, panel de papás)
styles.css      Estética pastel, botones grandes
js/audio.js     Sonidos sintetizados (WebAudio) + voz hablada (speechSynthesis)
js/input.js     Capa de entrada desacoplada (adapters)
js/character.js Cinnamoroll dibujado en vector
js/game.js      Loop, física suave, ítems, celebración
```

Todos los dispositivos se traducen a 3 primitivas: `axis` (velocidad), `target` (posición 0..1) y `action` (evento).
El juego no sabe de dónde vienen. Para un sensor nuevo:

```js
Cinnamo.input.feed({ tilt: -0.4 });      // -1 (arriba) .. 1 (abajo)
Cinnamo.input.feed({ target: 0.2 });     // posición absoluta
Cinnamo.input.feed({ action: 'spin' });  // 'up' | 'down' | 'spin' | 'hello'
```

### Ejemplo: Arduino/ESP32 con MPU6050 → WebSocket
El microcontrolador (o un puente Python/Node por USB serie) envía JSON `{"tilt": <pitch normalizado>}` ~30 veces/seg.
Alternativas sin puente: **Web Serial** (USB, Chrome) o **Web Bluetooth** (micro:bit / ESP32 BLE) — escriben al mismo `feed()`.

## Decisiones de diseño para 5 años

- **Sin game over ni enemigos.** Sólo refuerzo positivo.
- **Imán generoso**: las estrellas se acercan solas si pasa cerca.
- **Movimiento con resorte amortiguado**: nunca brusco, no marea.
- **No requiere leer**: contador grande + 10 bolitas de progreso + voz que felicita.
- **Notas pentatónicas** que suben con las rachas: siempre suena lindo.
- **Voz y soplido son excluyentes** (comparten micrófono; en Android chocan).
- El reconocimiento **ignora la voz del propio juego** para no autodispararse.

> ⚠️ Cinnamoroll es marca registrada de Sanrio. Este proyecto es para uso personal/familiar; no distribuir ni monetizar.
