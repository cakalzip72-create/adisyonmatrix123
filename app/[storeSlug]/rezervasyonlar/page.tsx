"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarClock, CalendarX, Download, Phone, Plus, Users as UsersIcon } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, STATUS_TONE } from "@/components/ui/Badge";
import { DonutChart, DonutLegend } from "@/components/ui/charts/DonutChart";
import { MiniCalendar } from "@/components/reservations/MiniCalendar";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { MOCK_RESERVATIONS, MOCK_TABLES } from "@/lib/mock/data";
import { Reservation, RestaurantTable, TableZone } from "@/lib/types";
import { exportToExcel } from "@/lib/xlsx-export";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const ZONE_COLORS: Record<string, string> = { "İç Salon": "#2563eb", Teras: "#22c55e", Bahçe: "#a855f7", "VIP Salon": "#f97316" };
const ZONES: TableZone[] = ["İç Salon", "Teras", "Bahçe", "VIP Salon"];

export default function RezervasyonlarPage() {
  const { store } = useStore();
  const { data: tables } = useRealtimeCollection<RestaurantTable>({ table: "tables", storeId: store.id, mock: MOCK_TABLES });
  const { data: rawReservations, setData: setReservations } = useRealtimeCollection<Reservation & { table_id?: string }>({
    table: "reservations",
    storeId: store.id,
    orderBy: { column: "date", ascending: false },
    mock: MOCK_RESERVATIONS,
  });

  const reservations = useMemo(
    () => rawReservations.map((r) => ({ ...r, table_number: r.table_number ?? tables.find((t) => t.id === r.table_id)?.table_number ?? "—" })),
    [rawReservations, tables]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [calDate, setCalDate] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", date: format(new Date(), "yyyy-MM-dd"), time: "19:00", guest_count: 2, zone: "İç Salon" as TableZone, table_id: "", prepayment: 0, note: "" });

  const selected = reservations.find((r) => r.id === selectedId) ?? null;

  const markedDates = useMemo(() => new Set(reservations.map((r) => r.date)), [reservations]);
  const zoneDist = useMemo(() => {
    const counts: Record<string, number> = {};
    reservations.forEach((r) => (counts[r.zone] = (counts[r.zone] ?? 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: ZONE_COLORS[name] ?? "#94a3b8" }));
  }, [reservations]);

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === "onaylandı").length,
    pending: reservations.filter((r) => r.status === "bekliyor").length,
    cancelled: reservations.filter((r) => r.status === "iptal edildi").length,
  };

  function handleExport() {
    exportToExcel("adisyonmatrix-rezervasyonlar", [
      { name: "Rezervasyonlar", rows: reservations.map((r) => ({ Kod: r.code, Müşteri: r.customer_name, Telefon: r.customer_phone, Tarih: r.date, Saat: r.time, Kişi: r.guest_count, Salon: r.zone, Durum: r.status })) },
    ]);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const table = tables.find((t) => t.id === form.table_id);
      const code = `#RZV-${String(reservations.length + 1).padStart(4, "0")}`;
      const payload = {
        store_id: store.id,
        code,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        date: form.date,
        time: form.time,
        guest_count: form.guest_count,
        zone: form.zone,
        table_id: form.table_id || null,
        status: "bekliyor" as const,
        prepayment: form.prepayment,
        note: form.note || null,
        source: "telefon" as const,
      };
      if (isSupabaseConfigured) {
        const { data, error } = await createClient().from("reservations").insert(payload).select().single();
        if (!error) setReservations((prev) => [{ ...(data as Reservation), table_number: table?.table_number ?? "—" }, ...prev]);
      } else {
        setReservations((prev) => [{ id: `rzv-${Date.now()}`, table_number: table?.table_number ?? "—", ...payload } as Reservation, ...prev]);
      }
      setAddOpen(false);
      setForm({ customer_name: "", customer_phone: "", date: format(new Date(), "yyyy-MM-dd"), time: "19:00", guest_count: 2, zone: "İç Salon", table_id: "", prepayment: 0, note: "" });
    } finally {
      setSaving(false);
    }
  }

  async function cancelReservation(r: Reservation) {
    setReservations((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: "iptal edildi" } : x)));
    if (isSupabaseConfigured) {
      await createClient().from("reservations").update({ status: "iptal edildi" }).eq("id", r.id);
    }
  }

  return (
    <DashboardShell
      title="Rezervasyonlar"
      description="Gelen rezervasyonları yönetin, onaylayın ve masa planlamasını kolayca yapın."
      permission="rezervasyonlar"
      actions={
        <>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4" /> Dışa Aktar</Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Yeni Rezervasyon</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="p-4"><p className="text-xs text-slate-400">Toplam Rezervasyon</p><p className="mt-1 text-xl font-semibold text-slate-900">{stats.total}</p></Card>
        <Card className="p-4"><span className="flex items-center gap-1.5 text-xs text-emerald-500"><CalendarCheck className="h-3.5 w-3.5" /> Onaylanan</span><p className="mt-1 text-xl font-semibold text-slate-900">{stats.confirmed}</p></Card>
        <Card className="p-4"><span className="flex items-center gap-1.5 text-xs text-amber-500"><CalendarClock className="h-3.5 w-3.5" /> Bekleyen</span><p className="mt-1 text-xl font-semibold text-slate-900">{stats.pending}</p></Card>
        <Card className="p-4"><span className="flex items-center gap-1.5 text-xs text-red-500"><CalendarX className="h-3.5 w-3.5" /> İptal Edilen</span><p className="mt-1 text-xl font-semibold text-slate-900">{stats.cancelled}</p></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {reservations.length === 0 ? (
          <Card className="py-14 text-center text-sm text-slate-400">Henüz rezervasyon yok.</Card>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-3 font-medium">Rez. No</th>
                  <th className="px-5 py-3 font-medium">Tarih &amp; Saat</th>
                  <th className="px-5 py-3 font-medium">Müşteri</th>
                  <th className="px-5 py-3 font-medium">Kişi</th>
                  <th className="px-5 py-3 font-medium">Salon / Masa</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} onClick={() => setSelectedId(r.id)} className={`cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/60 ${selectedId === r.id ? "bg-blue-50/50" : ""}`}>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{r.code}</td>
                    <td className="px-5 py-3.5 text-slate-600">{format(new Date(r.date), "dd.MM.yyyy")} {r.time}</td>
                    <td className="px-5 py-3.5 text-slate-600">{r.customer_name}</td>
                    <td className="px-5 py-3.5 text-slate-500"><span className="flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" /> {r.guest_count}</span></td>
                    <td className="px-5 py-3.5 text-slate-500">{r.zone} · Masa {r.table_number}</td>
                    <td className="px-5 py-3.5"><Badge tone={STATUS_TONE[r.status]} dot>{r.status[0].toUpperCase() + r.status.slice(1)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <div className="space-y-5">
          <Card>
            <MiniCalendar markedDates={markedDates} selected={calDate} onSelect={setCalDate} />
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">Salonlara Göre Dağılım</p>
            <div className="flex items-center gap-4">
              <DonutChart data={zoneDist} size={120} />
              <DonutLegend data={zoneDist} />
            </div>
          </Card>
          {selected && (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Rezervasyon Detayı</p>
                <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
              </div>
              <p className="text-sm font-medium text-slate-900">{selected.customer_name}</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-400"><Phone className="h-3 w-3" /> {selected.customer_phone}</p>
              <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                <p>Tarih: {format(new Date(selected.date), "dd.MM.yyyy")} {selected.time}</p>
                <p>Kişi: {selected.guest_count}</p>
                <p>Salon: {selected.zone} — Masa {selected.table_number}</p>
                <p>Ön Ödeme: {selected.prepayment > 0 ? formatCurrency(selected.prepayment) : "—"}</p>
                {selected.note && <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">{selected.note}</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="danger" className="flex-1" onClick={() => cancelReservation(selected)} disabled={selected.status === "iptal edildi"}>İptal Et</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yeni Rezervasyon" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Müşteri Adı</Label>
              <Input value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} required />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input value={form.customer_phone} onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))} required />
            </div>
            <div>
              <Label>Tarih</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
            </div>
            <div>
              <Label>Saat</Label>
              <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} required />
            </div>
            <div>
              <Label>Kişi Sayısı</Label>
              <Input type="number" min={1} value={form.guest_count} onChange={(e) => setForm((f) => ({ ...f, guest_count: Number(e.target.value) }))} required />
            </div>
            <div>
              <Label>Ön Ödeme (₺)</Label>
              <Input type="number" min={0} value={form.prepayment} onChange={(e) => setForm((f) => ({ ...f, prepayment: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Salon</Label>
              <Select value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value as TableZone, table_id: "" }))}>
                {ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Masa</Label>
              <Select value={form.table_id} onChange={(e) => setForm((f) => ({ ...f, table_id: e.target.value }))}>
                <option value="">Seçiniz</option>
                {tables.filter((t) => t.zone === form.zone).map((t) => (
                  <option key={t.id} value={t.id}>Masa {t.table_number}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Not</Label>
            <Textarea rows={2} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Vazgeç</Button>
            <Button type="submit" loading={saving}>Kaydet</Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
