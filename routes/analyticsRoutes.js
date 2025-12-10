const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  bloodGroupDetailsContoller,
  getDonorStatsController,
  getDonorHistoryController,
} = require("../controllers/analyticsController");

const router = express.Router();

//routes

//GET BLOOD DATA
router.get("/bloodGroups-data", authMiddelware, bloodGroupDetailsContoller);

// GET DONOR STATS
router.get("/donor-stats", authMiddelware, getDonorStatsController);

// GET DONOR HISTORY
router.get("/donor-history", authMiddelware, getDonorHistoryController);

module.exports = router;
