import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type RetrievedChunk = {
  id: string;
  topic: string;
  text: string;
  distance?: number;
};

type Analysis = {
  category: string;
  categoryConfidence: number;
  priority: string;
  priorityConfidence: number;
  escalationRequired: boolean;
  department: string;
  summary: string;
  suggestedActions: string[];
  draftResponse: string;
  warning?: string;
  retrievedContext?: RetrievedChunk[];
};

export function AiAnalysisPanel({
  analysis,
  onRegenerate,
  isRegenerating
}: {
  analysis?: Analysis | null;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}) {
  if (!analysis) {
    return (
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-1.5 text-[var(--foreground)]">
            <Sparkles size={16} className="text-teal-500" /> AI Analysis
          </h2>
          {onRegenerate && (
            <Button
              variant="secondary"
              className="h-7 text-xs px-2.5 gap-1.5"
              disabled={isRegenerating}
              onClick={onRegenerate}
            >
              <Sparkles size={12} className={isRegenerating ? "animate-spin" : ""} />
              {isRegenerating ? "Generating..." : "Generate Analysis"}
            </Button>
          )}
        </div>
        <p className="text-sm text-[var(--muted)]">AI analysis is not available for this ticket yet.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <h2 className="font-bold flex items-center gap-1.5 text-[var(--foreground)]">
          <Sparkles size={16} className="text-teal-500 animate-pulse" /> AI Support Agent
        </h2>
        <div className="flex items-center gap-2">
          {analysis.warning ? (
            <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <AlertTriangle size={11} /> {analysis.warning}
            </span>
          ) : null}
          {onRegenerate && (
            <Button
              variant="secondary"
              className="h-7 text-xs px-2.5 gap-1.5"
              disabled={isRegenerating}
              onClick={onRegenerate}
            >
              <Sparkles size={12} className={isRegenerating ? "animate-spin" : ""} />
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Info label="Category Triage" value={analysis.category.replace("_", " ")} extra={`${Math.round(analysis.categoryConfidence * 100)}% Match`} />
        <Info label="Urgency Rank" value={analysis.priority} extra={`${Math.round(analysis.priorityConfidence * 100)}% confidence`} />
        <Info label="Routing Dispatch" value={analysis.escalationRequired ? "Escalation Flagged" : "Standard Queue"} extra={analysis.escalationRequired ? `${analysis.department} Dept` : "General Support"} />
        <Info label="Executive Summary" value={analysis.summary} className="sm:col-span-2" />
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <p className="mb-2 text-sm font-semibold">Suggested Operations Checklist</p>
        <ul className="space-y-1.5 text-sm text-[var(--muted)]">
          {analysis.suggestedActions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold mt-0.5">{idx + 1}</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <p className="mb-2 text-sm font-semibold">Suggested Draft Response</p>
        <div className="rounded-lg border border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/30 p-4 text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap font-sans">
          {analysis.draftResponse}
        </div>
      </div>

      {analysis.retrievedContext && Array.isArray(analysis.retrievedContext) && analysis.retrievedContext.length > 0 ? (
        <div className="border-t border-[var(--border)] pt-4">
          <p className="mb-3 text-sm font-semibold flex items-center gap-1.5">
            <BookOpen size={14} className="text-teal-500" /> RAG Grounded Sources
          </p>
          <div className="space-y-2">
            {analysis.retrievedContext.map((chunk, i) => (
              <div key={chunk.id ?? i} className="rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-[var(--border)]/60 p-3 text-xs">
                <div className="flex items-center justify-between font-semibold text-[var(--foreground)] mb-1">
                  <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{chunk.topic}</span>
                  {chunk.distance !== undefined && (
                    <span className="text-[var(--muted)] text-[10px] font-normal">Distance: {chunk.distance.toFixed(4)}</span>
                  )}
                </div>
                <p className="text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{chunk.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function Info({ label, value, extra, className }: { label: string; value: string; extra?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-sm font-semibold text-[var(--foreground)]">{value}</span>
        {extra && <span className="text-xs text-[var(--muted)] font-normal">({extra})</span>}
      </div>
    </div>
  );
}
