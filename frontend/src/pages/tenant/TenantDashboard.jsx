import Card from '../../components/ui/Card'
import { getMyRent } from '@/services/tenantRentService'
import { getMyComplaints } from '@/services/tenantComplaintService'
import { useState, useEffect } from 'react'

export default function TenantDashboard() {
  const [rent, setRent] = useState([])
  const [complaint, setcomplaint] = useState([]);

  const fetchRent = async () => {
    try {
      const data = await getMyRent();
      setRent(data || [])
    } catch (error) {
      console.log("Failed during fetching rent", error)
    }
  }

  const fetchComplaint = async () => {
    try {
      const data = await getMyComplaints();
      setcomplaint(data || []);
    } catch (error) {
      console.log("failed complaint fetch from tenant: ", error);
    }
  }
  useEffect(() => {
    fetchRent();
    fetchComplaint();
  }, []);

  const pendingRent = rent.find(r => r.status === 'Pending') || null;
  const pendingcomplaint = complaint.find(c => c.status === 'Pending') || null;
  const latestFiveRents = rent.slice(0, 3) || null;
  const latestFiveComplaints = complaint.slice(0, 3) || null;

  return (
    <div className="space-y-6">

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-400">Rent</div>
          <div className="text-3xl font-bold mt-4">{pendingRent ? `₹ ${pendingRent.amount}` : '—'}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-400">Due Date</div>
          <div className="text-3xl font-bold mt-4">{pendingRent ? new Date(pendingRent.due_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : '—'}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-400">Complaint Status</div>
          <div className="text-3xl text-red-400 font-bold mt-4">{pendingcomplaint ? pendingcomplaint.status : '—'}</div>
        </Card>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">My Rent History</h3>

          {latestFiveRents.length === 0 ? (
            <div className="text-gray-400">No rent history found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-left py-2">Paid Date</th>
                </tr>
              </thead>

              <tbody>
                {latestFiveRents.map((r, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2">₹ {r.amount}</td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2">{new Date(r.due_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}</td>
                    <td className="py-2">{new Date(r.due_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">My Complaints</h3>
          {latestFiveComplaints.length === 0 ? (
            <p className="text-gray-400">No complaints raised yet.</p>
          ) : (
            latestFiveComplaints.map((c) => (
              <div key={c.id} className="border-b py-3">
                <div className="flex justify-between">
                  <p className="font-medium">{c.title}</p>
                  <span
                    className={`text-sm ${c.status === "Resolved"
                        ? "text-green-400"
                        : "text-red-400"
                      }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-sm text-gray-400">{c.description}</p>

                <p className="text-xs text-gray-500 mt-1">
                  Priority: {c.priority}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>

    </div>
  )
}
