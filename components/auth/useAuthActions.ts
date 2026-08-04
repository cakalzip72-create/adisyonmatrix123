"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/utils";

export type AuthLoading = "signup" | "login" | "google" | null;

/**
 * Kayıt / giriş / Google akışlarının ortak mantığı.
 * Hem masaüstü (AuthScreen) hem mobil (MobileAuthImage) sürümü aynı davranışı
 * paylaşsın diye buraya çıkarıldı.
 */
export function useAuthActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<AuthLoading>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  // /auth/callback başarısız olduğunda sebebi query string ile buraya taşır.
  // useSearchParams yerine window kullanılıyor: bu sayfa statik üretiliyor,
  // useSearchParams ek bir Suspense sınırı gerektirirdi.
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("auth_error");
    if (reason) setError(reason);
  }, []);

  async function signup(email: string, password: string) {
    setError(null);
    setConfirmEmail(null);
    setLoading("signup");
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { error: err, data } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
        if (!data.session) {
          // E-posta onayı zorunlu — oturum yok, onboarding'e geçilemez.
          setConfirmEmail(email);
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

  async function login(email: string, password: string) {
    setError(null);
    setLoading("login");
    try {
      if (!isSupabaseConfigured) {
        router.push("/lezzet-duragi/dashboard");
        return;
      }
      const supabase = createClient();
      const { error: err, data } = await supabase.auth.signInWithPassword({ email, password });
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
    } catch (err) {
      setError(getErrorMessage(err, "Giriş sırasında bir hata oluştu."));
    } finally {
      setLoading(null);
    }
  }

  async function google() {
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Google ile giriş için Supabase yapılandırması ve Google OAuth sağlayıcısının etkinleştirilmesi gerekir.");
      return;
    }
    setLoading("google");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      // signInWithOAuth başarılıysa zaten sayfayı Google'a yönlendirir ve
      // buraya hiç dönülmez. Buraya dönülüyorsa (özellikle mobil Safari'de,
      // ITP/özel gezinme depolamayı engellediğinde) hata sessizce yutuluyordu.
      if (err) throw err;
    } catch (err) {
      setError(getErrorMessage(err, "Google ile giriş başlatılamadı."));
    } finally {
      setLoading(null);
    }
  }

  return { loading, error, setError, confirmEmail, signup, login, google };
}
