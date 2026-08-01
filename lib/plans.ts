/**
 * Paket / fiyat tanımlarının TEK kaynağı.
 * Tanıtım sayfası, kurulum sihirbazı ve panel içi Paketler sayfası buradan okur —
 * fiyat değişince tek yerden güncellenir.
 */

import { PlanTier } from "@/lib/types";

/** Yıllık ödemede uygulanan indirim oranı. */
export const YEARLY_DISCOUNT = 0.15;

export interface PlanDefinition {
  key: PlanTier;
  name: string;
  desc: string;
  /** Aylık liste fiyatı (TL) */
  monthly: number;
  /** Pakete dahil aylık AI kredisi */
  credits: number;
  badge?: string;
  features: string[];
}

export const PLANS: PlanDefinition[] = [
  {
    key: "starter",
    name: "Başlangıç",
    desc: "Tek şubeli, yeni başlayan işletmeler için.",
    monthly: 3000,
    credits: 5000,
    features: [
      "1 Şube",
      "5 Kullanıcı",
      "QR Menü & Dijital Menü",
      "Masa ve Sipariş Yönetimi",
      "Temel Raporlar",
      "E-posta Desteği",
    ],
  },
  {
    key: "professional",
    name: "Profesyonel",
    desc: "Büyüyen işletmeler için en popüler paket.",
    monthly: 4900,
    credits: 20000,
    badge: "En Popüler",
    features: [
      "3 Şube",
      "20 Kullanıcı",
      "Gelişmiş Analitik",
      "AI Destekli Raporlama",
      "Stok ve Reçete Yönetimi",
      "Öncelikli Destek",
    ],
  },
  {
    key: "business",
    name: "İşletme",
    desc: "Zincir ve çok şubeli işletmeler için.",
    monthly: 6900,
    credits: 50000,
    features: [
      "Sınırsız Şube",
      "Sınırsız Kullanıcı",
      "Tüm AI Özellikleri",
      "Franchise Yönetimi",
      "Tüm Entegrasyonlar",
      "7/24 Teknik Destek",
    ],
  },
];

/** Aylık kredisi bittiğinde satın alınabilecek ek kredi paketleri. */
export interface CreditPack {
  credits: number;
  price: number;
}

export const CREDIT_PACKS: CreditPack[] = [
  { credits: 5000, price: 490 },
  { credits: 20000, price: 1690 },
  { credits: 50000, price: 3490 },
];

/** Kredinin nerede harcandığını anlatan kısa açıklamalar. */
export const CREDIT_USAGE = [
  { label: "AI ürün görseli üretimi", cost: "50 kredi / görsel" },
  { label: "Fotoğraf güvenlik taraması", cost: "5 kredi / fotoğraf" },
  { label: "AI destekli rapor yorumu", cost: "25 kredi / rapor" },
  { label: "Menü ve fiyat önerisi", cost: "30 kredi / öneri" },
];

export type Billing = "monthly" | "yearly";

/** Seçilen döneme göre ödenecek toplam tutar. */
export function priceFor(plan: PlanDefinition, billing: Billing) {
  if (billing === "yearly") {
    return Math.round(plan.monthly * 12 * (1 - YEARLY_DISCOUNT));
  }
  return plan.monthly;
}

/** Yıllık pakette aylığa denk gelen tutar (kartlarda "/ay" göstermek için). */
export function monthlyEquivalent(plan: PlanDefinition, billing: Billing) {
  if (billing === "yearly") {
    return Math.round(plan.monthly * (1 - YEARLY_DISCOUNT));
  }
  return plan.monthly;
}

export function findPlan(key: string | undefined): PlanDefinition {
  return PLANS.find((p) => p.key === key) ?? PLANS[1];
}

export function formatCredits(credits: number) {
  return `${credits.toLocaleString("tr-TR")} kredi`;
}
