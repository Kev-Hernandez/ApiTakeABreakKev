// 📁 Archivo: src/Controller/Web/Friends/friends.controller.js

const Usuarios = require('../../../Data/model/Usuarios'); // Importa tu modelo de Usuario

/**
 * @description Permite a un usuario enviar una solicitud de amistad a otro.
 */
exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;         // Obtenemos nuestro ID del middleware de autenticación.
    const { recipientId } = req.body; // El frontend nos enviará el ID del usuario al que queremos agregar.

    // --- Validaciones para evitar errores ---
    if (senderId === recipientId) {
      return res.status(400).json({ message: 'No puedes enviarte una solicitud a ti mismo.' });
    }

    const recipient = await Usuarios.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'El usuario receptor no fue encontrado.' });
    }

    // Verificar si ya son amigos o si ya hay una solicitud pendiente
    if (recipient.friends.includes(senderId)) {
      return res.status(400).json({ message: 'Ya eres amigo de este usuario.' });
    }
    if (recipient.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: 'Ya has enviado una solicitud a este usuario.' });
    }

    // --- Lógica Principal ---
    // Agregamos nuestro ID a la lista de solicitudes del receptor.
    recipient.friendRequests.push(senderId);
    await recipient.save(); // Guardamos los cambios en la base de datos.

    return res.status(200).json({ message: 'Solicitud de amistad enviada con éxito.' });

  } catch (error) {
    console.error('Error al enviar la solicitud de amistad:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};