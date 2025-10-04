// fileName: src/Routes/Web/user.routes.js

const express = require('express');
const router = express.Router();

// Importamos nuestros controladores limpios y organizados
const userController = require('../../Controller/Web/User/Controller_User');
const avatarsController = require('../../Controller/Web/User/Controller_avatars');
const authMiddleware = require('../../middleware/authMiddleware.js'); // Middleware para proteger las rutas

// --- Rutas para Usuarios ---
// GET /api/v1/users/ -> Obtiene todos los usuarios
router.get('/', authMiddleware, userController.getActiveUsers); 

// GET /api/v1/users/:userId -> Obtiene un perfil específico
router.get('/:userId', userController.getProfile); 

// PUT /api/v1/users/:userId -> Actualiza un perfil
router.put('/:userId', userController.updateProfile); 

// --- Rutas de Utilidades para Usuarios ---
// GET /api/v1/users/utils/avatars -> Obtiene los avatares disponibles
router.get('/utils/avatars', avatarsController.getAvatars);

module.exports = router;