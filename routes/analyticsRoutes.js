const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  bloodGroupDetailsContoller,
  getDonorStatsController,
  getDonorHistoryController,
  getAdminAnalyticsOverviewController,
} = require("../controllers/analyticsController");

const router = express.Router();

//routes

//GET BLOOD DATA
router.get("/bloodGroups-data", authMiddelware, bloodGroupDetailsContoller);

// GET DONOR STATS
router.get("/donor-stats", authMiddelware, getDonorStatsController);

// GET DONOR HISTORY
router.get("/donor-history", authMiddelware, getDonorHistoryController);

// GET ADMIN ANALYTICS OVERVIEW
router.get(
  "/admin-overview",
  authMiddelware,
  adminMiddleware,
  getAdminAnalyticsOverviewController
);

module.exports = router;
