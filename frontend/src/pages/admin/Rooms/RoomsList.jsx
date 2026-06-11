// import { useState, useEffect } from 'react'
// import Card from '../../../components/ui/Card'
// import Modal from '../../../components/ui/Modal'
// import RoomForm from './RoomForm'
// import { getRooms, createRoom, deleteRoom, updateRoom } from '../../../services/roomService'

// export default function RoomsList() {
//   const [rooms, setRooms] = useState([])
//   const [open, setOpen] = useState(false)
//   const [editing, setEditing] = useState(null)
//   const [busy, setBusy] = useState(false)

//   useEffect(() => {
//     fetchRooms()
//   }, [])

//   async function fetchRooms() {
//     try {
//       const data = await getRooms()
//       setRooms(data || [])
//     } catch (e) {
//       console.error('Failed to load rooms', e)
//       setRooms([])
//     }
//   }

//   async function onCreate(payload) {
//     setBusy(true)
//     try {
//       await createRoom(payload)
//       setOpen(false)
//       setEditing(null)
//       await fetchRooms()
//       alert("Room created successfully!")
//     } catch (err) {
//       console.error('Create room failed', err)
//       alert(err?.message || 'Failed to create room')
//     } finally {
//       setBusy(false)
//     }
//   }

//   async function onUpdate(id, payload) {
//     setBusy(true)
//     try {
//       await updateRoom(id, payload)
//       setOpen(false)
//       setEditing(null)
//       await fetchRooms()
//       alert("Room updated successfully!")
//     } catch (err) {
//       console.error('Update room failed', err)
//       alert(err?.message || 'Failed to update room')
//     } finally {
//       setBusy(false)
//     }
//   }

//   async function onDelete(id) {
//     if (!confirm('Delete room?')) return;
//     setBusy(true)
//     try {
//       const res = await deleteRoom(id)
//       await fetchRooms()
//       alert(res?.message || "Room deleted successfully!")
//     } catch (err) {
//       console.error('Delete room failed', err)
//       alert(err?.message || 'Failed to delete room')
//     } finally {
//       setBusy(false)
//     }
//   }

//   function onEdit(room) {
//     const initial = {
//       id: room.id,
//       room_number: room.room_number ?? room.number ?? '',
//       room_type: room.room_type ?? room.type ?? '',
//       floor: room.floor ?? ''
//     }
//     setEditing(initial)
//     setOpen(true)
//   }

//   function onOpenAdd() {
//     setEditing(null)
//     setOpen(true)
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">Room Management</h2>
//         <button
//           className="bg-gradient-to-b from-[#F46A47] to-[#E85A3C] px-4 py-2 rounded"
//           onClick={onOpenAdd}
//           disabled={busy}
//         >
//           + Add New Room
//         </button>
//       </div>

//       <div className="grid grid-cols-3 gap-4">
//         {rooms.length === 0 && (
//           <div className="text-gray-400">No rooms yet</div>
//         )}

//         {rooms.map(r => (
//           <Card key={r.id} className="p-4">
//             <div className="flex justify-between items-center">
//               <div>
//                 <div className="text-lg font-semibold">Room {r.room_number}</div>
//                 <div className="text-sm text-gray-400">{r.room_type} • Floor {r.floor}</div>
//               </div>

//               <div>
//                 <button
//                   className="px-3 py-1 bg-white/5 rounded mr-2"
//                   onClick={() => onEdit(r)}
//                   disabled={busy}
//                 >
//                   Edit
//                 </button>

//                 <button
//                   className="px-3 py-1 bg-red-600 rounded"
//                   onClick={() => onDelete(r.id)}
//                   disabled={busy}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>

//       <Modal
//         open={open}
//         onClose={() => { setOpen(false); setEditing(null) }}
//         title={editing ? 'Edit Room' : 'Add New Room'}
//       >
//         <RoomForm
//           key={editing?.id ?? 'new'}
//           initialValues={editing}
//           onSubmit={async (payload) => {
//             // On edit, RoomForm should pass payload with same keys used by updateRoom
//             if (editing) {
//               await onUpdate(editing.id, payload)
//             } else {
//               await onCreate(payload)
//             }
//           }}
//           disabled=
//           {busy}
//         />
//       </Modal>
//     </div>
//   )
// }


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

  useEffect(() => {
    fetchRooms()
  }, [])

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

  function onEdit(room) {
    setEditing({
      id: room.id,
      room_number: room.room_number ?? room.number ?? '',
      room_type: room.room_type ?? room.type ?? '',
      floor: room.floor ?? '',
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

  const isOccupied = r => r.is_occupied === 1 || r.is_occupied === true || r.is_occupied === '1'

  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(isOccupied).length
  const vacantRooms = totalRooms - occupiedRooms

  return (
    <div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Room Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all rooms</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={busy}
          className="bg-gradient-to-b from-[#F46A47] to-[#E85A3C] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          + Add New Room
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card title="Total Rooms" value={totalRooms} icon="🏠" color="indigo" hint="All rooms" />
        <Card title="Occupied" value={occupiedRooms} icon="🔴" color="red" hint="Currently occupied" />
        <Card title="Vacant" value={vacantRooms} icon="✓" color="green" hint="Available now" />
      </div>

      {/* Rooms grid */}
      {rooms.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-16 panel rounded-xl">
          No rooms added yet. Click "Add New Room" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {rooms.map(room => (
            <Card key={room.id} className="p-4">

              {/* Top row — room number + status badge */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-base font-semibold text-white">Room {room.room_number}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {room.room_type} - Floor {room.floor}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    ₹{Number(room.monthly_rent).toLocaleString('en-IN')}/month
                  </div>
                </div>

                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOccupied(room)
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
                  }`}>
                  {isOccupied(room) ? 'Occupied' : 'Vacant'}
                </span>
              </div>

              {/* Capacity bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Capacity</span>
                  <span>{room.capacity} seat{room.capacity !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: isOccupied(room) ? '100%' : '0%',
                      background: isOccupied(room) ? '#ef4444' : '#22c55e'
                    }}
                  />
                </div>
              </div>

              {/* Action buttons */}
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
          ))}
        </div>
      )}

      {/* Modal */}
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