# BookLeaf Author Support & Communication Portal

An AI-powered support and ticketing system built for BookLeaf Publishing to streamline author inquiries, automate triage, and provide immediate draft responses based on a custom knowledge base.

## Features

- **Author Portal:** View published books, royalty status, and submit support tickets.
- **Admin Dashboard:** Monitor support queues, view analytics, and manage escalated tickets.
- **AI Triage (Gemini):** Automatically categorizes tickets, assigns priority, and routes to departments.
- **RAG Knowledge Base:** Uses ChromaDB and Gemini embeddings to provide accurate, policy-based draft responses.
- **Real-time Updates:** Socket.io integration for instant notification of ticket status changes and new messages.
- **Role-based Access:** Secure email/password authentication with JWT.

## Architecture

This project is structured as a monorepo using Turborepo.

- **Frontend (`apps/web`):** Next.js 15 (App Router), React Query, Tailwind CSS, Zustand, Recharts, Socket.io-client.
- **Backend (`apps/api`):** Express, TypeScript, Prisma (MongoDB), Zod, Socket.io, Swagger.
- **AI Integration (`apps/api/src/ai` & `src/rag`):** Google Gemini Pro for generation, text-embedding-004 for embeddings, ChromaDB for vector storage.

### Why this stack?
- **Next.js + React Query:** Provides a fast, highly-responsive SPA feel while keeping data fetching cleanly separated and cached.
- **Express + Prisma:** A lightweight API layer with a robust, type-safe ORM that easily handles complex queries.
- **MongoDB Atlas:** Allows for flexible schema design and easy replica-set configuration (required by Prisma for relations).
- **Gemini + ChromaDB:** Cost-effective, highly capable LLM paired with an open-source, easily deployable vector database for precise RAG.

## AI Integration Details

The AI integration consists of two main parts:
1.  **Ingestion (`npm run ingest`):** Reads markdown files from `knowledge-base/`, chunks them semantically, generates embeddings, and stores them in ChromaDB.
2.  **Generation:** When a ticket is created, the system queries ChromaDB for the most relevant chunks. These chunks are injected into the Gemini prompt along with strict tone guidelines and JSON schema enforcement to produce a classification, priority, and a draft response.

**Cost Awareness:** Instead of sending the entire knowledge base to the LLM on every ticket (which would consume massive token limits and cost), we use RAG to only send the top 4 most relevant semantic chunks.

**Graceful Degradation:** If the Gemini API fails, the system falls back to a deterministic, keyword-based triage system to ensure the ticket is still routed without blocking the user.

## Getting Started

### Prerequisites
- Node.js 20+
- A Google Gemini API Key
- MongoDB Atlas cluster URL
- (Optional but recommended) Local ChromaDB instance via Docker: `docker run -p 8000:8000 chromadb/chroma`

### Environment Variables

1. Navigate to `apps/api/`
2. Copy `.env.example` to `.env`
3. Fill in your details:
```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="your-super-secret-key"
GEMINI_API_KEY="your-gemini-key"
CHROMA_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:4001"
PORT=4000
```

### Installation & Seeding

```bash
# Install dependencies from root
npm install

# Push Prisma schema and generate client
cd apps/api
npx prisma db push

# Seed the database with sample authors, books, and tickets
npm run seed

# Ingest the knowledge base into ChromaDB
npm run ingest
```

### Running the App

```bash
# From the root directory
npm run dev
```
- API will start on `http://localhost:4000`
- Web app will start on `http://localhost:4001`
- Swagger Docs available at `http://localhost:4000/api/docs`

### Demo Credentials
- **Admin:** `admin@bookleaf.com` / `Password123!`
- **Author:** `priya.sharma@email.com` / `Password123!`

## Known Limitations & Future Improvements
- **Email Notifications:** Currently, notifications are in-app only via WebSockets. Integrating Resend/SendGrid for email alerts is the next logical step.
- **ChromaDB Deployment:** For a truly serverless deployment, ChromaDB should be swapped for Pinecone or a managed vector database, as hosting ChromaDB requires a persistent container.
- **File Uploads:** Attachments currently expect a URL (like Google Drive). Implementing direct S3 uploads would improve the UX.
