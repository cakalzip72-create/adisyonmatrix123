"use client";

import { useMemo, useState } from "react";
import { Download, Plus, TrendingDown, TrendingUp, Wallet, Landmark, Clock3 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pills } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Input";
import { RevenueLineChart } from "@/components/ui/charts/RevenueLineChart";
import { DonutChart, DonutLegend } from "@/components/ui/charts/DonutChart";
import { MOCK_FINANCE } from "@/lib/mock/data";
import { CashRegisterName, FinanceTransaction, PaymentMethod } from "@/lib/types";
import { exportToExcel } from "@/lib/xlsx-export";
import { formatCurrency, formatTime } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const TABS = [
  { key: "genel", label: "Genel Bakış" },
  { key: "gelir", label: "Gelirler" },
  { key: "gider", label: "Giderler" },
];

const REGISTERS: CashRegisterName[] = ["Ana Kasa", "Bar Kasa", "Paket Servis Kasa"];
const PAYMENT_METHODS: PaymentMethod[] = ["nakit", "kredi_karti", "yemek_karti", "dijital_cuzdan", "diğer"];
const PAYMENT_COLORS: Record<string, string> = { nakit: "#3b82f6", kredi_karti: "#22c55e", yemek_karti: "#a855f7", dijital_cuzdan: "#f97316", diğer: "#94a3b8" };

export default function FinansPage() {
  const { store } = useStore();
  const { data: finance, setData: setFinance } = useRealtimeCollection<FinanceTransaction>({
    table: "finance_transactions",
    storeId: store.id,
    orderBy: { column: "created_at", ascending: false },
    mock: MOCK_FINANCE,
  });
  const [tab, setTab] = useState("genel");
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "gelir" as "gelir" | "gider", description: "", register: "Ana Kasa" as CashRegisterName, payment_method: "nakit" as PaymentMethod, amount: "" });

  const transactions = finance.filter((t) => (tab === "genel" ? true : t.type === tab));
  const totalIncome = finance.filter((t) => t.type === "gelir").reduce((s, t) => s + t.amount, 0);
  const totalExpense = finance.filter((t) => t.type === "gider").reduce((s, t) => s + t.amount, 0);

  const cashBalances = useMemo(() => {
    return REGISTERS.map((name) => {
      const balance = finance.reduce((s, t) => {
        if (t.register !== name) return s;
        return s + (t.type === "gelir" ? t.amount : -t.amount);
      }, 0);
      return { name, balance };
    });
  }, [finance]);

  const revenueDistribution = useMemo(() => {
    const total = totalIncome || 1;
    const colors = ["#2563eb", "#22c55e", "#a855f7", "#f97316"];
    const byRegister = REGISTERS.map((r, i) => ({
      name: r,
      value: Math.round((finance.filter((t) => t.type === "gelir" && t.register === r).reduce((s, t) => s + t.amount, 0) / total) * 100),
      color: colors[i % colors.length],
    })).filter((d) => d.value > 0);
    return byRegister.length ? byRegister : [{ name: "Veri yok", value: 100, color: "#e2e8f0" }];
  }, [finance, totalIncome]);

  const paymentDistribution = useMemo(() => {
    const total = finance.reduce((s, t) => s + t.amount, 0) || 1;
    return PAYMENT_METHODS.map((m) => ({
      name: m.replace("_", " "),
      value: Math.round((finance.filter((t) => t.payment_method === m).reduce((s, t) => s + t.amount, 0) / total) * 100),
      color: PAYMENT_COLORS[m],
    })).filter((d) => d.value > 0);
  }, [finance]);

  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const key = format(day, "yyyy-MM-dd");
      const ciro = finance.filter((t) => t.type === "gelir" && t.created_at.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { date: format(day, "d MMM", { locale: tr }), ciro };
    });
  }, [finance]);

  function handleExport() {
    exportToExcel("adisyonmatrix-finans", [
      { name: "İşlemler", rows: finance.map((t) => ({ Açıklama: t.description, Tür: t.type, Kasa: t.register, "Ödeme Yöntemi": t.payment_method, Tutar: t.amount })) },
    ]);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { store_id: store.id, type: form.type, description: form.description, register: form.register, payment_method: form.payment_method, amount: Number(form.amount), status: "tamamlandı" as const };
      if (isSupabaseConfigured) {
        const { data, error } = await createClient().from("finance_transactions").insert(payload).select().single();
        if (!error) setFinance((prev) => [data as FinanceTransaction, ...prev]);
      } else {
        setFinance((prev) => [{ id: `fin-${Date.now()}`, created_at: new Date().toISOString(), ...payload } as FinanceTransaction, ...prev]);
      }
      setAddOpen(false);
      setForm({ type: "gelir", description: "", register: "Ana Kasa", payment_method: "nakit", amount: "" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell
      title="Finans"
      description="Gelir, gider ve ödeme işlemlerinizi takip edin."
      permission="finans"
      actions={
        <>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4" /> Dışa Aktar</Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> İşlem Ekle</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <Card className="p-4">
          <span className="flex items-center gap-1.5 text-xs text-emerald-500"><TrendingUp className="h-3.5 w-3.5" /> Toplam Gelir</span>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(totalIncome)}</p>
        </Card>
        <Card className="p-4">
          <span className="flex items-center gap-1.5 text-xs text-red-500"><TrendingDown className="h-3.5 w-3.5" /> Toplam Gider</span>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(totalExpense)}</p>
        </Card>
        <Card className="p-4">
          <span className="flex items-center gap-1.5 text-xs text-blue-500"><Wallet className="h-3.5 w-3.5" /> Net Kâr</span>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(totalIncome - totalExpense)}</p>
        </Card>
        <Card className="p-4">
          <span className="flex items-center gap-1.5 text-xs text-orange-500"><Clock3 className="h-3.5 w-3.5" /> İşlem Sayısı</span>
          <p className="mt-1 text-xl font-semibold text-slate-900">{finance.length}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <Card className="mb-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Gelir Grafiği</p>
              <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-500">Son 7 Gün</span>
            </div>
            <RevenueLineChart data={trend} />
          </Card>

          <Pills tabs={TABS} active={tab} onChange={setTab} className="mb-4" />

          {transactions.length === 0 ? (
            <Card className="py-14 text-center text-sm text-slate-400">Bu filtrede işlem yok.</Card>
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="px-5 py-3 font-medium">Açıklama</th>
                    <th className="px-5 py-3 font-medium">Kasa</th>
                    <th className="px-5 py-3 font-medium">Ödeme Yöntemi</th>
                    <th className="px-5 py-3 font-medium">Tutar</th>
                    <th className="px-5 py-3 font-medium">Saat</th>
                    <th className="px-5 py-3 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{t.description}</td>
                      <td className="px-5 py-3.5 text-slate-500">{t.register}</td>
                      <td className="px-5 py-3.5 text-slate-500 capitalize">{t.payment_method.replace("_", " ")}</td>
                      <td className={`px-5 py-3.5 font-medium ${t.type === "gelir" ? "text-emerald-600" : "text-red-500"}`}>
                        {t.type === "gelir" ? "+" : "-"}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{formatTime(t.created_at)}</td>
                      <td className="px-5 py-3.5"><Badge tone="green" dot>Tamamlandı</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">Kasalara Göre Gelir Dağılımı</p>
            <div className="flex justify-center"><DonutChart data={revenueDistribution} centerLabel="Toplam" centerValue={formatCurrency(totalIncome)} /></div>
          </Card>
          <Card>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Landmark className="h-4 w-4" /> Kasa Bakiyeleri</p>
            <ul className="space-y-2.5">
              {cashBalances.map((c) => (
                <li key={c.name} className="flex justify-between text-sm">
                  <span className="text-slate-500">{c.name}</span>
                  <span className="font-medium text-slate-900">{formatCurrency(c.balance)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">Ödeme Yöntemleri</p>
            {paymentDistribution.length === 0 ? <p className="text-xs text-slate-400">Henüz veri yok.</p> : <DonutLegend data={paymentDistribution} />}
          </Card>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="İşlem Ekle" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label>Tür</Label>
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "gelir" | "gider" }))}>
              <option value="gelir">Gelir</option>
              <option value="gider">Gider</option>
            </Select>
          </div>
          <div>
            <Label>Açıklama</Label>
            <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          </div>
          <div>
            <Label>Tutar (₺)</Label>
            <Input type="number" min={0} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          </div>
          <div>
            <Label>Kasa</Label>
            <Select value={form.register} onChange={(e) => setForm((f) => ({ ...f, register: e.target.value as CashRegisterName }))}>
              {REGISTERS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Ödeme Yöntemi</Label>
            <Select value={form.payment_method} onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value as PaymentMethod }))}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.replace("_", " ")}</option>
              ))}
            </Select>
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
