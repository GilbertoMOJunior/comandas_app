import { api } from './api';

export const produtoService = {
  list: () => api.get('/produto/'),
  listPublic: () => api.get('/produto/publico/', { withAuth: false }),
  getById: (id) => api.get(`/produto/${id}`),
  create: (data) => api.post('/produto/', data),
  update: (id, data) => api.put(`/produto/${id}`, data),
  remove: (id) => api.delete(`/produto/${id}`),
};

// Converte arquivo (File) para base64 sem o prefixo data:URI
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === 'string' ? result.split(',')[1] : '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Converte base64 (vinda da API) em data URI para uso em <img src=...>
export const base64ToDataUri = (b64, mime = 'image/jpeg') => {
  if (!b64) return null;
  if (typeof b64 === 'string' && b64.startsWith('data:')) return b64;
  return `data:${mime};base64,${b64}`;
};

export default produtoService;
