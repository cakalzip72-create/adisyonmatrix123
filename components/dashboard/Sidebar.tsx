"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Grid2x2, ShoppingCart, ChefHat, Utensils, Tags, Layers, Users, UserCog,
  CalendarClock, Wallet, BarChart3, QrCode, Plug, Settings, Crown, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { hasPermission } from "@/lib/permissions";
import { Order, PermissionMatrix } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { MOCK_ORDERS } from "@/lib/mock/data";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  perm: keyof PermissionMatrix;
  badge?: number;
}

function buildNav(slug: string, orderCount: number): NavItem[] {
  const base = `/${slug}`;
  return [
    { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard, perm: "dashboard" },
    { href: `${base}/masalar`, label: "Masa Planı", icon: Grid2x2, perm: "masalar" },
    { href: `${base}/siparisler`, label: "Siparişler", icon: ShoppingCart, perm: "siparisler", badge: orderCount },
    { href: `${base}/mutfak`, label: "Mutfak", icon: ChefHat, perm: "mutfak" },
    { href: `${base}/urunler`, label: "Ürünler", icon: Utensils, perm: "urunler" },
    { href: `${base}/kategoriler`, label: "Kategoriler", icon: Layers, perm: "urunler" },
    { href: `${base}/ekstralar`, label: "Ekstralar", icon: Tags, perm: "urunler" },
    { href: `${base}/musteriler`, label: "Müşteriler", icon: Users, perm: "musteriler" },
    { href: `${base}/personel`, label: "Personel", icon: UserCog, perm: "personel" },
    { href: `${base}/rezervasyonlar`, label: "Rezervasyonlar", icon: CalendarClock, perm: "rezervasyonlar" },
    { href: `${base}/finans`, label: "Finans", icon: Wallet, perm: "finans" },
    { href: `${base}/raporlar`, label: "Raporlar", icon: BarChart3, perm: "raporlar" },
    { href: `${base}/qr-yonetimi`, label: "QR Yönetimi", icon: QrCode, perm: "qr_yonetimi" },
    { href: `${base}/entegrasyonlar`, label: "Entegrasyonlar", icon: Plug, perm: "entegrasyonlar" },
    { href: `${base}/ayarlar`, label: "Ayarlar", icon: Settings, perm: "ayarlar" },
  ];
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { store, permissions, currentStaff, currentRole } = useStore();
  const { data: orders } = useRealtimeCollection<Order>({ table: "orders", storeId: store.id, mock: MOCK_ORDERS });
  const activeOrderCount = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
  const nav = buildNav(store.slug, activeOrderCount);

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-100 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo size={26} />
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {nav
            .filter((item) => hasPermission(permissions, item.perm))
            .map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="h-4.5 w-4.5" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
        </nav>

        <div className="mx-3 mb-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-4 text-white">
          <Crown className="h-5 w-5 text-amber-300" />
          <p className="mt-2 text-sm font-semibold">{store.plan === "professional" ? "Pro Plan" : "Planınızı Yükseltin"}</p>
          <p className="mt-1 text-xs text-blue-100">Planınızı yükselterek daha fazla özelliğe erişebilirsiniz.</p>
          <Link href={`/${store.slug}/plan`} className="mt-3 block rounded-lg bg-white/15 px-3 py-2 text-center text-xs font-semibold hover:bg-white/25">
            Paketleri Gör
          </Link>
        </div>

        <div className="flex items-center gap-2.5 border-t border-slate-100 px-4 py-4">
          <Avatar name={currentStaff.full_name} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{currentStaff.full_name}</p>
            <p className="truncate text-xs text-slate-400">{currentRole.role_name}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
