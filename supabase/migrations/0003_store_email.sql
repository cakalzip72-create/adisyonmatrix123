-- AdisyonMatrix — İşletme e-postası
alter table public.stores
  add column if not exists email text;
