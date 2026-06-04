import { ChromaClient } from "chromadb";
import { env } from "../config/env.js";
import { EmbeddingService } from "./embedding.service.js";

export type RetrievedChunk = {
  id: string;
  topic: string;
  text: string;
  distance?: number;
};

export class RagService {
  private client = new ChromaClient({ path: env.CHROMA_URL });
  private embeddings = new EmbeddingService();

  async retrieve(query: string, topK = 4): Promise<RetrievedChunk[]> {
    try {
      const collection = await this.client.getOrCreateCollection({ name: env.CHROMA_COLLECTION });
      const [queryEmbedding] = await this.embeddings.embed([query]);
      const result = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK
      });

      return (result.ids?.[0] ?? []).map((id, index) => ({
        id: String(id),
        topic: String(result.metadatas?.[0]?.[index]?.topic ?? "Knowledge Base"),
        text: String(result.documents?.[0]?.[index] ?? ""),
        distance: result.distances?.[0]?.[index]
      }));
    } catch (error) {
      console.warn("RAG retrieval unavailable", error);
      return [];
    }
  }
}
