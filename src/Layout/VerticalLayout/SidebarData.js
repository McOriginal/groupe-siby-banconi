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
    label: 'Top Produits',
    icon: 'fas fa-star',
    isHasArrow: true,
    url: '/topProduits',
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
    label: 'Historique de Commandes',
    icon: 'fas fa-server',
    isHasArrow: true,
    url: '/commandes',
  },
  {
    label: 'Ajouter une Commande',
    icon: 'fas fa-shopping-cart',
    isHasArrow: true,
    url: '/newCommande',
  },

  {
    label: 'Historique des Factures',
    icon: 'fas fa-receipt',
    isHasArrow: true,
    url: '/factures',
  },

  // --------------------------------------

  // Transactions / Comptabilité
  {
    label: 'Caisse & Comptabilité',
    isMainMenu: true,
  },
  {
    label: 'Paiements / Entrée',
    icon: 'fas fa-dollar-sign',
    isHasArrow: true,
    url: '/paiements',
  },
  {
    label: 'Depense / Sortie',
    icon: 'fas fa-euro-sign',
    isHasArrow: true,
    url: '/depenses',
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
    label: 'Rapports & Bilans',
    isMainMenu: true,
  },
  {
    label: 'Bilans',
    icon: 'fas fa-balance-scale',
    isHasArrow: true,
    url: '/bilans',
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
