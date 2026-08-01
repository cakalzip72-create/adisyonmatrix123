import { createAdminClient } from "@/lib/supabase/admin";
import { StoreList } from "@/components/admin/StoreList";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();
  
  const { data: stores, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Veriler yüklenirken hata oluştu: {error.message}
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <StoreList stores={stores || []} />
    </div>
  );
}
