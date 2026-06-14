import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '@/services/api'

export default function SetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')   // get token from URL
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // if token does not exists in URL — invalid link
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4">
        <div className="w-full max-w-md panel p-8 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-sm text-gray-500">
            This invite link is invalid or missing. Please ask your admin to resend the invite.
          </p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      return setError('Passwords do not match.')
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }

    setLoading(true)
    try {
      await api.post('/tenants/set-password', { token, password })
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen after setting password
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4">
        <div className="w-full max-w-md panel p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">Password Set!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your account is ready. You can now log in to Homigo.
          </p>
          <button
            onClick={() => navigate('/tenant/login')}
            className="w-full py-2.5 rounded-lg text-sm font-semibold
                       bg-[#F46A47] text-white hover:bg-[#D95738] transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4">
      <div className="w-full max-w-md panel p-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Set Your Password</h2>
          <p className="text-sm text-gray-500">
            Welcome to Homigo! Choose a password to activate your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white
                         bg-white/5 border border-white/10
                         placeholder:text-gray-600 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white
                         bg-white/5 border border-white/10
                         placeholder:text-gray-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-lg text-sm font-semibold
                       bg-[#F46A47] text-white hover:bg-[#D95738] transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting password...' : 'Set Password'}
          </button>

        </form>
      </div>
    </div>
  )
}