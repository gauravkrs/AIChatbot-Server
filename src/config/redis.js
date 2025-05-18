const { createClient } = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});
/**
 * Asynchronously connects the redisClient to the Redis server.
 * Logs success or error messages to the console.
 */
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis client connected');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
}

module.exports = { redisClient, connectRedis};
