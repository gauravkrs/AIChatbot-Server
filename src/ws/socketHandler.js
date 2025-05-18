const { search, upsertEmbeddings } = require('../services/vectorService');
const { generateEmbeddings } = require('../services/embedService');
const { queryGemini } = require('../services/geminiService');
const sessionService = require('../services/sessionService');

async function handleSocket(socket) {
    socket.on('chat:message', async ({ sessionId, message }) => {
        console.log('Received message:', sessionId, message);
        const queryEmbedding = await generateEmbeddings(message);
        const vector = queryEmbedding.data[0].embedding;
        // Save embedding to Qdrant (with query as payload for context)
        await upsertEmbeddings([vector], [{ message }]);
        const topK = await search(vector, 5);
        const answer = await queryGemini(message, topK);

        await sessionService.saveMessage(sessionId, { role: 'user', content: message });
        await sessionService.saveMessage(sessionId, { role: 'assistant', content: answer });
        console.log('Answer:', answer);
        socket.emit('chat:response', { sessionId, message: answer });
    });

    socket.on('chat:history', async ({ sessionId }) => {
        const history = await sessionService.getSessionHistory(sessionId);
        socket.emit('chat:history:response', { sessionId, history });
    });
    socket.on('chat:clear', async ({ sessionId }) => {
        await sessionService.clearSession(sessionId);
        socket.emit('chat:cleared', { sessionId });
    });

}




module.exports = { handleSocket };