import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle Paiement
export const useCreatePaiementHistorique = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post('/paiements_historique/createPaiementHistorique', data),
    onSuccess: () => queryClient.invalidateQueries(['paiements_historique']),
  });
};

// Mettre à jour une PaiementHistorique
export const useUpdatePaiementHistorique = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/paiements_historique/updatePaiementHistorique/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['paiements_historique']),
  });
};
// Lire toutes les paiements_historique
export const useAllPaiementsHistorique = (id) =>
  useQuery({
    queryKey: ['paiements_historique', id],
    queryFn: () =>
      api
        .get(`/paiements_historique/getAllPaiementsHistorique/${id}`)
        .then((res) => res.data),
  });

// Obtenir une Paiement
export const useOnePaiementHistorique = (id) =>
  useQuery({
    queryKey: ['getOnePaiementHistorique', id],
    queryFn: () =>
      api
        .get(`/paiements_historique/getOnePaiementHistorique/${id}`)
        .then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une Paiement
export const useDeletePaiementHistorique = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/paiements_historique/deletePaiementHistorique/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['paiements_historique']),
  });
};
