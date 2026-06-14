import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import HomeButton from '@/components/ui/HomeButton'
import api from '@/services/api'

export default function AdminSignup() {
  const [form, setForm] = useState({
    pgName: '', pgAddress: '', name: '', email: '', password: '', confirmPassword: ''
  })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  const nav = useNavigate()
  const { signupAdmin } = useAuth()

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  async function sendOtp() {
    if (!form.email) return alert('Please enter email first')
    setOtpLoading(true)
    try {
      await api.post('/test-email/send', { email: form.email })
      setOtpSent(true)
      alert('OTP sent to your email')
    } catch {
      alert('Failed to send OTP')
    } finally { setOtpLoading(false) }
  }

  async function verifyOtp() {
    if (!otp) return alert('Please enter OTP')
    setOtpLoading(true)
    try {
      await api.post('/test-email/verify', { email: form.email, otp })
      setOtpVerified(true)
    } catch (err) {
      alert(err?.response?.data?.message || 'OTP verification failed')
    } finally { setOtpLoading(false) }
  }

  async function submit(e) {
    e.preventDefault()
    if (!otpVerified) return alert('Please verify OTP first')
    if (form.password !== form.confirmPassword) return alert('Passwords do not match')
    setLoading(true)
    try {
      await signupAdmin(form.pgName, form.pgAddress, form.name, form.email, form.password, true)
      alert('Signup successful!')
      nav('/admin/login')
    } catch (err) {
      alert('Signup failed: ' + (err.message || 'Please try again'))
    } finally { setLoading(false) }
  }

  function InputField({ label, type = 'text', value, onChange, placeholder, required, disabled }) {
    return (
      <div>
        <label className="block text-sm text-white mb-1.5">{label}</label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white
                   bg-white/5 border border-white/10
                   placeholder:text-gray-600 disabled:opacity-40 transition"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e] px-4 py-10">
      <HomeButton />

      <div className="w-full max-w-md panel p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Admin Signup</h2>
          <p className="text-sm text-gray-500">Create your PG management account</p>
        </div>

        <form onSubmit={submit} className="space-y-4">

          <InputField label="PG Name" value={form.pgName} onChange={set('pgName')}
            placeholder="Sunshine Boys PG" required />

          <InputField label="PG Address" value={form.pgAddress} onChange={set('pgAddress')}
            placeholder="Sector 62, Noida" />

          <InputField label="Your Name" value={form.name} onChange={set('name')}
            placeholder="John Doe" required />

          {/* Email + OTP */}
          <div>
            <label className="block text-sm text-white mb-1.5">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="admin@pg.com"
                required
                disabled={otpVerified}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm text-white
                           bg-white/5 border border-white/10
                           placeholder:text-gray-600 disabled:opacity-40"
              />
              {!otpVerified && (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading}
                  className="shrink-0 px-3 py-2.5 rounded-lg text-xs font-medium
                             bg-white/8 text-gray-300 border border-white/10
                             hover:bg-white/12 transition disabled:opacity-50"
                >
                  {otpLoading && !otpSent ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              )}
              {otpVerified && (
                <span className="shrink-0 flex items-center text-sm text-green-400">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* OTP verify — shows after send */}
          {otpSent && !otpVerified && (
            <div className="flex gap-2">
              <input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm text-white
                           bg-white/5 border border-white/10 placeholder:text-gray-600"
              />
              <button
                type="button"
                onClick={verifyOtp}
                disabled={otpLoading}
                className="shrink-0 px-3 py-2.5 rounded-lg text-xs font-medium
                           bg-[#F46A47]/15 text-[#F46A47] border border-[#F46A47]/20
                           hover:bg-[#F46A47]/25 transition disabled:opacity-50"
              >
                {otpLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          )}

          <InputField label="Password" type="password" value={form.password}
            onChange={set('password')} placeholder="Min. 8 characters" required />

          <InputField label="Confirm Password" type="password" value={form.confirmPassword}
            onChange={set('confirmPassword')} placeholder="••••••••" required />

          <button
            type="submit"
            disabled={loading || !otpVerified}
            className="w-full py-2.5 mt-2 rounded-lg text-sm font-semibold
                       bg-[#F46A47] text-white hover:bg-[#D95738] transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

        </form>

        <p className="mt-5 text-center text-sm text-gray-200">
          Already have an account?{' '}
          <button
            onClick={() => nav('/admin/login')}
            className="text-[#F89A85] transition-colors duration-200 hover:text-[#F67D61] hover:underline font-medium"
          >
            Sign In
          </button>
        </p>

      </div>
    </div>
  )
}