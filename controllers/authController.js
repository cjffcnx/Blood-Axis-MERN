const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    //validation
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "User ALready exists",
      });
    }

    // Role restriction: Only 'donar' can register directly
    if (req.body.role !== "donar") {
      return res.status(403).send({
        success: false,
        message: "Only Donors can register directly. Organisations and Hospitals must submit a request.",
      });
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
    //rest data
    const user = new userModel(req.body);
    await user.save();
    return res.status(201).send({
      success: true,
      message: "User Registerd Successfully",
      user,
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

module.exports = { registerController, loginController, currentUserController, updateProfileController };
