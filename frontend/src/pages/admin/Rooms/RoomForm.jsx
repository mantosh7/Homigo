import { useState } from 'react'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { ROOM_TYPES } from '../../../utils/constants'

export default function RoomForm({ onSubmit, initialValues, disabled }) {

  const [room_number, setRoom] = useState(initialValues?.room_number ?? '')
  const [room_type, setType] = useState(initialValues?.room_type ?? 'single_ac')
  const [capacity, setCap] = useState(initialValues?.capacity ?? 1)
  const [floor, setFloor] = useState(initialValues?.floor ?? '0')
  const [monthly_rent, setRent] = useState(initialValues?.monthly_rent ?? '')

  function submit(e) {
    e.preventDefault()
    onSubmit({ room_number, room_type, capacity, floor, monthly_rent })
  }

  const isEditing = !!initialValues

  return (
    <form onSubmit={submit} className="space-y-4">

      <Input
        label="Room Number"
        value={room_number}
        onChange={e => setRoom(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select label="Room Type" value={room_type} onChange={e => setType(e.target.value)}>
          {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input
          label="Capacity"
          value={capacity}
          onChange={e => setCap(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Monthly Rent (₹)"
          value={monthly_rent}
          onChange={e => setRent(e.target.value)}
        />
        <Input
          label="Floor"
          value={floor}
          onChange={e => setFloor(e.target.value)}
        />
      </div>

      <div className="text-right">
        <button
          type="submit"
          disabled={disabled}
          className="px-5 py-2 rounded bg-gradient-to-b from-[#F46A47] to-[#E85A3C] text-white disabled:opacity-50"
        >
          {isEditing ? 'Update Room' : 'Create Room'}
        </button>
      </div>

    </form>
  )
}