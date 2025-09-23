const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Rutas correctas desde 'src/Routes/Web/'
const Usuarios = require('../../Data/model/Usuarios');
const ChatWeb = require('../../Data/model/ChatWeb');

// --- RUTAS DE USUARIOS ---

// Obtener usuarios activos
router.get('/usuarios/activos', async (req, res) => {
  try {
    const usuarios = await Usuarios.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios activos' });
  }
});

// Obtener un usuario por ID
router.get('/usuarios/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID no válido' });
    }
    const user = await Usuarios.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar un usuario por ID
router.put('/usuarios/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de usuario no válido' });
    }
    const { password, ...updateData } = req.body;
    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const usuario = await Usuarios.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Perfil actualizado con éxito', usuario });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


// --- RUTAS DE CHAT ---

// Obtener historial de chat
router.get('/chat/history/:userId/:recipientId', async (req, res) => {
  try {
    const { userId, recipientId } = req.params;
    const chat = await ChatWeb.findOne({ participantes: { $all: [userId, recipientId] } });
    if (!chat) return res.status(200).json({ mensajes: [] });
    res.json({ mensajes: chat.mensajes });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Borrar historial de chat
router.delete('/chat/history/:userId/:recipientId', async (req, res) => {
  try {
    const { userId, recipientId } = req.params;
    const chat = await ChatWeb.findOne({ participantes: { $all: [userId, recipientId] } });
    if (!chat) return res.status(404).json({ message: 'Chat no encontrado' });
    chat.mensajes = [];
    await chat.save();
    res.status(200).json({ message: 'Historial eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar historial' });
  }
});


module.exports = router;