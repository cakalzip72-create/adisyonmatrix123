"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Download, Sparkles, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StepSidebar } from "@/components/onboarding/StepSidebar";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { slugify } from "@/lib/mock/data";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { provisionStore } from "@/lib/data/provision-store";
import { Alert } from "@/components/ui/Alert";
import { cn, getErrorMessage } from "@/lib/utils";

const OPTIONS = [
  {
    key: "smart" as const,
    icon: Sparkles,
    tone: "border-blue-500 ring-2 ring-blue-100",
    title: "Akıllı Örnek Veri Ekle (Önerilen)",
    desc: "İşletme türüne uygun 2-3 masa, 8-10 ürün, 2 personel ve örnek siparişlerle sistemini anında canlandıralım.",
    items: ["3 Masa (Masa 1, 2, 3)", "10 Örnek Ürün", "2 Personel (Garson)", "2 Örnek Sipariş", "Örnek Kategoriler", "Örnek Müşteriler"],
    time: "≈ 20 saniye sürer",
  },
  {
    key: "extended" as const,
    icon: Download,
    tone: "border-purple-300",
    title: "Daha Fazla Örnek Veri Ekle",
    desc: "Daha kapsamlı örnek verilerle sistemi zenginleştir. (5 masa, 20+ ürün, 5 personel, detaylı siparişler)",
    items: [],
    time: "≈ 45 saniye sürer",
  },
  {
    key: "skip" as const,
    icon: SkipForward,
    tone: "border-amber-300",
    title: "Şimdilik Geç",
    desc: "Boş bir sistemle başla, verileri daha sonra ekleyebilirsin. (İstediğin zaman örnek veri ekleyebilirsin.)",
    items: [],
    time: null,
  },
];

export default function OnboardingSeedPage() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish() {
    setError(null);
    setFinishing(true);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Oturumunuz bulunamadı. Lütfen tekrar kayıt olun veya giriş yapın.");
          return;
        }
        const slug = await provisionStore(user.id, user.email ?? "", data);
        router.push(`/${slug}/dashboard`);
        return;
      }
      await new Promise((r) => setTimeout(r, 900));
      const slug = slugify(data.storeName) || "lezzet-duragi";
      router.push(`/${slug}/dashboard`);
    } catch (err) {
      setError(getErrorMessage(err, "Kurulum sırasında bir hata oluştu."));
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <StepSidebar activeKey="seed" />
      <main className="flex-1 px-4 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-blue-600" />
          </div>
          <p className="text-sm font-medium text-blue-600">4. ADIM</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Sistemi Senin İçin Canlandıralım! ✨</h2>
          <p className="mt-1 text-sm text-slate-500">Örnek verilerle sistemini dolduralım, böylece tüm özellikleri keşfedebilir ve hemen kullanmaya başlayabilirsin.</p>

          <div className="mt-8 space-y-4">
            {OPTIONS.map((opt) => {
              const active = data.seedChoice === opt.key;
              return (
                <Card
                  key={opt.key}
                  onClick={() => update({ seedChoice: opt.key })}
                  className={cn("relative cursor-pointer p-5", active ? opt.tone : "hover:border-slate-200")}
                >
                  {active && (
                    <span className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <opt.icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{opt.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{opt.desc}</p>
                      {opt.items.length > 0 && (
                        <ul className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                          {opt.items.map((it) => (
                            <li key={it} className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Check className="h-3 w-3 text-emerald-500" /> {it}
                            </li>
                          ))}
                        </ul>
                      )}
                      {opt.time && <span className="mt-3 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-500">{opt.time}</span>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-sm text-blue-800">
            Sihirli dokunuşla sistemin anında canlı hale gelecek! Daha sonra tüm verileri düzenleyebilir, kendi bilgilerinle değiştirebilirsin.
          </div>
          {error && (
            <Alert tone="warning" className="mt-4">
              {error}
            </Alert>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push("/onboarding/roles")}>
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <Button onClick={handleFinish} loading={finishing} size="lg">
              {data.seedChoice === "skip" ? "Kurulumu Bitir" : "Sihirli Dokunuşu Başlat"} <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
