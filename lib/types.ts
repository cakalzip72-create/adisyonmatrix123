// Uygulama genelinde kullanılan alan (domain) tipleri.
// supabase/migrations/0001_init.sql şemasıyla birebir eşleşecek şekilde tasarlanmıştır.

export type BusinessType =
  | "kafe"
  | "restoran"
  | "bar"
  | "pub"
  | "bistro"
  | "fast_food"
  | "pastane"
  | "otel"
  | "lounge"
  | "beach_club"
  | "catering"
  | "yemek_kamyonu"
  | "gece_kulubu"
  | "nargile_kafe"
  | "diger";

export type PlanTier = "starter" | "professional" | "business" | "enterprise";

export interface Store {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  tax_number: string;
  email: string | null;
  description: string | null;
  business_type: BusinessType;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  primary_color: string;
  plan: PlanTier;
  ai_credits: number;
  created_at: string;
}

export type RoleCategory = "waiter" | "chef" | "cashier" | "accountant" | "manager" | "custom";

export interface PermissionMatrix {
  dashboard: boolean;
  masalar: boolean;
  siparisler: boolean;
  mutfak: boolean;
  urunler: boolean;
  musteriler: boolean;
  personel: boolean;
  rezervasyonlar: boolean;
  finans: boolean;
  raporlar: boolean;
  qr_yonetimi: boolean;
  entegrasyonlar: boolean;
  ayarlar: boolean;
}

export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  dashboard: true,
  masalar: false,
  siparisler: false,
  mutfak: false,
  urunler: false,
  musteriler: false,
  personel: false,
  rezervasyonlar: false,
  finans: false,
  raporlar: false,
  qr_yonetimi: false,
  entegrasyonlar: false,
  ayarlar: false,
};

export const FULL_PERMISSIONS: PermissionMatrix = Object.fromEntries(
  Object.keys(DEFAULT_PERMISSIONS).map((k) => [k, true])
) as unknown as PermissionMatrix;

export interface Role {
  id: string;
  store_id: string;
  role_name: string;
  category: RoleCategory;
  permissions: PermissionMatrix;
  created_at: string;
}

export type StaffStatus = "pending" | "approved" | "passive" | "izinli";
export type WorkSchedule = "tam_zamanli" | "yari_zamanli";

export interface Staff {
  id: string;
  store_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  department: string;
  role_id: string;
  role_name?: string;
  status: StaffStatus;
  work_schedule: WorkSchedule;
  shift_start: string | null;
  shift_end: string | null;
  work_days_per_week: number | null;
  day_off: string | null;
  hired_at: string;
  city: string | null;
  district: string | null;
}

export type TableZone = "İç Salon" | "Teras" | "Bahçe" | "VIP Salon";
export type TableStatus = "boş" | "dolu" | "rezerve" | "temizlikte";

export interface RestaurantTable {
  id: string;
  store_id: string;
  table_number: string;
  zone: TableZone;
  capacity: number;
  status: TableStatus;
  pos_x: number;
  pos_y: number;
  qr_code_url: string | null;
  qr_customization: { color: string; logo: boolean; frame: "square" | "rounded" | "circle" } | null;
  note: string | null;
  waiter_id: string | null;
  opened_at: string | null;
}

export interface Category {
  id: string;
  store_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  icon: string;
  sort_order: number;
  status: "aktif" | "pasif";
}

export interface ProductVariantGroup {
  name: string;
  options: { label: string; price_delta: number }[];
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  real_image_url: string | null;
  ai_image_url: string | null;
  variants: ProductVariantGroup[];
  is_available: boolean;
  stock: number | null;
  track_stock: boolean;
  sold_count: number;
}

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_variants: Record<string, string>;
  note: string | null;
}

export interface Order {
  id: string;
  store_id: string;
  table_id: string;
  table_number?: string;
  customer_id: string | null;
  waiter_id: string | null;
  waiter_name?: string;
  status: OrderStatus;
  cancellation_reason: string | null;
  payment_method: "physical_pos" | "nakit" | "kredi_karti" | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  note: string | null;
  created_at: string;
}

export type CustomerGroup = "yeni" | "normal" | "sadik";

export interface Customer {
  id: string;
  store_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  city: string | null;
  district: string | null;
  group: CustomerGroup;
  status: "aktif" | "pasif";
  total_spent: number;
  total_orders: number;
  first_order_at: string | null;
  last_order_at: string | null;
  avatar_url: string | null;
}

export type ReservationStatus = "onaylandı" | "bekliyor" | "iptal edildi";

export interface Reservation {
  id: string;
  store_id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  time: string;
  guest_count: number;
  zone: TableZone;
  table_number: string;
  status: ReservationStatus;
  prepayment: number;
  note: string | null;
  source: "telefon" | "web" | "instagram" | "diğer";
}

export type FinanceType = "gelir" | "gider";
export type CashRegisterName = "Ana Kasa" | "Bar Kasa" | "Paket Servis Kasa";
export type PaymentMethod = "nakit" | "kredi_karti" | "yemek_karti" | "dijital_cuzdan" | "diğer";

export interface FinanceTransaction {
  id: string;
  store_id: string;
  type: FinanceType;
  description: string;
  register: CashRegisterName;
  payment_method: PaymentMethod;
  amount: number;
  status: "tamamlandı" | "bekliyor" | "iptal";
  created_at: string;
}

export interface Notification {
  id: string;
  store_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const CANCELLATION_REASONS = [
  "Yanlış ürün geldi",
  "Eksik ürün",
  "Soğuk/kalitesiz geldi",
  "Geç geldi",
  "Fikrimi değiştirdim",
  "Diğer",
] as const;
