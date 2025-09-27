import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle inventaires
export const useCreateInventaire = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/inventaires/createInventaire', data),
    onSuccess: () => queryClient.invalidateQueries(['inventaires']),
  });
};

// Update Inventaire
export const useUpdateInventaire = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/inventaires/updateInventaire/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['inventaires']),
  });
};

// Lire toutes les inventaires
export const useAllInventaire = () =>
  useQuery({
    queryKey: ['inventaires'],
    queryFn: () =>
      api.get('/inventaires/getAllInventaires').then((res) => res.data),
  });

// Obtenir une Inventaire
export const useOneInventaire = (id) =>
  useQuery({
    queryKey: ['getInventaire', id],
    queryFn: () =>
      api.get(`/inventaires/getInventaire/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une inventaires
export const useCancelInventaire = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/inventaires/cancelInventaire/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['inventaires']),
  });
};

// Supprimer une inventaires
export const useDeleteInventaire = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/inventaires/deleteInventaire/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['inventaires']),
  });
};
