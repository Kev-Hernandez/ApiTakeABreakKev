const express = require('express');
const router = express.Router();
const Usuarios = require('../../Data/model/Usuarios');
const mongoose = require('mongoose');

// Ruta de prueba
router.get('/saludo', (req, res) => {
  res.json({ mensaje: '¡Hola desde Web API!' });
});

// Ruta para obtener usuarios activos (más específica primero)
router.get('/usuarios/activos', async (req, res) => {
  try {
    const usuarios = await Usuarios.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios activos' });
  }
});

// Ruta para obtener un usuario por ID (más general después)
router.get('/usuarios/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID no válido' });
    }

    const user = await Usuarios.findById(userId).select('nombre apellido email edad sexo preferences plataforma');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error.message);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
