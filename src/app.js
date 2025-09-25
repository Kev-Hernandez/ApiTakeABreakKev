const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// ======================= CORRECCIÓN FINAL DE RUTAS =======================
// Desde 'src/app.js', buscamos en el mismo nivel con './'
const connectDB = require('./Data/Conexion/DB');
const Sync = require('./Data/sync');
const webRoutes = require('./Routes/Web'); // Carga index.js de la carpeta Web
const RegisterRoutes = require('./Routes/Web/Routes_Register'); //ruta para  registrar a los usuarios
const loginRoutes = require('./Routes/Web/Routes_Login'); //ruta para  loguear a los usuarios
const UpdateUserRoutes = require('./Routes/Web/Routes_User'); //ruta para actualizar el perfil del usuario
const ChatWeb = require('./Data/model/ChatWeb');
const Usuario = require('./Data/model/Usuarios');
const authMiddlewareRoutes = require('./Middleware/authMiddleware');  // Middleware de autenticación para funiones dle chat
const Avatars = require('./Routes/Web/Routes_Avatars'); //ruta para obtener los avatares
// =======================================================================

dotenv.config();
const app = express();

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Conexión a la base de datos exitosa.');

    await Sync();
    console.log('✅ Sincronización de modelos completada.');

    app.use(cors());
    app.use(express.json());
    
    // --- Registra TODAS tus rutas de la API ---
    app.use('/api/avatares', express.static(path.join(__dirname, '..', 'public', 'avatares')), authMiddlewareRoutes);
    app.use('/api/web',Avatars, authMiddlewareRoutes);
    app.use('/api', RegisterRoutes); // Para registrar a los usuarios
    app.use('/api', loginRoutes); // Para loguear a los usuarios
    app.use('/api/web', webRoutes, authMiddlewareRoutes);     // Para todo lo demás (usuarios, chat, perfil)
    app.use('/api/user', UpdateUserRoutes, authMiddlewareRoutes); // Rutas protegidas para actualizar perfil de usuario

    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    // --- LÓGICA DE WEBSOCKET ---
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

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo y escuchando en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();