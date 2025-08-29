import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle approvisonnements
export const useCreateApprovisonnement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post('/approvisonnements/createApprovisonement', data),
    onSuccess: () => queryClient.invalidateQueries(['approvisonnements']),
  });
};

// Update Approvisonnement
export const useUpdateApprovisonnement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/approvisonnements/updateApprovisonement/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['approvisonnements']),
  });
};

// Lire toutes les approvisonnements
export const useAllApprovisonnement = () =>
  useQuery({
    queryKey: ['approvisonnements'],
    queryFn: () =>
      api
        .get('/approvisonnements/getAllApprovisonements')
        .then((res) => res.data),
  });

// Obtenir une Approvisonnement
export const useOneApprovisonnement = (id) =>
  useQuery({
    queryKey: ['getApprovisonnement', id],
    queryFn: () =>
      api
        .get(`/approvisonnements/getApprovisonement/${id}`)
        .then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une approvisonnements
export const useCancelApprovisonnement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/approvisonnements/cancelApprovisonement/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['approvisonnements']),
  });
};

// Supprimer une approvisonnements
export const useDeleteApprovisonnement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/approvisonnements/deleteApprovisonement/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['approvisonnements']),
  });
};
