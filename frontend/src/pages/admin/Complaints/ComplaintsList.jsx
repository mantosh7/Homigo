import Card from '@/components/ui/Card';
import { getComplaints } from '@/services/complaintService';
import { useState, useEffect } from 'react'


export default function ComplaintsList() {
  const [complaintList, setComplaintList] = useState([]);
  const loadComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaintList(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <div>
      <Card>
        <h2 className="text-xl font-semibold mb-4">Complaints</h2>

        {complaintList.length === 0 ? (
          <p className="text-gray-400">No complaints raised yet.</p>
        ) : (
          complaintList.map((c) => {
            return (
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
          )})
        )}
      </Card>
    </div>
  )
}
