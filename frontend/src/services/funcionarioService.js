import { api } from './api';

export const funcionarioService = {
  list: () => api.get('/funcionario/'),
  getById: (id) => api.get(`/funcionario/${id}`),
  create: (data) => api.post('/funcionario/', data),
  update: (id, data) => api.put(`/funcionario/${id}`, data),
  remove: (id) => api.delete(`/funcionario/${id}`),
};

export const GRUPOS = {
  1: 'Administrador',
  2: 'Atendente',
  3: 'Caixa',
  4: 'Cozinha',
};

export const grupoLabel = (g) => GRUPOS[g] || `Grupo ${g}`;

export default funcionarioService;
