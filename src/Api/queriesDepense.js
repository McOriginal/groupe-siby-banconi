import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle Depense
export const useCreateDepense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/depenses/createDepense', data),
    onSuccess: () => queryClient.invalidateQueries(['depenses']),
  });
};

// Mettre à jour une Depense
export const useUpdateDepense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/depenses/updateDepense/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['depenses']),
  });
};
// Lire toutes les depenses
export const useAllDepenses = (params) =>
  useQuery({
    /**
     * CACHE + PAGINATION (optionnel)
     *
     * Contrainte:
     * - On garde le même hook `useAllDepenses`
     * - On ne change pas l'URL `/depenses/getAllDepense`
     *
     * Usage:
     * - useAllDepenses() => historique (tableau complet)
     * - useAllDepenses({ paged: 1, page: 1, limit: 25, q: '...', today: 1 }) => paginé
     */
    queryKey: params ? ['depenses', params] : ['depenses', 'all'],
    queryFn: () =>
      api
        .get('/depenses/getAllDepense', { params: params || undefined })
        .then((res) => res.data),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

// Obtenir une Depense
export const useOneDepense = (id) =>
  useQuery({
    queryKey: ['depenses', id],
    queryFn: () =>
      api.get(`/depenses/getDepenseById/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, // chaque 5 minutes rafraichir les données
  });

// Supprimer une Depense
export const useDeleteDepense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/depenses/deleteDepense/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['depenses']),
  });
};
