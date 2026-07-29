"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, FileText, Receipt, Minus, Plus, Search, StickyNote, Users, UserCog, Clock3, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pills } from "@/components/ui/Tabs";
import Image from "next/image";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_TABLES } from "@/lib/mock/data";
import { Category, Product, RestaurantTable } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

interface CartLine {
  product: Product;
  qty: number;
}

function NewOrderContent() {
  const params = useSearchParams();
  const tableId = params.get("table");
  const { store, currentStaff } = useStore();

  const { data: tables, setData: setTables } = useRealtimeCollection<RestaurantTable>({ table: "tables", storeId: store.id, mock: MOCK_TABLES });
  const { data: categories } = useRealtimeCollection<Category>({ table: "categories", storeId: store.id, mock: MOCK_CATEGORIES });
  const { data: products } = useRealtimeCollection<Product>({ table: "products", storeId: store.id, mock: MOCK_PRODUCTS });
  const { orders, refetch: refetchOrders } = useRealtimeOrders(store.id);

  const table = tables.find((t) => t.id === tableId) ?? tables.find((t) => t.status === "dolu") ?? tables[0];

  const [category, setCategory] = useState<string>("Tümü");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [billed, setBilled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (category !== "Tümü" && p.category_id !== category) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, category, search]);

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === p.id);
      if (existing) return prev.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { product: p, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.product.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }

  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = Math.round(subtotal * 0.05);
  const tax = Math.round((subtotal - discount) * 0.1);
  const total = subtotal - discount + tax;

  const tableOpenOrders = table ? orders.filter((o) => o.table_id === table.id && !["completed", "cancelled"].includes(o.status)) : [];
  const tableBillTotal = tableOpenOrders.reduce((s, o) => s + o.total_amount, 0) + (cart.length ? 0 : 0);

  async function sendOrder() {
    if (!table || cart.length === 0) return;
    setSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { data: order, error } = await supabase
          .from("orders")
          .insert({
            store_id: store.id,
            table_id: table.id,
            waiter_id: currentStaff.id.startsWith("staff-unknown") ? null : currentStaff.id,
            status: "pending",
            subtotal,
            discount,
            tax,
            total_amount: total,
            note: note || null,
          })
          .select()
          .single();
        if (error) throw error;

        const items = cart.map((l) => ({
          order_id: order.id,
          product_id: l.product.id,
          product_name: l.product.name,
          quantity: l.qty,
          unit_price: l.product.price,
        }));
        const { error: itemsErr } = await supabase.from("order_items").insert(items);
        if (itemsErr) throw itemsErr;

        if (table.status !== "dolu") {
          await supabase
            .from("tables")
            .update({ status: "dolu", opened_at: table.opened_at ?? new Date().toISOString(), waiter_id: currentStaff.id.startsWith("staff-unknown") ? null : currentStaff.id })
            .eq("id", table.id);
          setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: "dolu", opened_at: t.opened_at ?? new Date().toISOString() } : t)));
        }
        refetchOrders();
      }
      setCart([]);
      setNote("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  async function requestBill() {
    if (!table) return;
    setSubmitting(true);
    try {
      if (isSupabaseConfigured && tableOpenOrders.length > 0) {
        const supabase = createClient();
        const total = tableOpenOrders.reduce((s, o) => s + o.total_amount, 0);
        await supabase.from("orders").update({ status: "completed" }).in("id", tableOpenOrders.map((o) => o.id));
        await supabase.from("finance_transactions").insert({
          store_id: store.id,
          type: "gelir",
          description: `Masa ${table.table_number} - Adisyon`,
          register: "Ana Kasa",
          payment_method: "nakit",
          amount: total,
          status: "tamamlandı",
        });
        await supabase.from("tables").update({ status: "temizlikte", opened_at: null, waiter_id: null }).eq("id", table.id);
        setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: "temizlikte", opened_at: null } : t)));
        refetchOrders();
      }
      setBilled(true);
      setTimeout(() => setBilled(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  if (!table) {
    return (
      <DashboardShell title="Sipariş Ver" description="Siparişler > Yeni Sipariş" permission="siparisler">
        <p className="py-10 text-center text-sm text-slate-400">Önce Masa Planı&apos;ndan bir masa ekleyin.</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Sipariş Ver" description={`Siparişler > Yeni Sipariş`} permission="siparisler">
      <Card className="mb-5 flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">Masa {table.table_number}</p>
          <span className="flex items-center gap-1 text-xs font-medium text-orange-600">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> {table.status === "dolu" ? "Dolu" : "Boş"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500"><Users className="h-4 w-4" /> {table.capacity} Kişi</span>
          <span className="flex items-center gap-1.5 text-slate-500"><UserCog className="h-4 w-4" /> {currentStaff.full_name}</span>
          <span className="flex items-center gap-1.5 text-slate-500"><Clock3 className="h-4 w-4" /> Açılış {table.opened_at ? new Date(table.opened_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Input icon={<Search className="h-4 w-4" />} placeholder="Ürün ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4" />
          <Pills
            className="mb-5"
            tabs={[{ key: "Tümü", label: "Tümü" }, ...categories.filter((c) => c.status === "aktif" && !c.parent_id).map((c) => ({ key: c.id, label: c.name }))]}
            active={category}
            onChange={setCategory}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={!p.is_available}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
                  !p.is_available && "opacity-50"
                )}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                  {p.real_image_url && <Image src={p.real_image_url} alt={p.name} fill className="object-cover" />}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600">{formatCurrency(p.price)}</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Card className="h-fit p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-slate-900">Sipariş Özeti</p>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs font-medium text-red-500">Temizle</button>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Henüz ürün eklenmedi.</p>
          ) : (
            <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {cart.map((l) => (
                <li key={l.product.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200">
                    <button onClick={() => changeQty(l.product.id, -1)} className="flex h-7 w-7 items-center justify-center text-slate-500"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-5 text-center text-sm font-medium">{l.qty}</span>
                    <button onClick={() => changeQty(l.product.id, 1)} className="flex h-7 w-7 items-center justify-center text-slate-500"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <span className="flex-1 truncate text-sm text-slate-700">{l.product.name}</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(l.product.price * l.qty)}</span>
                  <button onClick={() => setCart((prev) => prev.filter((x) => x.product.id !== l.product.id))} className="text-slate-300 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">
            <StickyNote className="h-3.5 w-3.5" />
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Not Ekle" className="flex-1 bg-transparent outline-none" />
          </div>

          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-500"><span>Ara Toplam</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-emerald-600"><span>İndirim (%5)</span><span>-{formatCurrency(discount)}</span></div>
            <div className="flex justify-between text-slate-500"><span>KDV (%10)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900"><span>Toplam</span><span>{formatCurrency(total)}</span></div>
          </div>

          <div className="mt-5 space-y-2">
            <Button className="w-full" disabled={cart.length === 0} loading={submitting} onClick={sendOrder}>
              <Send className="h-4 w-4" /> Siparişi Gönder
            </Button>
            <Button variant="outline" className="w-full" disabled={cart.length === 0} loading={submitting} onClick={sendOrder}>
              <FileText className="h-4 w-4" /> Adisyona Ekle
            </Button>
            <Button variant="success" className="w-full" disabled={tableOpenOrders.length === 0} loading={submitting} onClick={requestBill}>
              <Receipt className="h-4 w-4" /> Hesap İste {tableOpenOrders.length > 0 && `(${formatCurrency(tableBillTotal)})`}
            </Button>
          </div>
          {sent && <p className="mt-3 text-center text-xs font-medium text-emerald-600">Sipariş mutfağa iletildi ✓</p>}
          {billed && <p className="mt-3 text-center text-xs font-medium text-emerald-600">Hesap kapatıldı, masa temizleniyor ✓</p>}
        </Card>
      </div>
    </DashboardShell>
  );
}

export default function NewOrderPage() {
  // useSearchParams sunucuda çözülemediği için bu alt ağaç yalnızca istemcide render edilir;
  // fallback verilmezse sunucu HTML'i ile istemci ağacı çakışıp sayfa iki kez basılıyor.
  return (
    <Suspense fallback={<NewOrderSkeleton />}>
      <NewOrderContent />
    </Suspense>
  );
}

function NewOrderSkeleton() {
  return (
    <DashboardShell title="Sipariş Ver" description="Siparişler > Yeni Sipariş" permission="siparisler">
      <Card className="mb-5 h-20 animate-pulse bg-slate-100" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-56 animate-pulse bg-slate-100 p-0" />
          ))}
        </div>
        <Card className="h-96 animate-pulse bg-slate-100" />
      </div>
    </DashboardShell>
  );
}
