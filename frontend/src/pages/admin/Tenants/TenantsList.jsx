// import { useEffect, useState } from 'react'
// import { getTenants, createTenant } from '../../../services/tenantService'
// import Card from '../../../components/ui/Card'
// import Modal from '../../../components/ui/Modal'
// import TenantForm from './TenantForm'

// export default function TenantsList(){
//   const [tenants, setTenants] = useState([])
//   const [open, setOpen] = useState(false)
//   useEffect(()=>{ fetch() },[])
//   async function fetch(){ const data = await getTenants(); setTenants(data || []) }
//   async function onCreate(payload){ await createTenant(payload); setOpen(false); fetch() }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">Tenants</h2>
//         <button className="bg-purple-600 px-4 py-2 rounded" onClick={()=>setOpen(true)}>+ Add New Tenant</button>
//       </div>
//       <div className="grid grid-cols-3 gap-4">
//         {tenants.length===0 && <div className="text-gray-400">No tenants yet</div>}
//         {tenants.map(t=> (
//           <Card key={t.id} className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center font-bold">{t.full_name?.[0]||'A'}</div>
//               <div>
//                 <div className="font-semibold">{t.full_name}</div>
//                 <div className="text-sm text-gray-400">{t.email}</div>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>

//       <Modal open={open} onClose={()=>setOpen(false)} title="Add New Tenant">
//         <TenantForm onSubmit={onCreate} />
//       </Modal>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
// import { getTenants, createTenant, moveoutTenant } from '../../../services/tenantService'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import TenantForm from './TenantForm'
import { getTenants, createTenant, deleteTenant } from '../../../services/tenantService';


// Date formatter function
const fmt = (d) => d ? dayjs(d).format('MMM D, YYYY') : ''

export default function TenantsList(){
  const [tenants, setTenants] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => { 
    fetchList() 
  }, [])

  async function fetchList(){
    setLoading(true)
    try{
      const data = await getTenants()
      setTenants(data || [])
    } catch(e) {
      console.error('Failed to fetch tenants', e)
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  async function onCreate(payload){
    try{
      await createTenant(payload)
      setOpen(false)
      fetchList()
    } catch(err) {
      console.error('Create tenant failed', err)
      alert(err?.response?.data?.message || 'Failed to add tenant')
    }
  }

  async function onMoveOut(id){
  if(!confirm('This will permanently delete the tenant. Continue?')) return;

  try{
    await deleteTenant(id);
    fetchList();
  } catch(e) {
    console.error(e);
    alert(e?.response?.data?.message || 'Failed to delete tenant');
  }
}



  function onEdit(tenant){
    setEditing(tenant)
    setOpen(true)
  }

  function onOpenAdd(){
    setEditing(null)
    setOpen(true)
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
        {tenants.map(t => (
          <Card key={t.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg font-bold">
                {(t.full_name || 'A')[0]?.toUpperCase() || 'A'}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{t.full_name}</div>
                    <div className="text-sm text-gray-400">
                      {t.room_number ? `Room ${t.room_number}` : (t.room_id ? `Room ${t.room_id}` : '')}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-300">
                  {t.phone && <div>📞 {t.phone}</div>}
                  {t.email && <div>✉️ {t.email}</div>}
                  {t.address && <div>🏠 {t.address}</div>}
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
        ))}
      </div>

      <Modal 
        open={open} 
        onClose={() => setOpen(false)} 
        title={editing ? 'Edit Tenant' : 'Add New Tenant'}
      >
        <TenantForm 
          onSubmit={async (payload) => {
            if(editing){
              // Optional: implement updateTenant service later
              alert('Edit not implemented yet; will implement if you want')
              setOpen(false)
              fetchList()
            } else {
              await onCreate(payload)
            }
          }} 
          initialValues={editing} 
        />
      </Modal>
    </div>
  )
}