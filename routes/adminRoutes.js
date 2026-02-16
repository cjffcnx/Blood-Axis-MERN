const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  getDonarsListController,
  getHospitalListController,
  getOrgListController,
  deleteDonarController,
  updateDonarController,
  updateHospitalController,
  updateOrgController,
} = require("../controllers/adminController");
const adminMiddleware = require("../middlewares/adminMiddleware");

//router object
const router = express.Router();

//Routes

//GET || DONAR LIST
router.get(
  "/donar-list",
  authMiddelware,
  adminMiddleware,
  getDonarsListController
);
//GET || HOSPITAL LIST
router.get(
  "/hospital-list",
  authMiddelware,
  adminMiddleware,
  getHospitalListController
);
//GET || ORG LIST
router.get("/org-list", authMiddelware, adminMiddleware, getOrgListController);
// ==========================

// DELETE DONAR || GET
router.delete(
  "/delete-donar/:id",
  authMiddelware,
  adminMiddleware,
  deleteDonarController
);

// UPDATE DONAR || PUT
router.put(
  "/update-donar/:id",
  authMiddelware,
  adminMiddleware,
  updateDonarController
);

// UPDATE HOSPITAL || PUT
router.put(
  "/update-hospital/:id",
  authMiddelware,
  adminMiddleware,
  updateHospitalController
);

// UPDATE ORGANISATION || PUT
router.put(
  "/update-org/:id",
  authMiddelware,
  adminMiddleware,
  updateOrgController
);

//EXPORT
module.exports = router;
