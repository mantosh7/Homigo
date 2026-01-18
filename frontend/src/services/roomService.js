import api from './api'

export const getRooms = () =>
  api.get('/rooms/all').then(r => r.data)


export const createRoom = (data) =>
  api.post('/rooms/add', data).then(r => r.data)


export const updateRoom = (id, data) =>
  api.put(`/rooms/update/${id}`, data).then(r => r.data)


export const deleteRoom = async (id) => {
  try {
    const res = await api.delete(`/rooms/delete/${id}`)
    return res.data
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Failed to delete room'
    const e = new Error(msg)
    e.original = err
    throw e
  }
}

export const getAvailableRooms = () =>
  api.get('/rooms/available').then(r => r.data);

