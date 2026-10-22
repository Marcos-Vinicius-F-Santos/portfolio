# Correção do loop do PostgREST e do trigger de retenção

Data informada da execução: 2026-10-22  
Projeto: `portfolio-profissional`  
Project ref: `jjndvtjhxutuerwvjocy`  
Status: executado no Supabase conforme relato de Marcos; não reexecutado nesta sessão

## Objetivo informado

Corrigir o loop de reexecução associado ao SQLSTATE `40001` (`serialization_failure`)
no PostgREST e o erro `21000` produzido pelo trigger
`portfolio_editorial.enforce_publication_retention`.

## Script executado

```sql
-- =====================================================================
-- CORRECAO: LOOP INFINITO DO POSTGREST (SQLSTATE 40001 -> P0001)
-- E CORRECAO DO TRIGGER enforce_publication_retention (SQLSTATE 21000)
-- =====================================================================

-- 1. Encerrar imediatamente qualquer sessao presa em loop no PostgREST
select pg_terminate_backend(pid)
from pg_stat_activity
where pid <> pg_backend_pid()
  and usename = 'authenticator'
  and state <> 'idle';

-- 2. Corrigir o trigger de retencao de publicacoes (evita erro 21000 do pg-safeupdate)
create or replace function portfolio_editorial.enforce_publication_retention()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  with keep as materialized(
    select candidate.id from portfolio_editorial.publications candidate
    cross join portfolio_editorial.site_state s
    order by (candidate.id = s.active_publication_id) desc, candidate.sequence desc limit 10
  )
  update portfolio_editorial.publications p
     set retained = (p.id in (select id from keep))
   where p.retained is distinct from (p.id in (select id from keep));
  return new;
end $$;

-- 3. Trocar errcode = '40001' por 'P0001' apenas nas funcoes editoriais (prokind = 'f')
-- Motivo: O driver Hasql do PostgREST interpreta SQLSTATE '40001' (serialization_failure)
-- como falha transiente de isolamento e reexecuta a query em loop infinito no servidor!
do $$
declare
  fn record;
  new_def text;
begin
  for fn in
    select p.oid, n.nspname, p.proname, pg_get_functiondef(p.oid) as def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('portfolio_editorial', 'public')
      and p.prokind = 'f'
      and p.proname in (
        'reserve_media',
        'apply_draft_command',
        'validate_publication',
        'publish_draft',
        'discard_draft',
        'restore_publication',
        'set_draft_technologies',
        'set_section_order',
        'set_editor_locale',
        'associate_editorial_media',
        'create_editorial_technology',
        'update_editorial_technology'
      )
  loop
    if fn.def like '%40001%' then
      new_def := replace(fn.def, '40001', 'P0001');
      execute new_def;
    end if;
  end loop;
end $$;
```

## Escopo e verificação

- A etapa 1 é uma ação operacional de contenção: encerra sessões não ociosas do papel
  `authenticator` no momento da execução.
- A etapa 2 atualiza a função do trigger para calcular os dez registros retidos com
  `materialized` e atualizar somente linhas cujo valor realmente mudou.
- A etapa 3 altera somente funções (`prokind = 'f'`) nos schemas `portfolio_editorial`
  e `public` com os nomes explicitamente listados e que contenham `40001` na definição.
- Nenhuma tabela, policy, bucket ou dado de conteúdo foi alterado diretamente por esse
  script.
- O resultado remoto não foi reconsultado nesta sessão; portanto, não se declara aqui
  validação independente de que as funções foram alteradas ou de que o loop cessou.

## Convergência e pendência

O script foi registrado como evidência operacional, mas sua execução manual não cria
histórico no repositório. Como as regras do projeto exigem versionamento de mudanças de
schema e funções, deve ser criada uma migration idempotente e revisada antes de aplicar
essa correção em outro ambiente. A etapa de encerramento de sessões deve permanecer fora
da migration, como procedimento operacional separado.
