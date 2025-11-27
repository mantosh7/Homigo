// import { useEffect, useState, useMemo } from 'react'
// import dayjs from 'dayjs'
// import Card from '../../../components/ui/Card'
// import Modal from '../../../components/ui/Modal'
// import TenantForm from './TenantForm'
// import { getTenants, createTenant, deleteTenant, updateTenant } from '../../../services/tenantService';
// import { getRooms } from '../../../services/roomService'   


// // Date formatter function
// const fmt = (d) => d ? dayjs(d).format('MMM D, YYYY') : ''

// export default function TenantsList() {
//   const [tenants, setTenants] = useState([])
//   const [rooms, setRooms] = useState([])                
//   const [open, setOpen] = useState(false)
//   const [loading, setLoading] = useState(true)
//   const [editing, setEditing] = useState(null)

//   // build map id -> room_number for quick lookup
//   const roomMap = useMemo(() => {
//     const m = {}
//     rooms.forEach(r => { m[r.id] = r.room_number })
//     return m
//   }, [rooms])

//   useEffect(() => {
//     fetchList()
//     fetchRooms()   // <- also load rooms
//   }, [])

//   async function fetchRooms() {                    
//     try {
//       const r = await getRooms()
//       setRooms(r || [])
//     } catch (e) {
//       console.error('Failed to fetch rooms', e)
//       setRooms([])
//     }
//   }

//   async function fetchList() {
//     setLoading(true)
//     try {
//       const data = await getTenants()
//       setTenants(data || [])
//     } catch (e) {
//       console.error('Failed to fetch tenants', e)
//       setTenants([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function onCreate(payload) {
//     try {
//       await createTenant(payload)
//       setOpen(false)
//       fetchList()
//     } catch (err) {
//       console.error('Create tenant failed', err)
//       alert(err?.response?.data?.message || 'Failed to add tenant')
//     }
//   }

//   async function onMoveOut(id) {
//     if (!confirm('This will permanently delete the tenant. Continue?')) return;

//     try {
//       await deleteTenant(id);
//       fetchList();
//     } catch (e) {
//       console.error(e);
//       alert(e?.response?.data?.message || 'Failed to delete tenant');
//     }
//   }

//   function onEdit(tenant) {
//     // ensure room_id is numeric (TenantForm expects numbers)
//     const normalized = {
//       ...tenant,
//       room_id: tenant.room_id === null || tenant.room_id === undefined
//         ? null
//         : Number(tenant.room_id)
//     }
//     setEditing(normalized)
//     setOpen(true)
//   }

//   function onOpenAdd() {
//     setEditing(null)
//     setOpen(true)
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold">Tenant Management</h1>
//           <div className="text-gray-400">Manage all tenants and their details</div>
//         </div>
//         <button
//           onClick={onOpenAdd}
//           className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white"
//         >
//           + Add New Tenant
//         </button>
//       </div>

//       {loading && <div className="text-gray-400">Loading tenants...</div>}

//       {!loading && tenants.length === 0 && (
//         <Card className="p-12 text-center text-gray-400">
//           No tenants yet — add your first tenant.
//         </Card>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {tenants.map(t => (
//           <Card key={t.id} className="p-6">
//             <div className="flex items-start gap-4">
//               <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg font-bold">
//                 {(t.full_name || 'A')[0]?.toUpperCase()}
//               </div>

//               <div className="flex-1">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="font-semibold text-lg">{t.full_name}</div>
//                     <div className="text-sm text-gray-400">
//                       {/* Prefer room_number (from joined API) otherwise fall back to id */}
//                       {t.room_number ? `Room ${t.room_number}` : (t.room_id ? `Room ${t.room_id}` : '')}
//                       {/* If you used frontend roomMap, use:
//                           {t.room_id ? `Room ${roomMap[t.room_id] ?? t.room_id}` : ''}
//                       */}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4 space-y-2 text-sm text-gray-300">
//                   {t.phone && <div>📞 {t.phone}</div>}
//                   {t.email && <div>✉️ {t.email}</div>}
//                   {/* handle address field names from both frontend and DB */}
//                   {(t.address || t.permanent_address) && <div>🏠 {t.address || t.permanent_address}</div>}
//                   {t.join_date && <div className="text-gray-400">Joined {fmt(t.join_date)}</div>}
//                 </div>

//                 <div className="mt-4 border-t border-white/5 pt-4 flex gap-3">
//                   <button
//                     className="flex-0 px-3 py-2 rounded bg-white/5 text-gray-200 hover:bg-white/10"
//                     onClick={() => onEdit(t)}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     className="flex-0 px-3 py-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
//                     onClick={() => onMoveOut(t.id)}
//                   >
//                     Move Out
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>

//       <Modal
//         open={open}
//         onClose={() => setOpen(false)}
//         title={editing ? 'Edit Tenant' : 'Add New Tenant'}
//       >
//         <TenantForm
//           // force remount when editing changes
//           key={editing?.id ?? editing?._id ?? 'new'}
//           initialValues={editing}
//           onSubmit={async (payload) => {
//             try {
//               // if editing, normalize payload: don't send empty password
//               if (editing) {
//                 const id = editing.id || editing._id;
//                 if (payload.password === '') delete payload.password;
//                 await updateTenant(id, payload);
//               } else {
//                 await createTenant(payload);
//               }
//               setOpen(false);
//               setEditing(null);
//               await fetchList();
//             } catch (err) {
//               console.error('Save tenant failed', err);
//               alert(err?.response?.data?.message || 'Failed to save tenant');
//             }
//           }}
//         />
//       </Modal>
//     </div>
//   )
// }


import { useEffect, useState, useMemo } from 'react'
import dayjs from 'dayjs'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import TenantForm from './TenantForm'
import { getTenants, createTenant, deleteTenant, updateTenant } from '../../../services/tenantService';
import { getRooms } from '../../../services/roomService'   

// Date formatter function
const fmt = (d) => d ? dayjs(d).format('MMM D, YYYY') : ''

export default function TenantsList() {
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])                
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  // build map id -> room_number for quick lookup
  const roomMap = useMemo(() => {
    const m = {}
    rooms.forEach(r => { m[r.id] = r.room_number })
    return m
  }, [rooms])

  useEffect(() => {
    fetchList()
    fetchRooms()
  }, [])

  async function fetchRooms() {                    
    try {
      const r = await getRooms()
      setRooms(r || [])
    } catch (e) {
      console.error('Failed to fetch rooms', e)
      setRooms([])
    }
  }

  async function fetchList() {
    setLoading(true)
    try {
      const data = await getTenants()
      setTenants(data || [])
    } catch (e) {
      console.error('Failed to fetch tenants', e)
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  async function onCreate(payload) {
    try {
      await createTenant(payload)
      setOpen(false)
      fetchList()
    } catch (err) {
      console.error('Create tenant failed', err)
      alert(err?.response?.data?.message || 'Failed to add tenant')
    }
  }

  async function onMoveOut(id) {
    if (!confirm('This will permanently delete the tenant. Continue?')) return;

    try {
      await deleteTenant(id);
      fetchList();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'Failed to delete tenant');
    }
  }

  function onEdit(tenant) {
    // ensure room_id is numeric (TenantForm expects numbers)
    const normalized = {
      ...tenant,
      room_id: tenant.room_id === null || tenant.room_id === undefined
        ? null
        : Number(tenant.room_id)
    }
    setEditing(normalized)
    setOpen(true)
  }

  function onOpenAdd() {
    setEditing(null)
    setOpen(true)
  }

  // ---- helper to clean & format names ----
  function cleanName(raw) {
    if (!raw) return ''
    let name = String(raw).trim()

    // If first two letters are the same (case-insensitive), drop the first one
    if (name.length >= 2 && name[0].toLowerCase() === name[1].toLowerCase()) {
      name = name.slice(1)
    }

    // collapse multiple spaces, then capitalize each word nicely
    name = name.replace(/\s+/g, ' ').trim()
    return name.split(' ').map(part => {
      if (!part) return ''
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    }).join(' ')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <div className="text-gray-400">Manage all tenants and their details</div>
        </div>
        <button
          onClick={onOpenAdd}
          className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        >
          + Add New Tenant
        </button>
      </div>

      {loading && <div className="text-gray-400">Loading tenants...</div>}

      {!loading && tenants.length === 0 && (
        <Card className="p-12 text-center text-gray-400">
          No tenants yet — add your first tenant.
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map(t => {
          const displayName = cleanName(t.full_name || '')
          const avatarLetter = (displayName || 'A')[0]?.toUpperCase() || 'A'
          const roomLabel = t.room_number ? `Room ${t.room_number}` : (t.room_id ? `Room ${roomMap[t.room_id] ?? t.room_id}` : '')

          return (
            <Card key={t.id ?? t._id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg font-bold">
                  {avatarLetter}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{displayName}</div>
                      <div className="text-sm text-gray-400">{roomLabel}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-300">
                    {t.phone && <div>📞 {t.phone}</div>}
                    {t.email && <div>✉️ {t.email}</div>}
                    {(t.address || t.permanent_address) && <div>🏠 {t.address || t.permanent_address}</div>}
                    {t.join_date && <div className="text-gray-400">Joined {fmt(t.join_date)}</div>}
                  </div>

                  <div className="mt-4 border-t border-white/5 pt-4 flex gap-3">
                    <button
                      className="flex-0 px-3 py-2 rounded bg-white/5 text-gray-200 hover:bg-white/10"
                      onClick={() => onEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-0 px-3 py-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      onClick={() => onMoveOut(t.id)}
                    >
                      Move Out
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Tenant' : 'Add New Tenant'}
      >
        <TenantForm
          key={editing?.id ?? editing?._id ?? 'new'}
          initialValues={editing}
          onSubmit={async (payload) => {
            try {
              if (editing) {
                const id = editing.id || editing._id;
                if (payload.password === '') delete payload.password;
                await updateTenant(id, payload);
              } else {
                // sanitize name before sending (optional: you may also sanitize in form)
                payload.full_name = cleanName(payload.full_name)
                await createTenant(payload);
              }
              setOpen(false);
              setEditing(null);
              await fetchList();
            } catch (err) {
              console.error('Save tenant failed', err);
              alert(err?.response?.data?.message || 'Failed to save tenant');
            }
          }}
        />
      </Modal>
    </div>
  )
}
