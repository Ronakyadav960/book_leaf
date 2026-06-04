import { Badge, priorityTone, statusTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, User, Mail, Calendar, BookType } from "lucide-react";

type TicketSummary = {
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt?: string;
  author?: { name: string; email: string };
  book?: { title: string; isbn?: string } | null;
};

export function TicketSummaryCard({ ticket, adminView = false }: { ticket: TicketSummary; adminView?: boolean }) {
  return (
    <Card className="border-t-4 border-t-[var(--primary)] shadow-md">
      <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-[var(--border)] pb-4">
        <Badge tone={statusTone(ticket.status)} className="px-2.5 py-1 text-xs">{ticket.status.replaceAll("_", " ")}</Badge>
        <Badge tone={priorityTone(ticket.priority)} className="px-2.5 py-1 text-xs">{ticket.priority}</Badge>
        <Badge className="px-2.5 py-1 text-xs">{ticket.category.replaceAll("_", " ")}</Badge>
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{ticket.subject}</h2>
      
      <div className="mt-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-[var(--border)] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
          <FileText size={14} /> Description
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]/90">{ticket.description}</p>
      </div>
      
      <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-2 lg:grid-cols-3">
        {adminView && ticket.author ? (
          <div className="space-y-3 col-span-full sm:col-span-2 lg:col-span-1 p-3 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5"><User size={12}/> Author Details</p>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{ticket.author.name}</p>
              <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5"><Mail size={10}/> {ticket.author.email}</p>
            </div>
          </div>
        ) : null}
        
        <div className="space-y-1.5 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5"><BookType size={12}/> Related Book</p>
          <p className="text-sm font-semibold text-[var(--foreground)]">{ticket.book?.title ?? "General Support Inquiry"}</p>
          {ticket.book?.isbn && <p className="text-xs text-[var(--muted)]">ISBN: {ticket.book.isbn}</p>}
        </div>
        
        {ticket.createdAt ? (
          <div className="space-y-1.5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5"><Calendar size={12}/> Date Submitted</p>
            <p className="text-sm font-semibold text-[var(--foreground)]">{new Date(ticket.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-[var(--muted)]">{new Date(ticket.createdAt).toLocaleTimeString()}</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
