import { EmbeddingService } from "./embedding.service.js";
import { prisma } from "../config/prisma.js";

export type RetrievedChunk = {
  id: string;
  topic: string;
  text: string;
  distance?: number;
};

export class RagService {
  private embeddings = new EmbeddingService();

  async retrieve(query: string, topK = 4): Promise<RetrievedChunk[]> {
    try {
      const [queryEmbedding] = await this.embeddings.embed([query]);
      
      const result = await prisma.knowledgeChunk.aggregateRaw({
        pipeline: [
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryEmbedding,
              numCandidates: 100,
              limit: topK,
            }
          },
          {
            $project: {
              _id: 1,
              topic: 1,
              text: 1,
              score: { $meta: "vectorSearchScore" }
            }
          }
        ]
      }) as unknown as any[];

      return result.map((doc: any) => ({
        id: doc._id.$oid ?? doc._id,
        topic: doc.topic,
        text: doc.text,
        distance: doc.score
      }));
    } catch (error) {
      console.warn("RAG retrieval unavailable", error);
      return [];
    }
  }
}
