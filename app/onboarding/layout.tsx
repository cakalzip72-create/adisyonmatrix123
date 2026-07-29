import { ReactNode } from "react";
import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-slate-50">{children}</div>
    </OnboardingProvider>
  );
}
