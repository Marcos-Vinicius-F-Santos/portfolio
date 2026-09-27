# Registro de Decisão — Substituição segura de imagens e currículos

> **Precedência para a evolução editorial (2026-09-26):** A remoção imediata do arquivo anterior será substituída por retenção das referências em rascunho/versões e coleta após sete dias órfão. Nunca apagar mídia necessária à restauração. Ver [ADR-008](DECISAO-008-versionamento-publicacao-editorial.md). Esta nota preserva o histórico; não afirma que a evolução já foi implementada.

Data: 2026-09-25  
Status: Proposta para revisão de Marcos

## Contexto

A feature de upload e substituição precisa coordenar duas persistências diferentes:
Supabase Storage e as referências/metadados nas tabelas
`portfolio_project_images` e `portfolio_files`. O Storage não participa da mesma
transação do PostgreSQL usada pelo cliente Angular.

A feature também exige que uma imagem específica ou o currículo de um locale seja
substituído, que o objeto anterior seja removido, que objetos enviados sem referência
sejam limpos e que a última operação confirmada prevaleça.

## Decisão

- Usar caminhos únicos para cada novo objeto enviado; não sobrescrever caminhos antigos.
- Para um upload novo, enviar o objeto e só depois inserir a referência e os metadados.
- Para uma substituição, atualizar o registro corrente por meio de funções SQL
  versionadas que bloqueiam o registro-alvo durante a atualização e retornam o
  `storage_path` anterior.
- Remover o objeto anterior somente depois da atualização da referência.
- Se a inserção/atualização da referência falhar, remover o novo objeto enviado antes de
  retornar erro ao administrador.
- Se a remoção do objeto anterior falhar, tentar novamente de forma limitada, registrar
  o erro e não informar a operação como concluída. A referência nova permanece corrente
  para não reverter uma alteração que pode já ter sido observada por outra operação.
- O bloqueio por registro serializa substituições do mesmo alvo; a última atualização
  confirmada pelo PostgreSQL prevalece.
- A remoção automática do objeto anterior e de objetos órfãos é uma exceção operacional
  da substituição e da compensação. Não haverá exclusão manual avulsa de mídia nesta
  feature.
- A permissão de remoção será concedida somente a `authenticated` e protegida por
  `public.portfolio_admins` e pelos buckets permitidos. Nenhuma chave `service_role` será
  usada no frontend.

## Consequências

O fluxo evita apagar o arquivo corrente antes que a nova referência exista e mantém a
concorrência de um mesmo alvo serializada no banco. Como Storage e PostgreSQL continuam
sendo recursos distintos, a remoção do objeto anterior pode falhar depois da atualização
da referência; esse estado será identificado, tentado novamente e reportado como falha,
sem falso sucesso.

A migration precisa liberar `delete` somente em `storage.objects` e criar policies e
funções SQL com rollback. Não haverá `delete` nas tabelas de conteúdo.

## Alternativas consideradas

| Alternativa                                          | Por que não                                                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Sobrescrever o mesmo caminho no Storage              | Não permite remover de forma explícita o objeto anterior nem distinguir operações concorrentes com segurança |
| Remover o objeto anterior antes de atualizar o banco | Pode deixar a associação pública apontando para um arquivo inexistente                                       |
| Criar backend próprio ou Edge Function               | Cruza o limite arquitetural atual e não é necessário para o fluxo compensatório aprovado                     |
| Permitir `delete` amplo para usuários autenticados   | Poderia permitir remoção de objetos fora dos buckets e da conta administrativa autorizada                    |
| Ignorar a falha de remoção do objeto anterior        | Produziria falso sucesso e objetos órfãos sem identificação                                                  |

## Rollback

Interromper novos uploads/substituições, remover as policies/grants de `delete` e as
funções SQL criadas pela migration. Não apagar manualmente registros ou objetos durante o
rollback.
