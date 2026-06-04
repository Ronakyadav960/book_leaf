export type KnowledgeChunk = {
  id: string;
  topic: string;
  text: string;
};

export function chunkDocument(topic: string, content: string, maxChars = 900): KnowledgeChunk[] {
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: KnowledgeChunk[] = [];
  let buffer = "";
  let index = 0;

  for (const paragraph of paragraphs) {
    if ((buffer + "\n\n" + paragraph).length > maxChars && buffer) {
      chunks.push({ id: `${slug(topic)}-${index++}`, topic, text: buffer });
      buffer = paragraph;
    } else {
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    }
  }

  if (buffer) chunks.push({ id: `${slug(topic)}-${index}`, topic, text: buffer });
  return chunks;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
