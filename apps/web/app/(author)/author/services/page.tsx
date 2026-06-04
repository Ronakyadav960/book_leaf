"use client";

import { useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Check, ShoppingBag, Sparkles, BookOpen } from "lucide-react";

const services = [
  {
    id: "marketing-pro",
    name: "Pro Marketing Package",
    description: "Boost your book's visibility with a targeted digital ad campaign.",
    price: 4999,
    icon: Sparkles,
    features: ["Social media campaign (30 days)", "Email newsletter feature", "Amazon Ads setup"]
  },
  {
    id: "author-copies-10",
    name: "10 Author Copies",
    description: "Get 10 beautifully printed copies of your book shipped to your door.",
    price: 15000,
    icon: BookOpen,
    features: ["Premium paper quality", "Free standard shipping", "Signed certificate of authenticity"]
  },
  {
    id: "cover-design",
    name: "Premium Cover Design",
    description: "Work with our award-winning designers to revamp your book cover.",
    price: 25000,
    icon: ShoppingBag,
    features: ["3 unique concepts", "Unlimited revisions", "E-book & Paperback formatting"]
  }
];

export default function ServicesPage() {
  const mutation = useMutation({
    mutationFn: (serviceId: string) => 
      api<{ url: string }>("/payments/checkout", { 
        method: "POST", 
        body: JSON.stringify({ serviceId }) 
      }),
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });

  return (
    <AppShell role="AUTHOR">
      <PageHeader
        title="Author Services"
        description="Premium tools and packages to elevate your publishing journey."
      />

      <div className="grid gap-6 md:grid-cols-3 mt-8 animate-fade-in stagger-children">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.id} className="relative overflow-hidden flex flex-col hover:border-[var(--primary)]/50 transition-colors">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[var(--primary)]/5 blur-3xl pointer-events-none" />
              <div className="p-6 flex-1">
                <div className="h-12 w-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">{service.name}</h3>
                <p className="text-sm text-[var(--muted)] mt-2 h-10">{service.description}</p>
                <div className="my-6">
                  <span className="text-3xl font-black text-[var(--foreground)]">₹{(service.price / 100).toLocaleString()}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                      <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <Button 
                  className="w-full shadow-md shadow-[var(--primary)]/20"
                  onClick={() => mutation.mutate(service.id)}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && mutation.variables === service.id ? "Processing..." : "Purchase"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
