import { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import { getRooms } from '../../services/roomService'
import { getTenants } from '../../services/tenantService'
import { getComplaints } from '../../services/complaintService'

export default function Dashboard() {

  const [rooms, setRooms] = useState([])
  const [tenants, setTenants] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [roomsData, tenantsData, complaintsData] = await Promise.all([
          getRooms(),
          getTenants(),
          getComplaints()
        ])

        setRooms(roomsData || [])
        setTenants(tenantsData || [])
        setComplaints(complaintsData || [])
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Total seats across all rooms
  const totalSeats = rooms.reduce((sum, room) => sum + room.capacity, 0)

  // Sum capacity of only occupied rooms
  const occupiedSeats = rooms
    .filter(room => room.is_occupied === 1 || room.is_occupied === true || room.is_occupied === '1')
    .reduce((sum, room) => sum + room.capacity, 0)

  const vacantSeats = totalSeats - occupiedSeats
  const totalTenants = tenants.length

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card
          title="Total Seats"
          value={loading ? '...' : totalSeats}
          icon="🪑"
          color="indigo"
          hint="All rooms combined"
        />
        <Card
          title="Occupied"
          value={loading ? '...' : occupiedSeats}
          icon="🔴"
          color="red"
          hint="Currently occupied"
        />
        <Card
          title="Vacant"
          value={loading ? '...' : vacantSeats}
          icon="✓"
          color="green"
          hint="Available right now"
        />
        <Card
          title="Active Tenants"
          value={loading ? '...' : totalTenants}
          icon="👤"
          color="blue"
          hint="Checked in tenants"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">

        {/* Recent Tenants */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Recent Tenants</h3>

          {loading && (
            <p className="text-gray-400 text-sm">Loading...</p>
          )}

          {!loading && tenants.length === 0 && (
            <p className="text-gray-400 text-sm">No tenants yet</p>
          )}

          {!loading && tenants.slice(0, 5).map(tenant => (
            <div key={tenant.id} className="py-2 border-b border-white/5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium">
                {(tenant.full_name || tenant.name || tenant.email || '?')[0].toUpperCase()}
              </span>
              <span className="text-sm">
                {tenant.full_name || tenant.name || tenant.email}
              </span>
            </div>
          ))}
        </Card>

        {/* Recent Complaints */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Recent Complaints</h3>

          {loading && (
            <p className="text-gray-400 text-sm">Loading...</p>
          )}

          {!loading && complaints.length === 0 && (
            <p className="text-gray-400 text-sm">No complaints yet</p>
          )}

          {!loading && complaints.slice(0, 5).map(complaint => (
            <div key={complaint.id} className="py-2 border-b border-white/5 flex justify-between items-center gap-2">

              <span className="text-sm truncate">
                {complaint.title || complaint.description}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${complaint.priority === 'High'
                  ? 'bg-red-500/20 text-red-400'
                  : complaint.priority === 'Medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                  }`}>
                  {complaint.priority || 'Low'}
                </span>

                <span className={`text-xs px-2 py-0.5 rounded-full ${complaint.status === 'Resolved'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-orange-500/20 text-orange-400'
                  }`}>
                  {complaint.status || 'Open'}
                </span>
              </div>

            </div>
          ))}
        </Card>

      </div>
    </div>
  )
}