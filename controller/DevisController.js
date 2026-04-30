const mongoose = require('mongoose');
const Devis = require('../models/DevisModel');

/**
 * Helpers - pagination / recherche (mode optionnel `paged=1`)
 *
 * Contrainte:
 * - On ne change PAS l'URL `/devis/getAllDevis`
 * - Sans `paged=1`, on conserve le comportement historique (tableau complet + populate)
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

// Créer un Devis
exports.createDevis = async (req, res) => {
  try {
    const { items, ...restOfData } = req.body;

    // Créer le Devis
    const newDevis = await Devis.create({
      items,
      user: req.user.id,
      ...restOfData,
    });

    return res.status(201).json(newDevis);
  } catch (error) {
    console.log('Erreur de validation de Devis :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Trouver toutes les Devis
exports.getAllDevis = async (req, res) => {
  try {
    /**
     * MODE PAGINÉ + RECHERCHE (Historique de Devis)
     *
     * Appel:
     * - `/devis/getAllDevis?paged=1&page=1&limit=10&q=...&boutique=1`
     *
     * Réponse:
     * - `{ items, page, limit, total, totalPages }`
     *
     * IMPORTANT:
     * - On ne change pas l'API "de base": sans `paged=1`, on renvoie toujours un tableau.
     * - Le front affiche une carte "devis" assez lourde (items + produits). La pagination
     *   est donc essentielle pour éviter de saturer la RAM.
     */
    const paged = req.query?.paged === '1' || req.query?.paged === 'true';
    if (paged) {
      const page = clamp(toInt(req.query?.page, 1), 1, 100_000);
      const limit = clamp(toInt(req.query?.limit, 10), 1, 50);
      const qRaw = (req.query?.q ?? '').toString().trim();
      const boutique = req.query?.boutique !== undefined && req.query?.boutique !== ''
        ? Number(req.query.boutique)
        : null;

      const match = {};

      if (qRaw) {
        const regex = new RegExp(escapeRegex(qRaw), 'i');
        const asNumber = Number(qRaw);
        const dateRange = parseDateRange(qRaw);
        match.$or = [
          { fullName: regex },
          { adresse: regex },
          ...(Number.isFinite(asNumber)
            ? [{ phoneNumber: asNumber }, { totalAmount: asNumber }]
            : []),
          ...(dateRange
            ? [{ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }]
            : []),
        ].filter(Boolean);
      }

      // Filtre boutique: on le fait après populate user via `match` sur champ virtuel = impossible en find.
      // Stratégie "pro" et simple:
      // - On récupère la page de devis (par date)
      // - Puis on filtre boutique en mémoire UNIQUEMENT sur cette page (payload limité)
      // Alternative: aggregation + $lookup, mais plus long à maintenir ici.

      const total = await Devis.countDocuments(match);
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

      let items = await Devis.find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'items.produit', select: 'name imageUrl price achatPrice' })
        .populate({ path: 'user', select: 'boutique' })
        .lean();

      if (Number.isFinite(boutique) && boutique !== null) {
        items = items.filter((d) => Number(d?.user?.boutique) === boutique);
      }

      return res.status(200).json({ items, page, limit, total, totalPages });
    }

    const devisListe = await Devis.find()
      // Trie par date de création, du plus récent au plus ancien
      .sort({ createdAt: -1 })
      .populate('items.produit')
      .populate('user');

    return res.status(201).json(devisListe);
  } catch (e) {
    return res.status(404).json(e);
  }
};

// Trouver une seulle Devis
exports.getOneDevis = async (req, res) => {
  try {
    const devisData = await Devis.findById(req.params.id)
      .populate('items.produit')
      .populate('user');

    return res.status(201).json(devisData);
  } catch (e) {
    return res.status(404).json(e);
  }
};

// -----------------------------------------------

// --------------------------------------------------------------------------
// --------- Modifier un Devis ----------------------------------

exports.updateDevis = async (req, res) => {
  try {
    const { items, ...resOfData } = req.body;

    await Devis.findByIdAndUpdate(req.params.id, {
      items,
      ...resOfData,
    });

    return res.status(200).json({ message: 'Devis mise à jour avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

// ----------------------------------------------------------------------------
// Supprimer un Devis
exports.deleteDevis = async (req, res) => {
  try {
    await Devis.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Devis supprimé avec succès' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};
