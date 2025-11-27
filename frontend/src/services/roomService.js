import api from './api'

async function handleResponse(promise) {
  try {
    const res = await promise
    return res.data
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Request failed'
    const e = new Error(msg)
    e.original = err
    throw e
  }
}

export const getRooms = () => handleResponse(api.get('/rooms/all'))

/**
 * createRoom returns the created room object (res.data) and
 * dispatches a 'roomsChanged' event so other parts of app can refresh.
 */
export const createRoom = async (data) => {
  const result = await handleResponse(api.post('/rooms/add', data))
  try { window.dispatchEvent(new Event('roomsChanged')) } catch (e) { /* ignore */ }
  return result
}

export const updateRoom = async (id, data) => {
  const result = await handleResponse(api.put(`/rooms/update/${id}`, data))
  try { window.dispatchEvent(new Event('roomsChanged')) } catch (e) { /* ignore */ }
  return result
}

export const deleteRoom = async (id) => {
  const result = await handleResponse(api.delete(`/rooms/delete/${id}`))
  try { window.dispatchEvent(new Event('roomsChanged')) } catch (e) { /* ignore */ }
  return result
}
