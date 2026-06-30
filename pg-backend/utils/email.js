require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'

let transporter

if (isProduction) {
    // Production (Render) 
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    transporter = {
        sendMail: async ({ to, subject, text, from }) => {
            const { data, error } = await resend.emails.send({
                from: from || 'Homigo <onboarding@resend.dev>',
                to,
                subject,
                text
            })

            if (error) {
                throw new Error(error.message || 'Failed to send email via Resend')
            }

            return data
        }
    }

} else {
    // Local development (Gmail SMTP via nodemailer) 
    const nodemailer = require('nodemailer')

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })
}

module.exports = transporter