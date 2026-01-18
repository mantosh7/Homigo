import { useEffect, useState } from 'react'
import Input from '../../components/ui/Input'
import { getTenantProfile, changeTenantPassword } from '../../services/tenantService'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const res = await getTenantProfile()
    setProfile(res)
  }

  async function submitPassword(e) {
    e.preventDefault()
    if (newPassword !== confirm) {
      alert('Passwords do not match')
      return
    }

    try {
      setSaving(true)
      await changeTenantPassword({ oldPassword, newPassword })
      alert('Password updated successfully')
      setOldPassword('')
      setNewPassword('')
      setConfirm('')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">My Profile</h2>
        <p><b>Name:</b> {profile.full_name}</p>
        <p><b>Email:</b> {profile.email}</p>
        <p><b>Address:</b> {profile.address}</p>
        <p><b>Room:</b> {profile.room_number} ({profile.room_type})</p>
      </div>

      <form onSubmit={submitPassword} className="card space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>

        <Input label="Old Password" type="password" value={oldPassword}
          onChange={e => setOldPassword(e.target.value)} />

        <Input label="New Password" type="password" value={newPassword}
          onChange={e => setNewPassword(e.target.value)}/>

        <Input label="Confirm Password" type="password" value={confirm}
          onChange={e => setConfirm(e.target.value)} />

        <button disabled={saving} className="px-4 py-3 text-sm bg-[#F46A47] text-white rounded-lg hover:bg-[#D95738] transition">
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
