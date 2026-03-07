const nodemailer = require("nodemailer");
const { getLogger } = require("./logger");

const logger = getLogger("emailService");

const readVar = (name) => (process.env[name] || "").trim();
const getEmailProvider = () => readVar("EMAIL_PROVIDER").toLowerCase();

const getResendConfig = () => {
    const apiKey = readVar("RESEND_API_KEY");
    const from = readVar("RESEND_FROM");

    const missing = [];
    if (!apiKey) missing.push("RESEND_API_KEY");
    if (!from) missing.push("RESEND_FROM");

    if (missing.length) {
        logger.warn(`Resend not configured. Missing: ${missing.join(", ")}`);
        return null;
    }

    return { apiKey, from };
};

const getSmtpConfig = () => {
    const host = readVar("SMTP_HOST");
    const port = readVar("SMTP_PORT");
    const user = readVar("SMTP_USER");
    const pass = readVar("SMTP_PASS");
    const from = readVar("SMTP_FROM");

    const missing = [];
    if (!host) missing.push("SMTP_HOST");
    if (!port) missing.push("SMTP_PORT");
    if (!user) missing.push("SMTP_USER");
    if (!pass) missing.push("SMTP_PASS");
    if (!from) missing.push("SMTP_FROM");

    if (missing.length > 0) {
        logger.warn(`SMTP not configured. Missing: ${missing.join(", ")}`);
        return null;
    }

    return {
        host,
        port: Number(port),
        auth: { user, pass },
        from,
    };
};

const isEmailConfigured = () => {
    const provider = getEmailProvider();
    if (provider === "resend") return Boolean(getResendConfig());
    return Boolean(getSmtpConfig());
};

const sendEmailWithResend = async ({ to, subject, html, text }) => {
    const config = getResendConfig();
    if (!config) return { success: false, error: "Resend not configured" };

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: config.from,
                to: [to],
                subject,
                html: html || (text ? `<p>${text}</p>` : "<p></p>"),
                text: text || undefined,
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            logger.error(`Resend send failed: ${res.status} ${errText}`);
            return { success: false, error: "Resend send failed" };
        }

        return { success: true };
    } catch (error) {
        logger.error(`Resend send failed: ${error.message}`);
        return { success: false, error: "Resend send failed" };
    }
};

const sendEmailWithSmtp = async ({ to, subject, html, text }) => {
    const config = getSmtpConfig();
    if (!config) return { success: false, error: "SMTP not configured" };

    try {
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465,
            auth: config.auth,
        });

        await transporter.sendMail({
            from: config.from,
            to,
            subject,
            text,
            html,
        });

        return { success: true };
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
        return { success: false, error: "Email send failed" };
    }
};

const sendEmail = async ({ to, subject, html, text }) => {
    const provider = getEmailProvider();
    if (provider === "resend") {
        return sendEmailWithResend({ to, subject, html, text });
    }
    return sendEmailWithSmtp({ to, subject, html, text });
};

module.exports = {
    sendEmail,
    isEmailConfigured,
};
