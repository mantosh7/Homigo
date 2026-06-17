import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '@/services/api'

// URL: /reset-password?token=abc123xyz...
export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // No token in URL -> invalid link
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4">
                <div className="w-full max-w-md panel p-8 text-center">
                    <div className="text-4xl mb-4">🔗</div>
                    <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        This reset link is invalid or missing. Please request a new one.
                    </p>
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold
                       bg-[#F46A47] text-white hover:bg-[#D95738] transition"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            return setError('Passwords do not match.')
        }

        if (password.length < 8) {
            return setError('Password must be at least 8 characters.')
        }

        setLoading(true)
        try {
            // try both endpoints one-by-one
            // First try admin endpoint
            try {
                await api.post('/auth/admin/reset-password', { token, password })
            } catch (adminErr) {
                // try tenant endpoint
                if (adminErr.response?.status === 400) {
                    await api.post('/tenant/auth/reset-password', { token, password })
                } else {
                    throw adminErr
                }
            }

            setSuccess(true)
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Password successfully reset
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4">
                <div className="w-full max-w-md panel p-8 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Your password has been successfully reset. You can now log in with your new password.
                    </p>
                    <button
                        onClick={() => navigate('/admin/login')}
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
                    <h2 className="text-2xl font-bold text-white mb-1">Reset Your Password</h2>
                    <p className="text-sm text-gray-500">
                        Enter a new password to regain access to your account
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
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Resetting password...' : 'Reset Password'}
                    </button>

                </form>

                <p className="mt-5 text-center text-xs text-gray-500">
                    Remember your password?{' '}
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="text-[#F46A47] hover:underline font-medium"
                    >
                        Sign In
                    </button>
                </p>

            </div>
        </div>
    )
}