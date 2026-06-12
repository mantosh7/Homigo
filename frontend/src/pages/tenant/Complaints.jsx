import { useEffect, useState } from 'react'
import { getMyComplaints, addComplaint } from '../../services/tenantComplaintService'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'

export default function Complaints() {

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)

  // form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')

  // load complaints on mount
  useEffect(() => {
    loadComplaints()
  }, [])

  async function loadComplaints() {
    try {
      const data = await getMyComplaints()
      setComplaints(data || [])
    } catch (err) {
      console.error('Failed to load complaints', err)
    }
  }

  // submit new complaint and refresh list
  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { alert('Please enter a title'); return }
    if (!description.trim()) { alert('Please describe your issue'); return }

    setLoading(true)
    try {
      await addComplaint({ title, description, priority })

      // reset form
      setTitle('')
      setDescription('')
      setPriority('Normal')

      await loadComplaints()
    } catch (err) {
      console.error('Failed to submit complaint', err)
    } finally {
      setLoading(false)
    }
  }

  // summary stats
  const openCount = complaints.filter(c => c.status !== 'Resolved').length
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length

  return (
    <div className="space-y-6">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Open" value={openCount} icon="⚠" color="red" hint="Awaiting resolution" />
        <Card title="Resolved" value={resolvedCount} icon="✓" color="green" hint="Closed complaints" />
      </div>

      {/* ── Raise a complaint form ── */}
      <Card className="p-5">
        <h2 className="font-semibold text-white mb-4">Raise a Complaint</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <Input
            label="Title"
            placeholder="e.g. Water leakage in room"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Describe your issue in detail..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                         placeholder-gray-500 focus:outline-none focus:border-[#F46A47] resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                         focus:outline-none focus:border-[#F46A47] [color-scheme:dark]"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#F46A47] to-[#E85A3C] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>

        </form>
      </Card>

      {/* ── My complaints list ── */}
      <Card className="p-5">
        <h2 className="font-semibold text-white mb-4">My Complaints</h2>

        {complaints.length === 0 ? (
          <p className="text-gray-400 text-sm">No complaints raised yet.</p>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <div key={c.id} className="border-b border-white/5 pb-3">

                {/* Title + status badge */}
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-white text-sm">{c.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'Resolved'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-orange-500/20 text-orange-400'
                    }`}>
                    {c.status || 'Open'}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-1.5">{c.description}</p>

                {/* Priority badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.priority === 'High'
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
  )
}