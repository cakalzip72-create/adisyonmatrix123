"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StepSidebar } from "@/components/onboarding/StepSidebar";
import { MobileStepHeader } from "@/components/onboarding/MobileStepHeader";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { WhatsAppPurchaseButton } from "@/components/billing/WhatsAppPurchaseButton";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { CREDIT_PACKS, PLANS, YEARLY_DISCOUNT, findPlan, formatCredits, monthlyEquivalent, priceFor } from "@/lib/plans";
import { cn, formatCurrency } from "@/lib/utils";

export default function OnboardingPlanPage() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!cancelled && user?.email) setAccountName(user.email);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = findPlan(data.planKey);
  const purchasePrice = priceFor(selectedPlan, data.billing);

  return (
    <div className="flex min-h-screen">
      <StepSidebar activeKey="plan" />
      <main className="flex-1 px-4 py-6 sm:px-10 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <MobileStepHeader activeKey="plan" />

          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/4 rounded-full bg-blue-600" />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">2. ADIM</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Size En Uygun Planı Seçin</h2>
              <p className="mt-1 text-sm text-slate-500">Dilediğiniz zaman planınızı yükseltebilir veya değiştirebilirsiniz.</p>
            </div>
            <label className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={data.billing === "yearly"}
                onChange={(e) => update({ billing: e.target.checked ? "yearly" : "monthly" })}
                className="accent-blue-600"
              />
              Yıllık öde, <span className="text-emerald-600">%{Math.round(YEARLY_DISCOUNT * 100)} tasarruf et</span>
            </label>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const active = data.planKey === plan.key;
              const perMonth = monthlyEquivalent(plan, data.billing);
              const total = priceFor(plan, data.billing);
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
                    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", active ? "border-blue-600 bg-blue-600" : "border-slate-300")}>
                      {active && <Check className="h-3 w-3 text-white" />}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-slate-900">
                    {formatCurrency(perMonth)} <span className="text-sm font-normal text-slate-400">/ay</span>
                  </p>
                  {data.billing === "yearly" && (
                    <p className="text-xs text-emerald-600">Yıllık {formatCurrency(total)}</p>
                  )}
                  <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">
                    Aylık {formatCredits(plan.credits)}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          {/* Ödeme altyapısı yok — satın alma WhatsApp üzerinden ilerliyor. */}
          <Card className="mt-6 border-emerald-100 bg-emerald-50/40 p-5">
            <p className="text-sm font-semibold text-slate-900">
              Seçilen paket: {selectedPlan.name} · {formatCurrency(purchasePrice)} {data.billing === "yearly" ? "/yıl" : "/ay"} · aylık {formatCredits(selectedPlan.credits)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Satın alma talebiniz hazır mesajla WhatsApp&apos;a iletilir, ekibimiz sizinle iletişime geçer.
            </p>
            <div className="mt-4 sm:max-w-xs">
              <WhatsAppPurchaseButton
                accountName={accountName || data.storeEmail}
                storeName={data.storeName}
                planName={selectedPlan.name}
                billing={data.billing}
                price={purchasePrice}
              />
            </div>
          </Card>

          <Card className="mt-6 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <p className="text-sm font-semibold text-slate-900">AI Kredi Paketleri</p>
            </div>
            <p className="mb-4 text-xs text-slate-500">Aylık AI krediniz bittiğinde ek kredi paketi satın alarak kesintisiz kullanıma devam edebilirsiniz.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CREDIT_PACKS.map((pack) => (
                <div key={pack.credits} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-sm font-semibold text-slate-900">{formatCredits(pack.credits)}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(pack.price)}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/onboarding/store")}>
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => router.push("/onboarding/roles")}>
              Devam Et <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
