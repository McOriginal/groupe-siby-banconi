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
     * MODE "STATS BILANS" (Bilans page - totaux fiables sans charger toutes les lignes)
     *
     * Objectif:
     * - La page Bilans affiche un tableau (détails) + des totaux (CA, payé, reliquat, achats, bénéfice...).
     * - Charger toutes les lignes + `deep=1` (populate produit complet) peut saturer RAM/CPU sur VPS.
     *
     * Solution:
     * - Un mode optionnel `stats=bilans` renvoie UNIQUEMENT des agrégats:
     *   - countPaiements
     *   - sumTotalAmount
     *   - sumTotalPaye
     *   - sumReliquat
     *   - totalAchat  (sum(items.quantity * produit.achatPrice))
     *
     * Contrainte:
     * - On ne change pas l'URL `/paiements/getAllPaiements`
     * - Les autres modes (paged/list/month) restent compatibles
     *
     * Appel:
     * - `/paiements/getAllPaiements?stats=bilans&from=YYYY-MM-DD&to=YYYY-MM-DD`
     * - Optionnel: `basis=commande` pour filtrer sur **commandeDate** (comme le tableau Bilans),
     *   défaut `basis=paiement` => filtre sur **paiementDate** (comportement historique).
     *
     * Corrections (bugs corrigés):
     * - Avant: après `$unwind` des lignes `items`, on sommait `totalAmount` / `totalPaye` à chaque ligne
     *   => montants multipliés par le nombre d'articles (CA / payé incohérents).
     * - Maintenant: `$facet` => une branche agrège **un paiement = une ligne** pour les montants,
     *   une autre branche calcule `totalAchat` sur les lignes articles.
     *
     * Note:
     * - Si from/to absents, on limite par défaut aux 7 derniers jours (évite full scan historique).
     */
    if (req.query?.stats === 'bilans') {
      const from = (req.query?.from ?? '').toString().trim();
      const to = (req.query?.to ?? '').toString().trim();
      const basisRaw = (req.query?.basis ?? 'paiement').toString().trim().toLowerCase();
      const useCommandeDate =
        basisRaw === 'commande' ||
        basisRaw === 'commandedate' ||
        basisRaw === 'commande_date';

      let start;
      let end;
      if (from && to) {
        start = new Date(from);
        end = new Date(to);
        if (!Number.isNaN(end.getTime())) end.setHours(23, 59, 59, 999);
      } else {
        // fallback: 7 derniers jours
        end = new Date();
        end.setHours(23, 59, 59, 999);
        start = new Date();
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
      }

      if (Number.isNaN(start?.getTime?.()) || Number.isNaN(end?.getTime?.())) {
        return res.status(400).json({
          status: 'error',
          message: "Paramètres de date invalides pour stats=bilans (attendu: from/to en YYYY-MM-DD).",
        });
      }

      const pipeline = [
        {
          $lookup: {
            from: 'commandes',
            localField: 'commande',
            foreignField: '_id',
            as: '_cmdBilans',
          },
        },
        { $unwind: { path: '$_cmdBilans', preserveNullAndEmptyArrays: false } },
        ...(useCommandeDate
          ? [{ $match: { '_cmdBilans.commandeDate': { $gte: start, $lte: end } } }]
          : [{ $match: { paiementDate: { $gte: start, $lte: end } } }]),
        {
          $facet: {
            paiementTotals: [
              {
                $group: {
                  _id: null,
                  sumTotalAmount: { $sum: '$totalAmount' },
                  sumTotalPaye: { $sum: '$totalPaye' },
                  countPaiements: { $sum: 1 },
                },
              },
            ],
            achatRows: [
              { $unwind: { path: '$_cmdBilans.items', preserveNullAndEmptyArrays: false } },
              {
                $lookup: {
                  from: 'produits',
                  localField: '_cmdBilans.items.produit',
                  foreignField: '_id',
                  as: '_prBilans',
                },
              },
              { $unwind: { path: '$_prBilans', preserveNullAndEmptyArrays: true } },
              {
                $group: {
                  _id: null,
                  totalAchat: {
                    $sum: {
                      $multiply: [
                        { $ifNull: ['$_cmdBilans.items.quantity', 0] },
                        { $ifNull: ['$_prBilans.achatPrice', 0] },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
        {
          $addFields: {
            _pt: { $arrayElemAt: ['$paiementTotals', 0] },
            _ar: { $arrayElemAt: ['$achatRows', 0] },
          },
        },
        /**
         * Réponse `stats=bilans` — sémantique alignée Bilans / Rapports (sans changer les noms de champs) :
         * - `sumTotalAmount` : total « à payer / chiffre d’affaires commande » = Σ montants commande (TTC dû), **incluant** l’impayé dans chaque commande.
         * - `sumTotalPaye`   : total **encaissé** (revenu / total payé) = Σ `totalPaye`.
         * - `sumReliquat`    : total **impayé / réliquat** = Σ (montant commande − montant payé) sur les paiements agrégés (une ligne paiement = une contribution).
         */
        {
          $project: {
            _id: 0,
            // Nombre de documents paiement dans la période (après filtre date commande ou paiement).
            countPaiements: { $ifNull: ['$_pt.countPaiements', 0] },
            // Somme des montants de commande liés aux paiements (total à payer / CA avec impayé inclus).
            sumTotalAmount: { $ifNull: ['$_pt.sumTotalAmount', 0] },
            // Somme des montants réellement payés (encaissements).
            sumTotalPaye: { $ifNull: ['$_pt.sumTotalPaye', 0] },
            // Coût d’achat estimé (quantités × prix d’achat produit).
            totalAchat: { $ifNull: ['$_ar.totalAchat', 0] },
            // Reste dû global (impayés / réliquat agrégé).
            sumReliquat: {
              $subtract: [
                { $ifNull: ['$_pt.sumTotalAmount', 0] },
                { $ifNull: ['$_pt.sumTotalPaye', 0] },
              ],
            },
          },
        },
      ];

      const agg = await Paiement.aggregate(pipeline);
      const row = agg?.[0] || {
        countPaiements: 0,
        sumTotalAmount: 0,
        sumTotalPaye: 0,
        sumReliquat: 0,
        totalAchat: 0,
      };

      /**
       * Forcer des **nombres JavaScript** dans la réponse JSON (impayé / réliquat).
       * Sinon le driver peut laisser des types BSON (Long, Decimal128) que le front ne lit pas
       * comme `number` et les montants impayés semblent « vides » ou incorrects.
       */
      return res.status(200).json({
        countPaiements: Number(row.countPaiements ?? 0),
        sumTotalAmount: Number(row.sumTotalAmount ?? 0),
        sumTotalPaye: Number(row.sumTotalPaye ?? 0),
        sumReliquat: Number(row.sumReliquat ?? 0),
        totalAchat: Number(row.totalAchat ?? 0),
      });
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

      // 1) Filtrer les paiements (reliquat / today / from-to)
      const paiementMatch = {};

      // Filtre date (Bilans / Rapports): from/to (YYYY-MM-DD)
      const from = (req.query?.from ?? '').toString().trim();
      const to = (req.query?.to ?? '').toString().trim();
      const basisPagedRaw = (req.query?.basis ?? 'paiement').toString().trim().toLowerCase();
      const useCommandeDateForPaged =
        basisPagedRaw === 'commande' ||
        basisPagedRaw === 'commandedate' ||
        basisPagedRaw === 'commande_date';

      if (from && to) {
        const start = new Date(from);
        const end = new Date(to);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          /**
           * IMPORTANT (cohérence Bilans / Rapports):
           * - Le tableau Bilans filtre les lignes sur **commandeDate** (date de commande affichée).
           * - Sans `basis=commande`, le filtre `from/to` s'appliquait sur **paiementDate** => lignes
           *   et totaux `stats=bilans` ne correspondaient pas.
           * - `basis=commande` : on restreint aux paiements dont la commande est dans la plage
           *   `commandeDate` (même logique que l'UI).
           * - Défaut `basis=paiement` : inchangé pour tout appel existant qui ne passe pas `basis`.
           */
          if (useCommandeDateForPaged) {
            const cmds = await Commande.find({
              commandeDate: { $gte: start, $lte: end },
            })
              .select('_id')
              .lean();
            const ids = cmds.map((c) => c._id);
            paiementMatch.commande = { $in: ids };
          } else {
            paiementMatch.paiementDate = { $gte: start, $lte: end };
          }
        }
      }

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
        /**
         * Si `from/to` + `basis=commande` a déjà posé `paiementMatch.commande`,
         * on intersecte avec les IDs issus de la recherche `q` (sinon on écrase le filtre date).
         */
        if (paiementMatch.commande?.$in && Array.isArray(paiementMatch.commande.$in)) {
          const allowed = new Set(paiementMatch.commande.$in.map((id) => String(id)));
          commandeIds = commandeIds.filter((id) => allowed.has(String(id)));
        }
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
        ? {
            /**
             * IMPORTANT (optimisation RAM):
             * - `deep=1` est utilisé par Bilans/Rapports pour avoir accès à `produit.achatPrice`.
             * - On limite volontairement les champs produits au strict nécessaire (name + achatPrice)
             *   pour éviter un payload énorme.
             */
            path: 'commande',
            populate: { path: 'items.produit', select: 'name achatPrice' },
          }
        : {
            /**
             * IMPORTANT (demande optimisation):
             * - En liste "Historique de Facture", on ne renvoie QUE le résumé:
             *   client, date, totalAmount, id
             * - Donc on exclut `items` ici (pas besoin en liste)
             * - Le détail (articles) est chargé uniquement sur la page facture/détails.
             */
            path: 'commande',
            select: 'fullName phoneNumber adresse commandeDate',
          };

      const paiements = await query
        .populate(commandePopulate)
        // Boutique utilisée par le front pour filtrer (Historique facture)
        .populate({ path: 'user', select: 'boutique' })
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
