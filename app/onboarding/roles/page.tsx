"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Crown, Send, ShieldCheck, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { StepSidebar } from "@/components/onboarding/StepSidebar";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { cn } from "@/lib/utils";

const ROLE_CARDS = [
  {
    key: "manager" as const,
    title: "Yönetici",
    icon: Crown,
    tone: "bg-blue-50 text-blue-600",
    tag: "Tüm yetkilere sahip",
    desc: "Sistemin tamamına erişebilir, tüm ayarları yönetebilir, raporları görüntüleyebilirsin.",
    perms: ["Tüm modüllere tam erişim", "Kullanıcı ve rol yönetimi", "Raporlama ve analiz", "Ayarlar ve entegrasyonlar", "Finansal işlemler"],
  },
  {
    key: "cashier" as const,
    title: "Kasiyer",
    icon: User,
    tone: "bg-emerald-50 text-emerald-600",
    tag: "Sınırlı yetkilere sahip",
    desc: "Sipariş oluşturabilir, masa işlemlerini yapabilir ve ödeme alabilirsin.",
    perms: ["Sipariş oluşturma ve düzenleme", "Masa yönetimi", "Ödeme alma", "Kendi siparişlerini görüntüleme"],
  },
];

export default function OnboardingRolesPage() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <div className="flex min-h-screen">
      <StepSidebar activeKey="roles" />
      <main className="flex-1 px-4 py-10 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-3/4 rounded-full bg-blue-600" />
          </div>
          <p className="text-sm font-medium text-blue-600">3. ADIM</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Şu An Hangi Rolde Sistemi Denemek İstersin?</h2>
          <p className="mt-1 text-sm text-slate-500">Seçtiğin role göre panel sana özel olarak hazırlanacak. Daha sonra dilediğin zaman başka roller ekleyebilirsin.</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {ROLE_CARDS.map((role) => {
              const active = data.roleChoice === role.key;
              return (
                <Card
                  key={role.key}
                  onClick={() => update({ roleChoice: role.key })}
                  className={cn("relative cursor-pointer p-6", active ? "border-blue-500 ring-2 ring-blue-100" : "hover:border-slate-200")}
                >
                  {active && (
                    <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                  <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", role.tone)}>
                    <role.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{role.title}</h3>
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">{role.tag}</span>
                  <p className="mt-3 text-sm text-slate-500">{role.desc}</p>
                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {role.perms.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> {p}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          <Card className="mt-5 p-6">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-900">Yanına bir çalışma arkadaşı davet et</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">Ekibinle birlikte çalışarak sistemi daha verimli kullanabilirsin.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="E-posta adresi giriniz"
                value={data.inviteEmail}
                onChange={(e) => update({ inviteEmail: e.target.value })}
                className="flex-1"
              />
              <Select className="sm:w-44" defaultValue="garson">
                <option value="garson">Garson</option>
                <option value="asci">Aşçı</option>
                <option value="kasiyer">Kasiyer</option>
                <option value="mali_musavir">Mali Müşavir</option>
              </Select>
              <Button type="button" variant="success">
                <Send className="h-4 w-4" /> Davet Gönder
              </Button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Davetiyeler güvenli bağlantı ile gönderilir. İstediğin zaman iptal edebilirsin.
            </p>
          </Card>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push("/onboarding/plan")}>
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <Button onClick={() => router.push("/onboarding/seed")}>
              Devam Et <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
