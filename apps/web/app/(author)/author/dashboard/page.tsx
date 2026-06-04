"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { api } from "@/lib/api";
import { Badge, statusTone, priorityTone } from "@/components/ui/badge";

import { BookOpen, Inbox, Landmark, Award, PlusCircle, ArrowRight, BookType } from "lucide-react";

export default function AuthorDashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ["author-dashboard"], queryFn: () => api<any>("/analytics/author") });

  return (
    <AppShell role="AUTHOR">
      <PageHeader
        title="Author Dashboard"
        description="Overview of your books, royalties, and active support tickets."
        actions={
          <Link href="/author/tickets/new">
            <Button className="gap-1.5 shadow-md shadow-[var(--primary)]/20">
              <PlusCircle size={16} /> New Support Ticket
            </Button>
          </Link>
        }
      />

      {isLoading ? <DashboardSkeleton count={4} /> : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-500 animate-fade-in">
          <h3 className="font-semibold text-lg">Failed to load dashboard</h3>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in stagger-children">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Published" value={data.totalBooks} icon={BookOpen} />
            <StatCard label="Active Tickets" value={data.openTickets} icon={Inbox} />
            <StatCard label="Pending Royalty" value={`₹${data.pendingRoyalty.toLocaleString()}`} icon={Landmark} />
            <StatCard label="Lifetime Earnings" value={`₹${data.totalRoyaltyEarned.toLocaleString()}`} icon={Award} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">Recent Support Activity</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Track your latest inquiries and issues.</p>
                </div>
                <Link href="/author/tickets">
                  <Button variant="ghost" className="h-8 text-xs gap-1">
                    View All <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {data.recentTickets?.length ? data.recentTickets.map((ticket: any) => (
                  <Link 
                    key={ticket.id}
                    href={`/author/tickets/${ticket.id}`} 
                    className="group block rounded-xl border border-[var(--border)] bg-transparent p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs hover:border-[var(--primary)]/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{ticket.subject}</p>
                      <div className="flex gap-2 shrink-0">
                        <Badge tone={statusTone(ticket.status)}>{ticket.status.replaceAll("_", " ")}</Badge>
                        <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted)] border-t border-[var(--border)]/40 pt-2.5">
                      <p className="flex items-center gap-1.5">
                        <BookType size={12} /> {ticket.book?.title ?? "General Account Issue"}
                      </p>
                      <p>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                )) : (
                  <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-[var(--border)]">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-3">
                      <Inbox size={24} />
                    </div>
                    <p className="text-sm font-medium text-[var(--foreground)]">No active tickets</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Need help? Create a new support ticket.</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="relative overflow-hidden group border border-teal-500/10 bg-linear-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
                <h3 className="font-bold flex items-center gap-2 text-base border-b border-teal-500/10 pb-3">
                  <Award size={18} className="text-teal-500" /> Royalty Status
                </h3>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold mb-1">Next Payout</p>
                    <p className="text-3xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
                      ₹{data.pendingRoyalty.toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-teal-500/10">
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      Royalties are processed on the 5th of every month for the previous month's sales across all distribution channels.
                    </p>
                  </div>
                  <Link href="/author/books" className="block mt-2">
                    <Button variant="secondary" className="w-full text-xs">View Sales Report</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
