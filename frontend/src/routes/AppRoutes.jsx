import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminSignup from '@/pages/admin/AdminSignup'
import AdminLayout from '../pages/admin/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'
import RoomsList from '../pages/admin/Rooms/RoomsList'
import TenantsList from '../pages/admin/Tenants/TenantsList'
import RentList from '../pages/admin/Rent/RentList'
import ComplaintsList from '../pages/admin/Complaints/ComplaintsList'
import TenantLogin from '../pages/tenant/TenantLogin'
import TenantLayout from '../pages/tenant/TenantLayout'
import TenantDashboard from '../pages/tenant/TenantDashboard'
import useAuth from '../hooks/useAuth'
import MyRent from '../pages/tenant/MyRent'


import Landing from '../pages/Landing'

function RequireAdmin({children}){
  const { user, loading } = useAuth()
  if(loading) return <div className="p-6">Loading...</div>
  if(!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />
  return children
}

function RequireTenant({children}){
  const { user, loading } = useAuth()
  if(loading) return <div className="p-6">Loading...</div>
  if(!user || user.role !== 'tenant') return <Navigate to="/tenant/login" replace />
  return children
}


export default function AppRoutes(){
  return (
    <Routes>
      {/* Landing page (no topbar) */}
      <Route path="/" element={<Landing />} />

      {/* Admin auth & protected area */}
      <Route path="/admin/login" element={<AdminLogin/>} />
      <Route path="/admin/signup" element={<AdminSignup/>} />
      <Route path="/admin" element={<RequireAdmin> <AdminLayout/> </RequireAdmin>}>
        <Route path="dashboard" element={<Dashboard/>} />
        <Route path="rooms" element={<RoomsList/>} />
        <Route path="tenants" element={<TenantsList/>} />
        <Route path="rent" element={<RentList/>} />
        <Route path="complaints" element={<ComplaintsList/>} />
      </Route>

      {/* Tenant auth & protected area  */}
      <Route path="/tenant/login" element={<TenantLogin/>} />
      <Route path="/tenant" element={<RequireTenant><TenantLayout/></RequireTenant>}>
        <Route path="dashboard" element={<TenantDashboard/>} />
        <Route path="rent" element={<MyRent/>} />
      </Route>

      <Route path="*" element={<div className="p-8">Not Found</div>} />
    </Routes>
  )
}
