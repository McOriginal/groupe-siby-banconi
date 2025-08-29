const SidebarData = [
  {
    label: 'Menu',
    isMainMenu: true,
  },
  {
    label: 'Tableau De Bord',
    icon: 'mdi mdi-home-variant-outline',
    isHasArrow: true,
    url: '/dashboard',
  },
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
    label: 'Produit En Stock Faible',
    icon: 'mdi mdi-sitemap',
    isHasArrow: true,
    url: '/produit_no_stock',
  },
  {
    label: 'Approvisonnement',
    // icon: 'bx bx-rotate-right',
    icon: 'fas fa-redo-alt',
    isHasArrow: true,
    url: '/approvisonnements',
  },

  {
    label: 'Commande & Facture',
    isMainMenu: true,
  },

  {
    label: 'Liste de Commandes',
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

  {
    label: 'Factures',
    icon: 'fas fa-receipt',
    isHasArrow: true,
    url: '/factures',
  },

  // --------------------------------------

  // Transactions / Comptabilité
  {
    label: 'Entrées & Sorties',
    isMainMenu: true,
  },
  {
    label: 'Comptabilité',
    icon: 'fas fa-euro-sign',
    subItem: [
      { sublabel: 'Entrées (Paiement)', link: '/paiements' },
      { sublabel: 'Sorties (Dépense)', link: '/depenses' },
    ],
  },

  // Devis
  {
    label: 'Devis',
    isMainMenu: true,
  },
  {
    label: 'Devis',
    icon: 'fas fa-question',
    subItem: [
      { sublabel: 'Nouveau Devis', link: '/newDevis' },
      { sublabel: 'Historique de Devis', link: '/devisListe' },
    ],
  },

  // ----------------------------------------------------------------------
  // Médecins
  {
    label: 'Fournisseurs',
    isMainMenu: true,
  },

  {
    label: 'Fournisseurs',
    icon: 'fas fa-shipping-fast',
    isHasArrow: true,
    url: '/fournisseurs',
  },

  // Pharmacie
  {
    label: 'Statistiques & Rapports',
    isMainMenu: true,
  },
  {
    label: 'Rapports et Suivie',
    icon: 'fas fa-chart-bar',
    isHasArrow: true,
    url: '/rapports',
  },

  // --------------------------------------
];
export default SidebarData;
