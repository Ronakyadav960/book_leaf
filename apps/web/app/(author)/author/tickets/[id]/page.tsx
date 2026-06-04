"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AiAnalysisPanel } from "@/components/tickets/ai-analysis-panel";
import { TicketConversation } from "@/components/tickets/ticket-conversation";
import { TicketSummaryCard } from "@/components/tickets/ticket-summary-card";
import { api } from "@/lib/api";

import { TicketDetailSkeleton } from "@/components/ui/skeleton-loader";
import { toast } from "sonner";

export default function AuthorTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => api<any>(`/tickets/${id}`),
    enabled: Boolean(id)
  });

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000");
    socket.emit("join:ticket", id);
    socket.on("ticket:response", () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      toast.info("New message received!");
    });
    socket.on("ticket:status", () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      toast.info("Ticket status updated!");
    });
    return () => { socket.disconnect(); };
  }, [id, queryClient]);

  if (error) {
    toast.error(error.message ?? "Failed to load ticket");
  }

  return (
    <AppShell role="AUTHOR">
      <PageHeader
        title="Ticket Details"
        description="Track support progress and continue the conversation."
      />
      {isLoading ? <TicketDetailSkeleton /> : null}
      {error ? (
        <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-red-500">
          <p className="font-semibold">Error Loading Ticket</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      ) : null}
      {ticket ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <TicketSummaryCard ticket={ticket} />
            <TicketConversation
              ticketId={ticket.id}
              queryKey={["ticket", id]}
              responses={ticket.responses}
              statusHistory={ticket.statusHistory}
            />
          </div>
          <div className="space-y-6">
            <AiAnalysisPanel analysis={ticket.aiAnalysis} />
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

