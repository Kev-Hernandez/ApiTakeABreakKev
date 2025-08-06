const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./Data/Conexion/DB');
const Sync = require('./Data/sync');

const ChatWeb = require('./Data/model/ChatWeb');
const Usuario = require('./Data/model/Usuarios');

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

(async () => {
  await Sync();
})();

const authRoutes = require('./Routes/Web/authRoutes');
app.use('/api/web/auth', authRoutes);

const webRoutes = require('./Routes/Web');
app.use('/api/web', webRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.get('/api/web/chat/history/:userId/:recipientId', async (req, res) => {
  try {
    const { userId, recipientId } = req.params;

    const chat = await ChatWeb.findOne({
      participantes: { $all: [userId, recipientId] }
    });

    if (!chat) {
      return res.status(200).json({ mensajes: [] });
    }

    res.json({ mensajes: chat.mensajes });
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

//ruta borrar historial
app.delete('/api/web/chat/history/:userId/:recipientId', async (req, res) => {
  const { userId, recipientId } = req.params;

  try {
    const chat = await ChatWeb.findOne({
      participantes: { $all: [userId, recipientId] }
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat no encontrado' });
    }

    chat.mensajes = [];
    await chat.save();

    res.status(200).json({ message: 'Historial eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar historial' });
  }
});



const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      // Caso especial: mensaje inicial para registrar userId en esta conexión
      if (data.type === 'init') {
        ws.userId = data.userId;
        console.log(`Conexión inicializada para userId: ${ws.userId}`);
        return; // No seguimos procesando este mensaje
      }

      const { userId, recipientId, text } = data;

      let chat = await ChatWeb.findOne({
        participantes: { $all: [userId, recipientId] }
      });

      if (!chat) {
        chat = new ChatWeb({
          participantes: [userId, recipientId],
          mensajes: []
        });
      }

      const nuevoMensaje = {
        remitenteId: userId,
        texto: text,
        fecha: new Date()
      };

      chat.mensajes.push(nuevoMensaje);
      await chat.save();

      const remitente = await Usuario.findById(userId).select('nombre');

      const response = {
        remitenteId: userId,
        recipientId,
        remitenteNombre: remitente?.nombre || 'Desconocido',
        text,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      };

      // Enviar sólo a usuarios involucrados (emisor y receptor)
      wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          (client.userId === userId || client.userId === recipientId)
        ) {
          client.send(JSON.stringify(response));
        }
      });
    } catch (err) {
      console.error('Error al procesar el mensaje WebSocket:', err);
    }
  });

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Express y WebSocket corriendo en puerto ${PORT}`);
});
