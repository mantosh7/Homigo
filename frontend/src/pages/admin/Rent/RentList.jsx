import { useEffect, useState } from 'react'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import RentForm from './RentForm'
import { createRent, getPending, payRent } from '../../../services/rentService'
import { getTenants } from '../../../services/tenantService'
import dayjs from 'dayjs'

export default function RentList() {

  const [pending, setPending] = useState([])
  const [tenants, setTenants] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null) // id of rent pending confirmation

  // load on mount
  useEffect(() => {
    load()
  }, [])

  // fetch pending rents and tenant list together
  async function load() {
    setLoading(true)
    try {
      const pendingRents = await getPending()
      const tenantList = await getTenants()
      setPending(pendingRents || [])
      setTenants(tenantList || [])
    } catch (error) {
      console.error('Failed to load data', error)
    } finally {
      setLoading(false)
    }
  }

  // create a new rent record and refresh list
  async function addRent(data) {
    setBusy(true)
    try {
      await createRent(data)
      setOpen(false)
      await load()
    } catch (error) {
      alert(error?.message || 'Failed to create rent')
    } finally {
      setBusy(false)
    }
  }

  // mark a pending rent as paid and refresh
  async function markPaid(id) {
    setBusy(true)
    setConfirmId(null)
    try {
      await payRent(id)
      await load()
    } catch (error) {
      alert(error?.message || 'Failed to mark paid')
    } finally {
      setBusy(false)
    }
  }

  // get tenant name from id
  function tenantName(id) {
    if (!id) return 'Unknown'
    const tenant = tenants.find(t => String(t.id ?? t._id) === String(id))
    return tenant ? tenant.full_name : 'Unknown'
  }

  // check if due date has passed
  function isOverdue(due_date) {
    return due_date && dayjs(due_date).isBefore(dayjs(), 'day')
  }

  // summary stats
  const totalPending = pending.length
  const totalAmount = pending.reduce((sum, r) => sum + Number(r.amount), 0)
  const overdueCount = pending.filter(r => isOverdue(r.due_date)).length

  return (
    <div>

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Rent Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track and collect pending rents</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-gradient-to-b from-[#F46A47] to-[#E85A3C] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          + Add Rent
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card title="Pending Rents" value={totalPending} icon="📋" color="indigo" hint="Awaiting payment" />
        <Card title="Total Due" value={`₹${totalAmount.toLocaleString('en-IN')}`} icon="💰" color="yellow" hint="Combined pending amount" />
        <Card title="Overdue" value={overdueCount} icon="⚠" color="red" hint="Past due date" />
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <p className="text-gray-500 text-sm">Loading pending rents...</p>
      )}

      {/* ── Empty state ── */}
      {!loading && pending.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-16 panel rounded-xl">
          No pending rents — all caught up! 🎉
        </div>
      )}

      {/* ── Pending rent cards ── */}
      <div className="space-y-3">
        {pending.map(rent => {
          const overdue = isOverdue(rent.due_date)
          const avatarLetter = tenantName(rent.tenant_id)[0]?.toUpperCase() || '?'
          const rentId = rent.id ?? rent._id
          const isConfirming = confirmId === rentId

          return (
            <Card key={rentId} className="p-4">
              <div className="flex justify-between items-center">

                {/* Left — tenant info + rent details */}
                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F46A47] to-[#ffb45e] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {avatarLetter}
                  </div>

                  {/* Name, amount, due date */}
                  <div>
                    <div className="font-semibold text-white">
                      {tenantName(rent.tenant_id)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                      <span>₹{Number(rent.amount).toLocaleString('en-IN')}</span>
                      <span className={overdue ? 'text-red-400' : 'text-gray-400'}>
                        Due: {rent.due_date ? dayjs(rent.due_date).format('DD MMM YYYY') : 'N/A'}
                        {overdue && ' · Overdue'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right — confirm inline or mark paid button */}
                <div className="flex items-center gap-2">
                  {isConfirming ? (
                    // inline confirmation — no ugly browser popup
                    <>
                      <span className="text-sm text-gray-400">Mark as paid?</span>
                      <button
                        onClick={() => markPaid(rentId)}
                        disabled={busy}
                        className="px-3 py-1.5 text-sm rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition disabled:opacity-50"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        disabled={busy}
                        className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition disabled:opacity-50"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmId(rentId)}
                      disabled={busy}
                      className="px-4 py-1.5 text-sm rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition disabled:opacity-50"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>

              </div>
            </Card>
          )
        })}
      </div>

      {/* ── Add rent modal ── */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Rent"
      >
        <RentForm
          initialValues={null}
          tenants={tenants}
          onSubmit={addRent}
          disabled={busy}
        />
      </Modal>

    </div>
  )
}