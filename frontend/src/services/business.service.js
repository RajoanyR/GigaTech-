import api from './api';

export const dashboardService = {
  overview: () => api.get('/dashboard').then((r) => r.data.data),
};

export const stockService = {
  history: (params) => api.get('/stock/history', { params }).then((r) => r.data),
  alerts: () => api.get('/stock/alerts').then((r) => r.data.data),
  move: (payload) => api.post('/stock/move', payload).then((r) => r.data),
};

export const saleService = {
  list: (params) => api.get('/sales', { params }).then((r) => r.data),
  detail: (id) => api.get(`/sales/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/sales', payload).then((r) => r.data),
  cancel: (id) => api.patch(`/sales/${id}/cancel`).then((r) => r.data),
  // Telechargement authentifie de la facture (un lien <a> ne transmet aucun token).
  invoicePdf: (id) => api.get(`/sales/${id}/invoice`, { responseType: 'blob' }).then((r) => r.data),
};

export const purchaseService = {
  list: (params) => api.get('/purchases', { params }).then((r) => r.data),
  detail: (id) => api.get(`/purchases/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/purchases', payload).then((r) => r.data),
  validate: (id) => api.patch(`/purchases/${id}/validate`).then((r) => r.data),
  remove: (id) => api.delete(`/purchases/${id}`).then((r) => r.data),
};

export const reportService = {
  sales: (params) => api.get('/reports/sales', { params }).then((r) => r.data.data),
  purchases: (params) => api.get('/reports/purchases', { params }).then((r) => r.data.data),
  exportExcel: (params) => api.get('/reports/export/excel', { params, responseType: 'blob' }).then((r) => r.data),
  exportPdf: (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' }).then((r) => r.data),
  invoicePdf: (id) => api.get(`/sales/${id}/invoice`, { responseType: 'blob' }).then((r) => r.data),
};

export const settingService = {
  get: () => api.get('/settings').then((r) => r.data.data),
  update: (formData) => api.put('/settings', formData).then((r) => r.data.data),
  // Telechargement via Axios (donc AVEC le token JWT) au lieu d'un lien <a href> :
  // un lien quitte l'application React et n'envoie aucun header Authorization.
  backup: () => api.get('/settings/backup', { responseType: 'blob' }).then((r) => r.data),
};
