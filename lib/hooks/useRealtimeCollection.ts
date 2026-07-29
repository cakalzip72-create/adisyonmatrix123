"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface Options<T> {
  table: string;
  storeId: string | undefined;
  orderBy?: { column: string; ascending?: boolean };
  mock?: T[];
  enabled?: boolean;
}

interface Result<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  refetch: () => void;
}

/**
 * Bir tabloyu store_id'ye göre çeker ve Supabase Realtime ile canlı tutar.
 * Supabase yapılandırılmamışsa (demo modu) verilen mock diziyi olduğu gibi döner.
 */
export function useRealtimeCollection<T extends { id: string }>({
  table,
  storeId,
  orderBy,
  mock,
  enabled = true,
}: Options<T>): Result<T> {
  const [data, setData] = useState<T[]>(mock ?? []);
  const [loading, setLoading] = useState(isSupabaseConfigured && enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  // Aynı tabloya birden fazla bileşen abone olabilir; Supabase aynı isimli kanala
  // ikinci kez abone olunca hata fırlattığı için kanal adını bileşen bazında benzersizleştiriyoruz.
  const instanceId = useId();
  const mockRef = useRef(mock);

  useEffect(() => {
    mockRef.current = mock;
  }, [mock]);

  useEffect(() => {
    if (!isSupabaseConfigured || !storeId || !enabled) {
      setData(mockRef.current ?? []);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    async function load() {
      let query = supabase.from(table).select("*").eq("store_id", storeId);
      if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      const { data: rows, error: err } = await query;
      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else {
        setError(null);
        setData((rows as T[]) ?? []);
      }
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`${table}-${storeId}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `store_id=eq.${storeId}` },
        (payload) => {
          setData((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as T;
              return prev.some((p) => p.id === row.id) ? prev : [...prev, row];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as T;
              return prev.map((p) => (p.id === row.id ? row : p));
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as T;
              return prev.filter((p) => p.id !== oldRow.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, storeId, enabled, tick, instanceId]);

  return { data, loading, error, setData, refetch: () => setTick((t) => t + 1) };
}
