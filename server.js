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

// Health check for EasyPanel
app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Grafoterapia running on port ${PORT}`);
});
