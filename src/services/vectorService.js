const { client } = require('../config/qdrant');
const crypto = require('crypto');

const COLLECTION_NAME = 'news';
const VECTOR_SIZE = 768;
const DISTANCE = 'Cosine';

/**
 * Ensures that the specified collection exists in Qdrant.
 * Creates the collection with the defined vector size and distance metric if it does not exist.
 * Handles and logs any errors encountered during the process.
 */
async function ensureCollectionExists() {
  try {
    const allCollections = await client.getCollections();
    const exists = allCollections.collections.some(col => col.name === COLLECTION_NAME);

    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: DISTANCE,
        },
      });
    }
  } catch (error) {
    console.error('Error while ensuring collection exists:', error);
  }
}
async function getVectorNameIfAny() {
    await ensureCollectionExists();
    const collectionInfo = await client.getCollection(COLLECTION_NAME);
    const isNamedVector = typeof collectionInfo.vectors === 'object' && !Array.isArray(collectionInfo.vectors);
    return isNamedVector ? Object.keys(collectionInfo.vectors)[0] : null;
}

/**
 * Upserts embedding vectors and their associated payloads into the collection.
 *
 * @param {Array} vectors - Array of embedding vectors to upsert.
 * @param {Array} payloads - Array of payload objects corresponding to each vector.
 * @throws Will throw an error if the upsert operation fails.
 */
async function upsertEmbeddings(vectors, payloads) {
    try {
        const vectorName = await getVectorNameIfAny();

        const points = vectors.map((vector, i) => ({
            id: crypto.randomUUID(),
            vector: vectorName ? { [vectorName]: vector } : vector,
            payload: payloads[i],
        }));

        await client.upsert(COLLECTION_NAME, { points });
    } catch (err) {
        console.error('Error during upsert:', err);
        throw err;
    }
}

/**
 * Searches the specified collection for vectors similar to the provided query vector.
 *
 * Returns the top K most similar results.
 *
 * @param {Array<number>} queryVector - The vector to search for.
 * @param {number} [topK=5] - The maximum number of results to return.
 * @returns {Promise<Array>} The search results from the collection.
 * @throws Will throw an error if the search operation fails.
 */
async function search(queryVector, topK = 5) {
    try {
        const vectorName = await getVectorNameIfAny();

        const searchQuery = vectorName
            ? { vector: { [vectorName]: queryVector } }
            : { vector: queryVector };

        const result = await client.search(COLLECTION_NAME, searchQuery, { limit: topK });
        return result;
    } catch (error) {
        console.error('Error during search:', error);
        throw error;
    }
}

module.exports = {
    upsertEmbeddings,
    search,
};
