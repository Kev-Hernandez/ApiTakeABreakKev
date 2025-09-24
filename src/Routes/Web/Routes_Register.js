const express = require('express');
const router = express.Router();
const Register = require('../../Controller/Web/Register/Controller_Register');// ruta para registrar  a los usuarios

// Ruta para registrar usuario
router.post('/register', Register.register);

module.exports = router;