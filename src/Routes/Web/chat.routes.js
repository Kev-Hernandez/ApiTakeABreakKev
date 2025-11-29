// fileName: src/Routes/Web/chat.routes.js

const express = require('express');
const router = express.Router();

const chatController = require('../../Controller/Web/chat/chat.controller');

// GET /api/v1/chat/history/:userId/:recipientId
router.get('/history/:userId/:recipientId', chatController.getChatHistory);

// DELETE /api/v1/chat/history/:userId/:recipientId
router.delete('/history/:userId/:recipientId', chatController.deleteChatHistory);

module.exports = router;