const { generateJinaEmbedding } = require('../config/jinaApi');

/**
 * Asynchronously generates embeddings for the given text using the Jina embedding service.
 *
 * @param {string} text - The input text for which embeddings are to be generated.
 * @returns {Promise<Object|null>} A promise that resolves to the embedding data or null if an error occurs.
 */
const generateEmbeddings = async (text) => {
  return await generateJinaEmbedding(text);
};

module.exports = { generateEmbeddings };
