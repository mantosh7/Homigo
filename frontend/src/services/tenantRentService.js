import api from './api';

// fetch logged-in tenant rent records
export async function getMyRent() {
  const res = await api.get('/tenant/rent');
  return res.data;
}
