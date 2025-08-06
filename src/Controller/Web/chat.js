    /*
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ port: 5000 });
    const ChatWeb = require('../../Data/model/ChatWeb'); 


    wss.on('connection', (ws) => {
    ws.on('message', async (messageData) => {
    try {
        const data = JSON.parse(messageData);
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
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
        };

        chat.mensajes.push(nuevoMensaje);
        await chat.save();

        // 🔽 Aquí: obtenemos los datos de los participantes (con nombres)
        await chat.populate('participantes').execPopulate();

        const remitente = chat.participantes.find(p => p._id.toString() === userId);
        const destinatario = chat.participantes.find(p => p._id.toString() === recipientId);

        const response = {
        remitenteId: userId,
        destinatarioId: recipientId,
        remitenteNombre: remitente?.nombre || 'Remitente',
        destinatarioNombre: destinatario?.nombre || 'Destinatario',
        text: text,
        timestamp: nuevoMensaje.timestamp,
        date: nuevoMensaje.date
        };

        wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
        }
        });

    } catch (error) {
        console.error('Error al manejar mensaje WebSocket:', error);
    }
    });


    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
    }); */
