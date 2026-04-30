import { useQuery } from '@tanstack/react-query';
import api from './api';

/**
 * IMPORTANT (spécifique Dashboard)
 * -------------------------------
 * Objectif: sur `/dashboard`, on n'affiche QUE des totaux.
 *
 * Contrainte imposée: on ne modifie PAS le backend (API/variables backend).
 * Donc, certains endpoints renvoient des listes volumineuses.
 *
 * Stratégie front (anti-RAM):
 * - On appelle les endpoints existants tels quels.
 * - MAIS on "réduit" immédiatement la réponse en ne gardant que des compteurs
 *   (length, stats), puis on retourne UNIQUEMENT ces compteurs.
 *
 * Pourquoi ça aide:
 * - React Query met en cache la valeur retournée par `queryFn`.
 * - Si `queryFn` retourne une grosse liste -> gros cache RAM.
 * - Si `queryFn` retourne un petit objet de compteurs -> cache RAM minimal,
 *   même si la réponse HTTP originale était grande.
 *
 * NB: Ça n'économise pas la bande passante (le serveur envoie toujours les listes),
 * mais ça évite de saturer la RAM du navigateur et accélère les re-renders.
 */

// Total produits (nombre de documents produits)
export const useDashboardProduitCount = () =>
  useQuery({
    // Clé distincte pour ne pas polluer/remplacer le cache de la page "Produits"
    queryKey: ['dashboard', 'produits', 'count'],
    queryFn: async () => {
      const res = await api.get('/produits/getAllProduits');
      const produits = res.data || [];
      return { total: Array.isArray(produits) ? produits.length : 0 };
    },
    // Sur un dashboard, un cache de quelques minutes est acceptable.
    staleTime: 1000 * 60 * 5,
  });

// Total produits en stock faible (documents produits avec stock < 10)
export const useDashboardLowStockProduitCount = () =>
  useQuery({
    // Clé distincte pour ne pas entrer en collision avec d'autres queries produits
    queryKey: ['dashboard', 'produits', 'lowStock', 'count'],
    queryFn: async () => {
      /**
       * On utilise l'endpoint EXISTANT qui renvoie déjà uniquement les produits
       * avec stock faible. Ça réduit la taille de la réponse vs getAllProduits
       * (toujours sans toucher au backend).
       */
      const res = await api.get('/produits/getAllProduitWithStockFinish');
      const produitsLowStock = res.data || [];
      return {
        total: Array.isArray(produitsLowStock) ? produitsLowStock.length : 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

// Total fournisseurs
export const useDashboardFournisseurCount = () =>
  useQuery({
    queryKey: ['dashboard', 'fournisseurs', 'count'],
    queryFn: async () => {
      const res = await api.get('/fournisseurs/getAllFournisseurs');
      const fournisseurs = res.data || [];
      return { total: Array.isArray(fournisseurs) ? fournisseurs.length : 0 };
    },
    staleTime: 1000 * 60 * 5,
  });

// Totaux commandes (total, en attente, en cours)
export const useDashboardCommandeCounts = () =>
  useQuery({
    queryKey: ['dashboard', 'commandes', 'counts'],
    queryFn: async () => {
      /**
       * Endpoint existant: `/commandes/getAllCommandes`
       * Réponse observée côté backend: { commandesListe, factures }
       *
       * Sur le dashboard, on n'a besoin que de `commandesListe` pour compter:
       * - total commandes
       * - commandes "en attente"
       * - commandes "en cours"
       *
       * Donc on retourne uniquement ces compteurs pour éviter de garder en cache
       * les listes complètes (`commandesListe`, `factures`) côté navigateur.
       */
      const res = await api.get('/commandes/getAllCommandes');
      const commandesListe = res.data?.commandesListe || [];

      if (!Array.isArray(commandesListe)) {
        return { total: 0, enAttente: 0, enCours: 0 };
      }

      let enAttente = 0;
      let enCours = 0;

      // Calcul volontairement "simple" et non-mémoire: un seul passage sur le tableau.
      for (const cmd of commandesListe) {
        if (cmd?.status === 'en attente') enAttente += 1;
        if (cmd?.status === 'en cours') enCours += 1;
      }

      return { total: commandesListe.length, enAttente, enCours };
    },
    staleTime: 1000 * 60 * 2,
  });

