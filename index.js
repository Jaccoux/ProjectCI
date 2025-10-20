const express = require('express');
const client = require('prom-client');
const app = express();
const PORT = 3000;

// Créer un compteur pour les requêtes HTTP (Métrique existante)
const http_requests_total = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
});

// NOUVEAU : Créer un Histogramme pour mesurer la latence
const http_request_duration_seconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  // Buckets (compartiments) de latence en secondes
  buckets: [0.1, 0.5, 1, 5, 10] 
});

// Middleware pour compter chaque requête ET mesurer la latence
app.use((req, res, next) => {
  // NOUVEAU : Démarre le chronomètre pour la durée de la requête
  const end = http_request_duration_seconds.startTimer();

  res.on('finish', () => {
    // Logique de compteur existante
    http_requests_total.inc({
      method: req.method,
      route: req.path,
      code: res.statusCode
    });

    // NOUVEAU : Arrête le chronomètre et enregistre la latence dans l'Histogramme
    end({
      method: req.method,
      route: req.path
    });
  });
  next();
});

// Route principale
app.get('/', (req, res) => {
  res.send('Hello CI/CD et Observability !');
});

// Endpoint pour Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Démarrage du serveur
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});