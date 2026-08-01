"use client";

import { useState } from "react";
import { updateStorePlan } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

interface Store {
  id: string;
  name: string;
  slug: string;
  plan: string;
  email: string | null;
  tax_number: string;
  created_at: string;
}

export function StoreList({ stores }: { stores: Store[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanChange = async (storeId: string, newPlan: string) => {
    setLoading(storeId);
    const result = await updateStorePlan(storeId, newPlan);
    setLoading(null);
    if (!result.success) {
      alert("Hata: " + result.error);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-700">
          <tr>
            <th className="px-4 py-3">Mağaza Adı</th>
            <th className="px-4 py-3">E-posta</th>
            <th className="px-4 py-3">Slug / Link</th>
            <th className="px-4 py-3">Mevcut Plan</th>
            <th className="px-4 py-3 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {stores.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                Sistemde henüz bir mağaza bulunmuyor.
              </td>
            </tr>
          ) : (
            stores.map((store) => (
              <tr key={store.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{store.name}</td>
                <td className="px-4 py-3">{store.email || "-"}</td>
                <td className="px-4 py-3 text-blue-600">/{store.slug}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    store.plan === 'starter' ? 'bg-slate-100 text-slate-800' :
                    store.plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {store.plan.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    className="mr-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    value={store.plan}
                    disabled={loading === store.id}
                    onChange={(e) => handlePlanChange(store.id, e.target.value)}
                  >
                    <option value="starter">Başlangıç (3000₺)</option>
                    <option value="professional">Profesyonel (4900₺)</option>
                    <option value="business">İşletme (6900₺)</option>
                    <option value="enterprise">Kurumsal</option>
                  </select>
                  {loading === store.id && <span className="text-xs text-slate-400">...</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
