import { useState, useEffect } from 'react'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import dayjs from 'dayjs'

export default function RentForm({ initialValues = null, tenants = [], onSubmit, disabled = false }) {
  const [tenant_id, setTenant] = useState('')   
  const [amount, setAmount] = useState('')
  const [due_date, setDue] = useState('')

  useEffect(() => {
    if (initialValues) {
      // accept id or _id
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

    // convert tenant id to number if possible (backend typically expects numeric id)
    const tenantNum = Number(tenant_id)
    const payload = {
      tenant_id: Number.isNaN(tenantNum) ? tenant_id : tenantNum,
      amount: Number(amount),
      due_date: due_date || null
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Select label="Tenant" value={tenant_id} onChange={(e) => setTenant(e.target.value)}>
        <option value="">Select Tenant</option>
        {tenants.map(t => (
          <option key={t.id ?? t._id} value={String(t.id ?? t._id)}>
            {t.full_name}{t.room_number ? ` • Room ${t.room_number}` : ''}
          </option>
        ))}
      </Select>

      <Input
        label="Amount"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <Input
        label="Due date"
        type="date"
        value={due_date}
        onChange={e => setDue(e.target.value)}
      />

      <div className="text-right">
        <button disabled={disabled} className="bg-purple-600 text-white px-4 py-2 rounded">
          Save
        </button>
      </div>
    </form>
  )
}
