import { useState, useEffect } from 'react'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import dayjs from 'dayjs'

export default function RentForm({ initialValues = null, tenants = [], onSubmit, disabled = false }) {

  const [tenant_id, setTenant] = useState('')
  const [amount, setAmount] = useState('')
  const [due_date, setDue] = useState('')

  // prefill form when editing
  useEffect(() => {
    if (initialValues) {
      setTenant(String(initialValues.tenant_id ?? initialValues.tenant ?? ''))
      setAmount(initialValues.amount ?? '')
      setDue(initialValues.due_date ? dayjs(initialValues.due_date).format('YYYY-MM-DD') : '')
    } else {
      setTenant('')
      setAmount('')
      setDue('')
    }
  }, [initialValues])

  function submit(e) {
    e.preventDefault()
    if (!tenant_id) { alert('Please choose a tenant'); return }
    if (!amount) { alert('Please enter amount'); return }

    const tenantNum = Number(tenant_id)
    onSubmit({
      tenant_id: Number.isNaN(tenantNum) ? tenant_id : tenantNum,
      amount: Number(amount),
      due_date: due_date || null
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">

      {/* Tenant dropdown */}
      <Select label="Tenant" value={tenant_id} onChange={e => setTenant(e.target.value)}>
        <option value="">Select Tenant</option>
        {tenants.map(t => (
          <option key={t.id ?? t._id} value={String(t.id ?? t._id)}>
            {t.full_name}{t.room_number ? ` · Room ${t.room_number}` : ''}
          </option>
        ))}
      </Select>

      {/* Rent amount */}
      <Input
        label="Amount (₹)"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      {/* Due date */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Due Date</label>
        <div className="relative">
          <input
            type="date"
            value={due_date}
            onChange={e => setDue(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                       focus:outline-none focus:border-[#F46A47]
                       [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="text-right pt-1">
        <button
          type="submit"
          disabled={disabled}
          className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#F46A47] to-[#E85A3C] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {disabled ? 'Saving...' : 'Save'}
        </button>
      </div>

    </form>
  )
}