import { Resend } from "resend"

const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("Email service is not configured")
    }

    return new Resend(process.env.RESEND_API_KEY)
}

const sendEmail = async ({ to, subject, html, text }) => {
    const { error } = await getResend().emails.send({
        from: process.env.EMAIL_FROM || "Amazing Store <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        text
    })

    if (error) {
        console.error("Resend API Error:", error);
        throw new Error(error.message || "Unable to send email")
    }
}

export { sendEmail }
