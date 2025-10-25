const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendshipSchema = new Schema({
  // El usuario que envía la solicitud
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'Usuarios', // Asegúrate de que tu modelo de usuario se llame 'Usuarios'
    required: true
  },
  // El usuario que recibe la solicitud
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'Usuarios',
    required: true
  },
  // El estado de la amistad
  status: {
    type: String,
    enum: [
      'pending',  // Solicitud enviada, esperando respuesta
      'accepted', // Solicitud aceptada, son amigos
      'rejected'  // Solicitud rechazada
    ],
    default: 'pending'
  }
}, {
  timestamps: true // Añade createdAt y updatedAt
});

// Índice para asegurar que no haya solicitudes duplicadas
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Friendship', friendshipSchema);