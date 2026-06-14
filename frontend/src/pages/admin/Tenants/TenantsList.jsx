import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import TenantForm from './TenantForm'
import { getTenants, createTenant, deleteTenant, updateTenant, resendInvite } from '../../../services/tenantService'
import { getRooms } from '../../../services/roomService'

const fmt = (d) => d ? dayjs(d).format('MMM D, YYYY') : ''

export default function TenantsList() {

  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)  // null = add mode, object = edit mode
  const [opLoading, setOpLoading] = useState(false) // for save/delete operations

  // load everything on mount
  useEffect(() => {
    loadAll()
  }, [])

  // fetch tenants and rooms together
  async function loadAll() {
    setLoading(true)
    try {
      const tenantsData = await getTenants()
      const roomsData = await getRooms()
      setTenants(tenantsData || [])
      setRooms(roomsData || [])
    } catch (e) {
      console.error('Failed to load data', e)
    } finally {
      setLoading(false)
    }
  }

  // delete tenant and refresh list
  async function onMoveOut(id) {
    if (!confirm('This will permanently delete the tenant. Continue?')) return
    setOpLoading(true)
    try {
      await deleteTenant(id)
      await loadAll()
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete tenant')
    } finally {
      setOpLoading(false)
    }
  }

  // Resend invite 
  async function onResendInvite(id) {
    setOpLoading(true)
    try {
      await resendInvite(id)
      alert('Invite resent successfully!')
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to resend invite')
    } finally {
      setOpLoading(false)
    }
  }

  // open modal in edit mode with tenant data prefilled
  function onEdit(tenant) {
    setEditing({
      ...tenant,
      room_id: tenant.room_id == null ? null : Number(tenant.room_id)
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

  // called by TenantForm on submit — handles both create and update
  async function handleSave(payload) {
    setOpLoading(true)
    try {
      if (editing) {
        const id = editing.id || editing._id
        if (payload.password === '') delete payload.password
        await updateTenant(id, payload)
      } else {
        await createTenant(payload)
      }
      closeModal()
      await loadAll()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save tenant')
    } finally {
      setOpLoading(false)
    }
  }

  // get room label for a tenant — e.g. "Room 101"
  function getRoomLabel(tenant) {
    if (tenant.room_number) return `Room ${tenant.room_number}`
    if (tenant.room_id) {
      const room = rooms.find(r => r.id === tenant.room_id)
      return room ? `Room ${room.room_number}` : `Room ${tenant.room_id}`
    }
    return 'No room assigned'
  }

  // summary stats for the top cards
  const totalTenants = tenants.length
  const occupiedRooms = new Set(tenants.map(t => t.room_id).filter(Boolean)).size
  const unassigned = tenants.filter(t => !t.room_id).length

  return (
    <div>

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Tenant Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all tenants and their details</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={opLoading}
          className="px-4 py-2 rounded-lg bg-gradient-to-b from-[#F46A47] to-[#E85A3C] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          + Add New Tenant
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card title="Total Tenants" value={totalTenants} icon="👥" color="indigo" hint="Currently registered" />
        <Card title="Rooms Occupied" value={occupiedRooms} icon="🏠" color="blue" hint="Rooms with tenants" />
        <Card title="Unassigned" value={unassigned} icon="!" color="yellow" hint="No room assigned" />
      </div>

      {/*  Loading indicator */}
      {(loading || opLoading) && (
        <p className="text-gray-500 text-sm mb-4">Loading...</p>
      )}

      {/*  Empty state  */}
      {!loading && tenants.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-16 panel rounded-xl">
          No tenants yet — click "Add New Tenant" to get started.
        </div>
      )}

      {/*  Tenant cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map(t => {
          const avatarLetter = (t.full_name || 'A')[0].toUpperCase()
          const invitePending = t.invite_pending === 1

          return (
            <Card key={t.id ?? t._id} className="p-5">

              {/* Avatar + name + room */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F46A47] to-[#ffb45e] text-white flex items-center justify-center text-base font-bold shrink-0">
                  {avatarLetter}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.full_name}</div>
                  <div className="text-xs text-gray-400">{getRoomLabel(t)}</div>
                </div>
              </div>

              {/* Contact and address details */}
              <div className="space-y-1.5 text-sm text-gray-400 mb-4">
                {t.phone && (
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span>{t.phone}</span>
                  </div>
                )}
                {t.email && (
                  <div className="flex items-center gap-2">
                    <span>✉</span>
                    <span className="truncate">{t.email}</span>
                  </div>
                )}
                {(t.permanent_address || t.address) && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">📍</span>
                    <span className="leading-snug">{t.permanent_address || t.address}</span>
                  </div>
                )}
                {t.join_date && (
                  <div className="text-xs text-gray-500 pt-1">
                    Joined {fmt(t.join_date)}
                  </div>
                )}
              </div>

              {/* Edit / Move out buttons */}
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => onEdit(t)}
                  disabled={opLoading}
                  className="flex-1 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-300 disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  onClick={() => onMoveOut(t.id)}
                  disabled={opLoading}
                  className="flex-1 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 transition text-red-400 disabled:opacity-50"
                >
                  Move Out
                </button>

                {/*  Resend invite  */}
                {invitePending && (
                  <button
                    onClick={() => onResendInvite(t.id)}
                    disabled={opLoading}
                    className="flex-1 py-1.5 text-xs rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition text-yellow-400 disabled:opacity-50"
                  >
                    Resend Invite
                  </button>
                )}

              </div>

            </Card>
          )
        })}
      </div>

      {/* ── Add / Edit modal ── */}
      <Modal
        open={open}
        onClose={closeModal}
        title={editing ? 'Edit Tenant' : 'Add New Tenant'}
      >
        <TenantForm
          key={editing?.id ?? editing?._id ?? 'new'}
          initialValues={editing}
          onSubmit={handleSave}
        />
      </Modal>

    </div>
  )
}