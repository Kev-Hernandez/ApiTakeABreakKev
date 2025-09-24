const express = require('express');
const router = express.Router();
const {getProfile, updateProfile } = require('../../Controller/Web/User/Controller_User');


// Nuevas para editar el perfil del usuario
router.get('/getprofile/:userId', getProfile);
router.put('/updateprofile/:userId', updateProfile);



module.exports = router;
