const express = require('express');
const client = require('prom-client');
const app = express();
const PORT = 3000;

// Créer un compteur pour les requêtes HTTP
const http_requests_total = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
});

// Middleware pour compter chaque requête
app.use((req, res, next) => {
    res.on('finish', () => {
        http_requests_total.inc({
            method: req.method,
            route: req.path,
            code: res.statusCode
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
//app.listen(PORT, () => {
//  console.log(`Server running on http://localhost:${PORT}`);
//});
// Correction démarrage du serveur avec Gemini
const HOST = '0.0.0.0'; // <-- AJOUTER ET UTILISER CETTE LIGNE
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});