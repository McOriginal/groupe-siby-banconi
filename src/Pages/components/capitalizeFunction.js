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

  // Toujours transformer en string
  const str = number.toString();

  // Séparer la partie entière et décimale
  const [entier, decimal] = str.split('.');

  // Formater la partie entière (123456 → 123 456)
  const entierFormate = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // Si décimal existe → on le rattache
  return decimal ? `${entierFormate}.${decimal}` : entierFormate;
};
