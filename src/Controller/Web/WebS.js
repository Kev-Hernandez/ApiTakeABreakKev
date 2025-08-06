/*
const WebSocket = require('ws');
const mongoose = require('mongoose');
const ChatWeb = require('../../Data/model/ChatWeb');
const Usuario = require('../../Data/model/Usuarios');

const wss = new WebSocket.Server({ port: 5000 });

// Manejo de conexiones
wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const { userId, recipientId, text } = data;

      // Buscar o crear un chat entre los dos usuarios
      let chat = await ChatWeb.findOne({
        participantes: { $all: [userId, recipientId] }
      });

      if (!chat) {
        chat = new ChatWeb({
          participantes: [userId, recipientId],
          mensajes: []
        });
      }

      // Crear nuevo mensaje
      const nuevoMensaje = {
        remitenteId: userId,
        texto: text,
        fecha: new Date()
      };

      chat.mensajes.push(nuevoMensaje);
      await chat.save();

      // Obtener el nombre del remitente
      const remitente = await Usuario.findById(userId).select('nombre');

      // Preparar respuesta con nombre
      const response = {
        remitenteId: userId,
        remitenteNombre: remitente?.nombre || 'Desconocido',
        text: text,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      };

      // Enviar a todos los clientes conectados
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(response));
        }
      });

    } catch (err) {
      console.error('Error al procesar el mensaje:', err);
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});*/
