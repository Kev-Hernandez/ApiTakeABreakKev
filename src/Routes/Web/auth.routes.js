// fileName: src/Routes/Web/auth.routes.js

const express = require('express');
const router = express.Router();

const RegisterController = require('../../Controller/Web/Register/Controller_Register');
const LoginController = require('../../Controller/Web/login/Controller_Login');

// Todas las rutas de autenticación van aquí
router.post('/register', RegisterController.register);
router.post('/login', LoginController.login);

module.exports = router;