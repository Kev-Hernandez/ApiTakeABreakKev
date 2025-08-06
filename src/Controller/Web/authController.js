const Usuarios = require('../../Data/model/Usuarios');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const usuario = await Usuarios.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (!password) {
      return res.status(400).json({ mensaje: 'Falta la password' });
    }

    if (!usuario.password || usuario.password.length < 20) {
      return res.status(500).json({ mensaje: 'La password almacenada no es válida' });
    }


    console.log('password ingresado:', password);
    console.log('password hasheado en BD:', usuario.password);


    // Comparar passwords
    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return res.status(401).json({ mensaje: 'password incorrecta' });
    }

    // Éxito
    res.status(200).json({
      mensaje: 'Inicio de sesión correcto',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        sexo: usuario.sexo,
        preferences: usuario.preferences,
        plataforma: usuario.plataforma,
        fechaCreacion: usuario.fechaCreacion
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error en login', error });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const usuario = await Usuarios.findById(userId).select('-password');
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { nombre, email, password, descripcion } = req.body;

    const usuario = await Usuarios.findById(userId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Actualizar campos básicos
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (descripcion) usuario.descripcion = descripcion;

    // Si se proporciona nueva password, hashearla
    if (password) {
      usuario.password = await bcrypt.hash(password, 10);
    }

    await usuario.save();

    // Devolver usuario sin password
    const usuarioActualizado = await Usuarios.findById(userId).select('-password');
    res.json({ mensaje: 'Perfil actualizado con éxito', usuario: usuarioActualizado });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
