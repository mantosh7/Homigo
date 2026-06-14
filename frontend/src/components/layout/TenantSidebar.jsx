import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuth from '@/hooks/useAuth'

const navLinks = [
    { to: '/tenant/dashboard', label: 'Dashboard' },
    { to: '/tenant/rent', label: 'My Rent' },
    { to: '/tenant/complaints', label: 'Complaints' },
    { to: '/tenant/profile', label: 'Profile' },
]

function NavItem({ to, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 ${isActive
                    ? 'bg-[#F46A47] text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
            }
        >
            {label}
        </NavLink>
    )
}

export default function TenantSidebar() {
    const navigate = useNavigate()
    const [loggingOut, setLoggingOut] = useState(false)
    const { setUser } = useAuth()

    async function handleLogout() {
        setLoggingOut(true)
        try {
            await fetch('/auth/tenant/logout', {
                method: 'POST',
                credentials: 'include'
            })
            setUser(null)
            navigate('/tenant/login')
        } finally {
            setLoggingOut(false)
        }
    }

    return (
        <aside className="w-64 h-screen sticky top-0 flex flex-col justify-between p-6">

            {/* Logo */}
            <div>
                <div className="mb-8">
                    <div className="text-2xl font-bold text-[#F46A47]">Homigo</div>
                    <div className="text-xs text-gray-500 mt-0.5">Tenant Portal</div>
                </div>

                {/* Nav links */}
                <nav className="space-y-1">
                    {navLinks.map(link => (
                        <NavItem key={link.to} to={link.to} label={link.label} />
                    ))}
                </nav>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full py-2.5 text-sm rounded-lg bg-[#F46A47] text-white
                   hover:bg-[#D95738] transition-colors duration-150
                   disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loggingOut ? 'Logging out...' : 'Logout'}
            </button>

        </aside>
    )
}