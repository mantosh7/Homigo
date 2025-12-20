import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuth from '@/hooks/useAuth'

function LinkItem({ to, children }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg 
        ${isActive
                    ? 'bg-[#F46A47] text-white'
                    : 'text-gray-300 hover:bg-[#ff7b55]/20'
                }`
            }
        >
            {children}
        </NavLink>
    )
}

export default function TenantSidebar() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { setUser } = useAuth()

    async function handleLogout() {
        setLoading(true)
        try {
            await fetch('/auth/tenant/logout', {
                method: 'POST',
                credentials: 'include'
            })
            setUser(null)
            navigate('/tenant/login')
        } finally {
            setLoading(false)
        }
    }


    return (
        <aside className="w-64 h-screen sticky top-0 p-6 
                      bg-gradient-to-b from-[#071026] to-[#06101a] 
                      flex flex-col justify-between">

            <div>
                <div className="mb-8">
                    <div className="text-2xl font-bold text-[#F46A47]">PG Manager</div>
                    <div className="text-xs text-gray-400">Tenant Panel</div>
                </div>

                <nav className="space-y-2">
                    <LinkItem to="/tenant/dashboard">Dashboard</LinkItem>
                    <LinkItem to="/tenant/rent">My Rent</LinkItem>
                    <LinkItem to="/tenant/complaints">Complaints</LinkItem>
                </nav>
            </div>

            <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full px-4 py-3 text-sm 
                   bg-[#F46A47] text-white rounded-lg
                   hover:bg-[#D95738] transition"
            >
                {loading ? 'Logging out...' : 'Logout'}
            </button>
        </aside>
    )
}
