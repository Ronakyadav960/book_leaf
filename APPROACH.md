# BookLeaf Assignment — Approach & Trade-offs

## 1. What was prioritized?

**AI Integration & Reliability:** 
The core of this assignment was the AI-assisted response generation. I prioritized building a robust RAG (Retrieval-Augmented Generation) pipeline over a simple generic LLM call. By chunking the provided markdown policies and storing them in a local ChromaDB vector store, the AI grounds its responses purely in BookLeaf policies. 

**Resilience (Graceful Degradation):**
I prioritized making sure the system never fails catastrophically. If the Gemini API is down, rate-limited, or fails to parse JSON, the `AiService` catches the error and falls back to a regex/keyword-based deterministic triage system. The author still gets their ticket submitted and routed correctly, and the admin receives a warning flag that AI analysis is temporarily unavailable.

**User Experience (Real-time & UI):**
I prioritized a premium, responsive UI. Using Next.js, Tailwind, and Radix UI primitives, I ensured the interface feels modern. I integrated Socket.io so that when an admin replies to a ticket or changes its status, the author sees the update instantly without refreshing the page.

## 2. What trade-offs were made?

**Vector Database Selection:**
*Trade-off:* Used ChromaDB locally instead of a managed service like Pinecone.
*Why:* For an assignment, minimizing external dependencies makes it easier to evaluate. However, running a persistent ChromaDB container complicates serverless deployment (like Vercel/Railway). In a real production scenario, I would swap the local ChromaDB for a managed vector database or PostgreSQL with `pgvector`.

**Authentication Strategy:**
*Trade-off:* Used simple JWT with localStorage instead of HTTP-only cookies or NextAuth.js.
*Why:* The assignment explicitly requested "simple email/password is fine." Implementing fully secure, rotating HTTP-only cookies with CSRF protection would have added significant boilerplate that distracted from the core AI/Ticketing logic being evaluated.

**Monorepo vs Separate Repos:**
*Trade-off:* Kept both frontend and backend in a Turborepo monorepo.
*Why:* It allows sharing types easily (though I opted for loose coupling via generic API responses for speed). It makes local development effortless (`npm run dev` starts both).

## 3. How would this evolve into a production system?

To take this from an assignment to an enterprise production system, I would implement:

1. **Email & Push Notifications:**
   Integrate AWS SES or Resend. WebSockets are great for active sessions, but authors need emails when their ticket is updated asynchronously.
   
2. **Advanced RAG Pipelines:**
   Currently, the RAG uses simple cosine similarity. In production, I would add a reranking step (e.g., Cohere Rerank) to ensure the retrieved chunks are highly relevant, and implement conversational memory so the AI understands follow-up questions.

3. **Analytics Data Warehouse:**
   The admin dashboard currently aggregates data via Prisma `groupBy`. As the ticket volume grows, this will become slow. I would set up a read-replica or export data to Snowflake/BigQuery for heavy analytics.

4. **S3 File Uploads:**
   Instead of asking users for an "Attachment URL", I would implement direct-to-S3 presigned URL uploads for screenshots of printing defects or royalty statements.

5. **Human-in-the-Loop AI Feedback:**
   Add a "Thumbs Up/Down" button for admins on the AI-generated draft responses. This data would be fed back to fine-tune the prompt or the embedding model over time.
