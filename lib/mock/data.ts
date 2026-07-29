import {
  Category,
  Customer,
  FinanceTransaction,
  Notification,
  Order,
  Product,
  Reservation,
  RestaurantTable,
  Role,
  Staff,
  Store,
} from "@/lib/types";
import { ROLE_TEMPLATES } from "@/lib/permissions";

export const MOCK_STORE: Store = {
  id: "store-1",
  name: "Lezzet Durağı",
  slug: "lezzet-duragi",
  owner_id: "user-1",
  tax_number: "1234567890",
  email: "info@lezzetduragi.com",
  description: "Şehrin merkezinde aile dostu restoran.",
  business_type: "restoran",
  phone: "0555 123 45 67",
  address: "Bornova, İzmir",
  logo_url: null,
  primary_color: "#1d4ed8",
  plan: "professional",
  ai_credits: 18240,
  created_at: "2024-01-10T09:00:00.000Z",
};

export const MOCK_ROLES: Role[] = [
  { id: "role-manager", store_id: "store-1", role_name: "Müdür", category: "manager", permissions: ROLE_TEMPLATES.manager.permissions, created_at: "2024-01-10T09:00:00.000Z" },
  { id: "role-waiter", store_id: "store-1", role_name: "Garson", category: "waiter", permissions: ROLE_TEMPLATES.waiter.permissions, created_at: "2024-01-10T09:00:00.000Z" },
  { id: "role-chef", store_id: "store-1", role_name: "Aşçı", category: "chef", permissions: ROLE_TEMPLATES.chef.permissions, created_at: "2024-01-10T09:00:00.000Z" },
  { id: "role-cashier", store_id: "store-1", role_name: "Kasiyer", category: "cashier", permissions: ROLE_TEMPLATES.cashier.permissions, created_at: "2024-01-10T09:00:00.000Z" },
  { id: "role-accountant", store_id: "store-1", role_name: "Mali Müşavir", category: "accountant", permissions: ROLE_TEMPLATES.accountant.permissions, created_at: "2024-01-10T09:00:00.000Z" },
  {
    id: "role-cleaning",
    store_id: "store-1",
    role_name: "Temizlik Görevlisi",
    category: "custom",
    permissions: { dashboard: true, masalar: true, siparisler: false, mutfak: false, urunler: false, musteriler: false, personel: false, rezervasyonlar: false, finans: false, raporlar: false, qr_yonetimi: false, entegrasyonlar: false, ayarlar: false },
    created_at: "2024-01-10T09:00:00.000Z",
  },
];

export const MOCK_STAFF: Staff[] = [
  { id: "stf-1", store_id: "store-1", user_id: "user-1", full_name: "Ahmet Yılmaz", email: "ahmetyilmaz@gmail.com", phone: "0555 123 45 67", avatar_url: null, department: "Yönetim", role_id: "role-manager", role_name: "Müdür", status: "approved", work_schedule: "tam_zamanli", shift_start: "09:00", shift_end: "18:00", work_days_per_week: 6, day_off: "Pazartesi", hired_at: "2022-06-01", city: "İzmir", district: "Bornova" },
  { id: "stf-2", store_id: "store-1", user_id: null, full_name: "Ayşe Demir", email: "aysedemir@gmail.com", phone: "0532 987 65 43", avatar_url: null, department: "Servis", role_id: "role-waiter", role_name: "Garson", status: "approved", work_schedule: "tam_zamanli", shift_start: "10:00", shift_end: "22:00", work_days_per_week: 6, day_off: "Salı", hired_at: "2023-02-15", city: "İzmir", district: "Bornova" },
  { id: "stf-3", store_id: "store-1", user_id: null, full_name: "Mehmet Kaya", email: "mehmetkaya@hotmail.com", phone: "0541 765 43 21", avatar_url: null, department: "Mutfak", role_id: "role-chef", role_name: "Aşçı", status: "approved", work_schedule: "tam_zamanli", shift_start: "08:00", shift_end: "17:00", work_days_per_week: 6, day_off: "Çarşamba", hired_at: "2022-11-20", city: "İzmir", district: "Karşıyaka" },
  { id: "stf-4", store_id: "store-1", user_id: null, full_name: "Emre Çelik", email: "emrecelik@gmail.com", phone: "0530 111 22 33", avatar_url: null, department: "Bar", role_id: "role-waiter", role_name: "Barmen", status: "izinli", work_schedule: "tam_zamanli", shift_start: "12:00", shift_end: "23:00", work_days_per_week: 5, day_off: "Pazar", hired_at: "2023-05-10", city: "İzmir", district: "Konak" },
  { id: "stf-5", store_id: "store-1", user_id: null, full_name: "Fatma Şahin", email: "fatmasahin@gmail.com", phone: "0542 333 44 55", avatar_url: null, department: "Servis", role_id: "role-waiter", role_name: "Garson", status: "approved", work_schedule: "yari_zamanli", shift_start: "17:00", shift_end: "23:00", work_days_per_week: 4, day_off: "Perşembe", hired_at: "2023-09-01", city: "İzmir", district: "Bornova" },
  { id: "stf-6", store_id: "store-1", user_id: null, full_name: "Hakan Arslan", email: "hakanarslan@gmail.com", phone: "0551 444 55 66", avatar_url: null, department: "Mutfak", role_id: "role-chef", role_name: "Aşçı Yardımcısı", status: "approved", work_schedule: "tam_zamanli", shift_start: "08:00", shift_end: "17:00", work_days_per_week: 6, day_off: "Cuma", hired_at: "2024-01-05", city: "İzmir", district: "Buca" },
  { id: "stf-7", store_id: "store-1", user_id: null, full_name: "Zeynep Bulut", email: "zeynepbulut@gmail.com", phone: "0553 222 33 44", avatar_url: null, department: "Kasa", role_id: "role-cashier", role_name: "Kasiyer", status: "approved", work_schedule: "tam_zamanli", shift_start: "09:00", shift_end: "18:00", work_days_per_week: 6, day_off: "Pazartesi", hired_at: "2023-03-18", city: "İzmir", district: "Bornova" },
  { id: "stf-8", store_id: "store-1", user_id: null, full_name: "Burak Yıldız", email: "burakyildiz@gmail.com", phone: "0536 666 77 88", avatar_url: null, department: "Temizlik", role_id: "role-cleaning", role_name: "Temizlik Görevlisi", status: "passive", work_schedule: "yari_zamanli", shift_start: "07:00", shift_end: "12:00", work_days_per_week: 5, day_off: "Hafta sonu", hired_at: "2023-07-22", city: "İzmir", district: "Bornova" },
  { id: "stf-9", store_id: "store-1", user_id: null, full_name: "Ebru Bayram", email: "ebrubayram@gmail.com", phone: "0533 555 66 77", avatar_url: null, department: "Servis", role_id: "role-waiter", role_name: "Garson", status: "approved", work_schedule: "yari_zamanli", shift_start: "17:00", shift_end: "23:00", work_days_per_week: 4, day_off: "Çarşamba", hired_at: "2024-02-14", city: "İzmir", district: "Karşıyaka" },
  { id: "stf-10", store_id: "store-1", user_id: null, full_name: "Yusuf Tuncer", email: "yusuftuncer@gmail.com", phone: "0546 777 88 99", avatar_url: null, department: "Bar", role_id: "role-waiter", role_name: "Barmen", status: "approved", work_schedule: "tam_zamanli", shift_start: "12:00", shift_end: "23:00", work_days_per_week: 6, day_off: "Salı", hired_at: "2023-08-30", city: "İzmir", district: "Konak" },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-kahvalti", store_id: "store-1", parent_id: null, name: "Kahvaltılar", description: "Güne lezzetli başlangıçlar", icon: "coffee", sort_order: 1, status: "aktif" },
  { id: "cat-baslangic", store_id: "store-1", parent_id: null, name: "Başlangıçlar", description: "İştah açıcı lezzetler", icon: "soup", sort_order: 2, status: "aktif" },
  { id: "cat-salata", store_id: "store-1", parent_id: null, name: "Salatalar", description: "Taze ve sağlıklı salatalar", icon: "salad", sort_order: 3, status: "aktif" },
  { id: "cat-corba", store_id: "store-1", parent_id: null, name: "Çorbalar", description: "Günün çorbaları", icon: "soup", sort_order: 4, status: "aktif" },
  { id: "cat-ana", store_id: "store-1", parent_id: null, name: "Ana Yemekler", description: "Lezzetli ana yemekler", icon: "utensils", sort_order: 5, status: "aktif" },
  { id: "cat-ana-izgara", store_id: "store-1", parent_id: "cat-ana", name: "Izgaralar", description: "Kömür ateşinde ızgaralar", icon: "flame", sort_order: 1, status: "aktif" },
  { id: "cat-ana-guvec", store_id: "store-1", parent_id: "cat-ana", name: "Güveçler", description: "Fırında güveç yemekleri", icon: "soup", sort_order: 2, status: "aktif" },
  { id: "cat-burger", store_id: "store-1", parent_id: null, name: "Burgerler", description: "Özel burger çeşitleri", icon: "beef", sort_order: 6, status: "aktif" },
  { id: "cat-makarna", store_id: "store-1", parent_id: null, name: "Makarnalar", description: "Çeşitli makarna lezzetleri", icon: "utensils-crossed", sort_order: 7, status: "aktif" },
  { id: "cat-pizza", store_id: "store-1", parent_id: null, name: "Pizzalar", description: "Taş fırın pizza çeşitleri", icon: "pizza", sort_order: 8, status: "aktif" },
  { id: "cat-tatli", store_id: "store-1", parent_id: null, name: "Tatlılar", description: "Tatlı ve şerbetli lezzetler", icon: "cake", sort_order: 9, status: "aktif" },
  { id: "cat-icecek", store_id: "store-1", parent_id: null, name: "İçecekler", description: "Sıcak ve soğuk içecekler", icon: "cup-soda", sort_order: 10, status: "aktif" },
  { id: "cat-sicak-icecek", store_id: "store-1", parent_id: "cat-icecek", name: "Sıcak İçecekler", description: "Kahve ve bitki çayları", icon: "coffee", sort_order: 1, status: "aktif" },
  { id: "cat-soguk-icecek", store_id: "store-1", parent_id: "cat-icecek", name: "Soğuk İçecekler", description: "Gazlı ve gazsız içecekler", icon: "cup-soda", sort_order: 2, status: "aktif" },
  { id: "cat-ekstra", store_id: "store-1", parent_id: null, name: "Ekstralar", description: "Ekstra malzemeler", icon: "plus-circle", sort_order: 12, status: "pasif" },
];

const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

// Demo verisi sunucu ve tarayıcıda birebir aynı olmalı; Date.now() kullanılırsa
// iki taraf farklı zaman damgası üretir ve React hidrasyon uyuşmazlığı oluşur.
const DEMO_NOW = new Date("2026-05-25T20:00:00.000Z").getTime();
const minutesBefore = (mins: number) => new Date(DEMO_NOW - mins * 60 * 1000).toISOString();

export const MOCK_PRODUCTS: Product[] = [
  { id: "prod-burger", store_id: "store-1", category_id: "cat-burger", name: "Adisyon Burger", description: "Özel soslu, 200gr dana köfte, cheddar peynir", price: 240, real_image_url: img("burger"), ai_image_url: null, variants: [{ name: "Boyut", options: [{ label: "Normal", price_delta: 0 }, { label: "Büyük", price_delta: 40 }] }, { name: "Acılık", options: [{ label: "Acısız", price_delta: 0 }, { label: "Acılı", price_delta: 0 }] }], is_available: true, stock: 45, track_stock: true, sold_count: 312 },
  { id: "prod-makarna", store_id: "store-1", category_id: "cat-makarna", name: "Tavuklu Makarna", description: "Kremalı sos, ızgara tavuk", price: 220, real_image_url: img("pasta"), ai_image_url: null, variants: [], is_available: true, stock: 32, track_stock: true, sold_count: 178 },
  { id: "prod-pizza", store_id: "store-1", category_id: "cat-pizza", name: "Karışık Pizza", description: "Sucuk, salam, mantar, biber, mısır", price: 280, real_image_url: img("pizza"), ai_image_url: null, variants: [{ name: "Boyut", options: [{ label: "Orta", price_delta: 0 }, { label: "Büyük", price_delta: 60 }] }], is_available: true, stock: 18, track_stock: true, sold_count: 267 },
  { id: "prod-salata", store_id: "store-1", category_id: "cat-salata", name: "Sezar Salata", description: "Izgara tavuk, parmesan, kruton", price: 150, real_image_url: img("salad"), ai_image_url: null, variants: [], is_available: true, stock: 26, track_stock: true, sold_count: 198 },
  { id: "prod-corba", store_id: "store-1", category_id: "cat-corba", name: "Mercimek Çorbası", description: "Ev yapımı, tereyağlı", price: 90, real_image_url: img("soup"), ai_image_url: null, variants: [], is_available: true, stock: 50, track_stock: true, sold_count: 121 },
  { id: "prod-cola", store_id: "store-1", category_id: "cat-icecek", name: "Coca Cola", description: "330 ml kutu", price: 60, real_image_url: img("cola"), ai_image_url: null, variants: [], is_available: true, stock: 120, track_stock: true, sold_count: 421 },
  { id: "prod-fanta", store_id: "store-1", category_id: "cat-icecek", name: "Fanta", description: "330 ml kutu", price: 60, real_image_url: img("fanta"), ai_image_url: null, variants: [], is_available: true, stock: 88, track_stock: true, sold_count: 156 },
  { id: "prod-ayran", store_id: "store-1", category_id: "cat-icecek", name: "Ayran", description: "300 ml", price: 50, real_image_url: img("ayran"), ai_image_url: null, variants: [], is_available: true, stock: 65, track_stock: true, sold_count: 134 },
  { id: "prod-cheesecake", store_id: "store-1", category_id: "cat-tatli", name: "Cheesecake", description: "Frambuazlı", price: 120, real_image_url: img("cheesecake"), ai_image_url: null, variants: [], is_available: true, stock: 22, track_stock: true, sold_count: 156 },
  { id: "prod-sufle", store_id: "store-1", category_id: "cat-tatli", name: "Sufle", description: "Sıcak çikolatalı", price: 130, real_image_url: img("souffle"), ai_image_url: null, variants: [], is_available: true, stock: 15, track_stock: true, sold_count: 88 },
  { id: "prod-turkkahve", store_id: "store-1", category_id: "cat-sicak-icecek", name: "Türk Kahvesi", description: "Lokum ile servis", price: 70, real_image_url: img("turkishcoffee"), ai_image_url: null, variants: [{ name: "Şeker", options: [{ label: "Sade", price_delta: 0 }, { label: "Az Şekerli", price_delta: 0 }, { label: "Orta", price_delta: 0 }, { label: "Şekerli", price_delta: 0 }] }], is_available: true, stock: 40, track_stock: true, sold_count: 298 },
  { id: "prod-latte", store_id: "store-1", category_id: "cat-sicak-icecek", name: "Latte", description: "Espresso ve buharla ısıtılmış süt", price: 90, real_image_url: img("latte"), ai_image_url: null, variants: [], is_available: true, stock: 35, track_stock: true, sold_count: 134 },
  { id: "prod-menemen", store_id: "store-1", category_id: "cat-kahvalti", name: "Menemen", description: "Domates, biber, yumurta", price: 130, real_image_url: img("menemen"), ai_image_url: null, variants: [], is_available: true, stock: 30, track_stock: true, sold_count: 96 },
  { id: "prod-serpme", store_id: "store-1", category_id: "cat-kahvalti", name: "Serpme Kahvaltı", description: "2 kişilik geniş kahvaltı tabağı", price: 420, real_image_url: img("breakfast"), ai_image_url: null, variants: [], is_available: true, stock: 12, track_stock: true, sold_count: 54 },
  { id: "prod-cips", store_id: "store-1", category_id: "cat-baslangic", name: "Soğan Halkası", description: "Çıtır soğan halkası, sos ile", price: 110, real_image_url: img("onionrings"), ai_image_url: null, variants: [], is_available: true, stock: 40, track_stock: true, sold_count: 87 },
  { id: "prod-tavuk-dunyasi", store_id: "store-1", category_id: "cat-ana", name: "Tavuk Dünyası", description: "Izgara tavuk, pilav, salata", price: 260, real_image_url: img("chicken"), ai_image_url: null, variants: [], is_available: true, stock: 28, track_stock: true, sold_count: 267 },
  { id: "prod-limonata", store_id: "store-1", category_id: "cat-icecek", name: "Limonata", description: "Naneli ev yapımı limonata", price: 80, real_image_url: img("lemonade"), ai_image_url: null, variants: [], is_available: true, stock: 44, track_stock: true, sold_count: 134 },
  { id: "prod-kunefe", store_id: "store-1", category_id: "cat-tatli", name: "Künefe", description: "Antep fıstıklı, sıcak servis", price: 150, real_image_url: img("kunefe"), ai_image_url: null, variants: [], is_available: false, stock: 0, track_stock: true, sold_count: 76 },
];

const ZONE_ROTATION = ["İç Salon", "İç Salon", "İç Salon", "İç Salon", "İç Salon", "İç Salon", "İç Salon", "İç Salon", "İç Salon", "İç Salon", "Teras", "Teras", "Teras", "Teras", "VIP Salon", "Bahçe", "VIP Salon"] as const;
const STATUS_ROTATION = ["boş", "boş", "dolu", "dolu", "boş", "rezerve", "boş", "boş", "rezerve", "boş", "boş", "dolu", "boş", "dolu", "rezerve", "boş", "temizlikte"] as const;

export const MOCK_TABLES: RestaurantTable[] = Array.from({ length: 17 }, (_, i) => {
  const n = i + 1;
  const col = (i % 5) + 1;
  const row = Math.floor(i / 5) + 1;
  return {
    id: `tbl-${n}`,
    store_id: "store-1",
    table_number: String(n),
    zone: ZONE_ROTATION[i],
    capacity: n % 3 === 0 ? 6 : 4,
    status: STATUS_ROTATION[i],
    pos_x: col,
    pos_y: row,
    qr_code_url: null,
    qr_customization: { color: "#1d4ed8", logo: true, frame: "rounded" },
    note: n === 3 ? "Doğum günü kutlaması var. Tatlı ikram edilecek." : null,
    waiter_id: n === 3 ? "stf-1" : n % 4 === 0 ? "stf-2" : null,
    opened_at: n === 3 || n === 12 || n === 14 ? minutesBefore(85) : null,
  };
});

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cus-1", store_id: "store-1", full_name: "Ahmet Yılmaz", email: "ahmetyilmaz@gmail.com", phone: "0555 123 45 67", city: "İzmir", district: "Bornova", group: "sadik", status: "aktif", total_spent: 15750, total_orders: 32, first_order_at: "2024-01-10", last_order_at: "2026-07-27", avatar_url: null },
  { id: "cus-2", store_id: "store-1", full_name: "Ayşe Demir", email: "aysedemir@gmail.com", phone: "0532 987 65 43", city: "İzmir", district: "Konak", group: "sadik", status: "aktif", total_spent: 12480, total_orders: 28, first_order_at: "2024-02-02", last_order_at: "2026-07-26", avatar_url: null },
  { id: "cus-3", store_id: "store-1", full_name: "Mehmet Kaya", email: "mehmetkaya@hotmail.com", phone: "0541 765 43 21", city: "İzmir", district: "Karşıyaka", group: "normal", status: "aktif", total_spent: 5630, total_orders: 12, first_order_at: "2024-05-14", last_order_at: "2026-07-20", avatar_url: null },
  { id: "cus-4", store_id: "store-1", full_name: "Zeynep Bulut", email: "zeynepbulut@gmail.com", phone: "0553 222 33 44", city: "İzmir", district: "Buca", group: "normal", status: "aktif", total_spent: 3250, total_orders: 7, first_order_at: "2024-08-03", last_order_at: "2026-07-18", avatar_url: null },
  { id: "cus-5", store_id: "store-1", full_name: "Emre Çelik", email: "emrecelik@gmail.com", phone: "0530 111 22 33", city: "İzmir", district: "Bornova", group: "yeni", status: "aktif", total_spent: 1250, total_orders: 3, first_order_at: "2026-06-01", last_order_at: "2026-07-15", avatar_url: null },
  { id: "cus-6", store_id: "store-1", full_name: "Fatma Şahin", email: "fatmasahin@gmail.com", phone: "0542 333 44 55", city: "İzmir", district: "Bornova", group: "normal", status: "aktif", total_spent: 7890, total_orders: 18, first_order_at: "2024-03-11", last_order_at: "2026-07-13", avatar_url: null },
  { id: "cus-7", store_id: "store-1", full_name: "Hakan Arslan", email: "hakanarslan@gmail.com", phone: "0551 444 55 66", city: "İzmir", district: "Buca", group: "sadik", status: "aktif", total_spent: 18900, total_orders: 41, first_order_at: "2023-11-20", last_order_at: "2026-07-12", avatar_url: null },
  { id: "cus-8", store_id: "store-1", full_name: "Ebru Bayram", email: "ebrubayram@gmail.com", phone: "0533 555 66 77", city: "İzmir", district: "Karşıyaka", group: "yeni", status: "aktif", total_spent: 980, total_orders: 2, first_order_at: "2026-07-01", last_order_at: "2026-07-10", avatar_url: null },
  { id: "cus-9", store_id: "store-1", full_name: "Yusuf Tuncer", email: "yusuftuncer@gmail.com", phone: "0546 777 88 99", city: "İzmir", district: "Konak", group: "normal", status: "pasif", total_spent: 2560, total_orders: 5, first_order_at: "2024-09-09", last_order_at: "2026-06-14", avatar_url: null },
  { id: "cus-10", store_id: "store-1", full_name: "Büşra Aksoy", email: "busraaksoy@gmail.com", phone: "0554 888 99 00", city: "İzmir", district: "Bornova", group: "sadik", status: "aktif", total_spent: 11320, total_orders: 22, first_order_at: "2024-04-17", last_order_at: "2026-07-09", avatar_url: null },
];

function order(id: string, tableId: string, tableNumber: string, waiterId: string, waiterName: string, status: Order["status"], itemDefs: { product: Product; qty: number }[], minutesAgo: number, note: string | null = null): Order {
  const items = itemDefs.map((d, idx) => ({
    id: `${id}-item-${idx}`,
    order_id: id,
    product_id: d.product.id,
    product_name: d.product.name,
    quantity: d.qty,
    unit_price: d.product.price,
    selected_variants: {},
    note: null,
  }));
  const subtotal = items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);
  const discount = Math.round(subtotal * 0.05);
  const tax = Math.round((subtotal - discount) * 0.1);
  return {
    id,
    store_id: "store-1",
    table_id: tableId,
    table_number: tableNumber,
    customer_id: null,
    waiter_id: waiterId,
    waiter_name: waiterName,
    status,
    cancellation_reason: null,
    payment_method: null,
    items,
    subtotal,
    discount,
    tax,
    total_amount: subtotal - discount + tax,
    note,
    created_at: minutesBefore(minutesAgo),
  };
}

export const MOCK_ORDERS: Order[] = [
  order("ord-1258", "tbl-3", "3", "stf-1", "Ahmet Yılmaz", "preparing", [{ product: MOCK_PRODUCTS[0], qty: 2 }, { product: MOCK_PRODUCTS[5], qty: 2 }, { product: MOCK_PRODUCTS[2], qty: 1 }, { product: MOCK_PRODUCTS[3], qty: 1 }], 8, "Doğum günü kutlaması var."),
  order("ord-1257", "tbl-12", "12", "stf-2", "Ayşe Demir", "ready", [{ product: MOCK_PRODUCTS[2], qty: 1 }, { product: MOCK_PRODUCTS[5], qty: 1 }], 14),
  order("ord-1256", "tbl-14", "14", "stf-5", "Fatma Şahin", "delivered", [{ product: MOCK_PRODUCTS[15], qty: 2 }, { product: MOCK_PRODUCTS[16], qty: 1 }], 22),
  order("ord-1255", "tbl-4", "4", "stf-2", "Ayşe Demir", "pending", [{ product: MOCK_PRODUCTS[0], qty: 1 }, { product: MOCK_PRODUCTS[8], qty: 1 }], 3),
  order("ord-1254", "tbl-12", "12", "stf-2", "Ayşe Demir", "completed", [{ product: MOCK_PRODUCTS[10], qty: 2 }], 65),
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: "rzv-38", store_id: "store-1", code: "#RZV-0038", customer_name: "Ahmet Yılmaz", customer_phone: "0555 123 45 67", date: "2026-08-02", time: "20:00", guest_count: 4, zone: "İç Salon", table_number: "3", status: "onaylandı", prepayment: 200, note: "Doğum günü kutlaması var.", source: "telefon" },
  { id: "rzv-37", store_id: "store-1", code: "#RZV-0037", customer_name: "Ayşe Demir", customer_phone: "0532 987 65 43", date: "2026-08-02", time: "19:30", guest_count: 2, zone: "Teras", table_number: "7", status: "onaylandı", prepayment: 0, note: null, source: "web" },
  { id: "rzv-36", store_id: "store-1", code: "#RZV-0036", customer_name: "Mehmet Kaya", customer_phone: "0541 765 43 21", date: "2026-08-02", time: "18:30", guest_count: 6, zone: "Bahçe", table_number: "12", status: "bekliyor", prepayment: 150, note: null, source: "telefon" },
  { id: "rzv-35", store_id: "store-1", code: "#RZV-0035", customer_name: "Zeynep Bulut", customer_phone: "0553 222 33 44", date: "2026-08-01", time: "17:00", guest_count: 3, zone: "İç Salon", table_number: "5", status: "onaylandı", prepayment: 0, note: null, source: "instagram" },
  { id: "rzv-34", store_id: "store-1", code: "#RZV-0034", customer_name: "Emre Çelik", customer_phone: "0530 111 22 33", date: "2026-07-31", time: "21:00", guest_count: 5, zone: "VIP Salon", table_number: "1", status: "onaylandı", prepayment: 250, note: null, source: "telefon" },
  { id: "rzv-33", store_id: "store-1", code: "#RZV-0033", customer_name: "Fatma Şahin", customer_phone: "0542 333 44 55", date: "2026-07-31", time: "20:30", guest_count: 2, zone: "Teras", table_number: "9", status: "iptal edildi", prepayment: 0, note: null, source: "web" },
];

export const MOCK_FINANCE: FinanceTransaction[] = [
  { id: "fin-1", store_id: "store-1", type: "gelir", description: "Masa 3 - Adisyon #1258", register: "Ana Kasa", payment_method: "nakit", amount: 1250, status: "tamamlandı", created_at: "2026-07-27T22:45:00.000Z" },
  { id: "fin-2", store_id: "store-1", type: "gelir", description: "Masa 12 - Adisyon #1257", register: "Ana Kasa", payment_method: "kredi_karti", amount: 2350, status: "tamamlandı", created_at: "2026-07-27T21:30:00.000Z" },
  { id: "fin-3", store_id: "store-1", type: "gelir", description: "Paket servis siparişi", register: "Paket Servis Kasa", payment_method: "yemek_karti", amount: 860, status: "tamamlandı", created_at: "2026-07-27T20:15:00.000Z" },
  { id: "fin-4", store_id: "store-1", type: "gider", description: "Market alışverişi", register: "Ana Kasa", payment_method: "nakit", amount: 1450, status: "tamamlandı", created_at: "2026-07-27T18:40:00.000Z" },
  { id: "fin-5", store_id: "store-1", type: "gider", description: "İçecek tedarik", register: "Bar Kasa", payment_method: "kredi_karti", amount: 2350, status: "tamamlandı", created_at: "2026-07-27T17:20:00.000Z" },
  { id: "fin-6", store_id: "store-1", type: "gider", description: "Personel bahşişi", register: "Ana Kasa", payment_method: "nakit", amount: 750, status: "tamamlandı", created_at: "2026-07-27T16:05:00.000Z" },
  { id: "fin-7", store_id: "store-1", type: "gelir", description: "Online rezervasyon ödemesi", register: "Ana Kasa", payment_method: "kredi_karti", amount: 650, status: "tamamlandı", created_at: "2026-07-27T15:10:00.000Z" },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "ntf-1", store_id: "store-1", title: "Yeni sipariş", message: "Masa 5 için yeni sipariş verdi.", read: false, created_at: minutesBefore(2) },
  { id: "ntf-2", store_id: "store-1", title: "Masa tamamlandı", message: "Masa 3 siparişi tamamlandı.", read: false, created_at: minutesBefore(5) },
  { id: "ntf-3", store_id: "store-1", title: "Stok uyarısı", message: "Kola ürününde stok azaldı.", read: false, created_at: minutesBefore(35) },
];

export const REVENUE_TREND = [
  { date: "19 May", ciro: 18450, islem: 96 },
  { date: "20 May", ciro: 20120, islem: 102 },
  { date: "21 May", ciro: 16890, islem: 88 },
  { date: "22 May", ciro: 21760, islem: 110 },
  { date: "23 May", ciro: 25410, islem: 130 },
  { date: "24 May", ciro: 22230, islem: 118 },
  { date: "25 May", ciro: 24850, islem: 128 },
];

export const REVENUE_DISTRIBUTION = [
  { name: "Yiyecek", value: 42, color: "#2563eb" },
  { name: "İçecek", value: 28, color: "#22c55e" },
  { name: "Tatlı", value: 15, color: "#a855f7" },
  { name: "Diğer", value: 15, color: "#f97316" },
];

export const PAYMENT_METHOD_DISTRIBUTION = [
  { name: "Nakit", value: 45, color: "#3b82f6" },
  { name: "Kredi Kartı", value: 35, color: "#22c55e" },
  { name: "Dijital Cüzdan", value: 15, color: "#a855f7" },
  { name: "Diğer", value: 5, color: "#f97316" },
];

export function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Demo modunda (Supabase bağlı değilken) hangi slug girilirse girilsin
// aynı örnek mağaza verisi gösterilir; böylece onboarding akışı uçtan uca test edilebilir.
export function getStoreBySlug(slug: string): Store {
  return { ...MOCK_STORE, slug: slug || MOCK_STORE.slug };
}

export function getDashboardStats() {
  return {
    totalRevenueToday: 24850,
    revenueChangePct: 22.4,
    totalOrdersToday: 128,
    ordersChangePct: 18.6,
    avgOrderValue: 194.3,
    avgOrderChangePct: 5.1,
    satisfactionPct: 96.4,
    satisfactionChangePct: 2.3,
    occupiedTables: MOCK_TABLES.filter((t) => t.status === "dolu").length,
    totalTables: MOCK_TABLES.length,
  };
}
