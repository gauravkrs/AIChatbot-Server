const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    connectionString : process.env.DATABASE_URL,
})

/**
 * Attempts to establish a connection to the PostgreSQL database using the provided pool.
 * Logs a success message if connected, otherwise logs the error.
 */
async function connectDB() {
    try {
        await pool.connect();
        console.log('Database connected');
    } catch (err) {
        console.error('Error connecting to Database:', err);
    }
}

module.exports = { pool, connectDB };