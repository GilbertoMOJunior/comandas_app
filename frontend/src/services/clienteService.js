import { api } from './api';

export const clienteService = {
  list: () => api.get('/cliente/'),
  getById: (id) => api.get(`/cliente/${id}`),
  create: (data) => api.post('/cliente/', data),
  update: (id, data) => api.put(`/cliente/${id}`, data),
  remove: (id) => api.delete(`/cliente/${id}`),
};

export default clienteService;
