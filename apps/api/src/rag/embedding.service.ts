import crypto from "crypto";

const DIMENSIONS = 384;

export class EmbeddingService {
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => this.localSentenceTransformerFallback(text));
  }

  private localSentenceTransformerFallback(text: string) {
    const vector = new Array<number>(DIMENSIONS).fill(0);
    for (const token of text.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
      const hash = crypto.createHash("sha256").update(token).digest();
      const index = hash.readUInt16BE(0) % DIMENSIONS;
      vector[index] += 1;
    }
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => value / norm);
  }
}
