# 🧠 AI Chatbot Backend

This is the backend server for the **AI Chatbot** application. It supports real-time chat, session management, semantic vector search, and AI-powered responses via Google Gemini API.

---

## 🎯 Use Case

This AI Chatbot serves as a smart assistant capable of:
- Answering questions contextually
- Fetching news content and summarizing
- Retaining session memory for personalized responses
- Performing semantic search using vector databases

---

## 🚀 Features

- RESTful API for chat interaction
- Real-time WebSocket chat
- Embedding generation via Jina AI
- Semantic search using Qdrant
- News ingestion via RSS feeds
- Gemini API integration for answers
- Redis + PostgreSQL session persistence
- Modular and production-ready architecture

---

## 🛠️ Tech Stack

- Node.js + Express
- Socket.IO
- Redis + PostgreSQL
- Qdrant (vector DB)
- Jina AI Embeddings
- Google Gemini LLM
- RSS Parser

---

## 📁 Project Structure

```
project-root/
├── app.js
├── .env
├── package.json
│
├── src/
│   ├── config/
│   ├── controller/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   └── ws/

```

```bash
git clone ...
cd project
npm install
pm2 start app.js
```

---

## 📚 API Reference

| Method | Endpoint        | Description                  |
|--------|------------------|------------------------------|
| GET    | `/`              | Health check / welcome       |
| GET    | `/api/chat/history/:sessionId` | Get message history for a session |
| POST   | `/api/chat/history/:sessionId` | Clear message history for a session |
| POST   | `/api/chat/ask`                | Ask a question and get AI response |

---

## ⚙️ Environment Variables

| Variable          | Description                     |
|------------------|----------------------------------|
| `PORT`           | Port number (default: 5001)      |
| `CLIENT_URL`     | Frontend domain for CORS         |
| `DATABASE_URI`    | MongoDB connection string        |
| `REDIS_URL`      | Redis connection string          |
| `QDRANT_URL`     | Qdrant vector DB endpoint        |
| `GEMINI_API_KEY` | Google Gemini API Key            |

---

## 📬 Services Summary

| File               | Purpose                                  |
|--------------------|------------------------------------------|
| `embedService.js`  | Generate embeddings via Jina             |
| `fetchNews.js`     | Fetch news from RSS feeds                |
| `geminiService.js` | Query Gemini API and process context     |
| `sessionService.js`| Manage session history via Redis + SQL   |
| `vectorService.js` | Upsert & search vectors in Qdrant        |

---

## 🐛 Troubleshooting

- **Q: "Error: ECONNREFUSED Redis"**  
  A: Make sure Redis server is running on the correct port.

- **Q: "Gemini returned no response"**  
  A: Double-check if your `GEMINI_API_KEY` is valid and not rate-limited.

---

## ❓ FAQ

**Q: Does it store chat history?**  
A: Yes, using Redis (and optional PostgreSQL).

**Q: Can I deploy it on free-tier hosting?**  
A: Yes, platforms like Railway, Render, and Fly.io are supported.

## 🙌 Credits & References

- [Jina AI Embeddings](https://jina.ai/)  
- [Google Gemini API](https://ai.google.dev/)  
- [Qdrant Vector DB](https://qdrant.tech/)

---

## 📄 License

MIT License