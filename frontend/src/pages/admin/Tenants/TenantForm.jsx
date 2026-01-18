import { useState, useEffect } from 'react'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { getAvailableRooms } from '../../../services/roomService'

export default function TenantForm({ onSubmit, initialValues = null }) {
  const [full_name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [room_id, setRoom] = useState(null)
  const [rooms, setRooms] = useState([])
  const [saving, setSaving] = useState(false)


  useEffect(() => { 
    fetchRooms() }, 
  [])

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.full_name || '')
      setPhone(initialValues.phone || '')
      setEmail(initialValues.email || '')
      setAddress(initialValues.address || '')
      setRoom(initialValues.room_id || null)
    }
  }, [initialValues])

  async function fetchRooms() {
    try {
      const r = await getAvailableRooms()
      setRooms(r || [])
    } catch (e) {
      console.error(e)
    }
  }

  async function submit(e) {
    e.preventDefault()

    if (!full_name || !email) {
      alert('Please provide name and email')
      return
    }

    try {
      setSaving(true)
      const payload = {full_name, phone, email, address}

      // send room_id ONLY if user actually selected / changed it
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
      <Input label="Full Name" value={full_name} onChange={e => setName(e.target.value)} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      <Input label="Address" value={address} onChange={e => setAddress(e.target.value)} />

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
            Room {r.room_number}
          </option>
        ))}
      </Select>

      <div className="text-right">
        <button
          type="submit"
          disabled={saving}
          className={`px-5 py-2 rounded text-white
            ${saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-b from-[#F46A47] to-[#E85A3C]'
            }`}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

      </div>
    </form>
  )
}
