import { useEffect, useState } from "react";
import { getMyComplaints, addComplaint } from "../../services/tenantComplaintService";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [loading, setLoading] = useState(false);

  const loadComplaints = async () => {
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addComplaint({ title, description, priority });
      setTitle("");
      setDescription("");
      setPriority("Normal");
      loadComplaints();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= Raise Complaint ================= */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Raise a Complaint</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Complaint title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full p-2 bg-transparent border rounded"
            placeholder="Describe your issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full p-2 bg-transparent border rounded"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>

          <button
            disabled={loading}
            className="bg-orange-500 px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </Card>

      {/* ================= Complaint List ================= */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">My Complaints</h2>

        {complaints.length === 0 ? (
          <p className="text-gray-400">No complaints raised yet.</p>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="border-b py-3">
              <div className="flex justify-between">
                <p className="font-medium">{c.title}</p>
                <span
                  className={`text-sm ${
                    c.status === "Resolved"
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
  );
};

export default Complaints;
