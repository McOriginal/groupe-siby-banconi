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
export const useAllDevis = () =>
  useQuery({
    queryKey: ['devis'],
    queryFn: () => api.get('/devis/getAllDevis').then((res) => res.data),
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
