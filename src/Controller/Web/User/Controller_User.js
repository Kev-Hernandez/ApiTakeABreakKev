const Users = require('../../../Data/model/Usuarios');
const bcrypt = require('bcryptjs');


exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const usuario = await Users.findById(userId).select('-password');
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { nombre, email, password, descripcion } = req.body;

    const usuario = await Users.findById(userId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Actualizar campos básicos
    if (nombre) Users.nombre = nombre;
    if (email) Users.email = email;
    if (descripcion) Users.descripcion = descripcion;

    // Si se proporciona nueva password, hashearla
    if (password) {
      Users.password = await bcrypt.hash(password, 10);
    }

    await usuario.save();

    // Devolver usuario sin password
    const usuarioActualizado = await Users.findById(userId).select('-password');
    res.json({ mensaje: 'Perfil actualizado con éxito', usuario: usuarioActualizado });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
};
