# Auditoria de chamadas duplicadas do snapshot publicado

Data: 2026-10-22  
Status: Correção implementada; aguardando revisão de Marcos antes de push/deploy  
Escopo: leitura pública do snapshot editorial via Supabase

## Diagnóstico

A página pública inicial chama, em paralelo, os carregadores de texto, projetos,
currículo, habilidades, contatos e ordem das seções. O
`PublishedSnapshotContentService` delegava cada chamada ao
`PublishedSnapshotService`, mas o serviço não compartilhava a Promise da primeira
requisição enquanto ela estava em andamento.

Assim, chamadas que chegavam antes da conclusão da primeira leitura podiam executar
várias vezes a RPC `get_published_snapshot`. Isso explica uma rajada de leituras
duplicadas por carregamento, mas não caracteriza um loop infinito: não há polling,
`setInterval` ou reexecução contínua desse fluxo.

## Correção

`PublishedSnapshotService` agora mantém a requisição em andamento, identificada pelo
`publicationId`, e devolve a mesma Promise para chamadas concorrentes do mesmo
snapshot. O estado é liberado tanto em sucesso quanto em erro, permitindo nova
tentativa depois de uma falha. A resposta validada continua sendo mantida no signal
existente para leituras posteriores sem nova chamada.

Não houve alteração de schema, policy, RPC, contrato de dados ou comportamento de
fallback. Portanto, nenhuma migration foi necessária.

## Evidências externas consideradas

- Vercel, últimos 30 dias: `portfolio` registrou 994.182 CDN Requests; os projetos
  `assimilacao-rpg-app` e `gestaofinanceira` registraram 37 e 0, respectivamente.
- Supabase, janela de 24 horas auditada: a RPC `get_published_snapshot` registrou 127
  chamadas com status 200.
- A diferença entre esses números confirma que a correção reduz duplicação de
  leituras no cliente/Supabase, mas não elimina tráfego CDN externo, bots ou caminhos
  aleatórios aceitos pelo rewrite da Vercel.

## Verificação

- Teste unitário adicionado para duas chamadas públicas concorrentes: uma única RPC.
- Teste unitário adicionado para confirmar nova tentativa após falha.
- Varredura do fluxo público: nenhum loop de polling ou timer de recarga encontrado.
- Convergência: a correção permanece nos serviços da feature de portfólio, segue a
  integração Supabase existente e tem cobertura automatizada específica.

## Portão

O código e os testes ficam prontos para revisão de Marcos. Push e deploy não fazem
parte deste registro e dependem de aprovação explícita posterior.
