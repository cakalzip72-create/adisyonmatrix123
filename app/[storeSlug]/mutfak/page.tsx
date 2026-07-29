"use client";

import { ArrowRight, Clock3, ChefHat } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Empty";
import { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const COLUMNS: { key: OrderStatus; label: string; tone: string; next?: OrderStatus; nextLabel?: string }[] = [
  { key: "pending", label: "Yeni Siparişler", tone: "border-t-blue-500", next: "preparing", nextLabel: "Hazırlanmaya Başla" },
  { key: "preparing", label: "Hazırlanıyor", tone: "border-t-orange-500", next: "ready", nextLabel: "Hazır Olarak İşaretle" },
  { key: "ready", label: "Hazır", tone: "border-t-emerald-500", next: "delivered", nextLabel: "Servis Edildi" },
];

function elapsed(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return `${mins} dk önce`;
}

export default function MutfakPage() {
  const { store } = useStore();
  const { orders, setOrders } = useRealtimeOrders(store.id);
  const activeOrders = orders.filter((o) => ["pending", "preparing", "ready"].includes(o.status));

  async function advance(id: string, next: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
    if (isSupabaseConfigured) {
      await createClient().from("orders").update({ status: next }).eq("id", id);
    }
  }

  return (
    <DashboardShell title="Mutfak Ekranı" description="Siparişleri hazırlık aşamalarına göre takip edin." permission="mutfak">
      <div className="grid gap-5 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colOrders = activeOrders.filter((o) => o.status === col.key);
          return (
            <div key={col.key}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{col.label}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{colOrders.length}</span>
              </div>
              <div className={cn("space-y-3 rounded-2xl border-t-4 bg-slate-50/60 p-3 min-h-[300px]", col.tone)}>
                {colOrders.length === 0 && (
                  <div className="py-10 text-center text-xs text-slate-400">Bu aşamada sipariş yok.</div>
                )}
                {colOrders.map((o) => (
                  <Card key={o.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold text-slate-900">Masa {o.table_number}</p>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3 w-3" /> {elapsed(o.created_at)}</span>
                    </div>
                    <ul className="mb-3 space-y-1 text-sm text-slate-600">
                      {o.items.map((it) => (
                        <li key={it.id} className="flex justify-between">
                          <span>{it.quantity}x {it.product_name}</span>
                        </li>
                      ))}
                    </ul>
                    {o.note && <p className="mb-3 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">{o.note}</p>}
                    {col.next && (
                      <Button size="sm" className="w-full" onClick={() => advance(o.id, col.next!)}>
                        {col.nextLabel} <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {activeOrders.length === 0 && (
        <div className="mt-6">
          <EmptyState icon={ChefHat} title="Aktif sipariş yok" description="Yeni siparişler geldiğinde burada görünecek." />
        </div>
      )}
    </DashboardShell>
  );
}
