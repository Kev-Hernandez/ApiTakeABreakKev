const jwt =require('jsonwebtoken');
const SECRET_KEY = process.env.PALABRA_SECRETA || 'Ya Valio el proyecto';

const verifyToken = (req, res, next) => {
  //Obtener el token del encabezado de la petición
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  // Si no hay token, prohibir el acceso
  if (!token) {
    return res.status(403).json({ message: 'Acceso prohibido. No se proporcionó un token.' });
  }

  // Verificar si el token es válido
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // Guardamos los datos del usuario (del token) en el objeto 'req'
    // para que las rutas protegidas puedan usarlos.
    req.user = {
      id: decoded.id || decoded._id,
      email: decoded.email
    }
    // Si todo es correcto, le damos paso a la siguiente función (la ruta)
    next();
  } catch (error) {
    // Si el token es inválido o ha expirado, devolvemos un error
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = verifyToken;