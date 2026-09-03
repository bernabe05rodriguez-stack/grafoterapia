# CLAUDE.md — Grafoterapia

Landing de **Adriana Sánchez** (mamá de Bernabé), grafóloga y grafoterapeuta.
Producción: https://depuñoyletra.online

## Reglas duras

1. **La rama es `master`, no `main`.** El README viejo decía `main` y era mentira.
2. **`git pull origin master` antes de tocar nada.** Este repo se trabaja desde
   dos máquinas y la otra no siempre documenta.
3. **Agregar un archivo estático son 3 pasos, no 1:**
   `COPY` en el `Dockerfile` + ruta `app.get()` en `server.js` + referencia en el
   HTML. Si falta cualquiera de los tres, en local anda y en producción da 404.
4. **No cambiar la URL de `/og-image.jpg`.** WhatsApp cachea el preview por link;
   si se renombra, todos los links ya compartidos pierden la imagen.
5. **`adriana.jpg` está retocada.** Tenía una marca de agua de IA en el ángulo
   inferior derecho y se le quitó el 2026-09-03; el archivo original, con la marca,
   queda en el historial de git. Si alguien reemplaza la foto por otra versión,
   **revisar las cuatro esquinas antes de subirla**. Detalle en `LECCIONES.md`.
6. **El deploy NO es automático.** Push + `deployService` por la API de EasyPanel
   (`redhawk` / `grafoterapia`). Ver README.
7. **El contenido lo decide la clienta.** Adriana ya pidió dos veces que la página
   sea más corta. Antes de agregar una sección nueva, preguntar. Nunca inventar
   credenciales, precios, dirección ni modalidad (presencial/online): si no está
   en la página, es porque nadie lo confirmó.
8. **Cero promesas médicas.** El copy posiciona la grafoterapia como
   *acompañamiento*, y el footer lleva el disclaimer. No tocar ese encuadre.
9. **Sin build, sin framework, sin dependencias en el front.** Todo va inline en
   `index.html`. Si algo necesita npm en el frontend, está mal planteado.

## Cosas que se rompen fácil

- **`.reveal` oculta el contenido para animarlo.** La opacidad 0 cuelga de
  `html.js`, que agrega un `<script>` en el `<head>`. Si se saca ese script o se
  mueve la regla a `.reveal` a secas, cualquier error de JS deja la página **en
  blanco**. Probar siempre con JS desactivado.
- **La CSP de `server.js` es estricta.** Un `<script src>` externo, una fuente de
  otro CDN o una imagen remota quedan bloqueados hasta agregarlos a la política.
- **El nav es fijo (72px).** Las secciones llevan `scroll-margin-top: 88px` para
  que el título no quede tapado al saltar por ancla. Sección nueva → `id` + esa
  regla ya la cubre (`section[id]`).

## Verificar antes de dar algo por hecho

```bash
PORT=3000 node server.js
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/health
```

En producción, un 200 no alcanza: confirmar el `commit.sha` con `inspectService`.
