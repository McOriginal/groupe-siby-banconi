const Depense = require('../models/DepenseModel');
const textValidation = require('./regexValidation');

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
    const depenses = await Depense.find().sort({ dateOfDepense: -1 });
    return res.status(200).json(depenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get a single expense by ID
exports.getDepenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const depense = await Depense.findById(id);

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
