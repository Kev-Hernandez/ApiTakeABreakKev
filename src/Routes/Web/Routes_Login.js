const express = require('express');
const router = express.Router();
const loginController = require('../../Controller/Web/login/Controller_Login');// ruta loguear a los usuarios a los usuarios


router.post('/login', loginController.login);

module.exports = router;
