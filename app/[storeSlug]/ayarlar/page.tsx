"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Building2, Crown, Mail, Phone, Save, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Tabs } from "@/components/ui/Tabs";
import { useStore } from "@/lib/store-context";
import { PLANS } from "@/lib/plans";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/utils";

const TABS = [
  { key: "genel", label: "Genel" },
  { key: "bildirim", label: "Bildirimler" },
  { key: "plan", label: "Plan & Faturalama" },
  { key: "guvenlik", label: "Güvenlik" },
];

const NOTIF_PREFS = ["Yeni sipariş bildirimleri", "Stok kritik uyarıları", "Yeni rezervasyon bildirimleri", "Günlük özet e-postası", "Personel giriş/çıkış bildirimleri"];

export default function AyarlarPage() {
  const router = useRouter();
  const { store } = useStore();
  const [tab, setTab] = useState("genel");

  // Kenar çubuğundaki "Planı Yükselt" ?tab=plan ile doğrudan plan sekmesini açar.
  // Sunucu/istemci uyuşmazlığı olmaması için ilk istemci render'ında bir kez uygulanır.
  const [tabFromUrlApplied, setTabFromUrlApplied] = useState(false);
  if (typeof window !== "undefined" && !tabFromUrlApplied) {
    setTabFromUrlApplied(true);
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested && TABS.some((t) => t.key === requested)) setTab(requested);
  }
  const [name, setName] = useState(store.name);
  const [phone, setPhone] = useState(store.phone ?? "");
  const [address, setAddress] = useState(store.address ?? "");
  const [taxNumber, setTaxNumber] = useState(store.tax_number);
  const [email, setEmail] = useState(store.email ?? "");
  const [notifs, setNotifs] = useState<boolean[]>(NOTIF_PREFS.map(() => true));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mağaza bilgisi asenkron geldiği için, gerçek mağaza yüklendiğinde form alanlarını
  // bir kez gerçek veriyle senkronla (React'in "render sırasında state ayarlama" deseni).
  const [syncedStoreId, setSyncedStoreId] = useState(store.id);
  if (syncedStoreId !== store.id) {
    setSyncedStoreId(store.id);
    setName(store.name);
    setPhone(store.phone ?? "");
    setAddress(store.address ?? "");
    setTaxNumber(store.tax_number);
    setEmail(store.email ?? "");
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (isSupabaseConfigured) {
        const { error: err } = await createClient()
          .from("stores")
          .update({ name, phone: phone || null, address: address || null, tax_number: taxNumber, email: email || null })
          .eq("id", store.id);
        if (err) throw err;
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Ayarlar kaydedilirken bir hata oluştu."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell title="Ayarlar" description="İşletme bilgilerinizi ve tercihlerinizi yönetin." permission="ayarlar">
      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {tab === "genel" && (
        <Card className="max-w-2xl">
          <CardTitle className="mb-5">İşletme Bilgileri</CardTitle>
          <div className="space-y-4">
            <div>
              <Label>İşletme Adı</Label>
              <Input icon={<Building2 className="h-4 w-4" />} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Vergi Kimlik Numarası</Label>
              <Input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input icon={<Phone className="h-4 w-4" />} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Adres</Label>
              <Textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label>İşletme E-postası</Label>
              <Input icon={<Mail className="h-4 w-4" />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          {error && <Alert tone="warning" className="mt-4">{error}</Alert>}
          <Button className="mt-6" loading={saving} onClick={handleSave}><Save className="h-4 w-4" /> Değişiklikleri Kaydet</Button>
          {saved && <p className="mt-2 text-xs font-medium text-emerald-600">Kaydedildi ✓</p>}
        </Card>
      )}

      {tab === "bildirim" && (
        <Card className="max-w-2xl">
          <CardTitle className="mb-5">Bildirim Tercihleri</CardTitle>
          <ul className="divide-y divide-slate-100">
            {NOTIF_PREFS.map((label, i) => (
              <li key={label} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-sm text-slate-700"><Bell className="h-4 w-4 text-slate-400" /> {label}</span>
                <button
                  onClick={() => setNotifs((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${notifs[i] ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifs[i] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-400">Not: Bildirim tercihleri bu sürümde yalnızca bu oturum için geçerlidir.</p>
        </Card>
      )}

      {tab === "plan" && (
        <Card className="max-w-2xl">
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white">
            <Crown className="h-8 w-8 text-amber-300" />
            <div>
              <p className="font-semibold">{PLANS.find((p) => p.key === store.plan)?.name ?? store.plan}</p>
              <p className="text-xs text-blue-100">{store.ai_credits.toLocaleString("tr-TR")} AI kredisi kaldı</p>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-900">Paketleri karşılaştırın</p>
            <p className="mt-1 text-xs text-slate-500">
              Tüm paketleri, kredi hakları ve fiyatlarıyla birlikte görün.
            </p>
            <Link href={`/${store.slug}/plan`} className="mt-4 inline-block">
              <Button>Paketleri Gör</Button>
            </Link>
          </div>
        </Card>
      )}

      {tab === "guvenlik" && (
        <Card className="max-w-2xl">
          <CardTitle className="mb-5">Güvenlik</CardTitle>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Hesabı Sil</p>
                <p className="text-xs text-red-500">Bu işlem geri alınamaz. Hesap silme bu sürümde destek üzerinden yapılmaktadır.</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}
