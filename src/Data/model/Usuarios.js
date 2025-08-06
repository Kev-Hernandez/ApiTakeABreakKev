// user.js
const mongoose = require('mongoose');

const Usuarios = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  apellido: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  edad: {
    type: Number,
    min: 0,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  password:{
    type: String,
    required: true,
  },
  sexo: {
    type: String,
    enum: ['masculino', 'femenino', 'otro'],
    required: true,
  },
   preferences: {
    generos: [String],
    autores: [String],
  },
  plataforma: [String],

},{autoCreate: true} );


const Usermodel = mongoose.model('Usuarios', Usuarios);

module.exports = Usermodel;
