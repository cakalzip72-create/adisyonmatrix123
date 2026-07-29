"use client";

import { useEffect, useId, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_ORDERS } from "@/lib/mock/data";
import { Order } from "@/lib/types";

interface OrderRow {
  id: string;
  store_id: string;
  table_id: string | null;
  customer_id: string | null;
  waiter_id: string | null;
  status: Order["status"];
  cancellation_reason: string | null;
  payment_method: Order["payment_method"];
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  note: string | null;
  created_at: string;
  tables: { table_number: string } | null;
  staff: { full_name: string } | null;
  order_items: {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    selected_variants: Record<string, string>;
    note: string | null;
  }[];
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    store_id: row.store_id,
    table_id: row.table_id ?? "",
    table_number: row.tables?.table_number,
    customer_id: row.customer_id,
    waiter_id: row.waiter_id,
    waiter_name: row.staff?.full_name,
    status: row.status,
    cancellation_reason: row.cancellation_reason,
    payment_method: row.payment_method,
    items: row.order_items ?? [],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    tax: Number(row.tax),
    total_amount: Number(row.total_amount),
    note: row.note,
    created_at: row.created_at,
  };
}

export function useRealtimeOrders(storeId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>(isSupabaseConfigured ? [] : MOCK_ORDERS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [tick, setTick] = useState(0);
  // Kanal adı bileşen bazında benzersiz olmalı (aynı isme ikinci abonelik Supabase'de hata verir).
  const instanceId = useId();

  useEffect(() => {
    if (!isSupabaseConfigured || !storeId) {
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*, tables(table_number), staff(full_name), order_items(*)")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (!error && data) setOrders((data as unknown as OrderRow[]).map(mapOrder));
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`orders-live-${storeId}-${instanceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `store_id=eq.${storeId}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [storeId, tick, instanceId]);

  return { orders, setOrders, loading, refetch: () => setTick((t) => t + 1) };
}
