import { Check, Headphones } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface OnboardingStep {
  key: string;
  title: string;
  desc: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { key: "store", title: "İşletme Bilgileri", desc: "İşletmenizin bilgilerini girin." },
  { key: "plan", title: "Plan Seçimi", desc: "Size en uygun planı seçin." },
  { key: "roles", title: "Roller ve Yetkiler", desc: "Şu an hangi rolde deneyeceğinizi seçin." },
  { key: "seed", title: "Sihirli Dokunuş", desc: "Örnek verilerle sisteminizi canlandırın." },
];

export function StepSidebar({ activeKey }: { activeKey: string }) {
  const activeIndex = ONBOARDING_STEPS.findIndex((s) => s.key === activeKey);
  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-100 bg-white p-8 lg:block">
      <Logo size={28} />
      <h1 className="mt-8 text-xl font-bold text-slate-900">Sistemin neredeyse hazır! 🎉</h1>
      <p className="mt-1 text-sm text-slate-500">Sadece birkaç adım kaldı, her adım yaklaşık 15 saniye sürecek.</p>

      <ol className="mt-8 space-y-0">
        {ONBOARDING_STEPS.map((step, i) => {
          const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "todo";
          return (
            <li key={step.key} className="relative flex gap-3 pb-8 last:pb-0">
              {i < ONBOARDING_STEPS.length - 1 && (
                <span className={cn("absolute left-[15px] top-8 h-full w-px", state === "done" ? "bg-emerald-300" : "bg-slate-200")} />
              )}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  state === "done" && "bg-emerald-500 text-white",
                  state === "active" && "bg-blue-600 text-white",
                  state === "todo" && "bg-slate-100 text-slate-400"
                )}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div>
                <p className={cn("text-sm font-semibold", state === "todo" ? "text-slate-400" : "text-slate-900")}>{step.title}</p>
                <p className="text-xs text-slate-400">{step.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-2xl bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">1 dakika içinde hazırsın! ⚡</p>
        <p className="mt-1 text-xs text-blue-700">Kurulum tamamlandığında seni canlı bir panel karşılayacak.</p>
      </div>

      <div className="mt-6 flex items-center gap-2.5 text-xs text-slate-500">
        <Headphones className="h-4 w-4" />
        Yardıma mı ihtiyacın var?
        <Link href="#" className="font-medium text-blue-600">Destek Merkezi</Link>
      </div>
    </aside>
  );
}
