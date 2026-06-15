const { z } = require('zod')

// Create Rent Record Schema 
const createRentSchema = z.object({
  tenant_id: z.coerce.number().int().positive('Tenant ID must be a valid number'),
  amount:    z.coerce.number().positive('Amount must be greater than 0'),
  due_date:  z.string().optional().nullable()
})

// ─── Update Complaint Status Schema ──────────────────────────────
const updateComplaintSchema = z.object({
  status: z.enum(['Pending', 'In Progress', 'Resolved'], {
    errorMap: () => ({ message: 'Status must be Pending, In Progress, or Resolved' })
  })
})

module.exports = { createRentSchema, updateComplaintSchema }