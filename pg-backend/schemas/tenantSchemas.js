const { z } = require('zod')

// Add Tenant Schema 
const addTenantSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),

    // Optional fields 
    phone: z.string().min(7, 'Phone number seems too short').optional().or(z.literal('')),
    room_id: z.coerce.number().int().positive().optional().nullable(),
    join_date: z.string().optional().nullable(),
    emergency_contact: z.string().optional().nullable(),
    permanent_address: z.string().optional().nullable()
})


//  Update Tenant Schema 
// All fields optional — admin may update just one field at a time
const updateTenantSchema = z.object({
    full_name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(7).optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    room_id: z.coerce.number().int().positive().optional().nullable(),
    join_date: z.string().optional().nullable(),
    emergency_contact: z.string().optional().nullable(),
    permanent_address: z.string().optional().nullable(),
    is_active: z.coerce.boolean().optional()
})

// Set Password Schema (invite flow) 
const setPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
})

module.exports = { addTenantSchema, updateTenantSchema, setPasswordSchema }