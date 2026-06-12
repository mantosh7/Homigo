import { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import { getMyRent } from '../../services/tenantRentService'
import dayjs from 'dayjs'

export default function MyRent() {

  const [rent, setRent]       = useState([])
  const [loading, setLoading] = useState(true)

  // load rent records on mount
  useEffect(() => {
    async function fetchRent() {
      try {
        const data = await getMyRent()
        setRent(data || [])
      } catch (e) {
        console.error('Rent fetch error', e)
      } finally {
        setLoading(false)
      }
    }
    fetchRent()
  }, [])

  // format date nicely — e.g. "19 Jun 2026"
  function fmt(date) {
    return date ? dayjs(date).format('DD MMM YYYY') : '—'
  }

  // current pending rent — first pending record
  const current = rent.find(r => r.status === 'Pending') || null

  // summary stats
  const totalPaid    = rent.filter(r => r.status === 'Paid').length
  const totalPending = rent.filter(r => r.status === 'Pending').length

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading...</p>
  }

  return (
    <div className="space-y-6">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          title="Current Rent"
          value={current ? `₹${Number(current.amount).toLocaleString('en-IN')}` : '—'}
          icon="💰"
          color={current ? 'red' : 'green'}
          hint={current ? 'Pending payment' : 'No pending rent'}
        />
        <Card
          title="Due Date"
          value={fmt(current?.due_date)}
          icon="📅"
          color="yellow"
          hint={current ? 'Pay before due date' : 'All clear'}
        />
        <Card
          title="Paid This Year"
          value={totalPaid}
          icon="✓"
          color="green"
          hint={`${totalPending} pending`}
        />
      </div>

      {/* ── Full rent history table ── */}
      <Card className="p-5">
        <h3 className="font-semibold text-white mb-4">My Rent History</h3>

        {rent.length === 0 ? (
          <p className="text-gray-400 text-sm">No rent records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/10">
                <th className="text-left py-2 font-medium">Amount</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Due Date</th>
                <th className="text-left py-2 font-medium">Paid On</th>
              </tr>
            </thead>
            <tbody>
              {rent.map((r, i) => (
                <tr key={i} className="border-b border-white/5">

                  {/* Amount */}
                  <td className="py-2 text-white">
                    ₹{Number(r.amount).toLocaleString('en-IN')}
                  </td>

                  {/* Status badge */}
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === 'Paid'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  {/* Due date */}
                  <td className="py-2 text-gray-400">{fmt(r.due_date)}</td>

                  {/* Paid on date */}
                  <td className="py-2 text-gray-400">{fmt(r.date_paid)}</td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

    </div>
  )
}