import { useEffect, useState } from 'react'
import { getAnalyticsSummary, getMonthlyTrend } from '@/services/analyticsService'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import Card from '../../components/ui/Card'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ──── Progress Bar Row ──────
function ProgressRow({ label, pct, color, detail }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{label}</span>
                <span className="text-gray-500">{detail}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    )
}

// ─── Bar Chart Tooltip ──────
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-[#0f1626] border border-white/10 rounded-xl px-3 py-2 text-sm">
            <div className="text-gray-400 mb-1">{label}</div>
            <div className="text-white font-semibold">₹{Number(payload[0].value).toLocaleString('en-IN')}</div>
        </div>
    )
}

// ────── Main Component ──────────────
export default function AdminAnalytics() {
    const [summary, setSummary] = useState(null)
    const [monthlyTrend, setMonthlyTrend] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadAnalytics()
    }, [])

    async function loadAnalytics() {
        try {
            const summaryData = await getAnalyticsSummary()
            const trendData = await getMonthlyTrend()
            setSummary(summaryData)
            setMonthlyTrend(trendData)
        } catch (err) {
            setError('Failed to load analytics. Please try again.')
            console.error('Analytics error:', err)
        } finally {
            setLoading(false)
        }
    }

    // ───── Derived values ──────────
    const totalCollected = Number(summary?.totalCollected ?? 0)
    const totalPending = Number(summary?.totalPending ?? 0)
    const paidCount = summary?.paidCount ?? 0
    const pendingCount = summary?.pendingCount ?? 0
    const totalTenants = paidCount + pendingCount
    const totalRent = totalCollected + totalPending

    const rentPct = totalRent > 0 ? Math.round((totalCollected / totalRent) * 100) : 100
    const tenantPct = totalTenants > 0 ? Math.round((paidCount / totalTenants) * 100) : 0
    const pendingPct = totalTenants > 0 ? Math.round((pendingCount / totalTenants) * 100) : 0

    const chartData = monthlyTrend.map(item => ({
        month: MONTH_NAMES[item.month - 1],
        total: Number(item.total),
    }))

    const monthLabel = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

    // ────── Loading state ───────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-60 text-gray-500 text-sm gap-2">
                <span className="animate-spin">⟳</span> Loading analytics…
            </div>
        )
    }

    // ────── Error state ───────
    if (error) {
        return (
            <div className="max-w-sm mx-auto mt-10 text-center bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
                <div className="text-2xl mb-2">⚠</div>
                <div className="text-sm">{error}</div>
            </div>
        )
    }

    // ────── Main Render ───────
    return (
        <div className="p-8 max-w-6xl">

            {/* Header */}
            <div className="mb-7">
                <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">{monthLabel} · Rent collection overview</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <Card title="Total Collected" value={`₹${totalCollected.toLocaleString('en-IN')}`} icon="↓" color="green" hint="Received this month" />
                <Card title="Pending Amount" value={`₹${totalPending.toLocaleString('en-IN')}`} icon="⏳" color="yellow" hint="Outstanding balance" />
                <Card title="Paid Tenants" value={paidCount} icon="✓" color="blue" hint={`of ${totalTenants} total tenants`} />
                <Card title="Unpaid Tenants" value={pendingCount} icon="!" color="red" hint={pendingCount === 0 ? 'All clear 🎉' : 'Follow up needed'} />
            </div>

            {/* Progress + Chart */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="p-5">
                    {/* Progress Panel */}
                    <div className="text-sm font-semibold text-white mb-4">Collection progress</div>
                    <ProgressRow label="Rent collected" pct={rentPct} color="#22c55e" detail={`₹${totalCollected.toLocaleString('en-IN')} / ₹${totalRent.toLocaleString('en-IN')}`} />
                    <ProgressRow label="Tenant compliance" pct={tenantPct} color="#3b82f6" detail={`${paidCount} of ${totalTenants} paid`} />
                    <ProgressRow
                        label="Pending clearance"
                        pct={pendingCount === 0 ? 100 : pendingPct}
                        color={pendingCount === 0 ? '#22c55e' : '#ef4444'}
                        detail={pendingCount === 0 ? 'All clear' : `${pendingCount} pending`}
                    />
                </Card>

                {/* Monthly Bar Chart */}
                <Card className="p-5 col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm font-semibold text-white">Monthly rent collection</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#F46A47] inline-block" />
                            Collected
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barSize={28}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                                tickFormatter={v => v === 0 ? '0' : `₹${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.total > 0 ? '#F46A47' : 'rgba(244,106,71,0.15)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    )
}