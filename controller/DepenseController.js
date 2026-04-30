const Depense = require('../models/DepenseModel');
const textValidation = require('./regexValidation');

/**
 * Helpers - pagination / recherche (mode optionnel `paged=1`)
 *
 * Contrainte:
 * - On ne change PAS l'URL `/depenses/getAllDepense`
 * - Sans `paged=1`, comportement historique inchangé (tableau complet + populate)
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

// Create a new expense
exports.createDepense = async (req, res) => {
  try {
    const { totalAmount, motifDepense, dateOfDepense } = req.body;

    const formattedTotalAmount = Number(totalAmount);
    const formattedMotifDepense = motifDepense.toLowerCase();
    if (!formattedTotalAmount || !motifDepense) {
      return res
        .status(400)
        .json({ message: 'Le vous devez renseigner le TOTAL et le MOTIF' });
    }

    if (!textValidation.stringValidator(motifDepense)) {
      return res.status(400).json({ message: "Motif saisie n'es pas valide." });
    }

    const depense = await Depense.create({
      totalAmount: formattedTotalAmount,
      motifDepense: formattedMotifDepense,
      dateOfDepense: dateOfDepense,
      user: req.user.id,
    });

    return res.status(201).json(depense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update an expense
exports.updateDepense = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, motifDepense, dateOfDepense } = req.body;
    // Format and validate the input
    const formattedTotalAmount = Number(totalAmount);
    const formattedMotifDepense = motifDepense.toLowerCase();

    // Check if the required fields are provided
    if (!formattedTotalAmount || !motifDepense) {
      return res
        .status(400)
        .json({ message: 'Le vous devez renseigner le TOTAL et le MOTIF' });
    }

    // Validate the motifDepense using regex
    if (!textValidation.stringValidator(motifDepense)) {
      return res.status(400).json({ message: "Motif saisie n'es pas valide." });
    }

    // Find the expense by ID and update it
    const depense = await Depense.findByIdAndUpdate(
      id,
      {
        totalAmount: formattedTotalAmount,
        motifDepense: formattedMotifDepense,
        dateOfDepense,
      },
      { new: true }
    );

    if (!depense) {
      return res.status(404).json({ message: 'Dépense non trouvée.' });
    }

    return res.status(200).json(depense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all expenses
exports.getAllDepenses = async (req, res) => {
  try {
    /**
     * MODE PAGINÉ + RECHERCHE (Dépenses)
     *
     * Appel:
     * - `/depenses/getAllDepense?paged=1&page=1&limit=25&q=...&today=1`
     *
     * Réponse:
     * - `{ items, page, limit, total, totalPages, totals }`
     *
     * IMPORTANT:
     * - Sans `paged=1`, on renvoie le tableau complet (compat).
     * - Les totaux doivent être calculés côté serveur (sur l'ensemble filtré),
     *   pas seulement sur la page.
     */
    const paged = req.query?.paged === '1' || req.query?.paged === 'true';
    if (paged) {
      const page = clamp(toInt(req.query?.page, 1), 1, 100_000);
      const limit = clamp(toInt(req.query?.limit, 25), 1, 200);
      const qRaw = (req.query?.q ?? '').toString().trim();
      const today = req.query?.today === '1' || req.query?.today === 'true';

      const match = {};

      if (today) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        match.dateOfDepense = { $gte: start, $lte: end };
      }

      if (qRaw) {
        const regex = new RegExp(escapeRegex(qRaw), 'i');
        const asNumber = Number(qRaw);
        const dateRange = parseDateRange(qRaw);
        match.$or = [
          { motifDepense: regex },
          ...(Number.isFinite(asNumber) ? [{ totalAmount: asNumber }] : []),
          ...(dateRange
            ? [{ dateOfDepense: { $gte: dateRange.start, $lte: dateRange.end } }]
            : []),
        ].filter(Boolean);
      }

      const total = await Depense.countDocuments(match);
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

      const items = await Depense.find(match)
        .populate({ path: 'user', select: 'boutique' })
        .sort({ dateOfDepense: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('motifDepense totalAmount dateOfDepense user createdAt')
        .lean();

      const totalsAgg = await Depense.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            sumTotalExpense: { $sum: '$totalAmount' },
          },
        },
        { $project: { _id: 0, sumTotalExpense: 1 } },
      ]);
      const totals = totalsAgg?.[0] || { sumTotalExpense: 0 };

      return res.status(200).json({ items, page, limit, total, totalPages, totals });
    }

    const depenses = await Depense.find()
      .populate('user')
      .sort({ dateOfDepense: -1 });
    return res.status(200).json(depenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get a single expense by ID
exports.getDepenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const depense = await Depense.findById(id).populate('user');

    if (!depense) {
      return res.status(404).json({ message: 'Dépense non trouvée.' });
    }

    return res.status(200).json(depense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete an expense
exports.deleteDepense = async (req, res) => {
  try {
    const { id } = req.params;
    const depense = await Depense.findByIdAndDelete(id);

    if (!depense) {
      return res.status(404).json({ message: 'Dépense non trouvée.' });
    }

    return res.status(200).json({ message: 'Dépense supprimée avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
