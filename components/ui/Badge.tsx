import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "gray" | "green" | "orange" | "yellow" | "red" | "blue" | "purple";

const toneClasses: Record<Tone, string> = {
  gray: "bg-slate-100 text-slate-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  yellow: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({ className, tone = "gray", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", toneDotClasses[tone])} />}
      {children}
    </span>
  );
}

const toneDotClasses: Record<Tone, string> = {
  gray: "bg-slate-400",
  green: "bg-emerald-500",
  orange: "bg-orange-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
};

export const STATUS_TONE: Record<string, Tone> = {
  boş: "green",
  aktif: "green",
  approved: "green",
  onaylandı: "green",
  tamamlandı: "green",
  completed: "green",
  delivered: "green",
  dolu: "orange",
  bekliyor: "orange",
  pending: "orange",
  preparing: "orange",
  rezerve: "yellow",
  ready: "blue",
  temizlikte: "gray",
  passive: "gray",
  pasif: "gray",
  izinli: "orange",
  "iptal edildi": "red",
  cancelled: "red",
  iptal: "red",
};
