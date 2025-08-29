import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api'; // instance Axios avec baseURL + token auto

// Création d'un nouvel utilisateur
export const useRegister = () => {
  return useMutation({
    mutationFn: (newUser) => api.post('/users/register', newUser),
  });
};

// Hook login utilisateur
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => api.post('/users/login', credentials),
    onSuccess: (response) => {
      const { token, user } = response.data;
      // Stocker le token dans les en-têtes pour les requêtes futures

      // Enregistrer token + user dans localStorage
      // localStorage.setItem('authUser', JSON.stringify({ token, user }));
      localStorage.setItem(
        'authUser',
        JSON.stringify({
          token: response.data.token,
          user: response.data.user,
        })
      );

      // console.log('Utilisateur connecté:', response.data.user);

      // Optionnel : mettre à jour le cache si tu veux propager l'état
      queryClient.setQueryData(['authUser'], { token, user });
    },
  });
};

// Update Password
// Mettre à jour un étudiant
export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/users/updatePassword/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });
};

// Reset Password
export const useSendVerifyCodePasswordPassword = () => {
  return useMutation({
    mutationFn: (data) => api.post('/users/sendVerifyCodePassword', data),
  });
};
// Reset Password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data) => api.put('/users/resetPassword', data),
  });
};
