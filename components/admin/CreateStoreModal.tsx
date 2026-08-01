"use client";

import { useState } from "react";
import { createStoreManually } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

export function CreateStoreModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg("");

    const formData = new FormData(e.currentTarget);
    const data = {
      storeName: formData.get("storeName") as string,
      slug: formData.get("slug") as string,
      taxNumber: formData.get("taxNumber") as string,
      businessType: formData.get("businessType") as string,
      plan: formData.get("plan") as string,
      ownerEmail: formData.get("ownerEmail") as string,
    };

    const result = await createStoreManually(data);
    setLoading(false);

    if (result.success) {
      setResultMsg(`Mağaza başarıyla oluşturuldu! Kullanıcı şifresi: ${result.password}`);
      // Formu temizlemiyoruz, ekranda şifreyi görebilsin diye.
    } else {
      setResultMsg("Hata: " + result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Manuel Mağaza Ekle</h2>
        <p className="mt-1 text-sm text-slate-500">Müşteriniz ödeme yaptıysa buradan mağazasını oluşturabilirsiniz.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Mağaza Adı</label>
            <input name="storeName" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Örn: Gurme Burger" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">URL Slug (İngilizce karakter, boşluksuz)</label>
            <input name="slug" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="gurme-burger" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Sahip E-posta</label>
            <input name="ownerEmail" type="email" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="sahip@email.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Vergi No</label>
              <input name="taxNumber" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="1234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">İşletme Türü</label>
              <select name="businessType" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="restoran">Restoran</option>
                <option value="kafe">Kafe</option>
                <option value="fast_food">Fast Food</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Paket (Plan)</label>
            <select name="plan" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="starter">Başlangıç (3000₺)</option>
              <option value="professional">Profesyonel (4900₺)</option>
              <option value="business">İşletme (6900₺)</option>
              <option value="enterprise">Kurumsal</option>
            </select>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Oluşturuluyor..." : "Oluştur"}
          </Button>

          {resultMsg && (
            <div className={`mt-3 rounded-lg p-3 text-sm ${resultMsg.includes("başarıyla") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {resultMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
