import { useEffect, useState } from 'react'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import RentForm from './RentForm'
import { createRent, getPending, payRent } from '../../../services/rentService'
import { getTenants } from '../../../services/tenantService'
import dayjs from 'dayjs'

export default function RentList() {

  // states
  const [pending, setPending] = useState([])
  const [tenants, setTenants] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  // Initial load
  useEffect(() => {
    load()
  }, [])

  // Data loading
  async function load() {
    setLoading(true)
    try {
      const pendingRents = await getPending()
      const tenantList = await getTenants()

      setPending(pendingRents || [])
      setTenants(tenantList || [])
    } catch (error) {
      console.error('Failed to load data', error)
      setPending([])
      setTenants([])
    } finally {
      setLoading(false)
    }
  }


  // Actions
  async function addRent(data) {
    setBusy(true)

    try {
      await createRent(data)
      setOpen(false)
      await load()
    } catch (error) {
      console.error('createRent failed', error)
      alert(error?.message || 'Failed to create rent')
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
    } catch (error) {
      console.error('payRent failed', error)
      alert(error?.message || 'Failed to mark paid')
    } finally {
      setBusy(false)
    }
  }

  // Helpers
  function tenantName(id) {
    if (!id) return 'Unknown'

    const idStr = String(id)
    const tenant = tenants.find(
      t => String(t.id ?? t._id) === idStr
    )

    return tenant ? tenant.full_name : 'Unknown'
  }

  // UI
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Rent Management</h2>

        <button
          className="bg-gradient-to-b from-[#F46A47] to-[#E85A3C] px-4 py-2 rounded"
          onClick={() => {
            // setEditing(null)
            setOpen(true)
          }}
          disabled={busy}
        >
          + Add Rent
        </button>
      </div>

      {/* Pending rents */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-400">Loading pending rents...</div>
        ) : pending.length === 0 ? (
          <div className="text-gray-400">No pending rents</div>
        ) : (
          pending.map(rent => (
            <Card
              key={rent.id ?? rent._id}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">
                  {tenantName(rent.tenant_id)}
                </div>

                <div className="text-gray-400 text-sm">
                  ₹{rent.amount}
                </div>

                <div className="text-gray-400 text-sm">
                  Due:{' '}
                  {rent.due_date
                    ? dayjs(rent.due_date).format('DD MMM YYYY')
                    : 'N/A'}
                </div>
              </div>

              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={() => markPaid(rent.id ?? rent._id)}
                disabled={busy}
              >
                Mark Paid
              </button>
            </Card>
          ))
        )}
      </div>

      {/* Add rent modal */}
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
