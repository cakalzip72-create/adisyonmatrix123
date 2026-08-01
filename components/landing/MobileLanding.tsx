"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, BarChart3, Bell, Bot, Boxes, ChefHat, ChevronRight, Clock3, CreditCard,
  Cloud, Gauge, Grid2x2, LineChart, Menu, PackageSearch, Phone, QrCode, ReceiptText,
  ShieldCheck, Sparkles, Star, TrendingDown, TrendingUp, Users, UtensilsCrossed, X, Mail, Globe,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SALES_WHATSAPP_DISPLAY, SALES_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { PLANS, YEARLY_DISCOUNT, formatCredits, monthlyEquivalent, priceFor } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#cozumler", label: "Çözümler" },
  { href: "#fiyatlandirma", label: "Fiyatlandırma" },
  { href: "#iletisim", label: "İletişim" },
];

const JOURNEY = [
  { icon: QrCode, title: "QR Sipariş", desc: "Müşteriler QR menü üzerinden hızlıca sipariş verir." },
  { icon: ChefHat, title: "Mutfak", desc: "Sipariş anında mutfağa iletilir, hazırlık süreci başlar." },
  { icon: UtensilsCrossed, title: "Servis", desc: "Garsonlara bildirim gider, sipariş masaya ulaştırılır." },
  { icon: CreditCard, title: "Ödeme", desc: "Hızlı ve güvenli ödeme ile sipariş tamamlanır." },
];

const PROBLEMS = [
  { icon: Clock3, title: "Zaman Kaybı", desc: "Manuel sipariş alma ve kağıt fişler değerli vakit kaybettirir.", tag: "Verimlilik düşer" },
  { icon: ReceiptText, title: "Sipariş Hataları", desc: "Yanlış sipariş ve iletişim kopuklukları müşteriyi kaçırır.", tag: "Müşteri kaybedilir" },
  { icon: LineChart, title: "Gerçek Zamanlı Veri Yok", desc: "Güncel satış ve stok verisi olmadan karar almak zorlaşır.", tag: "Doğru karar gecikir" },
  { icon: Boxes, title: "Dağınık Sistemler", desc: "Farklı yazılımlar arası geçiş maliyeti ve karmaşayı artırır.", tag: "Maliyet artar" },
  { icon: Users, title: "Yetki ve Takip Zorluğu", desc: "Personel performansını takip etmek ve yetkilendirmek zordur.", tag: "Kontrol kaybedilir" },
  { icon: TrendingDown, title: "Stok ve İsraf", desc: "Stok takibi yapılmadığında aşırı alım ve gıda israfı kaçınılmaz.", tag: "Kâr azalır" },
];

const MODULES = [
  { icon: Grid2x2, label: "Masalar", desc: "Anlık masa durumu" },
  { icon: PackageSearch, label: "Stok Yönetimi", desc: "Stok takibi ve reçete" },
  { icon: ChefHat, label: "Mutfak Ekranı", desc: "Siparişler anında düşer" },
  { icon: Users, label: "Personel", desc: "Yetki ve performans" },
  { icon: QrCode, label: "QR Yönetimi", desc: "Dijital menü sistemi" },
  { icon: BarChart3, label: "Analitik", desc: "Detaylı raporlar" },
];

const FEATURES = [
  { icon: Gauge, tone: "bg-blue-50 text-blue-600", title: "Gerçek Zamanlı Kontrol", desc: "Masalardan mutfağa, ödemeden analitiğe kadar her şeyi canlı yönetin." },
  { icon: Bot, tone: "bg-emerald-50 text-emerald-600", title: "Yapay Zeka Destekli", desc: "AI önerileri ve akıllı raporlar ile daha doğru kararlar alın." },
  { icon: QrCode, tone: "bg-purple-50 text-purple-600", title: "QR ile Temassız Deneyim", desc: "Müşteriler QR menü ile hızlı sipariş verir." },
  { icon: PackageSearch, tone: "bg-orange-50 text-orange-600", title: "Stok ve Reçete", desc: "Kritik uyarılarla israfı azaltın, kârınızı artırın." },
  { icon: BarChart3, tone: "bg-blue-50 text-blue-600", title: "Detaylı Raporlama", desc: "Satışlar ve personel performansını anlık analiz edin." },
  { icon: Cloud, tone: "bg-teal-50 text-teal-600", title: "Entegrasyonlar", desc: "Yazarkasa, paket servis ve muhasebe ile entegre çalışır." },
];

const ANALYTICS = [
  { icon: TrendingUp, title: "Gerçek Zamanlı Veriler", desc: "Ciro, sipariş ve masa doluluk oranı anlık güncellenir." },
  { icon: BarChart3, title: "Akıllı Raporlar", desc: "Günlük, haftalık ve aylık raporlarla derinlemesine analiz." },
  { icon: Star, title: "En Çok Satanlar", desc: "Ürün, kategori ve saat bazlı çok satanları görüntüleyin." },
  { icon: Users, title: "Performans Takibi", desc: "Personel performansını ölçün, hedefler belirleyin." },
  { icon: Bell, title: "Akıllı Uyarılar", desc: "Stok kritikleri ve fırsatlar için anında bildirim alın." },
];


export function MobileLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [yearly, setYearly] = useState(false);

  return (
    <div className="bg-white lg:hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo size={24} />
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menü" className="rounded-lg p-1.5 text-slate-600">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-slate-100 px-4 py-4">
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full">Giriş Yap</Button>
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                <Button className="w-full">Ücretsiz Dene</Button>
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/70 to-white px-4 pb-10 pt-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700">
          <Sparkles className="h-3.5 w-3.5" /> Yeni Nesil Restoran Yönetim Platformu
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900">
          Restoran Yönetimi, <span className="text-blue-600">Daha Akıllı</span>, Daha Kolay.
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Siparişten ödemeye, masadan mutfağa tüm süreçlerinizi tek bir platformda yönetin.
        </p>
        <div className="mt-6 grid gap-2.5">
          <Link href="/signup">
            <Button size="lg" className="w-full">Ücretsiz Demo İste <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <a href="#ozellikler">
            <Button size="lg" variant="outline" className="w-full">Özellikleri Keşfet</Button>
          </a>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-900">%98</p>
            <p className="text-[11px] text-slate-500">Müşteri Memnuniyeti</p>
          </div>
          <div className="flex-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-900">%99.9</p>
            <p className="text-[11px] text-slate-500">Sistem Uptime</p>
          </div>
          <div className="flex-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-900">2.500+</p>
            <p className="text-[11px] text-slate-500">İşletme</p>
          </div>
        </div>
      </section>

      {/* Sipariş yolculuğu */}
      <section className="px-4 py-10">
        <div className="flex justify-center"><LogoMark size={64} /></div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900">Siparişin Yolculuğunu İzleyin</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Siparişin masadan mutfağa, servisten ödemeye tüm süreci tek akıllı sistemde.
        </p>
        <ol className="mt-6 space-y-3">
          {JOURNEY.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{i + 1}. {s.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Sorunlar */}
      <section className="bg-slate-50/70 px-4 py-10">
        <span className="mx-auto block w-fit rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600">
          GERÇEK SORUNLAR, GERÇEK KAYIPLAR
        </span>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Restoran Yönetiminde Karşılaştığınız <span className="text-blue-600">Sorunlar</span>
        </h2>
        <div className="mt-6 space-y-3">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600">
                <TrendingDown className="h-3 w-3" /> {p.tag}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { v: "%30+", l: "Verimlilik kaybı" },
            { v: "%25", l: "Memnuniyet düşüşü" },
            { v: "%20-40", l: "Gereksiz maliyet" },
            { v: "%15+", l: "Potansiyel ciro kaybı" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-white p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-blue-700">{s.v}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Çözüm / modüller */}
      <section id="cozumler" className="px-4 py-10">
        <span className="mx-auto block w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700">
          TEK PLATFORM, TAM ÇÖZÜM
        </span>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Tüm Süreçleri <span className="text-blue-600">Tek Platformda</span> Yönetin
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Siparişten ödemeye, stoktan analitiğe kadar her şey senkron çalışır.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {MODULES.map((m) => (
            <div key={m.label} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <m.icon className="h-5 w-5" />
              </span>
              <p className="mt-2 text-sm font-semibold text-slate-900">{m.label}</p>
              <p className="text-[11px] text-slate-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Özellikler */}
      <section id="ozellikler" className="bg-slate-50/70 px-4 py-10">
        <span className="mx-auto block w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700">
          GÜÇLÜ ÖZELLİKLER, GERÇEK SONUÇLAR
        </span>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Restoranınızı <span className="text-blue-600">Geleceğe</span> Taşıyın
        </h2>
        <div className="mt-6 space-y-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.tone}`}>
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Analitik */}
      <section className="px-4 py-10">
        <span className="mx-auto block w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700">
          VERİLERİNİZ KONTROL ALTINDA
        </span>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Gerçek Zamanlı Analitik ile <span className="text-blue-600">Doğru Kararlar</span> Alın
        </h2>
        <ul className="mt-6 space-y-3">
          {ANALYTICS.map((a) => (
            <li key={a.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <a.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                <p className="text-sm text-slate-500">{a.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Fiyatlandırma */}
      <section id="fiyatlandirma" className="bg-slate-50/70 px-4 py-10">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Size En Uygun <span className="text-blue-600">Planı</span> Seçin
        </h2>
        <div className="mt-4 flex items-center justify-center gap-2.5">
          <span className={`text-xs font-medium ${!yearly ? "text-slate-900" : "text-slate-400"}`}>Aylık</span>
          <button
            onClick={() => setYearly((y) => !y)}
            aria-label="Yıllık ödemeye geç"
            className={`relative h-6 w-11 rounded-full transition-colors ${yearly ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${yearly ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-xs font-medium ${yearly ? "text-slate-900" : "text-slate-400"}`}>Yıllık</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
            %{Math.round(YEARLY_DISCOUNT * 100)} indirim
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {PLANS.map((plan) => {
            const billing = yearly ? "yearly" : "monthly";
            const perMonth = monthlyEquivalent(plan, billing);
            const total = priceFor(plan, billing);
            return (
              <div key={plan.key} className={`relative rounded-2xl border bg-white p-5 shadow-sm ${plan.badge ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-100"}`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-5 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white">{plan.badge}</span>
                )}
                <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{plan.desc}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatCurrency(perMonth)}
                  <span className="text-sm font-normal text-slate-400"> /ay</span>
                </p>
                {yearly && <p className="text-xs text-emerald-600">Yıllık {formatCurrency(total)}</p>}
                <p className="mt-2 inline-block rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                  Aylık {formatCredits(plan.credits)}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-blue-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-5 block">
                  <Button className="w-full">Bu Planla Başla</Button>
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Satın alma WhatsApp üzerinden ilerler · {SALES_WHATSAPP_DISPLAY}
        </p>
      </section>

      {/* Footer */}
      <footer id="iletisim" className="bg-slate-950 px-4 py-10 text-slate-300">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="text-lg font-bold text-white">AdisyonMatrix</span>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Modern restoran yönetim platformu. Siparişten ödemeye tüm süreçleri tek panelden yönetin.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-y-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Güvenli Altyapı</span>
          <span className="flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5" /> %99.9 Uptime</span>
          <span className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" /> 7/24 Destek</span>
          <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Hızlı Kurulum</span>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm font-semibold text-white">FolderDC</p>
          <p className="text-xs text-slate-400">Bilişim ve Teknoloji Çözümleri</p>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex items-center gap-2 text-slate-300"><Globe className="h-3.5 w-3.5" /> FolderDC.com</li>
            <li className="flex items-center gap-2 text-slate-300"><Mail className="h-3.5 w-3.5" /> Support@folderdc.com</li>
            <li>
              <a href={`tel:+${SALES_WHATSAPP_NUMBER}`} className="flex items-center gap-2 text-slate-300">
                <Phone className="h-3.5 w-3.5" /> {SALES_WHATSAPP_DISPLAY}
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-6 grid gap-2">
          <Link href="/login"><Button variant="outline" className="w-full">Giriş Yap</Button></Link>
          <Link href="/signup"><Button className="w-full">Hemen Başla</Button></Link>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">© 2026 AdisyonMatrix. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
