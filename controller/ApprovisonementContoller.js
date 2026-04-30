const mongoose = require('mongoose');
const Approvisonement = require('../models/ApprovisonementModel');
const Produit = require('../models/ProduitModel');

/**
 * Helpers - Pagination & recherche (mode optionnel `paged=1`)
 *
 * Contrainte:
 * - On ne change PAS l'API existante.
 * - Sans `paged=1`, ce contrôleur renvoie exactement comme avant (tableau complet + populate).
 *
 * Objectif:
 * - Pour la page Approvisionnement:
 *   - pagination serveur (éviter de charger toutes les lignes en RAM)
 *   - recherche serveur (pour que la recherche couvre toutes les données, pas seulement une page)
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
  /**
   * Support simple pour la recherche par date, afin que la recherche "affiche correctement"
   * même quand l'utilisateur saisit une date dans la barre.
   *
   * Formats acceptés:
   * - dd/mm/yyyy (ex: 30/04/2026)
   * - yyyy-mm-dd (ex: 2026-04-30)
   *
   * Retour:
   * - { start: Date, end: Date } ou null si non reconnu
   */
  const s = String(qRaw || '').trim();
  if (!s) return null;

  // dd/mm/yyyy
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
  } else {
    return null;
  }

  // Date en UTC locale "milieu de nuit" pour encadrer la journée
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

// Create a new approvisonement
exports.createApprovisonement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { produit, quantity, price, ...restOfData } = req.body;
    const formatQuantity = Number(quantity);
    const formatPrice = Number(price);

    // Vérification si le produit est fourni
    if (!produit) {
      throw new Error('Produit non trouvé');
    }

    // 1. Mise à jour du stock produit
    const updatedProduct = await Produit.findByIdAndUpdate(
      produit,
      { $inc: { stock: formatQuantity }, achatPrice: price },
      { new: true, session }
    );

    if (!updatedProduct) {
      throw new Error('Produit introuvable en base');
    }

    // 2. Création de l’approvisionnement
    const approvisonement = await Approvisonement.create(
      [
        {
          produit,
          quantity: formatQuantity,
          price: formatPrice,
          user: req.user.id,
          ...restOfData,
        },
      ],
      { session }
    );

    // 3. Création de la dépense
    // await Depense.create(
    //   [
    //     {
    //       user: req.user.id,
    //       totalAmount: formatPrice * formatQuantity,
    //       motifDepense: `Approvisionnement de ${formatQuantity} unité(s) du produit ${updatedProduct.name}`,
    //       dateOfDepense: approvisonement[0].deliveryDate,
    //     },
    //   ],
    //   { session }
    // );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(approvisonement[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all approvisonements
exports.getAllApprovisonements = async (req, res) => {
  try {
    /**
     * MODE PAGINÉ + RECHERCHE (ApprovisionnementListe)
     *
     * Appel:
     * - `/approvisonnements/getAllApprovisonements?paged=1&page=1&limit=20&q=...`
     *
     * Réponse:
     * - `{ items, page, limit, total, totalPages }`
     *
     * Pourquoi aggregation:
     * - la recherche doit matcher des champs "populés" (produit.name, fournisseur.firstName...)
     * - avec un simple `.find().populate()` on ne peut pas filtrer efficacement sur ces champs
     *   sans charger plein de documents en mémoire.
     */
    const paged = req.query?.paged === '1' || req.query?.paged === 'true';
    if (paged) {
      const page = clamp(toInt(req.query?.page, 1), 1, 10_000);
      const limit = clamp(toInt(req.query?.limit, 20), 1, 200);
      const qRaw = (req.query?.q ?? '').toString().trim();

      const match = {};

      const dateRange = parseDateRange(qRaw);
      const asNumber = qRaw ? Number(qRaw) : NaN;
      const regex = qRaw ? new RegExp(escapeRegex(qRaw), 'i') : null;

      // Pipeline:
      // - lookups (produit + fournisseur + user si besoin)
      // - match (recherche)
      // - sort
      // - facet (items + totalCount)
      const pipeline = [
        // Join Produit
        {
          $lookup: {
            from: 'produits',
            localField: 'produit',
            foreignField: '_id',
            as: 'produit',
          },
        },
        { $unwind: { path: '$produit', preserveNullAndEmptyArrays: true } },
        // Join Fournisseur
        {
          $lookup: {
            from: 'fournisseurs',
            localField: 'fournisseur',
            foreignField: '_id',
            as: 'fournisseur',
          },
        },
        { $unwind: { path: '$fournisseur', preserveNullAndEmptyArrays: true } },
      ];

      if (qRaw) {
        // Match "texte" + "nombre" + "date"
        match.$or = [
          // Produit
          { 'produit.name': regex },
          // Fournisseur
          { 'fournisseur.firstName': regex },
          { 'fournisseur.lastName': regex },
          { 'fournisseur.adresse': regex },
          // Téléphone (num -> string): on match en regex sur string via $toString
          // => on utilise $expr pour éviter de charger toutes les lignes en JS
          {
            $expr: {
              $regexMatch: {
                input: { $toString: { $ifNull: ['$fournisseur.phoneNumber', ''] } },
                regex: escapeRegex(qRaw),
                options: 'i',
              },
            },
          },
          // Quantité / prix (si la recherche est numérique)
          ...(Number.isFinite(asNumber) ? [{ quantity: asNumber }, { price: asNumber }] : []),
          // Date (si reconnu)
          ...(dateRange
            ? [{ deliveryDate: { $gte: dateRange.start, $lte: dateRange.end } }]
            : []),
        ].filter(Boolean);

        pipeline.push({ $match: match });
      }

      pipeline.push({ $sort: { createdAt: -1 } });
      pipeline.push({
        $facet: {
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            // Projection: garder uniquement les champs utilisés par votre UI (table Approvisionnement)
            {
              $project: {
                deliveryDate: 1,
                quantity: 1,
                price: 1,
                produit: {
                  _id: '$produit._id',
                  name: '$produit.name',
                },
                fournisseur: {
                  _id: '$fournisseur._id',
                  firstName: '$fournisseur.firstName',
                  lastName: '$fournisseur.lastName',
                  phoneNumber: '$fournisseur.phoneNumber',
                  adresse: '$fournisseur.adresse',
                },
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      });

      const [result] = await Approvisonement.aggregate(pipeline);
      const items = result?.items ?? [];
      const total = result?.totalCount?.[0]?.count ?? 0;
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

      return res.status(200).json({ items, page, limit, total, totalPages });
    }

    const approvisonements = await Approvisonement.find()
      // Trie par date de création, du plus récent au plus ancien
      .sort({ createdAt: -1 })
      .populate('produit')
      .populate('user')
      .populate('fournisseur');
    return res.status(200).json(approvisonements);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single approvisonement by ID
exports.getApprovisonementById = async (req, res) => {
  try {
    const approvisonement = await Approvisonement.findById(req.params.id)
      .populate('Produit')
      .populate('user')
      .populate('fournisseur');

    if (!approvisonement) {
      return res.status(404).json({ message: 'Approvisonement not found' });
    }

    return res.status(200).json(approvisonement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an approvisonement by ID
exports.cancelApprovisonement = async (req, res) => {
  try {
    const approvisonement = await Approvisonement.findByIdAndDelete(
      req.params.id
    );

    if (!approvisonement) {
      return res.status(404).json({ message: 'Approvisonement not found' });
    }

    // On décrémente le stock du PRODUIT associé
    await Produit.findByIdAndUpdate(
      approvisonement.produit,
      { $inc: { stock: -approvisonement.quantity } },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: 'Approvisonement deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une APPROVISONNEMENT
exports.deleteApprovisonement = async (req, res) => {
  try {
    const approvisonement = await Approvisonement.findByIdAndDelete(
      req.params.id
    );

    if (!approvisonement) {
      return res.status(404).json({ message: 'Approvisonement not found' });
    }

    return res
      .status(200)
      .json({ message: 'Approvisonement deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
