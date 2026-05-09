import { api } from './api';

export const STATUS_COMANDA = {
  0: 'Aberta',
  1: 'Fechada',
  2: 'Cancelada',
};

export const statusLabel = (s) => STATUS_COMANDA[s] || `Status ${s}`;

export const statusColor = (s) =>
  ({
    0: 'warning',
    1: 'success',
    2: 'default',
  }[s] || 'default');

export const comandaService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return api.get(`/comanda/${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => api.get(`/comanda/${id}`),
  create: (data) => api.post('/comanda/', data),
  update: (id, data) => api.put(`/comanda/${id}`, data),
  remove: (id) => api.delete(`/comanda/${id}`),
  cancelar: (id) => api.put(`/comanda/${id}/cancelar`),

  listItens: (id) => api.get(`/comanda/${id}/produtos`),
  addItem: (comandaId, data) => api.post(`/comanda/${comandaId}/produto`, data),
  updateItem: (itemId, data) => api.put(`/comanda/produto/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/comanda/produto/${itemId}`),
};

export const totalComanda = (itens = []) =>
  itens.reduce((sum, it) => sum + Number(it.valor_unitario || 0) * Number(it.quantidade || 0), 0);

export default comandaService;
