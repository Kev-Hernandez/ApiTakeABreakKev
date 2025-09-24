const bycrypt = require('bcrypt');
const Usuarios = require('../../../Data/model/Usuarios');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.PALABRA_SECRETA || 'Ya Valio el proyecto';

//controlador para el login

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await Usuarios.findOne({ email });
        if(!user){
            return res.status(404).json({
                 message: `Usuario ${email} no encontrado`
            });
        }

        const passwordValid = await bycrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({
                message: 'Contraseña incorrecta'
            });
        }

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '24h' });
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: user._id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                sexo: user.sexo,
                preferences: user.preferences,
                plataforma: user.plataforma,
                fechaCreacion: user.fechaCreacion
            }
            // ¿Qué datos más quieres que le mandemos con el token?
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            message: 'Error en login',
            error
        });
    }
}