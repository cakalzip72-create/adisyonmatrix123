"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function MiniCalendar({ markedDates, selected, onSelect }: { markedDates: Set<string>; selected: Date; onSelect: (d: Date) => void }) {
  const [cursor, setCursor] = useState(selected);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold capitalize text-slate-900">{format(cursor, "MMMM yyyy", { locale: tr })}</p>
        <div className="flex gap-1">
          <button onClick={() => setCursor((c) => addMonths(c, -1))} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCursor((c) => addMonths(c, 1))} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400">
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const marked = markedDates.has(key);
          const isSelected = isSameDay(d, selected);
          return (
            <button
              key={key}
              onClick={() => onSelect(d)}
              className={cn(
                "relative flex h-8 items-center justify-center rounded-lg text-xs",
                !isSameMonth(d, cursor) && "text-slate-300",
                isSameMonth(d, cursor) && "text-slate-600",
                isSelected && "bg-blue-600 text-white font-semibold"
              )}
            >
              {format(d, "d")}
              {marked && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
