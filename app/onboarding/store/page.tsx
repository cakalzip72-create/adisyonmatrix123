"use client";

import { useRouter } from "next/navigation";
import { Building2, Mail, MapPin, Phone, Landmark, ArrowRight, Check, Coffee, UtensilsCrossed, Wine, Beer, Soup, Cake, Sandwich, Building, Sofa, Palmtree, ChefHat, Truck, Music, Cigarette, MoreHorizontal } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StepSidebar } from "@/components/onboarding/StepSidebar";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { BusinessType } from "@/lib/types";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES: { value: BusinessType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "kafe", label: "Kafe", icon: Coffee },
  { value: "restoran", label: "Restoran", icon: UtensilsCrossed },
  { value: "bar", label: "Bar", icon: Wine },
  { value: "pub", label: "Pub", icon: Beer },
  { value: "bistro", label: "Bistro", icon: Soup },
  { value: "fast_food", label: "Fast Food", icon: Sandwich },
  { value: "pastane", label: "Pastane", icon: Cake },
  { value: "otel", label: "Otel", icon: Building },
  { value: "lounge", label: "Lounge", icon: Sofa },
  { value: "beach_club", label: "Beach Club", icon: Palmtree },
  { value: "catering", label: "Catering", icon: ChefHat },
  { value: "yemek_kamyonu", label: "Yemek Kamyonu", icon: Truck },
  { value: "gece_kulubu", label: "Gece Kulübü", icon: Music },
  { value: "nargile_kafe", label: "Nargile Kafe", icon: Cigarette },
  { value: "diger", label: "Diğer", icon: MoreHorizontal },
];

export default function OnboardingStorePage() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/onboarding/plan");
  }

  return (
    <div className="flex min-h-screen">
      <StepSidebar activeKey="store" />
      <main className="flex-1 px-4 py-10 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/4 rounded-full bg-blue-600" />
          </div>
          <p className="text-sm font-medium text-blue-600">1. ADIM</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">İşletme Bilgilerinizi Girin</h2>
          <p className="mt-1 text-sm text-slate-500">İşletmenizin bilgilerini girerek size özel bir deneyim sunmamıza yardımcı olun.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <Label>İşletme Adı</Label>
              <Input
                icon={<Building2 className="h-4 w-4" />}
                placeholder="Örn. Lezzet Durağı"
                value={data.storeName}
                onChange={(e) => update({ storeName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>İşletme E-posta Adresi</Label>
              <Input
                type="email"
                icon={<Mail className="h-4 w-4" />}
                placeholder="info@ornekisletme.com"
                value={data.storeEmail}
                onChange={(e) => update({ storeEmail: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>İşletme Telefon Numarası</Label>
              <Input
                icon={<Phone className="h-4 w-4" />}
                placeholder="0 (5XX) XXX XX XX"
                value={data.storePhone}
                onChange={(e) => update({ storePhone: e.target.value })}
              />
            </div>
            <div>
              <Label>İşletme Lokasyonu</Label>
              <Input
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Örn. Kadıköy, İstanbul"
                value={data.location}
                onChange={(e) => update({ location: e.target.value })}
              />
            </div>
            <div>
              <Label>Vergi Kimlik Numarası</Label>
              <Input
                icon={<Landmark className="h-4 w-4" />}
                placeholder="10 haneli VKN"
                value={data.taxNumber}
                onChange={(e) => update({ taxNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>İşletme Türü</Label>
              <p className="mb-3 text-xs text-slate-400">İşletmenizi en iyi tanımlayan kategoriyi seçin.</p>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                {BUSINESS_TYPES.map((type) => {
                  const active = data.businessType === type.value;
                  return (
                    <button
                      type="button"
                      key={type.value}
                      onClick={() => update({ businessType: type.value })}
                      className={cn(
                        "relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium transition-colors",
                        active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {active && <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-blue-600" />}
                      <type.icon className="h-4.5 w-4.5" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end pt-4">
              <Button type="submit" size="lg">
                Devam Et <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
