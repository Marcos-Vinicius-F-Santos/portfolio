# Rollback da migration de catálogos editáveis

Migration: `supabase/migrations/20260925090000_add_editable_portfolio_catalogs.sql`

## Pré-condições

- Reverter primeiro o frontend para uma versão que não consulta as novas tabelas.
- Confirmar que nenhum consumidor depende das estruturas criadas.
- Fazer backup/exportação aprovado antes de remover dados persistidos.

## Ordem de remoção

```sql
drop table public.portfolio_contact_link_translations;
drop table public.portfolio_contact_links;
drop table public.portfolio_academic_entry_translations;
drop table public.portfolio_academic_entries;
drop table public.portfolio_skill_translations;
drop table public.portfolio_skills;
drop table public.portfolio_skill_category_translations;
drop table public.portfolio_skill_categories;
```

As tabelas de textos, experiências, projetos, imagens e currículos não fazem parte deste
rollback e não devem ser removidas por ele.

