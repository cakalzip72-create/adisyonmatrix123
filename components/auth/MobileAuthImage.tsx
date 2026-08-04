"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { useAuthActions } from "@/components/auth/useAuthActions";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Mobil kayıt/giriş ekranı — masaüstü açılış sayfasıyla aynı yaklaşım:
 * 941x1672 tasarım görseli tam genişlikte durur, gerçek form alanları
 * yüzde konumlarla görseldeki kutuların tam üstüne şeffaf olarak bindirilir.
 *
 * Yüzdeler görsel üzerinden ölçüldüğü için her ekran genişliğinde hizada kalır.
 * Yazı boyutu en az 16px: iOS bunun altındaki alanlara odaklanınca sayfayı
 * kendiliğinden yakınlaştırıyor ve hizalama bozuluyor.
 */

/** Görseldeki kutuların ortak sol kenarı ve genişliği (% cinsinden). */
const FIELD = { left: 24.3, width: 51.3 };

const FONT = "max(16px, 1.7vw)";

function boxStyle(top: number, height: number, left = FIELD.left, width = FIELD.width) {
  return { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` } as const;
}

/** Görseldeki kutunun içindeki metin, çizili ikonun sağından başlar. */
const inputClass =
  "absolute border-0 bg-transparent px-[12%] text-slate-900 caret-blue-600 outline-none " +
  "focus-visible:ring-2 focus-visible:ring-blue-500 rounded-[1.2vw]";

const tapClass = "absolute rounded-[1.2vw] outline-none transition-colors active:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-500";

export function MobileAuthImage() {
  const { loading, error, confirmEmail, signup, login, google } = useAuthActions();
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const signupEmailRef = useRef<HTMLInputElement>(null);

  const notice = !isSupabaseConfigured
    ? { tone: "info" as const, text: "Demo modu: Supabase henüz bağlanmadı. Form gönderimleri doğrudan kurulum sihirbazına yönlendirir." }
    : confirmEmail
      ? { tone: "success" as const, text: `Kaydınız alındı! ${confirmEmail} adresine gönderilen onay bağlantısına tıklayın.` }
      : error
        ? { tone: "warning" as const, text: error }
        : null;

  return (
    <div className="relative w-full bg-white lg:hidden">
      {notice && (
        <div className="fixed inset-x-0 top-0 z-40 p-3">
          <Alert tone={notice.tone}>{notice.text}</Alert>
        </div>
      )}

      <div className="relative w-full" style={{ aspectRatio: "941 / 1672" }}>
        <Image
          src="/auth/signup-login-mobile.png"
          alt="AdisyonMatrix kayıt ol ve giriş yap"
          fill
          priority
          sizes="100vw"
          className="select-none object-cover"
        />

        {/* ---------- KAYIT OL ---------- */}
        <input
          ref={signupEmailRef}
          type="email"
          required
          aria-label="Kayıt e-posta adresiniz"
          autoComplete="email"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          className={inputClass}
          style={{ ...boxStyle(23.45, 3.25), fontSize: FONT }}
        />
        <input
          type={showSignupPw ? "text" : "password"}
          required
          minLength={8}
          aria-label="Kayıt şifreniz"
          autoComplete="new-password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          className={inputClass}
          style={{ ...boxStyle(27.55, 3.25), paddingRight: "14%", fontSize: FONT }}
        />
        <button
          type="button"
          aria-label={showSignupPw ? "Şifreyi gizle" : "Şifreyi göster"}
          onClick={() => setShowSignupPw((s) => !s)}
          className={tapClass}
          style={boxStyle(27.55, 3.25, 70, 5.5)}
        />
        <button
          type="button"
          aria-label="Kayıt Ol"
          disabled={loading !== null}
          onClick={() => signup(signupEmail, signupPassword)}
          className={tapClass}
          style={boxStyle(36.1, 2.85)}
        />
        <button
          type="button"
          aria-label="Google ile Kayıt Ol"
          disabled={loading !== null}
          onClick={google}
          className={tapClass}
          style={boxStyle(41.8, 3.3)}
        />

        {/* ---------- GİRİŞ YAP ---------- */}
        <input
          type="email"
          required
          aria-label="Giriş e-posta adresiniz"
          autoComplete="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className={inputClass}
          style={{ ...boxStyle(58.45, 3.25), fontSize: FONT }}
        />
        <input
          type={showLoginPw ? "text" : "password"}
          required
          aria-label="Giriş şifreniz"
          autoComplete="current-password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className={inputClass}
          style={{ ...boxStyle(62.4, 3.25), paddingRight: "14%", fontSize: FONT }}
        />
        <button
          type="button"
          aria-label={showLoginPw ? "Şifreyi gizle" : "Şifreyi göster"}
          onClick={() => setShowLoginPw((s) => !s)}
          className={tapClass}
          style={boxStyle(62.4, 3.25, 70, 5.5)}
        />
        <button
          type="button"
          aria-label="Giriş Yap"
          disabled={loading !== null}
          onClick={() => login(loginEmail, loginPassword)}
          className={tapClass}
          style={boxStyle(68.55, 2.85)}
        />
        <button
          type="button"
          aria-label="Google ile Giriş Yap"
          disabled={loading !== null}
          onClick={google}
          className={tapClass}
          style={boxStyle(74, 3.3)}
        />

        {/* Alttaki "Kayıt Ol" bağlantısı — iki form da aynı ekranda olduğu için
            ayrı sayfaya gitmek yerine kayıt alanına odaklanır. */}
        <button
          type="button"
          aria-label="Kayıt formuna git"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            signupEmailRef.current?.focus();
          }}
          className={tapClass}
          style={boxStyle(79.2, 1.8, 55, 12)}
        />

        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
