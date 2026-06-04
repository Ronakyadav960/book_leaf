"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Clock, User, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Response = {
  id: string;
  message: string;
  createdAt: string;
  author: { name: string; role?: string };
};

type Note = {
  id: string;
  note: string;
  createdAt: string;
  author?: { name: string };
};

type StatusItem = {
  id: string;
  from?: string | null;
  to: string;
  createdAt: string;
};

export function TicketConversation({
  ticketId,
  queryKey,
  responses = [],
  notes = [],
  statusHistory = [],
  initialMessage = "",
  showInternalNotes = false
}: {
  ticketId: string;
  queryKey: unknown[];
  responses?: Response[];
  notes?: Note[];
  statusHistory?: StatusItem[];
  initialMessage?: string;
  showInternalNotes?: boolean;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState(initialMessage);
  const mutation = useMutation({
    mutationFn: () => api(`/tickets/${ticketId}/responses`, { method: "POST", body: JSON.stringify({ message }) }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const timeline = [
    ...statusHistory.map((item) => ({
      id: `status-${item.id}`,
      date: item.createdAt,
      type: "status" as const,
      title: "Status updated",
      body: `${item.from ? `${item.from.replaceAll("_", " ")} → ` : ""}${item.to.replaceAll("_", " ")}`
    })),
    ...responses.map((item) => ({
      id: `response-${item.id}`,
      date: item.createdAt,
      type: "response" as const,
      role: item.author.role,
      title: item.author.name,
      body: item.message
    })),
    ...(showInternalNotes
      ? notes.map((item) => ({
          id: `note-${item.id}`,
          date: item.createdAt,
          type: "note" as const,
          title: `Internal Note (${item.author?.name ?? "System"})`,
          body: item.note
        }))
      : [])
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="space-y-6">
      <div className="border-b border-[var(--border)] pb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Clock size={18} className="text-[var(--primary)]" /> Conversation History
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1">Timeline of messages, status changes, and internal updates.</p>
      </div>

      <div className="space-y-6 animate-fade-in stagger-children">
        {timeline.length ? timeline.map((item) => {
          const isStatus = item.type === "status";
          const isNote = item.type === "note";
          const isAdmin = item.type === "response" && item.role === "ADMIN";
          const isAuthor = item.type === "response" && item.role === "AUTHOR";

          return (
            <div key={item.id} className="relative pl-6">
              {/* Timeline connecting line */}
              <div className="absolute left-2.5 top-8 bottom-[-24px] w-0.5 bg-[var(--border)] last:hidden" />
              
              {/* Timeline icon */}
              <div className={cn(
                "absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--card)] z-10",
                isStatus ? "bg-slate-300 dark:bg-slate-700" :
                isNote ? "bg-amber-500" :
                isAdmin ? "bg-teal-500" : "bg-blue-500"
              )}>
                {isStatus ? <Clock size={10} className="text-white" /> :
                 isNote ? <ShieldAlert size={10} className="text-white" /> :
                 isAdmin ? <Sparkles size={10} className="text-white" /> : 
                 <User size={10} className="text-white" />}
              </div>

              <div className={cn(
                "rounded-xl border p-4 transition-all hover:shadow-sm",
                isStatus ? "bg-transparent border-dashed border-[var(--border)]" :
                isNote ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" :
                isAdmin ? "bg-[var(--primary)]/5 border-[var(--primary)]/20 shadow-sm" : 
                "bg-[var(--card)] border-[var(--border)] shadow-xs"
              )}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-sm font-bold",
                      isNote ? "text-amber-700 dark:text-amber-400" : "text-[var(--foreground)]"
                    )}>
                      {item.title}
                    </p>
                    {isAdmin && <span className="rounded bg-[var(--primary)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)] uppercase">Support Agent</span>}
                    {isNote && <span className="rounded bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Internal</span>}
                  </div>
                  <p className="text-xs text-[var(--muted)] font-medium bg-[var(--card)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                    {new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
                <p className={cn(
                  "whitespace-pre-wrap text-sm leading-relaxed",
                  isStatus ? "text-[var(--muted)] font-medium" : 
                  isNote ? "text-amber-800 dark:text-amber-200/80" : "text-[var(--foreground)]/90"
                )}>
                  {item.body}
                </p>
              </div>
            </div>
          );
        }) : (
          <div className="py-8 text-center text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
            No timeline activity yet.
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] pt-5 mt-8">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
          {showInternalNotes ? "Draft a Reply" : "Reply to Support"}
        </label>
        <Textarea 
          placeholder="Type your message here..." 
          value={message} 
          onChange={(event) => setMessage(event.target.value)} 
          className="bg-[var(--card)] focus:bg-[var(--background)] transition-colors min-h-[120px]"
        />
        <div className="mt-3 flex justify-between items-center">
          <p className="text-[10px] text-[var(--muted)] hidden sm:block">
            {showInternalNotes ? "Message will be visible to the author." : "Our team usually responds within 24 hours."}
          </p>
          <Button 
            className="w-full sm:w-auto px-6 h-10 shadow-md shadow-[var(--primary)]/20"
            disabled={message.trim().length < 2 || mutation.isPending} 
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Sending..." : <>Send Message <Send size={16} /></>}
          </Button>
        </div>
      </div>
    </Card>
  );
}
