// Newsletter subscribe controller
const subscribeNewsletterController = async (req, res) => {
    try {
        const { email } = req.body || {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).send({
                success: false,
                message: "Valid email is required",
            });
        }
        if (!isEmailConfigured()) {
            return res.status(503).send({
                success: false,
                message: "Email service is not configured",
            });
        }
        const recipient = getContactRecipient();
        const text = `New newsletter subscription: ${email}`;
        const html = `<h2>New newsletter subscription</h2><p>Email: <strong>${email}</strong></p>`;
        const result = await sendEmail({
            to: recipient,
            subject: "Newsletter Subscription",
            text,
            html,
        });
        if (!result.success) {
            return res.status(503).send({
                success: false,
                message: "Failed to subscribe. Please try again later.",
            });
        }
        return res.status(200).send({
            success: true,
            message: "Successfully subscribed to newsletter!",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "Error subscribing to newsletter",
            error,
        });
    }
};
const { sendEmail, isEmailConfigured } = require("../utils/emailService");
const { isValidPhone } = require("../utils/validation");

const getContactRecipient = () => {
    const configured = (process.env.CONTACT_RECEIVER || "").trim();
    return configured || "manoranjaninproject@gmail.com";
};

const sendContactMessageController = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body || {};

        if (!name || !email || !subject || !message) {
            return res.status(400).send({
                success: false,
                message: "Name, email, subject, and message are required",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({
                success: false,
                message: "Invalid email address",
            });
        }

        if (phone && !isValidPhone(phone)) {
            return res.status(400).send({
                success: false,
                message: "Phone number must be exactly 10 digits",
            });
        }

        if (!isEmailConfigured()) {
            return res.status(503).send({
                success: false,
                message: "Email service is not configured",
            });
        }

        const recipient = getContactRecipient();
        const safePhone = phone && String(phone).trim() ? String(phone).trim() : "N/A";

        const text = [
            "New contact message received:",
            "",
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${safePhone}`,
            `Subject: ${subject}`,
            "",
            message,
        ].join("\n");

        const html = `
      <h2>New contact message received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${safePhone}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p>${String(message).replace(/\n/g, "<br>")}</p>
    `;

        const result = await sendEmail({
            to: recipient,
            subject: `Contact Form: ${subject}`,
            text,
            html,
        });

        if (!result.success) {
            return res.status(503).send({
                success: false,
                message: "Failed to send message. Please try again later.",
            });
        }

        return res.status(200).send({
            success: true,
            message: "Message sent successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error sending contact message",
            error,
        });
    }
};

module.exports = {
    sendContactMessageController,
    subscribeNewsletterController,
};
