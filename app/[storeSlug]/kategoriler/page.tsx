"use client";

import { useState } from "react";
import { CornerDownRight, GripVertical, Info, Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DonutChart } from "@/components/ui/charts/DonutChart";
import { CategoryFormModal } from "@/components/products/CategoryFormModal";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock/data";
import { Category, Product } from "@/lib/types";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const COLORS = ["#2563eb", "#22c55e", "#a855f7", "#f97316", "#ef4444", "#06b6d4", "#eab308", "#ec4899", "#14b8a6", "#6366f1", "#84cc16", "#f43f5e"];

export default function KategorilerPage() {
  const { store } = useStore();
  const { data: categories, setData: setCategories } = useRealtimeCollection<Category>({
    table: "categories",
    storeId: store.id,
    orderBy: { column: "sort_order" },
    mock: MOCK_CATEGORIES,
  });
  const { data: products } = useRealtimeCollection<Product>({ table: "products", storeId: store.id, mock: MOCK_PRODUCTS });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  function countFor(catId: string) {
    return products.filter((p) => p.category_id === catId).length;
  }

  const roots = categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id).sort((a, b) => a.sort_order - b.sort_order);
  const displayOrder = roots.flatMap((r) => [r, ...childrenOf(r.id)]);

  const donutData = roots.map((c, i) => ({ name: c.name, value: countFor(c.id), color: COLORS[i % COLORS.length] }));
  const mostProducts = [...categories].sort((a, b) => countFor(b.id) - countFor(a.id)).slice(0, 3);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(c: Category) {
    setEditing(c);
    setModalOpen(true);
  }

  function handleSave(category: Category, isNew: boolean) {
    setCategories((prev) => (isNew ? [...prev, category] : prev.map((c) => (c.id === category.id ? category : c))));
  }

  async function handleDelete(c: Category) {
    if (!confirm(`"${c.name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    setCategories((prev) => prev.filter((x) => x.id !== c.id && x.parent_id !== c.id));
    if (isSupabaseConfigured) {
      await createClient().from("categories").delete().eq("id", c.id);
    }
  }

  return (
    <DashboardShell
      title="Kategoriler"
      description="Ürünlerinizi düzenlemek için kategorileri ve alt kategorileri oluşturun, yönetin."
      permission="urunler"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Yeni Kategori Ekle</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-400">Toplam Kategori</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{categories.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">Aktif Kategori</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{categories.filter((c) => c.status === "aktif").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">Toplam Ürün</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{products.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">Alt Kategori</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{categories.filter((c) => c.parent_id).length}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">Kategori Adı</th>
                <th className="px-5 py-3 font-medium">Açıklama</th>
                <th className="px-5 py-3 font-medium">Ürün Sayısı</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {displayOrder.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2 font-medium text-slate-900">
                      {c.parent_id ? (
                        <CornerDownRight className="ml-4 h-3.5 w-3.5 text-slate-300" />
                      ) : (
                        <GripVertical className="h-3.5 w-3.5 text-slate-300" />
                      )}
                      {c.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{c.description}</td>
                  <td className="px-5 py-3.5 text-slate-600">{countFor(c.id)} ürün</td>
                  <td className="px-5 py-3.5"><Badge tone={c.status === "aktif" ? "green" : "gray"} dot>{c.status === "aktif" ? "Aktif" : "Pasif"}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-5">
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">Kategori Özeti</p>
            <div className="flex justify-center">
              <DonutChart data={donutData} centerLabel="Toplam Ürün" centerValue={String(products.length)} />
            </div>
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-900">En Çok Ürüne Sahip Kategoriler</p>
            <ul className="space-y-2.5">
              {mostProducts.map((c, i) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><span className="text-xs text-slate-400">{i + 1}</span> {c.name}</span>
                  <span className="font-medium text-slate-900">{countFor(c.id)} ürün</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-blue-50/60">
            <p className="flex items-center gap-2 text-sm font-medium text-blue-800"><Info className="h-4 w-4" /> Kategori Yönetimi Hakkında</p>
            <p className="mt-1.5 text-xs text-blue-700">Bir kategoriye üst kategori atayarak alt kategori oluşturabilirsiniz.</p>
          </Card>
        </div>
      </div>

      <CategoryFormModal key={editing?.id ?? "new"} open={modalOpen} onClose={() => setModalOpen(false)} categories={categories} editing={editing} onSave={handleSave} />
    </DashboardShell>
  );
}
