import api from './api';

/** Fabrique de service REST : un service complet par module en une ligne. */
export const createService = (resource) => ({
  list: (params) => api.get(`/${resource}`, { params }).then((r) => r.data),
  detail: (id) => api.get(`/${resource}/${id}`).then((r) => r.data.data),
  create: (payload) => api.post(`/${resource}`, payload).then((r) => r.data),
  update: (id, payload) => api.put(`/${resource}/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/${resource}/${id}`).then((r) => r.data),
});

export const categoryService = createService('categories');
export const brandService = createService('brands');
export const supplierService = createService('suppliers');
export const clientService = createService('clients');
export const employeeService = createService('employees');
export const userService = createService('users');
export const paymentService = createService('payments');
export const productService = createService('products');
