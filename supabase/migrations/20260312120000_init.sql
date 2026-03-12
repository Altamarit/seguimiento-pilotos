-- =========================================================
-- 1. Extensiones
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- 2. Enums
-- =========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('lector', 'editor', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'pilot_status') then
    create type public.pilot_status as enum (
      'planificado',
      'en_marcha',
      'finalizado',
      'cancelado'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'impact_event_type') then
    create type public.impact_event_type as enum (
      'formacion',
      'productividad',
      'otro'
    );
  end if;
end
$$;

-- =========================================================
-- 3. Funciones auxiliares
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- =========================================================
-- 4. Tabla de perfiles
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- 5. Tabla de roles
-- =========================================================
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'lector',
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- 6. Tabla de pilotos
-- =========================================================
create table if not exists public.pilots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  objective text,
  status public.pilot_status not null default 'planificado',
  start_date date,
  end_date date,
  trained_people_count integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint pilots_name_not_blank check (btrim(name) <> ''),
  constraint pilots_dates_valid check (
    end_date is null or start_date is null or end_date >= start_date
  ),
  constraint pilots_trained_people_non_negative check (
    trained_people_count >= 0
  )
);

comment on column public.pilots.trained_people_count is
'Dato manual a nivel piloto. No se recalcula automaticamente desde eventos.';

-- =========================================================
-- 7. Tabla de eventos de impacto
-- =========================================================
create table if not exists public.impact_events (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.pilots (id) on delete cascade,
  event_type public.impact_event_type not null,
  event_date date not null,
  description text not null,
  trained_people_event integer,
  productivity_improvement_pct numeric(5,2),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint impact_events_description_not_blank check (btrim(description) <> ''),
  constraint impact_events_trained_people_non_negative check (
    trained_people_event is null or trained_people_event >= 0
  ),
  constraint impact_events_productivity_range check (
    productivity_improvement_pct is null
    or productivity_improvement_pct between -100.00 and 999.99
  ),
  constraint impact_events_value_by_type check (
    (
      event_type = 'formacion'
      and trained_people_event is not null
      and productivity_improvement_pct is null
    )
    or (
      event_type = 'productividad'
      and productivity_improvement_pct is not null
      and trained_people_event is null
    )
    or (
      event_type = 'otro'
      and trained_people_event is null
      and productivity_improvement_pct is null
    )
  )
);

comment on column public.impact_events.trained_people_event is
'Numero de personas formadas en ese evento concreto. Es informativo y no recalcula automaticamente el total del piloto.';

comment on column public.impact_events.productivity_improvement_pct is
'Porcentaje de mejora de productividad informado en el evento. El KPI del piloto usa el ultimo valor registrado.';

-- =========================================================
-- 8. Funciones dependientes de tablas
-- =========================================================
create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ur.role
      from public.user_roles ur
      where ur.user_id = auth.uid()
    ),
    'lector'::public.app_role
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email;

  insert into public.user_roles (
    user_id,
    role
  )
  values (
    new.id,
    'lector'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- =========================================================
-- 9. Indices
-- =========================================================
create index if not exists idx_user_roles_role
  on public.user_roles (role);

create index if not exists idx_pilots_status
  on public.pilots (status);

create index if not exists idx_pilots_start_date
  on public.pilots (start_date);

create index if not exists idx_pilots_end_date
  on public.pilots (end_date);

create index if not exists idx_impact_events_pilot_id
  on public.impact_events (pilot_id);

create index if not exists idx_impact_events_pilot_date
  on public.impact_events (pilot_id, event_date desc);

create index if not exists idx_impact_events_type
  on public.impact_events (event_type);

-- =========================================================
-- 10. Triggers de updated_at
-- =========================================================
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_roles_updated_at on public.user_roles;
create trigger set_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at();

drop trigger if exists set_pilots_updated_at on public.pilots;
create trigger set_pilots_updated_at
before update on public.pilots
for each row
execute function public.set_updated_at();

drop trigger if exists set_impact_events_updated_at on public.impact_events;
create trigger set_impact_events_updated_at
before update on public.impact_events
for each row
execute function public.set_updated_at();

-- =========================================================
-- 11. Trigger al crear usuario en auth.users
-- =========================================================
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================================================
-- 12. RLS
-- =========================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.pilots enable row level security;
alter table public.impact_events enable row level security;

-- Profiles
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.get_my_role() = 'admin'
);

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.get_my_role() = 'admin'
)
with check (
  id = auth.uid()
  or public.get_my_role() = 'admin'
);

-- User roles
drop policy if exists user_roles_select_self_or_admin on public.user_roles;
create policy user_roles_select_self_or_admin
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.get_my_role() = 'admin'
);

drop policy if exists user_roles_update_admin_only on public.user_roles;
create policy user_roles_update_admin_only
on public.user_roles
for update
to authenticated
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

-- Pilots
drop policy if exists pilots_select_authenticated on public.pilots;
create policy pilots_select_authenticated
on public.pilots
for select
to authenticated
using (true);

drop policy if exists pilots_insert_editor_or_admin on public.pilots;
create policy pilots_insert_editor_or_admin
on public.pilots
for insert
to authenticated
with check (public.get_my_role() in ('editor', 'admin'));

drop policy if exists pilots_update_editor_or_admin on public.pilots;
create policy pilots_update_editor_or_admin
on public.pilots
for update
to authenticated
using (public.get_my_role() in ('editor', 'admin'))
with check (public.get_my_role() in ('editor', 'admin'));

drop policy if exists pilots_delete_editor_or_admin on public.pilots;
create policy pilots_delete_editor_or_admin
on public.pilots
for delete
to authenticated
using (public.get_my_role() in ('editor', 'admin'));

-- Impact events
drop policy if exists impact_events_select_authenticated on public.impact_events;
create policy impact_events_select_authenticated
on public.impact_events
for select
to authenticated
using (true);

drop policy if exists impact_events_insert_editor_or_admin on public.impact_events;
create policy impact_events_insert_editor_or_admin
on public.impact_events
for insert
to authenticated
with check (public.get_my_role() in ('editor', 'admin'));

drop policy if exists impact_events_update_editor_or_admin on public.impact_events;
create policy impact_events_update_editor_or_admin
on public.impact_events
for update
to authenticated
using (public.get_my_role() in ('editor', 'admin'))
with check (public.get_my_role() in ('editor', 'admin'));

drop policy if exists impact_events_delete_editor_or_admin on public.impact_events;
create policy impact_events_delete_editor_or_admin
on public.impact_events
for delete
to authenticated
using (public.get_my_role() in ('editor', 'admin'));

-- =========================================================
-- 13. Vista util para productividad actual por piloto
-- =========================================================
create or replace view public.pilot_current_productivity as
select
  p.id as pilot_id,
  latest_event.productivity_improvement_pct
from public.pilots p
left join lateral (
  select ie.productivity_improvement_pct
  from public.impact_events ie
  where ie.pilot_id = p.id
    and ie.event_type = 'productividad'
  order by ie.event_date desc, ie.created_at desc
  limit 1
) latest_event on true;

-- =========================================================
-- 14. Consulta ejemplo para KPIs globales
-- =========================================================
-- select
--   count(*) filter (where p.status = 'en_marcha') as active_pilots,
--   coalesce(sum(p.trained_people_count), 0) as total_trained_people,
--   round(avg(pcp.productivity_improvement_pct), 2) as avg_productivity_improvement_pct
-- from public.pilots p
-- left join public.pilot_current_productivity pcp
--   on pcp.pilot_id = p.id;
