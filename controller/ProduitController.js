const Produit = require('../models/ProduitModel');
const Commande = require('../models/CommandeModel');

/**
 * Helpers - Pagination & recherche (utilisés uniquement quand `paged=1`)
 *
 * IMPORTANT (contrainte du projet):
 * - On NE change PAS vos routes (URLs) existantes.
 * - On garde le comportement historique (retourne un tableau) si `paged` n'est pas activé.
 * - On ajoute un mode optionnel plus "pro" (pagination + recherche + totaux) quand:
 *   - `?paged=1` est présent dans la query string.
 *
 * Pourquoi:
 * - Éviter de charger toute la collection en RAM (backend + navigateur).
 * - Permettre une recherche correcte sur "toutes les données" (server-side),
 *   au lieu de filtrer uniquement ce qui est déjà chargé dans le navigateur.
 */
function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function escapeRegex(input) {
  // Sécurise la recherche texte pour éviter les regex "dangereuses" ou malformées
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Enregistrer un Produit
exports.createProduit = async (req, res) => {
  try {
    const { name, price, achatPrice, stock, ...resOfData } = req.body;

    const lowerName = name.toLowerCase();
    const formatStock = Number(stock);
    const formatPrice = Number(price);
    const formatAchatPrice = Number(achatPrice);

    // Vérifier s'il existe déjà une matière avec ces critères
    const existingProduits = await Produit.findOne({
      name: lowerName,
    }).exec();

    if (existingProduits) {
      return res.status(400).json({
        status: 'error',
        message: 'Ce Produit existe déjà.',
      });
    }

    // Création de la matière
    const produit = await Produit.create({
      name: lowerName,
      stock: formatStock,
      price: formatPrice,
      achatPrice: formatAchatPrice,
      user: req.user.id,
      ...resOfData,
    });

    return res.status(201).json(produit);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// Mettre à jour une Produit
exports.updateProduit = async (req, res) => {
  try {
    const { name, price, achatPrice, stock, ...resOfData } = req.body;

    const lowerName = name.toLowerCase();
    const formatPrice = Number(price);
    const formatStock = Number(stock);
    const formatAchatPrice = Number(achatPrice);

    // Vérifier s'il existe déjà un produit avec ces critères
    const existingProduits = await Produit.findOne({
      name: lowerName,
      _id: { $ne: req.params.id },
    }).exec();

    if (existingProduits) {
      return res.status(400).json({
        status: 'error',
        message: 'Ce Produit existe déjà.',
      });
    }

    // Mise à jour de produit
    const updated = await Produit.findByIdAndUpdate(
      req.params.id,
      {
        name: lowerName,
        stock: formatStock,
        price: formatPrice,
        achatPrice: formatAchatPrice,
        ...resOfData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

//  Afficher les Produit avec une stock minimum de (1)
exports.getAllProduits = async (req, res) => {
  try {
    /**
     * MODE PAGINÉ (Front: pages Produit + recherche)
     *
     * Appel:
     * - `/produits/getAllProduits?paged=1&page=1&limit=24&q=vis`
     *
     * Réponse:
     * - `{ items, page, limit, total, totalPages, totals }`
     *
     * Remarque:
     * - On n'enlève pas le mode historique: sans `paged=1`, on renvoie le tableau complet
     *   (comme avant), pour ne pas casser d'autres écrans.
     */
    const paged = req.query?.paged === '1' || req.query?.paged === 'true';
    if (paged) {
      const page = clamp(toInt(req.query?.page, 1), 1, 10_000);
      const limit = clamp(toInt(req.query?.limit, 24), 1, 200);
      const qRaw = (req.query?.q ?? '').toString().trim();
      const stockGt = req.query?.stockGt !== undefined ? Number(req.query.stockGt) : undefined;

      const match = {};

      // Option: filtrer uniquement les produits "en stock" (utile pour votre page ProduitListe)
      if (Number.isFinite(stockGt)) {
        match.stock = { $gt: stockGt };
      }

      // Recherche "pro" côté serveur:
      // - texte: `name` contient q (insensible à la casse)
      // - nombre: `stock == q` ou `price == q` ou `achatPrice == q`
      if (qRaw) {
        const q = escapeRegex(qRaw);
        const regex = new RegExp(q, 'i');
        const asNumber = Number(qRaw);

        match.$or = [
          { name: regex },
          ...(Number.isFinite(asNumber)
            ? [{ stock: asNumber }, { price: asNumber }, { achatPrice: asNumber }]
            : []),
        ];
      }

      // Pipeline d'aggregation pour:
      // - pagination (skip/limit)
      // - totalCount (pour afficher le nombre total)
      // - totals.sumTotalAchatPrice (valeur de boutique sur l'ensemble des résultats filtrés)
      const pipeline = [
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            items: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              // Projection: on renvoie uniquement ce que vos écrans utilisent
              {
                $project: {
                  name: 1,
                  price: 1,
                  achatPrice: 1,
                  stock: 1,
                  imageUrl: 1,
                  user: 1,
                  createdAt: 1,
                },
              },
            ],
            totalCount: [{ $count: 'count' }],
            totals: [
              {
                $group: {
                  _id: null,
                  sumTotalAchatPrice: {
                    $sum: { $multiply: ['$achatPrice', '$stock'] },
                  },
                },
              },
            ],
          },
        },
      ];

      const [result] = await Produit.aggregate(pipeline);
      const items = result?.items ?? [];
      const total = result?.totalCount?.[0]?.count ?? 0;
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
      const sumTotalAchatPrice = result?.totals?.[0]?.sumTotalAchatPrice ?? 0;

      return res.status(200).json({
        items,
        page,
        limit,
        total,
        totalPages,
        totals: {
          sumTotalAchatPrice,
        },
      });
    }

    const produits = await Produit.find()
      .populate('user')
      .sort({ createdAt: -1 });

    return res.status(200).json(produits);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

//  Afficher une seule Produit avec une stock terminée (0)
exports.getAllProduitWithStockFinish = async (req, res) => {
  try {
    /**
     * MODE PAGINÉ + RECHERCHE (Produits stock faible)
     *
     * Appel:
     * - `/produits/getAllProduitWithStockFinish?paged=1&page=1&limit=24&q=...&stockLt=10`
     *
     * Compat:
     * - Sans `paged=1`, on conserve l'ancien comportement: tableau complet.
     */
    const paged = req.query?.paged === '1' || req.query?.paged === 'true';
    if (paged) {
      const page = clamp(toInt(req.query?.page, 1), 1, 10_000);
      const limit = clamp(toInt(req.query?.limit, 24), 1, 200);
      const qRaw = (req.query?.q ?? '').toString().trim();
      const stockLt = req.query?.stockLt !== undefined ? Number(req.query.stockLt) : 10;

      const match = { stock: { $lt: Number.isFinite(stockLt) ? stockLt : 10 } };

      if (qRaw) {
        const q = escapeRegex(qRaw);
        const regex = new RegExp(q, 'i');
        const asNumber = Number(qRaw);

        match.$or = [
          { name: regex },
          ...(Number.isFinite(asNumber)
            ? [{ stock: asNumber }, { price: asNumber }, { achatPrice: asNumber }]
            : []),
        ];
      }

      const pipeline = [
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            items: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              {
                $project: {
                  name: 1,
                  price: 1,
                  achatPrice: 1,
                  stock: 1,
                  imageUrl: 1,
                  user: 1,
                  createdAt: 1,
                },
              },
            ],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const [result] = await Produit.aggregate(pipeline);
      const items = result?.items ?? [];
      const total = result?.totalCount?.[0]?.count ?? 0;
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

      return res.status(200).json({ items, page, limit, total, totalPages });
    }

    // Tous les produits dont le stock mximum est 3
    const produits = await Produit.find({ stock: { $lt: 10 } })
      .populate('user')
      .sort({ createdAt: -1 });
    // Trie par date de création, du plus récent au plus ancien

    return res.status(200).json(produits);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

//  Afficher une seule Produit
exports.getOneProduit = async (req, res) => {
  try {
    const produits = await Produit.findById(req.params.id).populate('user');
    return res.status(200).json(produits);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

//  Afficher Produit lors de l'approvisionnemnet
exports.getOneProduitWhenApprovisionne = async (req, res) => {
  try {
    const produits = await Produit.findById(req.params.id).populate('user');
    return res.status(200).json(produits);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un Produit
exports.deleteProduitById = async (req, res) => {
  try {
    await Produit.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ status: 'success', message: 'Produit supprimée avec succès' });
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer toute les Produit
exports.deleteAllProduit = async (req, res) => {
  try {
    await Produit.deleteMany({}); // Supprime tous les documents

    return res.status(200).json({
      status: 'success',
      message: 'Toute les Produit ont été supprimés avec succès',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de toute les Produit',
      error: e.message,
    });
  }
};
