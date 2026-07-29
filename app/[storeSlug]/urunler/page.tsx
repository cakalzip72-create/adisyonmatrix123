"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Box, CheckCircle2, MoreVertical, Package, Plus, Search, Upload } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { CategoryTreeSidebar } from "@/components/products/CategoryTreeSidebar";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock/data";
import { Category, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";

export default function UrunlerPage() {
  const { store } = useStore();
  const { data: products, setData: setProducts } = useRealtimeCollection<Product>({ table: "products", storeId: store.id, mock: MOCK_PRODUCTS });
  const { data: categories } = useRealtimeCollection<Category>({ table: "categories", storeId: store.id, orderBy: { column: "sort_order" }, mock: MOCK_CATEGORIES });
  const [categoryId, setCategoryId] = useState("Tümü");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryId !== "Tümü" && p.category_id !== categoryId) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products, categoryId, q]);

  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_available).length,
    inStock: products.filter((p) => (p.stock ?? 0) > 10).length,
    low: products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length,
  };

  function productCountFor(catId: string) {
    const childIds = categories.filter((c) => c.parent_id === catId).map((c) => c.id);
    return products.filter((p) => p.category_id === catId || childIds.includes(p.category_id)).length;
  }

  return (
    <DashboardShell
      title="Ürünler"
      description="Tüm ürünlerinizi kategorilere göre yönetebilir, fiyat ve stok bilgilerini düzenleyebilirsiniz."
      permission="urunler"
      actions={
        <>
          <Button variant="outline"><Upload className="h-4 w-4" /> Toplu İçe Aktar</Button>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Yeni Ürün Ekle</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatMini icon={Package} tone="blue" label="Toplam Ürün" value={stats.total} sub="Tüm ürünler" />
        <StatMini icon={CheckCircle2} tone="green" label="Aktif Ürün" value={stats.active} sub="Satışta olan" />
        <StatMini icon={Box} tone="orange" label="Stokta Olan" value={stats.inStock} sub="Stoku yeterli" />
        <StatMini icon={AlertTriangle} tone="red" label="Stokta Azalan" value={stats.low} sub="Kritik seviyede" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[15rem_1fr_280px]">
        <CategoryTreeSidebar categories={categories} activeId={categoryId} onSelect={setCategoryId} productCount={productCountFor} />

        <div>
          <Card className="mb-5 p-4">
            <Input icon={<Search className="h-4 w-4" />} placeholder="Ürün ara..." value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
          </Card>

          {filtered.length === 0 ? (
            <Card className="py-14 text-center text-sm text-slate-400">Bu kategoride ürün yok.</Card>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {filtered.map((p) => (
                <Card key={p.id} className="overflow-hidden p-0">
                  <div className="relative aspect-square w-full bg-slate-100">
                    {p.real_image_url && <Image src={p.real_image_url} alt={p.name} fill className="object-cover" />}
                    <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3.5">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="truncate text-xs text-slate-400">{categories.find((c) => c.id === p.category_id)?.name}</p>
                    <p className="mt-1.5 text-sm font-semibold text-blue-600">{formatCurrency(p.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge tone={p.is_available ? "green" : "gray"}>{p.is_available ? "Aktif" : "Pasif"}</Badge>
                      <span className="text-xs text-slate-400">Stok: {p.stock}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">Ürün Özeti</p>
            <ul className="space-y-2.5 text-sm">
              <li className="flex justify-between text-slate-500">Toplam Ürün <span className="font-medium text-slate-900">{stats.total}</span></li>
              <li className="flex justify-between text-slate-500">Aktif Ürün <span className="font-medium text-slate-900">{stats.active}</span></li>
              <li className="flex justify-between text-slate-500">Stokta Olan <span className="font-medium text-slate-900">{stats.inStock}</span></li>
              <li className="flex justify-between text-slate-500">Stokta Azalan <span className="font-medium text-red-500">{stats.low}</span></li>
            </ul>
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">En Çok Satan Ürünler</p>
            <ul className="space-y-3">
              {[...products].sort((a, b) => b.sold_count - a.sold_count).slice(0, 5).map((p, i) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><span className="text-xs text-slate-400">{i + 1}</span> {p.name}</span>
                  <span className="font-medium text-slate-900">{p.sold_count}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <ProductFormModal
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
        onSave={(p) => setProducts((prev) => [p, ...prev])}
      />
    </DashboardShell>
  );
}

function StatMini({ icon: Icon, tone, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; tone: "blue" | "green" | "orange" | "red"; label: string; value: number; sub: string }) {
  const toneMap = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", orange: "bg-orange-50 text-orange-600", red: "bg-red-50 text-red-600" };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </Card>
  );
}
