"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, ShoppingCart } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge, STATUS_TONE } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { OrderStatus } from "@/lib/types";
import { formatCurrency, formatTime } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Bekliyor",
  preparing: "Hazırlanıyor",
  ready: "Hazır",
  delivered: "Teslim Edildi",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

export default function SiparislerPage() {
  const { store } = useStore();
  const { orders } = useRealtimeOrders(store.id);
  const [status, setStatus] = useState<OrderStatus | "hepsi">("hepsi");
  const [q, setQ] = useState("");

  const filtered = orders.filter((o) => {
    if (status !== "hepsi" && o.status !== status) return false;
    if (q && !o.id.toLowerCase().includes(q.toLowerCase()) && !o.table_number?.includes(q)) return false;
    return true;
  });

  return (
    <DashboardShell
      title="Siparişler"
      description="Tüm siparişleri görüntüleyin ve yönetin."
      permission="siparisler"
      actions={
        <Link href={`/${store.slug}/siparisler/yeni`}>
          <Button><Plus className="h-4 w-4" /> Yeni Sipariş</Button>
        </Link>
      }
    >
      <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <Input icon={<Search className="h-4 w-4" />} placeholder="Sipariş no veya masa ara..." value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "hepsi")} className="sm:w-52">
          <option value="hepsi">Tüm Durumlar</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Sipariş bulunamadı" description="Filtrelerinize uyan sipariş yok." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">Sipariş No</th>
                <th className="px-5 py-3 font-medium">Masa</th>
                <th className="px-5 py-3 font-medium">Garson</th>
                <th className="px-5 py-3 font-medium">Ürünler</th>
                <th className="px-5 py-3 font-medium">Tutar</th>
                <th className="px-5 py-3 font-medium">Saat</th>
                <th className="px-5 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900">#{o.id.replace("ord-", "")}</td>
                  <td className="px-5 py-3.5 text-slate-600">Masa {o.table_number}</td>
                  <td className="px-5 py-3.5 text-slate-600">{o.waiter_name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{o.items.length} kalem</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{formatCurrency(o.total_amount)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatTime(o.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={STATUS_TONE[o.status]} dot>{STATUS_LABEL[o.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </DashboardShell>
  );
}
