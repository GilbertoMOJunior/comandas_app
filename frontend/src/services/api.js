const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const tokenStorage = {
  getAccess: () => sessionStorage.getItem(TOKEN_KEY),
  getRefresh: () => sessionStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    sessionStorage.setItem(TOKEN_KEY, access);
    if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

let refreshPromise = null;

const refreshAccessToken = async () => {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        tokenStorage.set(data.access_token, data.refresh_token);
        return data.access_token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const buildHeaders = (extra = {}, withAuth = true) => {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (withAuth) {
    const token = tokenStorage.getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseError = async (res) => {
  try {
    const data = await res.json();
    if (Array.isArray(data?.detail)) {
      return data.detail.map((e) => `${e.loc?.join('.')} - ${e.msg}`).join('; ');
    }
    return data?.detail || data?.message || `Erro ${res.status}`;
  } catch {
    return `Erro ${res.status}`;
  }
};

const request = async (path, { method = 'GET', body, withAuth = true, _retried = false } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders({}, withAuth),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && withAuth && !_retried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request(path, { method, body, withAuth, _retried: true });
    }
    tokenStorage.clear();
    if (onUnauthorized) onUnauthorized();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (res.status === 204) return null;

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export default api;
