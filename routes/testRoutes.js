const express = require("express");
const { testController, testEmailController } = require("../controllers/testController");

//router object
const router = express.Router();

//routes
router.get("/", testController);
router.post("/email", testEmailController);

//export
module.exports = router;
