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

## 2026-08-27 — Deployar esto desde WSL: tres cosas que no funcionan

La v3.1 estuvo **6 días hecha y sin desplegar**: producción servía el commit del
18/8 mientras el trabajo entero vivía sin commitear en una carpeta de OneDrive.
Al ir a subirla aparecieron tres bloqueos, ninguno evidente hasta intentarlo.

**1. El repo no tenía identidad de git** — ni local ni global ⇒ `git commit`
muere con `empty ident name`. Este repo commitea como
`Bernabe Rodriguez <bernabe05rodriguez@gmail.com>`, la de sus 6 commits previos.
Ya quedó en el config local.

**2. WSL no puede pushear** (`could not read Username for 'https://github.com'`).
El push va con el git de Windows, igual que los clones:

```bash
powershell.exe -NoProfile -Command "cd 'C:\Users\berna\OneDrive\Documentos\Trabajo\grafoterapia'; git push origin master"
```

⚠️ PowerShell escupe la salida de git por stderr y la envuelve en un
`NativeCommandError` rojo. **No es un fallo**: mirar la última línea
(`73f6811..87c225a  master -> master`).

**3. `panel.redhawk.digital` no resuelve desde WSL** (curl `rc=6`). Y el nombre
del procedimiento que decía el README —`services.app.deployService`— **no
existe**: es `deployAppService`, sin namespace, y está catalogado como
*destructive*.

Lo que sí funcionó para deployar es el **hook propio del servicio**:

```bash
curl -sk --resolve panel.redhawk.digital:443:84.46.252.202 \
  https://panel.redhawk.digital/api/deploy/<token>    # -> 200 "Deploying..."
```

El token de cada servicio sale de `listProjectsAndServices`.

**Y lo más importante: "está hecho" y "está en producción" son dos estados
distintos.** La ficha del vault daba la v3.1 por hecha desde el 21/8. Verificar
siempre contra el sitio en vivo, no contra la nota:

```bash
URL=https://redhawk-grafoterapia.bm6z1s.easypanel.host
curl -s $URL/ | grep -c "classList.add('js')"                    # 1 = v3.1 arriba
curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}\n' $URL/   # ~10600
```

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
