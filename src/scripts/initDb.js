const { pool } = require("../config/db");

async function initDatabase() {
  try {
    const client = await pool.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_transcripts (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('chat_transcripts table is ready.');
  } catch (error) {
    console.error('Error initializing the database:', error);
  }
}

module.exports = { initDatabase };