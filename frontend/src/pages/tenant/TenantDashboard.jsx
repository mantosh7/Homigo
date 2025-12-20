import Card from '../../components/ui/Card'

export default function TenantDashboard(){
  return (
    <div className="space-y-6">

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-400">Current Rent</div>
          <div className="text-3xl font-bold mt-4">₹ —</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-400">Due Date</div>
          <div className="text-3xl font-bold mt-4">—</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-400">Complaint Status</div>
          <div className="text-3xl font-bold mt-4">—</div>
        </Card>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">My Rent History</h3>
          <div className="text-gray-400">No records yet</div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">My Complaints</h3>
          <div className="text-gray-400">No complaints yet</div>
        </Card>
      </div>

    </div>
  )
}
