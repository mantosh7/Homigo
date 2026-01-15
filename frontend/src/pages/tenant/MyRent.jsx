import { useEffect, useState, useMemo } from 'react'
import Card from '../../components/ui/Card'
import { getMyRent } from '../../services/tenantRentService'


export default function MyRent() {
    const [rent, setRent] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRent() {
            try {
                const data = await getMyRent()
                setRent(data || [])
            } catch (e) {
                console.error('Rent fetch error', e)
            } finally {
                setLoading(false)
            }
        }
        fetchRent()
    }, [])

    const current = useMemo(()=>{
        return rent.find(r=>r.status==='Pending') ;
    },[rent])

    return (
        <div className="space-y-6">

            {/* Summary cards  */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="text-sm text-gray-400">Current Rent</div>
                    <div className="text-3xl font-bold mt-4">
                        {current ? `₹ ${current.amount}` : '—'}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm text-gray-400">Due Date</div>
                    <div className="text-3xl font-bold mt-4">
                        {current?.due_date
                            ? new Date(current.due_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })
                            : '—'}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm text-gray-400">Status</div>
                    <div className={`text-3xl font-bold mt-4 ${current?.status === 'Paid'
                        ? 'text-green-400'
                        : 'text-red-400'
                        }`}>
                        {current?.status || '—'}
                    </div>
                </Card>
            </div>

            {/* Rent history */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4">My Rent History</h3>

                {loading && <div className="text-gray-400">Loading...</div>}

                {!loading && rent.length === 0 && (
                    <div className="text-gray-400">No rent records yet</div>
                )}

                {!loading && rent.length > 0 && (
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
                            {rent.map((r, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    <td className="py-2">₹ {r.amount}</td>
                                    <td className={`py-2 ${r.status === 'Paid'
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                        }`}>
                                        {r.status}
                                    </td>
                                    
                                    <td className="py-2">{r.due_date ? new Date(r.due_date).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })
                                        : ''}
                                    </td>

                                    <td className="py-2">{r.date_paid ? new Date(r.date_paid).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })
                                        : '-'}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

        </div>
    )
}
