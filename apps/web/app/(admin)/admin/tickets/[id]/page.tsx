"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Sparkles, UserCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, Textarea } from "@/components/ui/input";
import { AiAnalysisPanel } from "@/components/tickets/ai-analysis-panel";
import { TicketConversation } from "@/components/tickets/ticket-conversation";
import { TicketSummaryCard } from "@/components/tickets/ticket-summary-card";
import { TicketDetailSkeleton } from "@/components/ui/skeleton-loader";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [note, setNote] = useState("");

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["admin-ticket", id],
    queryFn: () => api<any>(`/admin/tickets/${id}`),
    enabled: Boolean(id)
  });

  const { data: admins } = useQuery<any[]>({
    queryKey: ["admin-users"],
    queryFn: () => api<any[]>("/admin/admins")
  });

  const mutation = useMutation({
    mutationFn: (body: any) => api(`/admin/tickets/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-ticket", id] });
      toast.success("Ticket updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to update ticket.");
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: () => api(`/admin/tickets/${id}/regenerate-ai`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ticket", id] });
      toast.success("AI analysis successfully regenerated!");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to regenerate AI analysis.");
    }
  });

  const currentAssigneeId = ticket?.assignments?.[0]?.adminId ?? "";

  return (
    <AppShell role="ADMIN">
      <PageHeader
        title="Ticket Details"
        description="Review AI triage, update ownership, and respond to the author."
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
            <TicketSummaryCard ticket={ticket} adminView />
            
            <Card className="space-y-5">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <ClipboardList size={18} className="text-teal-500" />
                <h3 className="font-bold">Administrative Controls</h3>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Status</span>
                  <Select className="mt-1.5" value={ticket.status} onChange={(event) => mutation.mutate({ status: event.target.value })}>
                    {["OPEN", "IN_PROGRESS", "WAITING_ON_AUTHOR", "ESCALATED", "RESOLVED", "CLOSED"].map((value) => (
                      <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
                    ))}
                  </Select>
                </label>
                
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Priority</span>
                  <Select className="mt-1.5" value={ticket.priority} onChange={(event) => mutation.mutate({ priority: event.target.value })}>
                    {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </Select>
                </label>
                
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Category</span>
                  <Select className="mt-1.5" value={ticket.category} onChange={(event) => mutation.mutate({ category: event.target.value })}>
                    {["ROYALTY_PAYMENTS", "ISBN_METADATA", "PRINTING_QUALITY", "DISTRIBUTION_AVAILABILITY", "BOOK_STATUS_PRODUCTION", "GENERAL_INQUIRY"].map((value) => (
                      <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
                    ))}
                  </Select>
                </label>
              </div>

              <div className="grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-[1fr_150px]">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Assign Agent</span>
                  <Select 
                    className="mt-1.5" 
                    value={currentAssigneeId} 
                    onChange={(event) => mutation.mutate({ assigneeId: event.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {admins?.map((adm: any) => (
                      <option key={adm.id} value={adm.id}>
                        {adm.name} ({adm.email})
                      </option>
                    ))}
                  </Select>
                </label>
                <div className="flex items-end">
                  <Button 
                    variant="secondary" 
                    className="w-full h-10 gap-1.5 text-xs" 
                    disabled={!user?.id || currentAssigneeId === user?.id || mutation.isPending} 
                    onClick={() => mutation.mutate({ assigneeId: user?.id })}
                  >
                    <UserCheck size={14} /> Assign to Me
                  </Button>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Internal Staff Note</span>
                  <Textarea 
                    className="mt-2" 
                    placeholder="Add private context for the support team..." 
                    value={note} 
                    onChange={(event) => setNote(event.target.value)} 
                  />
                </label>
                <Button 
                  className="mt-3" 
                  disabled={!note.trim() || mutation.isPending} 
                  onClick={() => mutation.mutate({ internalNote: note })}
                >
                  Add Internal Note
                </Button>
              </div>
            </Card>

            <TicketConversation
              ticketId={ticket.id}
              queryKey={["admin-ticket", id]}
              responses={ticket.responses}
              notes={ticket.notes}
              statusHistory={ticket.statusHistory}
              initialMessage={ticket.aiAnalysis?.draftResponse ?? ""}
              showInternalNotes
            />
          </div>
          
          <div className="space-y-6">
            <AiAnalysisPanel 
              analysis={ticket.aiAnalysis} 
              onRegenerate={() => regenerateMutation.mutate()} 
              isRegenerating={regenerateMutation.isPending}
            />
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
