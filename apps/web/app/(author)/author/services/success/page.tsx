"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  return (
    <AppShell role="AUTHOR">
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <Card className="max-w-md w-full text-center p-8 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Payment Successful!</h2>
          <p className="text-[var(--muted)] mb-8">
            Thank you for your purchase. We have received your order and our team will begin processing it immediately. You'll receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/author/services">
              <Button variant="secondary" className="w-full">Back to Services</Button>
            </Link>
            <Link href="/author/dashboard">
              <Button className="w-full gap-2">Dashboard <ArrowRight size={16} /></Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
