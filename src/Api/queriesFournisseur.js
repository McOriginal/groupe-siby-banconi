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
export const useAllFournisseur = () =>
  useQuery({
    queryKey: ['fournisseur'],
    queryFn: () =>
      api.get('/fournisseurs/getAllFournisseurs').then((res) => res.data),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
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
