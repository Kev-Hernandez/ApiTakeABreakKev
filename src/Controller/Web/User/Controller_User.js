// fileName: src/Controller/Web/User/Controller_User.js (Versión Unificada y Mejorada)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Usamos bcryptjs consistentemente
const Users = require('../../../Data/model/Usuarios');

// Obtener TODOS los usuarios activos (lógica que vino de index.js)
exports.getActiveUsers = async (req, res) => {
  try {
    // ✅ INICIO DE LA MODIFICACIÓN
    const currentUserId = req.user.id; // Obtenemos el ID del usuario que hace la petición

    // Buscamos a todos los usuarios CUYO ID NO SEA el del usuario actual
    const usuarios = await Users.find({ _id: { $ne: currentUserId } }).select('-password');
    // ✅ FIN DE LA MODIFICACIÓN

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios activos' });
  }
};

// Obtener el perfil de UN usuario por su ID
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId; // Usamos userId para consistencia
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID no válido' });
    }
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

// Actualizar el perfil de UN usuario por su ID
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario no válido' });
    }

    const { password, ...updateData } = req.body;

    // Si se envía una nueva contraseña, la encriptamos
    if (password && password.length > 0) {
        const salt = await bcrypt.genSalt(10);
        // ¡ERROR CRÍTICO CORREGIDO! Faltaba hashear la contraseña
        updateData.password = await bcrypt.hash(password, salt);
    }
    
    const usuario = await Users.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true } // Esto asegura que nos devuelva el documento actualizado
    ).select('-password');

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Perfil actualizado con éxito', usuario });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
};