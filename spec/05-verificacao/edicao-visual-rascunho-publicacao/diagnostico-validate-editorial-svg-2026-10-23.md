# Diagnóstico da validação de SVG editorial

Data: 2026-10-23  
Projeto Supabase: `portfolio-profissional` (`jjndvtjhxutuerwvjocy`)  
Status: correção publicada no Supabase; a finalização RPC foi validada remotamente com o SVG real sanitizado. Falta apenas a confirmação visual de uma nova tentativa manual no painel autenticado.

## Sintomas observados

- A requisição para `validate-editorial-svg` retornava HTTP `409`.
- O upload do arquivo SVG para o bucket privado era concluído com HTTP `200`.
- As reservas correspondentes permaneciam com status `pending`.
- O console do frontend também registrava `Cannot read properties of undefined (reading 'map')`.
- Depois da correção da consulta privada, o mesmo fluxo passou a retornar HTTP `422`.

## Causa confirmada

A Edge Function consultava diretamente `portfolio_editorial.media` por meio do
PostgREST. Esse schema é privado e o papel `service_role` não possui `USAGE` nele;
portanto, a consulta falhava antes da validação do SVG. A função convertia essa
falha de consulta no mesmo `409` usado para uma reserva indisponível, ocultando a
causa real.

O `map` do frontend já possui uma guarda `Array.isArray` na árvore local. O erro
capturado no navegador pode vir de um bundle remoto anterior à guarda ou de outro
caminho que ainda entrega uma coleção indefinida; ele não é a causa do `409` remoto.

O `422` posterior teve duas causas no sanitizador: primeiro, a declaração XML e o
comentário de metadados presentes no SVG do AWS SQS; depois, a URL do namespace
XML padrão (`http://www.w3.org/2000/svg`) também era rejeitada pela regra global
de URLs. Esses elementos não executam código; a correção remove prólogo e
comentários, permite somente o namespace SVG padrão e mantém a rejeição de URLs
externas, scripts, `foreignObject`, entidades, CDATA e esquemas perigosos.

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
- O sanitizador passou a aceitar prólogo XML e comentários não executáveis,
  removendo-os antes da validação estrutural.
- O sanitizador passou a aceitar exclusivamente `xmlns="http://www.w3.org/2000/svg"`
  e continua rejeitando namespaces e URLs externos.

## Correção da finalização

- Criada a migration `20261023193000_finalize_validated_editorial_svg.sql`.
- A migration cria `public.finalize_validated_editorial_svg(...)` como `security definer`,
  valida ator, revisão, bucket, MIME, caminho determinístico e metadados do objeto
  sanitizado antes de marcar a mídia como `ready`.
- O `execute` da RPC é concedido exclusivamente a `service_role`; a Edge Function
  deixou de fazer `UPDATE` direto em `portfolio_editorial.media`.
- Criada a migration `20261023194000_allow_svg_sanitized_object_lookup.sql`, que
  restringe a policy do Storage aos caminhos original e `sanitized-*` derivados da
  reserva pendente/pronta.
- Em falha de finalização, a Edge Function remove o objeto sanitizado recém-criado
  para não deixar novo órfão.

## Verificações locais

- `deno test --allow-net supabase/functions/validate-editorial-svg/index.test.ts` —
  8/8 testes aprovados.
- O arquivo real `C:\Users\marco\Downloads\aws-svgrepo-com.svg` foi reproduzido
  localmente e aceito pelo sanitizador, com 3.835 bytes sanitizados.
- `npm test -- --watch=false --no-progress` — 37 arquivos e 195 testes aprovados.
- `npm run build` — aprovado.
- `npm run check:white-label` — aprovado.
- `git diff --check` — aprovado.
- `deno test --allow-read supabase/functions/validate-editorial-svg/index.test.ts` —
  9/9 testes aprovados, incluindo o caminho determinístico do objeto sanitizado.

## Evidência remota consultada

Nos logs do período analisado foram observados três POSTs `409` da Edge Function,
enquanto os uploads correspondentes no Storage retornaram `200`. As três reservas
continuavam `pending`, confirmando que a falha ocorria entre o upload e a leitura
da reserva pela função.

## Resultado da publicação

- Migration `allow_svg_validator_private_media_lookup` aplicada com sucesso no
  projeto Supabase `jjndvtjhxutuerwvjocy`.
- RPC verificada remotamente: proprietária de `portfolio_editorial_executor`,
  executável por `service_role` e sem execução por `anon` ou `authenticated`.
- Edge Function `validate-editorial-svg` republicada como versão 5, com JWT
  obrigatório e status `ACTIVE`.
- Edge Function `validate-editorial-svg` republicada como versão 6, com JWT
  obrigatório e status `ACTIVE`, contendo a primeira correção do sanitizador.
- Edge Function `validate-editorial-svg` republicada como versão 7, com JWT
  obrigatório e status `ACTIVE`, contendo a correção do namespace SVG.
- Migrations `finalize_validated_editorial_svg` e `allow_svg_sanitized_object_lookup`
  aplicadas com sucesso no projeto Supabase `jjndvtjhxutuerwvjocy`.
- Edge Function `validate-editorial-svg` republicada como versão 8, com JWT
  obrigatório e status `ACTIVE`, chamando a RPC segura de finalização.
- A RPC de finalização foi executada remotamente com a reserva real do SVG AWS SQS;
  retornou `status=ready`, caminho sanitizado, 3.835 bytes e checksum validado.
- Deploy de produção Vercel `dpl_A8k3XoqzUhGWaMPyru8JJDSGpopn` concluído com
  status `READY`, associado ao commit `a8e5dc8`.
- Domínio principal respondeu HTTP `200` após a publicação.

As tentativas feitas às 19:00–19:02 UTC chegaram à versão 6 e retornaram `422`,
deixando as reservas em `pending`. A versão 7 chegou a criar o objeto sanitizado,
mas retornou `500` ao atualizar o schema privado. A versão 8 removeu esse acesso
direto e a RPC foi validada remotamente. A confirmação restante é uma nova seleção
manual do SVG no painel autenticado para comprovar o POST `200` completo e a
associação visual ao catálogo AWS SQS.
