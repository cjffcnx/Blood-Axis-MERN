const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  createDonorInterest,
  getInterestedDonors,
  getDonorInterestHistory,
  updateInterestStatus,
} = require("../controllers/donorInterestController");

const router = express.Router();

// Create donor interest
router.post("/create", authMiddelware, createDonorInterest);

// Get interested donors for organisation
router.get("/organisation/interested-donors", authMiddelware, getInterestedDonors);

// Get donor's interest history
router.get("/donor/history", authMiddelware, getDonorInterestHistory);

// Update interest status
router.put("/update-status", authMiddelware, updateInterestStatus);

module.exports = router;
