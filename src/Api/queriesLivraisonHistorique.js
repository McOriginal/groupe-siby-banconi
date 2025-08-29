import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle livraison_historique
export const useCreateLivraisonHistorique = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post('/livraison_historique/createLivraisonHistorique', data),
    onSuccess: () => queryClient.invalidateQueries(['livraison_historique']),
  });
};

// Mettre à jour une Chambre
export const useUpdateLivraisonHistorique = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/livraison_historique/updateLivraisonHistorique/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['livraison_historique']),
  });
};

// Lire toutes les livraison_historique
export const useAllLivraisonHistorique = (id) =>
  useQuery({
    queryKey: ['livraison_historique', id],
    queryFn: () =>
      api
        .get(`/livraison_historique/getAllLivraisonHistorique/${id}`)
        .then((res) => res.data),
  });

// Lire toutes les livraison_historique
export const useOneLivraisonHistorique = (id) =>
  useQuery({
    queryKey: ['livraison_historique', id],
    queryFn: () =>
      api
        .get(`/livraison_historique/getAllLivraisonHistorique/:${id}`)
        .then((res) => res.data),
  });

// Supprimer une livraison_historique
export const useDeleteLivraisonHistorique = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/livraison_historique/deleteLivraisonHistorique/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['livraison_historique']),
  });
};
