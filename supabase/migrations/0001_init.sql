-- AdisyonMatrix — Başlangıç Şeması
-- Bu dosyayı Supabase SQL Editor'de veya `supabase db push` ile çalıştırın.

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. STORES
-- =========================================================
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  tax_number text not null,
  description text,
  business_type text not null default 'restoran',
  phone text,
  address text,
  logo_url text,
  primary_color text not null default '#1d4ed8',
  plan text not null default 'starter' check (plan in ('starter','professional','business','enterprise')),
  ai_credits integer not null default 5000,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 2. ROLES & PERMISSIONS
-- =========================================================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  role_name text not null,
  category text not null default 'custom' check (category in ('waiter','chef','cashier','accountant','manager','custom')),
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 3. STAFF
-- =========================================================
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  department text,
  role_id uuid references public.roles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','passive','izinli')),
  work_schedule text not null default 'tam_zamanli' check (work_schedule in ('tam_zamanli','yari_zamanli')),
  shift_start time,
  shift_end time,
  work_days_per_week int,
  day_off text,
  city text,
  district text,
  hired_at date not null default current_date
);

-- =========================================================
-- 4. TABLES (Masalar)
-- =========================================================
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  table_number text not null,
  zone text not null default 'İç Salon',
  capacity int not null default 4,
  status text not null default 'boş' check (status in ('boş','dolu','rezerve','temizlikte')),
  pos_x int not null default 0,
  pos_y int not null default 0,
  qr_code_url text,
  qr_customization jsonb default '{"color":"#1d4ed8","logo":true,"frame":"rounded"}'::jsonb,
  note text,
  waiter_id uuid references public.staff(id) on delete set null,
  opened_at timestamptz,
  unique (store_id, table_number)
);

-- =========================================================
-- 5. CATEGORIES
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text,
  icon text default 'utensils',
  sort_order int not null default 0,
  status text not null default 'aktif' check (status in ('aktif','pasif'))
);

-- =========================================================
-- 6. PRODUCTS
-- =========================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  real_image_url text,
  ai_image_url text,
  variants jsonb not null default '[]'::jsonb,
  is_available boolean not null default true,
  stock int,
  track_stock boolean not null default false,
  sold_count int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 7. CUSTOMERS
-- =========================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text not null,
  city text,
  district text,
  "group" text not null default 'yeni' check ("group" in ('yeni','normal','sadik')),
  status text not null default 'aktif' check (status in ('aktif','pasif')),
  total_spent numeric(10,2) not null default 0,
  total_orders int not null default 0,
  first_order_at timestamptz,
  last_order_at timestamptz,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 8. ORDERS & ORDER_ITEMS
-- =========================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  table_id uuid references public.tables(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  waiter_id uuid references public.staff(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','preparing','ready','delivered','completed','cancelled')),
  cancellation_reason text,
  payment_method text check (payment_method in ('physical_pos','nakit','kredi_karti')),
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  selected_variants jsonb not null default '{}'::jsonb,
  note text
);

-- =========================================================
-- 9. ORDER ERROR REPORTS ("Hata Bildir")
-- =========================================================
create table if not exists public.order_error_reports (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  reason text not null,
  detail text,
  status text not null default 'açık' check (status in ('açık','inceleniyor','çözüldü')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 10. RESERVATIONS
-- =========================================================
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  code text not null,
  customer_name text not null,
  customer_phone text not null,
  date date not null,
  time time not null,
  guest_count int not null default 2,
  zone text,
  table_id uuid references public.tables(id) on delete set null,
  status text not null default 'bekliyor' check (status in ('onaylandı','bekliyor','iptal edildi')),
  prepayment numeric(10,2) not null default 0,
  note text,
  source text not null default 'telefon' check (source in ('telefon','web','instagram','diğer')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 11. FINANCE TRANSACTIONS
-- =========================================================
create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  type text not null check (type in ('gelir','gider')),
  description text not null,
  register text not null default 'Ana Kasa',
  payment_method text not null default 'nakit' check (payment_method in ('nakit','kredi_karti','yemek_karti','dijital_cuzdan','diğer')),
  amount numeric(10,2) not null default 0,
  status text not null default 'tamamlandı' check (status in ('tamamlandı','bekliyor','iptal')),
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 12. NOTIFICATIONS
-- =========================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_roles_store on public.roles(store_id);
create index if not exists idx_staff_store on public.staff(store_id);
create index if not exists idx_tables_store on public.tables(store_id);
create index if not exists idx_categories_store on public.categories(store_id);
create index if not exists idx_products_store on public.products(store_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_customers_store on public.customers(store_id);
create index if not exists idx_orders_store on public.orders(store_id);
create index if not exists idx_orders_table on public.orders(table_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_reservations_store on public.reservations(store_id);
create index if not exists idx_finance_store on public.finance_transactions(store_id);
create index if not exists idx_notifications_store on public.notifications(store_id);

-- =========================================================
-- HELPER: kullanıcı bu mağazanın onaylı personeli/sahibi mi?
-- =========================================================
create or replace function public.is_store_member(target_store_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.stores s
    where s.id = target_store_id and s.owner_id = auth.uid()
  ) or exists (
    select 1 from public.staff st
    where st.store_id = target_store_id and st.user_id = auth.uid() and st.status = 'approved'
  );
$$;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.stores enable row level security;
alter table public.roles enable row level security;
alter table public.staff enable row level security;
alter table public.tables enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_error_reports enable row level security;
alter table public.reservations enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.notifications enable row level security;

-- Stores: sahibi yönetir, herkes slug ile tekil mağazayı public menü için okuyabilir
create policy "stores_select_public" on public.stores for select using (true);
create policy "stores_insert_owner" on public.stores for insert with check (owner_id = auth.uid());
create policy "stores_update_owner" on public.stores for update using (owner_id = auth.uid());
create policy "stores_delete_owner" on public.stores for delete using (owner_id = auth.uid());

-- Roles / Staff: sadece mağaza üyeleri
create policy "roles_all_members" on public.roles for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "staff_all_members" on public.staff for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));

-- Tables: üyeler tam erişim, herkes public menü için okuyabilir
create policy "tables_select_public" on public.tables for select using (true);
create policy "tables_write_members" on public.tables for insert with check (public.is_store_member(store_id));
create policy "tables_update_members" on public.tables for update using (public.is_store_member(store_id));
create policy "tables_delete_members" on public.tables for delete using (public.is_store_member(store_id));

-- Categories / Products: herkes public menü için okuyabilir, üyeler yazabilir
create policy "categories_select_public" on public.categories for select using (true);
create policy "categories_write_members" on public.categories for insert with check (public.is_store_member(store_id));
create policy "categories_update_members" on public.categories for update using (public.is_store_member(store_id));
create policy "categories_delete_members" on public.categories for delete using (public.is_store_member(store_id));

create policy "products_select_public" on public.products for select using (true);
create policy "products_write_members" on public.products for insert with check (public.is_store_member(store_id));
create policy "products_update_members" on public.products for update using (public.is_store_member(store_id));
create policy "products_delete_members" on public.products for delete using (public.is_store_member(store_id));

-- Customers: üyeler tam erişim; misafir müşteri kendi profilini görebilir/güncelleyebilir
create policy "customers_members" on public.customers for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "customers_self" on public.customers for select using (user_id = auth.uid());

-- Orders / Order items: üyeler tam erişim; herkes sipariş oluşturabilir (misafir QR sipariş)
create policy "orders_members_all" on public.orders for select using (public.is_store_member(store_id));
create policy "orders_members_update" on public.orders for update using (public.is_store_member(store_id));
create policy "orders_members_delete" on public.orders for delete using (public.is_store_member(store_id));
create policy "orders_public_insert" on public.orders for insert with check (true);

create policy "order_items_select" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and public.is_store_member(o.store_id))
);
create policy "order_items_public_insert" on public.order_items for insert with check (true);
create policy "order_items_members_update" on public.order_items for update using (
  exists (select 1 from public.orders o where o.id = order_id and public.is_store_member(o.store_id))
);
create policy "order_items_members_delete" on public.order_items for delete using (
  exists (select 1 from public.orders o where o.id = order_id and public.is_store_member(o.store_id))
);

create policy "error_reports_members_select" on public.order_error_reports for select using (public.is_store_member(store_id));
create policy "error_reports_public_insert" on public.order_error_reports for insert with check (true);
create policy "error_reports_members_update" on public.order_error_reports for update using (public.is_store_member(store_id));

-- Reservations / Finance / Notifications: sadece üyeler
create policy "reservations_members" on public.reservations for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "finance_members" on public.finance_transactions for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "notifications_members" on public.notifications for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('store-branding', 'store-branding', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_auth_write" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "product_images_auth_update" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "product_images_auth_delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images');

create policy "store_branding_public_read" on storage.objects for select using (bucket_id = 'store-branding');
create policy "store_branding_auth_write" on storage.objects for insert to authenticated with check (bucket_id = 'store-branding');
create policy "store_branding_auth_update" on storage.objects for update to authenticated using (bucket_id = 'store-branding');
