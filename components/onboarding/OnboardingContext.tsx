"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { BusinessType } from "@/lib/types";

export interface OnboardingData {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  location: string;
  taxNumber: string;
  businessType: BusinessType;
  planKey: "starter" | "professional" | "business" | "enterprise";
  billing: "monthly" | "yearly";
  roleChoice: "manager" | "cashier";
  inviteEmail: string;
  seedChoice: "smart" | "extended" | "skip";
}

const DEFAULTS: OnboardingData = {
  storeName: "",
  storeEmail: "",
  storePhone: "",
  location: "",
  taxNumber: "",
  businessType: "kafe",
  planKey: "professional",
  billing: "monthly",
  roleChoice: "manager",
  inviteEmail: "",
  seedChoice: "smart",
};

interface Ctx {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
}

const OnboardingCtx = createContext<Ctx | null>(null);

function loadInitialData(): OnboardingData {
  if (typeof window === "undefined") return DEFAULTS;
  const raw = sessionStorage.getItem("amx-onboarding");
  return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(loadInitialData);

  function update(patch: Partial<OnboardingData>) {
    setData((prev) => {
      const next = { ...prev, ...patch };
      sessionStorage.setItem("amx-onboarding", JSON.stringify(next));
      return next;
    });
  }

  return <OnboardingCtx.Provider value={{ data, update }}>{children}</OnboardingCtx.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
