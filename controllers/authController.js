const userModel = require("../models/userModel");
const pendingRegistrationModel = require("../models/pendingRegistrationModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail, isEmailConfigured } = require("../utils/emailService");
const { getLogger } = require("../utils/logger");

const logger = getLogger("authController");

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const RESET_TOKEN_EXPIRY_MINUTES = 30;

const isValidEmail = (email) => {
  if (!email) return false;
  const pattern = /^(?!.*\.\.)(?!\.)(?!.*\.$)[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/;
  return pattern.test(email);
};

const getPasswordError = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
  return "";
};

const generateOtp = () => {
  const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
  return otp;
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const registerController = async (req, res) => {
  try {
    return res.status(400).send({
      success: false,
      message: "Registration requires OTP verification. Use /register/request-otp.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Register API",
      error,
    });
  }
};

const requestRegisterOtpController = async (req, res) => {
  try {
    const {
      name,
      role,
      email,
      password,
      phone,
      organisationName,
      address,
      hospitalName,
      preferredCity,
      website,
    } = req.body;

    if (!email || !password || !role || !address || !phone) {
      return res.status(400).send({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).send({
        success: false,
        message: "Invalid email address",
      });
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      return res.status(400).send({
        success: false,
        message: passwordError,
      });
    }

    if (role !== "donar") {
      return res.status(403).send({
        success: false,
        message:
          "Only Donors can register directly. Organisations and Hospitals must submit a request.",
      });
    }

    if (!name || !preferredCity) {
      return res.status(400).send({
        success: false,
        message: "Name and city are required",
      });
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "Email already registered",
      });
    }

    const now = new Date();
    const existingPending = await pendingRegistrationModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingPending && existingPending.resendAvailableAt > now) {
      return res.status(429).send({
        success: false,
        message: "Please wait before requesting another OTP",
      });
    }

    if (!isEmailConfigured()) {
      logger.warn("OTP request failed: SMTP not configured");
      return res.status(503).send({
        success: false,
        message: "Email service unavailable. Please try again later.",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const resendAvailableAt = new Date(
      now.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000
    );

    const passwordHash = await bcrypt.hash(password, 10);

    const emailResult = await sendEmail({
      to: email,
      subject: "Your Blood Bank OTP Code",
      text: `Your verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      html: `<p>Your verification code is <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
    });

    if (!emailResult.success) {
      return res.status(503).send({
        success: false,
        message: "Unable to send OTP email. Please try again later.",
      });
    }

    await pendingRegistrationModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        role,
        name,
        organisationName,
        hospitalName,
        address,
        phone,
        preferredCity,
        website,
        passwordHash,
        otpHash,
        otpExpiresAt,
        resendAvailableAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).send({
      success: true,
      message: "OTP sent to your email",
      cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    logger.error(`Request OTP failed: ${error.message}`);
    return res.status(500).send({
      success: false,
      message: "Error requesting OTP",
    });
  }
};

const verifyRegisterOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).send({
        success: false,
        message: "Email and OTP are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).send({
        success: false,
        message: "Invalid email address",
      });
    }

    const pending = await pendingRegistrationModel.findOne({
      email: email.toLowerCase(),
    });

    if (!pending) {
      return res.status(400).send({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    if (pending.otpExpiresAt < new Date()) {
      await pendingRegistrationModel.deleteOne({ _id: pending._id });
      return res.status(400).send({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    const isMatch = await bcrypt.compare(otp, pending.otpHash);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    const existingUser = await userModel.findOne({ email: pending.email });
    if (existingUser) {
      await pendingRegistrationModel.deleteOne({ _id: pending._id });
      return res.status(409).send({
        success: false,
        message: "User already exists",
      });
    }

    const user = new userModel({
      name: pending.name,
      role: pending.role,
      email: pending.email,
      password: pending.passwordHash,
      phone: pending.phone,
      organisationName: pending.organisationName,
      address: pending.address,
      hospitalName: pending.hospitalName,
      preferredCity: pending.preferredCity,
      website: pending.website,
    });

    await user.save();
    await pendingRegistrationModel.deleteOne({ _id: pending._id });

    return res.status(201).send({
      success: true,
      message: "Registration verified successfully",
    });
  } catch (error) {
    logger.error(`Verify OTP failed: ${error.message}`);
    return res.status(500).send({
      success: false,
      message: "Error verifying OTP",
    });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).send({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!isEmailConfigured()) {
      logger.warn("Forgot password failed: SMTP not configured");
      return res.status(503).send({
        success: false,
        message: "Email service unavailable. Please try again later.",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = hashToken(resetToken);
      const resetPasswordExpiresAt = new Date(
        Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
      );

      user.resetPasswordTokenHash = resetTokenHash;
      user.resetPasswordExpiresAt = resetPasswordExpiresAt;
      await user.save();

      const clientUrl = process.env.CLIENT_URL || "";
      const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

      const emailResult = await sendEmail({
        to: user.email,
        subject: "Reset your Blood Bank password",
        text: `Reset your password using this link: ${resetUrl}. This link expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes.`,
        html: `<p>Reset your password using this link: <a href="${resetUrl}">${resetUrl}</a>. This link expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes.</p>`,
      });

      if (!emailResult.success) {
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpiresAt = null;
        await user.save();
      }
    }

    return res.status(200).send({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    logger.error(`Forgot password failed: ${error.message}`);
    return res.status(500).send({
      success: false,
      message: "Error processing forgot password",
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).send({
        success: false,
        message: "Token and password are required",
      });
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      return res.status(400).send({
        success: false,
        message: passwordError,
      });
    }

    const tokenHash = hashToken(token);
    const user = await userModel.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Token is invalid or expired",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error(`Reset password failed: ${error.message}`);
    return res.status(500).send({
      success: false,
      message: "Error resetting password",
    });
  }
};

//login call back
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid Credentials",
      });
    }
    //check role
    if (user.role !== req.body.role) {
      return res.status(500).send({
        success: false,
        message: "role dosent match",
      });
    }
    //compare password
    const comparePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!comparePassword) {
      return res.status(500).send({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).send({
      success: true,
      message: "Login Successfully",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Login API",
      error,
    });
  }
};

//GET CURRENT USER
const currentUserController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    return res.status(200).send({
      success: true,
      message: "User Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "unable to get current user",
      error,
    });
  }
};

//UPDATE PROFILE
const updateProfileController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { name, email, phone, preferredCity } = req.body;

    // Find current user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();
    const twelveHoursInMs = 12 * 60 * 60 * 1000;

    // Check email update restriction (12 hours)
    if (email && email !== user.email) {
      if (user.lastEmailUpdate) {
        const timeSinceLastEmailUpdate = now - new Date(user.lastEmailUpdate);
        if (timeSinceLastEmailUpdate < twelveHoursInMs) {
          const hoursRemaining = Math.ceil((twelveHoursInMs - timeSinceLastEmailUpdate) / (60 * 60 * 1000));
          return res.status(400).send({
            success: false,
            message: `You can only change email once every 12 hours. Please wait ${hoursRemaining} more hour(s).`,
          });
        }
      }

      // Check if email already exists
      const emailExists = await userModel.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).send({
          success: false,
          message: "Email already in use by another account",
        });
      }

      user.email = email;
      user.lastEmailUpdate = now;
    }

    // Check phone update restriction (12 hours)
    if (phone && phone !== user.phone) {
      if (user.lastPhoneUpdate) {
        const timeSinceLastPhoneUpdate = now - new Date(user.lastPhoneUpdate);
        if (timeSinceLastPhoneUpdate < twelveHoursInMs) {
          const hoursRemaining = Math.ceil((twelveHoursInMs - timeSinceLastPhoneUpdate) / (60 * 60 * 1000));
          return res.status(400).send({
            success: false,
            message: `You can only change phone once every 12 hours. Please wait ${hoursRemaining} more hour(s).`,
          });
        }
      }
      user.phone = phone;
      user.lastPhoneUpdate = now;
    }

    // Update name and city (no restrictions)
    if (name) user.name = name;
    if (preferredCity !== undefined) user.preferredCity = preferredCity;

    await user.save();

    return res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error updating profile",
      error,
    });
  }
};

// SEND EMAIL (for organisations to contact donors)
const sendEmailController = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    // Validate input
    if (!to || !subject || (!html && !text)) {
      return res.status(400).send({
        success: false,
        message: "Email address, subject, and message content are required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).send({
        success: false,
        message: "Invalid email address",
      });
    }

    const result = await sendEmail({
      to,
      subject,
      html: html || text,
      text: text || html,
    });

    if (result.success) {
      return res.status(200).send({
        success: true,
        message: "Email sent successfully",
      });
    } else {
      logger.error(`Email send failed: ${result.error}`);
      return res.status(503).send({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }
  } catch (error) {
    logger.error(`Send email error: ${error.message}`);
    return res.status(500).send({
      success: false,
      message: "Error sending email",
      error,
    });
  }
};

module.exports = {
  registerController,
  requestRegisterOtpController,
  verifyRegisterOtpController,
  loginController,
  currentUserController,
  updateProfileController,
  forgotPasswordController,
  resetPasswordController,
  sendEmailController,
};
