import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Ajouter une Fournisseur
export const useCreateFournisseur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/fournisseurs/createFournisseur', data),
    onSuccess: () => queryClient.invalidateQueries(['fournisseurs']),
  });
};

// Obtenir une Fournisseur
export const useAllFournisseur = (params) =>
  useQuery({
    /**
     * CACHE + PAGINATION (optionnel)
     *
     * Contrainte:
     * - On garde le même hook `useAllFournisseur`
     * - On ne change pas l'URL `/fournisseurs/getAllFournisseurs`
     *
     * Important (bug fix cache):
     * - Vos mutations invalident `['fournisseurs']` mais ce query utilisait `['fournisseur']`
     *   => le cache n'était pas invalidé après ajout/modif/suppression.
     * - On aligne donc le queryKey sur `['fournisseurs', ...]` (amélioration interne, sans
     *   toucher vos variables/formulaires).
     */
    queryKey: params ? ['fournisseurs', params] : ['fournisseurs', 'all'],
    queryFn: () =>
      api
        .get('/fournisseurs/getAllFournisseurs', { params: params || undefined })
        .then((res) => res.data),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

/**
 * DASHBOARD - Compteur Fournisseurs
 *
 * Objectif:
 * - Eviter de télécharger tous les fournisseurs juste pour afficher un total sur le dashboard.
 *
 * Contrainte:
 * - On ne change pas l'URL: `/fournisseurs/getAllFournisseurs`
 * - On utilise seulement `summary=1`
 */
export const useFournisseursSummary = () =>
  useQuery({
    queryKey: ['fournisseurs', 'summary'],
    queryFn: () =>
      api
        .get('/fournisseurs/getAllFournisseurs', { params: { summary: 1 } })
        .then((res) => res.data),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

// Obtenir une Fournisseur
export const useOneFournisseur = (id) =>
  useQuery({
    queryKey: ['fournisseur', id],
    queryFn: () =>
      api.get(`/fournisseurs/getOneFournisseur/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Mettre à jour une Fournisseur
export const useUpdateFournisseur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/fournisseurs/updateFournisseur/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['fournisseurs']),
  });
};

// Supprimer une Fournisseur
export const useDeleteFournisseur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/fournisseurs/deleteFournisseur/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['fournisseurs']),
  });
};

// Supprimer toutes les fournisseurs
export const useDeleteAllFournisseur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/fournisseurs/deleteAllFournisseurs'),
    onSuccess: () => queryClient.invalidateQueries(['fournisseurs']),
  });
};
