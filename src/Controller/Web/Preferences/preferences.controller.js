// fileName: src/Controller/Web/Preferences/preferences.controller.js (VERSIÓN FINAL para Last.fm)

// ✅ Importamos TODAS las funciones necesarias desde el servicio de Last.fm
const { getTopGenres, getTopArtists, searchArtists } = require('../../../services/lastfm.service.js');
const Usuarios = require('../../../Data/model/Usuarios.js');

// Definimos los sentimientos aquí o los traemos de otro lado
const sentimientos = ['Feliz', 'Triste', 'Energético', 'Relajado', 'Creativo', 'Nostálgico'];

// Función para obtener las opciones iniciales del onboarding
exports.getOnboardingOptions = async (req, res) => {
  try {
    // Esta función ya estaba correcta, usando getTopGenres y getTopArtists de Last.fm
    const [generos, artistas] = await Promise.all([
      getTopGenres(),
      getTopArtists()
    ]);
    const options = { generos, artistas, sentimientos };
    res.status(200).json(options);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las opciones de personalización' });
  }
};

// Función para buscar artistas en tiempo real
exports.searchApiArtists = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Se requiere un término de búsqueda' });
    }
    
    // ✅ Nos aseguramos de que llame a la función searchArtists de Last.fm
    const artists = await searchArtists(searchTerm);
    
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar artistas' });
  }
};

// Función para guardar las preferencias del usuario
exports.saveUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { generos, sentimientos, autores } = req.body;
    const usuario = await Usuarios.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuario.preferences = {
      generos: generos || [],
      sentimientos: sentimientos || [],
      autores: autores || [],
    };
    usuario.hasCompletedOnboarding = true;

    await usuario.save();
    res.status(200).json({ message: 'Preferencias guardadas con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};