-- AdisyonMatrix — Demo Veri (Lezzet Durağı)
-- KULLANIM:
-- 1) Supabase Dashboard > Authentication'da bir kullanıcı oluşturun (kendi giriş e-postanız).
-- 2) O kullanıcının UUID'sini (Authentication > Users tablosundan) kopyalayın.
-- 3) Aşağıdaki 'REPLACE_WITH_AUTH_USER_UUID' metnini bulup kendi UUID'niz ile değiştirin.
-- 4) Bu dosyayı SQL Editor'de çalıştırın.

do $$
declare
  v_owner uuid := 'REPLACE_WITH_AUTH_USER_UUID';
  v_store uuid;
  v_role_manager uuid;
  v_role_waiter uuid;
  v_role_chef uuid;
  v_role_cashier uuid;
  v_cat_burger uuid;
  v_cat_pizza uuid;
  v_cat_icecek uuid;
  v_cat_tatli uuid;
  v_prod_burger uuid;
  v_prod_pizza uuid;
  v_prod_cola uuid;
  v_tbl3 uuid;
  v_tbl12 uuid;
begin
  insert into public.stores (name, slug, owner_id, tax_number, description, business_type, phone, address, plan, ai_credits)
  values ('Lezzet Durağı', 'lezzet-duragi', v_owner, '1234567890', 'Şehrin merkezinde aile dostu restoran.', 'restoran', '0555 123 45 67', 'Bornova, İzmir', 'professional', 18240)
  returning id into v_store;

  insert into public.roles (store_id, role_name, category, permissions) values
    (v_store, 'Müdür', 'manager', '{"dashboard":true,"masalar":true,"siparisler":true,"mutfak":true,"urunler":true,"musteriler":true,"personel":true,"rezervasyonlar":true,"finans":true,"raporlar":true,"qr_yonetimi":true,"entegrasyonlar":true,"ayarlar":true}')
    returning id into v_role_manager;
  insert into public.roles (store_id, role_name, category, permissions) values
    (v_store, 'Garson', 'waiter', '{"dashboard":true,"masalar":true,"siparisler":true,"mutfak":false,"urunler":false,"musteriler":true,"personel":false,"rezervasyonlar":false,"finans":false,"raporlar":false,"qr_yonetimi":false,"entegrasyonlar":false,"ayarlar":false}')
    returning id into v_role_waiter;
  insert into public.roles (store_id, role_name, category, permissions) values
    (v_store, 'Aşçı', 'chef', '{"dashboard":true,"masalar":false,"siparisler":false,"mutfak":true,"urunler":true,"musteriler":false,"personel":false,"rezervasyonlar":false,"finans":false,"raporlar":false,"qr_yonetimi":false,"entegrasyonlar":false,"ayarlar":false}')
    returning id into v_role_chef;
  insert into public.roles (store_id, role_name, category, permissions) values
    (v_store, 'Kasiyer', 'cashier', '{"dashboard":true,"masalar":true,"siparisler":true,"mutfak":false,"urunler":false,"musteriler":false,"personel":false,"rezervasyonlar":false,"finans":true,"raporlar":false,"qr_yonetimi":false,"entegrasyonlar":false,"ayarlar":false}')
    returning id into v_role_cashier;

  insert into public.staff (store_id, user_id, full_name, email, phone, department, role_id, status, work_schedule, shift_start, shift_end, work_days_per_week, day_off, city, district, hired_at) values
    (v_store, v_owner, 'Ahmet Yılmaz', 'ahmetyilmaz@gmail.com', '0555 123 45 67', 'Yönetim', v_role_manager, 'approved', 'tam_zamanli', '09:00', '18:00', 6, 'Pazartesi', 'İzmir', 'Bornova', '2022-06-01'),
    (v_store, null, 'Ayşe Demir', 'aysedemir@gmail.com', '0532 987 65 43', 'Servis', v_role_waiter, 'approved', 'tam_zamanli', '10:00', '22:00', 6, 'Salı', 'İzmir', 'Bornova', '2023-02-15'),
    (v_store, null, 'Mehmet Kaya', 'mehmetkaya@hotmail.com', '0541 765 43 21', 'Mutfak', v_role_chef, 'approved', 'tam_zamanli', '08:00', '17:00', 6, 'Çarşamba', 'İzmir', 'Karşıyaka', '2022-11-20'),
    (v_store, null, 'Zeynep Bulut', 'zeynepbulut@gmail.com', '0553 222 33 44', 'Kasa', v_role_cashier, 'approved', 'tam_zamanli', '09:00', '18:00', 6, 'Pazartesi', 'İzmir', 'Bornova', '2023-03-18');

  insert into public.categories (store_id, name, description, icon, sort_order) values
    (v_store, 'Kahvaltılar', 'Güne lezzetli başlangıçlar', 'coffee', 1),
    (v_store, 'Başlangıçlar', 'İştah açıcı lezzetler', 'soup', 2),
    (v_store, 'Salatalar', 'Taze ve sağlıklı salatalar', 'salad', 3),
    (v_store, 'Çorbalar', 'Günün çorbaları', 'soup', 4),
    (v_store, 'Ana Yemekler', 'Lezzetli ana yemekler', 'utensils', 5),
    (v_store, 'Burgerler', 'Özel burger çeşitleri', 'beef', 6) returning id into v_cat_burger;
  insert into public.categories (store_id, name, description, icon, sort_order) values
    (v_store, 'Makarnalar', 'Çeşitli makarna lezzetleri', 'utensils-crossed', 7),
    (v_store, 'Pizzalar', 'Taş fırın pizza çeşitleri', 'pizza', 8) returning id into v_cat_pizza;
  insert into public.categories (store_id, name, description, icon, sort_order) values
    (v_store, 'Tatlılar', 'Tatlı ve şerbetli lezzetler', 'cake', 9) returning id into v_cat_tatli;
  insert into public.categories (store_id, name, description, icon, sort_order) values
    (v_store, 'İçecekler', 'Sıcak ve soğuk içecekler', 'cup-soda', 10) returning id into v_cat_icecek;
  insert into public.categories (store_id, name, description, icon, sort_order) values
    (v_store, 'Sıcak İçecekler', 'Kahve ve bitki çayları', 'coffee', 11),
    (v_store, 'Ekstralar', 'Ekstra malzemeler', 'plus-circle', 12);

  insert into public.products (store_id, category_id, name, description, price, is_available, stock, track_stock, sold_count) values
    (v_store, v_cat_burger, 'Adisyon Burger', 'Özel soslu, 200gr dana köfte, cheddar peynir', 240, true, 45, true, 312) returning id into v_prod_burger;
  insert into public.products (store_id, category_id, name, description, price, is_available, stock, track_stock, sold_count) values
    (v_store, v_cat_pizza, 'Karışık Pizza', 'Sucuk, salam, mantar, biber, mısır', 280, true, 18, true, 267) returning id into v_prod_pizza;
  insert into public.products (store_id, category_id, name, description, price, is_available, stock, track_stock, sold_count) values
    (v_store, v_cat_icecek, 'Coca Cola', '330 ml kutu', 60, true, 120, true, 421) returning id into v_prod_cola;
  insert into public.products (store_id, category_id, name, description, price, is_available, stock, track_stock, sold_count) values
    (v_store, v_cat_tatli, 'Cheesecake', 'Frambuazlı', 120, true, 22, true, 156);

  insert into public.tables (store_id, table_number, zone, capacity, status) values
    (v_store, '1', 'İç Salon', 4, 'boş'),
    (v_store, '2', 'İç Salon', 4, 'boş'),
    (v_store, '3', 'İç Salon', 4, 'dolu') returning id into v_tbl3;
  insert into public.tables (store_id, table_number, zone, capacity, status) values
    (v_store, '4', 'İç Salon', 4, 'dolu'),
    (v_store, '5', 'İç Salon', 4, 'boş'),
    (v_store, '6', 'İç Salon', 6, 'rezerve'),
    (v_store, '7', 'İç Salon', 4, 'boş'),
    (v_store, '8', 'İç Salon', 4, 'boş'),
    (v_store, '9', 'İç Salon', 6, 'rezerve'),
    (v_store, '10', 'İç Salon', 4, 'boş'),
    (v_store, '11', 'Teras', 4, 'boş'),
    (v_store, '12', 'Teras', 4, 'dolu') returning id into v_tbl12;
  insert into public.tables (store_id, table_number, zone, capacity, status) values
    (v_store, '13', 'Teras', 4, 'boş'),
    (v_store, '14', 'Teras', 4, 'dolu'),
    (v_store, '15', 'VIP Salon', 6, 'rezerve'),
    (v_store, '16', 'Bahçe', 4, 'boş'),
    (v_store, '17', 'VIP Salon', 6, 'temizlikte');

  insert into public.orders (store_id, table_id, status, subtotal, discount, tax, total_amount, note) values
    (v_store, v_tbl3, 'preparing', 790, 39.5, 75.05, 825.55, 'Doğum günü kutlaması var.')
  returning id into v_prod_burger; -- reuse var slot for order id

  insert into public.order_items (order_id, product_id, product_name, quantity, unit_price) values
    (v_prod_burger, v_prod_burger, 'Adisyon Burger', 2, 240),
    (v_prod_burger, v_prod_cola, 'Coca Cola', 2, 60),
    (v_prod_burger, v_prod_pizza, 'Karışık Pizza', 1, 280);

  insert into public.customers (store_id, full_name, email, phone, city, district, "group", total_spent, total_orders) values
    (v_store, 'Ahmet Yılmaz', 'ahmetyilmaz@gmail.com', '0555 123 45 67', 'İzmir', 'Bornova', 'sadik', 15750, 32),
    (v_store, 'Ayşe Demir', 'aysedemir@gmail.com', '0532 987 65 43', 'İzmir', 'Konak', 'sadik', 12480, 28),
    (v_store, 'Mehmet Kaya', 'mehmetkaya@hotmail.com', '0541 765 43 21', 'İzmir', 'Karşıyaka', 'normal', 5630, 12);

  insert into public.finance_transactions (store_id, type, description, register, payment_method, amount) values
    (v_store, 'gelir', 'Masa 3 - Adisyon #1258', 'Ana Kasa', 'nakit', 1250),
    (v_store, 'gelir', 'Masa 12 - Adisyon #1257', 'Ana Kasa', 'kredi_karti', 2350),
    (v_store, 'gider', 'Market alışverişi', 'Ana Kasa', 'nakit', 1450);

  raise notice 'Demo veri başarıyla eklendi. store_id = %', v_store;
end $$;
