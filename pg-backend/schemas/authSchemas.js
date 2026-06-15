const { z } = require('zod')

// Admin Signup Schema 
const adminSignupSchema = z.object({
    pgName: z.string().min(2, 'PG name must be at least 2 characters'),
    pgAddress: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    otpVerified: z.boolean({ required_error: 'OTP verification is required' })
})

// Admin Login Schema 
const adminLoginSchema = z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required')
})

// Tenant Login Schema 
const tenantLoginSchema = z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required')
})

module.exports = { adminSignupSchema, adminLoginSchema, tenantLoginSchema }