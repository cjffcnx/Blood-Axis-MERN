const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getDonarsWithBloodGroupController,
  getHospitalController,
  getPublicHospitalsController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
} = require("../controllers/inventoryController");

const router = express.Router();

//routes
// ADD INVENTORY || POST
router.post("/create-inventory", authMiddelware, createInventoryController);

//GET ALL BLOOD RECORDS
router.get("/get-inventory", authMiddelware, getInventoryController);
//GET RECENT BLOOD RECORDS
router.get(
  "/get-recent-inventory",
  authMiddelware,
  getRecentInventoryController
);

//GET HOSPITAL BLOOD RECORDS
router.post(
  "/get-inventory-hospital",
  authMiddelware,
  getInventoryHospitalController
);

//GET DONAR RECORDS
router.get("/get-donars", authMiddelware, getDonarsController);

//GET DONAR RECORDS WITH BLOOD GROUP FROM INVENTORIES
router.get("/get-donars-with-bloodgroup", authMiddelware, getDonarsWithBloodGroupController);

//GET HOSPITAL RECORDS
router.get("/get-hospitals", authMiddelware, getHospitalController);

//GET HOSPITAL RECORDS (PUBLIC)
router.get("/public-hospitals", getPublicHospitalsController);

//GET orgnaisation RECORDS
router.get("/get-orgnaisation", authMiddelware, getOrgnaisationController);

//GET orgnaisation RECORDS
router.get(
  "/get-orgnaisation-for-hospital",
  authMiddelware,
  getOrgnaisationForHospitalController
);

module.exports = router;
