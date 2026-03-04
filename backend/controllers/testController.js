const { sendEmail, isEmailConfigured } = require("../utils/emailService");

const testController = (req, res) => {
  res.status(200).send({
    message: "Welcome user",
    success: true,
  });
};

const testEmailController = async (req, res) => {
  const { to } = req.body;

  if (!to) {
    return res.status(400).send({
      success: false,
      message: "Recipient email is required",
    });
  }

  if (!isEmailConfigured()) {
    return res.status(503).send({
      success: false,
      message: "Email service unavailable. Configure SMTP env vars.",
    });
  }

  const result = await sendEmail({
    to,
    subject: "Blood Bank SMTP Test",
    text: "This is a test email from Blood Bank.",
    html: "<p>This is a test email from Blood Bank.</p>",
  });

  if (!result.success) {
    return res.status(500).send({
      success: false,
      message: "Failed to send test email",
    });
  }

  return res.status(200).send({
    success: true,
    message: "Test email sent",
  });
};

module.exports = { testController, testEmailController };
