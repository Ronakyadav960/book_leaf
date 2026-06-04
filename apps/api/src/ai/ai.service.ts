import type { Department, TicketCategory, TicketPriority } from "@prisma/client";
import { GeminiClient } from "./gemini.client.js";
import type { AiWorkflowResult } from "./ai.types.js";
import { RagService } from "../rag/rag.service.js";

type TicketInput = {
  subject: string;
  description: string;
  bookTitle?: string;
};

export class AiService {
  private gemini = new GeminiClient();
  private rag = new RagService();

  async analyzeTicket(input: TicketInput): Promise<AiWorkflowResult> {
    const query = `${input.subject}\n${input.description}`;
    const retrievedContext = await this.rag.retrieve(query);

    try {
      const result = await this.gemini.generateJson<Omit<AiWorkflowResult, "retrievedContext" | "serviceAvailable">>(
        this.prompt(input, retrievedContext.map((chunk) => `[${chunk.topic}] ${chunk.text}`).join("\n\n"))
      );

      return {
        ...result,
        retrievedContext,
        serviceAvailable: true
      };
    } catch (error) {
      console.warn("Gemini workflow failed", error);
      return {
        ...this.fallback(input),
        retrievedContext,
        serviceAvailable: false,
        warning: "AI Service Temporarily Unavailable"
      };
    }
  }

  private prompt(input: TicketInput, context: string) {
    return `
You are the support intelligence engine for BookLeaf Author Support & Communication Portal.
BookLeaf is a modern publishing company that empowers authors. Your tone must be empathetic, professional, clear, and action-oriented.
Use ONLY the relevant retrieved knowledge base context provided below. Never invent policies, dates, or financial numbers.

Ticket Details:
Book: ${input.bookTitle ?? "Not linked"}
Subject: ${input.subject}
Description: ${input.description}

Relevant knowledge base chunks (RAG):
${context || "No retrieved context available."}

Return strict JSON with this exact shape:
{
  "summary": "One sentence objective summary of the issue.",
  "classification": { 
    "category": "ROYALTY_PAYMENTS | ISBN_METADATA | PRINTING_QUALITY | DISTRIBUTION_AVAILABILITY | BOOK_STATUS_PRODUCTION | GENERAL_INQUIRY", 
    "confidence": 0.95 
  },
  "priority": { 
    "priority": "CRITICAL | HIGH | MEDIUM | LOW", 
    "confidence": 0.90 
  },
  "escalation": { 
    "escalationRequired": true, 
    "department": "FINANCE | PRODUCTION | DISTRIBUTION | METADATA | SUPPORT" 
  },
  "suggestedActions": ["Specific checklist item 1", "Specific checklist item 2"],
  "draftResponse": "An empathetic, professional, specific support reply addressed to the author. Format cleanly with paragraphs."
}`.trim();
  }

  private fallback(input: TicketInput): Omit<AiWorkflowResult, "retrievedContext" | "serviceAvailable"> {
    const text = `${input.subject} ${input.description}`.toLowerCase();
    const category: TicketCategory = text.includes("royalty") || text.includes("payment")
      ? "ROYALTY_PAYMENTS"
      : text.includes("isbn") || text.includes("metadata")
        ? "ISBN_METADATA"
        : text.includes("print")
          ? "PRINTING_QUALITY"
          : text.includes("amazon") || text.includes("available") || text.includes("distribution")
            ? "DISTRIBUTION_AVAILABILITY"
            : text.includes("production") || text.includes("status")
              ? "BOOK_STATUS_PRODUCTION"
              : "GENERAL_INQUIRY";
    const department: Department = category === "ROYALTY_PAYMENTS" ? "FINANCE" : category === "ISBN_METADATA" ? "METADATA" : category === "DISTRIBUTION_AVAILABILITY" ? "DISTRIBUTION" : category === "PRINTING_QUALITY" || category === "BOOK_STATUS_PRODUCTION" ? "PRODUCTION" : "SUPPORT";
    const priority: TicketPriority = text.includes("urgent") || text.includes("legal") ? "HIGH" : text.includes("question") ? "LOW" : "MEDIUM";

    return {
      summary: input.subject,
      classification: { category, confidence: 0.5 },
      priority: { priority, confidence: 0.45 },
      escalation: { escalationRequired: priority !== "LOW", department },
      suggestedActions: ["Review ticket manually", "Verify account and book records", "Send an initial acknowledgement"],
      draftResponse: "Thank you for sharing the details. Our support team has received your request and will review the linked book and account records before responding with the next action."
    };
  }
}
