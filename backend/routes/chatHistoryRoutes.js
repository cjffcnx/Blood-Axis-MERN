const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
    saveChatHistory,
    getUserChatHistory,
    getAllChatHistory,
} = require("../controllers/chatHistoryController");

const router = express.Router();

router.post("/save", saveChatHistory);
router.get("/my-history", authMiddelware, getUserChatHistory);
router.get("/all", authMiddelware, adminMiddleware, getAllChatHistory);

module.exports = router;
