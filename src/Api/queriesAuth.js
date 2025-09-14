import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
      // Ajouter le token par défaut pour Axios
      //  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

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

// Get All Users
export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users/getAllUsers').then((res) => res.data),
  });
};

// Get One User
export const useGetOneUser = (id) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.get(`/users/getOneUser/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 1,
  });
};

// Update User
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/users/updateUser/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });
};
