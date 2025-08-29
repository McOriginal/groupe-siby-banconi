export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatPhoneNumber = (number) => {
  if (!number) return '';
  const digits = String(number).replace(/\D/g, '').slice(0, 8); // max 8 chiffres
  return digits.replace(/(\d{2})(?=\d)/g, '$1-').replace(/-$/, '');
};

export const formatPrice = (number) => {
  if (number == null) return 'null';

  const str = number.toString();

  if (str.length === 4) {
    return str.slice(0, 1) + ' ' + str.slice(1); // 1 234
  }

  if (str.length === 5) {
    return str.slice(0, 2) + ' ' + str.slice(2); // 12 345
  }

  if (str.length >= 6) {
    // Ajoute un espace tous les 3 chiffres à partir de la droite
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // 123 456, 1 234 567, etc.
  }

  return str; // pour les nombres < 1000, on retourne tel quel
};
