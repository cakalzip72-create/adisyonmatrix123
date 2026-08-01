import { Logo } from "@/components/ui/Logo";
import { ONBOARDING_STEPS } from "@/components/onboarding/StepSidebar";
import { cn } from "@/lib/utils";

/** Kurulum sihirbazında masaüstü kenar çubuğu gizliyken mobilde adım göstergesi. */
export function MobileStepHeader({ activeKey }: { activeKey: string }) {
  const activeIndex = ONBOARDING_STEPS.findIndex((s) => s.key === activeKey);
  const active = ONBOARDING_STEPS[activeIndex];

  return (
    <div className="mb-5 lg:hidden">
      <Logo size={24} />
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-blue-600">
            Adım {activeIndex + 1} / {ONBOARDING_STEPS.length}
          </p>
          <p className="text-sm font-semibold text-slate-900">{active?.title}</p>
        </div>
        <div className="flex gap-1.5">
          {ONBOARDING_STEPS.map((step, i) => (
            <span
              key={step.key}
              className={cn(
                "h-1.5 w-6 rounded-full",
                i < activeIndex ? "bg-emerald-500" : i === activeIndex ? "bg-blue-600" : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
