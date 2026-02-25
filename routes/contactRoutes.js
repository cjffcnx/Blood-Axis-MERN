const express = require("express");
const { sendContactMessageController, subscribeNewsletterController } = require("../controllers/contactController");

const router = express.Router();

router.post("/send-message", sendContactMessageController);
router.post("/newsletter/subscribe", subscribeNewsletterController);

module.exports = router;
