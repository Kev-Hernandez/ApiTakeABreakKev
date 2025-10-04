// fileName: src/services/lastfm.service.js (VERSIÓN COMPLETA Y FINAL)

const axios = require('axios');

const API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_API_BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

// 1. FUNCIÓN PARA OBTENER GÉNEROS
const getTopGenres = async () => {
  try {
    const params = {
      method: 'chart.getTopTags',
      api_key: API_KEY,
      format: 'json',
      limit: 50,
    };
    const response = await axios.get(LASTFM_API_BASE_URL, { params });
    const genres = response.data.tags.tag.map(tag => tag.name);
    return genres.map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
  } catch (error) {
    console.error('Error al obtener los géneros de Last.fm:', error.message);
    throw new Error('No se pudieron obtener los géneros de Last.fm');
  }
};

// 2. FUNCIÓN PARA OBTENER EL TOP DE ARTISTAS CON IMÁGENES
const getTopArtists = async () => {
  try {
    const chartParams = {
      method: 'chart.getTopArtists',
      api_key: API_KEY,
      format: 'json',
      limit: 20, // Obtenemos el top 20 para la vista inicial
    };
    const chartResponse = await axios.get(LASTFM_API_BASE_URL, { params: chartParams });
    const topArtistsList = chartResponse.data.artists.artist;

    const artistInfoPromises = topArtistsList.map(artist => {
      const infoParams = {
        method: 'artist.getInfo',
        artist: artist.name,
        api_key: API_KEY,
        format: 'json',
      };
      return axios.get(LASTFM_API_BASE_URL, { params: infoParams })
      .catch(err=> null);
    });

    const artistInfoResponses = await Promise.all(artistInfoPromises);

    return artistInfoResponses
    .filter(response => response && response.data && response.data.artist) // Filtramos respuestas inválidas
    .map(response => {
      const artist = response.data.artist;
      // Usamos la imagen 'extralarge' (índice 4) que es de mejor calidad si existe
      const imageUrl = artist.image[3]?.['#text'];

      return {
        name: artist.name,
        // ✅ SOLUCIÓN: Si la imagen de Last.fm no existe, usamos la URL directa de ui-avatars
        image: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=random`
      };
    });
  } catch (error) {
    console.error('Error al obtener top artistas de Last.fm:', error.message);
    throw new Error('No se pudieron obtener los top artistas de Last.fm');
  }
};

// 3. FUNCIÓN PARA BUSCAR ARTISTAS EN TIEMPO REAL
const searchArtists = async (searchTerm) => {
  try {
    const params = {
      method: 'artist.search',
      artist: searchTerm,
      api_key: API_KEY,
      format: 'json',
      limit: 20,
    };
    const response = await axios.get(LASTFM_API_BASE_URL, { params });
    const artists = response.data.results.artistmatches.artist;

    return artists.map(artist => ({
      name: artist.name,
      // ✅ SOLUCIÓN: Usamos la imagen correcta y la URL de respaldo directa
      image: artist.image[3]?.['#text'] || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=random`
    }));
  } catch (error) {
    console.error('Error al buscar artistas en Last.fm:', error.message);
    // Devuelve un arreglo vacío en caso de error para que el frontend no se rompa
    return [];
  }
};

// Exportamos todas las funciones
module.exports = { getTopGenres, getTopArtists, searchArtists };