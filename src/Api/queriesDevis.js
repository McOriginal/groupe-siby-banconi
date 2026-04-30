import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle Devis
export const useCreateDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/devis/createDevis', data),
    onSuccess: () => queryClient.invalidateQueries(['devis']),
  });
};

// Mettre à jour une Deviss
export const useUpdateDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/devis/updateDevis/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['devis']),
  });
};

// Lire toutes les Deviss
export const useAllDevis = (params) =>
  useQuery({
    /**
     * CACHE + PAGINATION (optionnel)
     *
     * Contrainte:
     * - On garde le même hook `useAllDevis`
     * - On ne change pas l'URL `/devis/getAllDevis`
     *
     * Usage:
     * - useAllDevis() => comportement historique (tableau complet)
     * - useAllDevis({ paged: 1, page: 1, limit: 10, q: '...', boutique: 1 }) => paginé
     */
    queryKey: params ? ['devis', params] : ['devis', 'all'],
    queryFn: () =>
      api
        .get('/devis/getAllDevis', { params: params || undefined })
        .then((res) => res.data),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

// Obtenir un Devis
export const useOneDevis = (id) =>
  useQuery({
    queryKey: ['getDevis', id],
    queryFn: () => api.get(`/devis/getOneDevis/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une Deviss
export const useDeleteDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/devis/deleteDevis/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['devis']),
  });
};
