import { useState, useEffect } from 'react'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import RoomForm from './RoomForm'
import { getRooms, createRoom, deleteRoom, updateRoom } from '../../../services/roomService'

export default function RoomsList(){
  const [rooms, setRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  async function fetchRooms(){
    try {
      const data = await getRooms()
      setRooms(data || [])
    } catch (e) {
      console.error('Failed to load rooms', e)
      setRooms([])
    }
  }

  async function onCreate(payload){
    setBusy(true)
    try {
      await createRoom(payload)
      setOpen(false)
      setEditing(null)
      await fetchRooms()
      alert("Room created successfully!")
    } catch (err) {
      console.error('Create room failed', err)
      alert(err?.message || 'Failed to create room')
    } finally {
      setBusy(false)
    }
  }

  async function onUpdate(id, payload){
    setBusy(true)
    try {
      await updateRoom(id, payload)
      setOpen(false)
      setEditing(null)
      await fetchRooms()
      alert("Room updated successfully!")
    } catch (err) {
      console.error('Update room failed', err)
      alert(err?.message || 'Failed to update room')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id){
  if(!confirm('Delete room?')) return;
  setBusy(true)
  try {
    const res = await deleteRoom(id)
    await fetchRooms()
    alert(res?.message || "Room deleted successfully!")
  } catch (err) {
    console.error('Delete room failed', err)
    alert(err?.message || 'Failed to delete room')
  } finally {
    setBusy(false)
  }
}

  function onEdit(room){
    const initial = {
      id: room.id,
      room_number: room.room_number ?? room.number ?? '',
      room_type: room.room_type ?? room.type ?? '',
      floor: room.floor ?? ''
    }
    setEditing(initial)
    setOpen(true)
  }

  function onOpenAdd(){
    setEditing(null)
    setOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Room Management</h2>
        <button
          className="bg-gradient-to-b from-[#F46A47] to-[#E85A3C] px-4 py-2 rounded"
          onClick={onOpenAdd}
          disabled={busy}
        >
          + Add New Room
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4"> 
        {rooms.length === 0 && (
          <div className="text-gray-400">No rooms yet</div>
        )}

        {rooms.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold">Room {r.room_number}</div>
                <div className="text-sm text-gray-400">{r.room_type} • Floor {r.floor}</div>
              </div>

              <div>
                <button
                  className="px-3 py-1 bg-white/5 rounded mr-2"
                  onClick={() => onEdit(r)}
                  disabled={busy}
                >
                  Edit
                </button>

                <button
                  className="px-3 py-1 bg-red-600 rounded"
                  onClick={() => onDelete(r.id)}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setEditing(null) }}
        title={editing ? 'Edit Room' : 'Add New Room'}
      >
        <RoomForm
          key={editing?.id ?? 'new'}
          initialValues={editing}
          onSubmit={async (payload) => {
            // On edit, RoomForm should pass payload with same keys used by updateRoom
            if (editing) {
              await onUpdate(editing.id, payload)
            } else {
              await onCreate(payload)
            }
          }}
          disabled=
          {busy}
        />
      </Modal>
    </div>
  )
}
