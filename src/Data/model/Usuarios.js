const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '', trim: true },
  genero: { type: String, default: '' },
  descripcion: { type: String, default: '', trim: true },
  // ...otros campos que ya tenías
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuarios', UsuarioSchema);