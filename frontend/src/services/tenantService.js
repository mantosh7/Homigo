import api from './api';

export const getTenants = () =>
  api.get('/tenants/all').then(r => r.data);

export const createTenant = (data) =>
  api.post('/tenants/add', data).then(r => r.data);

export const deleteTenant = (id) =>
  api.delete(`/tenants/delete/${id}`).then(r => r.data);

export const updateTenant = (id, data) =>
  api.put(`/tenants/update/${id}`, data).then(r => r.data);