-- AdisyonMatrix — Alt kategori desteği + Realtime yayını
alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete cascade;

create index if not exists idx_categories_parent on public.categories(parent_id);

-- Realtime: mağaza içi canlı güncellemeler için ilgili tabloları yayına ekle.
do $$
declare
  t text;
begin
  foreach t in array array[
    'stores','roles','staff','tables','categories','products','customers',
    'orders','order_items','order_error_reports','reservations',
    'finance_transactions','notifications'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
