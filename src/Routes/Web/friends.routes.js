// 📁 Archivo: src/Routes/Web/friends.routes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware.js'); // Middleware para proteger la ruta
const { sendFriendRequest } = require('../../Controller/Web/Friends/friends.controller.js'); // Importaremos el controlador aquí

// Definimos la ruta para enviar una solicitud.
// Usamos POST porque estamos creando un nuevo recurso (una solicitud).
// La ruta completa será: POST /api/v1/friends/request
router.post('/request', authMiddleware, sendFriendRequest);

module.exports = router;