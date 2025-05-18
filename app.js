require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors')
const { Server } = require('socket.io');
const { connectDB } = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const { testQdrantConnection } = require('./src/config/qdrant');
const chatRoutes = require('./src/routes/chatRoutes');
const { handleSocket } = require('./src/ws/socketHandler');
const { initDatabase } = require('./src/scripts/initDb');

const app = express();

// Enable CORS for Express
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
}));

const server = http.createServer(app);
// Enable CORS for WebSocket (already done properly)
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.on('connection', (socket) => {
    console.log('🔌 WebSocket connected:', socket.id);
    handleSocket(socket);
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to AI Chatbot' });
});

app.use('/api/chat', chatRoutes);



const PORT = process.env.PORT || 5001;
server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectDB();
    await connectRedis();
    await initDatabase();
    await testQdrantConnection();
});