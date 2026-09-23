# Entrega — Integração com Supabase

Nenhum deploy é executado por esta feature.

## Ordem aprovada para uma futura entrega

1. Criar/configurar as variáveis públicas `SUPABASE_URL` e
   `SUPABASE_PUBLISHABLE_KEY` no ambiente alvo.
2. Aplicar as migrations versionadas no projeto Supabase correto.
3. Confirmar RLS, policies, ACLs, buckets e advisors.
4. Configurar o usuário de Marcos no Supabase Auth e adicionar seu UUID à
   `public.portfolio_admins` por procedimento administrativo seguro.
5. Executar build, testes e verificação manual da leitura pública em PT/EN.
6. Publicar somente após revisão e aprovação de Marcos.

## Rollback

Usar uma migration compensatória revisada e o procedimento documentado em
`spec/05-verificacao/integracao-supabase/migration-rollback.md`. Não editar uma
migration já aplicada e não expor `service_role` no frontend ou em variáveis
client-side.
