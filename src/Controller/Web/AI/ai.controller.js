const ChatWeb = require('../../../Data/model/ChatWeb');
require('dotenv').config();

const obtenerRecomendacionChat = async (req, res) => {
    try {
        const { recipientId } = req.body; // El ID del amigo
        
        // Obtenemos el ID del usuario que hace la petición
        const userId = req.user ? (req.user.uid || req.user.id || req.user._id) : req.body.userId;

        if (!userId || !recipientId) {
            return res.status(400).json({ message: "Faltan IDs de usuario para identificar el chat." });
        }

        // 1Buscar el historial del chat específico entre estos dos usuarios
        const chat = await ChatWeb.findOne({ 
            participantes: { $all: [userId, recipientId] } 
        });

        if (!chat || !chat.mensajes || chat.mensajes.length === 0) {
            return res.status(404).json({ 
                message: "No hay historial de chat para analizar.",
                emocion_dominante: "neutral",
                recomendaciones: []
            });
        }

        // Definimos "reciente" como las últimas 24 horas
        const hace24Horas = new Date();
        hace24Horas.setHours(hace24Horas.getHours() - 24);

        // Filtramos: mensajes que sean posteriores a hace 24 horas
        let mensajesRelevantes = chat.mensajes.filter(msg => new Date(msg.fecha) > hace24Horas);

        // Si no han hablado en 24 horas, tomamos los últimos 10 mensajes 
        // para tener ALGO que analizar, pero con menos peso.
        if (mensajesRelevantes.length === 0) {
            console.log("[Node AI] No hay mensajes recientes, usando historial antiguo corto.");
            mensajesRelevantes = chat.mensajes.slice(-10);
        } else {
            // Si hay muchos mensajes hoy, limitamos a los últimos 50 para no saturar
            mensajesRelevantes = mensajesRelevantes.slice(-50);
        }

        // Calcular la emoción dominante
        const conteo = {};

        mensajesRelevantes.forEach(msg => {
            // Ignoramos 'neutral' y 'neutral_genérico' para buscar emociones fuertes
            if (msg.emocion && !msg.emocion.includes('neutral')) {
                conteo[msg.emocion] = (conteo[msg.emocion] || 0) + 1;
            }
        });

        // Encontrar la ganadora
        let emocionDominante = 'neutral'; // Default si no hay nada claro
        let maxVotos = 0;

        for (const [emocion, votos] of Object.entries(conteo)) {
            if (votos > maxVotos) {
                maxVotos = votos;
                emocionDominante = emocion;
            }
        }
        
        // Si todo fue neutral, forzamos una emoción positiva por defecto
        if (emocionDominante === 'neutral') {
             emocionDominante = 'calma';
        }

        console.log(`[Node AI] Vibe calculado: ${emocionDominante} (Basado en ${mensajesRelevantes.length} mensajes)`);

        // 4. Llamar al Microservicio de Python
        const pythonUrl = process.env.PYTHON_MICROSERVICE_URL || 'http://127.0.0.1:5000';
        
        const pythonResponse = await fetch(`${pythonUrl}/api/web/recomendar-por-emocion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emocion_dominante: emocionDominante })
        });

        if (!pythonResponse.ok) {
            throw new Error(`Error del servicio Python: ${pythonResponse.statusText}`);
        }

        const datosPython = await pythonResponse.json();

        // 5. Responder al Frontend
        return res.status(200).json({
            emocion_dominante: emocionDominante,
            recomendaciones: datosPython.canciones_recomendadas || []
        });

    } catch (error) {
        console.error("Error en obtenerRecomendacionChat:", error);
        return res.status(500).json({ message: "Error interno al procesar recomendaciones" });
    }
};

module.exports = {
    obtenerRecomendacionChat
};