import fs from "fs/promises";
import path from "path";
import { chunkDocument } from "./chunk.js";
import { EmbeddingService } from "./embedding.service.js";
import { prisma } from "../config/prisma.js";

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
  
  await prisma.knowledgeChunk.deleteMany({});
  console.log("Cleared existing knowledge chunks.");

  const data = chunks.map((chunk, index) => ({
    topic: chunk.topic,
    text: chunk.text,
    embedding: embeddings[index]
  }));

  await prisma.knowledgeChunk.createMany({
    data
  });

  console.log(`Ingested ${chunks.length} knowledge base chunks into MongoDB`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
