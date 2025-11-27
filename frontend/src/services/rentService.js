import api from './api'

// Create rent entry
export const createRent = (data) =>
  api.post('/rent/create', data).then(res => res.data)

// Mark rent as paid
export const payRent = (id) =>
  api.put(`/rent/pay/${id}`).then(res => res.data)

// Get pending rents only
export const getPending = () =>
  api.get('/rent/pending').then(res => res.data)
