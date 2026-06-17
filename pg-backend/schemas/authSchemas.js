const { z } = require('zod')

// admin signup schema 
const adminSignupSchema = z.object({
    pgName: z.string().min(2, 'PG name must be at least 2 characters'),
    pgAddress: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    otpVerified: z.boolean({ required_error: 'OTP verification is required' })
})

// admin login schema 
const adminLoginSchema = z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required')
})

// tenant login schema 
const tenantLoginSchema = z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required')
})


//  forgot password schema
const forgotPasswordSchema = z.object({
    email: z.string().email('Please provide a valid email address')
})

//  reset password schema
const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
})

module.exports = {
    adminSignupSchema,
    adminLoginSchema,
    tenantLoginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
}