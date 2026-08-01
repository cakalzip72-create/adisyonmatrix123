"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, Lock, Mail, ShieldCheck, Cloud, Zap, Headphones } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

const PASSWORD_RULES = [
  { key: "upper", label: "Büyük harf", test: (v: string) => /[A-Z]/.test(v) },
  { key: "lower", label: "Küçük harf", test: (v: string) => /[a-z]/.test(v) },
  { key: "number", label: "Rakam", test: (v: string) => /[0-9]/.test(v) },
  { key: "special", label: "Özel karakter", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const TRUST = [
  { icon: ShieldCheck, title: "Güvenli Altyapı" },
  { icon: Cloud, title: "Bulut Yedekleme" },
  { icon: Zap, title: "Yüksek Performans" },
  { icon: Headphones, title: "7/24 Destek" },
];

interface Props {
  mode: "login" | "signup";
  signupEmail: string;
  setSignupEmail: (v: string) => void;
  signupPassword: string;
  setSignupPassword: (v: string) => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  loading: "signup" | "login" | "google" | null;
  onSignup: (e: React.FormEvent) => void;
  onLogin: (e: React.FormEvent) => void;
  onGoogle: () => void;
}

export function MobileAuthForm({
  mode,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loading,
  onSignup,
  onLogin,
  onGoogle,
}: Props) {
  const [tab, setTab] = useState<"login" | "signup">(mode);
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="lg:hidden">
      <div className="flex flex-col items-center pb-6 pt-2">
        <Logo size={30} />
        <p className="mt-1.5 text-xs text-slate-500">Akıllı. Hızlı. Güvenilir.</p>
      </div>

      {/* Sekme geçişi */}
      <div className="mx-auto mb-5 grid max-w-sm grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setTab("login")}
          className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${tab === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Giriş Yap
        </button>
        <button
          onClick={() => setTab("signup")}
          className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${tab === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Kayıt Ol
        </button>
      </div>

      <div className="mx-auto max-w-sm rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        {tab === "login" ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Giriş Yap</h2>
              <p className="text-sm text-slate-500">Hesabınıza giriş yaparak panelinize ulaşın.</p>
            </div>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="E-posta adresiniz"
              icon={<Mail className="h-4 w-4" />}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Şifreniz"
                icon={<Lock className="h-4 w-4" />}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading === "login"}>Giriş Yap</Button>
            <Divider />
            <Button type="button" size="lg" variant="outline" className="w-full" onClick={onGoogle} loading={loading === "google"}>
              <GoogleIcon /> Google ile Giriş Yap
            </Button>
            <p className="text-center text-xs text-slate-500">
              Hesabınız yok mu?{" "}
              <button type="button" onClick={() => setTab("signup")} className="font-medium text-blue-600">Kayıt Ol</button>
            </p>
          </form>
        ) : (
          <form onSubmit={onSignup} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Kayıt Ol</h2>
              <p className="text-sm text-slate-500">Ücretsiz kaydolun, restoranınızı dijitalleştirin.</p>
            </div>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="E-posta adresiniz"
              icon={<Mail className="h-4 w-4" />}
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Şifreniz"
                icon={<Lock className="h-4 w-4" />}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(signupPassword);
                return (
                  <span key={rule.key} className={`flex items-center gap-1 text-[11px] ${ok ? "text-emerald-600" : "text-slate-400"}`}>
                    <Check className={`h-3 w-3 ${ok ? "opacity-100" : "opacity-30"}`} /> {rule.label}
                  </span>
                );
              })}
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading === "signup"}>Kayıt Ol</Button>
            <Divider />
            <Button type="button" size="lg" variant="outline" className="w-full" onClick={onGoogle} loading={loading === "google"}>
              <GoogleIcon /> Google ile Kayıt Ol
            </Button>
            <p className="text-center text-xs text-slate-500">
              Zaten hesabınız var mı?{" "}
              <button type="button" onClick={() => setTab("login")} className="font-medium text-blue-600">Giriş Yap</button>
            </p>
          </form>
        )}
      </div>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
        {TRUST.map((t) => (
          <div key={t.title} className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <t.icon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-medium text-slate-700">{t.title}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-400">
        <Link href="/" className="text-blue-600">Anasayfa</Link> · © 2026 AdisyonMatrix
      </p>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-100" />
      <span className="text-xs text-slate-400">veya</span>
      <span className="h-px flex-1 bg-slate-100" />
    </div>
  );
}
