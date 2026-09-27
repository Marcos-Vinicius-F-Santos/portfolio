# Aplicação e rollback — Upload e substituição de mídias

Migration: `supabase/migrations/20260925120000_enable_admin_media_replacement.sql`  
Feature: `spec/03-features/upload-substituicao-midias/spec.md`

## Pré-condições

1. Confirmar que as migrations anteriores de conteúdo, grants e currículo foram aplicadas.
2. Auditar os buckets `project-images` e `curricula` e os registros de
   `portfolio_project_images` e `portfolio_files`.
3. Confirmar que `portfolio_admins` contém somente a conta administrativa aprovada.
4. Fazer backup ou seguir o procedimento de restauração aprovado para o ambiente.
5. Revisar o diff da migration antes de aplicá-la.

## Aplicação

Aplicar a migration pelo fluxo versionado do Supabase CLI do ambiente. Não executar
alterações manuais equivalentes no banco remoto.

Após a aplicação, confirmar:

- policy `storage_admin_delete` existe somente para `authenticated`;
- as funções `replace_portfolio_project_image` e `replace_portfolio_curriculum` têm
  execução liberada somente para `authenticated`;
- os buckets permitidos são somente `project-images` e `curricula`;
- `anon` não possui `insert`, `update` ou `delete` em `storage.objects`;
- nenhuma tabela de conteúdo recebeu `delete`;
- constraints de imagem e PDF continuam ativas.

## Rollback

O rollback deve ser executado por migration compensatória ou pelo procedimento versionado
aprovado, nunca editando a migration já aplicada. A ordem é:

1. interromper novos uploads e substituições;
2. confirmar que não há operação administrativa em andamento;
3. remover as funções SQL criadas pela feature;
4. remover a policy `storage_admin_delete`;
5. revogar `delete` de `authenticated` em `storage.objects`;
6. revalidar leitura pública e ausência de escrita anônima.

O rollback não deve apagar registros, arquivos correntes ou objetos históricos. Após a
reversão, a gestão de mídia deve permanecer indisponível até que a migration seja
revisada e reaplicada ou que Marcos aprove outro procedimento.
