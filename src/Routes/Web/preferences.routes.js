// fileName: src/Routes/Web/preferences.routes.js (VERSIÓN ACTUALIZADA)

const express = require('express');
const router = express.Router();
// 1. Importamos ambas funciones del controlador
const { getOnboardingOptions, saveUserPreferences, searchApiArtists } = require('../../Controller/Web/Preferences/preferences.controller.js');
const authMiddleware = require('../../middleware/authMiddleware.js');

// Ruta para OBTENER las opciones de la encuesta
router.get('/onboarding-options', authMiddleware, getOnboardingOptions);
// --- NUEVA RUTA para la búsqueda de artistas ---
router.get('/artists/search', authMiddleware, searchApiArtists);

// --- NUEVA RUTA para GUARDAR las preferencias del usuario ---
// Usamos PUT porque estamos actualizando un recurso existente (el perfil del usuario)
router.put('/me/preferences', authMiddleware, saveUserPreferences);

module.exports = router;