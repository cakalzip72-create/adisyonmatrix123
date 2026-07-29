"use client";

import { createClient } from "@/lib/supabase/client";
import { ROLE_TEMPLATES } from "@/lib/permissions";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_TABLES, slugify } from "@/lib/mock/data";
import { OnboardingData } from "@/components/onboarding/OnboardingContext";

async function uniqueSlug(supabase: ReturnType<typeof createClient>, base: string) {
  const root = base || "isletmem";
  let candidate = root;
  let n = 1;
  // Slug çakışmasını basitçe kontrol et (herkes stores tablosunu okuyabiliyor — RLS: public select).
  while (true) {
    const { data } = await supabase.from("stores").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export async function provisionStore(userId: string, userEmail: string, data: OnboardingData) {
  const supabase = createClient();
  const slug = await uniqueSlug(supabase, slugify(data.storeName));

  const { data: store, error: storeErr } = await supabase
    .from("stores")
    .insert({
      name: data.storeName || "İşletmem",
      slug,
      owner_id: userId,
      tax_number: data.taxNumber,
      email: data.storeEmail || null,
      business_type: data.businessType,
      phone: data.storePhone || null,
      address: data.location || null,
      plan: data.planKey,
    })
    .select()
    .single();
  if (storeErr || !store) throw storeErr ?? new Error("Mağaza oluşturulamadı.");

  const roleRows = await Promise.all(
    (Object.keys(ROLE_TEMPLATES) as (keyof typeof ROLE_TEMPLATES)[]).map(async (key) => {
      const tpl = ROLE_TEMPLATES[key];
      const { data: role, error } = await supabase
        .from("roles")
        .insert({ store_id: store.id, role_name: tpl.label, category: key, permissions: tpl.permissions })
        .select()
        .single();
      if (error) throw error;
      return { key, role };
    })
  );
  const managerRole = roleRows.find((r) => r.key === "manager")!.role;
  const waiterRole = roleRows.find((r) => r.key === "waiter")!.role;

  await supabase.from("staff").insert({
    store_id: store.id,
    user_id: userId,
    full_name: data.storeName ? `${data.storeName} Yöneticisi` : "İşletme Sahibi",
    email: userEmail,
    department: "Yönetim",
    role_id: managerRole.id,
    status: "approved",
    work_schedule: "tam_zamanli",
  });

  if (data.seedChoice === "smart" || data.seedChoice === "extended") {
    const tableCount = data.seedChoice === "smart" ? 3 : MOCK_TABLES.length;
    const productCount = data.seedChoice === "smart" ? 10 : MOCK_PRODUCTS.length;
    const staffCount = data.seedChoice === "smart" ? 2 : 5;

    // Önce ana kategoriler eklenir, sonra alt kategoriler gerçek parent UUID'leriyle bağlanır.
    const rootMocks = MOCK_CATEGORIES.filter((c) => !c.parent_id);
    const childMocks = MOCK_CATEGORIES.filter((c) => c.parent_id);

    const { data: insertedRoots, error: rootErr } = await supabase
      .from("categories")
      .insert(
        rootMocks.map((c) => ({
          store_id: store.id,
          parent_id: null,
          name: c.name,
          description: c.description,
          icon: c.icon,
          sort_order: c.sort_order,
          status: c.status,
        }))
      )
      .select();
    if (rootErr) throw rootErr;

    const rootIdByMockId = new Map(
      rootMocks.map((mock) => [mock.id, insertedRoots!.find((r) => r.name === mock.name)?.id])
    );

    let insertedChildren: { id: string; name: string }[] = [];
    if (childMocks.length) {
      const { data, error: childErr } = await supabase
        .from("categories")
        .insert(
          childMocks.map((c) => ({
            store_id: store.id,
            parent_id: rootIdByMockId.get(c.parent_id!) ?? null,
            name: c.name,
            description: c.description,
            icon: c.icon,
            sort_order: c.sort_order,
            status: c.status,
          }))
        )
        .select();
      if (childErr) throw childErr;
      insertedChildren = data ?? [];
    }

    const insertedCategories = [...insertedRoots!, ...insertedChildren];
    const categoryIdByOldName = new Map(insertedCategories.map((c) => [c.name, c.id]));
    const productsToInsert = MOCK_PRODUCTS.slice(0, productCount).map((p) => {
      const oldCat = MOCK_CATEGORIES.find((c) => c.id === p.category_id);
      return {
        store_id: store.id,
        category_id: oldCat ? categoryIdByOldName.get(oldCat.name) : null,
        name: p.name,
        description: p.description,
        price: p.price,
        real_image_url: p.real_image_url,
        variants: p.variants,
        is_available: p.is_available,
        stock: p.stock,
        track_stock: p.track_stock,
        sold_count: 0,
      };
    });
    if (productsToInsert.length) {
      const { error: prodErr } = await supabase.from("products").insert(productsToInsert);
      if (prodErr) throw prodErr;
    }

    const tablesToInsert = MOCK_TABLES.slice(0, tableCount).map((t) => ({
      store_id: store.id,
      table_number: t.table_number,
      zone: t.zone,
      capacity: t.capacity,
      status: "boş" as const,
      pos_x: t.pos_x,
      pos_y: t.pos_y,
    }));
    if (tablesToInsert.length) {
      const { error: tableErr } = await supabase.from("tables").insert(tablesToInsert);
      if (tableErr) throw tableErr;
    }

    const staffNames = ["Ayşe Demir", "Mehmet Kaya", "Zeynep Bulut", "Emre Çelik", "Fatma Şahin"];
    const extraStaff = staffNames.slice(0, staffCount).map((name) => ({
      store_id: store.id,
      full_name: name,
      email: `${slugify(name)}@${slug}.com`,
      department: "Servis",
      role_id: waiterRole.id,
      status: "approved" as const,
      work_schedule: "tam_zamanli" as const,
    }));
    if (extraStaff.length) {
      const { error: staffErr } = await supabase.from("staff").insert(extraStaff);
      if (staffErr) throw staffErr;
    }
  }

  return store.slug as string;
}
