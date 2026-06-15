import { api } from './api';

export const recebimentoService = {
  dashboard: () => api.get('/recebimento/dashboard'),

  detalharComandas: (ids) => {
    const lista = Array.isArray(ids) ? ids : [ids];
    return api.get(`/recebimento/comandas/detalhe/${lista.join(',')}`);
  },

  recebimentoCompleto: (payload) => api.post('/recebimento/completo', payload),

  comprovante: (recebimentoId) => api.get(`/recebimento/comprovante/${recebimentoId}`),

  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return api.get(`/recebimento${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => api.get(`/recebimento/${id}`),
  create: (data) => api.post('/recebimento', data),
  update: (id, data) => api.put(`/recebimento/${id}`, data),
  remove: (id) => api.delete(`/recebimento/${id}`),
};

export default recebimentoService;
