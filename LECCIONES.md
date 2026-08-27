# LECCIONES.md — Grafoterapia

Detalle técnico y trampas ya pagadas. Lo del día a día está en `CLAUDE.md`.

## 2026-08-21 — El "trabajo sin commitear" era humo (CRLF)

`git status` marcaba `index.html`, `server.js` y `Dockerfile` como modificados,
pero `git diff` salía **vacío**: los archivos eran idénticos, solo cambiaban los
finales de línea (CRLF en el working tree contra LF en los blobs), más el stat
cache de Git que en DrvFs/OneDrive no se refresca solo.

**Diagnóstico rápido:** `git diff --ignore-cr-at-eol` vacío ⇒ es CRLF.
**Arreglo:** normalizar a LF y `git add -A` (limpia el stat cache).
**Prevención:** `.gitattributes` con `* text=auto eol=lf` — ya está en el repo.

El mismo falso positivo apareció en Columen y en Mascotitas. Antes de anotar
"quedó trabajo sin commitear", mirar el diff real.

## 2026-08-21 — El logo del nav rompía el scroll suave

El handler hacía `document.querySelector(this.getAttribute('href'))` para todo
`a[href^="#"]`. El logo era `href="#"` ⇒ `querySelector('#')` tira
**`SyntaxError: '#' is not a valid selector`**: clic muerto (el `preventDefault`
ya había corrido) y error en consola.

Se eliminó el handler entero: `scroll-behavior: smooth` + `scroll-margin-top` en
CSS hacen lo mismo, **y además** dejan el `#hash` en la URL y el botón "atrás"
funcionando. Menos JS y mejor comportamiento.

## 2026-08-21 — Sin JS la página quedaba en blanco

29 elementos con `.reveal { opacity: 0 }` y un IntersectionObserver que les
agregaba `.visible`. Si el JS no corría (error, bloqueado, red cortada a mitad),
**no se veía nada**: ni el texto, ni los botones, ni el WhatsApp.

Patrón aplicado: un `<script>` de una línea en el `<head>` agrega `html.js`, y la
regla que oculta pasó a ser `.js .reveal`. Sin JS no hay clase, no hay ocultado,
la página se ve entera (sin animación, que es lo de menos).

Verificado con `chrome --headless --disable-javascript`.

## Cómo sacar capturas de esta página (headless)

Chrome headless viejo **no corre las animaciones CSS** con `--virtual-time-budget`,
y las animaciones del hero usan `fill-mode: both` con `opacity: 0` al inicio ⇒ el
hero sale vacío. Además, entrar con `#ancla` descuadra la captura.

Lo que sí funciona: servir una copia con `.hero { min-height: auto }` y capturar
con una ventana altísima (`--window-size=1440,5400`), así todo entra en el
viewport y el observer marca los 29 `.reveal` de una.

El ancho de ventana **no** emula un móvil (Chrome en Windows impone un mínimo):
la captura sale recortada, no es un bug de la página. Para responsive, navegador
real.

## Medidas de referencia

- `index.html`: ~43 KB en texto plano, **~10,5 KB con gzip** (`compression`).
- `adriana.jpg`: 800×447. Se muestra en un contenedor 3:4 con `object-fit: cover`
  y `object-position: center top` ⇒ recorta bastante a los costados. Si alguna vez
  hay una foto vertical, queda mejor.
- `og-image.jpg`: 1200×630 (la medida que piden WhatsApp/Facebook).
