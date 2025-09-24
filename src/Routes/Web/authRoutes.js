const express = require('express');
const router = express.Router();
const {getProfile, updateProfile } = require('../../Controller/Web/authController');







// Nuevas rutas para el perfil
router.get('/profile/:userId', getProfile);
router.put('/profile/:userId', updateProfile);



module.exports = router;
