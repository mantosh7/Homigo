// import { NavLink } from 'react-router-dom'

// function LinkItem({to, children}){
//   return (
//     <NavLink to={to} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive? 'bg-purple-600/80 text-white':'text-gray-300 hover:bg-white/2'}`}>
//       {children}
//     </NavLink>
//   )
// }

// export default function Sidebar(){
//   return (
//     <aside className="w-64 h-screen sticky top-0 p-6 bg-gradient-to-b from-[#071026] to-[#06101a]">
//       <div className="mb-8">
//         <div className="text-2xl font-bold text-purple-400">PG Manager</div>
//         <div className="text-xs text-gray-400">Hostel Management</div>
//       </div>
//       <nav className="space-y-2">
//         <LinkItem to="/admin/dashboard">Dashboard</LinkItem>
//         <LinkItem to="/admin/rooms">Rooms</LinkItem>
//         <LinkItem to="/admin/tenants">Tenants</LinkItem>
//         <LinkItem to="/admin/rent">Rent</LinkItem>
//         <LinkItem to="/admin/complaints">Complaints</LinkItem>
//       </nav>
//       <div className="mt-auto text-sm text-gray-400">Logout</div>
//     </aside>
//   )
// }

import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function LinkItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-purple-600/80 text-white' : 'text-gray-300 hover:bg-white/2'}`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogout() {
    setLoading(true)
    setError(null)
    try {
      // call your logout endpoint — adjust URL if needed
      // change only this line
      const res = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });


      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || `Logout failed (${res.status})`)
      }

      // clear any client-side storage if you used it
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        // ignore
      }

      // redirect to login
      navigate('/admin/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      setError(err.message || 'Logout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="w-64 h-screen sticky top-0 p-6 bg-gradient-to-b from-[#071026] to-[#06101a] flex flex-col">
      <div className="mb-8">
        <div className="text-2xl font-bold text-purple-400">PG Manager</div>
        <div className="text-xs text-gray-400">Hostel Management</div>
      </div>

      <nav className="space-y-2">
        <LinkItem to="/admin/dashboard">Dashboard</LinkItem>
        <LinkItem to="/admin/rooms">Rooms</LinkItem>
        <LinkItem to="/admin/tenants">Tenants</LinkItem>
        <LinkItem to="/admin/rent">Rent</LinkItem>
        <LinkItem to="/admin/complaints">Complaints</LinkItem>
      </nav>

      <div className="border mt-[20px]">
        {error && <div className="text-xs text-red-400 mb-2">{error}</div>}

        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full text-left px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/2 transition"
          aria-disabled={loading}
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  )
}
