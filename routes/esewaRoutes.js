const express = require("express");
const { esewaInitiateController, esewaVerifyController } = require("../controllers/esewaController");

const router = express.Router();

// Initiate eSewa payment (sign payload)
router.post("/initiate", esewaInitiateController);

// Verify eSewa payment
router.post("/verify", esewaVerifyController);

module.exports = router;
