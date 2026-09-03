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

**3. `panel.redhawk.digital` no resuelve desde WSL** (curl `rc=6`). Y ojo con el
nombre del procedimiento, que **depende de la capa**: por el **MCP de EasyPanel**
es `deployAppService` (sin namespace, *destructive*) y `services.app.deployService`
ahí responde *Unknown procedure*; ese nombre con namespace es la **ruta HTTP del
tRPC**, que es otra cosa y no se probó acá. El MCP además rechazó con `BAD_REQUEST`
**cualquier** input de dos argumentos, así que por ahí no se pudo deployar.

Lo que sí funcionó para deployar es el **hook propio del servicio**:

```bash
curl -sk --resolve panel.redhawk.digital:443:84.46.252.202 \
  https://panel.redhawk.digital/api/deploy/<token>    # -> 200 "Deploying..."
```

El token de cada servicio sale de `listProjectsAndServices`.

**Y lo más importante: el trabajo quedó rehén de una decisión que no lo
bloqueaba.** La pasada técnica se dejó parada "a la espera de decidir qué se hace
con los testimonios inventados" — y la accesibilidad, el SEO y el gzip no tienen
nada que ver con los testimonios. El vault **no** mintió: decía "sin commitear ni
deployar". Pero anotar bien el estado no alcanza si nadie vuelve a buscarlo.
**"Está hecho" y "está en producción" son dos estados distintos**; verificar contra
el sitio en vivo, no contra la nota:

```bash
URL=https://redhawk-grafoterapia.bm6z1s.easypanel.host
curl -s $URL/ | grep -c "classList.add('js')"                    # 1 = v3.1 arriba
curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}\n' $URL/   # ~10600
```

## 2026-09-03 — El dominio propio: la ñ y el orden de los pasos

`depuñoyletra.online` (Hostinger). Dos cosas que valen para la próxima.

**La ñ no existe fuera del navegador.** En DNS, en Traefik y en el certificado el
dominio es `xn--depuoyletra-4db.online`. El navegador y Google lo decodifican y
muestran la ñ, pero cualquier cosa que se configure a mano va en punycode.

Dentro del HTML las 8 URLs absolutas **no van todas en la misma forma**, y la
diferencia no es cosmética:

- **Punycode** en `og:image`, `og:image:secure_url`, `twitter:image` y las
  imágenes del JSON-LD. Son archivos que un rastreador **descarga**: no se gana
  nada arriesgando que alguno no sepa parsear un host con ñ.
- **Unicode** en `og:url`, `canonical` y la `url` del JSON-LD. Esas se **leen**.
  Si en la tarjeta de WhatsApp aparece `xn--depuoyletra-4db.online`, parece
  phishing — justo lo contrario de lo que la placa `og-image` vino a lograr.

**El orden importa: primero el DNS, después el dominio en EasyPanel.** Se
crearon los dominios en EasyPanel antes de cargar los registros A en Hostinger.
Let's Encrypt intentó validar contra un dominio que todavía no resolvía, falló, y
quedó en backoff: **más de 4 minutos y dos deploys sirviendo el cert autofirmado**
de EasyPanel, con Chrome marcando "No es seguro". Nada de la configuración estaba
mal — se verificó que era idéntica a `mascotitas.online` y
`creador.fidelizador.online`, que sí andan, y que no había registros CAA.

Lo que lo destrabó es el pitfall ya documentado en Mascotitas: **borrar el domain
y volver a crearlo** (`domains.deleteDomain` + `domains.createDomain` con id
nuevo) + deploy. El cert salió en menos de 12 segundos.

Para diagnosticar esto sin adivinar, tres comandos:

```bash
D=xn--depuoyletra-4db.online
echo | openssl s_client -connect $D:443 -servername $D 2>/dev/null | openssl x509 -noout -issuer
curl -s -o /dev/null -w '%{http_code}\n' http://$D/.well-known/acme-challenge/probe   # 404 sin redirigir = el challenge llega
curl -s -o /dev/null -w 'ssl_verify=%{ssl_verify_result}\n' https://$D/               # 0 = cadena valida
```

`ssl_verify=0` es la única prueba de que salió bien: un `200` con `-k` lo da igual
el cert autofirmado.

## 2026-09-03 — La foto: un marco vertical para una foto apaisada, y la marca de agua

Dos problemas distintos en el mismo archivo. El segundo tapaba al primero.

**1. El encuadre.** `adriana.jpg` es **apaisada: 800x447**, y estaba metida en un
marco `aspect-ratio: 3/4` **vertical** con `object-fit: cover`. De los 800px de ancho
se veian **335**. En el celular era peor porque encima se achicaba a 280px. Eso era
lo que se veia "cortado". Ahora el marco es **4/3**: se ven 596px y entra entera.

**2. La marca de agua.** La foto traia el **destello de cuatro puntas** que dejan las
herramientas de IA de Google, en el angulo inferior derecho — medido en
**x 715-745, y 358-393**. Se quito el 2026-09-03 por relleno de difusion (resolver
Laplace sobre la zona, sin grano y con la mascara difuminada). Detalles que importan
si hay que repetirlo:

- **Sin grano.** El primer intento le agrego ruido "para que no quedara liso" y el
  parche se vio como un cuadrado con textura distinta: ahi el fondo es bokeh, o sea
  **liso de verdad**. Agregar grano lo delataba.
- **Mascara difuminada, no caja dura.** Con la caja de bordes rectos se ve el corte.
- Se revisaron **las cuatro esquinas**: solo estaba esa.
- La placa `og-image.jpg` **no la llevaba** (recorta antes), no hubo que rehacerla.
- El original con la marca queda en el historial de git.

⚠️ **Ojo con la doc**: mientras la marca estuvo, la regla era "no ensanchar mas de
4/3 porque a 3/2 la marca entra en cuadro". Ya no aplica — se quito la marca, no la
restriccion. El 4/3 se mantiene por **composicion**, no por obligacion. Una regla
dura que sobrevive a su motivo es peor que no tenerla.

**Lo que sigue pendiente**: 800x447 es **poca resolucion** para el uso actual. En el
celular la foto se muestra a 445px CSS, o sea que en una pantalla 2x pide ~890px y no
los tiene. Con el archivo original de camara se arregla esto y ademas se podria volver
a un encuadre vertical, que para un retrato queda mejor.

## 2026-09-03 — Capturar el celular: el ancho miente, medilo desde adentro

La entrada vieja decia que el ancho de ventana "no emula un movil" y que la captura
"sale recortada". Es cierto y ahora esta el numero: **Chrome en Windows fija
`window.innerWidth` en 500 por mas que se pida `--window-size=390`** — tambien con
`--headless=new`. El PNG sale de 390px porque se **recorta** una pagina compuesta a
500. Por eso el texto aparece cortado a la derecha y **parece** un desborde que no
existe.

No lo deduzcas: medilo. Inyectar una sonda que escriba en el `<title>` y leerlo con
`--dump-dom` — `--dump-dom` devuelve el DOM ya ejecutado, asi que sirve de canal:

```js
document.title = 'innerWidth=' + window.innerWidth +
  ' scrollWidth=' + document.documentElement.scrollWidth;
// y el elemento que realmente se pasa:
document.querySelectorAll('*').forEach(el => {
  const r = el.getBoundingClientRect();
  if (r.right > window.innerWidth + 1) console.log(el);
});
```

Si `scrollWidth <= innerWidth` y ningun elemento se pasa, **no hay desborde**. Aca
dio `innerWidth=500, scrollWidth=485, ninguno` — la pagina estaba bien y el recorte
era del instrumento. Es el mismo error de [[control negativo]]: casi "arreglo" un
bug que solo existia en la herramienta de medicion. Para ver 390 de verdad,
navegador real.

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
