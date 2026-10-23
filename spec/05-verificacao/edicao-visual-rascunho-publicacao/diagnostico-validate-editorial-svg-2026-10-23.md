# Diagnóstico da validação de SVG editorial

Data: 2026-10-23  
Projeto Supabase: `portfolio-profissional` (`jjndvtjhxutuerwvjocy`)  
Status: correção preparada localmente; aplicação remota pendente de autorização

## Sintomas observados

- A requisição para `validate-editorial-svg` retornava HTTP `409`.
- O upload do arquivo SVG para o bucket privado era concluído com HTTP `200`.
- As reservas correspondentes permaneciam com status `pending`.
- O console do frontend também registrava `Cannot read properties of undefined (reading 'map')`.

## Causa confirmada

A Edge Function consultava diretamente `portfolio_editorial.media` por meio do
PostgREST. Esse schema é privado e o papel `service_role` não possui `USAGE` nele;
portanto, a consulta falhava antes da validação do SVG. A função convertia essa
falha de consulta no mesmo `409` usado para uma reserva indisponível, ocultando a
causa real.

O `map` do frontend já possui uma guarda `Array.isArray` na árvore local. O erro
capturado no navegador pode vir de um bundle remoto anterior à guarda ou de outro
caminho que ainda entrega uma coleção indefinida; ele não é a causa do `409` remoto.

## Correção preparada

- Criada a migration
  `20261023150000_allow_svg_validator_private_media_lookup.sql`.
- A migration cria `public.get_pending_editorial_media(...)` como função
  `security definer`, valida o administrador pelo ator informado e retorna somente
  a reserva pendente de `skill_icon` solicitada.
- O `execute` da RPC é concedido exclusivamente a `service_role`; o schema privado
  continua sem exposição direta pelo PostgREST.
- A Edge Function passou a usar essa RPC em vez de consultar diretamente a tabela
  privada.

## Verificações locais

- `deno test --allow-net supabase/functions/validate-editorial-svg/index.test.ts` —
  6/6 testes aprovados.
- `npm test -- --watch=false --no-progress` — 37 arquivos e 195 testes aprovados.
- `npm run build` — aprovado.
- `npm run check:white-label` — aprovado.
- `git diff --check` — aprovado.

## Evidência remota consultada

Nos logs do período analisado foram observados três POSTs `409` da Edge Function,
enquanto os uploads correspondentes no Storage retornaram `200`. As três reservas
continuavam `pending`, confirmando que a falha ocorria entre o upload e a leitura
da reserva pela função.

## Pendência operacional

A migration ainda precisa ser aplicada no Supabase e a Edge Function precisa ser
republicada. Após essas duas ações, deve ser repetido o fluxo de atualização de
habilidade para confirmar que a reserva muda de `pending` para `ready` e que o
frontend não recebe mais o `409`.
