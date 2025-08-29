const mongoose = require('mongoose');

const connexionToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Vous êtes connecté à mongoDB avec succèss');
  } catch (e) {
    console.log('Erreur de connexion à Mongodb problème: ', e);
    process.exit(1);
  }
};

module.exports = connexionToDatabase;
