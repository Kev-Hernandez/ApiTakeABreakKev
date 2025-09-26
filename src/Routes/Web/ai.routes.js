// fileName: src/Routes/Web/ai.routes.js

const express = require('express');
const router = express.Router();
const aiController = require('../../Controller/Web/AI/ai.controller');

// La ruta final será: POST /api/v1/ai/sentiment
router.post('/sentiment', aiController.analyzeSentiment);

module.exports = router;