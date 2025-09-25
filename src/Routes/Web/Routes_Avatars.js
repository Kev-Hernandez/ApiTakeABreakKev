const express = require('express');
const router = express.Router();
const avatarsController = require('../../Controller/Web/User/Controller_avatars');

// Cuando se visite la ruta base (que será '/api/web'), se ejecutará esto en la sub-ruta '/avatars'
// URL final: /api/web/avatars
router.get('/avatars', avatarsController.getAvatars);

module.exports = router;