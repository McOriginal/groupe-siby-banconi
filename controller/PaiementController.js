const Paiement = require('../models/PaiementModel');
const PaiementHistorique = require('../models/PaiementHistoriqueModel');
const Commande = require('../models/CommandeModel');

/**
 * Helpers - pagination / recherche (mode optionnel `paged=1`)
 *
 * Contrainte:
 * - On ne change PAS l'URL existante `/paiements/getAllPaiements`
 * - Sans `paged=1`, comportement historique inchangé
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

// Enregistrer un paiement
exports.createPaiement = async (req, res) => {
  try {
    // On vérifie si le PAIEMENT n'existe pas via ID de Commande
    const commandeID = req.body.commande;
    const existingPaiement = await Paiement.findOne({
      commande: commandeID,
    }).exec();

    // si la COMMANDE existe alors cela veux dire que le PAIEMENT existe déjà
    if (existingPaiement) {
      return res
        .status(404)
        .json({ message: 'Il existe déjà un Paiement pour cette Commande' });
    }

    // sinon on créer un nouveau PAIEMENT
    const paiement = await Paiement.create({ ...req.body, user: req.user.id });

    // Et On Ajout le paiement dans son l'historique
    await PaiementHistorique.create({
      amount: req.body.totalPaye,
      user: req.user.id,
      ...req.body,
    });
    res.status(201).json(paiement);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Mettre à jour un paiement
exports.updatePaiement = async (req, res) => {
  try {
    // On vérifie si le PAIEMENT n'existe pas via ID de Commande
    const commandeID = req.body.commande;
    const existingPaiement = await Paiement.findOne({
      commande: commandeID,
      _id: { $ne: req.params.id },
    }).exec();

    // si la COMMANDE existe alors cela veux dire que le PAIEMENT existe déjà
    if (existingPaiement) {
      return res.status(404).json({ message: 'Cette Commande est déjà payé' });
    }

    const updated = await Paiement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Historique des paiements
exports.getAllPaiements = async (req, res) => {
  try {
    /**
     * MODE "STATS" (Rapports - charts mensuels)
     *
     * Objectif:
     * - Les graphiques mensuels n'ont pas besoin de toutes les lignes.
     * - On renvoie uniquement des agrégats par mois (12 valeurs).
     *
     * Appel:
     * - `/paiements/getAllPaiements?stats=month&year=2026`
     *
     * Réponse:
     * - `{ months: [0..11], sumTotalAmount, sumTotalPaye, sumTotalImpayes }`
     */
    if (req.query?.stats === 'month') {
      const yearRaw = Number.parseInt(req.query?.year, 10);
      const year = Number.isFinite(yearRaw) ? yearRaw : new Date().getFullYear();
      const start = new Date(year, 0, 1, 0, 0, 0, 0);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);

      const agg = await Paiement.aggregate([
        { $match: { paiementDate: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $month: '$paiementDate' }, // 1..12
            sumTotalAmount: { $sum: '$totalAmount' },
            sumTotalPaye: { $sum: '$totalPaye' },
          },
        },
        {
          $project: {
            _id: 0,
            month: { $subtract: ['$_id', 1] }, // 0..11
            sumTotalAmount: 1,
            sumTotalPaye: 1,
            sumTotalImpayes: { $subtract: ['$sumTotalAmount', '$sumTotalPaye'] },
          },
        },
      ]);

      // Normaliser sur 12 mois
      const months = Array.from({ length: 12 }, (_, i) => i);
      const sumTotalAmount = new Array(12).fill(0);
      const sumTotalPaye = new Array(12).fill(0);
      const sumTotalImpayes = new Array(12).fill(0);

      agg.forEach((row) => {
        sumTotalAmount[row.month] = row.sumTotalAmount || 0;
        sumTotalPaye[row.month] = row.sumTotalPaye || 0;
        sumTotalImpayes[row.month] = row.sumTotalImpayes || 0;
      });

      return res.status(200).json({ months, sumTotalAmount, sumTotalPaye, sumTotalImpayes });
    }

    /**
     * MODE PAGINÉ + RECHERCHE (Historique de facture / PaiementsListe)
     *
     * Appel:
     * - `/paiements/getAllPaiements?paged=1&page=1&limit=25&q=...&reliquaOnly=1&today=1`
     *
     * Réponse:
     * - `{ paiements, page, limit, total, totalPages, totals }`
     *
     * NOTE:
     * - On fait la recherche côté serveur en trouvant d'abord les commandes qui matchent `q`,
     *   puis on récupère les paiements liés à ces commandes (pagination).
     */
    const paged = req.query?.paged === '1' || req.query?.paged === 'true';
    if (paged) {
      const page = clamp(toInt(req.query?.page, 1), 1, 100_000);
      const limit = clamp(toInt(req.query?.limit, 25), 1, 200);
      const qRaw = (req.query?.q ?? '').toString().trim();
      const reliquaOnly =
        req.query?.reliquaOnly === '1' || req.query?.reliquaOnly === 'true';
      const today = req.query?.today === '1' || req.query?.today === 'true';
      const exportAll =
        req.query?.export === '1' || req.query?.export === 'true';
      const deep =
        req.query?.deep === '1' || req.query?.deep === 'true';

      // Filtre date (Bilans / Rapports): from/to (YYYY-MM-DD)
      const from = (req.query?.from ?? '').toString().trim();
      const to = (req.query?.to ?? '').toString().trim();
      if (from && to) {
        const start = new Date(from);
        const end = new Date(to);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          paiementMatch.paiementDate = { $gte: start, $lte: end };
        }
      }

      // 1) Filtrer les paiements (reliquat / today)
      const paiementMatch = {};
      if (reliquaOnly) {
        // totalAmount - totalPaye > 0
        paiementMatch.$expr = {
          $gt: [{ $subtract: ['$totalAmount', '$totalPaye'] }, 0],
        };
      }
      if (today) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        paiementMatch.paiementDate = { $gte: start, $lte: end };
      }

      // 2) Recherche sur la COMMANDE (client/tél/adresse/date)
      let commandeIds = null; // null => pas de filtre commande
      if (qRaw) {
        const regex = new RegExp(escapeRegex(qRaw), 'i');
        const asNumber = Number(qRaw);
        const dateRange = parseDateRange(qRaw);

        const commandeMatch = {
          $or: [
            { fullName: regex },
            { adresse: regex },
            ...(Number.isFinite(asNumber) ? [{ phoneNumber: asNumber }] : []),
            ...(dateRange
              ? [{ commandeDate: { $gte: dateRange.start, $lte: dateRange.end } }]
              : []),
          ].filter(Boolean),
        };

        const commandes = await Commande.find(commandeMatch)
          .select('_id')
          .lean();
        commandeIds = commandes.map((c) => c._id);
        paiementMatch.commande = { $in: commandeIds };
      }

      const total = await Paiement.countDocuments(paiementMatch);
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

      // 3) Page de paiements (projection + populate léger)
      const query = Paiement.find(paiementMatch).sort({ createdAt: -1 });
      // export=1 => on renvoie tout le dataset filtré (utile pour Bilans/Rapports, filtre date obligatoire côté front)
      if (!exportAll) {
        query.skip((page - 1) * limit).limit(limit);
      }

      // deep=1 => on populate items.produit pour calculer les achats côté front (Bilans/Rapports)
      const commandePopulate = deep
        ? { path: 'commande', populate: { path: 'items.produit' } }
        : { path: 'commande', select: 'fullName phoneNumber adresse commandeDate items' };

      const paiements = await query
        .populate(commandePopulate)
        .select('totalAmount totalPaye reduction paiementDate methode commande user createdAt')
        .lean();

      /**
       * Totaux (sur l'ensemble filtré, pas seulement la page):
       * - sumTotalAmount
       * - sumTotalPaye
       * - sumReliquat
       */
      const totalsAgg = await Paiement.aggregate([
        { $match: paiementMatch },
        {
          $group: {
            _id: null,
            sumTotalAmount: { $sum: '$totalAmount' },
            sumTotalPaye: { $sum: '$totalPaye' },
          },
        },
        {
          $project: {
            _id: 0,
            sumTotalAmount: 1,
            sumTotalPaye: 1,
            sumReliquat: { $subtract: ['$sumTotalAmount', '$sumTotalPaye'] },
          },
        },
      ]);

      const totals = totalsAgg?.[0] || {
        sumTotalAmount: 0,
        sumTotalPaye: 0,
        sumReliquat: 0,
      };

      return res.status(200).json({
        paiements,
        page,
        limit,
        total,
        totalPages,
        totals,
      });
    }

    const paiements = await Paiement.find()
      .populate({ path: 'commande', populate: { path: 'items.produit' } })
      .populate('user')
      .sort({ createdAt: -1 });

    // Calcul du chiffre d'affaires et du coût d'achat
    let totalCA = 0; // chiffre d'affaires
    let totalAchat = 0; // coût d'achat

    paiements.forEach((paiement) => {
      paiement.commande?.items.forEach((item) => {
        const produit = item.produit;

        const ca = item.customerPrice * item.quantity; // revenu
        const achat = produit.achatPrice * item.quantity; // coût d'achat

        totalCA += ca;
        totalAchat += achat;
      });
    });

    const benefice = totalCA - totalAchat;

    return res.status(200).json({ paiements, totalCA, totalAchat, benefice });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Trouver un PAIEMENT
exports.getPaiement = async (req, res) => {
  try {
    const paiements = await Paiement.findById(req.params.id)
      .populate('user')
      .populate({
        path: 'commande',
        populate: { path: 'items.produit' },
      });

    return res.status(200).json(paiements);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Trouver le PAIEMENT via la COMMANDE sélectionnée
exports.getPaiementBySelectedCommandeID = async (req, res) => {
  try {
    // Récupération de PAIEMENT via ID de COMMANDE sélectionnée
    const selectedCommandePaiement = await Paiement.findOne({
      commande: req.params.id,
    }).populate({
      path: 'commande',
      populate: { path: 'items.produit' },
    });

    return res.status(200).json(selectedCommandePaiement);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un paiement
exports.deletePaiement = async (req, res) => {
  try {
    // Trouver le PAIEMENT à supprimer via son ID
    const deletedPaiement = await Paiement.findById(req.params.id);

    // On Trouve la liste des HISTORIQUE de PAIEMENT dont ID de COMMANDE correspond à celle qu'on veux supprimer
    await PaiementHistorique.deleteMany({
      commande: deletedPaiement.commande,
    });

    // On supprimer HISTORIQUE de PAIEMENT
    // const hisdelete = await PaiementHistorique.findByIdAndDelete(
    //   deletedHistoriquePaiement
    // );
    // console.log('------ Historique supprimés---------\n ', hisdelete);

    // après on supprime le PAIEMENT
    await Paiement.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ status: 'success', message: 'Paiement supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
