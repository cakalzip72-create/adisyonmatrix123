"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StepSidebar } from "@/components/onboarding/StepSidebar";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { cn } from "@/lib/utils";

const PLANS = [
  { key: "starter" as const, name: "Starter", desc: "Yeni başlayan işletmeler için ideal.", monthly: 1990, features: ["1 Şube", "5 Kullanıcı", "QR Menü", "Temel Raporlar", "5.000 AI Kredi/ay"] },
  { key: "professional" as const, name: "Professional", desc: "Büyüyen işletmeler için en popüler.", monthly: 3990, badge: "En Popüler", features: ["3 Şube", "20 Kullanıcı", "Gelişmiş Analitik", "AI Destekli Raporlama", "20.000 AI Kredi/ay"] },
  { key: "business" as const, name: "Business", desc: "Zincir işletmeler için gelişmiş.", monthly: 6990, features: ["Sınırsız Şube", "Sınırsız Personel", "Franchise Yönetimi", "7/24 Destek", "50.000 AI Kredi/ay"] },
];

const AI_PACKS = [
  { credits: "5.000 Kredi", price: "₺490" },
  { credits: "20.000 Kredi", price: "₺1.690" },
  { credits: "50.000 Kredi", price: "₺3.490" },
];

export default function OnboardingPlanPage() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <div className="flex min-h-screen">
      <StepSidebar activeKey="plan" />
      <main className="flex-1 px-4 py-10 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/4 rounded-full bg-blue-600" />
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">2. ADIM</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Size En Uygun Planı Seçin</h2>
              <p className="mt-1 text-sm text-slate-500">Dilediğiniz zaman planınızı yükseltebilir veya değiştirebilirsiniz.</p>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={data.billing === "yearly"}
                onChange={(e) => update({ billing: e.target.checked ? "yearly" : "monthly" })}
                className="accent-blue-600"
              />
              Yıllık öde, <span className="text-emerald-600">%17 tasarruf et</span>
            </label>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const active = data.planKey === plan.key;
              const price = data.billing === "yearly" ? Math.round((plan.monthly * 12 * 0.83) / 12) : plan.monthly;
              return (
                <Card
                  key={plan.key}
                  className={cn("relative cursor-pointer p-6 transition-all", active ? "border-blue-500 ring-2 ring-blue-100" : "hover:border-slate-200")}
                  onClick={() => update({ planKey: plan.key })}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{plan.desc}</p>
                    </div>
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border-2", active ? "border-blue-600 bg-blue-600" : "border-slate-300")}>
                      {active && <Check className="h-3 w-3 text-white" />}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-slate-900">
                    ₺{price.toLocaleString("tr-TR")} <span className="text-sm font-normal text-slate-400">/ay</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          <Card className="mt-6 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <p className="text-sm font-semibold text-slate-900">AI Kredi Paketleri</p>
            </div>
            <p className="mb-4 text-xs text-slate-500">Aylık AI krediniz bittiğinde ek kredi paketi satın alarak kesintisiz kullanıma devam edebilirsiniz.</p>
            <div className="grid grid-cols-3 gap-3">
              {AI_PACKS.map((pack) => (
                <div key={pack.credits} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-sm font-semibold text-slate-900">{pack.credits}</p>
                  <p className="text-xs text-slate-500">{pack.price}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push("/onboarding/store")}>
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-400"><Tag className="h-3 w-3" /> Güvenli ödeme altyapısı ile korunur</span>
              <Button onClick={() => router.push("/onboarding/roles")}>
                Devam Et <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
