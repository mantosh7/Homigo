require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'

let transporter

if (isProduction) {
    // Production (Brevo) 
    transporter = {
        sendMail: async ({ to, subject, text }) => {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: {
                        name: 'Homigo',
                        email: process.env.BREVO_SENDER_EMAIL
                    },
                    to: [{ email: to }],
                    subject,
                    textContent: text
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to send email via Brevo')
            }

            return response.json()
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