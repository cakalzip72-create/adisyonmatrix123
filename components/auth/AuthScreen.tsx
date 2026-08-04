"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  BarChart3,
  Check,
  Cloud,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Mail,
  Package,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Wallet,
  Zap,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { LogoMark } from "@/components/ui/Logo";
import { MobileAuthImage } from "@/components/auth/MobileAuthImage";
import { useAuthActions } from "@/components/auth/useAuthActions";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/** Google'ın çok renkli "G" işareti — lucide'de bulunmadığı için satır içi SVG. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.8 6.1C12.2 13.4 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.6 5.9c4.4-4.1 6.7-10.1 6.7-17.3z" />
      <path fill="#FBBC05" d="M10.3 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.5 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.4 0-11.8-3.9-13.7-9.8l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

/** Sol/sağ kenarlarda yüzen modül rozetleri — sadece geniş ekranda. */
const FLOATING = {
  left: [
    { icon: BarChart3, label: "Analiz", top: "18%" },
    { icon: UtensilsCrossed, label: "Sipariş", top: "40%" },
    { icon: Package, label: "Stok", top: "62%" },
  ],
  right: [
    { icon: Bell, label: "Bildirim", top: "18%" },
    { icon: Wallet, label: "Ödeme", top: "40%" },
    { icon: Users, label: "Personel", top: "62%" },
  ],
};

const TRUST = [
  { icon: ShieldCheck, title: "Güvenli Altyapı", desc: "Verileriniz 256-bit şifreleme ile korunur." },
  { icon: Cloud, title: "Bulut Yedekleme", desc: "Tüm verileriniz anlık olarak yedeklenir ve güvende tutulur." },
  { icon: Zap, title: "Yüksek Performans", desc: "Hızlı, kesintisiz ve ölçeklenebilir altyapı." },
  { icon: Headphones, title: "7/24 Destek", desc: "Uzman ekibimiz her zaman yanınızda." },
];

const PASSWORD_RULES = [
  { label: "Büyük harf", test: (v: string) => /[A-ZĞÜŞİÖÇ]/.test(v) },
  { label: "Küçük harf", test: (v: string) => /[a-zğüşıöç]/.test(v) },
  { label: "Rakam", test: (v: string) => /\d/.test(v) },
  { label: "Özel karakter", test: (v: string) => /[^A-Za-zĞÜŞİÖÇğüşıöç0-9]/.test(v) },
];

export function AuthScreen() {
  const { loading, error, confirmEmail, signup, login, google: handleGoogle } = useAuthActions();
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const confirmNotice = confirmEmail !== null;

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    void signup(signupEmail, signupPassword);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    void login(loginEmail, loginPassword);
  }

  return (
    <>
      {/* Mobil: tasarım görseli + görselin üstüne bindirilmiş gerçek alanlar */}
      <MobileAuthImage />

      {/* Masaüstü: responsive HTML sürüm */}
      <div className="relative hidden min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 px-4 py-10 lg:flex">
        <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl">
        {/* Logo + slogan */}
        <div className="flex flex-col items-center text-center">
          <LogoMark size={64} />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Adisyon<span className="text-blue-600">Matrix</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Akıllı. Hızlı. Güvenilir.</p>
        </div>

        {/* Uyarılar */}
        <div className="mx-auto mt-6 max-w-xl space-y-3">
          {!isSupabaseConfigured && (
            <Alert tone="info">
              Demo modu: Supabase henüz bağlanmadı. Form gönderimleri gerçek hesap oluşturmadan doğrudan kurulum sihirbazına yönlendirir.
            </Alert>
          )}
          {error && <Alert tone="warning">{error}</Alert>}
          {confirmNotice && (
            <Alert tone="success">
              Kaydınız alındı! <strong>{signupEmail}</strong> adresine gönderilen onay bağlantısına tıkladıktan sonra kurulum sihirbazına yönlendirileceksiniz.
            </Alert>
          )}
        </div>

        {/* Dış kart + yüzen rozetler */}
        <div className="relative mt-8">
          {FLOATING.left.map(({ icon: Icon, label, top }) => (
            <div
              key={label}
              aria-hidden
              className="absolute -left-16 z-10 hidden w-20 flex-col items-center gap-1 rounded-2xl bg-white/80 p-3 shadow-lg shadow-slate-900/5 backdrop-blur xl:flex"
              style={{ top }}
            >
              <Icon className="h-5 w-5 text-blue-600" />
              <span className="text-[11px] font-medium text-slate-500">{label}</span>
            </div>
          ))}
          {FLOATING.right.map(({ icon: Icon, label, top }) => (
            <div
              key={label}
              aria-hidden
              className="absolute -right-16 z-10 hidden w-20 flex-col items-center gap-1 rounded-2xl bg-white/80 p-3 shadow-lg shadow-slate-900/5 backdrop-blur xl:flex"
              style={{ top }}
            >
              <Icon className="h-5 w-5 text-blue-600" />
              <span className="text-[11px] font-medium text-slate-500">{label}</span>
            </div>
          ))}

          <div className="rounded-3xl border border-white/60 bg-white/50 p-3 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6">
            <div className="relative rounded-2xl bg-white p-5 shadow-sm sm:p-8">
              {/* "Hoş Geldiniz" madalyonu — iki sütunun tam ortasında */}
              <div className="absolute left-1/2 top-1/2 z-10 hidden h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-center text-xs font-semibold leading-tight text-slate-500 shadow-md md:flex">
                Hoş
                <br />
                Geldiniz
              </div>

              <div className="grid gap-10 md:grid-cols-2 md:gap-0">
                {/* ---------- KAYIT OL ---------- */}
                <form onSubmit={handleSignup} className="md:pr-10 lg:pr-14">
                  <h2 className="text-center text-2xl font-bold text-slate-900">Kayıt Ol</h2>
                  <p className="mt-1.5 text-center text-sm text-slate-500">
                    Hemen ücretsiz kaydolun, restoranınızı dijitalleştirin.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        aria-label="Kayıt e-posta adresiniz"
                        placeholder="E-posta adresiniz"
                        autoComplete="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                      <input
                        type={showSignupPw ? "text" : "password"}
                        required
                        minLength={8}
                        aria-label="Kayıt şifreniz"
                        placeholder="Şifreniz"
                        autoComplete="new-password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        aria-label={showSignupPw ? "Şifreyi gizle" : "Şifreyi göster"}
                        onClick={() => setShowSignupPw((s) => !s)}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showSignupPw ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        Şifreniz en az 8 karakter olmalı ve aşağıdakileri içermelidir:
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                        {PASSWORD_RULES.map(({ label, test }) => {
                          const ok = test(signupPassword);
                          return (
                            <li key={label} className="flex items-center gap-1.5">
                              <Check className={`h-3.5 w-3.5 ${ok ? "text-emerald-500" : "text-slate-300"}`} />
                              <span className={`text-[11px] ${ok ? "text-slate-600" : "text-slate-400"}`}>{label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading === "signup"}
                    className="mt-5 h-12 w-full rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading === "signup" ? "Gönderiliyor..." : "Kayıt Ol"}
                  </button>

                  <div className="my-4 flex items-center gap-3">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">veya</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={loading === "google"}
                    aria-label="Google ile Kayıt Ol"
                    className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    <GoogleMark className="h-5 w-5" />
                    Google ile Kayıt Ol
                  </button>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Zaten bir hesabınız var mı?{" "}
                    <Link href="/login" className="font-medium text-blue-600 hover:underline">
                      Giriş Yap
                    </Link>
                  </p>
                </form>

                {/* Sütun ayracı */}
                <div aria-hidden className="hidden md:block md:absolute md:inset-y-8 md:left-1/2 md:w-px md:bg-slate-100" />

                {/* ---------- GİRİŞ YAP ---------- */}
                <form onSubmit={handleLogin} className="border-t border-slate-100 pt-10 md:border-t-0 md:pl-10 md:pt-0 lg:pl-14">
                  <h2 className="text-center text-2xl font-bold text-slate-900">Giriş Yap</h2>
                  <p className="mt-1.5 text-center text-sm text-slate-500">
                    Hesabınıza giriş yaparak yönetim panelinize ulaşın.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        aria-label="Giriş e-posta adresiniz"
                        placeholder="E-posta adresiniz"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                      <input
                        type={showLoginPw ? "text" : "password"}
                        required
                        aria-label="Giriş şifreniz"
                        placeholder="Şifreniz"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        aria-label={showLoginPw ? "Şifreyi gizle" : "Şifreyi göster"}
                        onClick={() => setShowLoginPw((s) => !s)}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showLoginPw ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-right">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Şifremi Unuttum?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading === "login"}
                    className="mt-4 h-12 w-full rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading === "login" ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </button>

                  <div className="my-4 flex items-center gap-3">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">veya</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={loading === "google"}
                    aria-label="Google ile Giriş Yap"
                    className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    <GoogleMark className="h-5 w-5" />
                    Google ile Giriş Yap
                  </button>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Henüz hesabınız yok mu?{" "}
                    <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                      Kayıt Ol
                    </Link>
                  </p>
                </form>
              </div>
            </div>

            {/* Güven şeridi */}
            <div className="grid gap-5 px-2 py-6 sm:grid-cols-2 sm:px-4 lg:grid-cols-4">
              {TRUST.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} AdisyonMatrix. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </>
  );
}
