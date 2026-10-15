import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'bilafon_token';

const USER_KEY = 'bilafon_user';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },
  setUser: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Send the JWT with every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid token -> tell the app to go back to the login screen.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginCall = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginCall) {
      tokenStore.clear();
      window.dispatchEvent(new Event('bilafon:unauthorized'));
    }
    return Promise.reject(err);
  }
);

// Human-readable message from any failed request.
export const getErrorMessage = (err, fallback = 'Something went wrong') => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ERR_NETWORK') {
    return 'Backend server se connect nahi ho paya. Check karein ke server chal raha hai (http://localhost:5000).';
  }
  return err.message || fallback;
};

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: ({ currentPassword, newPassword, newEmail }) =>
    api.put('/auth/change-password', { currentPassword, newPassword, newEmail })
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (name) => api.post('/categories', { name }),
  delete: (id) => api.delete(`/categories/${id}`)
};

// frontend/src/services/api.js
export const salesService = {
  getAll: () => api.get('/sales'),
  create: (saleData) => api.post('/sales', saleData),
  delete: (id) => api.delete(`/sales/${id}`)
};

export const expenseService = {
  getAll: (params) => api.get('/expenses', { params }), // optional { month: 'YYYY-MM' } or { from, to }
  create: (data) => api.post('/expenses', data),
  delete: (id) => api.delete(`/expenses/${id}`)
};

// range: 'today' | '15days' | 'month' | 'custom' (custom also needs from + to as YYYY-MM-DD)
export const purchaseService = {
  getAll: (params) => api.get('/purchases', { params })
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};
// frontend/src/services/api.js


export default api;
