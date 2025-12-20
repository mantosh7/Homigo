import { Outlet } from 'react-router-dom'
import TenantSidebar from '../../components/layout/TenantSidebar'
import Topbar from '../../components/layout/Topbar'

export default function TenantLayout(){
  return (
    <div className="flex">
      <TenantSidebar />
      <main className="flex-1 p-8">
        <Topbar title="Tenant" />
        <Outlet />
      </main>
    </div>
  )
}
