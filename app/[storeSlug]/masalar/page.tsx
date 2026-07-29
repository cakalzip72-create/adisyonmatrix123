"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X, Users, Clock3, Wallet, UserCog, Plus, ShoppingCart, FileText, Lock, StickyNote } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pills } from "@/components/ui/Tabs";
import { MOCK_ORDERS, MOCK_TABLES } from "@/lib/mock/data";
import { Order, RestaurantTable, TableStatus, TableZone } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const ZONES: (TableZone | "Tümü")[] = ["Tümü", "İç Salon", "Teras", "Bahçe", "VIP Salon"];

const STATUS_STYLES: Record<TableStatus, { bg: string; text: string; ring: string }> = {
  boş: { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200" },
  dolu: { bg: "bg-orange-500", text: "text-orange-600", ring: "ring-orange-200" },
  rezerve: { bg: "bg-amber-400", text: "text-amber-600", ring: "ring-amber-200" },
  temizlikte: { bg: "bg-slate-400", text: "text-slate-500", ring: "ring-slate-200" },
};

function minutesAgo(iso: string | null) {
  if (!iso) return null;
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}sa ${m}dk` : `${m}dk`;
}

export default function MasalarPage() {
  const { store, staffList } = useStore();
  const { data: tables, setData: setTables } = useRealtimeCollection<RestaurantTable>({
    table: "tables",
    storeId: store.id,
    orderBy: { column: "table_number" },
    mock: MOCK_TABLES,
  });
  const { data: orders } = useRealtimeCollection<Order>({ table: "orders", storeId: store.id, mock: MOCK_ORDERS });
  const [zone, setZone] = useState<TableZone | "Tümü">("Tümü");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const selected = tables.find((t) => t.id === selectedId) ?? null;
  const filtered = useMemo(() => (zone === "Tümü" ? tables : tables.filter((t) => t.zone === zone)), [tables, zone]);
  const counts = useMemo(() => {
    const base: Record<TableStatus, number> = { boş: 0, dolu: 0, rezerve: 0, temizlikte: 0 };
    tables.forEach((t) => (base[t.status] += 1));
    return base;
  }, [tables]);

  async function closeAccount(id: string) {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, status: "temizlikte", opened_at: null, note: null } : t)));
    if (isSupabaseConfigured) {
      await createClient().from("tables").update({ status: "temizlikte", opened_at: null, note: null }).eq("id", id);
    }
  }

  const tableOrders = selected ? orders.filter((o) => o.table_id === selected.id) : [];
  const waiter = selected?.waiter_id ? staffList.find((s) => s.id === selected.waiter_id) : null;

  return (
    <DashboardShell
      title="Masa Planı"
      description="Restoranınızın masa durumlarını canlı olarak takip edin."
      permission="masalar"
      actions={
        <>
          <Select className="w-40" value={zone} onChange={(e) => setZone(e.target.value as TableZone | "Tümü")}>
            {ZONES.map((z) => (
              <option key={z} value={z}>{z === "Tümü" ? "Tüm Salonlar" : z}</option>
            ))}
          </Select>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Masa Ekle
          </Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-4">
        {(Object.keys(counts) as TableStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-sm text-slate-600">
            <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_STYLES[s].bg)} />
            {s[0].toUpperCase() + s.slice(1)} ({counts[s]})
          </span>
        ))}
      </div>

      <Pills tabs={ZONES.map((z) => ({ key: z, label: z === "Tümü" ? "Tüm Salonlar" : z }))} active={zone} onChange={(k) => setZone(k as TableZone | "Tümü")} className="mb-5" />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-6">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Bu salonda masa yok.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5">
              {filtered.map((t) => {
                const style = STATUS_STYLES[t.status];
                const active = selectedId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl text-white font-semibold shadow-sm transition-transform hover:scale-[1.03]",
                      style.bg,
                      active && "ring-4 " + style.ring
                    )}
                  >
                    <span className="text-xl">{t.table_number}</span>
                    <span className="text-[10px] font-normal capitalize opacity-90">{t.status}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          {!selected ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-sm text-slate-400">
              <Users className="mb-3 h-8 w-8 text-slate-300" />
              Detayları görmek için bir masa seçin.
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Masa {selected.table_number}</p>
                  <span className={cn("text-xs font-medium capitalize", STATUS_STYLES[selected.status].text)}>{selected.status}</span>
                </div>
                <button onClick={() => setSelectedId(null)}><X className="h-4 w-4 text-slate-400" /></button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-slate-500"><Users className="h-3.5 w-3.5" /> Kapasite</span>
                  <span className="font-medium text-slate-900">{selected.capacity} Kişi</span>
                </div>
                {selected.opened_at && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Masa Süresi</span>
                    <span className="font-medium text-slate-900">{minutesAgo(selected.opened_at)}</span>
                  </div>
                )}
                {tableOrders.length > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Wallet className="h-3.5 w-3.5" /> Adisyon Toplamı</span>
                    <span className="font-medium text-slate-900">{formatCurrency(tableOrders.reduce((s, o) => s + o.total_amount, 0))}</span>
                  </div>
                )}
                {waiter && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><UserCog className="h-3.5 w-3.5" /> Garson</span>
                    <span className="font-medium text-slate-900">{waiter.full_name}</span>
                  </div>
                )}
              </div>

              <p className="mb-2 mt-5 text-xs font-medium text-slate-400">Hızlı İşlemler</p>
              <div className="space-y-2">
                <Link href={`/${store.slug}/siparisler/yeni?table=${selected.id}`}>
                  <Button className="w-full"><ShoppingCart className="h-4 w-4" /> Sipariş Ekle</Button>
                </Link>
                <Button variant="outline" className="w-full"><FileText className="h-4 w-4" /> Adisyonu Görüntüle</Button>
                {selected.status === "dolu" && (
                  <Button variant="danger" className="w-full" onClick={() => closeAccount(selected.id)}>
                    <Lock className="h-4 w-4" /> Hesabı Kapat
                  </Button>
                )}
              </div>

              {selected.note && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                  <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {selected.note}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <AddTableModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        storeId={store.id}
        nextNumber={String(tables.length + 1)}
        onCreated={(t) => setTables((prev) => [...prev, t])}
      />
    </DashboardShell>
  );
}

function AddTableModal({
  open,
  onClose,
  storeId,
  nextNumber,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  storeId: string;
  nextNumber: string;
  onCreated: (t: RestaurantTable) => void;
}) {
  const [tableNumber, setTableNumber] = useState(nextNumber);
  const [zone, setZone] = useState<TableZone>("İç Salon");
  const [capacity, setCapacity] = useState("4");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await createClient()
          .from("tables")
          .insert({ store_id: storeId, table_number: tableNumber, zone, capacity: Number(capacity), status: "boş" })
          .select()
          .single();
        if (error) throw error;
        onCreated(data as RestaurantTable);
      } else {
        onCreated({
          id: `tbl-${Date.now()}`,
          store_id: storeId,
          table_number: tableNumber,
          zone,
          capacity: Number(capacity),
          status: "boş",
          pos_x: 0,
          pos_y: 0,
          qr_code_url: null,
          qr_customization: null,
          note: null,
          waiter_id: null,
          opened_at: null,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Masa Ekle" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Masa Numarası</Label>
          <Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required />
        </div>
        <div>
          <Label>Salon</Label>
          <Select value={zone} onChange={(e) => setZone(e.target.value as TableZone)}>
            {(["İç Salon", "Teras", "Bahçe", "VIP Salon"] as TableZone[]).map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Kapasite</Label>
          <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Vazgeç</Button>
          <Button type="submit" loading={saving}>Masayı Ekle</Button>
        </div>
      </form>
    </Modal>
  );
}
