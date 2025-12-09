const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  bloodGroupDetailsContoller,
  getDonorStatsController,
} = require("../controllers/analyticsController");

const router = express.Router();

//routes

//GET BLOOD DATA
router.get("/bloodGroups-data", authMiddelware, bloodGroupDetailsContoller);

// GET DONOR STATS
router.get("/donor-stats", authMiddelware, getDonorStatsController);

module.exports = router;
