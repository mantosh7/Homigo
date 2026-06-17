import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import HomeButton from '../../components/ui/HomeButton'

export default function TenantLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { loginTenant } = useAuth()
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await loginTenant(email, password)
      nav('/tenant/dashboard')
    } catch (err) {
      alert('Login failed: ' + (err.message || 'Please try again'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4">
      <HomeButton />

      <div className="w-full max-w-md panel p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            Tenant Login
          </h2>
          <p className="text-sm text-gray-500">
            Sign in to your tenant account
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tenant@pg.com"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white
                         bg-white/5 border border-white/10
                         placeholder:text-gray-600 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white
                         bg-white/5 border border-white/10
                         placeholder:text-gray-600 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-lg text-sm font-semibold
                       bg-[#F46A47] text-white hover:bg-[#D95738] transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Footer */}
        <p className="mt-5 text-center text-sm text-gray-500">
          Forgot password?{' '}
          <button
            onClick={() => nav('/tenant/forgot-password')}
            className="text-[#F89A85] hover:underline font-medium"
          >
            Reset here
          </button>
        </p>

      </div>
    </div>
  )
}