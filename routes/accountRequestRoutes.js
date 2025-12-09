const express = require("express");
const {
    createAccountRequestController,
    getAccountRequestsController,
    updateRequestStatusController,
} = require("../controllers/accountRequestController");
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
        cb(null, "proof-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, PNG, JPG files are allowed"), false);
        }
    }
});

// Create Request (Public) - expecting form-data with 'proofFile' field
router.post("/create", upload.single("proofFile"), createAccountRequestController);

// Get All Requests (Admin Only)
router.get("/", authMiddleware, adminMiddleware, getAccountRequestsController);

// Update Status (Admin Only)
router.put("/:id/status", authMiddleware, adminMiddleware, updateRequestStatusController);

module.exports = router;
