import api from './api';

// used by admin section
export const getTenants = () =>
  api.get('/tenants/all').then(r => r.data);

export const createTenant = (data) =>
  api.post('/tenants/add', data).then(r => r.data);

export const deleteTenant = (id) =>
  api.delete(`/tenants/delete/${id}`).then(r => r.data);

export const updateTenant = (id, data) =>
  api.put(`/tenants/update/${id}`, data).then(r => r.data);

// used by tenant section
export const getTenantProfile = () =>
  api.get('/tenants/profile').then(r => r.data) ;

export const changeTenantPassword = (data) =>
  api.post('/tenants/change-password', data).then(r => r.data) ;
