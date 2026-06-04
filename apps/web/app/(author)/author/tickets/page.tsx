"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge, priorityTone, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { MessageSquare, PlusCircle, Calendar, Tag } from "lucide-react";

export default function MyTicketsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tickets"], queryFn: () => api<any>("/tickets") });

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000");
    socket.on("ticket:response", () => queryClient.invalidateQueries({ queryKey: ["tickets"] }));
    socket.on("ticket:status", () => queryClient.invalidateQueries({ queryKey: ["tickets"] }));
    return () => { socket.disconnect(); };
  }, [queryClient]);

  return (
    <AppShell role="AUTHOR">
      <PageHeader
        title="My Support Tickets"
        description="Track the status of your inquiries and communicate with our support team."
        actions={
          <Link href="/author/tickets/new">
            <Button className="gap-1.5 shadow-md shadow-[var(--primary)]/20">
              <PlusCircle size={16} /> New Ticket
            </Button>
          </Link>
        }
      />

      <div className="space-y-4 animate-fade-in stagger-children">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
              <div className="flex justify-between"><div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" /><div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></div>
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
            </div>
          ))
        ) : data?.data?.length ? (
          data.data.map((ticket: any) => (
            <Link 
              key={ticket.id} 
              href={`/author/tickets/${ticket.id}`} 
              className="group block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--primary)]/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                    {ticket.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Tag size={12} /> {ticket.category.replaceAll("_", " ")}</span>
                    <span className="flex items-center gap-1.5 text-[var(--primary)] font-medium">
                      <MessageSquare size={12} /> {ticket.responses.length} messages
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge tone={statusTone(ticket.status)} className="px-2.5 py-1">{ticket.status.replaceAll("_", " ")}</Badge>
                  <Badge tone={priorityTone(ticket.priority)} className="px-2.5 py-1">{ticket.priority}</Badge>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <Card className="py-16 text-center bg-slate-50/50 dark:bg-slate-900/20 border-dashed">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">No support tickets found</h3>
            <p className="text-sm text-[var(--muted)] mb-6 max-w-sm mx-auto">
              You haven't submitted any inquiries yet. If you have questions about your book or royalties, our team is here to help.
            </p>
            <Link href="/author/tickets/new">
              <Button>Create your first ticket</Button>
            </Link>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
