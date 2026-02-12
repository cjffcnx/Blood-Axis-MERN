const nodemailer = require("nodemailer");
const { getLogger } = require("./logger");

const logger = getLogger("emailService");

const getSmtpConfig = () => {
    const readVar = (name) => (process.env[name] || "").trim();
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

const isEmailConfigured = () => Boolean(getSmtpConfig());

const sendEmail = async ({ to, subject, html, text }) => {
    const config = getSmtpConfig();
    if (!config) {
        logger.warn("SMTP not configured. Email not sent.");
        return { success: false, error: "SMTP not configured" };
    }

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

module.exports = {
    sendEmail,
    isEmailConfigured,
};
