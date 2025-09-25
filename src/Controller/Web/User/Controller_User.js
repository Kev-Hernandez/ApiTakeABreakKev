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
    // La desestructuración está bien
    const { nombre, apellido, email, password, descripcion, avatar, genero } = req.body;

    const usuario = await Users.findById(userId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido; 
    if (email) usuario.email = email;
    if (descripcion) usuario.descripcion = descripcion;
    if (avatar) usuario.avatar = avatar;
    if (genero) usuario.genero = genero;

    if (password) {
      usuario.password = password; // Si aún no la encriptas
    }

    // Guardamos los cambios hechos en el documento 'usuario'
    await usuario.save();

    // Devolvemos el usuario actualizado sin la contraseña
    const usuarioActualizado = usuario.toObject();
    delete usuarioActualizado.password;
    
    res.json({ mensaje: 'Perfil actualizado con éxito', usuario: usuarioActualizado });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
};