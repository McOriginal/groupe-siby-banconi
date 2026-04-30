const mongoose = require('mongoose');
const Fournisseur = require('../models/FournisseurModel');
const textValidation = require('./regexValidation');

/**
 * Helpers - pagination / recherche (mode optionnel `paged=1`)
 *
 * Contrainte:
 * - On ne change PAS l'URL `/fournisseurs/getAllFournisseurs`
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

// Créer un Fournisseur
exports.createFournisseur = async (req, res) => {
  try {
    const { firstName, lastName, emailAdresse, adresse, ...resOfData } =
      req.body;
    // Changer les données en miniscule
    const lowerFirstName = firstName.toLowerCase();
    const lowerLastName = lastName.toLowerCase();
    const lowerAdresse = adresse.toLowerCase();
    const lowerEmail = emailAdresse.toLowerCase();

    const phoneNumber = Number(req.body.phoneNumber);

    if (
      !textValidation.stringValidator(lowerFirstName) ||
      !textValidation.stringValidator(lowerLastName) ||
      !textValidation.stringValidator(lowerAdresse) ||
      (emailAdresse != '' && !textValidation.emailValidation(emailAdresse))
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Vous avez mal saisie les données',
      });
    }

    // Vérification des champs uniques
    const existingFournisseur = await Fournisseur.findOne({
      $or: [{ emailAdresse: lowerEmail }, { phoneNumber }],
    }).exec();

    if (emailAdresse != '' && existingFournisseur) {
      const duplicateFields = [];

      if (existingFournisseur.emailAdresse === lowerEmail)
        duplicateFields.push('Le champ email existe déjà. ');
      if (existingFournisseur.phoneNumber === phoneNumber)
        duplicateFields.push('Le champ téléphone existe déjà ');

      return res.status(409).json({
        status: 'error',
        message: duplicateFields.join('\n '),
      });
    }

    if (
      req.body.phoneNumber.toString().length < 8 ||
      req.body.phoneNumber.toString().length > 16
    ) {
      return res.status(409).json({
        status: 'error',
        message: 'Le numéro de téléphone doit être entre 8 et 15 chiffres',
      });
    }

    // Crée un nouveau professeur
    const newFournisseur = await Fournisseur.create({
      firstName: lowerFirstName,
      lastName: lowerLastName,
      emailAdresse: lowerEmail,
      adresse: lowerAdresse,
      user: req.user.id,
      ...resOfData,
    });
    return res.status(201).json(newFournisseur);
  } catch (e) {
    return res.status(409).json({
      status: 'Email existe',
      message: e.message,
    });
    // }
  }
};

// Mettre à jour un Fournisseur
exports.updateFournisseur = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailAdresse,
      adresse,
      phoneNumber,
      ...resOfData
    } = req.body;
    // Changer les données en miniscule
    const lowerFirstName = firstName.toLowerCase();
    const lowerLastName = lastName.toLowerCase();
    const lowerAdresse = adresse.toLowerCase();
    const lowerEmail = emailAdresse.toLowerCase();

    if (
      !textValidation.stringValidator(lowerFirstName) ||
      !textValidation.stringValidator(lowerLastName) ||
      !textValidation.stringValidator(lowerAdresse) ||
      (emailAdresse != '' && !textValidation.emailValidation(emailAdresse))
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Vous avez mal saisie les données',
      });
    }

    // Conversion des numéros (protection contre les strings)
    const phoneNum = Number(phoneNumber);

    // Vérification des doublons (en excluant l'fournisseur actuel)
    const existingFournisseur = await Fournisseur.findOne({
      _id: { $ne: req.params.id }, // Exclure l'fournisseur actuel
      $or: [{ emailAdresse: lowerEmail }, { phoneNumber: phoneNum }],
    }).exec();

    if (existingFournisseur) {
      const duplicateFields = [];

      if (existingFournisseur.emailAdresse === lowerEmail) {
        duplicateFields.push('email');
      }
      if (existingFournisseur.phoneNumber === phoneNum) {
        duplicateFields.push('téléphone');
      }

      return res.status(409).json({
        status: 'error',
        message: `Le champs: ${duplicateFields.join('\n ')} existe déjà`,
      });
    }

    if (
      req.body.phoneNumber.toString().length < 8 ||
      req.body.phoneNumber.toString().length > 16
    ) {
      return res.status(409).json({
        status: 'error',
        message: 'Le numéro de téléphone doit être entre 8 et 15 chiffres',
      });
    }
    //  Si il n y a pas d'erreur on met ajour
    const updated = await Fournisseur.findByIdAndUpdate(
      req.params.id,
      {
        firstName: lowerFirstName,
        lastName: lowerLastName,
        emailAdresse: lowerEmail,
        adresse: lowerAdresse,
        phoneNumber: phoneNum,
        ...resOfData,
      },
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    );
    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Fournisseur non trouvé',
      });
    }
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Obtenir tous les Fournisseurs
exports.getAllFournisseurs = async (req, res) => {
  try {
    /**
     * MODE "SUMMARY" (Dashboard)
     *
     * Objectif:
     * - Pour afficher un compteur (total fournisseurs) on n'a pas besoin de charger toute la liste.
     *
     * Appel:
     * - `/fournisseurs/getAllFournisseurs?summary=1`
     *
     * Réponse:
     * - `{ counts: { totalFournisseurs } }`
     */
    const summaryParam = req.query?.summary;
    const isSummary =
      summaryParam === '1' || summaryParam === 'true' || summaryParam === true;
    if (isSummary) {
      const totalFournisseurs = await Fournisseur.countDocuments({});
      return res.status(200).json({ counts: { totalFournisseurs } });
    }

    /**
     * MODE PAGINÉ + RECHERCHE (Fournisseurs)
     *
     * Appel:
     * - `/fournisseurs/getAllFournisseurs?paged=1&page=1&limit=25&q=...`
     *
     * Réponse:
     * - `{ items, page, limit, total, totalPages }`
     *
     * IMPORTANT:
     * - Sans `paged=1`, on renvoie le tableau complet (compat).
     */
    const paged = req.query?.paged === '1' || req.query?.paged === 'true';
    if (paged) {
      const page = clamp(toInt(req.query?.page, 1), 1, 100_000);
      const limit = clamp(toInt(req.query?.limit, 25), 1, 200);
      const qRaw = (req.query?.q ?? '').toString().trim();

      const match = {};
      if (qRaw) {
        const regex = new RegExp(escapeRegex(qRaw), 'i');
        const asNumber = Number(qRaw);
        match.$or = [
          { firstName: regex },
          { lastName: regex },
          { emailAdresse: regex },
          { adresse: regex },
          ...(Number.isFinite(asNumber) ? [{ phoneNumber: asNumber }] : []),
        ].filter(Boolean);
      }

      const total = await Fournisseur.countDocuments(match);
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

      const items = await Fournisseur.find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('firstName lastName emailAdresse adresse phoneNumber user createdAt')
        .populate({ path: 'user', select: 'boutique' })
        .lean();

      return res.status(200).json({ items, page, limit, total, totalPages });
    }

    const fournisseurs = await Fournisseur.find()
      .populate('user')
      .sort({ createdAt: -1 });
    return res.status(200).json(fournisseurs);
  } catch (e) {
    return res.status(404).json({ e });
  }
};

// Récupérer un Fournisseur par ID
exports.getFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id).populate(
      'user'
    );
    if (!fournisseur)
      return res
        .status(404)
        .json({ status: 'error', message: 'Fournisseur non trouvé' });

    res.status(200).json(fournisseur);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un Fournisseur
exports.deleteFournisseur = async (req, res) => {
  try {
    await Fournisseur.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ status: 'success', message: 'Fournisseur supprimé avec succès' });
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// ############### DELETE ALL STUDENTS ############################
exports.deleteAllFournisseurs = async (req, res) => {
  try {
    await Fournisseur.deleteMany({}); // Supprime tous les documents

    return res.status(200).json({
      status: 'success',
      message: 'Tous les Fournisseurs ont été supprimés avec succès',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression des Fournisseurs',
      error: e.message,
    });
  }
};
