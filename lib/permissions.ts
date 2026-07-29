import { DEFAULT_PERMISSIONS, FULL_PERMISSIONS, PermissionMatrix, RoleCategory } from "@/lib/types";

export const ROLE_TEMPLATES: Record<
  Exclude<RoleCategory, "custom">,
  { label: string; permissions: PermissionMatrix }
> = {
  manager: {
    label: "Yönetici",
    permissions: FULL_PERMISSIONS,
  },
  waiter: {
    label: "Garson",
    permissions: {
      ...DEFAULT_PERMISSIONS,
      masalar: true,
      siparisler: true,
      musteriler: true,
    },
  },
  chef: {
    label: "Aşçı",
    permissions: {
      ...DEFAULT_PERMISSIONS,
      mutfak: true,
      urunler: true,
    },
  },
  cashier: {
    label: "Kasiyer",
    permissions: {
      ...DEFAULT_PERMISSIONS,
      masalar: true,
      siparisler: true,
      finans: true,
    },
  },
  accountant: {
    label: "Mali Müşavir",
    permissions: {
      ...DEFAULT_PERMISSIONS,
      finans: true,
      raporlar: true,
    },
  },
};

export function hasPermission(permissions: PermissionMatrix | undefined, key: keyof PermissionMatrix) {
  if (!permissions) return false;
  return Boolean(permissions[key]);
}

export const PERMISSION_LABELS: Record<keyof PermissionMatrix, string> = {
  dashboard: "Dashboard",
  masalar: "Masa İşlemleri",
  siparisler: "Sipariş Yönetimi",
  mutfak: "Mutfak Ekranı",
  urunler: "Ürün ve Menü Yönetimi",
  musteriler: "Müşteri Yönetimi",
  personel: "Personel Yönetimi",
  rezervasyonlar: "Rezervasyon Yönetimi",
  finans: "Finansal İşlemler",
  raporlar: "Raporlar ve Analiz",
  qr_yonetimi: "QR Yönetimi",
  entegrasyonlar: "Entegrasyonlar",
  ayarlar: "Ayarlar",
};
