const path = require('path');
const fs = require('fs');

exports.getAvatars = (req, res) => {
  try {
    // Construye la ruta a la carpeta 'public/avatares' desde la raíz del proyecto
    const avatarsDirectory = path.join(process.cwd(), 'public', 'avatares');
    
    fs.readdir(avatarsDirectory, (err, files) => {
      if (err) {
        console.error("Error al leer directorio:", err);
        return res.status(500).json({ message: 'No se pudo leer la carpeta de avatares' });
      }
      // Filtra para devolver solo archivos de imagen
      const imageFiles = files.filter(file => /\.(png|jpg|jpeg)$/i.test(file));
      res.json(imageFiles);
    });
  } catch (error) {
    console.error('Error al obtener avatares:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};