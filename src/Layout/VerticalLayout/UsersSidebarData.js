const UsersSidebarData = [
  {
    label: 'Menu',
    isMainMenu: true,
  },
  {
    label: 'Tabelau de Bord',
    icon: 'mdi mdi-home-variant-outline',
    isHasArrow: true,
    url: '/dashboard-user',
  },

  // --------------------------------------
  {
    label: 'Produits',
    isMainMenu: true,
  },
  {
    label: 'Produits',
    icon: 'mdi mdi-sitemap',
    isHasArrow: true,
    url: '/produits',
  },
  {
    label: 'Commande & Facture',
    isMainMenu: true,
  },

  {
    label: 'Commande',
    icon: 'fas fa-server',
    isHasArrow: true,
    url: '/commandes',
  },
  {
    label: 'Nouvelle Commande',
    icon: 'fas fa-shopping-cart',
    isHasArrow: true,
    url: '/newCommande',
  },

  // Transactions / Comptabilité
  {
    label: 'Comptabilité',
    isMainMenu: true,
  },

  {
    label: 'Entrées (Paiement)',
    icon: 'fas fa-euro-sign',
    isHasArrow: true,
    url: '/paiements',
  },
];
export default UsersSidebarData;
