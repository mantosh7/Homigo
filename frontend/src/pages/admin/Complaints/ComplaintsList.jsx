import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import { getComplaints, updateComplaint } from '@/services/complaintService'

export default function ComplaintsList() {

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null) // id of complaint pending confirmation

  // load on mount
  useEffect(() => {
    loadComplaints()
  }, [])

  async function loadComplaints() {
    setLoading(true)
    try {
      const data = await getComplaints()
      setComplaints(data || [])
    } catch (error) {
      console.error('Failed to load complaints', error)
    } finally {
      setLoading(false)
    }
  }

  // mark a complaint as resolved and refresh
  async function markResolved(id) {
    setBusy(true)
    setConfirmId(null)
    try {
      await updateComplaint(id, { status: 'Resolved' })
      await loadComplaints()
    } catch (error) {
      console.error('Failed to mark resolved:', error)
    } finally {
      setBusy(false)
    }
  }

  // summary stats
  const total = complaints.length
  const open = complaints.filter(c => c.status !== 'Resolved').length
  const resolved = complaints.filter(c => c.status === 'Resolved').length

  return (
    <div>

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Complaints</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track and resolve tenant complaints</p>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card title="Total" value={total} icon="📋" color="indigo" hint="All complaints" />
        <Card title="Open" value={open} icon="⚠" color="red" hint="Needs attention" />
        <Card title="Resolved" value={resolved} icon="✓" color="green" hint="Closed complaints" />
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <p className="text-gray-500 text-sm">Loading complaints...</p>
      )}

      {/* ── Empty state ── */}
      {!loading && complaints.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-16 panel rounded-xl">
          No complaints raised yet 🎉
        </div>
      )}

      {/* ── Complaints list ── */}
      <div className="space-y-3">
        {complaints.map(c => {
          const isResolved = c.status === 'Resolved'
          const isConfirming = confirmId === c.id

          return (
            <Card key={c.id} className="p-4">
              <div className="flex justify-between items-start gap-4">

                {/* Left — complaint details */}
                <div className="flex-1">

                  {/* Title + priority badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{c.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.priority === 'High'
                        ? 'bg-red-500/20 text-red-400'
                        : c.priority === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                      {c.priority}
                    </span>

                    {/* Status badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isResolved
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                      }`}>
                      {c.status || 'Open'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400">{c.description}</p>

                  {/* Tenant name if available */}
                  {c.tenant_name && (
                    <p className="text-xs text-gray-500 mt-1">By {c.tenant_name}</p>
                  )}
                </div>

                {/* Right — resolve button or inline confirm */}
                {!isResolved && (
                  <div className="flex items-center gap-2 shrink-0">
                    {isConfirming ? (
                      // inline confirmation — no browser popup
                      <>
                        <span className="text-sm text-gray-400">Mark as resolved?</span>
                        <button
                          onClick={() => markResolved(c.id)}
                          disabled={busy}
                          className="px-3 py-1.5 text-sm rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition disabled:opacity-50"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          disabled={busy}
                          className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition disabled:opacity-50"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmId(c.id)}
                        disabled={busy}
                        className="px-4 py-1.5 text-sm rounded-lg bg-[#F46A47]/15 text-[#F46A47] hover:bg-[#F46A47]/25 transition disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                )}

              </div>
            </Card>
          )
        })}
      </div>

    </div>
  )
}