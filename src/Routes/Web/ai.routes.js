// fileName: src/Routes/Web/ai.routes.js

const express = require('express');
const router = express.Router();
const aiController = require('../../controller/Web/ia/ai.controller');
const  validateToken  = require('../../middleware/authMiddleware');

// La ruta final será: POST /api/v1/ai/sentiment
router.post('/recomendacion-chat', validateToken, aiController.obtenerRecomendacionChat);

module.exports = router;