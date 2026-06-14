import { useState, useEffect } from 'react'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { getAvailableRooms, getRooms } from '../../../services/roomService'

export default function TenantForm({ onSubmit, initialValues = null }) {
  const [full_name, setName] = useState(initialValues?.full_name || '')
  const [phone, setPhone] = useState(initialValues?.phone || '')
  const [email, setEmail] = useState(initialValues?.email || '')
  const [permanent_address, setPermanent_Address] = useState(initialValues?.permanent_address || '')
  const [room_id, setRoom] = useState(initialValues?.room_id ?? null)
  const [rooms, setRooms] = useState([])
  const [saving, setSaving] = useState(false)

  const isEditing = !!initialValues

  useEffect(() => {
    fetchRooms()
  }, [])

  async function fetchRooms() {
    try {
      const available = await getAvailableRooms()
      setRooms(available || [])
    } catch (e) {
      console.error('Failed to fetch rooms', e)
    }
  }

  async function submit(e) {
    e.preventDefault()

    if (!full_name || !email) {
      alert('Please provide name and email')
      return
    }

    setSaving(true)
    try {
      const payload = { full_name, phone, email, permanent_address }

      if (room_id !== null && room_id !== '') {
        payload.room_id = room_id
      }

      await onSubmit(payload)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">

      <Input
        label="Full Name"
        value={full_name}
        onChange={e => setName(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <Input
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <Input
        label="Address"
        value={permanent_address}
        onChange={e => setPermanent_Address(e.target.value)}
      />

      <Select
        label="Assign Room"
        value={room_id ?? ''}
        onChange={e => {
          const v = e.target.value
          setRoom(v === '' ? null : Number(v))
        }}
      >
        <option value="">Select room</option>
        {rooms.map(r => (
          <option key={r.id} value={r.id}>
            Room {r.room_number} - {r.room_type}
          </option>
        ))}
      </Select>

      <div className="text-right">
        <button
          type="submit"
          disabled={saving}
          className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition
            ${saving
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-b from-[#F46A47] to-[#E85A3C] hover:opacity-90'
            }`}
        >
          {saving ? 'Saving...' : isEditing ? 'Update Tenant' : 'Add Tenant'}
        </button>
      </div>

    </form>
  )
}