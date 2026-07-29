import { ReactNode } from "react";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  icon: LucideIcon;
  iconTone?: "blue" | "green" | "orange" | "purple" | "red";
  label: string;
  value: string;
  changePct?: number;
  changeLabel?: string;
  right?: ReactNode;
}

const toneClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-600",
};

export function StatCard({ icon: Icon, iconTone = "blue", label, value, changePct, changeLabel, right }: StatCardProps) {
  const positive = (changePct ?? 0) >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", toneClasses[iconTone])}>
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span className="text-sm text-slate-500">{label}</span>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
        {right}
      </div>
      {changePct !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span className={cn("flex items-center gap-0.5 font-medium", positive ? "text-emerald-600" : "text-red-500")}>
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            %{Math.abs(changePct)}
          </span>
          <span className="text-slate-400">{changeLabel ?? "dünkü güne göre"}</span>
        </div>
      )}
    </Card>
  );
}
