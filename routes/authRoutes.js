const express = require("express");
const {
  registerController,
  requestRegisterOtpController,
  verifyRegisterOtpController,
  loginController,
  currentUserController,
  updateProfileController,
  forgotPasswordController,
  resetPasswordController,
  sendEmailController,
} = require("../controllers/authController");
const authMiddelware = require("../middlewares/authMiddelware");

const router = express.Router();

//routes
//REGISTER || POST
router.post("/register", registerController);
router.post("/register/request-otp", requestRegisterOtpController);
router.post("/register/verify-otp", verifyRegisterOtpController);

//LOGIN || POST
router.post("/login", loginController);

//FORGOT PASSWORD || POST
router.post("/forgot-password", forgotPasswordController);

//RESET PASSWORD || POST
router.post("/reset-password", resetPasswordController);

//GET CURRENT USER || GET
router.get("/current-user", authMiddelware, currentUserController);

//UPDATE PROFILE || PUT
router.put("/update-profile", authMiddelware, updateProfileController);

//SEND EMAIL || POST
router.post("/send-email", authMiddelware, sendEmailController);

module.exports = router;
