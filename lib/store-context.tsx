"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_ROLES, MOCK_STAFF, getStoreBySlug } from "@/lib/mock/data";
import { DEFAULT_PERMISSIONS, FULL_PERMISSIONS, PermissionMatrix, Role, Staff, Store } from "@/lib/types";

interface StoreContextValue {
  store: Store;
  currentStaff: Staff;
  currentRole: Role;
  permissions: PermissionMatrix;
  setCurrentStaffId: (id: string) => void;
  staffList: Staff[];
  roles: Role[];
  loading: boolean;
  refetchStaff: () => void;
}

const Ctx = createContext<StoreContextValue | null>(null);

const FALLBACK_ROLE: Role = {
  id: "role-unknown",
  store_id: "",
  role_name: "Bilinmeyen",
  category: "custom",
  permissions: DEFAULT_PERMISSIONS,
  created_at: new Date().toISOString(),
};

export function StoreProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(isSupabaseConfigured ? null : getStoreBySlug(slug));
  const [staffList, setStaffList] = useState<Staff[]>(isSupabaseConfigured ? [] : MOCK_STAFF);
  const [roles, setRoles] = useState<Role[]>(isSupabaseConfigured ? [] : MOCK_ROLES);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [currentStaffId, setCurrentStaffId] = useState<string>(isSupabaseConfigured ? "" : MOCK_STAFF[0].id);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setAuthUserId(user?.id ?? null);

      const { data: storeRow } = await supabase.from("stores").select("*").eq("slug", slug).maybeSingle();
      if (cancelled) return;
      if (storeRow) setStore(storeRow as Store);

      if (storeRow) {
        const [{ data: rolesRows }, { data: staffRows }] = await Promise.all([
          supabase.from("roles").select("*").eq("store_id", storeRow.id),
          supabase.from("staff").select("*").eq("store_id", storeRow.id),
        ]);
        if (cancelled) return;
        setRoles((rolesRows as Role[]) ?? []);
        setStaffList((staffRows as Staff[]) ?? []);
        const mine = (staffRows as Staff[] | null)?.find((s) => s.user_id === user?.id);
        if (mine) setCurrentStaffId(mine.id);
      }
      setLoading(false);
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [slug, tick]);

  const value = useMemo<StoreContextValue>(() => {
    const activeStore = store ?? getStoreBySlug(slug);
    const currentStaff =
      staffList.find((s) => s.id === currentStaffId) ??
      staffList.find((s) => s.user_id === authUserId) ??
      staffList[0] ?? {
        id: "staff-unknown",
        store_id: activeStore.id,
        user_id: authUserId,
        full_name: "Kullanıcı",
        email: "",
        phone: null,
        avatar_url: null,
        department: "—",
        role_id: "",
        status: "approved",
        work_schedule: "tam_zamanli",
        shift_start: null,
        shift_end: null,
        work_days_per_week: null,
        day_off: null,
        hired_at: new Date().toISOString(),
        city: null,
        district: null,
      };
    const currentRole = roles.find((r) => r.id === currentStaff.role_id) ?? (isSupabaseConfigured ? { ...FALLBACK_ROLE, permissions: FULL_PERMISSIONS } : roles[0] ?? FALLBACK_ROLE);

    return {
      store: activeStore,
      currentStaff,
      currentRole,
      permissions: currentRole.permissions,
      setCurrentStaffId,
      staffList,
      roles,
      loading,
      refetchStaff: () => setTick((t) => t + 1),
    };
  }, [store, slug, staffList, roles, currentStaffId, authUserId, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
