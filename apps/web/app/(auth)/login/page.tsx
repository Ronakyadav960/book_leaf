"use client";

import { useMutation } from "@tanstack/react-query";
import { Leaf, Lock, Mail, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type ApiUser } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("admin@bookleaf.com");
  const [password, setPassword] = useState("Password123!");

  const mutation = useMutation({
    mutationFn: () => api<{ user: ApiUser; token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    onSuccess: ({ user, token }) => {
      setSession(user, token);
      router.push(user.role === "ADMIN" ? "/admin/dashboard" : "/author/dashboard");
    }
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-radial from-slate-50 via-slate-100 to-slate-200 px-4 dark:from-slate-950 dark:via-[#090d14] dark:to-slate-950">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[var(--primary)]/8 blur-[120px] pointer-events-none animate-pulse-soft" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-teal-400/8 blur-[120px] pointer-events-none animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      
      <div className="relative w-full max-w-md animate-fade-in">
        <Card className="glass-panel border-white/20 shadow-2xl dark:border-slate-800/80 p-8 backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[var(--primary)] to-emerald-400 text-white shadow-lg shadow-[var(--primary)]/25 mb-4">
              <Leaf size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-[var(--primary)] to-emerald-400 bg-clip-text text-transparent">BookLeaf Portal</h1>
            <p className="text-sm text-[var(--muted)] mt-1.5">Author Support & Communication Platform</p>
          </div>

          <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-[var(--muted)]" />
                <Input className="pl-10" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@email.com" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-[var(--muted)]" />
                <Input className="pl-10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
              </div>
            </div>

            {mutation.error ? (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{mutation.error.message}</p>
            ) : null}

            <Button className="w-full h-11 gap-2" disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in..." : <><span>Sign in to Dashboard</span><ArrowRight size={16} /></>}
            </Button>
          </form>

          <div className="mt-8 border-t border-[var(--border)] pt-5">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3 text-center">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9 text-xs"
                onClick={() => { setEmail("priya.sharma@email.com"); setPassword("Password123!"); }}
              >
                Author (Priya)
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 text-xs"
                onClick={() => { setEmail("admin@bookleaf.com"); setPassword("Password123!"); }}
              >
                Admin (Manager)
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-[var(--muted)]/60 mt-6">
          © {new Date().getFullYear()} BookLeaf Publishing · AI-Powered Support
        </p>
      </div>
    </main>
  );
}
