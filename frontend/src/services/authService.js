import { api, tokenStorage } from './api';

export const authService = {
  login: async (cpf, senha) => {
    const data = await api.post('/auth/login', { cpf, senha }, { withAuth: false });
    tokenStorage.set(data.access_token, data.refresh_token);
    return data;
  },

  me: () => api.get('/auth/me'),

  logout: async () => {
    try {
      await api.post('/auth/logout', {}, { withAuth: false });
    } finally {
      tokenStorage.clear();
    }
  },
};

export default authService;
