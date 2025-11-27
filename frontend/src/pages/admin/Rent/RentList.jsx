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
  const [editing, setEditing] = useState(null) // not used for edit (backend has no update), kept for future

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [p, t] = await Promise.all([
        getPending().catch(() => []),
        getTenants().catch(() => [])
      ])
      // defensive: ensure arrays
      setPending(p || [])
      setTenants(t || [])
      // helpful debug: uncomment if you need to inspect response shapes
      // console.log('pending rents:', p)
      // console.log('tenants:', t)
    } catch (err) {
      console.error('Failed to load rents/tenants', err)
      setPending([])
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  async function addRent(data) {
    setBusy(true)
    try {
      await createRent(data)
      setOpen(false)
      await load()
    } catch (err) {
      console.error('createRent failed', err)
      alert(err?.message || 'Failed to create rent')
    } finally {
      setBusy(false)
    }
  }

  async function markPaid(id) {
    if (!confirm('Mark this rent as paid?')) return
    setBusy(true)
    try {
      await payRent(id)
      await load()
    } catch (err) {
      console.error('payRent failed', err)
      alert(err?.message || 'Failed to mark paid')
    } finally {
      setBusy(false)
    }
  }

  function tenantName(id) {
    // robust lookup for id or _id and number/string mismatch
    if (!id) return 'Unknown'
    const idStr = String(id)
    const t = tenants.find(x => String(x.id ?? x._id) === idStr)
    return t ? t.full_name : 'Unknown'
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Rent Management</h2>
        <button
          className="bg-purple-600 px-4 py-2 rounded"
          onClick={() => { setEditing(null); setOpen(true) }}
          disabled={busy}
        >
          + Add Rent
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-400">Loading pending rents...</div>
        ) : pending.length === 0 ? (
          <div className="text-gray-400">No pending rents</div>
        ) : (
          pending.map(r => (
            <Card key={r.id ?? r._id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{tenantName(r.tenant_id)}</div>
                <div className="text-gray-400 text-sm">₹{r.amount}</div>
                <div className="text-gray-400 text-sm">Due: {r.due_date ? dayjs(r.due_date).format('DD MMM YYYY') : 'N/A'}</div>
              </div>

              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => markPaid(r.id ?? r._id)}
                  disabled={busy}
                >
                  Mark Paid
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Rent">
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
