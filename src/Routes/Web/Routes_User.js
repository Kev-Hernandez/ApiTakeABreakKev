const express = require('express');
const router = express.Router();
const getProfile = require('../../Controller/Web/User/Controller_User');
const updateProfile = require('../../Controller/Web/User/Controller_User');


// Nuevas para editar el perfil del usuario
router.get('/getprofile/:userId', getProfile.getProfile);
router.put('/updateprofile/:userId', updateProfile.updateProfile);



module.exports = router;
