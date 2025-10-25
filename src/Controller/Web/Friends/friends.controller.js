// 📁 Archivo: src/Controller/Web/Friends/friends.controller.js

// 1. Importamos AMBOS modelos
const Friendship = require('../../../Data/model/Friendship');
const Usuarios = require('../../../Data/model/Usuarios'); // Tu modelo de Usuario
const mongoose = require('mongoose');

/**
 * @description (NUEVA) Permite a un usuario enviar una solicitud de amistad a otro.
 * @route POST /api/v1/friends/request
 */
exports.sendFriendRequest = async (req, res) => {
  try {
    // req.user.id viene de tu authMiddleware (asumiendo que tu token tiene 'id')
    const requesterId = req.user.id || req.user._id; 
    const { recipientId } = req.body;

    // --- Validaciones ---
    if (requesterId === recipientId) {
      return res.status(400).json({ message: 'No puedes enviarte una solicitud a ti mismo.' });
    }

    // Verificar que el receptor exista
    const recipient = await Usuarios.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'El usuario receptor no fue encontrado.' });
    }

    // Verificar si ya existe una relación (en cualquier dirección)
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ message: 'Ya eres amigo de este usuario.' });
      }
      if (existingFriendship.status === 'pending') {
        return res.status(400).json({ message: 'Ya existe una solicitud pendiente.' });
      }
    }

    // --- Lógica Principal ---
    // Crear la nueva solicitud de amistad en la colección 'friendships'
    const newRequest = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending' // Estado inicial
    });

    await newRequest.save();

    return res.status(200).json({ message: 'Solicitud de amistad enviada.' });

  } catch (error) {
    console.error('Error al enviar la solicitud de amistad:', error);
    // Manejo de error de índice único (si ya existe la relación)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ya existe una solicitud entre estos usuarios.' });
    }
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


/**
 * @description (NUEVA) Obtener la lista de amigos CONFIRMADOS.
 * @route GET /api/v1/friends/my-friends
 */
exports.getMyFriends = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user.id || req.user._id);

    const friendships = await Friendship.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: 'accepted'
    });

    const friendIds = friendships.map(friendship => {
      return friendship.requester.equals(currentUserId) 
        ? friendship.recipient 
        : friendship.requester;
    });

    const friends = await Usuarios.find({ _id: { $in: friendIds } })
                                  .select('-password -__v'); // Excluir info sensible

    res.json(friends);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de amigos.' });
  }
};

/**
 * @description (NUEVA) Obtener las solicitudes PENDIENTES recibidas.
 * @route GET /api/v1/friends/requests
 */
exports.getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    const requests = await Friendship.find({
      recipient: currentUserId,
      status: 'pending'
    })
    .populate('requester', 'nombre apellido avatar'); // 'requester' es el 'sender'

    const formattedRequests = requests.map(req => {
      return {
        _id: req._id, // ID de la solicitud
        sender: req.requester // Objeto del usuario que la envió
      };
    });

    res.json(formattedRequests);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las solicitudes.' });
  }
};

/**
 * @description (NUEVA) Aceptar una solicitud de amistad.
 * @route POST /api/v1/friends/accept
 */
exports.acceptFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const { senderId } = req.body; // El ID del usuario que ENVIÓ la solicitud

    if (!senderId) {
      return res.status(400).json({ message: 'Se requiere senderId.' });
    }

    const request = await Friendship.findOneAndUpdate(
      {
        recipient: currentUserId, // Yo soy el receptor
        requester: senderId,      // Él es el que envió
        status: 'pending'
      },
      { 
        status: 'accepted' // Actualizar estado
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada o ya procesada.' });
    }

    res.json({ message: 'Solicitud aceptada. ¡Ahora son amigos!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al aceptar la solicitud.' });
  }
};

/**
 * @description (NUEVA) Rechazar una solicitud de amistad.
 * @route POST /api/v1/friends/reject
 */
exports.rejectFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ message: 'Se requiere senderId.' });
    }

    // Simplemente la eliminamos
    const result = await Friendship.deleteOne({
      recipient: currentUserId,
      requester: senderId,
      status: 'pending'
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Solicitud no encontrada.' });
    }

    res.json({ message: 'Solicitud rechazada.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al rechazar la solicitud.' });
  }
};