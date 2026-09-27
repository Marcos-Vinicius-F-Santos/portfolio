# Registro de Decisão — Persistência segura do conteúdo administrativo

> **Precedência para a evolução editorial (2026-09-26):** A restauração de estado do formulário não é garantia de transação no banco. A nova publicação tem snapshot validado e promoção transacional; autosave é privado e controlado por revisão. Ver [ADR-008](DECISAO-008-versionamento-publicacao-editorial.md). Esta nota preserva o histórico; não afirma que a evolução já foi implementada.

Data: 2026-09-25  
Status: Proposta para revisão de Marcos

## Contexto

Uma alteração administrativa pode atualizar uma entidade base e duas traduções em
operações separadas pelo cliente Supabase. Se uma operação posterior falhar, o cliente
não deve substituir seu estado confirmado por uma alteração incompleta.

## Decisão proposta

Nesta entrega, o cliente mantém uma cópia do último rascunho confirmado e só atualiza
essa cópia depois que todas as operações do salvamento retornarem sucesso. Em caso de
falha, a interface restaura o rascunho confirmado e informa a falha.

Para operações de mídia que envolvem Storage e PostgreSQL, usar o padrão já adotado de
upload com caminho único, associação posterior, compensação do objeto novo em caso de
falha e remoção do objeto anterior somente depois da referência nova estar confirmada.

O PostgreSQL continua protegido por RLS e as funções RPC de substituição usam
`SECURITY INVOKER`, com execução concedida somente ao papel autenticado autorizado.

## Limitação conhecida

Como Storage e PostgreSQL são recursos distintos e os salvamentos de conteúdo textual
continuam sendo múltiplas chamadas do Data API, esta decisão garante a preservação do
estado confirmado na interface e a compensação das mídias, mas não transforma todos os
salvamentos textuais em uma única transação SQL.

Se essa garantia transacional for necessária para conteúdo textual, uma decisão futura
deve aprovar funções RPC específicas por agregado antes de alterar o fluxo.

## Rollback

Voltar o código para a leitura/escrita anterior e manter os campos de migration
compatíveis. Não remover registros, objetos ou funções RPC em uso sem migration
compensatória revisada.
