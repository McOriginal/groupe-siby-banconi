import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle produits
export const useCreateProduit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/produits/addProduit', data),
    onSuccess: () => queryClient.invalidateQueries(['produits']),
  });
};

// Mettre à jour une produits
export const useUpdateProduit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/produits/updateProduit/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['produits']),
  });
};

// Lire toutes les produits
export const useAllProduit = (params) =>
  useQuery({
    /**
     * CACHE + PAGINATION "PRO"
     *
     * Contrainte:
     * - On garde le même hook `useAllProduit` (pas de renommage)
     * - On ne change pas l'URL backend: `/produits/getAllProduits`
     *
     * Amélioration:
     * - Si `params` contient `paged: 1`, on récupère une réponse paginée du backend
     * - Sinon, comportement historique: tableau complet (comme avant)
     *
     * Exemple (page Produits):
     * - useAllProduit({ paged: 1, page: 1, limit: 24, q: 'vis', stockGt: 0 })
     */
    /**
     * NOTE cache:
     * - On évite `params || {}` dans le queryKey car `{}` est recréé à chaque render
     *   => invalidation du cache / refetch infini.
     */
    queryKey: params ? ['produits', params] : ['produits', 'all'],
    queryFn: () =>
      api
        .get('/produits/getAllProduits', {
          // IMPORTANT: params optionnel => ne casse pas les usages existants
          params: params || undefined,
        })
        .then((res) => res.data),
    /**
     * Réglages cache:
     * - staleTime: évite de refetch inutilement quand on navigue / revient sur la page
     * - keepPreviousData: garde la page précédente à l'écran pendant le chargement
     *   => UX fluide + pas de "flash" vide
     */
    staleTime: 1000 * 30, // 30s
    gcTime: 1000 * 60 * 10, // 10 min
    /**
     * React Query v5:
     * - `keepPreviousData` n'est plus l'option recommandée
     * - `placeholderData(prev) => prev` garde l'ancienne page pendant le chargement
     */
    placeholderData: (prev) => prev,
  });

// Produit dont le Stock est terminé
export const useAllProduitWithStockInferieure = (params) =>
  useQuery({
    /**
     * STOCK FAIBLE - cache + pagination + recherche serveur
     *
     * Contrainte:
     * - On garde le même hook `useAllProduitWithStockInferieure`
     * - On garde la même URL backend: `/produits/getAllProduitWithStockFinish`
     *
     * Usage:
     * - useAllProduitWithStockInferieure({ paged: 1, page: 1, limit: 24, q: '...' })
     */
    queryKey: params
      ? ['produits', 'stock-faible', params]
      : ['produits', 'stock-faible', 'all'],
    queryFn: () =>
      api
        .get('/produits/getAllProduitWithStockFinish', {
          params: params || undefined,
        })
        .then((res) => res.data),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

// Obtenir un Produit
export const useOneProduit = (id) =>
  useQuery({
    queryKey: ['getProduit', id],
    queryFn: () =>
      api.get(`/produits/getOneProduit/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Affficher le produit lors de l'approvisonnement
export const useOneProduitWhenApprovisionne = (id) =>
  useQuery({
    queryKey: ['getProduit', id],
    queryFn: () => api.get(`/approvisonnement/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une produits
export const useDeleteProduit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/produits/deleteProduit/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['produits']),
  });
};
