"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Sparkles, HelpCircle } from "lucide-react";


export default function NewTicketPage() {
  const router = useRouter();
  const { data: books = [] } = useQuery({ queryKey: ["books"], queryFn: () => api<any[]>("/books") });
  const [form, setForm] = useState({ bookId: "", subject: "", description: "", attachmentUrl: "" });
  
  const mutation = useMutation({
    mutationFn: () => api<any>("/tickets", { 
      method: "POST", 
      body: JSON.stringify({ ...form, bookId: form.bookId || undefined, attachmentUrl: form.attachmentUrl || undefined }) 
    }),
    onSuccess: (ticket) => {
      toast.success("Support ticket submitted! AI is analyzing details.");
      router.push(`/author/tickets/${ticket.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to submit ticket.");
    }
  });

  return (
    <AppShell role="AUTHOR">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Create Support Ticket</h2>
        <p className="text-sm text-[var(--muted)]">Ask questions or report issues with printing, royalties, or distribution.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <Card className="shadow-xs">
          <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">Book Reference</label>
              <Select value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })}>
                <option value="">General Support (No Book)</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">Subject</label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g., Royalty mismatch for Q1 2026" required />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your question or issue in detail..." required />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">Attachment URL (Optional)</label>
              <Input type="url" placeholder="https://drive.google.com/... or similar" value={form.attachmentUrl} onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })} />
            </div>

            {mutation.error ? (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{mutation.error.message}</p>
            ) : null}

            <Button className="h-11 px-5" disabled={mutation.isPending}>
              {mutation.isPending ? "Analyzing & Routing..." : "Submit Ticket"}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="border border-teal-500/15 bg-teal-50/5 dark:bg-teal-950/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-teal-500/5 blur-xl pointer-events-none" />
            <h3 className="font-bold flex items-center gap-1.5 text-sm mb-3">
              <Sparkles size={14} className="text-teal-500" /> AI Support Copilot
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              When you submit a ticket, our AI engine automatically:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-[var(--muted)]">
              <li className="flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>Summarizes your issue instantly.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>Classifies category and urgency level.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>Retrieves relevant knowledge-base answers (RAG).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>Prepares an automated agent draft reply.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

