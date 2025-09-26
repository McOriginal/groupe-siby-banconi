import React from 'react';
import { Navigate } from 'react-router-dom';

//Dashboard
import Dashboard from '../Pages/Dashboard';

// Import Authentication pages
import Login from '../Pages/Authentication/Login';
import ForgetPasswordPage from '../Pages/Authentication/ForgetPassword';
import Register from '../Pages/Authentication/Register';
import UserProfile from '../Pages/Authentication/user-profile';

// Importing other pages
import FournisseurListe from '../Pages/Fournisseurs/FournisseurListe.js';
import PaiementsListe from '../Pages/Paiements/PaiementsListe.js';
import ApprovisonnementListe from '../Pages/Approvisonnements/ApprovisonnementListe.js';
import ApprovisonnementForm from '../Pages/Approvisonnements/ApprovisonnementForm.js';
import DepenseListe from '../Pages/Depenses/DepenseListe.js';
import Rapports from '../Pages/Raports/Rapports.js';
import UpdatePassword from '../Pages/Authentication/UpdatePassword.js';
import VerifyCode from '../Pages/Authentication/VerifyCode.js';
import ResetPassword from '../Pages/Authentication/ResetPassword.js';
import ProduitListe from '../Pages/Produits/ProduitListe.js';
import CommandeListe from '../Pages/Commandes/CommandeListe.js';
import FactureListe from '../Pages/Commandes/FactureListe.js';
import Facture from '../Pages/Commandes/Details/Facture.js';
import ProduitSansStock from '../Pages/Produits/ProduitSansStock.js';
import PaiementsHistorique from '../Pages/Commandes/PaiementsHistorique/PaiementsHistorique.js';
import UpdateCommande from '../Pages/Commandes/UpdateCommande.js';
import NewCommande from '../Pages/Commandes/NewCommande.js';
import DevisListe from '../Pages/Devis/DevisListe.js';
import NewDevis from '../Pages/Devis/NewDevis.js';
import UpdateDevis from '../Pages/Devis/UpdateDevis.js';
import UsersProfilesListe from '../Pages/Authentication/UsersProfilesListe.js';
import ProfileDetail from '../Pages/Authentication/ProfileDetail.js';
import Bilans from '../Pages/Bilans/Bilans.js';
import TopProduits from '../Pages/Produits/TopProduits.js';
import DevisDetails from '../Pages/Devis/DevisDetails.js';

const sharedRoutes = [
  // Produit de la Boutique
  { path: '/produits', component: <ProduitListe /> },

  // Modifier une   COMMANDE
  { path: '/updateCommande/:id', component: <UpdateCommande /> },

  // Nouveau Devis
  { path: '/newDevis', component: <NewDevis /> },
  { path: '/updateDevis/:id', component: <UpdateDevis /> },
  // Devis Liste
  { path: '/devisListe', component: <DevisListe /> },

  { path: '/devis/getOneDevis/:id', component: <DevisDetails /> },

  // Nouvelle Commande
  { path: '/newCommande', component: <NewCommande /> },

  // Paiements Liste
  { path: '/paiements', component: <PaiementsListe /> },

  // Changer le mot de passe
  { path: '/updatePassword', component: <UpdatePassword /> },
];

// Routes pour les ADMINS
const authProtectedRoutes = [
  //dashboard
  { path: '/dashboard', component: <Dashboard /> },

  {
    path: '/',
    exact: true,
    component: <Navigate to='/dashboard' />,
  },
  // Commandes
  { path: '/commandes', component: <CommandeListe /> },

  // Fournisseurs
  { path: '/fournisseurs', component: <FournisseurListe /> },

  // Transaction et Factures

  // Historique Paiement
  { path: '/paiements_historique/:id', component: <PaiementsHistorique /> },

  //  Factures Liste
  { path: '/factures', component: <FactureListe /> },

  // Factures Détails
  { path: '/facture/:id', component: <Facture /> },

  // Dépenses
  { path: '/depenses', component: <DepenseListe /> },

  // Profile
  { path: '/userprofile', component: <UserProfile /> },

  // Details du Profile
  { path: '/userProfileDetails/:id', component: <ProfileDetail /> },

  // Modifier un Profile
  { path: '/updateUser/:id', component: <UserProfile /> },

  // Liste des Utilisateurs
  { path: '/usersProfileListe', component: <UsersProfilesListe /> },

  // Produit de la Boutique
  { path: '/produits', component: <ProduitListe /> },

  // Produit
  { path: '/produit_no_stock', component: <ProduitSansStock /> },

  // Top Produits
  { path: '/topProduits', component: <TopProduits /> },

  // approvisonnements
  { path: '/approvisonnements', component: <ApprovisonnementListe /> },
  { path: '/approvisonnement/:id', component: <ApprovisonnementForm /> },

  // Raports & Bilans
  { path: '/bilans', component: <Bilans /> },
  { path: '/rapports', component: <Rapports /> },

  { path: '/register', component: <Register /> },
  // --------------------------------------------------------
];

// Routes pour les Médecins
const usersRoutes = [
  {
    path: '/',
    exact: true,
    component: <Navigate to='/dashboard-user' />,
  },
  //dashboard
  { path: '/dashboard-user', component: <Dashboard /> },
  // Profile
  { path: '/userprofile', component: <UserProfile /> },
];

const publicRoutes = [
  // { path: '/unauthorized', component: <Unauthorized /> },

  // Authentication Page
  // { path: '/register', component: <Register /> },
  { path: '/login', component: <Login /> },
  { path: '/forgotPassword', component: <ForgetPasswordPage /> },
  { path: '/verifyCode', component: <VerifyCode /> },
  { path: '/resetPassword', component: <ResetPassword /> },
];

export { authProtectedRoutes, usersRoutes, publicRoutes, sharedRoutes };
