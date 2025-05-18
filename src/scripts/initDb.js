const { pool } = require("../config/db");

async function initDatabase() {
  try {
    const client = await pool.connect();

    // Check if table exists by querying PostgreSQL catalog
    const res = await client.query(`
      SELECT to_regclass('public.chat_transcripts') AS table_exists;
    `);

    if (res.rows[0].table_exists) {
      console.log('chat_transcripts table already exists, skipping creation.');
      client.release();
      return;
    }

    // If table doesn't exist, create it
    await client.query(`
      CREATE TABLE chat_transcripts (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('chat_transcripts table is created.');
    client.release();
  } catch (error) {
    console.error('Error initializing the database:', error);
  }
}

module.exports = { initDatabase };
