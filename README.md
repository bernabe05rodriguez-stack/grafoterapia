# Grafoterapia — Landing Page

Landing page profesional de **Adriana Sánchez** — grafóloga, grafoterapeuta y
especialista infanto juvenil y adultos. Una sola pantalla, con WhatsApp como
único canal de contacto.

🔗 https://redhawk-grafoterapia.bm6z1s.easypanel.host

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
| `Dockerfile` | Imagen de producción — **copia los archivos uno por uno** |

## Desarrollo local

```bash
npm install
PORT=3000 node server.js
# http://localhost:3000
```

## Deploy

1. `git push origin master` — la rama es **`master`**, no `main`.
2. Deploy manual por la API de EasyPanel:

```
POST services.app.deployService
{"json":{"projectName":"redhawk","serviceName":"grafoterapia"}}
```

El token vive en `~/.claude/secrets/easypanel.env`.

3. Verificar: `curl -s -o /dev/null -w '%{http_code}' <URL>/health` → `200`.

## Antes de tocar

Leé [`CLAUDE.md`](CLAUDE.md) (reglas del día a día) y [`LECCIONES.md`](LECCIONES.md)
(trampas ya pagadas).
