import { useEffect, useState, useMemo } from 'react'
import dayjs from 'dayjs'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import TenantForm from './TenantForm'
import { getTenants, createTenant, deleteTenant, updateTenant } from '../../../services/tenantService';
import { getRooms } from '../../../services/roomService'

const fmt = (d) => d ? dayjs(d).format('MMM D, YYYY') : ''

export default function TenantsList() {
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [opLoading, setOpLoading] = useState(false)

  // map room id -> room_number
  const roomMap = useMemo(() => {
    const m = {}
    rooms.forEach(r => { m[r.id] = r.room_number })
    return m
  }, [rooms])

  // on mount: fetch tenants then rooms (simple sequential awaits)
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        await fetchList()
        await fetchRooms()
      } finally {
        setLoading(false)
      }
    }
    load()
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
    try {
      const data = await getTenants()
      setTenants(data || [])
    } catch (e) {
      console.error('Failed to fetch tenants', e)
      setTenants([])
    }
  }

  // delete tenant -> refresh tenants then rooms
  async function onMoveOut(id) {
    if (!confirm('This will permanently delete the tenant. Continue?')) return;
    setOpLoading(true)
    try {
      await deleteTenant(id)
      await fetchList()
      await fetchRooms()
    } catch (e) {
      console.error(e)
      alert(e?.response?.data?.message || 'Failed to delete tenant')
    } finally {
      setOpLoading(false)
    }
  }

  function onEdit(tenant) {
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

  // save handler used by TenantForm (create or update)
  async function handleSaveFromForm(payload) {
    setOpLoading(true)
    try {
      if (editing) {
        const id = editing.id || editing._id
        if (payload.password === '') delete payload.password
        await updateTenant(id, payload)
      } else {
        payload.full_name = cleanName(payload.full_name)
        await createTenant(payload)
      }

      setOpen(false)
      setEditing(null)
      await fetchList()
      await fetchRooms()
    } catch (err) {
      console.error('Save tenant failed', err)
      alert(err?.response?.data?.message || 'Failed to save tenant')
    } finally {
      setOpLoading(false)
    }
  }

  // name cleanup helper
  function cleanName(raw) {
    if (!raw) return ''
    let name = String(raw).trim()
    if (name.length >= 2 && name[0].toLowerCase() === name[1].toLowerCase()) {
      name = name.slice(1)
    }
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
          className="px-4 py-2 rounded bg-gradient-to-b from-[#F46A47] to-[#E85A3C] text-white"
        >
          + Add New Tenant
        </button>
      </div>

      {(loading || opLoading) && <div className="text-gray-400">Loading...</div>}

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
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F46A47] to-[#ffb45e] text-white flex items-center justify-center text-lg font-bold">
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
                    {t.email && <div>【✉】 {t.email}</div>}
                    {(t.address || t.permanent_address) && <div>🏠 {t.address || t.permanent_address}</div>}
                    {t.join_date && <div className="text-gray-400">Joined {fmt(t.join_date)}</div>}
                  </div>

                  <div className="mt-4  flex gap-3">
                    <button
                      className=" px-3 rounded bg-white/5 text-gray-200 hover:bg-white/10"
                      onClick={() => onEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      className=" px-3 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
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
          onSubmit={handleSaveFromForm}
        />
      </Modal>
    </div>
  )
}
