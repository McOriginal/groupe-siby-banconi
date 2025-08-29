// String Validator with REGEX

exports.stringValidator = (enterValue) => {
  const stringDataRegex = /^[a-zA-ZÀ-ÿ0-9\s'-]+$/; // accepte lettres, accents, apostrophes, tirets et espaces

  return stringDataRegex.test(enterValue);
};

// Fonction de validation des données saisie
exports.emailValidation = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email);
};
