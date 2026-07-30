# AdisyonMatrix

QR kod tabanlı, bulut tabanlı dijital menü / sipariş / adisyon / rol yönetimi SaaS platformu. Tam spesifikasyon için [adisyonmatrix-mvp-spec-final.md](./adisyonmatrix-mvp-spec-final.md) dosyasına bakın.

## Teknoloji Yığını

- **Next.js 16** (App Router, TypeScript) + Tailwind CSS 4
- **Supabase** (PostgreSQL, Auth, Row Level Security, Realtime, Storage)
- Lucide React (ikon), Framer Motion (geçiş), Recharts (grafik)
- `qrcode` (QR üretimi), `xlsx` (Excel dışa aktarım), `react-hook-form` + `zod`

## Kurulum

```bash
npm install
cp .env.local.example .env.local
```

### Şu an demo modunda

`.env.local` dosyasını boş bırakırsanız uygulama **demo modunda** çalışır: tüm veriler `lib/mock/data.ts` içindeki örnek "Lezzet Durağı" verisinden gelir, hiçbir gerçek hesap oluşturulmaz ama tüm ekranlar (landing → kayıt/giriş → kurulum sihirbazı → yönetim paneli → müşteri QR menüsü) uçtan uca gezilebilir ve etkileşimlidir.

### Bağlı proje (bu repo)

Bu projede `.env.local` gerçek bir Supabase projesine ve Gemini API'ye bağlıdır:
- **Auth (e-posta/şifre + Google)** gerçek çalışır — e-posta onayı zorunlu (Supabase ayarı).
- **Onboarding sihirbazı** artık gerçek `stores`/`roles`/`staff`/`categories`/`products`/`tables` satırları oluşturur — **ama önce `supabase/migrations/0001_init.sql` dosyasının o projede çalıştırılmış olması gerekir**, aksi halde "Kurulumu Bitir" adımı tablo bulunamadı hatası verir.
- **Ürün fotoğrafı güvenlik taraması** (`Ürünler → Yeni Ürün Ekle`) gerçek Gemini (`gemini-flash-latest`) ile çalışır.
- **AI Görsel Oluştur** hâlâ stub'dır: bu Google hesabında görsel üretim modelleri (`gemini-*-image`) için ücretsiz kota kapalı (faturalandırma gerekiyor), gerçek üretim istenirse ilgili Google Cloud projesinde billing etkinleştirilmeli.
- Dashboard modülleri (Masalar, Siparişler, Müşteriler vb.) hâlâ mock veriyle çalışıyor — canlıya geçmek için ayrı bir veri katmanı migrasyonu gerekir.

```bash
npm run dev
```

### Gerçek Supabase'e bağlama

1. [supabase.com](https://supabase.com) üzerinde bir proje oluşturun.
2. `supabase/migrations/0001_init.sql` dosyasını Supabase SQL Editor'de çalıştırın (tüm tablolar, RLS politikaları ve storage bucket'larını kurar).
3. İsteğe bağlı: bir kullanıcı oluşturup `supabase/seed.sql` içindeki `REPLACE_WITH_AUTH_USER_UUID` değerini o kullanıcının UUID'si ile değiştirip çalıştırarak demo veri yükleyin.
4. Proje ayarlarından **Settings → API** altındaki `Project URL` ve `anon public` key'i `.env.local` dosyasına girin:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
5. Google ile giriş/kayıt için Supabase Dashboard → Authentication → Providers → Google'ı ayrıca etkinleştirmeniz gerekir.
6. Sunucuyu yeniden başlatın (`npm run dev`).

> Not: Bu ilk sürümde tüm arayüz Supabase şemasına birebir uyacak şekilde tasarlanmış olsa da, sayfalar hâlâ `lib/mock/data.ts`'teki örnek verilerle çalışıyor. Gerçek Supabase sorgularına geçiş için her modüldeki `MOCK_*` importlarının `lib/supabase/client|server` üzerinden yapılan sorgularla değiştirilmesi gerekir — şema ve RLS politikaları bunun için hazır.

## Proje Yapısı

```
app/
  page.tsx                          Landing page
  (auth)/login, /signup             Giriş / Kayıt (tek ekranda iki form)
  onboarding/store|plan|roles|seed  4 adımlı kurulum sihirbazı
  [storeSlug]/                      Yönetim paneli (sidebar + topbar)
    dashboard, masalar, siparisler, mutfak, urunler, kategoriler,
    ekstralar, musteriler, personel, rezervasyonlar, finans,
    raporlar, qr-yonetimi, entegrasyonlar, ayarlar
  menu/[storeSlug]/[tableId]        Müşteri QR menü + sepet + sipariş
lib/
  supabase/client.ts, server.ts     Supabase istemcileri
  types.ts                          Alan (domain) tipleri — DB şemasıyla birebir
  permissions.ts                    Rol/yetki motoru
  mock/data.ts                      Demo veri (Supabase bağlanana kadar)
  store-context.tsx                 Aktif mağaza + personel + yetki context'i
  xlsx-export.ts                    Excel dışa aktarım yardımcı fonksiyonu
components/
  ui/                               Tasarım sistemi (Button, Card, Modal, Tabs, grafikler...)
  landing/, auth/, onboarding/, dashboard/, products/, personnel/, reservations/, qr/
supabase/
  migrations/0001_init.sql          Tam şema + RLS + storage bucket'ları
  seed.sql                          Demo veri script'i
```

## Rol / Yetki Sistemi

`roles.permissions` (JSONB) her modül için `true/false` tutar. Hazır şablonlar: Yönetici, Garson, Aşçı, Kasiyer, Mali Müşavir. Personel sayfasındaki **Roller** butonundan "Bilinmeyen Kategori / Diğer" ile özel rol ve yetki matrisi tanımlanabilir (spec 4.2). Sidebar ve sayfa erişimi bu matrise göre otomatik filtrelenir (`lib/permissions.ts`, `components/dashboard/DashboardShell.tsx`).

Demo modunda sağ üstteki kullanıcı menüsünden "rol değiştir" ile farklı personel/rollerle panel nasıl göründüğünü test edebilirsiniz.

## AI Görsel Üretimi / Fotoğraf Güvenliği

Ürün ekleme modalında (`components/products/ProductFormModal.tsx`) gerçek fotoğraf yükleme zorunlu, sahte bir "güvenlik taraması" animasyonu ve kredi düşen bir "AI Görsel Oluştur" butonu bulunur. Bunlar **stub**'dır — gerçek bir görsel üretim / içerik güvenliği modeli bağlanmamıştır; ileride bu buton gerçek bir API çağrısıyla değiştirilebilir.

## Derleme Çıktısı

`npm run build` çıktısı `.next/` klasörüne yazılır. Uygulama bir Node.js sunucusu üzerinde çalışır (`npm start`, Netlify, Vercel, Docker vb.).

> Kök dizindeki eski `dist/` klasörü, `distDir: "dist"` ayarının denendiği bir dönemden kalmadır ve artık kullanılmıyor. Güvenle silinebilir (`.gitignore`'da zaten var).

### Netlify'a yayınlama

**`dist/` (veya `.next/`) klasörünü Netlify'a sürükle-bırak ile yüklemeyin.** Bu klasör statik bir site değil, Next.js'in sunucu derleme çıktısıdır: kökünde `index.html` yoktur (`BUILD_ID`, `server/`, `static/`, `routes-manifest.json` içerir), bu yüzden Netlify her adreste **"Page not found"** döndürür. Ayrıca 27 rotanın 19'u `ƒ` (istek anında sunucuda render edilen) rotadır — statik dosya sunucusu bunları çalıştıramaz.

Doğru yöntem, Netlify'ın derlemeyi kendisinin yapmasıdır. Kök dizindeki [`netlify.toml`](./netlify.toml) bunu ayarlar:

1. Netlify → **Add new site → Import an existing project** ile bu Git deposunu bağlayın (sürükle-bırak değil).
2. Build ayarları `netlify.toml`'dan okunur: komut `npm run build`, publish dizini `.next`, Node 22, `@netlify/plugin-nextjs` eklentisi. Eklentiyi Netlify otomatik kurar.
3. **Site configuration → Environment variables** altına `.env.local.example` içindeki değişkenleri girin:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SITE_URL` (Netlify adresiniz). `.env.local` dosyası depoya girmediği için bunlar girilmezse uygulama demo moduna düşer.
4. Google ile giriş kullanılacaksa Supabase → Authentication → URL Configuration içindeki redirect URL listesine `https://<site>.netlify.app/auth/callback` adresini ekleyin.

Git bağlamak yerine yerelden yayınlamak isterseniz, yine klasör yüklemesi değil Netlify CLI kullanın — derleme ve Function paketleme adımlarını o çalıştırır:

```bash
npx netlify deploy --build --prod
```

### Neden statik export değil?

**Tam statik export (`output: "export"`) bu projede kullanılamaz.** Denendiğinde derleme şu hatayla durur:

```
Error: Page "/[storeSlug]/musteriler" is missing "generateStaticParams()"
so it cannot be used with "output: export" config.
```

Next.js'in statik export'ta desteklemediği ve bu projede aktif olarak kullanılan özellikler:

| Özellik | Projedeki kullanım |
| --- | --- |
| Dinamik rotalar (`generateStaticParams` olmadan) | 13 panel sayfası `app/[storeSlug]/*` + `app/menu/[storeSlug]/[tableId]` |
| Route Handler (Request kullanan) | `app/api/photo-check/route.ts` (Gemini fotoğraf taraması), `app/auth/callback/route.ts` |
| `cookies()` | `lib/supabase/server.ts` (oturum yönetimi) |
| Proxy (eski adıyla middleware) | `proxy.ts` (Supabase oturum yenileme) |

Statik export'a geçmek için bu dört özelliğin de kaldırılması gerekir; bu durumda giriş/oturum, panel ve QR sipariş akışı çalışmaz. Ayrıca mağaza slug'ları kullanıcılar kayıt oldukça oluştuğundan, derleme anında bilinemez — yeni kaydolan her işletme siteyi yeniden derleyip yayınlayana kadar 404 alır.

## Bilinen Sınırlamalar

- Gerçek ödeme altyapısı yok (MVP kapsamı: fiziki POS/nakit-kart kaydı).
- Google OAuth, Supabase tarafında provider etkinleştirmesi gerektirir.
- Mutfak Ekranı, QR Yönetimi, Entegrasyonlar, Ayarlar sayfaları için tasarım referans görseli verilmediğinden mevcut tasarım diliyle tutarlı olacak şekilde tasarlanmıştır.
