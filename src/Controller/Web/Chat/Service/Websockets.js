const WebSocket = require('ws');
const ChatWeb = require('../../../../Data/model/ChatWeb');
const Usuario = require('../../../../Data/model/Usuarios');

require('dotenv').config(); 

function initializeWebsockets(server) {
  // Creamos el servidor de WebSockets montado sobre el servidor HTTP existente
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log(' Cliente WebSocket conectado');

    ws.on('message', async (message) => {
      try {
        // Parseamos el mensaje recibido
        const data = JSON.parse(message);
        
        // Manejo de inicialización 
        if (data.type === 'init') {
          ws.userId = data.userId;
          console.log(` Usuario autenticado en WS: ${data.userId}`);
          return;
        }

        // 2. Extraemos los datos del mensaje real
        const { userId, recipientId, text } = data;

        if (!text || !userId || !recipientId) {
            console.warn('⚠️ Mensaje incompleto recibido');
            return; 
        }

        // Preguntar a la IA (Python)
        const iaPromise = fetch(`${process.env.PYTHON_MICROSERVICE_URL}/api/web/analizar-mensaje`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: text })
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error(`Status ${res.status}`);
        })
        .then(data => data.emocion_detectada || 'neutral')
        .catch(err => {
            console.error(`[IA Error] No se pudo analizar emoción: ${err.message}`);
            return 'neutral'; // Fallback seguro
        });

        // Buscar datos del remitente 
        const remitentePromise = Usuario.findById(userId).select('nombre avatar');

        // Buscar la sala de chat existente
        const chatPromise = ChatWeb.findOne({ participantes: { $all: [userId, recipientId] } });

        // ⏱Esperamos a que los 3 terminen
        const [emocionDetectada, remitente, chatEncontrado] = await Promise.all([
            iaPromise,
            remitentePromise,
            chatPromise
        ]);

        console.log(`🤖 IA detectó: ${emocionDetectada} | Mensaje: "${text}"`);

    
        // GUARDADO EN BASE DE DATOS 
        
        let chat = chatEncontrado;
        if (!chat) {
          // Si no existe el chat, lo creamos
          chat = new ChatWeb({ participantes: [userId, recipientId], mensajes: [] });
        }

        const nuevoMensaje = { 
            remitenteId: userId, 
            texto: text, 
            fecha: new Date(),
            emocion: emocionDetectada //  Aquí guardamos la emocion
        };

        chat.mensajes.push(nuevoMensaje);
        await chat.save();

   
        //  ENVIAR A LOS CLIENTES 
       
        const response = {
          remitenteId: userId,
          recipientId,
          remitenteNombre: remitente ? remitente.nombre : 'Usuario',
          remitenteAvatar: remitente ? remitente.avatar : null,
          text,
          emocion: emocionDetectada, 
          timestamp: new Date().toISOString(),
        };

        // Enviamos el mensaje a ambos participantes si están conectados
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && (client.userId === userId || client.userId === recipientId)) {
            client.send(JSON.stringify(response));
          }
        });

      } catch (err) {
        console.error('❌ Error procesando mensaje WebSocket:', err);
      }
    });

    ws.on('close', () => console.log('📴 Cliente WebSocket desconectado'));
  });
}

module.exports = initializeWebsockets;