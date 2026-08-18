const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static assets (images)
app.get('/adriana.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'adriana.jpg'));
});

// Imagen de previsualización al compartir el link (og:image).
// Cache larga: la piden los servidores de WhatsApp/Facebook, no el visitante.
app.get('/og-image.jpg', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'og-image.jpg'));
});

// Health check for EasyPanel
app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Grafoterapia running on port ${PORT}`);
});
