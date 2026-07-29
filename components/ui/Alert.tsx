import { AlertTriangle, CheckCircle2, Info, LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Tone = "info" | "warning" | "success" | "ai";

const config: Record<Tone, { icon: LucideIcon; classes: string }> = {
  info: { icon: Info, classes: "bg-blue-50 text-blue-700 border-blue-100" },
  warning: { icon: AlertTriangle, classes: "bg-amber-50 text-amber-700 border-amber-100" },
  success: { icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  ai: { icon: Sparkles, classes: "bg-purple-50 text-purple-700 border-purple-100" },
};

export function Alert({ tone = "info", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const { icon: Icon, classes } = config[tone];
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm", classes, className)}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
