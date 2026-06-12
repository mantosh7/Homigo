import { useEffect, useState } from 'react'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { getTenantProfile, changeTenantPassword } from '../../services/tenantService'

export default function Profile() {

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // password form fields
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  // load profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const data = await getTenantProfile()
      setProfile(data)
    } catch (err) {
      console.error('Failed to load profile', err)
    } finally {
      setLoading(false)
    }
  }

  // change password submit
  async function submitPassword(e) {
    e.preventDefault()

    if (!oldPassword) { alert('Please enter your old password'); return }
    if (newPassword.length < 6) { alert('New password must be at least 6 characters'); return }
    if (newPassword !== confirm) { alert('Passwords do not match'); return }

    setSaving(true)
    try {
      await changeTenantPassword({ oldPassword, newPassword })
      alert('Password updated successfully')

      // reset form
      setOldPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err) {
      alert(err?.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading...</p>
  if (!profile) return <p className="text-gray-500 text-sm">Failed to load profile.</p>

  return (
    <div className="space-y-6">

      {/* ── Profile info ── */}
      <Card className="p-5">
        <h2 className="font-semibold text-white mb-4">My Profile</h2>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F46A47] to-[#ffb45e] text-white flex items-center justify-center text-xl font-bold">
            {profile.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-semibold text-white text-lg">{profile.full_name}</div>
            <div className="text-sm text-gray-400">{profile.email}</div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">

          <div className="panel p-3 rounded-lg">
            <div className="text-gray-500 text-xs mb-1">Room</div>
            <div className="text-white font-medium">
              {profile.room_number ? `Room ${profile.room_number}` : '—'}
            </div>
          </div>

          <div className="panel p-3 rounded-lg">
            <div className="text-gray-500 text-xs mb-1">Room Type</div>
            <div className="text-white font-medium">{profile.room_type || '—'}</div>
          </div>

          <div className="panel p-3 rounded-lg col-span-2">
            <div className="text-gray-500 text-xs mb-1">Address</div>
            <div className="text-white font-medium">
              {profile.permanent_address || profile.address || '—'}
            </div>
          </div>

        </div>
      </Card>

      {/* ── Change password form ── */}
      <Card className="p-5">
        <h2 className="font-semibold text-white mb-4">Change Password</h2>

        <form onSubmit={submitPassword} className="space-y-4">
          <Input
            label="Old Password"
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#F46A47] to-[#E85A3C] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Card>

    </div>
  )
}