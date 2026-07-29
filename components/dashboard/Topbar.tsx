"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Bell, Calendar, ChevronDown, LogOut, Menu, Settings, UserCog } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { MOCK_NOTIFICATIONS } from "@/lib/mock/data";
import { Notification } from "@/lib/types";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";

export function Topbar({ title, description, onMenuClick }: { title?: string; description?: string; onMenuClick?: () => void }) {
  const router = useRouter();
  const { store, currentStaff, currentRole, staffList, setCurrentStaffId } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { data: notifications, setData: setNotifications } = useRealtimeCollection<Notification>({
    table: "notifications",
    storeId: store.id,
    orderBy: { column: "created_at", ascending: false },
    mock: MOCK_NOTIFICATIONS,
  });
  const unread = notifications.filter((n) => !n.read).length;

  async function markRead(n: Notification) {
    if (n.read) return;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (isSupabaseConfigured) {
      await createClient().from("notifications").update({ read: true }).eq("id", n.id);
    }
  }

  async function handleLogout() {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5 text-slate-500" />
        </button>
        {title && (
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            {description && <p className="text-xs text-slate-400">{description}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 sm:flex">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(new Date())}
        </div>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <Bell className="h-4.5 w-4.5" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
              <p className="px-3 py-2 text-sm font-semibold text-slate-900">Bildirimler</p>
              {notifications.length === 0 && <p className="px-3 py-4 text-center text-xs text-slate-400">Bildirim yok.</p>}
              {notifications.map((n) => (
                <button key={n.id} onClick={() => markRead(n)} className="flex w-full items-start justify-between gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50">
                  <span>
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </span>
                  {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setUserOpen((o) => !o)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 hover:bg-slate-50">
            <Avatar name={currentStaff.full_name} size={30} />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium text-slate-900">{store.name}</p>
              <p className="text-[10px] text-slate-400">{currentRole.role_name}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-slate-900">{currentStaff.full_name}</p>
                <p className="text-xs text-slate-400">{currentStaff.email}</p>
              </div>
              {!isSupabaseConfigured && (
                <>
                  <div className="my-1 h-px bg-slate-100" />
                  <p className="px-3 pb-1 pt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">Demo modu: rol değiştir</p>
                  {staffList.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCurrentStaffId(s.id);
                        setUserOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <UserCog className="h-3.5 w-3.5" /> {s.full_name} <span className="text-xs text-slate-400">— {s.role_name}</span>
                    </button>
                  ))}
                </>
              )}
              <div className="my-1 h-px bg-slate-100" />
              <Link href={`/${store.slug}/ayarlar`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Settings className="h-3.5 w-3.5" /> Ayarlar
              </Link>
              <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-3.5 w-3.5" /> Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
