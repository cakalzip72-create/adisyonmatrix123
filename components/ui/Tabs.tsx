"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { key: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    // Mobilde sekmeler sığmadığında yatay kaydırılabilir olmalı.
    <div className={cn("flex items-center gap-1 overflow-x-auto border-b border-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
            active === tab.key
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Pills({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
            active === tab.key
              ? "bg-blue-50 text-blue-600 border border-blue-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
