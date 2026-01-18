import { useEffect, useState, useCallback } from 'react'
import Card from '../../components/ui/Card'
import { getRooms } from '../../services/roomService'
import { getTenants } from '../../services/tenantService'
import { getComplaints } from '../../services/complaintService'

export default function Dashboard(){
  const [rooms, setRooms] = useState([])
  const [tenants, setTenants] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async ()=>{
    setLoading(true)
    try{
      const [r, t, c] = await Promise.all([
        getRooms().catch(()=>[]),
        getTenants().catch(()=>[]),
        getComplaints().catch(()=>[])
      ])
      setRooms(r || [])
      setTenants(t || [])
      setComplaints(c || [])
    }catch(e){
      console.error('Dashboard fetch error', e)
    }finally{
      setLoading(false)
    }
  },[])

  useEffect(()=>{
    fetchAll()
  },[fetchAll])

  const totalRooms = rooms.length
  const occupied = rooms.filter(r => r.is_occupied === 1 || r.is_occupied === true || r.is_occupied === '1').length
  const vacant = totalRooms - occupied
  const totalTenants = tenants.length
  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-400">Total Seats</div>
          <div className="text-3xl font-bold mt-4">{loading? '...' : totalRooms}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-400">Occupied</div>
          <div className="text-3xl font-bold mt-4">{loading? '...' : occupied}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-400">Vacant</div>
          <div className="text-3xl font-bold mt-4">{loading? '...' : vacant}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-400">Active Tenants</div>
          <div className="text-3xl font-bold mt-4">{loading? '...' : totalTenants}</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Recent Tenants</h3>
          {loading && <div className="text-gray-400">Loading...</div>}
          {!loading && tenants.length===0 && <div className="text-gray-400">No tenants yet</div>}
          {!loading && tenants.slice(0,5).map(t=> (
            <div key={t.id} className="py-2 border-b border-white/3">{t.full_name || t.name || t.email}</div>
          ))}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Recent Complaints</h3>
          {loading && <div className="text-gray-400">Loading...</div>}
          {!loading && complaints.length===0 && <div className="text-gray-400">No complaints yet</div>}
          {!loading && complaints.slice(0,5).map(c=> (
            <div key={c.id} className="py-2 border-b border-white/3">{c.title || c.description}</div>
          ))}
        </Card>
      </div>
    </div>
  )
}
