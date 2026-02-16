const express = require("express");
const { sendContactMessageController } = require("../controllers/contactController");

const router = express.Router();

router.post("/send-message", sendContactMessageController);

module.exports = router;
