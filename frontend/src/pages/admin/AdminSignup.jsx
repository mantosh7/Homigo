import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import HomeButton from '@/components/ui/HomeButton'

export default function AdminSignup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const {signupAdmin} = useAuth() ;

  async function submit(e){ 
    e.preventDefault()
    
    if(password !== confirmPassword){
      alert('Passwords do not match')
      return
    }
    
    setLoading(true)
    try{
      await signupAdmin(name, email, password)
      alert("Signup successful!") ;
      nav('/admin/login')
    }catch(err){ 
      alert('Signup failed: ' + (err.message || 'Please try again'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a2332]">
      <HomeButton />
      <div className="w-full max-w-md panel p-8 bg-slate-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-2 text-white">Admin Signup</h2>
        <p className="text-sm text-slate-400 mb-6">Create your admin account</p>
        
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm text-white">
            Name
            <input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              className="w-full mt-2 p-3 rounded bg-transparent border border-gray-700 text-white"
              placeholder="John Doe"
              required
            />
          </label>
          
          <label className="block text-sm text-white">
            Email
            <input 
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              className="w-full mt-2 p-3 rounded bg-transparent border border-gray-700 text-white"
              placeholder="admin@pg.local"
              required
            />
          </label>
          
          <label className="block text-sm text-white">
            Password
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              className="w-full mt-2 p-3 rounded bg-transparent border border-gray-700 text-white"
              placeholder="••••••••"
              required
            />
          </label>
          
          <label className="block text-sm text-white">
            Confirm Password
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e=>setConfirmPassword(e.target.value)} 
              className="w-full mt-2 p-3 rounded bg-transparent border border-gray-700 text-white"
              placeholder="••••••••"
              required
            />
          </label>
          
          <div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6b] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <button 
              onClick={() => nav('/admin/login')}
              className="text-[#ff6b4a] hover:text-[#ff8a6b] font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}