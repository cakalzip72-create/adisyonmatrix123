"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart, Wallet, Clock3, CheckCircle2, Grid2x2, UserPlus, PackagePlus, FileBarChart, Megaphone, Play,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RevenueLineChart } from "@/components/ui/charts/RevenueLineChart";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store-context";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { MOCK_FINANCE, MOCK_PRODUCTS } from "@/lib/mock/data";
import { FinanceTransaction, Product } from "@/lib/types";
import { formatCurrency, formatTime } from "@/lib/utils";
import { format, isToday, subDays } from "date-fns";
import { tr } from "date-fns/locale";

const QUICK_ACTIONS = [
  { icon: ShoppingCart, label: "Yeni Sipariş", href: "siparisler/yeni" },
  { icon: Grid2x2, label: "Masa Ekle", href: "masalar" },
  { icon: PackagePlus, label: "Ürün Ekle", href: "urunler" },
  { icon: UserPlus, label: "Müşteri Ekle", href: "musteriler" },
  { icon: FileBarChart, label: "Rapor Oluştur", href: "raporlar" },
  { icon: Megaphone, label: "Kampanya Başlat", href: "ayarlar" },
];

export default function DashboardPage() {
  const { store } = useStore();
  const { orders } = useRealtimeOrders(store.id);
  const { data: finance } = useRealtimeCollection<FinanceTransaction>({ table: "finance_transactions", storeId: store.id, mock: MOCK_FINANCE });
  const { data: products } = useRealtimeCollection<Product>({ table: "products", storeId: store.id, mock: MOCK_PRODUCTS });

  const todayOrders = orders.filter((o) => isToday(new Date(o.created_at)));
  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const todayRevenue = finance.filter((t) => t.type === "gelir" && isToday(new Date(t.created_at))).reduce((s, t) => s + t.amount, 0);
  const yesterdayRevenue = finance
    .filter((t) => t.type === "gelir" && format(new Date(t.created_at), "yyyy-MM-dd") === format(subDays(new Date(), 1), "yyyy-MM-dd"))
    .reduce((s, t) => s + t.amount, 0);
  const revenueChangePct = yesterdayRevenue > 0 ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 1000) / 10 : 0;

  const completedCount = orders.filter((o) => o.status === "completed").length;
  const completionRate = orders.length > 0 ? Math.round((completedCount / orders.length) * 1000) / 10 : 0;

  const soldCounts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => o.items.forEach((it) => map.set(it.product_id ?? it.product_name, (map.get(it.product_id ?? it.product_name) ?? 0) + it.quantity)));
    return map;
  }, [orders]);
  const topProduct = [...products].sort((a, b) => (soldCounts.get(b.id) ?? b.sold_count) - (soldCounts.get(a.id) ?? a.sold_count))[0];

  const peakHour = useMemo(() => {
    const counts = new Array(24).fill(0);
    orders.forEach((o) => counts[new Date(o.created_at).getHours()] += 1);
    const max = counts.indexOf(Math.max(...counts));
    return orders.length ? `${String(max).padStart(2, "0")}:00 – ${String((max + 1) % 24).padStart(2, "0")}:00` : "—";
  }, [orders]);

  const avgOrder = orders.length ? orders.reduce((s, o) => s + o.total_amount, 0) / orders.length : 0;

  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const key = format(day, "yyyy-MM-dd");
      const ciro = finance.filter((t) => t.type === "gelir" && t.created_at.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { date: format(day, "d MMM", { locale: tr }), ciro };
    });
  }, [finance]);

  const activity = useMemo(() => {
    const orderEvents = orders.slice(0, 3).map((o) => ({
      icon: ShoppingCart,
      text: `Masa ${o.table_number} için sipariş ${o.status === "completed" ? "tamamlandı" : "verildi"}.`,
      time: formatTime(o.created_at),
      at: o.created_at,
    }));
    const financeEvents = finance.slice(0, 2).map((t) => ({
      icon: Wallet,
      text: `${t.description} — ${t.type === "gelir" ? "+" : "-"}${formatCurrency(t.amount)}`,
      time: formatTime(t.created_at),
      at: t.created_at,
    }));
    return [...orderEvents, ...financeEvents].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 5);
  }, [orders, finance]);

  return (
    <DashboardShell title={`Merhaba, ${store.name}! 👋`} description="Bugün işletmenizde olanları burada özetledik." permission="dashboard">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={ShoppingCart} iconTone="blue" label="Bugünkü İşlem Sayısı" value={String(todayOrders.length)} />
            <StatCard icon={Wallet} iconTone="green" label="Bugünkü Ciro" value={formatCurrency(todayRevenue)} changePct={revenueChangePct} changeLabel="dünkü güne göre" />
            <StatCard icon={Clock3} iconTone="orange" label="Aktif Bekleyen Talepler" value={String(activeOrders.length)} />
            <StatCard icon={CheckCircle2} iconTone="purple" label="Tamamlanma Oranı" value={`%${completionRate}`} changeLabel={`${completedCount}/${orders.length} sipariş`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ciro / Gelir Trendi</CardTitle>
              <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-500">Son 7 Gün</span>
            </CardHeader>
            <RevenueLineChart data={trend} />
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs text-slate-400">En Çok Satan Ürün</p>
              {topProduct ? (
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={topProduct.name} size={38} src={topProduct.real_image_url} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{topProduct.name}</p>
                    <p className="text-xs text-slate-400">{soldCounts.get(topProduct.id) ?? topProduct.sold_count} Adet Satıldı</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Henüz veri yok.</p>
              )}
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-400">Yoğun Saatler</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{peakHour}</p>
              <p className="text-xs text-slate-400">En yoğun saat aralığı</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-400">Ortalama Hesap</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(avgOrder)}</p>
              <p className="text-xs text-slate-400">Ortalama sipariş tutarı</p>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4">Hızlı İşlemler</CardTitle>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.label}
                  href={`/${store.slug}/${a.href}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 py-4 text-center text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <a.icon className="h-4.5 w-4.5" />
                  {a.label}
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <Link href={`/${store.slug}/siparisler`} className="text-xs font-medium text-blue-600">Tümü</Link>
            </CardHeader>
            {activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Henüz aktivite yok.</p>
            ) : (
              <ul className="space-y-4">
                {activity.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <item.icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm text-slate-700">{item.text}</p>
                      <p className="text-xs text-slate-400">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <p className="text-sm font-semibold">AdisyonMatrix&apos;i Keşfedin! 🚀</p>
            <p className="mt-1 text-xs text-slate-300">İpuçları ve eğitimlerle sistemi daha verimli kullanın.</p>
            <button className="mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <Play className="h-4 w-4" />
            </button>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
