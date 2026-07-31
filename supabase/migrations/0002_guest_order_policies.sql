-- QR menüden misafir (anonim) sipariş akışı için gereken RLS politikaları.
--
-- Bu politikalar 0001_init.sql içinde zaten tanımlıdır. Ancak o script'in
-- kısmen uygulandığı kurulumlarda sipariş gönderimi şu hatayla düşer:
--   new row violates row-level security policy for table "orders"
-- Aşağıdaki blok idempotenttir: eksikse oluşturur, varsa aynı haliyle
-- yeniden kurar. Tekrar tekrar çalıştırmak güvenlidir.

drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert" on public.orders
  for insert with check (true);

drop policy if exists "order_items_public_insert" on public.order_items;
create policy "order_items_public_insert" on public.order_items
  for insert with check (true);

drop policy if exists "error_reports_public_insert" on public.order_error_reports;
create policy "error_reports_public_insert" on public.order_error_reports
  for insert with check (true);

-- Doğrulama: aşağıdaki sorgu üç satır döndürmeli.
-- select tablename, policyname, cmd from pg_policies
--  where schemaname = 'public'
--    and policyname in ('orders_public_insert',
--                       'order_items_public_insert',
--                       'error_reports_public_insert');
