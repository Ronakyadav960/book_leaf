import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  className,
  icon: Icon
}: {
  label: string;
  value: string | number;
  className?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
}) {
  return (
    <Card className={cn("relative overflow-hidden group hover:border-[var(--primary)]/30", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/5 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)] transition-all duration-300">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[var(--primary)]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </Card>
  );
}

