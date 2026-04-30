const express = require('express');
// Import des routes
const userRoute = require('./routes/UserRoute');
const fournisseurRoute = require('./routes/FournisseurRoute');
const produitRoute = require('./routes/ProduitRoute');
const commandeRoute = require('./routes/CommandeRoute');
const paiementRoute = require('./routes/PaiementRoute');
const paiementHistoriqueRoute = require('./routes/PaiementHistoriqueRoute');
const approvisonementsRoute = require('./routes/ApprovisonementRoute');
const depenseRoute = require('./routes/DepenseRoute');
const livraisonHistoriqueRoute = require('./routes/LivraisonHistoriqueRoute');
const deivisRoute = require('./routes/DevisRoute');
const inventaireRoute = require('./routes/InventaireRoute');

const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middlewares globaux

/**
 * CORS — Protection uniquement sur un chemin (préfixe /api)
 *
 * Objectif:
 * - Ne pas exposer "tout le serveur" au CORS (évite d’ouvrir aussi des routes non-API)
 * - Autoriser uniquement les origines front nécessaires (prod + dev)
 *
 * Configuration:
 * - CORS_ORIGINS : liste séparée par virgule
 *   ex: "https://gestiongroupesiby.online,http://localhost:3000"
 */
const corsOriginsRaw = (process.env.CORS_ORIGINS || '').toString().trim();
const allowedOrigins = corsOriginsRaw
  ? corsOriginsRaw.split(',').map((s) => s.trim()).filter(Boolean)
  : [
      // Prod (avec / sans www)
      'https://gestiongroupesiby.online',
      'https://www.gestiongroupesiby.online',
      // Dev
      'http://localhost:3000',
    ];

// Petit helper pour tolérer www si l’admin l’utilise en prod.
const prodOriginRegex = /^https:\/\/(www\.)?gestiongroupesiby\.online$/i;

const corsOptions = {
  origin(origin, cb) {
    // origin absent => curl/Postman/serveur-à-serveur (pas un navigateur)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || prodOriginRegex.test(origin)) {
      return cb(null, true);
    }
    // On renvoie une erreur explicite (ceci remonte souvent en 500 si non géré ailleurs)
    return cb(new Error(`CORS refusé pour l'origine: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // cache preflight 24h
};

// CORS UNIQUEMENT pour l’API
app.use('/api', cors(corsOptions));
// Preflight pour toutes les routes /api/... (regex => pas de parsing path-to-regexp)
app.options(/^\/api\/.*$/, cors(corsOptions));
app.use(express.json()); // Parser les requêtes avec JSON

// Lire les données de formulaire avec body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Utilisation des routes étudiant
// Ajoute un préfixe /api à toutes les routes

// app.use('/', userRoute);

// Utilisation des routes Utilisateur
app.use('/boutique_banconi/api/users', userRoute);

// Utilisation des routes Produit
app.use('/boutique_banconi/api/produits', produitRoute);

// Utilisation des routes Fournisseur
app.use('/boutique_banconi/api/fournisseurs', fournisseurRoute);

// Utilisation des routes Commande
app.use('/boutique_banconi/api/commandes', commandeRoute);

// Utilisation des routes Devis
app.use('/boutique_banconi/api/devis', deivisRoute);

// Utilisation des routes Paiement
app.use('/boutique_banconi/api/paiements', paiementRoute);

// Utilisation des routes Paiement
app.use('/boutique_banconi/api/paiements_historique', paiementHistoriqueRoute);

// Utilisation des routes Approvisonnement
app.use('/boutique_banconi/api/approvisonnements', approvisonementsRoute);

// Utilisation des routes Livraison Historique
app.use('/boutique_banconi/api/livraison_historique', livraisonHistoriqueRoute);

// Utilisation des routes Depense
app.use('/boutique_banconi/api/depenses', depenseRoute);

// Utilisation des routes pour la vérification inventaire
app.use('/boutique_banconi/api/inventaires', inventaireRoute);

//  Exporter le fichier APP
module.exports = app;
