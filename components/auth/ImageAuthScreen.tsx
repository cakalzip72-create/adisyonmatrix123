"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/utils";

const fieldClass =
  "absolute bg-transparent pl-9 pr-3 text-sm text-slate-800 outline-none rounded-lg focus:ring-2 focus:ring-blue-400/50 placeholder:text-transparent";

export function ImageAuthScreen() {
  const router = useRouter();
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loading, setLoading] = useState<"signup" | "login" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmNotice(false);
    setLoading("signup");
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { error: err, data } = await supabase.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
        if (!data.session) {
          // E-posta onayı zorunlu — oturum yok, onboarding'e geçilemez.
          setConfirmNotice(true);
          return;
        }
      }
      router.push("/onboarding/store");
    } catch (err) {
      setError(getErrorMessage(err, "Kayıt sırasında bir hata oluştu."));
    } finally {
      setLoading(null);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("login");
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { error: err, data } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
        if (err) throw err;

        const userId = data.user?.id;
        const { data: owned } = await supabase.from("stores").select("slug").eq("owner_id", userId).maybeSingle();
        if (owned) {
          router.push(`/${owned.slug}/dashboard`);
          return;
        }
        const { data: staffRow } = await supabase
          .from("staff")
          .select("stores(slug)")
          .eq("user_id", userId)
          .eq("status", "approved")
          .maybeSingle();
        const staffStore = staffRow?.stores as unknown as { slug: string } | null;
        if (staffStore?.slug) {
          router.push(`/${staffStore.slug}/dashboard`);
          return;
        }
        router.push("/onboarding/store");
      } else {
        router.push("/lezzet-duragi/dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Giriş sırasında bir hata oluştu."));
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Google ile giriş için Supabase yapılandırması ve Google OAuth sağlayıcısının etkinleştirilmesi gerekir.");
      return;
    }
    setLoading("google");
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-2 py-4">
      {!isSupabaseConfigured && (
        <Alert tone="info" className="mx-auto mb-4 max-w-xl">
          Demo modu: Supabase henüz bağlanmadı. Form gönderimleri gerçek hesap oluşturmadan doğrudan kurulum sihirbazına yönlendirir.
        </Alert>
      )}
      {error && (
        <Alert tone="warning" className="mx-auto mb-4 max-w-xl">
          {error}
        </Alert>
      )}
      {confirmNotice && (
        <Alert tone="success" className="mx-auto mb-4 max-w-xl">
          Kaydınız alındı! <strong>{signupEmail}</strong> adresine gönderilen onay bağlantısına tıkladıktan sonra kurulum sihirbazına yönlendirileceksiniz.
        </Alert>
      )}

      <div className="relative w-full" style={{ aspectRatio: "1536 / 1024" }}>
        <Image src="/auth/signup-login.png" alt="AdisyonMatrix Kayıt ve Giriş" fill priority sizes="100vw" className="object-contain" />

        {/* Logo -> anasayfa */}
        <Link href="/" aria-label="Anasayfa" className="absolute rounded-xl transition-colors hover:bg-blue-500/5" style={{ top: "5.8%", left: "46%", width: "8%", height: "15.2%" }} />

        {/* KAYIT OL FORMU */}
        <form onSubmit={handleSignup}>
          <input
            type="email"
            required
            aria-label="Kayıt e-posta adresiniz"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            className={fieldClass}
            style={{ top: "37.7%", left: "19.8%", width: "24.2%", height: "4.1%" }}
          />
          <input
            type={showSignupPw ? "text" : "password"}
            required
            minLength={8}
            aria-label="Kayıt şifreniz"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            className={fieldClass}
            style={{ top: "43.65%", left: "19.8%", width: "22.5%", height: "4.1%" }}
          />
          <button
            type="button"
            aria-label={showSignupPw ? "Şifreyi gizle" : "Şifreyi göster"}
            onClick={() => setShowSignupPw((s) => !s)}
            className="absolute flex items-center justify-center text-slate-400 hover:text-slate-600"
            style={{ top: "44.5%", left: "42.1%", width: "2%", height: "2.3%" }}
          >
            {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            type="submit"
            disabled={loading === "signup"}
            aria-label="Kayıt Ol"
            className="absolute rounded-lg disabled:opacity-60"
            style={{ top: "55.5%", left: "19.8%", width: "24.2%", height: "4.3%" }}
          />
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading === "google"}
            aria-label="Google ile Kayıt Ol"
            className="absolute rounded-lg disabled:opacity-60"
            style={{ top: "64%", left: "19.8%", width: "24.2%", height: "4.1%" }}
          />
          <Link href="/login" aria-label="Giriş Yap" className="absolute" style={{ top: "71.8%", left: "26.7%", width: "12%", height: "2.4%" }} />
        </form>

        {/* GİRİŞ YAP FORMU */}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            required
            aria-label="Giriş e-posta adresiniz"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className={fieldClass}
            style={{ top: "38.7%", left: "55.9%", width: "24.1%", height: "4.3%" }}
          />
          <input
            type={showLoginPw ? "text" : "password"}
            required
            aria-label="Giriş şifreniz"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className={fieldClass}
            style={{ top: "44.9%", left: "55.9%", width: "22.4%", height: "4.1%" }}
          />
          <button
            type="button"
            aria-label={showLoginPw ? "Şifreyi gizle" : "Şifreyi göster"}
            onClick={() => setShowLoginPw((s) => !s)}
            className="absolute flex items-center justify-center text-slate-400 hover:text-slate-600"
            style={{ top: "46%", left: "78.1%", width: "2%", height: "2.3%" }}
          >
            {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="Şifremi Unuttum" className="absolute" style={{ top: "51%", left: "73.7%", width: "6.3%", height: "1.8%" }} />
          <button
            type="submit"
            disabled={loading === "login"}
            aria-label="Giriş Yap"
            className="absolute rounded-lg disabled:opacity-60"
            style={{ top: "55.5%", left: "55.9%", width: "24.1%", height: "4.3%" }}
          />
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading === "google"}
            aria-label="Google ile Giriş Yap"
            className="absolute rounded-lg disabled:opacity-60"
            style={{ top: "64%", left: "55.9%", width: "24.1%", height: "4.1%" }}
          />
          <Link href="/signup" aria-label="Kayıt Ol" className="absolute" style={{ top: "71.8%", left: "61.9%", width: "12.1%", height: "2.4%" }} />
        </form>
      </div>
    </div>
  );
}
