"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { io } from "socket.io-client";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { api } from "@/lib/api";
import { 
  Inbox, 
  Activity, 
  CheckCircle2, 
  AlertOctagon, 
  Share2, 
  RefreshCw, 
  Sparkles,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const analytics = useQuery({ 
    queryKey: ["admin-analytics"], 
    queryFn: () => api<any>("/analytics/admin") 
  });

  const integrations = useQuery({ 
    queryKey: ["integration-health"], 
    queryFn: () => api<any>("/integrations/health") 
  });

  const totals = analytics.data?.totals;

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000");
    socket.emit("join:admin");
    
    const handleTicketUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    };

    socket.on("ticket:new", handleTicketUpdate);
    socket.on("ticket:status", handleTicketUpdate);
    socket.on("ticket:assignment", handleTicketUpdate);
    
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    queryClient.invalidateQueries({ queryKey: ["integration-health"] });
  };

  return (
    <AppShell role="ADMIN">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Admin Operations Center"
          description="Real-time support analytics, automated AI triage, and channel readiness."
        />
        <div className="flex gap-2">
          <Button variant="secondary" className="h-10 text-xs px-3.5 gap-2" onClick={handleRefresh}>
            <RefreshCw size={14} className={analytics.isFetching ? "animate-spin" : ""} />
            Refresh Data
          </Button>
          <Link href="/admin/tickets">
            <Button className="h-10 text-xs px-4 gap-2 shadow-md shadow-[var(--primary)]/20">
              <Inbox size={14} /> Support Queue
            </Button>
          </Link>
        </div>
      </div>

      {analytics.isLoading ? (
        <DashboardSkeleton count={5} />
      ) : analytics.data && totals ? (
        <div className="space-y-6 animate-fade-in stagger-children">
          {/* Statistics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Tickets" value={totals.totalTickets} icon={Inbox} />
            <StatCard label="Open Tickets" value={totals.openTickets} icon={Activity} />
            <StatCard label="Resolved Tickets" value={totals.resolvedTickets} icon={CheckCircle2} />
            <StatCard label="Critical Urgency" value={totals.criticalTickets} icon={AlertOctagon} className="border-red-500/20 bg-red-500/5 hover:border-red-500/40" />
            <StatCard label="Escalated Tickets" value={totals.escalatedTickets} icon={Share2} className="border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40" />
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Chart 
              title="Support Inquiries by Category" 
              data={analytics.data.charts.byCategory.map((item: any) => ({ name: item.category.replace("_", " "), value: item._count }))} 
            />
            <Chart 
              title="Ticket Volume by Priority Level" 
              data={analytics.data.charts.byPriority.map((item: any) => ({ name: item.priority, value: item._count }))} 
              colors={["#ef4444", "#f59e0b", "#06b6d4", "#64748b"]}
            />
          </div>

          {/* AI recommendations and health integrations */}
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <Card className="relative overflow-hidden group border-teal-500/20 shadow-md">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[var(--primary)]/10 blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
                <h3 className="font-bold flex items-center gap-2 text-lg text-[var(--foreground)]">
                  <Sparkles size={18} className="text-[var(--primary)] animate-pulse" /> AI-Driven Queue Insights
                </h3>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1 border-r border-[var(--border)]/60 pr-6">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-[var(--border)] h-full flex flex-col justify-center">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold mb-1">Mean Resolution Time</p>
                    <p className="text-4xl font-black tracking-tight text-[var(--primary)]">
                      {analytics.data.aiInsights.averageResolutionHours} <span className="text-lg font-bold text-[var(--primary)]/70">hrs</span>
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-2">Target SLA: 24 hrs</p>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold mb-3 flex items-center gap-1.5">
                    <Activity size={12}/> Automated Recommendations
                  </p>
                  <ul className="space-y-3">
                    {analytics.data.aiInsights.recommendations.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 rounded-lg p-2 hover:bg-[var(--primary)]/5 transition-colors">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-[var(--foreground)]/90 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
            
            <IntegrationHealth data={integrations.data?.integrations} />
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function Chart({ title, data, colors = ["#0d9488", "#0f766e", "#14b8a6", "#32a38f", "#042f2e"] }: { title: string; data: { name: string; value: number }[]; colors?: string[] }) {
  return (
    <Card className="flex flex-col h-[380px] shadow-sm">
      <h3 className="font-bold text-sm text-[var(--foreground)] border-b border-[var(--border)] pb-3 mb-4">{title}</h3>
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ 
                background: "var(--card)", 
                border: "1px solid var(--border)", 
                borderRadius: "8px", 
                fontSize: "12px",
                fontWeight: "500",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
              }} 
              cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={45}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function IntegrationHealth({ data }: { data?: Record<string, boolean> }) {
  const items = [
    ["n8n Dispatcher", data?.n8n],
    ["Signature Secret", data?.webhookSecret],
    ["Stripe Checkout", true]
  ] as const;

  return (
    <Card className="shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
        <h3 className="font-bold flex items-center gap-2 text-[var(--foreground)]">
          <ShieldCheck size={18} className="text-teal-500" /> Channel Readiness
        </h3>
      </div>
      <div className="space-y-4">
        {items.map(([label, ready]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm p-2 rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
            <span className="text-[var(--foreground)] font-medium flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${ready ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
              {label}
            </span>
            <Badge tone={ready ? "success" : "danger"} className="rounded-md font-bold text-[10px] tracking-wider px-2">
              {ready ? "ACTIVE" : "OFFLINE"}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
