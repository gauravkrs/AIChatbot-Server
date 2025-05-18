const { search, upsertEmbeddings } = require('../services/vectorService');
const { generateEmbeddings } = require('../services/embedService');
const { queryGemini } = require('../services/geminiService');
const sessionService = require('../services/sessionService');

/**
 * Handles a user query by generating its embedding, storing it, searching for relevant context,
 * querying Gemini for an answer, saving the conversation to the session, and returning the response.
 *
 * @param {Object} req - Express request object containing sessionId and query in the body.
 * @param {Object} res - Express response object used to send the answer or error.
 */
exports.askQuery = async (req, res) => {
  try {
    const { sessionId, query } = req.body;

    const queryEmbedding = await generateEmbeddings(query);
    if (!queryEmbedding) {
      return res.status(500).json({ success: false, message: 'Failed to generate embedding' });
    }

    const vector = queryEmbedding.data[0].embedding;
    // Save embedding to Qdrant (with query as payload for context)
    await upsertEmbeddings([vector], [{ query }]);
    // Search in Qdrant using the same embedding
    const topK = await search(vector, 5);

    const answer = await queryGemini(query, topK);

    await sessionService.saveMessage(sessionId, { role: 'user', content: query });
    await sessionService.saveMessage(sessionId, { role: 'assistant', content: answer });

    res.json({ success: true, answer, sessionId });
  } catch (error) {
    console.error('Error in askQuery:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Handles GET requests to retrieve the session history for a given session ID.
 * Responds with a JSON object containing the history messages or an error message on failure.
 *
 * @param {Object} req - Express request object containing sessionId in params.
 * @param {Object} res - Express response object used to send the response.
 */
exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await sessionService.getSessionHistory(sessionId);
    res.json({ success: true, messages: history || [] });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
};

/**
 * Asynchronously clears the session history for a given session ID.
 * Sends a JSON response indicating success or failure.
 *
 * @param {Object} req - Express request object containing sessionId in params.
 * @param {Object} res - Express response object for sending JSON responses.
 */
exports.clearHistory = async (req, res) => {
  const { sessionId } = req.params;
  try {
    await sessionService.clearSession(sessionId);
    return res.json({ success: true, message: 'Session cleared' });
  } catch (error) {
    console.error('Error clearing session:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear session' });
  }
};

