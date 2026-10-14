# 🌸 Cinnamoroll Land · Suite de Juegos Preescolares de Sanrio

Una suite de juegos web liviana, interactiva, relajante y de alta calidad diseñada especialmente para **Amanda (5 años)**, inspirada en el universo oficial de **Cinnamoroll** y sus amigos de Sanrio (*Milk, Pompompurin, Mocha y Chiffon*).

**Sitio en Vivo (GitHub Pages):** [https://jsnn15.github.io/cinnamonAmanda/](https://jsnn15.github.io/cinnamonAmanda/)

---

## 🗺️ Arquitectura de la Suite (8 Juegos)

```
                       ┌─────────────────────────────────────────┐
                       │        Cinnamoroll Land (Hub)           │
                       │   Navegación universal · Caja de Música │
                       └────────────────────┬────────────────────┘
          ┌─────────────────┬───────────────┼───────────────┬─────────────────┐
          ▼                 ▼               ▼               ▼                 ▼
   🛫 ¡A Volar!      🧁 Pastelería    🎨 Taller de    🃏 Memorice de   🏃 Super Run
   Vuelo por nubes   Sumas y conteo   Dibujo Sanrio   Cartas y parejas  Plataformas 2D
   Voz y sensores    Con Milk y Cinna 5 láminas B&W   3 dificultades   Planeo de orejas
          │                 │               │               │                 │
          └─────────────────┴───────────────┼───────────────┴─────────────────┘
                            ┌───────────────┴───────────────┐
                            ▼                               ▼
                     🎮 Repartidor 3D               ✏️ Palabras Mágicas
                     Motor DOOM 2.5D Pabellón       Taller Waldorf / Montessori
                     Sombras 3D y bandejas          Mamá, Papá, Amanda y Sanrio
                            │                               │
                            └───────────────┬───────────────┘
                                            ▼
                                     🧩 Puzzles de Lógica
                                     Tangram de formas y figuras
```

---

## 🎮 Detalle Completo de los 6 Juegos

### 1. 🛫 ¡A Volar con Cinnamoroll!
* **Mecánica:** Vuela por cielos de colores recolectando estrellas mágicas ⭐, rollitos de canela 🍥 y corazones 💗.
* **Física:** Movimiento con resorte amortiguado (suave, sin tirones) e imán generoso para que las estrellas se acerquen solas.
* **Sin frustración:** Cada 10 estrellas el cielo cambia de fase horaria (*día soleado → atardecer naranja → noche estrellada → amanecer pastel*) con lluvia de confeti.
* **Controles múltiples:**
  * **Teclado:** `↑` / `↓` o `W` / `S` · `Espacio` = pirueta · `H` = saludo.
  * **Pantalla táctil / Ratón:** Arrastrar el dedo para que Cinnamoroll lo siga suavemente.
  * **Voz:** Decir *"arriba"*, *"abajo"*, *"gira"*, *"hola"*.
  * **Soplar / Cantar:** El nivel del micrófono eleva a Cinnamoroll al soplar.
  * **Giroscopio / Acelerómetro:** Inclinar el móvil o tablet para volar.
  * **Sensor externo:** Conexión vía WebSocket (`?ws=ws://IP:PUERTO`) lista para microcontroladores (ESP32, Arduino, micro:bit).

---

### 2. 🧁 Pastelería de Números (Sumas y Conteo Preescolar)
* **Mecánica:** Cinnamoroll y el pequeño **Milk** hornean delicias. Amanda cuenta cuántos dulces hay en la bandeja (sumas visuales del 1 al 8, y desafíos matemáticos para niñas mayores).
* **Interacción táctil:** Tocar cada pastelito hace que salte con un sonido de burbuja (*pop*) y muestre su número en orden (1, 2, 3...) para ayudarla a contar con el dedo.
* **Tipografía Kawaii Homogénea (v15):** Los números grandes y de dos cifras (como el 23) conservan estrictamente la tipografía redondeada de ensueño (*Baloo 2*) con proporciones armonizadas (`.double-digit`) sin perder la estética mágica del juego.
* **Control Remoto para Televisor (v15):** Al conectar el celular como mando, la pantalla del teléfono muestra un teclado numérico táctil interactivo con las opciones de respuesta gigantes, permitiendo jugar en la TV desde el sillón.
* **Botones adaptados para no-lectores:** Cada botón de respuesta muestra el número grande y los puntitos correspondientes debajo (`● ● ●`) para comparar directamente con los dulces contados.
* **Cero frustración:** Si elige otro número, la bandeja simplemente se balancea con un suave sonido elástico y el juego invita a contar de nuevo con alegría.

---

### 3. 🎨 Taller de Dibujo (Colorear con Sanrio)
* **5 Láminas Oficiales Normalizadas con Calidad de Imprenta (600x500):**
  1. **Cinnamoroll:** Flotando en el cielo con sus orejitas extendidas.
  2. **Milk (みるく):** Con su chupete celeste y su osito de peluche.
  3. **Pompompurin (ポムポムプリン):** Con su boina de chocolate y plato de flan con corazón.
  4. **Mocha (モカ):** Con sus largas orejitas onduladas, flor en la oreja y contornos de cuello/barbilla restaurados.
  5. **Chiffon (シフォン):** Con sus orejas esponjosas como nubes y boina, con tinta negra nítida y pura.
  * **Normalización Milimétrica (v14):** Procesadas mediante supersampling Lanczos 2x, anti-aliasing subpixel y calibración de grosor de trazo (7-8px homogéneos en todos los personajes), eliminando bordes dentados y grises difusos.
* **Herramientas de Arte & Experiencia Amanda:**
  * **↩️ Botón Deshacer (Undo):** Pila de retroceso de 20 pasos para que Amanda pueda corregir trazos con total tranquilidad.
  * **💾 Persistencia por Lámina:** Cambiar de personaje ya no borra el dibujo; el taller guarda en memoria el boceto de cada amigo.
  * **Crayón / Pincel libre:** Con 3 grosores (fino, medio, grueso), trazo suave redondeado y cursor dinámico con aro de previsualización de grosor.
  * **Contorno protegido:** Los colores se aplican con modo `multiply` bajo las líneas originales, garantizando que el contorno negro nunca quede cubierto por la pintura.
  * **Relleno Mágico (Tap-to-fill / Bucket):** Tocar cualquier zona cerrada rellena el área respetando el contorno negro.
  * **Borrador suave:** Para limpiar cualquier trazo.
  * **Sellitos y Estampas:** Estrellitas ✨, corazones 💖, florecitas 🌸 y brillos con partículas flotantes.
  * **Botón Guardar con Firma:** Descarga la obra terminada en PNG firmada con: *"✨ Obra de Arte de Amanda • Cinnamoroll Land"*.

---

### 4. 🃏 Memorice de Sanrio (Juego de Memoria)
* **Mecánica:** Encontrar las parejas de los amigos de Cinnamoroll volteando tarjetas mágicas con giro 3D.
* **Personajes Oficiales:** Cinnamoroll, Milk con osito, Pompompurin con boina, Mocha con flor, Chiffon esponjosa, y Bebé Milk.
* **3 Niveles de Dificultad:**
  * **Fácil (6 cartas):** 3 parejas, ideal para partidas rápidas.
  * **Medio (8 cartas):** 4 parejas.
  * **Difícil (12 cartas):** 6 parejas.
* **Celebración:** Efecto de confeti y arpa al completar el tablero.

---

### 5. 🏃 Super Cinnamoroll Run (Aventura de Plataformas 2D)
* **Selector de 4 Héroes de Sanrio Jugables:**
  * 🐶 **Cinnamoroll:** Planeo de orejas extendidas (*Ear-Glide*) con caída ultra suave y estela celeste.
  * 🍼 **Milk:** Flotación de bebé (*Baby Float*) con saltitos tiernos y su osito de peluche.
  * 🍮 **Pompompurin:** Rebote elástico (*Custard Bounce*) con gran impulso como flan de caramelo.
  * 🌸 **Chiffon:** Salto alto y ágil (*Cloud Leap*) con sus orejitas de nube esponjosa.
* **Física de Salto Moderna y Snappy:**
  * Velocidad de salto ajustada a `-460` a `-490 px/s` calculada en tiempo continuo (delta-time).
  * **Coyote Time (0.12s):** Permite saltar aunque el personaje acabe de dejar el borde de una plataforma.
  * **Jump Buffering (0.15s):** Registra la pulsación de salto antes de tocar tierra para una respuesta inmediata.
  * **Salto de Altura Variable:** Soltar la tecla o el botón táctil antes acorta la parábola para saltos de precisión.
  * **Animación Squash & Stretch:** Deformación elástica viva en despegues y aterrizajes (`squashX`, `squashY`), balanceo rítmico de carrera (*walk bob*) y partículas de corazones y estrellas.
* **Mundo de Dulces con Efecto Parallax:**
  * Cielo degradado con nubes flotantes y gran arcoíris translúcido de fondo.
  * Colinas lejanas de frutilla y algodón de azúcar a velocidad reducida (0.35x).
  * Plataformas de waffle con glaseado chorreante, flores en flor y fresas silvestres.
  * Trampolines de gelatina que impulsan alto (`vy = -680 px/s`).
  * Cupcakes flotantes para recolectar con sonido de campanita.
  * Rescate mágico: Si cae al vacío, una nube lo devuelve suavemente hacia arriba.
* **Meta Picnic:** Al llegar al final (x = 2800), lo esperan en un mantel de picnic con globos todos sus amigos oficiales: **Milk, Pompompurin, Mocha y Chiffon**.
* **Adaptabilidad Móvil 100% Calibrada (v15):** HUD superior reorganizado en dos filas compactas en smartphones para que el botón de cambio de héroe y la ciudad actual nunca queden fuera del borde de la pantalla (incluso en pantallas estrechas de 360px a 390px), con modales fijos adaptados a la pantalla táctil.

---

### 6. 🎮 Repartidor de Dulces 3D (Motor DOOM 2.5D Pabellón Sanrio)
Completamente rediseñado con mapa espacioso, eliminación de atascos y renderizado pseudo-3D de alta gama:

* **Mapa de Pabellón Amplio (14 x 12):**
  * Eliminación total de pasillos de 1 sola casilla.
  * Pasillos anchos de **2 a 4 baldosas**, gran plaza central abierta y 4 salones temáticos dedicados a cada personaje.
* **Física Anti-Atascos e IA de Cortesía (Cero Bloqueos):**
  * **Separación Elástica de Amigos (Boids Flocking Repulsion):** Los personajes se repelen continuamente a distancia de seguridad (`minDist = 1.2`), garantizando que **NUNCA se encimen ni se superpongan**.
  * **Ceder el Paso Cortésmente (Gentle Step-Aside):** Al acercarse Amanda a menos de 1 metro, los amigos se deslizan amablemente hacia un espacio libre para dejarla pasar.
  * **Radio de Colisión Suave:** Optimizado (`radius + 0.16`) para permitir deslizarse fluidamente incluso en esquinas con múltiples personajes alrededor.
* **Renderizado Tridimensional de Personajes (Eliminación de la apariencia "a mano"):**
  * **Sombra de Suelo Proyectada en Perspectiva:** Elipse difusa bajo los pies de cada amigo que se escala según la distancia y el salto, anclándolos visualmente al piso 3D.
  * **Iluminación 3D Ambiental & Depth Fog:** Los sprites reciben tinte y sombreado volumétrico del entorno en lugar de flotar como calcomanías planas.
  * **Espejo Direccional & Respiración 3D:** Orientación dinámica según la dirección de caminata y balanceo de respiración orgánico.
* **Primera Persona Volumétrica de Calidad de Consola:**
  * Brazos redondeados con gradientes cilíndricos y luces especulares.
  * Bandeja de porcelana con filo dorado metálico y reflejo cerámico brillante.
  * Dulces modelados en 3D con relieve glaseado, espirales de canela, botella de leche translúcida y flan con caramelo chorreante.

---

### 7. ✏️ Palabras Mágicas (Taller Waldorf & Montessori de Escritura)
Diseñado con metodología preescolar multisensorial para que Amanda aprenda a escribir sus primeras palabras con alegría y afecto:

* **Vocabulario Afectivo y Amigos de Sanrio:**
  * 💖 **Familia y Amanda:** `MAMÁ`, `PAPÁ`, `AMANDA`, `AMOR`.
  * 🐶 **Amigos de Sanrio:** `CINNAMOROLL`, `MILK`, `PURIN`, `MOCHA`, `CHIFFON`.
  * 🌸 **Naturaleza y Dulces:** `SOL`, `NUBE`, `FLOR`, `PASTEL`.
* **Arrastre Táctil y Ergonomía de Pantalla (Pointer Events):**
  * **Arrastre Real con Dedo o Ratón:** Seguimiento a 60fps con clon flotante de galleta dorada con sombra 3D elevada (`pointer-events: none`).
  * **Imán Magnético Inteligente (75px):** Al acercar la galleta a su molde correspondiente, el casillero pulsa con un aura mágica rosa/dorada (`slot-magnet-match`).
  * **Snap & Fónica Musical:** Al soltar la galleta sobre su molde, encaja con sonido de campana afinada, ráfaga de estrellitas y pronunciación fónica de la letra.
  * **Asistencia Dual (Tap-to-Place):** Si la niña da un toque rápido sin arrastrar, la galletita vuela automáticamente a su molde correspondiente.
  * **Autocorrección Libre (Montessori):** Tocar una letra colocada la devuelve suavemente a la bandeja de galletitas sin penalizaciones.
  * **Normalización de Tildes:** Acepta tanto `Á` como `A` en palabras como `MAMÁ` y `PAPÁ` para evitar frustraciones ortográficas tempranas.
* **3 Modos Pedagógicos:**
  1. 🍪 **Alfabeto Móvil Montessori:** Bandeja de galletitas horneadas con moldes en relieve.
  2. ✨ **Trazado Caligráfico de Trazo Único & Abecedario Completo (v16):**
     * **Mapeo Integral de 32 Letras:** Cada letra del abecedario español (`A` a la `Z`, `Ñ`, `Á`, `É`, `Í`, `Ó`, `Ú`) cuenta con su esqueleto caligráfico oficial y sus **waypoints numerados de principio a fin** (`① ➔ ② ➔ ③ ➔ ④ ➔ ⑤`). Para la letra `M`, se incorporan sus 5 puntos completos resolviendo cualquier punto faltante en la pierna final.
     * **Flujo Natural sin Bloqueos:** El porcentaje de precisión (`% de acierto`) y las estrellas (`☆☆☆` a `⭐⭐⭐`) se actualizan en vivo mientras dibuja, pero la felicitación y fanfarria se evalúan exclusivamente **al levantar el dedo o lápiz (`pointerup`) tras completar la letra**, permitiendo a Amanda trazar todos los segmentos con calma sin interrupciones ni pantallas bloqueantes intermedias.
     * **Cinta del Abecedario Completo (A - Z):** Permite elegir y practicar cualquier letra del abecedario libremente o avanzar en orden con el botón *"Siguiente Letra 🌸"*.
     * **Banner de Victoria No Invasivo:** El mensaje de felicitación aparece como una notificación inferior suave sin tapar la pizarra, dejando el trazo visible para su disfrute.
  3. 🖍️ **Pizarra Libre con Tizas Pastel:** Pizarra de cuaderno caligráfico para escribir libremente con tizas de colores (rosa, celeste, amarillo sol, menta, blanco) y esponjita de borrar.
* **Fónica con Voz en Español:** Pronunciación dulce y cariñosa mediante `SpeechSynthesis` (*"¡Ma-má! ¡Excelente Amanda!"*).

---

### 8. 🧩 Puzzles de Lógica (Rompecabezas Visual de Madera Sanrio)
Diseñado desde cero bajo criterios de Game Design para niñas de prebásica (4 a 5 años, pre-lectoras):

* **100% Visual · CERO Necesidad de Leer Texto:**
  * Sustitución total de botones con texto ("Cabeza Nube", "Taza") por auténticas **piezas ilustradas troqueladas de los personajes**.
  * Reconocimiento natural de patrones visuales: orejitas de nube, colita de canela, osito de peluche, boina de flan.
* **5 Cuadros de Alta Resolución de Sanrio:**
  1. 🪽 **Cinnamoroll en el Cielo de Nubes:** Cinnamoroll volando suavemente entre nubes de algodón y arcoíris pastel.
  2. 🍼 **Milk y su Osito de Peluche:** El bebé Milk con su biberón y su osito favorito en tonos lavanda.
  3. 🌸 **Chiffon en el Prado de Flores:** Chiffon saltando alegre con sus orejitas de nube entre flores de cerezo.
  4. 🍮 **Pompompurin y su Flan Gigante:** Pompompurin con su boina de chocolate y delicioso flan de caramelo.
  5. 🎀 **Mocha en la Fiesta del Té:** La elegante Mocha con su flor rosa en un salón de té con pasteles.
* **Tablero con Marco de Madera y Silueta Guía ("Ghost Image"):**
  * Marco de madera biselado con relieve dorado.
  * Marca de agua semitransparente (opacidad 28%) en el fondo del tablero para que la niña compare formas y sepa intuitivamente dónde va cada pieza.
* **Dificultad Adaptativa Preescolar:**
  * 🧩 **4 Piezas Grandes (2x2):** Formato gigante ideal para pre-kínder (4 años).
  * ⭐ **6 Piezas (3x2):** Desafío para kínder (5 años).
* **Física Táctil y Encaje Magnético:**
  * Arrastre suave con clon tridimensional flotante.
  * Encaje magnético con destello dorado, campanita musical ascendente y lluvia de purpurina.
  * Asistencia gentil: Si Amanda toca directamente una ranura vacía del cuadro, la pieza de la bandeja vuela automáticamente a su lugar.
* **Gran Victoria:** El cuadro completo resplandece con animación arcoíris, fanfarria festiva y confeti.

---

## 🎵 Motor de Audio Procedural Kawaii
* **Cero Voces Sintéticas Robóticas:** Todo el audio está generado mediante la **Web Audio API** de forma procedural, sin dependencias externas ni archivos de audio pesados.
* **4 Melodías Procedurales con Selector Directo:**
  1. 🌸 *"Nubes de Algodón"* (Canción de cuna en 3/4)
  2. 🧁 *"Paseo por la Pastelería"* (Marcha alegre en 4/4)
  3. ☕ *"Hora del Té con Mocha"* (Vals dulce en 3/4)
  4. 🌈 *"Aventura en el Arcoíris"* (Escala pentatónica saltarina en 4/4)
* **Selector en la Barra Superior (`#globalBtnTrack`):** Amanda o sus padres pueden cambiar la melodía con un solo toque sin interrumpir el juego. Las canciones rotan automáticamente cada 2 repeticiones.
* **Efectos Sintetizados:** Chimes de campanas, pops de burbujas, arpas de victoria y formantes infantiles suaves.

---

## 🎮 Mando Inteligente Kawaii en tu Celular & Gamepad Físico (v15)

Permite transformar cualquier teléfono inteligente en un mando de consola inteligente de última generación o usar mandos físicos Bluetooth/USB:

* **📱 Mando Inteligente y Dinámico en el Celular (`controller.html`):**
  * **Cero descargas:** No requiere instalar apps de la App Store ni Google Play; funciona en cualquier navegador móvil escaneando el código QR.
  * **🕹️ Mando Palanca Virtual (Joystick Análogo 360°):** Reemplaza las flechas estáticas por una palanca táctil fluida con resorte que permite movimientos diagonales precisos (correr y saltar simultáneamente, planeo en diagonal, giros 360° en vuelo y desplazamiento omnidireccional en el laberinto 3D).
  * **🎯 Botones Contextuales Adaptados al Juego Activo (Smart Companion):**
    * **🧁 Modo Pastelería (Juego en Televisor / PC):** El teléfono detecta automáticamente la pregunta en pantalla y despliega un **teclado numérico táctil gigante** con los números de las alternativas (`[ 5 ] [ 6 ] [ 7 ]`). La niña puede responder desde el sillón mirando la tele directamente.
    * **🏃 Modo Super Run:** Palanca analógica + Botón Salto 🌸 + Botón Dulce 🧁 + Botón `🔄 AMIGO` para alternar de héroe (Cinnamoroll, Milk, Purin, Chiffon) sin tocar la pantalla principal.
    * **🛫 Modo Vuelo:** Palanca analógica + Botón Pirueta 🌀 + Botón Saludo 👋.
    * **🎮 Modo Repartidor 3D:** Palanca analógica 360° + Botón Lanzar Dulce 🍬.
    * **🏠 Modo Hub (Menú Principal):** Cuadrícula de acceso rápido para lanzar cualquiera de los 8 juegos remotamente desde el móvil, más botón `🏠 Menú` omnipresente.
  * **WebRTC P2P de Ultrabaja Latencia (PeerJS):** Conexión directa y ultra-rápida (< 15ms) entre el móvil y la computadora/TV, con respaldo automático local por `BroadcastChannel`.
  * **Feedback Táctil & Sonoro:** Respuesta háptica por vibración (`navigator.vibrate`) y pitidos de burbuja instantáneos para cada pulsación y movimiento.
* **🕹️ Soporte Nativo de Mandos Físicos (Gamepad API):**
  * Conexión instantánea Plug-and-Play vía Bluetooth o USB.
  * Compatible con:
    * **Nintendo Switch:** Mandos Joy-Con individuales o emparejados, Pro Controller.
    * **PlayStation:** DualShock 4 (PS4), DualSense (PS5).
    * **Xbox:** Mandos Xbox One, Xbox Series X/S.
    * **8BitDo & Genéricos:** Cualquier mando compatible con HID estándar.
  * Mapeo unificado para salto, movimiento lateral, piruetas y navegación.

---

## 📱 Centrado y Adaptabilidad Multi-Dispositivo (PC & Smartphone)
* **Centrado Universal:** Todos los juegos cuentan con contenedores Flexbox y reglas estrictas de `aspect-ratio` (`object-fit: contain`) para mantenerse perfectamente centrados tanto en vertical como en horizontal.
* **Smartphones en Vertical (ej. iPhone / Android 390x844):** Canales y lienzos centrados milimétricamente en el viewport, HUD superior despejado y botones táctiles adaptados al pulgar infantil.
* **Smartphones en Horizontal (ej. 844x390):** Barra superior compacta (44px), área de juego a pantalla completa sin cortes y mandos táctiles laterales accesibles.
* **Computadores y Tablets (1280x800, 1920x1080):** Lienzos nítidos con proporciones doradas y atajos de teclado completos.

---

## 🎨 Pipeline de Arte Oficial de Sanrio

Para garantizar la fidelidad con los personajes oficiales de Sanrio:
* **Paleta Oficial:** Contorno suave marrón chocolate (`#5c3d2e`), tonos pasteles, y proporciones exactas.
* **Herramientas de Procesamiento (`tools/make_chiffon.py`):**
  * Extracción con corrección de halo (des-matizado de fondos blancos y antialiasing preservado).
  * Generación dual: Sprite a color transparente para juegos dinámicos + lámina de líneas vectorizadas en blanco y negro para el taller de colorear.
  * Almacenamiento de referencias en `tools/ref/`.

---

## ⚡ Rendimiento, PWA y Cero Build Step

* **Vanilla JavaScript:** 100% código nativo (ES6+), sin frameworks pesados, sin Webpack, sin npm, sin bundlers.
* **Service Worker con Estrategia Network-First (`sw.js`):** La suite funciona sin internet una vez cargada, pero siempre prioriza las actualizaciones más recientes al conectarse.
* **Carga Inmediata:** Fuentes asíncronas (`media="print" onload="this.media='all'"`), splash screen pastel ultrarrápido y preloading de imágenes clave.

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
