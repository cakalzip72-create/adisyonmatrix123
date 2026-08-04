"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonHotspot } from "@/components/landing/Hotspot";

const NAV_LINKS = [
  { href: "#cozumler", label: "Çözümler" },
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#analitik", label: "Analitik" },
  { href: "/onboarding/plan", label: "Fiyatlandırma" },
  { href: "#iletisim", label: "İletişim" },
];

/**
 * Mobil tasarım görsellerinde navbar çizili ama menü açılır bir katman gerektiriyor.
 * Hamburger ikonunun üstüne görünmez bir buton konur; menü gerçek HTML olarak açılır.
 */
export function MobileMenu({
  top,
  left,
  width,
  height,
  tone = "light",
}: {
  top: number;
  left: number;
  width: number;
  height: number;
  /** Görselin navbar'ı koyu ise (footer bölümü) ikon rengi değişir. */
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);

  // Menü açıkken arka planın kaymasını engelle.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <ButtonHotspot
        top={top}
        left={left}
        width={width}
        height={height}
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        aria-expanded={open}
      />

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <nav
            className={`absolute inset-x-0 top-0 rounded-b-3xl p-5 shadow-2xl ${
              tone === "dark" ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <Logo size={28} wordmarkClassName={tone === "dark" ? "text-white" : undefined} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menüyü kapat"
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  tone === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="mt-4 space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3 py-3 text-[15px] font-medium ${
                      tone === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={`flex h-12 items-center justify-center rounded-xl border text-[15px] font-semibold ${
                  tone === "dark" ? "border-slate-700 text-slate-100" : "border-slate-200 text-slate-700"
                }`}
              >
                Giriş Yap
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center justify-center rounded-xl bg-blue-600 text-[15px] font-semibold text-white"
              >
                Hemen Başla
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
