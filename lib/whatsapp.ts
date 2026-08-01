/**
 * WhatsApp üzerinden satın alma yönlendirmesi.
 * Sitede ödeme altyapısı bulunmadığı için plan satın alma talepleri
 * hazır bir mesajla WhatsApp'a yönlendirilir.
 */

/** Satış hattı — 0501 605 35 08 (uluslararası biçim, wa.me için baştaki 0 atılır). */
export const SALES_WHATSAPP_NUMBER = "905016053508";

/** Ekranda gösterilecek okunabilir numara. */
export const SALES_WHATSAPP_DISPLAY = "0501 605 35 08";

export interface PurchaseRequest {
  /** Hesap sahibinin adı ya da e-postası */
  accountName: string;
  /** İşletme adı */
  storeName: string;
  /** Plan adı (Starter / Professional / Business) */
  planName: string;
  /** Aylık, yıllık ya da tek seferlik (ek kredi paketleri) */
  billing: "monthly" | "yearly" | "one_time";
  /** Dönem başına ödenecek tutar (TL) */
  price: number;
}

export function buildPurchaseMessage({ accountName, storeName, planName, billing, price }: PurchaseRequest) {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);

  const priceLine =
    billing === "one_time"
      ? `${formattedPrice} tutarındaki ${planName} satın almak istiyorum.`
      : `${formattedPrice} ${billing === "yearly" ? "yıllık" : "aylık"} fiyata ${planName} paketini satın almak istiyorum.`;

  return [
    `Merhaba, ben ${accountName || "yeni bir kullanıcı"}.`,
    `İşletmem: ${storeName || "(henüz belirtilmedi)"}`,
    priceLine,
    "",
    "Bilgi verebilir misiniz?",
  ].join("\n");
}

export function buildWhatsAppUrl(request: PurchaseRequest) {
  const text = encodeURIComponent(buildPurchaseMessage(request));
  return `https://wa.me/${SALES_WHATSAPP_NUMBER}?text=${text}`;
}
