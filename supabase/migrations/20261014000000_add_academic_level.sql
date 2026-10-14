alter table public.portfolio_academic_entry_translations
  add column if not exists level text not null default '';

update public.portfolio_academic_entry_translations
set level = case lower(name)
  when 'ciência de dados' then 'Pós-Graduação'
  when 'estatística aplicada' then 'Pós-Graduação'
  when 'design gráfico' then 'Tecnólogo'
  when 'data science' then 'Postgraduate'
  when 'applied statistics' then 'Postgraduate'
  when 'graphic design' then 'Technologist'
  else level
end
where lower(name) in (
  'ciência de dados',
  'estatística aplicada',
  'design gráfico',
  'data science',
  'applied statistics',
  'graphic design'
);
