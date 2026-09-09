# depuñoyletra.online — Landing Page

Landing page profesional de **Adriana Lourdes Sánchez** — grafóloga, grafoterapeuta y
especialista infanto juvenil y adultos. Una sola pantalla, con WhatsApp como
único canal de contacto.

🔗 https://depuñoyletra.online

## Stack

- **Frontend:** un solo `index.html` (HTML + CSS + JS inline, cero dependencias
  ni build). Lo único externo son las fuentes de Google.
- **Server:** Express — sirve el HTML, dos imágenes y un health check.
- **Deploy:** Docker → EasyPanel (proyecto `redhawk`, servicio `grafoterapia`).

Sin base de datos, sin estado, sin formularios: todo el contacto sale por `wa.me`.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La página completa |
| `server.js` | Express: rutas, cabeceras de seguridad, gzip, cache |
| `adriana.jpg` | Foto de la sección "Sobre mí" (800×447) |
| `og-image.jpg` | Preview al compartir el link (1200×630, la piden WhatsApp/Facebook) |
| `cuaderno-bg.webp` | Fondo único de cuaderno ilustrado (3840×2160) |
| `Dockerfile` | Imagen de producción — **copia los archivos uno por uno** |

## Desarrollo local

```bash
npm install
PORT=3000 node server.js
# http://localhost:3000
```

## Deploy

1. `git push origin master` — la rama es **`master`**, no `main`.
   Desde WSL falla (sin credenciales): va con el git de Windows, igual que los
   clones. Ver `LECCIONES.md`.
2. Deploy manual — **no es automático**. El hook propio del servicio es el
   camino que funciona (`panel.redhawk.digital` no resuelve desde WSL):

```bash
curl -sk --resolve panel.redhawk.digital:443:84.46.252.202 \
  https://panel.redhawk.digital/api/deploy/<token del servicio>
```

   Por el **MCP de EasyPanel** el procedimiento es **`deployAppService`**; por la
   **ruta HTTP del tRPC** es `services.app.deployService`. Son capas distintas: el
   nombre de una no sirve en la otra.

3. Verificar — un `200` en `/health` **no alcanza**, confirmá que salió lo nuevo:

```bash
URL=https://depuñoyletra.online
curl -s -o /dev/null -w '%{http_code}\n' $URL/health
curl -s $URL/ | grep -c "classList.add('js')"
```

## Antes de tocar

Leé [`CLAUDE.md`](CLAUDE.md) (reglas del día a día) y [`LECCIONES.md`](LECCIONES.md)
(trampas ya pagadas).
