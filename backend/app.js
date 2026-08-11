/**
 * Configuration de l'application Express (separee du serveur : facilite les tests).
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// --- Securite ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }));
app.use('/api/auth/login', rateLimit({ windowMs: 10 * 60 * 1000, max: 20, message: { success: false, message: 'Trop de tentatives, reessayez plus tard' } }));

// --- Parsers & logs ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Fichiers statiques (images produits, logos) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API ---
// Evite "Cannot GET /" quand le navigateur ouvre la racine du backend par erreur.
app.get('/', (_req, res) => res.json({
  success: true,
  message: 'API GigaTech — utilisez /api/health, /api/... (le frontend tourne sur ' + (process.env.CLIENT_URL || 'http://localhost:5173') + ')',
}));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API GigaTech operationnelle' }));
app.use('/api', routes);

// --- Erreurs ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
