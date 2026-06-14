import { useState, useEffect } from 'react'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import RoomForm from './RoomForm'
import { getRooms, createRoom, deleteRoom, updateRoom } from '../../../services/roomService'

export default function RoomsList() {
  const [rooms, setRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { fetchRooms() }, [])

  async function fetchRooms() {
    try {
      const data = await getRooms()
      setRooms(data || [])
    } catch (e) {
      console.error('Failed to load rooms', e)
      setRooms([])
    }
  }

  async function onCreate(payload) {
    setBusy(true)
    try {
      await createRoom(payload)
      setOpen(false)
      setEditing(null)
      await fetchRooms()
      alert('Room created successfully!')
    } catch (err) {
      alert(err?.message || 'Failed to create room')
    } finally {
      setBusy(false)
    }
  }

  async function onUpdate(id, payload) {
    setBusy(true)
    try {
      await updateRoom(id, payload)
      setOpen(false)
      setEditing(null)
      await fetchRooms()
      alert('Room updated successfully!')
    } catch (err) {
      alert(err?.message || 'Failed to update room')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this room?')) return

    setBusy(true)
    try {
      const res = await deleteRoom(id)
      await fetchRooms()
      alert(res?.message || 'Room deleted successfully!')
    } catch (err) {
      alert(err?.message || 'Failed to delete room')
    } finally {
      setBusy(false)
    }
  }

  // Open edit modal with existing room data
  function onEdit(room) {
    setEditing({
      id: room.id,
      room_number: room.room_number ?? '',
      room_type: room.room_type ?? '',
      floor: room.floor ?? '',
      capacity: room.capacity ?? '',
      monthly_rent: room.monthly_rent ?? ''
    })
    setOpen(true)
  }

  function openAddModal() {
    setEditing(null)
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setEditing(null)
  }

  // Determine room occupancy state from occupied and available seats
  const getRoomStatus = (room) => {
    const occupied = Number(room.occupied_seats) || 0
    const available = Number(room.available_seats) || 0

    if (occupied === 0) return 'Vacant'
    if (available === 0) return 'Full'

    return 'Partial'
  }

  // Status badge styles
  const statusStyle = {
    Vacant: 'bg-green-500/20 text-green-400',
    Full: 'bg-red-500/20 text-red-400',
    Partial: 'bg-yellow-500/20 text-yellow-400',
  }

  // Calculate room statistics dynamically
  const totalRooms = rooms.length
  const vacantRooms = rooms.filter(r => getRoomStatus(r) === 'Vacant').length
  const fullRooms = rooms.filter(r => getRoomStatus(r) === 'Full').length
  const partialRooms = rooms.filter(r => getRoomStatus(r) === 'Partial').length

  return (
    <div>

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Room Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and track all rooms
          </p>
        </div>

        <button
          onClick={openAddModal}
          disabled={busy}
          className="bg-gradient-to-b from-[#F46A47] to-[#E85A3C] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          + Add New Room
        </button>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card
          title="Total Rooms"
          value={totalRooms}
          icon="🏠"
          color="indigo"
          hint="All rooms"
        />

        <Card
          title="Vacant"
          value={vacantRooms}
          icon="✓"
          color="green"
          hint="No tenants"
        />

        <Card
          title="Partially"
          value={partialRooms}
          icon="🟡"
          color="yellow"
          hint="Some seats filled"
        />

        <Card
          title="Full"
          value={fullRooms}
          icon="🔴"
          color="red"
          hint="No seats left"
        />
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-16 panel rounded-xl">
          No rooms added yet. Click "Add New Room" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {rooms.map(room => {
            const status = getRoomStatus(room)
            const occupied = Number(room.occupied_seats) || 0
            const capacity = Number(room.capacity) || 1
            const fillPct = Math.round((occupied / capacity) * 100)

            return (
              <Card key={room.id} className="p-4">

                {/* Room info and status */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-base font-semibold text-white">
                      Room {room.room_number}
                    </div>

                    <div className="text-xs text-gray-400 mt-0.5">
                      {room.room_type} · Floor {room.floor}
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      ₹{Number(room.monthly_rent).toLocaleString('en-IN')}/month
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[status]}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Occupancy progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Occupancy</span>

                    {/* Example: 2 / 4 seats occupied */}
                    <span>
                      {occupied} / {capacity} seat{capacity !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${fillPct}%`,
                        background:
                          status === 'Full'
                            ? '#ef4444'
                            : status === 'Partial'
                              ? '#eab308'
                              : '#22c55e'
                      }}
                    />
                  </div>
                </div>

                {/* Room actions */}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => onEdit(room)}
                    disabled={busy}
                    className="flex-1 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-300 disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(room.id)}
                    disabled={busy}
                    className="flex-1 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 transition text-red-400 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>

              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Modal
        open={open}
        onClose={closeModal}
        title={editing ? 'Edit Room' : 'Add New Room'}
      >
        <RoomForm
          key={editing?.id ?? 'new'}
          initialValues={editing}
          disabled={busy}
          onSubmit={async (payload) => {
            if (editing) {
              await onUpdate(editing.id, payload)
            } else {
              await onCreate(payload)
            }
          }}
        />
      </Modal>

    </div>
  )
}