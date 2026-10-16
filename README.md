# 🌸 Cinnamoroll Land · Suite de Juegos Preescolares de Sanrio

Una suite de juegos web liviana, interactiva, relajante y de alta calidad diseñada especialmente para **Amanda (5 años)**, inspirada en el universo oficial de **Cinnamoroll** y sus amigos de Sanrio (*Milk, Pompompurin, Mocha y Chiffon*).

**Sitio en Vivo (GitHub Pages):** [https://jsnn15.github.io/cinnamonAmanda/](https://jsnn15.github.io/cinnamonAmanda/)

---

## 🗺️ Arquitectura de la Suite (9 Juegos · v27)

```
                       ┌─────────────────────────────────────────┐
                       │        Cinnamoroll Land (Hub)           │
                       │   Navegación universal · Caja de Música │
                       └────────────────────┬────────────────────┘
          ┌─────────────────┬───────────────┼───────────────┬─────────────────┐
          ▼                 ▼               ▼               ▼                 ▼
   🏡 Casa de Sueños  🛫 ¡A Volar!    🧁 Pastelería   🎨 Taller de    🏃 Super Run
   Estilo Avatar W.   Vuelo por nubes Sumas y conteo  Dibujo Sanrio   Plataformas 2D
   Vestidor & Muebles Voz y sensores  Con Milk & Cinna 5 láminas B&W  5 Ciudades & Co-op
          │                 │               │               │                 │
          └─────────────────┴───────────────┼───────────────┴─────────────────┘
                            ┌───────────────┼───────────────┐
                            ▼               ▼               ▼
                     🎮 Repartidor 3D ✏️ Palabras     🧩 Puzzles Sanrio
                     Motor 2.5D Doom  Escuela Waldorf Tangram y Jigsaw
                     3D y bandejas    Montessori A-Z  6 a 16 piezas
                            │               │               │
                            └───────────────┼───────────────┘
                                            ▼
                                     🃏 Memorice Sanrio
                                     Parejas y memoria visual
```

---

## 🎮 Detalle Completo de los 9 Juegos (`v27`)

> 📋 **Registro Técnico y Auditoría Senior:** Consulta el informe integral de arquitectura, jugabilidad, contenido pedagógico y aseguramiento de calidad en [`AUDITORIA_SENIOR_JUEGO_PROFESIONAL.md`](./AUDITORIA_SENIOR_JUEGO_PROFESIONAL.md).

### 0. 🏡 Cinnamoroll World: Casa de Sueños (`js/avatar-world.js` · Estilo Avatar World / Toca Life)
* **Dirección de Arte "Soft-Vector" Continua (Cero "Sticker Pegado"):**
  * Personajes y habitaciones dibujados 100% en Canvas 2D vectorial artesanal con contornos color cacao cálido (`#5c3d2e`, `2.8px`), sombras elípticas de contacto con el suelo y ordenamiento de profundidad dinámico (**Y-Sorting a 60 FPS**).
  * **Iluminación Ambiental Integrada:** Capa atmosférica continua (`☀️ Día`, `🌅 Atardecer Dorado`, `🌙 Noche Mágica`) que baña en tiempo real personajes, muebles y habitaciones.
  * **Físicas y Expresividad Orgánica:** Orejas con resorte amortiguado de inercia (`earAngle`), parpadeo suave, caminata sinusoidal y burbujas de emoción.
* **Vestidor Kawaii Completo:**
  * Personaliza a los 3 jugadores (**`P1 🌸`**, **`P2 🩵`**, **`P3 💛`**) con **6 amigos Sanrio** (*Cinnamoroll, Milk, Mocha, Chiffon, Pompompurin, Cappuccino*), **7 trajes**, **8 sombreros**, **5 lentes**, **6 objetos en mano** y **6 expresiones faciales**. Persistencia automática en `localStorage`.
* **3 Habitaciones Interactivas y Editables:**
  * 🧁 **Cafetería & Cocina:** Horno pastelero interactivo (hornea cupcakes reales al usarlo), vitrina de postres, mesa de té y radio musical.
  * 🛏️ **Cuarto de Nubes:** Cama nube donde los personajes se acuestan tapados con cobija (`💤`), tocador con espejo que abre el vestidor y lámpara lunar.
  * 🌸 **Jardín & Fiesta:** Columpio de cerezo con física pendular para subirse, fuente de agua animada y escenario musical.
  * 🛋️ **Modo Decorar Casa:** Catálogo deslizable con 8 muebles y comidas para agregar, arrastrar o dar de comer a los personajes (`😋`).
* **Control Híbrido Touch + Celular Multi-Player (P1, P2, P3):**
  * Toca y arrastra directamente en pantalla, o usa el joystick analógico y la barra `#avatarActionStrip` en el celular para mover avatares, cambiar cuartos y decorar.

### 1. 🛫 ¡A Volar con Cinnamoroll! (`js/game.js`)
* **Mecánica:** Vuela por cielos de colores recolectando estrellas mágicas ⭐, rollitos de canela 🍥 y corazones 💗.
* **Física:** Movimiento con resorte amortiguado (suave, sin tirones) e imán generoso para que las estrellas se acerquen solas.
* **Sin frustración:** Cada 10 estrellas el cielo cambia de fase horaria (*día soleado → atardecer naranja → noche estrellada → amanecer pastel*) con lluvia de confeti.
* **Optimización de Ciclo de Vida (`v24`):** Pausa automáticamente su loop de renderizado a 60 FPS y la captura de teclado cuando Amanda cambia a cualquier otro juego del Hub.
* **Controles múltiples:**
  * **Teclado:** `↑` / `↓` o `W` / `S` · `Espacio` = pirueta · `H` = saludo.
  * **Pantalla táctil / Ratón:** Arrastrar el dedo para que Cinnamoroll lo siga suavemente.
  * **Voz:** Decir *"arriba"*, *"abajo"*, *"gira"*, *"hola"*.
  * **Soplar / Cantar:** El nivel del micrófono eleva a Cinnamoroll al soplar.
  * **Giroscopio / Acelerómetro:** Inclinar el móvil o tablet para volar.
  * **Mando Celular / Sensor externo:** Control desde el teléfono (`controller.html`) o vía WebSocket (`?ws=ws://IP:PUERTO`).

---

### 2. 🧁 Pastelería de Números (`js/math.js` · 5 a 8 Años)
* **Mecánica:** Cinnamoroll y el pequeño **Milk** hornean delicias. Adaptado con **3 niveles evolutivos por edad**:
  * **5–6 Años:** Sumas y restas visuales hasta 10 con conteo táctil.
  * **6–7 Años:** Sumas y restas hasta 20 con bandejas dobles.
  * **7–8 Años:** Desafíos de suma/resta avanzada y **Multiplicación por grupos visuales** (`2 × 3`, `3 × 4`, etc.).
* **Interacción táctil:** Tocar cada pastelito hace que salte con un sonido de burbuja (*pop*) y muestre su número en orden (`1, 2, 3...`).
* **Control Remoto Sincronizado para TV (`v24`):** Al conectar el celular como mando, el teléfono recibe en tiempo real la pregunta exacta y despliega los **3 botones numéricos con las opciones reales de la ronda**, permitiendo responder y avanzar rondas desde el sofá.
* **Cero frustración (Guía Paso a Paso):** Si elige otro número, Milk y Cinnamoroll cuentan juntos los pastelitos uno por uno iluminándolos antes de volver a intentar.

---

### 3. 🎨 Taller de Dibujo (`js/coloring.js` · Colorear con Sanrio)
* **8 Láminas Oficiales Normalizadas con Calidad de Imprenta (`600×500`):**
  1. **Cinnamoroll** · 2. **Milk (みるく)** · 3. **Pompompurin (ポムポムプリン)** · 4. **Mocha (モカ)** · 5. **Chiffon (シフォン)** · 6. **Cappuccino** · 7. **Espresso** · 8. **Fiesta de Amigos**.
* **Herramientas de Arte & Experiencia Amanda:**
  * **↩️ Botón Deshacer (Undo):** Pila de retroceso de 20 pasos para corregir trazos con tranquilidad.
  * **💾 Persistencia por Lámina:** Cambiar de personaje guarda automáticamente en memoria el dibujo de cada lámina.
  * **🖍️ Crayón / Pincel libre:** Con 3 grosores (8px fino, 20px medio, 40px grueso) y cursor dinámico.
  * **🛡️ Contorno Protegido (`mix-blend-mode: multiply`):** La capa de líneas originales nunca queda tapada por la pintura.
  * **🧽 Borrador Suave y ⭐ 8 Sellitos Mágicos:** Estrellitas, corazones, flores, arcoíris y dulces.
  * **📱 Trackpad de Pintura en el Celular (`v24`):** Permite pintar a distancia deslizando el dedo en el teléfono, elegir entre los 10 colores pastel y cambiar de lámina.
  * **📸 Botón Guardar con Firma:** Descarga la obra terminada en PNG firmada con *"✨ Obra de Arte de Amanda • Cinnamoroll Land"*.

---

### 4. 🃏 Memorice de Sanrio (`js/memory.js`)
* **Mecánica:** Encontrar las parejas de los amigos de Cinnamoroll volteando tarjetas mágicas con giro 3D.
* **3 Niveles de Dificultad por Edad:**
  * **5–6 Años (8 cartas):** 4 parejas.
  * **6–7 Años (12 cartas):** 6 parejas.
  * **7–8 Años (16 cartas):** 8 parejas.
* **Mando Espejo en Celular (`v24`):** El teléfono genera dinámicamente la cuadrícula de 8, 12 o 16 botones de cartas para voltear cualquier tarjeta desde el celular mirando la TV.

---

### 5. 🏃 Super Cinnamoroll Run (`js/platformer.js` · Gira Mundial por 5 Ciudades)
Completamente renovado con arte vectorial artesanal Canvas 2D de alta calidad, niveles extensos, controles ultra-responsivos sin bloqueos y suelo continuo:

* **Física y Salto 100% Responsivo (`v24`):**
  * **Método Unificado `jump()` & `tryJump()`:** Respuesta instantánea en teclado (`Espacio`, `↑`, `W`), botón táctil en pantalla (`#btnPlatJump`), toque directo en el canvas o mando remoto (`controller.html`) sin duplicación de eventos al reingresar al juego.
  * **Doble Salto y Aleteo Mágico con Orejitas (`canDoubleJump`):** Permite corregir saltos en el aire con nube de partículas y planeo suave.
  * **Coyote Time (160ms) y Jump Buffer (160ms):** Perdona saltos pulsados una fracción de segundo antes de tocar el suelo o tras abandonar el borde de una plataforma.
  * **Captura de Puntero Táctil (`setPointerCapture`):** El movimiento y salto se mantienen firmes aunque el pulgar se deslice ligeramente en pantallas táctiles.
* **5 Ciudades Emblemáticas con Arte Vectorial Detallado y Parallax Multicapa:**
  * 🇨🇱 **Concepción (Chile):** Campanil UdeC, Arco de Medicina, Río Biobío y cerezos en flor.
  * 🏖️ **La Serena (Chile):** Faro Monumental colonial con haz de luz giratorio, Avenida del Mar y olas del Pacífico.
  * 🇧🇷 **Río de Janeiro (Brasil):** Cristo Redentor en el Corcovado, Pan de Azúcar con teleférico *Bondinho* y paseo de Copacabana.
  * 🏔️ **Santiago de Chile:** Cordillera de los Andes con *Alpenglow*, Gran Torre Costanera, Teleférico San Cristóbal y Araucarias.
  * 🏮 **China Mágica:** Montañas kársticas, Gran Muralla, Pagodas imperiales de 5 pisos, bosques de bambú y linternas flotantes.

---

### 6. 🎮 Repartidor de Dulces 3D (`js/doom.js` · Motor Raycaster 2.5D)
* **Pabellón 3D Sin Violencia:** Los amigos de Sanrio caminan por el salón; al lanzarles su dulce favorito con la bandeja pastelera, se sientan felices a merendar.
* **Física Anti-Atascos e IA de Cortesía:** Separación elástica entre personajes, sombras proyectadas en perspectiva, minimapa en vivo y captura táctil continua (`setPointerCapture` en `v24`).

---

### 7. ✏️ Palabras Mágicas (`js/writing.js` · Escuela Waldorf & Montessori)
Diseñado con progresión curricular de **5 a 8 años** y **4 modos pedagógicos completos**:
1. 🔤 **Palabras Montessori:** Armado de palabras con fichas de letras e imán inteligente.
2. 📖 **Frases Mágicas:** Construcción de oraciones completas ordenando palabras con sentido gramatical y lectura por voz.
3. ✍️ **Trazos Caligráficos A–Z (27 Letras incl. `Ñ` y vocales con tilde):**
   * Waypoints numerados paso a paso (`① ➔ ② ➔ ③...`) con validación secuencial estricta por trazo, orientación escolar de tilde agudo y puntos guía imborrables.
4. 🎨 **Pizarra Libre Waldorf:** Lienzo libre con tizas pastel de colores y borrador.
* **Control desde el Celular (`v24`):** Incluye teclado completo `A–Z + Ñ` en la pantalla del teléfono, botón `🔊 Escuchar`, `🧹 Borrar` y navegación funcional `◀ Anterior / Siguiente ▶` en los 4 modos.

---

### 8. 🧩 Rompecabezas Mágico (`js/puzzle.js` · Jigsaw Troquelado)
* **Piezas Reales con Pestañas Bezier:** Cortadas dinámicamente sobre Canvas a partir de las ilustraciones oficiales de Sanrio.
* **4 Niveles de Dificultad Progresiva:**
  * 🌟 **6 Piezas (3×2)** · ⭐ **9 Piezas (3×3)** · 🏆 **12 Piezas (4×3)** · 👑 **16 Piezas (4×4)**.
* **Marco de Madera con Silueta Guía ("Ghost Guide"):** Conmutable desde la pantalla o desde el mando del celular, más botón mágico `🧩 Encajar Pieza`.

---

## 🎵 Motor de Audio Procedural Kawaii (`js/audio.js`)
* **100% Web Audio API Procedural:** Sintetizador en tiempo real con escalas pentatónicas mayores, compresor dinámico de protección auditiva infantil (`-14 dB`) y 4 pistas musicales en bucle con selector en la barra superior (`#globalBtnTrack`) y en el mando remoto.

---

## 📱 Mando Inalámbrico Inteligente, Modo Cooperativo Asimétrico & Pasaporte de Stickers (`v25`)
* **Sincronización Contextual en los 8 Juegos (`controller.html` + `js/controller-bridge.js`):**
  * Emparejamiento instantáneo por **Código QR** o código de 4 caracteres vía **WebRTC (PeerJS)** con reconexión automática, latido (`ping`/`pong`) cada 2s y respaldo local por `BroadcastChannel`.
  * Botón rápido de **Pantalla Completa (`📺`)** integrado tanto en la pantalla principal como en el mando móvil (con guía visual para iOS Safari).
  * Soporte nativo Plug-and-Play para **mandos físicos Bluetooth/USB** (Nintendo Switch, PlayStation, Xbox) vía `Gamepad API`.
* **✨ Modo Cooperativo Asimétrico TV + Celular (`js/passport.js`):**
  * Barra de ayuda mágica en tiempo real (`#coopPowerBar`) en el celular para acompañar a Amanda mientras juega en la TV/Tablet/PC:
    * 🌟 **Lluvia de Estrellas (`coopStarRain`):** Lanza estrellas/dulces extra en *Vuelo Mágico* y *Super Run*, dispara pastelitos en *Castillo 3D*, encaja una pieza en *Rompecabezas* o ayuda a contar en *Pastelería*.
    * 🛡️ **Escudo de Algodón de Azúcar (`coopShield`):** Activa durante **8 segundos** una burbuja de protección e impulso aéreo en *Super Run* y *Vuelo Mágico*.
    * 💖 **Porra de Ánimo (`coopCheer`):** Muestra un banner festivo de aliento con voz cariñosa y lluvia de corazones en pantalla.
* **🏅 Pasaporte Mágico y Álbum de Stickers (`cinnamo_passport_v1` en `localStorage`):**
  * Registra las estrellas mágicas ganadas y desbloquea **10 Stickers coleccionables oficiales de Sanrio** accesibles desde el botón `🏅 Stickers` en la barra superior o desde el mando móvil.

---

## 📺 Modo Consola TV "Zero-Keyboard / Zero-Mouse" y Multijugador hasta 3 Players (`v26 / v27`)
* **Control Total 100% desde el Celular (`controller.html` + `js/controller-bridge.js`):** Al conectar un PC a la TV, nunca necesitarás tocar el mouse ni el teclado:
  * **Selector Directo de los 5 Personajes Sanrio:** Elige a *Cinnamoroll, Milk, Pompompurin, Chiffon o Mocha* directamente desde la barra superior del celular en cualquier momento (en *Repartidor 3D*, tocar el personaje lo selecciona e inicia el mundo 3D automáticamente).
  * **Selector Directo de Ciudades, Niveles y Modos:** Viaja entre las 5 ciudades de *Super Run*, cambia edades (`5-6`, `6-7`, `7-8`), operaciones matemáticas (`➕`, `➖`, `✖️`, `🎲`), cantidad de cartas en *Memorice* (`8`, `12`, `16`), piezas en *Puzzles* (`6`, `9`, `12`, `16`) y modos en *Palabras Mágicas* (`🍪 Palabras`, `📖 Frases`, `✍️ Trazar`, `🖍️ Pizarra`).
  * **Touchpad Táctil en Vivo y Teclado `A–Z + Ñ`:** Dibuja, pinta, estampa sellitos y traza letras en la TV deslizando el dedo sobre el Touchpad del celular.
  * **Control de Casa de Sueños (Avatar World):** Mueve tu avatar, interactúa con muebles, cambia de cuarto (`🧁 Café`, `🛏️ Cuarto`, `🌸 Jardín`), cambia de ropa y agrega pasteles o peluches a la habitación desde el celular.
* **Coordinador Inteligente de Entrada (`Touch Activo` vs `Mando TV Activo` + `P1 / P2 / P3` en `v27`):**
  * La insignia superior `#globalInputModeBadge` indica en tiempo real si el sistema está respondiendo al toque directo o al mando inalámbrico de la TV con etiquetas de jugadores (`P1🌸`, `P2🩵`, `P3💛`), ocultando automáticamente controles en pantalla en la TV para una vista de consola limpia cuando se usa el mando móvil.
* **Hasta 3 Jugadores Simultáneos (`P1 🌸`, `P2 🩵`, `P3 💛`):** Conecta hasta 3 celulares escaneando el QR (o hasta 3 mandos Bluetooth). Soportado tanto en *Super Cinnamoroll Run* como en *Cinnamoroll World: Casa de Sueños*.
* **Sesiones Paralelas Aisladas (`sessionStorage`):** Permite abrir múltiples sesiones independientes en paralelo sin colisión de códigos de sala.

---

## ⚡ Rendimiento, PWA y Cero Build Step (`v27`)
* **Vanilla JavaScript (ES6+):** Cero dependencias de compilación, carga instantánea.
* **Service Worker Silencioso (`sw.js` · `cinnamoroll-land-v27`):** Estrategia *Network-First* sin recargas forzadas (`controllerchange` eliminado), garantizando que una actualización en segundo plano jamás devuelva a la jugadora al menú de inicio mientras juega.
* **Suite de Pruebas E2E Multi-Dispositivo (`tools/test_all_games_controller.py`):** Verifica en Chromium tanto la pantalla de TV como los celulares conectados (`P1`, `P2`, `P3`) en los 9 juegos, el Modo Cooperativo, el Pasaporte de Stickers y el Coordinador Inteligente de Entrada.

---

## 🚀 Cómo Ejecutar Localmente

### Opción 1: Servidor Local Rápido (Recomendado)
Haz doble clic en [`start.bat`](file:///c:/Users/Juli%C3%A1nNeiraNova/OneDrive%20-%20CEIBO%20TECH/Documentos/Cinamonroll/start.bat) o ejecuta en terminal:
```powershell
node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((q,s)=>{let p=path.join('.',decodeURIComponent(q.url.split('?')[0]));if(p==='.')p='./index.html';if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!fs.existsSync(p)){s.writeHead(404);return s.end();}const ext=path.extname(p);const t={'html':'text/html','css':'text/css','js':'application/javascript','png':'image/png'}[ext.slice(1)]||'text/plain';s.writeHead(200,{'Content-Type':t});fs.createReadStream(p).pipe(s);}).listen(8080,()=>console.log('http://localhost:8080'));"
```
Abre en tu navegador: `http://localhost:8080`

### Opción 2: Publicar Actualizaciones a GitHub Pages
Ejecuta el script incluido:
```bat
push_to_github.bat
```
O manualmente:
```bash
git add -A
git commit -m "feat: actualización de la suite Cinnamoroll Land"
git push origin main
```
El sitio se actualiza automáticamente en: [https://jsnn15.github.io/cinnamonAmanda/](https://jsnn15.github.io/cinnamonAmanda/)

---

## 👧 Diseñado para Amanda con Amor
Todo el contenido ha sido probado para garantizar una experiencia tierna, divertida, sin frustraciones y visualmente fiel al mágico mundo de Sanrio.
