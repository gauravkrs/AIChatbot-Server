const axios = require('axios');

const JINA_API_URL = 'https://api.jina.ai/v1/embeddings';
const JINA_API_KEY = process.env.JINA_API_KEY;

/**
 * Generates an embedding for the given text using the Jina API.
 * @param {string} text - The text to embed.
 * @returns {Promise<Object|null>} The embedding data object or null if an error occurs.
 */
async function generateJinaEmbedding(text) {
  try {
    const response = await axios.post(
      JINA_API_URL,
      {
        model: 'jina-embeddings-v2-base-en',
        input: [text],
      },
      {
        headers: {
          Authorization: `Bearer ${JINA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating Jina embedding:', error.response?.data || error.message);
    return null;
  }
}

module.exports = { generateJinaEmbedding };
