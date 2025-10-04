const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '', trim: true },
  genero: { type: String, default: '' },
  descripcion: { type: String, default: '', trim: true },

  /**
   * @description Lista de IDs de los usuarios que son amigos confirmados.
   */
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuarios' // Esta referencia es clave para que Mongoose sepa que son otros usuarios
  }],

  /**
   * @description Lista de IDs de usuarios que han enviado una solicitud de amistad
   * a ESTE usuario y están pendientes de aceptación.
   */
  friendRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuarios'
  }],
  
  // --- NUEVOS CAMPOS ---
  preferences: {
    generos: { type: [String], default: [] },
    autores: { type: [String], default: [] },
    sentimientos: { type: [String], default: [] },
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuarios', UsuarioSchema);