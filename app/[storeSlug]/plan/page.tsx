"use client";

import { useState } from "react";
import { Check, Coins, Crown, Info, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppPurchaseButton } from "@/components/billing/WhatsAppPurchaseButton";
import { useStore } from "@/lib/store-context";
import {
  Billing, CREDIT_PACKS, CREDIT_USAGE, PLANS, YEARLY_DISCOUNT,
  formatCredits, monthlyEquivalent, priceFor,
} from "@/lib/plans";
import { cn, formatCurrency } from "@/lib/utils";

export default function PlanPage() {
  const { store, currentStaff } = useStore();
  const [billing, setBilling] = useState<Billing>("monthly");

  const accountName = currentStaff.full_name || currentStaff.email;

  return (
    <DashboardShell
      title="Paketler"
      description="İşletmenize uygun paketi seçin. Satın alma WhatsApp üzerinden tamamlanır."
    >
      {/* Mevcut plan */}
      <Card className="mb-6 flex flex-col gap-4 border-blue-100 bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 shrink-0 text-amber-300" />
          <div>
            <p className="text-xs text-blue-100">Mevcut paketiniz</p>
            <p className="text-lg font-semibold capitalize">{PLANS.find((p) => p.key === store.plan)?.name ?? store.plan}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5">
          <Coins className="h-4 w-4 text-amber-300" />
          <span className="text-sm font-medium">{store.ai_credits.toLocaleString("tr-TR")} AI kredisi kaldı</span>
        </div>
      </Card>

      {/* Aylık / yıllık */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <span className={cn("text-sm font-medium", billing === "monthly" ? "text-slate-900" : "text-slate-400")}>Aylık Ödeme</span>
        <button
          onClick={() => setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))}
          aria-label="Ödeme dönemini değiştir"
          className={cn("relative h-6 w-11 rounded-full transition-colors", billing === "yearly" ? "bg-blue-600" : "bg-slate-300")}
        >
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", billing === "yearly" ? "translate-x-5" : "translate-x-0.5")} />
        </button>
        <span className={cn("text-sm font-medium", billing === "yearly" ? "text-slate-900" : "text-slate-400")}>Yıllık Ödeme</span>
        <Badge tone="green">%{Math.round(YEARLY_DISCOUNT * 100)} indirim</Badge>
      </div>

      {/* Paketler */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PLANS.map((plan) => {
          const total = priceFor(plan, billing);
          const perMonth = monthlyEquivalent(plan, billing);
          const isCurrent = store.plan === plan.key;
          return (
            <Card
              key={plan.key}
              className={cn(
                "relative flex flex-col p-6",
                plan.badge ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-100"
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 right-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  Mevcut Paket
                </span>
              )}

              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.desc}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900">{formatCurrency(perMonth)}</span>
                <span className="text-sm text-slate-400"> /ay</span>
                {billing === "yearly" && (
                  <p className="mt-0.5 text-xs text-emerald-600">
                    Yıllık {formatCurrency(total)} · {formatCurrency(plan.monthly * 12 - total)} tasarruf
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
                <Coins className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Aylık {formatCredits(plan.credits)}</span>
              </div>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <WhatsAppPurchaseButton
                  accountName={accountName}
                  storeName={store.name}
                  planName={plan.name}
                  billing={billing}
                  price={total}
                  showNumber={false}
                  label={isCurrent ? "Paketi Yenile" : "WhatsApp ile Satın Al"}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Kredi sistemi */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <p className="text-sm font-semibold text-slate-900">Kredi Sistemi Nasıl Çalışır?</p>
          </div>
          <p className="text-sm text-slate-500">
            Her paket her ay otomatik yenilenen bir AI kredisi içerir. Krediler yapay zeka
            özelliklerinde harcanır; paketin diğer özellikleri (masa, sipariş, rapor) kredi tüketmez.
          </p>
          <ul className="mt-4 divide-y divide-slate-100">
            {CREDIT_USAGE.map((u) => (
              <li key={u.label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-700">{u.label}</span>
                <span className="font-medium text-slate-900">{u.cost}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Kullanılmayan krediler bir sonraki aya devretmez. Kredi biterse ek paket alabilirsiniz.
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-slate-900">Ek Kredi Paketleri</p>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Aylık krediniz bittiğinde tek seferlik ek kredi satın alabilirsiniz.
          </p>
          <div className="space-y-3">
            {CREDIT_PACKS.map((pack) => (
              <div key={pack.credits} className="rounded-xl border border-slate-100 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{formatCredits(pack.credits)}</span>
                  <span className="text-sm font-medium text-slate-600">{formatCurrency(pack.price)}</span>
                </div>
                <WhatsAppPurchaseButton
                  accountName={accountName}
                  storeName={store.name}
                  planName={`${formatCredits(pack.credits)} ek kredi paketi`}
                  billing="one_time"
                  price={pack.price}
                  showNumber={false}
                  label="WhatsApp ile Satın Al"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
