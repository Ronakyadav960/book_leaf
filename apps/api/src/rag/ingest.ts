import fs from "fs/promises";
import path from "path";
import { ChromaClient } from "chromadb";
import { env } from "../config/env.js";
import { chunkDocument } from "./chunk.js";
import { EmbeddingService } from "./embedding.service.js";

async function main() {
  const kbDir = path.resolve(process.cwd(), "../../knowledge-base");
  const files = await fs.readdir(kbDir);
  const chunks = [];

  for (const file of files.filter((name) => name.endsWith(".md"))) {
    const topic = file.replace(/\.md$/, "").replace(/-/g, " ");
    const content = await fs.readFile(path.join(kbDir, file), "utf8");
    chunks.push(...chunkDocument(topic, content));
  }

  const embeddings = await new EmbeddingService().embed(chunks.map((chunk) => chunk.text));
  const client = new ChromaClient({ path: env.CHROMA_URL });
  const collection = await client.getOrCreateCollection({ name: env.CHROMA_COLLECTION });

  await collection.upsert({
    ids: chunks.map((chunk) => chunk.id),
    documents: chunks.map((chunk) => chunk.text),
    embeddings,
    metadatas: chunks.map((chunk) => ({ topic: chunk.topic }))
  });

  console.log(`Ingested ${chunks.length} knowledge base chunks into ${env.CHROMA_COLLECTION}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
