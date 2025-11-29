import { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({children}){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // fetch current user on load
  useEffect(()=>{
    let mounted = true
    async function fetchMe(){
      try{
        const res = await api.get('/auth/me') // returns { user: null | payload }
        if(mounted) setUser(res.data.user)
      }catch(e){
        if(mounted) setUser(null)
      }finally{
        if(mounted) setLoading(false)
      }
    }
    fetchMe()
    return ()=> mounted = false
  },[])

  // login functions call backend which sets cookie and returns user
  async function loginAdmin(email, password){
    const res = await api.post('/auth/admin/login', { email, password })
    setUser(res.data.user)
    return res.data
  }
  
  async function loginTenant(email, password){
    const res = await api.post('/auth/tenant/login', { email, password })
    setUser(res.data.user)
    return res.data
  }

  async function logout(){
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loginAdmin, loginTenant, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
