const express = require("express");
const router = express.Router();
const { chatbot } = require("../controllers/chatbotController");
const  auth =require("../middleware/authMiddleware");

router.post("/", auth,chatbot);

module.exports = router;
