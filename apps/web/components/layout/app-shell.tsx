"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, LogOut, BookOpen, Inbox, BarChart3, Leaf, PlusCircle, ListFilter, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const authorNav = [
  { href: "/author/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/author/books", label: "My Books", icon: BookOpen },
  { href: "/author/tickets", label: "My Tickets", icon: Inbox },
  { href: "/author/tickets/new", label: "Create Ticket", icon: PlusCircle },
  { href: "/author/services", label: "Author Services", icon: ShoppingBag }
];

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tickets", label: "Ticket Queue", icon: ListFilter }
];

export function AppShell({ children, role }: { children: React.ReactNode; role: "AUTHOR" | "ADMIN" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const nav = role === "ADMIN" ? adminNav : authorNav;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] border-r border-[var(--border)] bg-[var(--card)] md:flex flex-col z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--border)] shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[var(--primary)] to-emerald-400 text-white shadow-md shadow-[var(--primary)]/15">
            <Leaf size={18} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight bg-linear-to-r from-[var(--primary)] to-emerald-500 bg-clip-text text-transparent">BookLeaf</p>
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest">Support Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-sm shadow-[var(--primary)]/20"
                    : "text-[var(--muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold uppercase">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="md:pl-[260px]">
        {/* Top header */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg px-6">
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[var(--primary)] to-emerald-400 text-white">
              <Leaf size={16} />
            </div>
            <span className="text-sm font-bold">BookLeaf</span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-[var(--muted)]">{role === "ADMIN" ? "Admin Operations" : "Author Workspace"}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              className="h-8 w-8 px-0 rounded-lg"
              title="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 px-0 rounded-lg hover:text-red-500"
              title="Logout"
              onClick={() => { logout(); router.push("/login"); }}
            >
              <LogOut size={15} />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
