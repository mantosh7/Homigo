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

export default function Sidebar() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const {logoutAdmin} = useAuth() ;

  async function handleLogout(e) {
    e.preventDefault()
    setLoading(true)
    try{
      await logoutAdmin()
      navigate('/admin/dashboard')
    }catch(err){ 
      alert('Logout failed: ' + (err.message || 'Please try again'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="w-64 h-screen sticky top-0 p-6 bg-gradient-to-b from-[#071026] to-[#06101a] flex flex-col justify-between">
      <div>
        <div className="mb-8 ">
          <div className="text-2xl font-bold text-[#F46A47]">Homigo</div>
          <div className="text-xs text-gray-400">Admin Portal</div>
        </div>

        <nav className="space-y-2">
          <LinkItem to="/admin/dashboard">Dashboard</LinkItem>
          <LinkItem to="/admin/rooms">Rooms</LinkItem>
          <LinkItem to="/admin/tenants">Tenants</LinkItem>
          <LinkItem to="/admin/rent">Rent</LinkItem>
          <LinkItem to="/admin/complaints">Complaints</LinkItem>
          <LinkItem to="/admin/analytics">Analytics Dashboard</LinkItem>
        </nav>
      </div>

      <div className="mt-[20px] bg-gradient-to-b from-[#071026] to-[#06101a]">
        {error && <div className="text-xs text-red-400 mb-2">{error}</div>}

        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full text-center px-4 py-3 text-sm 
                     bg-[#F46A47] text-white 
                     border border-[#F46A47] 
                     rounded-lg 
                     hover:bg-[#D95738] 
                     transition"
          aria-disabled={loading}
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  )
}
