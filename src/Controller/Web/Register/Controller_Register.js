const Usuarios = require('../../../Data/model/Usuarios');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      sexo,
      preferences = { generos: [], autores: [] },
      plataforma = []
    } = req.body;

    // Validación básica
    if (!nombre || !apellido || !email || !password || !sexo) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario ya existe
    const existe = await Usuarios.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    // Encriptar la password
    const hashedpassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuarios({
      nombre,
      apellido,
      email,
      password: hashedpassword,
      sexo,
      preferences,
      plataforma
    });

    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });

  } catch (error) {
    console.error('Error al registrar:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
};