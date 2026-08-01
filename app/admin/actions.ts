"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateStorePlan(storeId: string, newPlan: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("stores")
    .update({ plan: newPlan })
    .eq("id", storeId);

  if (error) {
    console.error("Plan güncelleme hatası:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function createStoreManually(data: {
  storeName: string;
  slug: string;
  taxNumber: string;
  businessType: string;
  plan: string;
  ownerEmail: string;
  ownerPassword?: string;
}) {
  const supabase = createAdminClient();

  // 1. Auth Kullanıcısını oluştur (Super Admin yetkisiyle)
  const password = data.ownerPassword || Math.random().toString(36).slice(-8) + "Aa1!";
  
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: data.ownerEmail,
    password: password,
    email_confirm: true,
  });

  if (userError) {
    console.error("Kullanıcı oluşturma hatası:", userError);
    return { success: false, error: userError.message };
  }

  const userId = userData.user.id;

  // 2. Store (Mağaza) oluştur
  const { data: storeData, error: storeError } = await supabase
    .from("stores")
    .insert({
      name: data.storeName,
      slug: data.slug,
      tax_number: data.taxNumber,
      business_type: data.businessType,
      plan: data.plan,
      owner_id: userId,
      email: data.ownerEmail,
    })
    .select()
    .single();

  if (storeError) {
    console.error("Mağaza oluşturma hatası:", storeError);
    // Mağaza oluşturulamazsa kullanıcıyı silmek iyi bir pratik olabilir ama MVP için loglamak yeterli.
    return { success: false, error: storeError.message };
  }

  // 3. Sahibi personel olarak ekle (tam yetkili role)
  // Önce Owner rolünü oluştur (Eğer varsa al)
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .insert({
      store_id: storeData.id,
      role_name: "Kurucu / Sahip",
      category: "manager",
      permissions: { // Tüm yetkiler
        dashboard: true, masalar: true, siparisler: true, mutfak: true, 
        urunler: true, musteriler: true, personel: true, rezervasyonlar: true, 
        finans: true, raporlar: true, qr_yonetimi: true, entegrasyonlar: true, ayarlar: true
      },
    })
    .select()
    .single();

  if (!roleError && roleData) {
    await supabase.from("staff").insert({
      store_id: storeData.id,
      user_id: userId,
      full_name: data.storeName + " Sahibi",
      email: data.ownerEmail,
      role_id: roleData.id,
      department: "Yönetim",
      status: "approved",
      work_schedule: "tam_zamanli",
    });
  }

  revalidatePath("/admin");
  return { success: true, password }; // Şifreyi dönüyoruz ki admin kullanıcıya iletebilsin.
}
