const { pool } = require('../config/db');
const { redisClient } = require('../config/redis');

/**
 * Saves a message to Redis for the given session, sets an expiration, and if the last two messages
 * are a user-assistant pair, stores them as a query-response pair in the Postgres chat_transcripts table.
 *
 * @param {string} sessionId - The session identifier.
 * @param {Object} message - The message object to save.
 * @returns {Promise<void>}
 */
async function saveMessage(sessionId, message) {
    await redisClient.rPush(sessionId, JSON.stringify(message));
    await redisClient.expire(sessionId, 86400);
    const messages = await redisClient.lRange(sessionId, -2, -1);

    if (messages.length === 2) {
        const [userMsg, botMsg] = messages.map(msg => JSON.parse(msg));

        if (userMsg && botMsg && userMsg.role === 'user' && botMsg.role === 'assistant') {
            const query = userMsg.content;
            const response = botMsg.content;

            // Save pair to Postgres
            await pool.query(
                'INSERT INTO chat_transcripts (session_id, query, response, timestamp) VALUES ($1, $2, $3, $4)',
                [sessionId, query, response, new Date()]
            );
        }
    }
}

/**
 * Retrieves the message history for a given session from Redis.
 *
 * @param {string} sessionId - The ID of the session to fetch messages for.
 * @returns {Promise<Array>} Resolves with an array of parsed message objects.
 * @throws Will throw an error if fetching or parsing fails.
 */
async function getSessionHistory(sessionId) {
    try {
        const msgs = await redisClient.lRange(sessionId, 0, -1);
        return msgs.map(msg => JSON.parse(msg));
    } catch (error) {
        console.error('Error fetching messages from Redis:', error);
        throw error;
    }

}

/**
 * Deletes a session from Redis by its sessionId.
 * @param {string} sessionId - The key of the session to delete.
 * @returns {Promise<void>}
 * @throws Will throw an error if Redis deletion fails.
 */
async function clearSession(sessionId) {
    try {
        await redisClient.del(sessionId);
    } catch (error) {
        console.error('Error clearing session in Redis:', error);
        throw error;
    }
}

module.exports = { saveMessage, getSessionHistory, clearSession };