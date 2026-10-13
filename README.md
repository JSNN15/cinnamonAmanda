# 🌸 Cinnamoroll Land · Suite de Juegos Preescolares

Una suite de juegos web liviana, interactiva y relajante diseñada especialmente para una niña de 5 años, inspirada en el universo oficial de **Cinnamoroll** y sus amigos de Sanrio (*Milk, Mocha, Pompompurin*).

---

## 🎮 Los 3 Juegos de la Suite

```
                       ┌───────────────────────────────┐
                       │     Cinnamoroll Land (Hub)    │
                       └──────────────┬────────────────┘
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
  🛫 ¡A Volar!              🧁 Pastelería de Sumas        🎨 Taller de Pintura
  · Vuelo por las nubes      · Contar rollitos y dulces   · Cinnamoroll, Milk,
  · Recolectar estrellas     · Milk y Cinnamoroll           Mocha y Pompompurin
  · Voz, teclas, sensores    · Botones con números y puntos · Tap-to-fill y brillitos
```

### 1. 🛫 ¡A Volar con Cinnamoroll!
* **Mecánica:** Vuela por cielos de colores recolectando estrellas mágicas ⭐, rollitos de canela 🍥 y corazones 💗.
* **Física:** Movimiento con resorte amortiguado (suave, sin tirones) e imán generoso para que las estrellas se acerquen solas.
* **Sin Game Over:** Cero frustración, puro refuerzo positivo. Cada 10 estrellas el cielo cambia de hora (día → atardecer → noche estrellada → amanecer) con lluvia de confeti.
* **Controles múltiples:**
  * **Teclado:** `↑` / `↓` o `W` / `S` · `Espacio` = pirueta · `H` = hola.
  * **Pantalla táctil / Ratón:** Arrastrar el dedo para que Cinnamoroll lo siga suavemente.
  * **Voz:** Decir *"arriba"*, *"abajo"*, *"gira"*, *"hola"*.
  * **Soplar / Cantar:** El nivel del micrófono eleva a Cinnamoroll al soplar.
  * **Giroscopio / Acelerómetro:** Inclinar el móvil o tablet.
  * **Sensor externo:** Conexión vía WebSocket (`?ws=ws://IP:PUERTO`) lista para Arduino / ESP32 / micro:bit.

### 2. 🧁 La Pastelería Mágica (Sumas y Conteo Preescolar)
* **Mecánica:** Cinnamoroll y el pequeño **Milk** hornean delicias. La niña cuenta cuántos dulces hay en total (sumas visuales del 1 al 8).
* **Interacción táctil:** Tocar cada pastelito hace que salte con un sonido de burbuja (*pop*) y muestre su número en orden (1, 2, 3...) para ayudarla a contar con el dedo.
* **Botones adaptados para no-lectores:** Cada botón de respuesta muestra el número grande y los puntitos correspondientes debajo (`● ● ●`) para comparar directamente con los dulces contados.
* **Cero frustración:** Si elige otro número, la bandeja simplemente se balancea con un suave sonido elástico y el juego invita a contar de nuevo.

### 3. 🎨 El Taller de Pintura (Colorear con Amigos de Sanrio)
* **4 Láminas oficiales:**
  1. **Cinnamoroll:** Flotando en su nube esponjosa con su tacita.
  2. **Milk (みるく):** El bebé con su chupete celeste, biberón y corazones.
  3. **Mocha (モカ):** La perrita café de orejas largas con su flor en la oreja y moño.
  4. **Pompompurin (ポムポムプリン):** El golden retriever con su boina marrón y plato de flan con cereza.
* **Pintura mágica (Tap-to-fill):** Tocar una zona la rellena de inmediato sin salirse de las líneas.
* **Paleta Pastel Sanrio:** Celeste Cinnamoroll, Rosa Pastel, Amarillo Vainilla, Marrón Moka, Blanco Algodón, Lila Lavanda, Verde Menta y Caramelo Purin.
* **Varita de Purpurina:** Herramienta para estampar estrellitas ✨, corazones 💖 y flores 🌸.
* **Botón Guardar:** Guarda el dibujo como imagen PNG en el dispositivo.

---

## 🎵 Motor de Audio Rediseñado (Cero voces robóticas)

* **Música de Caja de Música / Celesta (Procedural Web Audio):**
  * Melodías pentatónicas relajantes (estilo cuna / Studio Ghibli / cafetería Sanrio) generadas en tiempo real.
  * Se activa/desactiva en cualquier momento con el botón universal **🎵 Música** de la barra superior.
* **Efectos y 'Vocalizaciones' Kawaii:**
  * Reemplazo total de la voz sintética de Windows.
  * Sonidos sintetizados mediante formantes vocales infantiles (*"¡Waaai!"*, arpas de victoria, burbujas cantarinas y campanitas de cristal).

---

## 🚀 Cómo Ejecutar

1. **Modo Rápido (En cualquier navegador):**
   * Haz doble clic en [`index.html`](file:///c:/Users/Juli%C3%A1nNeiraNova/OneDrive%20-%20CEIBO%20TECH/Documentos/Cinamonroll/index.html).
2. **Modo Completo con Micrófono/Voz:**
   * Haz doble clic en [`start.bat`](file:///c:/Users/Juli%C3%A1nNeiraNova/OneDrive%20-%20CEIBO%20TECH/Documentos/Cinamonroll/start.bat) para levantar el servidor local en `http://localhost:8080`.
3. **En Celular / Tablet (para giroscopio):**
   * Abrir la IP local de tu PC en la red WiFi (o publicar en GitHub Pages / Netlify).

---

## 📦 Estructura del Código

```
├── index.html               # Shell universal con barra superior y pantallas
├── styles.css               # Estilos responsivos, paleta pastel y animaciones
├── cinnamoroll_sheet.png    # Spritesheet de 6 cuadros auténtico de Sanrio
├── cinnamoroll_sprite.png   # Sprite de Cinnamoroll en alta resolución
├── start.bat                # Lanzador de servidor local
├── js/
│   ├── audio.js             # Motor de sonido (caja de música y efectos)
│   ├── input.js             # Capa de entrada desacoplada (teclas, voz, mic, sensores)
│   ├── character.js         # Renderizado animado de Cinnamoroll
│   ├── game.js              # Juego de vuelo ("¡A volar!")
│   ├── math.js              # Juego de sumas ("La Pastelería Mágica")
│   ├── coloring.js          # Juego de colorear ("El Taller de Pintura")
│   └── hub.js               # Gestor de navegación entre juegos
└── README.md
```

---

## 🐙 Instrucciones para subir a GitHub

Cuando tengas tu repositorio remoto de GitHub listo (ej: `https://github.com/usuario/cinnamoroll-suite.git`):

```bash
# 1. Configurar la URL remota de tu repositorio:
git remote add origin <URL_DE_TU_REPOSITORIO>

# 2. Subir la rama principal:
git branch -M main
git push -u origin main
```

> ⚠️ **Nota:** Cinnamoroll, Milk, Mocha y Pompompurin son marcas y personajes registrados de Sanrio Co., Ltd. Este proyecto es una creación educativa y familiar de uso personal sin fines de lucro.
