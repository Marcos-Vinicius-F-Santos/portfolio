# Aplicação e rollback — Integração com Supabase

## Aplicação

1. Configurar `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` no ambiente da aplicação.
2. Revisar os arquivos em `supabase/migrations/`.
3. Aplicar as migrations pelo fluxo versionado do Supabase CLI.
4. Confirmar tabelas, RLS, policies, buckets e advisors.
5. Executar o build e a suíte de testes antes da publicação.

## Rollback

As migrations já aplicadas não devem ser editadas nem removidas do histórico.
Qualquer correção deve ser uma nova migration complementar, como ocorreu em
`20260923200309_restrict_portfolio_grants`, que corrigiu privilégios ACL sem
reverter o schema.

Para um ambiente ainda sem dados, o rollback operacional deve ser uma migration
compensatória revisada que remova, na ordem inversa, policies, buckets, tabelas,
índices e a extensão criada pela migration original. A execução é um portão de
operação e não foi feita nesta rodada, para não destruir dados nem alterar o
projeto compartilhado sem aprovação específica.
