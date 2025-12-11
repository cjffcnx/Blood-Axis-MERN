const express = require("express");
const {
    createRequestController,
    getRequestsController,
    getApprovedRequestsController,
    updateRequestStatusController,
    createHospitalRequestController,
    getHospitalRequestsForOrgController,
    fulfillRequestController,
    getHospitalRequestsForHospitalController,
    confirmRequestController,
    approveRequestController,
    rejectRequestController,
    getOrganisationsController
} = require("../controllers/requestController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

//routes

//CREATE REQUEST || POST (Public)
router.post("/create-request", upload.single("attachment"), createRequestController);

//GET ALL REQUESTS || GET (Admin Only)
router.get("/get-requests", authMiddleware, adminMiddleware, getRequestsController);

//GET APPROVED REQUESTS || GET (Authenticated - Org/Hospital)
// Using authMiddleware but NOT adminMiddleware
router.get("/get-approved-requests", authMiddleware, getApprovedRequestsController);

//UPDATE STATUS || PUT (Admin Only)
router.put("/update-status/:id", authMiddleware, adminMiddleware, updateRequestStatusController);

// CREATE HOSPITAL REQUEST || POST
router.post("/hospital-request", authMiddleware, createHospitalRequestController);

// LIST ORGANISATIONS FOR HOSPITAL SELECTION || GET
router.get("/organisations", authMiddleware, getOrganisationsController);

// GET HOSPITAL REQUESTS || GET
router.get("/hospital-requests", authMiddleware, getHospitalRequestsForOrgController);

// FULFILL REQUEST || PUT
router.put("/fulfill/:id", authMiddleware, fulfillRequestController);

// GET HOSPITAL'S OWN REQUESTS || GET
router.get("/my-requests", authMiddleware, getHospitalRequestsForHospitalController);

// CONFIRM RECEIPT || PUT
router.put("/confirm/:id", authMiddleware, confirmRequestController);

// APPROVE RECEIPT || PUT
router.put("/approve/:id", authMiddleware, approveRequestController);

// REJECT RECEIPT || PUT
router.put("/reject/:id", authMiddleware, rejectRequestController);

module.exports = router;
