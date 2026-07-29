"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Percent, Receipt, TrendingUp, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { RevenueLineChart } from "@/components/ui/charts/RevenueLineChart";
import { DonutChart, DonutLegend } from "@/components/ui/charts/DonutChart";
import { MOCK_CATEGORIES, MOCK_FINANCE, MOCK_PRODUCTS } from "@/lib/mock/data";
import { exportToExcel } from "@/lib/xlsx-export";
import { formatCurrency } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import { Category, FinanceTransaction, Product } from "@/lib/types";

const TABS = [
  { key: "ozet", label: "Özet Rapor" },
  { key: "satis", label: "Satış Raporları" },
  { key: "urun", label: "Ürün Raporları" },
  { key: "finansal", label: "Finansal Raporlar" },
  { key: "personel", label: "Personel Raporları" },
];

const QUICK_REPORTS = ["Günlük Ciro Raporu", "Aylık Ciro Raporu", "Ürün Satış Raporu", "Personel Performans Raporu", "KDV Raporu", "Ödeme Türü Raporu"];
const CATEGORY_COLORS = ["#2563eb", "#22c55e", "#a855f7", "#f97316", "#ef4444", "#06b6d4"];
const PAYMENT_COLORS: Record<string, string> = { nakit: "#3b82f6", kredi_karti: "#22c55e", yemek_karti: "#a855f7", dijital_cuzdan: "#f97316", diğer: "#94a3b8" };

export default function RaporlarPage() {
  const { store } = useStore();
  const { data: finance } = useRealtimeCollection<FinanceTransaction>({ table: "finance_transactions", storeId: store.id, mock: MOCK_FINANCE });
  const { data: products } = useRealtimeCollection<Product>({ table: "products", storeId: store.id, mock: MOCK_PRODUCTS });
  const { data: categories } = useRealtimeCollection<Category>({ table: "categories", storeId: store.id, mock: MOCK_CATEGORIES });
  const { orders } = useRealtimeOrders(store.id);
  const [tab, setTab] = useState("ozet");

  const totalRevenue = finance.filter((t) => t.type === "gelir").reduce((s, t) => s + t.amount, 0);
  const avgOrderValue = orders.length ? orders.reduce((s, o) => s + o.total_amount, 0) / orders.length : 0;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const cancelRate = orders.length ? Math.round((cancelledCount / orders.length) * 1000) / 10 : 0;

  const soldMap = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    orders.forEach((o) =>
      o.items.forEach((it) => {
        const key = it.product_id ?? it.product_name;
        const prev = map.get(key) ?? { name: it.product_name, qty: 0, revenue: 0 };
        map.set(key, { name: it.product_name, qty: prev.qty + it.quantity, revenue: prev.revenue + it.quantity * it.unit_price });
      })
    );
    return map;
  }, [orders]);
  const topProducts = [...soldMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const categoryDistribution = useMemo(() => {
    const totals = new Map<string, number>();
    orders.forEach((o) =>
      o.items.forEach((it) => {
        const product = products.find((p) => p.id === it.product_id);
        const category = categories.find((c) => c.id === product?.category_id);
        const name = category?.name ?? "Diğer";
        totals.set(name, (totals.get(name) ?? 0) + it.quantity * it.unit_price);
      })
    );
    const sum = [...totals.values()].reduce((s, v) => s + v, 0) || 1;
    return [...totals.entries()]
      .map(([name, value], i) => ({ name, value: Math.round((value / sum) * 100), color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [orders, products, categories]);

  const paymentDistribution = useMemo(() => {
    const total = finance.reduce((s, t) => s + t.amount, 0) || 1;
    return Array.from(new Set(finance.map((t) => t.payment_method))).map((m) => ({
      name: m.replace("_", " "),
      value: Math.round((finance.filter((t) => t.payment_method === m).reduce((s, t) => s + t.amount, 0) / total) * 100),
      color: PAYMENT_COLORS[m] ?? "#94a3b8",
    }));
  }, [finance]);

  const trend = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(new Date(), 13 - i);
      const key = format(day, "yyyy-MM-dd");
      const ciro = finance.filter((t) => t.type === "gelir" && t.created_at.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { date: format(day, "d MMM", { locale: tr }), ciro };
    });
  }, [finance]);

  function handleExport() {
    exportToExcel("adisyonmatrix-rapor", [
      {
        name: "Özet",
        rows: [
          { Metrik: "Toplam Ciro", Değer: totalRevenue },
          { Metrik: "Toplam İşlem", Değer: orders.length },
          { Metrik: "Ortalama Hesap Tutarı", Değer: Math.round(avgOrderValue) },
        ],
      },
      { name: "En Çok Satanlar", rows: topProducts.map((p) => ({ Ürün: p.name, "Satış Adedi": p.qty, Ciro: p.revenue })) },
      { name: "Finansal İşlemler", rows: finance.map((t) => ({ Açıklama: t.description, Tür: t.type, Kasa: t.register, "Ödeme Yöntemi": t.payment_method, Tutar: t.amount })) },
    ]);
  }

  return (
    <DashboardShell
      title="Raporlar"
      description="İşletmenizin performansını analiz edin, detaylı raporlarla büyümenizi yönetin."
      permission="raporlar"
      actions={<Button onClick={handleExport}><Download className="h-4 w-4" /> Dışa Aktar</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="p-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><TrendingUp className="h-3.5 w-3.5" /> Toplam Ciro</span>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><Receipt className="h-3.5 w-3.5" /> Toplam İşlem</span>
          <p className="mt-1 text-xl font-semibold text-slate-900">{orders.length}</p>
        </Card>
        <Card className="p-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><Wallet className="h-3.5 w-3.5" /> Ortalama Hesap Tutarı</span>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(avgOrderValue)}</p>
        </Card>
        <Card className="p-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><Percent className="h-3.5 w-3.5" /> İptal Oranı</span>
          <p className="mt-1 text-xl font-semibold text-slate-900">%{cancelRate}</p>
        </Card>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Günlük Ciro Grafiği</p>
              <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-500">Son 14 Gün</span>
            </div>
            <RevenueLineChart data={trend} />
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <p className="mb-3 text-sm font-semibold text-slate-900">Kategoriye Göre Ciro Dağılımı</p>
              {categoryDistribution.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Henüz sipariş verisi yok.</p>
              ) : (
                <div className="flex justify-center"><DonutChart data={categoryDistribution} centerLabel="Toplam" centerValue={formatCurrency(totalRevenue)} /></div>
              )}
            </Card>
            <Card>
              <p className="mb-3 text-sm font-semibold text-slate-900">Ödeme Türü Dağılımı</p>
              {paymentDistribution.length === 0 ? <p className="py-8 text-center text-xs text-slate-400">Henüz veri yok.</p> : <DonutLegend data={paymentDistribution} />}
            </Card>
          </div>

          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">En Çok Satan Ürünler</p>
            {topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Henüz sipariş verisi yok.</p>
            ) : (
              <ul className="space-y-3">
                {topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600"><span className="text-xs text-slate-400">{i + 1}</span> {p.name}</span>
                    <span className="flex items-center gap-4">
                      <span className="text-slate-400">{p.qty} adet</span>
                      <span className="font-medium text-slate-900">{formatCurrency(p.revenue)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">Hızlı Rapor İşlemleri</p>
            <ul className="space-y-1">
              {QUICK_REPORTS.map((r) => (
                <li key={r}>
                  <button onClick={handleExport} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-600 hover:bg-slate-50">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" /> {r}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-blue-50/60">
            <p className="text-xs text-blue-700">Raporlar gerçek zamanlı olarak güncellenir.</p>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
