// fileName: spotify.service.js (VERSIÓN CORREGIDA A CommonJS)

// 👇 CAMBIO: Usamos require en lugar de import
const axios = require('axios');
const querystring = require('querystring');

// Lee las credenciales directamente de las variables de entorno.
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

/**
 * @private
 * Obtiene un token de acceso de la API de Spotify.
 */
const getSpotifyToken = async () => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Las credenciales de Spotify no están configuradas en el entorno.');
  }
  // ... (el resto de esta función no cambia)
  try {
    const authHeader = 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data.access_token;

  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Error al obtener el token de Spotify:', errorMsg);
    throw new Error('No se pudo autenticar con Spotify. Revisa tus credenciales.');
  }
};

/**
 * Busca artistas en Spotify por un término de búsqueda.
 */
const searchArtistsOnSpotify = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim().length < 3) {
    return [];
  }
  // ... (el resto de esta función no cambia)
  try {
    const token = await getSpotifyToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: searchTerm,
        type: 'artist',
        limit: 20
      }
    });

    const artists = response.data.artists.items;
    
    return artists.map(artist => {
      const imageUrl = artist.images[0]?.url || null;
      return {
        name: artist.name,
        image: imageUrl
      };
    });

  } catch (error) {
    console.error(`Error al buscar artistas en Spotify para "${searchTerm}":`, error.message);
    return [];
  }
};

// 👇 CAMBIO: Usamos module.exports para exportar la función
module.exports = {
  searchArtistsOnSpotify
};