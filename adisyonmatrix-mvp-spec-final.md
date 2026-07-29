# AdisyonMatrix — AI MVP Geliştirme ve Mimari Dokümanı (Nihai ve Kapsamlı Versiyon)

## 1. Proje Genel Bakış ve Amaç
**AdisyonMatrix**, restoranlar, kafeler ve yeme-içme işletmeleri için geliştirilen, QR kod tabanlı, bulut tabanlı bir dijital menü, sipariş, adisyon, akıllı rol yönetimi ve işletme yönetim sistemidir. 
Bu doküman; yapay zeka destekli kod üretme araçlarının (v0, Lovable, Bolt, Cursor vb.) projeyi tek seferde ve hatasız bir şekilde inşa edebilmesi için gerekli olan tüm teknik detayları, veritabanı şemalarını, rota yapılarını ve UI/UX kurallarını içerir.

---

## 2. Teknoloji Yığını ve Altyapı
- **Frontend / Full-stack Çatı:** Next.js (App Router, TypeScript) — *Responsive web mimarisi, ilerleyen aşamada Capacitor/Tauri veya benzeri araçlarla sahibe özel mobil uygulamaya dönüştürülebilir.*
- **Veritabanı & Backend:** Supabase (PostgreSQL, Row Level Security - RLS, Realtime Subscriptions)
- **Stil / UI:** Tailwind CSS, Lucide React (ikonlar), Framer Motion (akıcı geçişler), Recharts (Borsa tarzı dalgalanan finansal grafikler)
- **Ödeme Altyapısı (MVP Kapsamı):** Fiziki POS / Masada Nakit/Kart seçeneği (Sanal POS v2 kapsamındadır).

---

## 3. Veritabanı Şeması (Supabase / PostgreSQL)

### 3.1. `stores` (Mağazalar)
- `id` (UUID, Primary Key)
- `name` (Text) — Restoran adı
- `slug` (Text, Unique) — URL uzantısı (`adisyonmatrix.com/magaza-adi`)
- `owner_id` (UUID, Foreign Key -> `auth.users.id`)
- `tax_number` (Text) — Vergi Kimlik Numarası (Kayıt esnasında zorunlu)
- `description` (Text) — Mağaza türü ve genel tanımı
- `created_at` (Timestamp)

### 3.2. `roles` ve `permissions` (Dinamik Rol Yönetim Sistemi)
- `id` (UUID, Primary Key)
- `store_id` (UUID, Foreign Key -> `stores.id`)
- `role_name` (Text) — Örn: `Garson`, `Aşçı`, `Kasiyer`, `Mali Müşavir` veya özel isimler
- `category` (Text) — Hazır kategoriler (`waiter`, `chef`, `cashier`, `accountant`, `custom`)
- `permissions` (JSONB) — İlgili rolün paneldeki yetki matrisi

### 3.3. `staff` (Personel / Kullanıcı Atamaları)
- `id` (UUID, Primary Key)
- `store_id` (UUID, Foreign Key -> `stores.id`)
- `user_id` (UUID)
- `role_id` (UUID, Foreign Key -> `roles.id`)
- `status` (Text) — `pending` (Onay Bekliyor), `approved` (Onaylandı)

### 3.4. `tables` (Masalar)
- `id` (UUID, Primary Key)
- `store_id` (UUID, Foreign Key -> `stores.id`)
- `table_number` (Text) — Örn: "A1", "B2"
- `qr_code_url` (Text)
- `qr_customization` (JSONB) — Renk, logo ve çerçeve tasarımı

### 3.5. `categories` (Menü Kategorileri)
- `id` (UUID, Primary Key)
- `store_id` (UUID, Foreign Key -> `stores.id`)
- `name` (Text)

### 3.6. `products` (Menü Ürünleri ve Çift Görsel / AI Sistemi)
- `id` (UUID, Primary Key)
- `store_id` (UUID, Foreign Key -> `stores.id`)
- `category_id` (UUID, Foreign Key -> `categories.id`)
- `name` (Text)
- `description` (Text)
- `price` (Decimal)
- `real_image_url` (Text) — Mağaza sahibinin yüklemek zorunda olduğu **gerçek ürün fotoğrafı** (Yapay zeka güvenlik taramasından geçer).
- `ai_image_url` (Text, Nullable) — Gerçek fotoğraftan esinlenerek kredi sistemiyle üretilen estetik AI görseli.
- `variants` (JSONB) — Ürün varyantları (Örn: Boyut, acılık, ekstra malzeme seçimleri).
- `is_available` (Boolean) — Stokta var/yok durumu.

### 3.7. `orders` (Siparişler)
- `id` (UUID, Primary Key)
- `store_id` (UUID, Foreign Key -> `stores.id`)
- `table_id` (UUID, Foreign Key -> `tables.id`)
- `customer_id` (UUID, Nullable) — Daimi müşteri hesabı varsa
- `status` (Text) — `pending`, `preparing`, `ready`, `delivered`, `completed`, `cancelled`
- `cancellation_reason` (Text, Nullable) — Hata bildir kategorilerinden seçilen sebep
- `payment_method` (Text) — `physical_pos`
- `total_amount` (Decimal)
- `created_at` (Timestamp)

### 3.8. `order_items` (Sipariş Kalemleri)
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key -> `orders.id`)
- `product_id` (UUID, Foreign Key -> `products.id`)
- `quantity` (Integer)
- `unit_price` (Decimal)
- `selected_variants` (JSONB) — Müşterinin seçtiği varyantlar

---

## 4. Kritik İş Akışları ve Kurallar

### 4.1. Kayıt, Giriş ve Mağaza Tanımlama
- Kullanıcılar e-posta, telefon veya **Google OAuth** ile giriş yapar.
- İlk girişte doğrudan hesap oluşmaz; sistem **Mağaza Tanımlama Ekranına** yönlendirir (Vergi Kimlik Numarası, Restoran Adı ve Türü zorunludur).

### 4.2. Dinamik Rol Oluşturma Motoru
- Sahip panelinde **"Rol Ekle"** butonu yer alır.
- Hazır kategoriler: `Garson`, `Aşçı`, `Kasiyer`, `Mali Müşavir`.
- Eğer listede olmayan bir rol gerekiyorsa, **"Bilinmeyen Kategori / Diğer"** seçilerek özel rol adı verilir ve detaylı izinleri (Yetki matrisi) tanımlanır.

### 4.3. Müşteri Deneyimi (Esnek Üyelik ve Hata Bildirimi)
- Müşteri QR kodu okutarak menüye erişir. Alışveriş için üyelik zorunlu değildir (misafir modu). Ancak daimi müşteri olmak isteyenler kayıt olup giriş yapabilir.
- Müşteri sepete eklerken ürün varyantlarını kendisi seçer.
- Siparişte hata olursa **"Hata Bildir"** butonu üzerinden kategorize edilmiş nedenlerden birini seçerek anında iptal/düzeltme talebi oluşturabilir.

### 4.4. Ürün Fotoğraf Güvenliği (Gerçek vs AI Görsel)
- Ürün eklenirken **gerçek fotoğraf yüklenmesi zorunludur**.
- Sistemdeki AI güvenlik filtresi fotoğrafı kontrol eder; sahte/görsel dışı yüklemelerde anında uyarı, ban veya cezai işlem uygulanır.
- Gerçek fotoğrafa dayanarak kredi sistemiyle yapay zeka görseli üretilebilir (Kredi altyapısı ilerleyen aşamada entegre edilecektir).

### 4.5. Sahip Paneli, Borsa Grafikleri ve Excel Raporlama
- **Borsa Tarzı Grafikler:** Ciro ve satış trendleri zaman ekseninde yukarı/aşağı dalgalanan profesyonel çizgi grafiklerle (Recharts) gösterilir.
- **Detaylı Kırılımlar:** Hangi masadan ne kadar ciro geldiği, en çok satan ürünler ve personel bazlı metrikler incelenir.
- **Excel Dışa Aktarımı:** Tüm finansal ve sipariş verileri tek tıkla Excel formatına indirilebilir.
