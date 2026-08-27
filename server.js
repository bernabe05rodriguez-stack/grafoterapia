const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

// El index.html pesa ~42 KB en texto plano y Traefik (el proxy de EasyPanel) no
// comprime por su cuenta. Con gzip baja a ~9 KB: es la mejora mas grande que
// tiene la pagina en 4G, y cuesta una linea.
app.use(compression());

// No anunciar "Express" en cada respuesta.
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // La pagina es HTML + CSS + JS inline + Google Fonts. Nada mas deberia cargar:
  // si alguna vez se inyecta un script de terceros, el navegador lo bloquea.
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self'"
  ].join('; '));

  // HSTS solo cuando la peticion ya vino por HTTPS (detras del proxy llega en el
  // header). Sin includeSubDomains ni preload: aplica a este host y nada mas.
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }
  next();
});

app.get('/', (req, res) => {
  // El HTML tiene que revalidar siempre: si no, un cambio de texto puede tardar
  // dias en aparecerle a alguien que ya visito la pagina.
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Imagenes: el nombre del archivo nunca cambia, pero tampoco cambia el contenido
// seguido. Un dia de cache evita volver a bajarlas en cada visita.
const IMG_CACHE = 'public, max-age=86400';

app.get('/adriana.jpg', (req, res) => {
  res.setHeader('Cache-Control', IMG_CACHE);
  res.sendFile(path.join(__dirname, 'adriana.jpg'));
});

// Imagen de previsualización al compartir el link (og:image).
// La piden los servidores de WhatsApp/Facebook, no el visitante.
app.get('/og-image.jpg', (req, res) => {
  res.setHeader('Cache-Control', IMG_CACHE);
  res.sendFile(path.join(__dirname, 'og-image.jpg'));
});

// Health check for EasyPanel
app.get('/health', (req, res) => res.send('ok'));

// Es una sola pagina: cualquier otra ruta (un link viejo, un typo) va al inicio
// en vez de mostrar el error pelado de Express.
app.use((req, res) => res.redirect(302, '/'));

const server = app.listen(PORT, () => {
  console.log(`Grafoterapia running on port ${PORT}`);
});

// EasyPanel manda SIGTERM al redeployar: cerrar las conexiones abiertas antes de
// morir evita que alguien reciba una respuesta cortada.
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando...');
  server.close(() => process.exit(0));
});
