"use client";

import { ReactNode, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { useStore } from "@/lib/store-context";
import { hasPermission, PERMISSION_LABELS } from "@/lib/permissions";
import { PermissionMatrix } from "@/lib/types";

export function DashboardShell({
  title,
  description,
  actions,
  permission,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  permission?: keyof PermissionMatrix;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { permissions, currentRole } = useStore();
  const allowed = !permission || hasPermission(permissions, permission);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {allowed && actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
          </div>
          {allowed ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold text-slate-800">Bu bölüme erişim yetkiniz yok</p>
              <p className="mt-1 max-w-sm text-sm text-slate-400">
                {currentRole.role_name} rolü için &quot;{PERMISSION_LABELS[permission!]}&quot; yetkisi tanımlı değil. Erişim için yöneticinizle iletişime geçin.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
