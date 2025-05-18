const { QdrantClient } = require('@qdrant/js-client-rest');
const dotenv = require('dotenv');
dotenv.config();

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

async function testQdrantConnection() {
    try {
        const result = await client.getCollections();
        console.log('Qdrant collections:', result.collections);
    } catch (err) {
        console.error('Could not fetch Qdrant collections:', err.message);
    }
}

module.exports = {
    client,
    testQdrantConnection,
};
