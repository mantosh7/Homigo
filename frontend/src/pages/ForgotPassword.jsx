import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '@/services/api'

// Forgot password page — user enters email to request reset link
export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const location = useLocation()

    // Determine which endpoint to call based on current path
    // Admin:  app.use('/api/auth', authRoutes)           → /api/auth/admin/forgot-password
    // Tenant: app.use('/api/tenant/auth', tenantAuthRoutes) → /api/tenant/auth/forgot-password
    const isAdmin = location.pathname.includes('admin')
    const endpoint = isAdmin ? '/auth/admin/forgot-password' : '/tenant/auth/forgot-password'
    const loginPath = isAdmin ? '/admin/login' : '/tenant/login'

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!email) {
            return setError('Please enter your email address')
        }

        setLoading(true)
        try {
            await api.post(endpoint, { email })

            // Don't reveal whether email was found (security)
            setSubmitted(true)

        } catch (err) {
            // Even on error -> show generic message
            setSubmitted(true)

        } finally {
            setLoading(false)
        }
    }

    // After submission — show confirmation message
    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4">
                <div className="w-full max-w-md panel p-8 text-center">
                    <div className="text-4xl mb-4">📧</div>
                    <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        If an account exists with that email, you will receive a password reset link.
                        The link expires in 15 minutes.
                    </p>
                    <button
                        onClick={() => navigate(loginPath)}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold
                       bg-[#F46A47] text-white hover:bg-[#D95738] transition mb-3"
                    >
                        Back to Login
                    </button>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold
                       bg-white/5 text-gray-300 hover:bg-white/10 transition"
                    >
                        Try Another Email
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4">
            <div className="w-full max-w-md panel p-8">

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Forgot Password?</h2>
                    <p className="text-sm text-gray-500">
                        Enter your email address and we'll send you a link to reset your password
                    </p>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
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
                        {loading ? 'Sending reset link...' : 'Send Reset Link'}
                    </button>

                </form>

                <p className="mt-5 text-center text-sm text-gray-500">
                    Remember your password?{' '}
                    <button
                        onClick={() => navigate(loginPath)}
                        className="text-[#F46A47] hover:underline font-medium"
                    >
                        Sign In
                    </button>
                </p>

            </div>
        </div>
    )
}