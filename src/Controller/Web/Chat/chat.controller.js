// fileName: src/Controller/Web/Chat/chat.controller.js

const ChatWeb = require('../../../Data/model/ChatWeb');

// Obtener historial de chat
exports.getChatHistory = async (req, res) => {
  try {
    const { userId, recipientId } = req.params;
    const chat = await ChatWeb.findOne({ participantes: { $all: [userId, recipientId] } });
    
    // Si no hay chat, devuelve un arreglo de mensajes vacío, lo cual es correcto.
    if (!chat) return res.status(200).json({ mensajes: [] });
    
    res.json({ mensajes: chat.mensajes });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// Borrar historial de chat
exports.deleteChatHistory = async (req, res) => {
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
};