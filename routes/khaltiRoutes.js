const express = require("express");
const { khaltiInitiateController, khaltiVerifyController } = require("../controllers/khaltiController");

const router = express.Router();

// KHALTI PAYMENT INITIATE
router.post("/initiate", khaltiInitiateController);

// KHALTI PAYMENT VERIFY
router.post("/verify", khaltiVerifyController);

module.exports = router;
