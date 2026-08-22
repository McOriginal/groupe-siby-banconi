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

/**
 * Somme des restes dus (impayés) sur les factures / paiements.
 * `totalAmount` côté paiement = montant net dû après réduction ; la réduction ne doit pas
 * apparaître comme impayé (contrairement à Σ commande.totalAmount − Σ totalPaye).
 */
/** Somme des montants dus nets (paiement.totalAmount, déjà après réduction). */
export const sumNetDueFromFactures = (factures = []) =>
  factures.reduce((acc, f) => acc + asMoneyNumber(f?.totalAmount), 0);

/** Somme des réductions (factures Bilans/Rapports ou lignes paiement). */
export const sumReductionFromRows = (rows = []) =>
  (rows || []).reduce((acc, r) => acc + asMoneyNumber(r?.reduction), 0);

export const sumReliquatFromFactures = (factures = []) =>
  factures.reduce(
    (acc, f) =>
      acc +
      Math.max(0, asMoneyNumber(f?.totalAmount) - asMoneyNumber(f?.totalPaye)),
    0
  );

/**
 * Coût d'achat total (Σ prix achat × quantité) pour une liste de paiements.
 * Attend `commande.items[].produit.achatPrice` (API paiements avec `deep=1`).
 */
export const sumAchatFromPaiements = (paiements = []) => {
  let total = 0;
  (paiements || []).forEach((paiement) => {
    const items = Array.isArray(paiement?.commande?.items)
      ? paiement.commande.items
      : [];
    items.forEach((item) => {
      const produit = item?.produit;
      if (!produit) return;
      total +=
        asMoneyNumber(produit.achatPrice) * asMoneyNumber(item.quantity, 1);
    });
  });
  return total;
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
