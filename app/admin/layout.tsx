import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/ui/Logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  // Sadece yetkili süper admin e-postasına sahip kullanıcı erişebilir
  if (!user || user.email !== superAdminEmail) {
    redirect("/"); // Yetkisizse anasayfaya at
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <LogoMark size={28} />
          <h1 className="ml-3 text-xl font-bold tracking-tight">AdisyonMatrix Süper Admin</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
