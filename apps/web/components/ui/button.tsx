import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs hover:bg-[var(--primary-hover)] hover:shadow-md hover:shadow-[var(--primary)]/10",
        variant === "secondary" && "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--border)]/20",
        variant === "danger" && "bg-red-600 text-white shadow-xs hover:bg-red-700 hover:shadow-md hover:shadow-red-500/10",
        variant === "ghost" && "bg-transparent text-[var(--muted)] hover:bg-[var(--border)]/20 hover:text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  );
}

