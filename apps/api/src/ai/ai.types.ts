import type { Department, TicketCategory, TicketPriority } from "@prisma/client";
import type { RetrievedChunk } from "../rag/rag.service.js";

export type AiWorkflowResult = {
  summary: string;
  classification: { category: TicketCategory; confidence: number };
  priority: { priority: TicketPriority; confidence: number };
  escalation: { escalationRequired: boolean; department: Department };
  suggestedActions: string[];
  draftResponse: string;
  retrievedContext: RetrievedChunk[];
  serviceAvailable: boolean;
  warning?: string;
};
