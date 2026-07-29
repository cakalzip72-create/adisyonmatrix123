"use client";

import { useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock/data";
import { Category, Product } from "@/lib/types";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export default function EkstralarPage() {
  const { store } = useStore();
  const { data: categories } = useRealtimeCollection<Category>({ table: "categories", storeId: store.id, mock: MOCK_CATEGORIES });
  const { data: products, setData: setProducts } = useRealtimeCollection<Product>({ table: "products", storeId: store.id, mock: MOCK_PRODUCTS });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [saving, setSaving] = useState(false);

  const extraCategory = categories.find((c) => c.name === "Ekstralar");
  const extras = extraCategory ? products.filter((p) => p.category_id === extraCategory.id) : [];

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!extraCategory) return;
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await createClient()
          .from("products")
          .insert({ store_id: store.id, category_id: extraCategory.id, name, price: Number(price), is_available: true, track_stock: false })
          .select()
          .single();
        if (!error) setProducts((prev) => [...prev, data as Product]);
      } else {
        setProducts((prev) => [
          ...prev,
          { id: `ex-${Date.now()}`, store_id: store.id, category_id: extraCategory.id, name, description: null, price: Number(price), real_image_url: null, ai_image_url: null, variants: [], is_available: true, stock: null, track_stock: false, sold_count: 0 },
        ]);
      }
      setOpen(false);
      setName("");
      setPrice("0");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ekstrayı silmek istediğinize emin misiniz?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured) {
      await createClient().from("products").delete().eq("id", id);
    }
  }

  async function toggleStatus(p: Product) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_available: !x.is_available } : x)));
    if (isSupabaseConfigured) {
      await createClient().from("products").update({ is_available: !p.is_available }).eq("id", p.id);
    }
  }

  return (
    <DashboardShell
      title="Ekstralar"
      description="Ürünlere eklenebilecek ekstra malzeme ve seçenekleri yönetin."
      permission="urunler"
      actions={<Button onClick={() => setOpen(true)} disabled={!extraCategory}><Plus className="h-4 w-4" /> Yeni Ekstra Ekle</Button>}
    >
      {extras.length === 0 ? (
        <Card className="py-14 text-center text-sm text-slate-400">Henüz ekstra eklenmedi.</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">Ekstra Adı</th>
                <th className="px-5 py-3 font-medium">Ek Ücret</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {extras.map((ex) => (
                <tr key={ex.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    <span className="flex items-center gap-2"><Tags className="h-3.5 w-3.5 text-slate-300" /> {ex.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{ex.price > 0 ? formatCurrency(ex.price) : "Ücretsiz"}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleStatus(ex)}>
                      <Badge tone={ex.is_available ? "green" : "gray"} dot>{ex.is_available ? "Aktif" : "Pasif"}</Badge>
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(ex.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni Ekstra Ekle" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label>Ekstra Adı</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Ekstra Peynir" required />
          </div>
          <div>
            <Label>Ek Ücret (₺)</Label>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button type="submit" loading={saving}>Kaydet</Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
