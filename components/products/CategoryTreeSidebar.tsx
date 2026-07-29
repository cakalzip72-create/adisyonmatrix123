"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryTreeSidebar({
  categories,
  activeId,
  onSelect,
  productCount,
}: {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
  productCount: (categoryId: string) => number;
}) {
  const roots = useMemo(
    () => categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order),
    [categories]
  );
  const childrenOf = useMemo(() => {
    const map = new Map<string, Category[]>();
    categories
      .filter((c) => c.parent_id)
      .forEach((c) => map.set(c.parent_id!, [...(map.get(c.parent_id!) ?? []), c]));
    map.forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order));
    return (id: string) => map.get(id) ?? [];
  }, [categories]);

  // Kategoriler asenkron geldiği için kullanıcı elle kapatmadığı sürece
  // alt kategorisi olan tüm başlıklar açık gösterilir.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const isExpandedFor = (id: string) => childrenOf(id).length > 0 && !collapsed.has(id);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside className="w-full shrink-0 overflow-hidden rounded-2xl bg-slate-900 text-slate-200 lg:w-60">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Kategoriler</p>
      </div>
      <nav className="max-h-[70vh] space-y-0.5 overflow-y-auto p-2">
        <button
          onClick={() => onSelect("Tümü")}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
            activeId === "Tümü" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5"
          )}
        >
          <LayoutGrid className="h-4 w-4" /> Tüm Ürünler
        </button>

        {roots.map((cat) => {
          const kids = childrenOf(cat.id);
          const isExpanded = isExpandedFor(cat.id);
          const isActive = activeId === cat.id;
          return (
            <div key={cat.id}>
              <div
                className={cn(
                  "flex items-center rounded-xl transition-colors",
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5"
                )}
              >
                <button onClick={() => onSelect(cat.id)} className="flex flex-1 items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium">
                  <span>{cat.name}</span>
                  <span className={cn("text-[11px]", isActive ? "text-blue-100" : "text-slate-500")}>{productCount(cat.id)}</span>
                </button>
                {kids.length > 0 && (
                  <button onClick={() => toggle(cat.id)} className="px-2 py-2.5 text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              {isExpanded && kids.length > 0 && (
                <div className="ml-3 space-y-0.5 border-l border-white/10 pl-2">
                  {kids.map((sub) => {
                    const subActive = activeId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSelect(sub.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                          subActive ? "bg-blue-600/80 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        )}
                      >
                        <span>{sub.name}</span>
                        <span className="text-[11px] text-slate-500">{productCount(sub.id)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
