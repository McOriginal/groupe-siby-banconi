const mongoose = require('mongoose');
const Commande = require('../models/CommandeModel');
const Paiement = require('../models/PaiementModel');
const Produit = require('../models/ProduitModel');
const PaiementHistorique = require('../models/PaiementHistoriqueModel');
const LivraisonHistorique = require('../models/LivraisonHistoriqueModel');

/**
 * Helpers - pagination / recherche (mode optionnel `paged=1`)
 *
 * Contrainte:
 * - On ne change PAS les URLs existantes
 * - Sans `paged=1`, le comportement historique reste identique
 */
function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function parseDateRange(qRaw) {
  // Support dd/mm/yyyy et yyyy-mm-dd pour la recherche par date
  const s = String(qRaw || '').trim();
  if (!s) return null;
  const fr = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  let day, month, year;
  if (fr.test(s)) {
    const m = s.match(fr);
    day = Number(m[1]);
    month = Number(m[2]);
    year = Number(m[3]);
  } else if (iso.test(s)) {
    const m = s.match(iso);
    year = Number(m[1]);
    month = Number(m[2]);
    day = Number(m[3]);
  } else return null;
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

// Créer une COMMANDE
exports.createCommande = async (req, res) => {
  const session = await Produit.startSession();
  session.startTransaction();
  try {
    const { fullName, phoneNumber, adresse, items, ...restOfData } = req.body;
    const lowerName = fullName.toLowerCase();
    const lowerAdresse = adresse.toLowerCase();
    const formattedPhoneNumber = Number(phoneNumber);

    // Etape 1 :  Vérifier si les items existent et si le stock est suffisant
    for (const { produit, quantity } of items) {
      // Parcourir chaque produit dans les items
      // const prod = await Produit.findById(produit).session(session);
      const prod = await Produit.findOneAndUpdate(
        { _id: produit, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      ).session(session);

      if (!prod) {
        return res.status(404).json({
          message: `Stock insuffisant ou produit introuvable pour: ${prod.name}`,
        });
      }
    }

    // -----------------------------------------------------------

    // Etape 2 : Créer la COMMANDE
    // Créer une nouvelle commande avec les données fournies
    const newCommande = await Commande.create({
      items,
      fullName: lowerName,
      adresse: lowerAdresse,
      phoneNumber: formattedPhoneNumber,
      user: req.user.id,
      ...restOfData,
    });
    // On arrêtre la session
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json(newCommande);
  } catch (error) {
    console.log('Erreur de validation de Commande :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --------------------------------------------------------------------------
// --------- Modifier une Commande ----------------------------------

exports.updateCommande = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { commandeId } = req.params;
    const {
      fullName,
      phoneNumber,
      adresse,
      statut,
      items,
      totalAmount,
      commandeDate,
    } = req.body;

    const existingCommande = await Commande.findById(commandeId).session(
      session
    );
    if (!existingCommande) {
      throw new Error('Commande non trouvée');
    }

    // Étape 1 : Restaurer les anciens stocks
    for (const item of existingCommande.items) {
      const produit = await Produit.findById(item.produit).session(session);
      if (!produit) throw new Error(`Produit ${item.produit} non trouvé`);
      produit.stock += item.quantity;
      await produit.save({ session });
    }

    // Étape 2 : Vérifier stock des nouveaux items
    for (const { produit, quantity } of items) {
      const prod = await Produit.findById(produit).session(session);
      if (!prod) throw new Error(`Produit ${produit} non trouvé`);
      if (prod.stock < quantity) {
        throw new Error(`Stock insuffisant pour le produit : ${prod.name}`);
      }
    }

    // Étape 3 : Décrémenter le nouveau stock
    for (const { produit, quantity } of items) {
      const prod = await Produit.findById(produit).session(session);
      prod.stock -= quantity;
      await prod.save({ session });
    }

    // Étape 4 : Mettre à jour la commande
    existingCommande.fullName = fullName || 'non défini';
    existingCommande.phoneNumber = phoneNumber;
    existingCommande.adresse = adresse;
    existingCommande.statut = statut;
    existingCommande.items = items;
    existingCommande.totalAmount = totalAmount;
    existingCommande.commandeDate = commandeDate;

    await existingCommande.save({ session });

    const paiement = await Paiement.findOne({ commande: commandeId }),
      paiementId = paiement ? paiement._id : null;
    if (paiementId) {
      const paiementRecord = await Paiement.findById(paiementId).session(
        session
      );
      if (paiementRecord) {
        paiementRecord.totalAmount = totalAmount;
        await paiementRecord.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ message: 'Commande mise à jour avec succès' });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

// Trouver toutes les commandes
exports.getAllCommandes = async (req, res) => {
  try {
    /**
     * MODE "STATS" (Rapports - chart mensuel commandes)
     *
     * Appel:
     * - `/commandes/getAllCommandes?stats=month&year=2026`
     *
     * Réponse:
     * - `{ months: [0..11], countCommandes }`
     */
    if (req.query?.stats === 'month') {
      const yearRaw = Number.parseInt(req.query?.year, 10);
      const year = Number.isFinite(yearRaw) ? yearRaw : new Date().getFullYear();
      const start = new Date(year, 0, 1, 0, 0, 0, 0);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);

      const agg = await Commande.aggregate([
        { $match: { commandeDate: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $month: '$commandeDate' }, // 1..12
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            month: { $subtract: ['$_id', 1] }, // 0..11
            count: 1,
          },
        },
      ]);

      const months = Array.from({ length: 12 }, (_, i) => i);
      const countCommandes = new Array(12).fill(0);
      agg.forEach((row) => {
        countCommandes[row.month] = row.count || 0;
      });

      return res.status(200).json({ months, countCommandes });
    }

    /**
     * MODE "STATS RANGE" (Rapports - compteur sur période)
     *
     * Objectif:
     * - Les pages Rapport (jour / période) ont besoin du nombre de commandes,
     *   mais n'ont pas besoin de charger toutes les lignes pour ce compteur.
     *
     * Appel:
     * - `/commandes/getAllCommandes?stats=range&from=YYYY-MM-DD&to=YYYY-MM-DD`
     *
     * Réponse:
     * - `{ countCommandes }`
     *
     * Contrainte:
     * - On ne change pas l'URL existante.
     * - Sans `stats=range`, comportement inchangé.
     */
    if (req.query?.stats === 'range') {
      const from = (req.query?.from ?? '').toString().trim();
      const to = (req.query?.to ?? '').toString().trim();
      if (!from || !to) {
        return res.status(400).json({
          status: 'error',
          message: "stats=range nécessite les paramètres from et to (YYYY-MM-DD).",
        });
      }
      const start = new Date(from);
      const end = new Date(to);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: "Paramètres de date invalides pour stats=range (attendu: YYYY-MM-DD).",
        });
      }
      end.setHours(23, 59, 59, 999);
      const countCommandes = await Commande.countDocuments({
        commandeDate: { $gte: start, $lte: end },
      });
      return res.status(200).json({ countCommandes });
    }

    /**
     * MODE "SUMMARY" (Dashboard)
     *
     * Objectif:
     * - Le dashboard a uniquement besoin des TOTAUX (compteurs)
     * - Éviter de charger en RAM:
     *   - la liste complète des commandes
     *   - la liste complète des paiements/factures
     *   - les `populate()` (items.produit, user, ...)
     *
     * Contrainte demandée:
     * - On ne change PAS l'API existante
     *   => même endpoint: `/commandes/getAllCommandes`
     * - On ajoute un comportement optionnel via query param:
     *   => `/commandes/getAllCommandes?summary=1`
     *
     * Compatibilité:
     * - Si `summary` n'est pas demandé, on conserve l'ancien comportement (liste + factures).
     */
    const summaryParam = req.query?.summary;
    const isSummary =
      summaryParam === '1' || summaryParam === 'true' || summaryParam === true;

    if (isSummary) {
      // NB: Dans votre schéma `CommandeModel`, le champ est `statut` (pas `status`).
      // On compte directement en base (super léger) au lieu de tout récupérer puis filtrer en JS.
      const [totalCommandes, totalEnAttente, totalEnCours, totalLivree] =
        await Promise.all([
          Commande.countDocuments({}),
          Commande.countDocuments({ statut: 'en attente' }),
          Commande.countDocuments({ statut: 'en cours' }),
          Commande.countDocuments({ statut: 'livré' }),
        ]);

      return res.status(200).json({
        counts: {
          totalCommandes,
          totalEnAttente,
          totalEnCours,
          totalLivree,
        },
      });
    }

    /**
     * MODE PAGINÉ (Historique des commandes)
     *
     * Appel:
     * - `/commandes/getAllCommandes?paged=1&page=1&limit=20&q=...&today=1&statut=en%20attente`
     *
     * Réponse:
     * - `{ commandesListe, factures, page, limit, total, totalPages }`
     *
     * IMPORTANT:
     * - On conserve les mêmes clés `commandesListe` et `factures` pour ne pas casser le front.
     * - `factures` dans ce mode est une liste "légère" utilisée uniquement pour savoir
     *   si une commande est facturée (icône check/cross dans le tableau).
     */
    const paged = req.query?.paged === '1' || req.query?.paged === 'true';
    if (paged) {
      const page = clamp(toInt(req.query?.page, 1), 1, 100_000);
      const limit = clamp(toInt(req.query?.limit, 20), 1, 200);
      const qRaw = (req.query?.q ?? '').toString().trim();
      const today = req.query?.today === '1' || req.query?.today === 'true';
      const statut = (req.query?.statut ?? '').toString().trim(); // 'en cours' | 'en attente' | 'livré'
      const exportAll = req.query?.export === '1' || req.query?.export === 'true';

      // Filtre date (Rapports): from/to sur commandeDate (YYYY-MM-DD)
      const from = (req.query?.from ?? '').toString().trim();
      const to = (req.query?.to ?? '').toString().trim();

      const match = {};

      if (statut) {
        match.statut = statut;
      }

      if (today) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        match.createdAt = { $gte: start, $lte: end };
      }

      if (from && to) {
        const start = new Date(from);
        const end = new Date(to);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          match.commandeDate = { $gte: start, $lte: end };
        }
      }

      if (qRaw) {
        const regex = new RegExp(escapeRegex(qRaw), 'i');
        const asNumber = Number(qRaw);
        const dateRange = parseDateRange(qRaw);

        match.$or = [
          { fullName: regex },
          { adresse: regex },
          { statut: regex },
          ...(Number.isFinite(asNumber) ? [{ phoneNumber: asNumber }] : []),
          ...(dateRange
            ? [{ commandeDate: { $gte: dateRange.start, $lte: dateRange.end } }]
            : []),
        ].filter(Boolean);
      }

      const total = await Commande.countDocuments(match);
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

      // Liste commandes (sans populate items.produit) => léger, on a seulement besoin de items.length.
      const query = Commande.find(match)
        .sort({ createdAt: -1 })
        /**
         * IMPORTANT:
         * - On ajoute `totalAmount` (montant de commande) pour permettre aux pages Bilans/Rapports
         *   de calculer correctement le chiffre d'affaire à partir de `commandesListe.totalAmount`,
         *   sans changer le nom de clé `commandesListe`.
         */
        .select(
          'fullName phoneNumber adresse items statut commandeDate createdAt totalAmount'
        )
        .lean();
      if (!exportAll) {
        query.skip((page - 1) * limit).limit(limit);
      }
      const commandesListe = await query;

      // Factures "légères" (uniquement pour marquer les commandes facturées)
      const commandeIds = commandesListe.map((c) => c._id);
      /**
       * IMPORTANT (compat front):
       * - Par défaut, `factures` reste une liste légère utilisée par `CommandeListe`
       *   pour afficher l'icône (facturé / non facturé) via `fact.commande._id`.
       *
       * Optimisation Bilans/Rapports:
       * - Quand `facturesTotals=1`, on renvoie aussi `factures.totalPaye`
       *   (et `factures.totalAmount` si présent) pour calculer:
       *   - revenu = Σ factures.totalPaye
       *   - impayé = Σ commandesListe.totalAmount − Σ factures.totalPaye
       *
       * Contrainte:
       * - On ne change pas l'URL, seulement un query param optionnel.
       */
      const facturesTotals =
        req.query?.facturesTotals === '1' ||
        req.query?.facturesTotals === 'true';

      const paiements = await Paiement.find({ commande: { $in: commandeIds } })
        .select(facturesTotals ? 'commande totalPaye totalAmount' : 'commande')
        .lean();

      // On conserve la forme attendue par le front: fact.commande._id
      const factures = paiements.map((p) =>
        facturesTotals
          ? {
              commande: { _id: p.commande },
              // total payé (revenu) - utilisé par Bilans/Rapports
              totalPaye: Number(p.totalPaye || 0),
              // montant de commande côté paiement (optionnel) - ne remplace pas commandesListe.totalAmount
              totalAmount: Number(p.totalAmount || 0),
            }
          : { commande: { _id: p.commande } }
      );

      return res.status(200).json({
        commandesListe,
        factures,
        page,
        limit,
        total,
        totalPages,
      });
    }

    const commandesListe = await Commande.find()
      // Trie par date de création, du plus récent au plus ancien
      .sort({ createdAt: -1 })
      .populate('items.produit')
      .populate('user');

    // Afficher les COMMANDES en fonction des PAIEMENTS effectués
    const factures = await Paiement.find()
      .populate({
        path: 'commande',
        populate: { path: 'items.produit' },
      })
      .populate('user')
      .sort({ createdAt: -1 });
    return res.status(201).json({ commandesListe, factures });
  } catch (e) {
    return res.status(404).json(e);
  }
};

// Trouver une seulle COMMANDE
exports.getOneCommande = async (req, res) => {
  try {
    const commandeData = await Commande.findById(req.params.id)
      .populate('items.produit')
      .populate('user');

    // ID de PAIEMENT correspondant au COMMANDE
    const paiementCommande = await Paiement.findOne({
      commande: req.params.id,
    })
      .populate({
        path: 'commande',
        populate: { path: 'items.produit' },
      })
      .populate('user');
    return res.status(201).json({ commandeData, paiementCommande });
  } catch (e) {
    return res.status(404).json(e);
  }
};

// -----------------------------------------------

// Decrementer la Quantité commandé sur le stock du produit
exports.decrementMultipleStocks = async (req, res) => {
  const session = await Produit.startSession();
  session.startTransaction();

  try {
    const items = req.body.items; // [{ id, quantity }, ...]

    for (const { produit, quantity } of items) {
      const produits = await Produit.findById(produit).session(session);
      if (!produits) {
        throw new Error(`Produit ${produit} non trouvé`);
      }

      if (produits.stock < quantity) {
        console.log(
          `Stock insuffisant pour ${produits.name}. Disponible : ${produits.stock}`
        );
      }

      produits.stock -= quantity;
      await produits.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: 'Stocks mis à jour avec succès' });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: err.message });
  }
};

// ----------------------------------------------------------------------------

// Annuler une COMMANDE et faire retablir le stock de PRODUIT
exports.deleteCommande = async (req, res) => {
  const session = await Produit.startSession();
  session.startTransaction();

  try {
    const commandeId = req.params.commandeId;
    const { items } = req.body;

    // Etape 1: Retablir le Stock
    for (const { produit, quantity } of items) {
      const produits = await Produit.findById(produit).session(session);
      if (!produits) {
        throw new Error(`Produit ${produit} non trouvé`);
      }
      produits.stock += quantity;
      await produits.save({ session });
    }

    // Etape 2:  supprime le PAIEMENT et son HISTORIQUE lié
    const paiement = await Paiement.find({ commande: commandeId });

    // Si il ya au mois un PAIEMENT
    if (paiement) {
      const paieHistorique = await PaiementHistorique.find({
        commande: commandeId,
      });
      // parcourir dans chaque PaiementHistorique pour supprimer
      for (const paiHis of paieHistorique) {
        await PaiementHistorique.findByIdAndDelete(paiHis);
      }
      // en suite supprimer le Paiement
      await Paiement.findByIdAndDelete(paiement);
    }

    // Etape 3: supprimer LivraisonHistorique si ça existe
    const livHistorique = await LivraisonHistorique.find({
      commande: commandeId,
    });
    if (livHistorique) {
      for (const hist of livHistorique) {
        await LivraisonHistorique.findByIdAndDelete(hist);
      }
    }

    // Etape 4: Supprimer la COMMANDE
    const deletedCommande = await Commande.findByIdAndDelete(commandeId, {
      session,
    });
    if (!deletedCommande) {
      throw new Error('Commande non trouvée');
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ message: 'Annulation réussie, stock rétabli.' });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: err.message });
  }
};

// Produits les plus Commandés
exports.getTopProduits = async (req, res) => {
  try {
    /**
     * TOP PRODUITS - optimisation "pro"
     *
     * Contrainte:
     * - On ne change PAS l'URL existante: `/commandes/topProduitsCommande`
     *
     * Amélioration:
     * - On permet de limiter le nombre de résultats via `?limit=20`
     * - Ça évite de renvoyer une liste trop grande (RAM / réseau)
     */
    const rawLimit = Number.parseInt(req.query?.limit, 10);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 200
        ? rawLimit
        : 20;

    const results = await Commande.aggregate([
      { $unwind: '$items' }, // décompose le tableau items
      {
        $group: {
          _id: '$items.produit',
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      {
        $lookup: {
          from: 'produits',
          localField: '_id',
          foreignField: '_id',
          as: 'produit',
        },
      },
      { $unwind: '$produit' },
      { $sort: { totalQuantity: -1 } }, // tri du plus acheté au moins acheté
      { $limit: limit }, // limiter le nombre de résultats (évite payload énorme)
      {
        $project: {
          _id: 0,
          produitId: '$produit._id',
          name: '$produit.name',
          imageUrl: '$produit.imageUrl',
          price: '$produit.price',
          achatPrice: '$produit.achatPrice',
          totalQuantity: 1,
        },
      },
    ]);
    return res.status(200).json(results);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
};
