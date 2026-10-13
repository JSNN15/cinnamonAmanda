# 🌸 Cinnamoroll Land · Suite de Juegos Preescolares de Sanrio

Una suite de juegos web liviana, interactiva, relajante y de alta calidad diseñada especialmente para **Amanda (5 años)**, inspirada en el universo oficial de **Cinnamoroll** y sus amigos de Sanrio (*Milk, Pompompurin, Mocha y Chiffon*).

**Sitio en Vivo (GitHub Pages):** [https://jsnn15.github.io/cinnamonAmanda/](https://jsnn15.github.io/cinnamonAmanda/)

---

## 🗺️ Arquitectura de la Suite (6 Juegos)

```
                       ┌─────────────────────────────────────────┐
                       │        Cinnamoroll Land (Hub)           │
                       │   Navegación universal · Caja de Música │
                       └────────────────────┬────────────────────┘
          ┌─────────────────┬───────────────┼───────────────┬─────────────────┐
          ▼                 ▼               ▼               ▼                 ▼
   🛫 ¡A Volar!      🧁 Pastelería    🎨 Taller de    🃏 Memorice de   🏃 Super Run     🎮 Repartidor 3D
   Vuelo por nubes   Sumas y conteo   Dibujo Sanrio   Cartas y parejas  Plataformas 2D   Motor DOOM 2.5D
   Voz y sensores    Con Milk y Cinna 5 láminas B&W   3 dificultades   Planeo de orejas Héroes y patitas
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
* **Mecánica:** Cinnamoroll y el pequeño **Milk** hornean delicias. Amanda cuenta cuántos dulces hay en la bandeja (sumas visuales del 1 al 8).
* **Interacción táctil:** Tocar cada pastelito hace que salte con un sonido de burbuja (*pop*) y muestre su número en orden (1, 2, 3...) para ayudarla a contar con el dedo.
* **Botones adaptados para no-lectores:** Cada botón de respuesta muestra el número grande y los puntitos correspondientes debajo (`● ● ●`) para comparar directamente con los dulces contados.
* **Cero frustración:** Si elige otro número, la bandeja simplemente se balancea con un suave sonido elástico y el juego invita a contar de nuevo con alegría.

---

### 3. 🎨 Taller de Dibujo (Colorear con Sanrio)
* **5 Láminas Oficiales en Blanco y Negro (Centradas y Proporcionadas):**
  1. **Cinnamoroll:** Flotando en el cielo con sus orejitas extendidas.
  2. **Milk (みるく):** Con su chupete celeste y su osito de peluche.
  3. **Pompompurin (ポムポムプリン):** Con su boina de chocolate y plato de flan.
  4. **Mocha (モカ):** Con sus largas orejitas onduladas y flor rosa.
  5. **Chiffon (シフォン):** Con sus orejas esponjosas como nubes y boina, re-escalada y centrada milimétricamente en el lienzo de 600x500 para armonizar con los otros personajes.
* **Herramientas de Arte:**
  * **Crayón / Pincel libre:** Con 3 grosores (fino, medio, grueso), trazo suave redondeado y cursor dinámico con aro de previsualización de grosor.
  * **Contorno protegido:** Los colores se aplican con modo `multiply` bajo las líneas originales, garantizando que el contorno negro nunca quede cubierto por la pintura.
  * **Relleno Mágico (Tap-to-fill / Bucket):** Tocar cualquier zona cerrada rellena el área respetando el contorno negro.
  * **Borrador suave:** Para limpiar cualquier trazo.
  * **Sellitos y Estampas:** Estrellitas ✨, corazones 💖, florecitas 🌸 y brillos con partículas flotantes.
  * **Botón Guardar:** Descarga la obra de arte terminada como imagen PNG.

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

---

### 6. 🎮 Repartidor de Dulces 3D (Motor DOOM 2.5D Clásico)
Inspirado en los motores raycaster clásicos (Wolfenstein 3D / DOOM), completamente rediseñado con estética pastel, física sólida y perspectiva en primera persona:

* **Selector de Personaje Jugable:**
  * 🐶 **Cinnamoroll:** Reparte rollitos de canela glaseados en plato de porcelana.
  * 🍼 **Milk:** Reparte biberones de leche tibia con chupete celeste.
  * 🍮 **Pompompurin:** Reparte deliciosos flanes de caramelo con cereza.
* **Perspectiva en Primera Persona Auténtica (DOOM Weapons):**
  * Se ven las patitas esponjosas del personaje sosteniendo la bandeja/dulce directamente frente al pecho.
  * Almohadillas rosadas en las patas con deditos ilustrados.
  * **Weapon Bobbing:** Vaivén rítmico de las manos al caminar en sincronía con los pasos (`walkTimer`).
  * **Sway:** Inclinación natural de las manos hacia los lados al rotar la vista.
  * **Recoil:** Animación en 3 fases al lanzar un dulce (impulso hacia adelante, repliegue de manos y reaparición con resorte).
* **Motor DDA Raycaster con Iluminación Direccional:**
  * Algoritmo *Digital Differential Analysis (DDA)* para cálculo exacto de distancias a muros.
  * **Sombreado Direccional de Caras:** Las paredes horizontales (Norte/Sur) tienen sombreado diferenciado (`0.72x`) de las verticales (Este/Oeste). Esto hace que cada esquina y recoveco en 3D tenga contraste y profundidad visual perfecta.
* **Texturas de Muros y Zócalos de Contraste:**
  * **Muro Galleta Waffle:** Tono doradito con cuadrícula y chispas de chocolate.
  * **Muro Oblea de Fresa:** Tono rosa pastel con franjas de crema.
  * **Muro Dulce de Menta:** Franjas diagonales de caramelo refrescante.
  * **Zócalo de Chocolate Oscuro (`#5a3825`):** Rodapié oscuro en la base de todas las paredes con línea dorada superior, eliminando toda confusión entre el suelo y los muros.
  * **Moldura de Glaseado:** Remate blanco en el techo.
  * **Suelo en Perspectiva:** Franjas horizontales con degradado para percibir velocidad y distancia al desplazarse.
* **Física y Deslizamiento (DOOM Collision):**
  * Radio físico del jugador (`r = 0.28`).
  * Deslizamiento independiente en ejes X e Y al rozar paredes (sin atascarse).
  * Rebote de pantalla y efecto auditivo suave (*soft boing*) al colisionar.
* **Inteligencia Artificial y Reacciones de los Amigos:**
  * Los amigos (*Mocha, Chiffon, Milk, Purin*) deambulan suavemente cerca de sus zonas de la panadería.
  * Orientación visual hacia el jugador con burbujas de diálogo adaptadas.
  * **Reacción de Alegría al Alimentarlos:** Saltos elásticos (`jumpY`), estallido de partículas de corazones y estrellas (`💖`, `✨`, `⭐`), y burbuja de agradecimiento: *¡Ñam ñam! ¡Gracias Amanda! 💖*.
* **Radar Minimap:** Mini-mapa en tiempo real en la esquina superior derecha que muestra el laberinto, la orientación del jugador y la ubicación de los amigos.
* **Controles Universales:** Flechas del teclado / WASD + Barra espaciadora para lanzar dulce. D-pad táctil y botón gigante de lanzamiento para pantallas táctiles.

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
