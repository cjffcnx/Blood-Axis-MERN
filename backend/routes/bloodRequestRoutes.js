const express = require("express");
const {
    validateBloodRequestController,
} = require("../controllers/bloodRequestController");

const router = express.Router();

router.post("/validate", validateBloodRequestController);

module.exports = router;
