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

/**
 * Convertit une valeur (API, JSON, éventuellement chaîne) en nombre fini pour les montants.
 * Évite les échecs du test `typeof x === 'number'` (Decimal128, Long, string "1234.5", etc.).
 */
export const asMoneyNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const formatPrice = (number) => {
  if (number == null) return 'null';

  // Affichage sûr si calcul intermédiaire invalide (ex. NaN sur une ligne tableau).
  const n = Number(number);
  if (!Number.isFinite(n)) return '0';

  // Toujours transformer en string
  const str = n.toString();

  // Séparer la partie entière et décimale
  const [entier, decimal] = str.split('.');

  // Formater la partie entière (123456 → 123 456)
  const entierFormate = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // Si décimal existe → on le rattache
  return decimal ? `${entierFormate}.${decimal}` : entierFormate;
};
