"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Check, Minus, Plus, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pills } from "@/components/ui/Tabs";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_TABLES, MOCK_STORE } from "@/lib/mock/data";
import { CANCELLATION_REASONS, Category, Product, RestaurantTable, Store } from "@/lib/types";
import { cn, formatCurrency, getErrorMessage } from "@/lib/utils";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

interface CartLine {
  product: Product;
  qty: number;
  variants: Record<string, string>;
}

export default function CustomerMenuPage({ params }: { params: Promise<{ storeSlug: string; tableId: string }> }) {
  const { storeSlug, tableId } = use(params);

  const [store, setStore] = useState<Store | null>(isSupabaseConfigured ? null : MOCK_STORE);
  const [table, setTable] = useState<RestaurantTable | null>(isSupabaseConfigured ? null : MOCK_TABLES[0]);
  const [categories, setCategories] = useState<Category[]>(isSupabaseConfigured ? [] : MOCK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(isSupabaseConfigured ? [] : MOCK_PRODUCTS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [category, setCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [orderSent, setOrderSent] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState(false);
  const [errorSent, setErrorSent] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const { data: storeRow, error: storeErr } = await supabase.from("stores").select("*").eq("slug", storeSlug).maybeSingle();
      if (cancelled) return;
      if (storeErr || !storeRow) {
        setLoadError("Bu menü bulunamadı. QR kodu tekrar okutun veya personelden yardım isteyin.");
        setLoading(false);
        return;
      }
      setStore(storeRow as Store);

      const [{ data: tableRow }, { data: catRows }, { data: prodRows }] = await Promise.all([
        supabase.from("tables").select("*").eq("id", tableId).maybeSingle(),
        supabase.from("categories").select("*").eq("store_id", storeRow.id).order("sort_order"),
        supabase.from("products").select("*").eq("store_id", storeRow.id),
      ]);
      if (cancelled) return;
      setTable((tableRow as RestaurantTable) ?? null);
      setCategories((catRows as Category[]) ?? []);
      setProducts((prodRows as Product[]) ?? []);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`menu-${storeSlug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [storeSlug, tableId]);

  const filteredProducts = useMemo(() => {
    const childIds = categories.filter((c) => c.parent_id === category).map((c) => c.id);
    return products.filter((p) => {
      if (!p.is_available) return false;
      if (category !== "Tümü" && p.category_id !== category && !childIds.includes(p.category_id)) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, categories, category, search]);

  function addToCart(product: Product, variants: Record<string, string> = {}) {
    setCart((prev) => {
      const key = JSON.stringify(variants);
      const existing = prev.find((l) => l.product.id === product.id && JSON.stringify(l.variants) === key);
      if (existing) return prev.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { product, qty: 1, variants }];
    });
  }

  function handleProductClick(p: Product) {
    if ((p.variants?.length ?? 0) > 0) setVariantProduct(p);
    else addToCart(p);
  }

  function changeQty(idx: number, delta: number) {
    setCart((prev) => prev.map((l, i) => (i === idx ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0));
  }

  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const itemCount = cart.reduce((s, l) => s + l.qty, 0);

  async function submitOrder() {
    if (!store || !table || cart.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const discount = 0;
        const tax = Math.round(subtotal * 0.1);
        const { data: order, error } = await supabase
          .from("orders")
          .insert({
            store_id: store.id,
            table_id: table.id,
            status: "pending",
            subtotal,
            discount,
            tax,
            total_amount: subtotal + tax,
          })
          .select()
          .single();
        if (error) throw error;

        const { error: itemsErr } = await supabase.from("order_items").insert(
          cart.map((l) => ({
            order_id: order.id,
            product_id: l.product.id,
            product_name: l.product.name,
            quantity: l.qty,
            unit_price: l.product.price,
            selected_variants: l.variants,
          }))
        );
        if (itemsErr) throw itemsErr;

        setPlacedOrderId(order.id);
        await supabase.from("tables").update({ status: "dolu", opened_at: table.opened_at ?? new Date().toISOString() }).eq("id", table.id);
      }
      setOrderSent(true);
      setCart([]);
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Sipariş gönderilirken bir hata oluştu."));
    } finally {
      setSubmitting(false);
    }
  }

  async function reportError(reason: string) {
    setErrorSent(reason);
    if (isSupabaseConfigured && store && placedOrderId) {
      await createClient().from("order_error_reports").insert({ order_id: placedOrderId, store_id: store.id, reason });
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">Menü yükleniyor...</div>;
  }

  if (loadError || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertCircle className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-500">{loadError ?? "Menü bulunamadı."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div>
            <Logo size={24} />
            <p className="mt-0.5 text-xs text-slate-400">{store.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {table && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Masa {table.table_number}</span>}
            <Link href="/login" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500">
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-lg px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Menüde ara..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div className="mx-auto max-w-lg overflow-x-auto px-4 pb-3">
          <Pills
            tabs={[{ key: "Tümü", label: "Tümü" }, ...categories.filter((c) => c.status === "aktif" && !c.parent_id).map((c) => ({ key: c.id, label: c.name }))]}
            active={category}
            onChange={setCategory}
          />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {filteredProducts.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">Bu kategoride ürün bulunamadı.</p>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProductClick(p)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm active:scale-[0.99]"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {p.real_image_url && <Image src={p.real_image_url} alt={p.name} fill className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="line-clamp-1 text-xs text-slate-400">{p.description}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-600">{formatCurrency(p.price)}</p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        )}
      </main>

      {itemCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-0 bottom-4 z-30 mx-auto flex max-w-lg items-center justify-between rounded-2xl bg-blue-600 px-5 py-4 text-white shadow-xl"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag className="h-4 w-4" /> {itemCount} Ürün
          </span>
          <span className="text-sm font-semibold">Sepeti Görüntüle · {formatCurrency(subtotal)}</span>
        </button>
      )}

      <Modal open={cartOpen} onClose={() => setCartOpen(false)} title={orderSent ? undefined : "Sepetim"} size="sm">
        {orderSent ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-7 w-7" /></span>
            <p className="mt-3 font-semibold text-slate-900">Siparişiniz Alındı!</p>
            <p className="mt-1 text-sm text-slate-500">{table ? `Masa ${table.table_number}` : "Masanız"} için siparişiniz mutfağa iletildi.</p>
            <Button variant="outline" className="mt-5 w-full" onClick={() => setErrorModal(true)}>
              <AlertCircle className="h-4 w-4" /> Siparişte Hata Bildir
            </Button>
            <Button className="mt-2 w-full" onClick={() => { setCartOpen(false); setOrderSent(false); }}>Menüye Dön</Button>
          </div>
        ) : (
          <div>
            {cart.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Sepetiniz boş.</p>
            ) : (
              <ul className="max-h-80 space-y-3 overflow-y-auto">
                {cart.map((l, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200">
                      <button onClick={() => changeQty(i, -1)} className="flex h-7 w-7 items-center justify-center text-slate-500"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-5 text-center text-sm font-medium">{l.qty}</span>
                      <button onClick={() => changeQty(i, 1)} className="flex h-7 w-7 items-center justify-center text-slate-500"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{l.product.name}</p>
                      {Object.values(l.variants).length > 0 && (
                        <p className="text-xs text-slate-400">{Object.values(l.variants).join(", ")}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(l.product.price * l.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-base font-semibold text-slate-900">
              <span>Toplam</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {submitError && <p className="mt-3 text-center text-xs text-red-600">{submitError}</p>}
            {!table && <p className="mt-3 text-center text-xs text-amber-600">Masa bilgisi okunamadı, lütfen QR kodu tekrar okutun.</p>}
            <Button className="mt-4 w-full" disabled={cart.length === 0 || !table} loading={submitting} onClick={submitOrder}>
              Siparişi Gönder
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={!!variantProduct} onClose={() => setVariantProduct(null)} title={variantProduct?.name} size="sm">
        {variantProduct && (
          <VariantPicker
            product={variantProduct}
            onConfirm={(variants) => {
              addToCart(variantProduct, variants);
              setVariantProduct(null);
            }}
          />
        )}
      </Modal>

      <Modal open={errorModal} onClose={() => setErrorModal(false)} title="Hata Bildir" description="Siparişinizle ilgili yaşadığınız sorunu seçin.">
        {errorSent ? (
          <p className="py-6 text-center text-sm text-emerald-600">Bildiriminiz alındı, ekibimiz en kısa sürede ilgilenecek.</p>
        ) : (
          <div className="grid gap-2">
            {CANCELLATION_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => reportError(r)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:border-red-300 hover:bg-red-50"
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

function VariantPicker({ product, onConfirm }: { product: Product; onConfirm: (v: Record<string, string>) => void }) {
  const [choices, setChoices] = useState<Record<string, string>>(
    Object.fromEntries((product.variants ?? []).map((g) => [g.name, g.options[0]?.label ?? ""]))
  );

  return (
    <div>
      {(product.variants ?? []).map((group) => (
        <div key={group.name} className="mb-4">
          <p className="mb-2 text-sm font-medium text-slate-700">{group.name}</p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setChoices((prev) => ({ ...prev, [group.name]: opt.label }))}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm",
                  choices[group.name] === opt.label ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                )}
              >
                {opt.label} {opt.price_delta > 0 && `+${formatCurrency(opt.price_delta)}`}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button className="w-full" onClick={() => onConfirm(choices)}>Sepete Ekle</Button>
    </div>
  );
}
