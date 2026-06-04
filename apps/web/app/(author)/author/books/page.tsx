"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { api } from "@/lib/api";
import { BookMarked, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BooksPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["books"], queryFn: () => api<any[]>("/books") });

  return (
    <AppShell role="AUTHOR">
      <PageHeader
        title="My Published Portfolio"
        description="View your catalog, monitor status, and track lifetime sales and royalties."
        actions={
          <Button variant="secondary" className="gap-2">
            <Download size={16} /> Export Report
          </Button>
        }
      />

      {isLoading ? <DashboardSkeleton count={1} /> : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-500 animate-fade-in">
          <h3 className="font-semibold text-lg">Failed to load books</h3>
          <p className="mt-1 text-sm">{(error as Error).message}</p>
        </div>
      ) : (
        <Card className="overflow-hidden p-0 animate-fade-in shadow-xs border-[var(--border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/30">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3 top-2.5 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search by title, ISBN, or genre..." 
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-sm outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="text-sm font-medium text-[var(--muted)] hidden sm:block">
              {data.length} Title{data.length !== 1 && 's'}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/40 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="p-4 font-semibold">Title Details</th>
                  <th className="p-4 font-semibold">Genre</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">MRP</th>
                  <th className="p-4 font-semibold text-right">Units Sold</th>
                  <th className="p-4 font-semibold text-right text-[var(--primary)]">Total Royalty</th>
                  <th className="p-4 font-semibold text-right">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[var(--muted)]">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <BookMarked size={20} className="text-slate-400" />
                        </div>
                        <p className="font-medium text-[var(--foreground)]">No books published yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : data.map((book) => (
                  <tr key={book.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-8 bg-slate-200 dark:bg-slate-800 rounded shadow-sm shrink-0 flex items-center justify-center overflow-hidden border border-[var(--border)] group-hover:border-[var(--primary)]/30 transition-colors">
                          <BookMarked size={14} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{book.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--muted)] uppercase tracking-wider">
                            <span>ISBN: {book.isbn}</span>
                            <span>•</span>
                            <span>{book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : "Pending"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                        {book.genre}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge tone={book.status === "PUBLISHED" ? "success" : book.status === "IN_PRODUCTION" ? "info" : "neutral"} className="shadow-xs">
                        {book.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-medium">
                      {book.mrp ? formatCurrency(book.mrp) : <span className="text-[var(--muted)] font-normal">TBD</span>}
                    </td>
                    <td className="p-4 text-right font-bold text-[var(--foreground)]">
                      {book.copiesSold.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-[var(--primary)]">{formatCurrency(book.royaltyEarned)}</span>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5">Paid: {formatCurrency(book.royaltyPaid)}</p>
                    </td>
                    <td className="p-4 text-right font-bold text-amber-600 dark:text-amber-400">
                      {book.royaltyPending > 0 ? formatCurrency(book.royaltyPending) : "₹0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppShell>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
