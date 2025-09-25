// fileName: src/Routes/Web/index.js (VERSIÓN FINAL Y LIMPIA)

const express = require('express');
const router = express.Router();

// Importamos los únicos dos archivos de rutas que necesitamos
const authRoutes = require('./auth.routes.js');
const userRoutes = require('./user.routes.js');
const chatRoutes = require('./chat.routes.js');

// La recepcionista le asigna una URL base a cada departamento
router.use('/auth', authRoutes); // Para /login y /register
router.use('/users', userRoutes); // Para todo lo de usuarios
router.use('/chat', chatRoutes); // Para todo lo de chats

module.exports = router;