const axios = require("axios");
const nodemailer = require("nodemailer");
const { getLogger } = require("./logger");

const logger = getLogger("emailService");

const readVar = (name) => (process.env[name] || "").trim();
const getEmailProvider = () => readVar("EMAIL_PROVIDER").toLowerCase();

const getResendConfig = () => {
    const apiKey = readVar("RESEND_API_KEY");
    const from = readVar("RESEND_FROM") || readVar("SMTP_FROM");

    if (!apiKey) {
        return null;
    }

    if (!from) {
        logger.warn("Resend configured but sender is missing. Set RESEND_FROM or SMTP_FROM.");
        return null;
    }

    return {
        apiKey,
        from,
    };
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
    if (provider === "resend") {
        return Boolean(getResendConfig());
    }
    return Boolean(getSmtpConfig());
};

const sendViaResend = async ({ to, subject, html, text }, resendConfig) => {
    const payload = {
        from: resendConfig.from,
        to: [to],
        subject,
    };

    if (html) payload.html = html;
    if (text) payload.text = text;

    const response = await axios.post("https://api.resend.com/emails", payload, {
        headers: {
            Authorization: `Bearer ${resendConfig.apiKey}`,
            "Content-Type": "application/json",
        },
        timeout: 15000,
    });

    const messageId = response?.data?.id;
    logger.info(`Email sent via Resend${messageId ? ` (${messageId})` : ""}`);
    return { success: true };
};

const sendViaSmtp = async ({ to, subject, html, text }, smtpConfig) => {
    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465,
        auth: smtpConfig.auth,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
    });

    await transporter.sendMail({
        from: smtpConfig.from,
        to,
        subject,
        text,
        html,
    });

    logger.info("Email sent via SMTP");
    return { success: true };
};

const sendEmail = async ({ to, subject, html, text }) => {
    const provider = getEmailProvider();

    try {
        if (provider === "resend") {
            const resendConfig = getResendConfig();
            if (!resendConfig) {
                logger.warn("Email provider is set to Resend but configuration is incomplete.");
                return { success: false, error: "Resend not configured" };
            }
            return await sendViaResend({ to, subject, html, text }, resendConfig);
        }

        const smtpConfig = getSmtpConfig();
        if (!smtpConfig) {
            logger.warn("SMTP not configured. Email not sent.");
            return { success: false, error: "SMTP not configured" };
        }

        return await sendViaSmtp({ to, subject, html, text }, smtpConfig);
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
        return { success: false, error: "Email send failed" };
    }
};

module.exports = {
    sendEmail,
    isEmailConfigured,
};
