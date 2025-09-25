// fileName: src/Controller/Web/Chat/Service/Websockets.js

const WebSocket = require('ws');
const ChatWeb = require('../../../../Data/model/ChatWeb'); // Ajustamos la ruta para llegar a los modelos
const Usuario = require('../../../../Data/model/Usuarios'); // Ajustamos la ruta para llegar a los modelos

// Creamos una función que se encargará de toda la lógica del WebSocket
function initializeWebsockets(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'init') {
          ws.userId = data.userId;
          return;
        }
        const { userId, recipientId, text } = data;
        const remitente = await Usuario.findById(userId).select('nombre avatar');
        let chat = await ChatWeb.findOne({ participantes: { $all: [userId, recipientId] } });
        if (!chat) {
          chat = new ChatWeb({ participantes: [userId, recipientId], mensajes: [] });
        }
        chat.mensajes.push({ remitenteId: userId, texto: text, fecha: new Date() });
        await chat.save();
        const response = {
          remitenteId: userId,
          recipientId,
          remitenteNombre: remitente.nombre,
          remitenteAvatar: remitente.avatar,
          text,
          timestamp: new Date().toISOString(),
        };
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && (client.userId === userId || client.userId === recipientId)) {
            client.send(JSON.stringify(response));
          }
        });
      } catch (err) {
        console.error('Error en mensaje WebSocket:', err);
      }
    });

    ws.on('close', () => console.log('Cliente WebSocket desconectado'));
  });
}

// Exportamos la función para poder usarla en app.js
module.exports = initializeWebsockets;