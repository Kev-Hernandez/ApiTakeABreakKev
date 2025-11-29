// 📁 Archivo: src/Routes/Web/friends.routes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware.js');

// 1. Importamos TODAS las funciones del controlador
const {
  sendFriendRequest,
  getMyFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest
} = require('../../controller/Web/friends/friends.controller.js');

// 2. Protegemos TODAS las rutas de amigos con el middleware
router.use(authMiddleware);

// --- Definición de las 5 rutas ---

// 1. Enviar una solicitud (Usado en la pestaña "Explorar")
// POST /api/v1/friends/request
router.post('/request', sendFriendRequest);

// 2. Obtener amigos confirmados (Usado por ChatContext)
// GET /api/v1/friends/my-friends
router.get('/my-friends', getMyFriends);

// 3. Obtener solicitudes pendientes (Usado en la pestaña "Solicitudes")
// GET /api/v1/friends/requests
router.get('/requests', getFriendRequests);

// 4. Aceptar una solicitud
// POST /api/v1/friends/accept
router.post('/accept', acceptFriendRequest);

// 5. Rechazar una solicitud
// POST /api/v1/friends/reject
router.post('/reject', rejectFriendRequest);

module.exports = router;