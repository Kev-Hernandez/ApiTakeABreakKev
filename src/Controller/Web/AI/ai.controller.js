// fileName: src/Controller/Web/AI/ai.controller.js

// Listas de palabras clave para cada sentimiento. Puedes añadir todas las que quieras.
const happyWords = ['jaja', 'gracias', 'excelente', 'perfecto', 'bien', 'amo', 'me encanta', 'genial', ':)'];
const sadWords = ['triste', 'mal', 'problema', 'no puedo', 'ayuda', ':(', 'pero', 'difícil'];
const energeticWords = ['!', 'rápido', 'ya', 'necesito', 'urgente', 'ahora', 'vamos'];
const creativeWords = ['idea', 'imagina', 'creo que', 'diseño', 'arte', 'música'];

exports.analyzeSentiment = (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ mood: 'neutral' });
    }

    const lowerCaseText = text.toLowerCase();
    let detectedMood = 'neutral'; // Por defecto, el sentimiento es neutral

    // Buscamos palabras clave en el texto. El primero que encuentre, gana.
    if (energeticWords.some(word => lowerCaseText.includes(word))) {
      detectedMood = 'energetic';
    } else if (happyWords.some(word => lowerCaseText.includes(word))) {
      detectedMood = 'happy';
    } else if (sadWords.some(word => lowerCaseText.includes(word))) {
      detectedMood = 'sad';
    } else if (creativeWords.some(word => lowerCaseText.includes(word))) {
      detectedMood = 'creative';
    }

    // Devolvemos el sentimiento detectado
    res.status(200).json({ mood: detectedMood });

  } catch (error) {
    console.error('Error en el simulador de IA:', error);
    res.status(500).json({ mood: 'neutral' });
  }
};