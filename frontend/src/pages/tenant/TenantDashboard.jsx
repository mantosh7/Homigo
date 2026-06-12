import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import { getMyRent } from '@/services/tenantRentService'
import { getMyComplaints } from '@/services/tenantComplaintService'
import dayjs from 'dayjs'

export default function TenantDashboard() {

  const [rent, setRent]           = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]     = useState(true)

  // load rent and complaints on mount
  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const rentData      = await getMyRent()
      const complaintData = await getMyComplaints()
      setRent(rentData       || [])
      setComplaints(complaintData || [])
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  // format date nicely — e.g. "19 Jun 2026"
  function fmt(date) {
    return date ? dayjs(date).format('DD MMM YYYY') : '—'
  }

  // derived values
  const pendingRent      = rent.find(r => r.status === 'Pending') || null
  const recentRents      = rent.slice(0, 3)
  const recentComplaints = complaints.slice(0, 3)
  const openComplaints   = complaints.filter(c => c.status !== 'Resolved').length

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading...</p>
  }

  return (
    <div className="space-y-6">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          title="Pending Rent"
          value={pendingRent ? `₹${Number(pendingRent.amount).toLocaleString('en-IN')}` : '—'}
          icon="💰"
          color={pendingRent ? 'red' : 'green'}
          hint={pendingRent ? 'Due this month' : 'No pending rent'}
        />
        <Card
          title="Due Date"
          value={pendingRent ? fmt(pendingRent.due_date) : '—'}
          icon="📅"
          color="yellow"
          hint={pendingRent ? 'Pay before due date' : 'All clear'}
        />
        <Card
          title="Open Complaints"
          value={openComplaints}
          icon="📢"
          color={openComplaints > 0 ? 'red' : 'green'}
          hint={openComplaints > 0 ? 'Awaiting resolution' : 'All resolved'}
        />
      </div>

      {/* ── Rent history + Complaints ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Rent history table */}
        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">My Rent History</h3>

          {recentRents.length === 0 ? (
            <p className="text-gray-400 text-sm">No rent history found.</p>
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
                {recentRents.map((r, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 text-white">₹{Number(r.amount).toLocaleString('en-IN')}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === 'Paid'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-400">{fmt(r.due_date)}</td>
                    <td className="py-2 text-gray-400">{fmt(r.date_paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Recent complaints */}
        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">My Complaints</h3>

          {recentComplaints.length === 0 ? (
            <p className="text-gray-400 text-sm">No complaints raised yet.</p>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map(c => (
                <div key={c.id} className="border-b border-white/5 pb-3">

                  {/* Title + status */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-white text-sm">{c.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === 'Resolved'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {c.status || 'Open'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">{c.description}</p>

                  {/* Priority badge */}
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                    c.priority === 'High'
                      ? 'bg-red-500/20 text-red-400'
                      : c.priority === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {c.priority}
                  </span>

                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}