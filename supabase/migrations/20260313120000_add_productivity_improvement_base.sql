-- Añadir campo productivity_improvement_base a pilots (análogo a trained_people_count)
-- KPI Mejora = productivity_improvement_base + suma de productivity_improvement_pct de eventos tipo productividad

alter table public.pilots
add column if not exists productivity_improvement_base numeric(5,2) not null default 0;

comment on column public.pilots.productivity_improvement_base is
'Dato manual a nivel piloto. El KPI Mejora = base + suma de productivity_improvement_pct de eventos tipo productividad.';
