import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle Commande
export const useCreateCommande = () => {
  const queryClient = useQueryClient();
  const authUser = localStorage.getItem('authUser');
  return useMutation({
    mutationFn: (data) =>
      api.post('/commandes/createCommande', data, {
        headers: {
          Authorization: `Bearer ${authUser?.token}`,
        },
      }),
    onSuccess: () => queryClient.invalidateQueries(['commandes']),
  });
};

// Mettre à jour une Commande
export const useUpdateCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commandeId, data }) =>
      api.put(`/commandes/updateCommande/${commandeId}`, data),
    onSuccess: () => queryClient.invalidateQueries(['commandes']),
  });
};
// Lire toutes les commandes
export const useAllCommandes = (params) =>
  useQuery({
    /**
     * CACHE + PAGINATION (optionnel)
     *
     * Contrainte:
     * - On garde le même hook `useAllCommandes`
     * - On ne change pas l'URL: `/commandes/getAllCommandes`
     *
     * Usage:
     * - useAllCommandes() => comportement historique (liste complète + factures)
     * - useAllCommandes({ paged: 1, page: 1, limit: 20, q: '...' }) => version paginée
     */
    queryKey: params ? ['commandes', params] : ['commandes', 'all'],
    queryFn: () =>
      api
        .get('/commandes/getAllCommandes', { params: params || undefined })
        .then((res) => res.data),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

/**
 * DASHBOARD - Mode "résumé" (uniquement des compteurs)
 *
 * IMPORTANT:
 * - On NE change PAS l'URL de l'API (toujours `/commandes/getAllCommandes`)
 * - On ajoute seulement un paramètre de query `summary=1`
 * - Le backend est modifié pour répondre avec une version légère quand `summary=1`
 *
 * Pourquoi:
 * - Le dashboard n'a pas besoin de la liste complète des commandes + factures
 * - Réduire fortement la RAM côté navigateur + la taille des réponses + le CPU backend
 */
export const useCommandesSummary = () =>
  useQuery({
    queryKey: ['commandes', 'summary'],
    queryFn: () =>
      api
        .get('/commandes/getAllCommandes', { params: { summary: 1 } })
        .then((res) => res.data),
  });

// Obtenir une Commande
export const useOneCommande = (id) =>
  useQuery({
    queryKey: ['commandes', id],
    queryFn: () =>
      api.get(`/commandes/getOneCommande/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Liste des Produits les plus Commandés
export const useGetTopProduitCommande = () => {
  return useQuery({
    /**
     * TOP PRODUITS - cache "pro"
     *
     * Remarques:
     * - On garde le même hook `useGetTopProduitCommande`
     * - On ne change pas l'URL backend: `/commandes/topProduitsCommande`
     * - On ajoute seulement un paramètre `limit` pour éviter une réponse énorme
     *
     * IMPORTANT:
     * - On change le queryKey pour éviter les collisions avec d'autres requêtes "commandes"
     *   (sinon React Query peut réutiliser le mauvais cache).
     */
    queryKey: ['commandes', 'top-produits', { limit: 20 }],
    queryFn: () =>
      api
        .get('/commandes/topProduitsCommande', { params: { limit: 20 } })
        .then((res) => res.data),
    staleTime: 1000 * 60 * 5, // ces données changent moins souvent
    gcTime: 1000 * 60 * 30,
  });
};

// Supprimer une Commande
export const useDeleteCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commandeId, items }) =>
      api.post(`/commandes/deleteCommande/${commandeId}`, {
        items,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['commandes']);
      queryClient.invalidateQueries(['commandes']); // si tu veux la liste à jour
    },
  });
};
