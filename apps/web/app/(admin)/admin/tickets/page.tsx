"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, priorityTone, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { DashboardSkeleton, Skeleton } from "@/components/ui/skeleton-loader";
import { api } from "@/lib/api";
import { 
  Inbox, 
  Filter, 
  Calendar,
  Layers,
  ArrowRight,
  User,
  BookType
} from "lucide-react";

export default function AdminTicketQueue() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: "", category: "", priority: "", dateFrom: "", dateTo: "", sort: "priority" });
  
  const ticketQuery = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    return params.toString();
  }, [filters]);

  const tickets = useQuery({ 
    queryKey: ["admin-tickets", ticketQuery], 
    queryFn: () => api<any>(`/admin/tickets?${ticketQuery}`) 
  });

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000");
    socket.emit("join:admin");
    
    const handleTicketUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    };

    socket.on("ticket:new", handleTicketUpdate);
    socket.on("ticket:status", handleTicketUpdate);
    socket.on("ticket:assignment", handleTicketUpdate);
    
    return () => { socket.disconnect(); };
  }, [queryClient]);

  return (
    <AppShell role="ADMIN">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Support Queue"
          description="Route, assign, and address open tickets in the support ecosystem."
        />
        <Button
          variant="secondary"
          className="h-9 text-xs px-3 shadow-xs"
          onClick={() => setFilters({ status: "", category: "", priority: "", dateFrom: "", dateTo: "", sort: "priority" })}
        >
          <Filter size={14} className="mr-1.5"/> Clear Filters
        </Button>
      </div>

      <div className="space-y-6 animate-fade-in stagger-children">
        {/* Dynamic Filters Grid */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/30 p-5 shadow-xs border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
            <Filter size={16} className="text-[var(--primary)]" /> Advanced Filtering
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Queue Status</label>
              <Select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="">All Statuses</option>
                {["OPEN", "IN_PROGRESS", "WAITING_ON_AUTHOR", "ESCALATED", "RESOLVED", "CLOSED"].map((val) => (
                  <option key={val} value={val}>{val.replaceAll("_", " ")}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Issue Category</label>
              <Select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
                <option value="">All Categories</option>
                {["ROYALTY_PAYMENTS", "ISBN_METADATA", "PRINTING_QUALITY", "DISTRIBUTION_AVAILABILITY", "BOOK_STATUS_PRODUCTION", "GENERAL_INQUIRY"].map((val) => (
                  <option key={val} value={val}>{val.replaceAll("_", " ")}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Urgency Rank</label>
              <Select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
                <option value="">All Priorities</option>
                {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Created After</label>
              <Input type="date" value={filters.dateFrom} onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })} />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Created Before</label>
              <Input type="date" value={filters.dateTo} onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })} />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Sort Ordering</label>
              <Select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
                <option value="priority">Urgency Triage</option>
                <option value="oldest">Oldest First</option>
                <option value="newest">Newest First</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tickets Listing */}
        <div className="space-y-4">
          {tickets.isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="p-5 space-y-4 shadow-xs">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <div className="flex gap-6 pt-3 border-t border-[var(--border)]">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </Card>
            ))
          ) : tickets.data?.data?.length ? (
            tickets.data.data.map((ticket: any) => (
              <Link 
                key={ticket.id} 
                href={`/admin/tickets/${ticket.id}`} 
                className="group block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--primary)]/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-bold text-lg text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                        {ticket.subject}
                      </h3>
                      {ticket.escalated && (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20 uppercase">
                          Escalated
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted)] line-clamp-1 mb-4">{ticket.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[var(--muted)] bg-slate-50 dark:bg-slate-900/40 py-2 px-3 rounded-lg border border-[var(--border)]/60">
                      <p className="flex items-center gap-1.5">
                        <User size={13} className="text-[var(--primary)]"/> {ticket.author.name}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <BookType size={13} className="text-[var(--primary)]"/> {ticket.book?.title ?? "General Account Issue"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[var(--primary)]"/> {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex gap-2">
                      <Badge tone={statusTone(ticket.status)} className="px-2.5 py-1">{ticket.status.replaceAll("_", " ")}</Badge>
                      <Badge tone={priorityTone(ticket.priority)} className="px-2.5 py-1">{ticket.priority}</Badge>
                    </div>
                    <Badge className="px-2 py-0.5 text-[10px] font-bold tracking-wider">{ticket.category.replaceAll("_", " ")}</Badge>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <Card className="py-16 text-center border-dashed">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
                <Inbox size={28} />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">Queue is empty</h3>
              <p className="text-sm text-[var(--muted)]">No active tickets match your current filters.</p>
              {Object.values(filters).some(Boolean) && (
                <Button 
                  variant="secondary" 
                  className="mt-6"
                  onClick={() => setFilters({ status: "", category: "", priority: "", dateFrom: "", dateTo: "", sort: "priority" })}
                >
                  Clear all filters
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
