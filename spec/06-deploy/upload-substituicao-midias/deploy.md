# Procedimento de Deploy — Upload e substituição de imagens e currículos

Feature: `spec/03-features/upload-substituicao-midias/spec.md`  
Ambiente: Preview e produção na Vercel, com Supabase remoto  
Data: 2026-09-25  
Status: Procedimento pronto para revisão; não executar sem a aprovação final de Marcos

Projeto Vercel: `portfolio`  
Escopo Vercel: `marcos-vinicius-f-santos-projects`  
Project ID Vercel: `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`  
Projeto Supabase: `portfolio-profissional`  
Project ref Supabase: `jjndvtjhxutuerwvjocy`  
Região Supabase: `sa-east-1`

O repositório não possui Git remoto configurado. Para esta entrega, o procedimento usa a
Vercel CLI vinculada ao projeto local por `.vercel/project.json`. A migration deve ser
aplicada pelo fluxo versionado do Supabase antes de promover o frontend.

## Pré-condições

- [x] A Spec da feature, o plano, as tarefas e a revisão de convergência foram revisados;
      a aprovação da convergência foi informada por Marcos.
- [ ] O roteiro de teste manual em `spec/05-verificacao/upload-substituicao-midias/`
      foi executado no ambiente controlado, incluindo upload, substituição, erro e
      escrita não autorizada.
- [ ] Marcos revisou o diff final e aprovou o procedimento e a release antes de qualquer
      promoção para produção.
- [ ] A migration `20260925120000_enable_admin_media_replacement.sql` foi revisada e o
      rollback em `spec/05-verificacao/upload-substituicao-midias/migration-rollback.md`
      está disponível.
- [ ] O Registro de Decisão
      `spec/02-arquitetura/DECISAO-005-substituicao-segura-de-midias.md` está aprovado
      para a entrega. Ele ainda deve ser tratado como proposta enquanto o arquivo não
      refletir a aprovação de Marcos.
- [ ] Nenhuma alteração não relacionada está incluída no diff.
- [ ] O comando `npx supabase@2.117.0` pode ser executado no ambiente de deploy. Se o
      CLI não estiver disponível ou não puder ser baixado, interrompa o procedimento;
      não aplique a migration manualmente pelo SQL Editor.
- [ ] Existe backup ou procedimento de restauração aprovado para o ambiente Supabase
      antes da aplicação da migration. No workspace usado para preparar este documento,
      `supabase` não está no `PATH` e o pacote não está disponível no cache do `npx`;
      isso precisa ser resolvido antes de iniciar o deploy.

## Variáveis de ambiente e segredos

Esta feature não exige nova variável de ambiente nem novo segredo. Ela reutiliza o
cliente Supabase já existente e as variáveis públicas abaixo, configuradas na Vercel
para Production e Preview:

| Variável                   | Ambientes            | Valor esperado                             | Regra                                             |
| -------------------------- | -------------------- | ------------------------------------------ | ------------------------------------------------- |
| `SUPABASE_URL`             | Production e Preview | `https://jjndvtjhxutuerwvjocy.supabase.co` | URL pública do projeto                            |
| `SUPABASE_PUBLISHABLE_KEY` | Production e Preview | Publishable key do projeto                 | Nunca substituir por `service_role` ou secret key |

Confirme somente a existência e os ambientes, sem imprimir valores:

```powershell
Set-Location 'E:\Projects\portfolio'
$VercelScope = 'marcos-vinicius-f-santos-projects'

npx vercel@60.0.1 env list production --scope $VercelScope
npx vercel@60.0.1 env list preview --scope $VercelScope
```

Se alguma variável estiver ausente, adicione-a interativamente. Nunca passe uma chave na
linha de comando, nunca registre o valor no repositório e nunca use `service_role` ou
secret key no frontend:

```powershell
npx vercel@60.0.1 env add SUPABASE_URL production --scope $VercelScope
# Cole: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel@60.0.1 env add SUPABASE_PUBLISHABLE_KEY production --scope $VercelScope
# Cole a publishable key do projeto Supabase

npx vercel@60.0.1 env add SUPABASE_URL preview --scope $VercelScope
# Cole: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel@60.0.1 env add SUPABASE_PUBLISHABLE_KEY preview --scope $VercelScope
# Cole a mesma publishable key do projeto Supabase
```

Depois de alterar uma variável, crie uma nova prévia; não reutilize um deployment criado
antes da alteração.

## Passos do deploy

### 1. Confirmar conta, projeto e baseline de rollback

```powershell
Set-Location 'E:\Projects\portfolio'
$VercelScope = 'marcos-vinicius-f-santos-projects'
$SupabaseProjectRef = 'jjndvtjhxutuerwvjocy'

npx vercel@60.0.1 whoami
Get-Content '.vercel\project.json'
npx vercel@60.0.1 ls portfolio --scope $VercelScope
```

Confirme que `.vercel/project.json` aponta para o projeto `portfolio`, para o `orgId`
`team_f40xcyXvtR6SnxVzP1VbKdPW` e para o Project ID
`prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`.

Na saída de `vercel ls`, localize a versão mais recente com ambiente Production e status
Ready. Registre os dados dela antes de criar a prévia:

```powershell
$KnownGoodDeploymentId = '<ID Production/Ready confirmado na saída acima>'
$KnownGoodUrl = '<URL Production/Ready confirmado na saída acima>'
npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope $VercelScope
```

Não use um ID histórico sem confirmar que ele ainda está `Ready`. O ID abaixo é somente
um exemplo histórico do projeto e deve ser substituído se `vercel ls` mostrar uma versão
mais recente:

```text
dpl_73Uq8paLZHgUQSuVzs5nhjUHCboF
```

### 2. Conferir o diff e os gates locais

```powershell
git status --short
git diff --check
git diff
npm ci
npm test -- --watch=false --no-progress
npm run build
```

Pare se houver arquivo inesperado, falha de whitespace, falha de teste ou falha de build.
Os avisos de orçamento já conhecidos do bundle não são, sozinhos, motivo para alterar a
feature; uma nova falha ou aumento relevante exige revisão antes da publicação.

O diff esperado deve se limitar à implementação e à documentação desta feature, incluindo
a migration `supabase/migrations/20260925120000_enable_admin_media_replacement.sql`, os
arquivos de `src/app/features/admin/media-management/`, a integração do workspace
administrativo e os documentos correspondentes em `spec/`.

### 3. Verificar o estado remoto do Supabase antes da migration

Use a mesma versão fixada do CLI e execute as verificações abaixo. Se o CLI pedir
autenticação, use o fluxo seguro do ambiente; não coloque token no documento ou no shell
history.

```powershell
npx supabase@2.117.0 migration list --project-ref $SupabaseProjectRef

npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select id, public, file_size_limit, allowed_mime_types from storage.buckets where id in ('project-images', 'curricula') order by id;"

npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select user_id, created_at from public.portfolio_admins order by created_at;"

npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select table_name, privilege_type, grantee from information_schema.role_table_grants where table_schema = 'storage' and table_name = 'objects' and grantee in ('anon', 'authenticated') order by grantee, privilege_type;"
```

Confirme os buckets, a conta administrativa aprovada e que não existe concessão de escrita
ou remoção para `anon`. Se a migration da feature já aparecer aplicada, não a aplique de
novo; valide as policies e funções na etapa 5. Se houver divergência de schema não
explicada, pare o deploy.

### 4. Aplicar a migration versionada antes do frontend

Não execute os `GRANT`, `CREATE POLICY` ou `CREATE FUNCTION` manualmente no banco. Aplique
a migration local pelo fluxo versionado:

```powershell
npx supabase@2.117.0 db push --linked --project-ref $SupabaseProjectRef
```

Se o comando mostrar migration pendente diferente da migration desta feature, interrompa
e resolva a ordem com uma mudança aprovada. Não use `db reset`, não edite migration já
aplicada e não ignore uma divergência com `--include-all` sem revisar o histórico.

### 5. Validar a migration aplicada

```powershell
npx supabase@2.117.0 migration list --project-ref $SupabaseProjectRef

npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select schemaname, tablename, policyname, cmd, roles from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'storage_admin_delete';"

npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select routine_schema, routine_name, routine_type from information_schema.routines where routine_schema = 'public' and routine_name in ('replace_portfolio_project_image', 'replace_portfolio_curriculum') order by routine_name;"

npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select table_name, privilege_type, grantee from information_schema.role_table_grants where table_schema = 'storage' and table_name = 'objects' and grantee in ('anon', 'authenticated') order by grantee, privilege_type;"
```

A validação só passa quando:

- `storage_admin_delete` aceita somente `authenticated`, limita os buckets a
  `project-images` e `curricula` e exige a conta em `public.portfolio_admins`;
- as duas funções de substituição existem e a execução delas não está aberta a `anon`;
- `authenticated` possui a permissão de remoção necessária para a policy, mas `anon` não
  possui `insert`, `update` ou `delete` em `storage.objects`;
- nenhuma tabela de conteúdo recebeu `delete`;
- os buckets, constraints e registros existentes permanecem presentes.

Se qualquer item falhar, pare antes de criar ou promover o frontend.

### 6. Criar e validar a prévia Vercel

```powershell
$PreviewUrl = npx vercel@60.0.1 deploy --yes --scope $VercelScope | Select-Object -Last 1
$PreviewUrl
npx vercel@60.0.1 inspect $PreviewUrl --scope $VercelScope
```

Confirme que a URL é `https://...vercel.app`, que o deployment está `Ready` e que é uma
prévia. Valide o HTML e a configuração publicada sem imprimir a chave completa:

```powershell
$PageResponse = npx vercel@60.0.1 curl "$PreviewUrl/" --scope $VercelScope --yes 2>$null | Out-String
if ($LASTEXITCODE -ne 0 -or $PageResponse -notmatch '<app-root') {
  throw 'A página pública não retornou o HTML Angular esperado.'
}

$RuntimeResponse = npx vercel@60.0.1 curl "$PreviewUrl/runtime-config.js" --scope $VercelScope --yes 2>$null | Out-String
if ($LASTEXITCODE -ne 0 -or $RuntimeResponse -notmatch '__PORTFOLIO_SUPABASE_CONFIG__' -or $RuntimeResponse -notmatch 'jjndvtjhxutuerwvjocy.supabase.co' -or $RuntimeResponse -notmatch 'sb_publishable_') {
  throw 'runtime-config.js ausente ou com configuração Supabase inválida.'
}
```

### 7. Executar a validação manual da feature na prévia

Use arquivos de teste controlados; não use conteúdo real como arquivo de experimento.
Autentique-se manualmente como Marcos e não registre credenciais.

1. Abra `$PreviewUrl/` em janela anônima e confirme que a página pública e a alternância
   PT/EN carregam.
2. Abra `$PreviewUrl/admin` sem sessão e confirme que somente a autenticação aparece.
3. Com Marcos autenticado, adicione uma imagem válida a um projeto existente e confirme
   a associação na página pública.
4. Em um projeto com mais de uma imagem, substitua o registro específico selecionado e
   confirme que as demais imagens e a ordem permanecem.
5. Envie um PDF para `pt-BR` e outro para `en`; confirme que cada locale mantém seu
   próprio currículo.
6. Substitua uma imagem e um currículo e confirme que o novo arquivo é utilizado e o
   objeto anterior foi removido do Storage.
7. Tente arquivo inválido, imagem acima de 1 MB e MIME de currículo diferente de PDF;
   confirme erro sem nova associação considerada publicada.
8. Simule ou execute o cenário aprovado de falha entre upload e persistência; confirme
   que o objeto novo órfão é removido e que a interface não mostra falso sucesso.
9. Em ambiente controlado, confirme que `anon` e uma conta autenticada não autorizada
   não conseguem inserir, substituir ou remover mídia.
10. Recarregue a página pública em português e inglês e confirme que a nova associação é
    lida sem mudança no layout público.

Pare se qualquer operação retornar sucesso falso, se uma conta não autorizada conseguir
escrever/remover ou se a leitura pública quebrar.

### 8. Promover somente após a aprovação final

Depois de Marcos revisar a prévia, as evidências e os logs, e responder explicitamente
que a release está aprovada, promova exatamente a URL validada:

```powershell
npx vercel@60.0.1 promote $PreviewUrl --yes --scope $VercelScope
npx vercel@60.0.1 promote status portfolio --scope $VercelScope
npx vercel@60.0.1 inspect $PreviewUrl --scope $VercelScope
npx vercel@60.0.1 ls portfolio --scope $VercelScope
npx vercel@60.0.1 logs $PreviewUrl --scope $VercelScope --level error --since 1h
```

Registre neste documento a URL e o ID do deployment promovido, o resultado das queries
da migration, a validação manual e os logs. Não considere o deploy concluído só porque a
Vercel aceitou o comando: a validação pós-deploy ainda é obrigatória.

## Ordem de migration de banco

Esta feature possui uma migration nova e a ordem é obrigatória:

1. Confirmar acesso ao projeto Supabase `jjndvtjhxutuerwvjocy`.
2. Executar `migration list` e as queries de pré-flight da etapa 3.
3. Aplicar `20260925120000_enable_admin_media_replacement.sql` com `db push` versionado.
4. Confirmar policy, funções, grants, buckets e ausência de escrita anônima.
5. Só então criar a prévia e publicar o frontend que chama as funções e a remoção do Storage.

Não aplique o frontend antes da migration. Não use `db reset`, não edite uma migration
já aplicada e não conceda `delete` diretamente a usuários ou tabelas de conteúdo.

## Validação depois do deploy

Use o alias de produção e os dados do deployment mostrado por `vercel inspect`:

1. Abra `/` e confirme carregamento público e alternância PT/EN.
2. Abra `/admin` sem sessão e confirme que não há acesso administrativo.
3. Autentique Marcos e confirme a área protegida e a gestão de mídia.
4. Execute um smoke test controlado de upload de imagem, substituição de imagem
   específica e upload/substituição dos currículos `pt-BR` e `en`.
5. Confirme no Storage a remoção dos objetos anteriores e, em caso de erro simulado,
   do objeto órfão novo.
6. Confirme que projeto, galeria, currículos e layout públicos continuam funcionando
   após recarregar em ambos os idiomas.
7. Confirme que visitante anônimo e conta não autorizada não conseguem escrever ou
   remover mídia.
8. Consulte os logs de erro da última hora:

   ```powershell
   npx vercel@60.0.1 logs $PreviewUrl --scope $VercelScope --level error --since 1h
   ```

   Substitua `$PreviewUrl` pela URL/alias de produção quando a verificação for executada
   depois da promoção. Qualquer erro fatal de inicialização, autenticação, Storage,
   RPC ou roteamento interrompe a entrega e aciona o rollback abaixo.

## Procedimento de rollback

Use esta sequência se houver tela em branco, erro fatal, falha de configuração, acesso
administrativo indevido, escrita não autorizada, associação incorreta ou erro de Storage.
O primeiro objetivo é retirar o frontend defeituoso da produção; o segundo é desfazer a
permissão/migration somente se o incidente exigir.

### A. Retirar imediatamente o frontend defeituoso

1. Pare os smoke tests e informe que novos uploads/substituições estão suspensos.
2. Abra o PowerShell no projeto e confirme a conta Vercel:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   $VercelScope = 'marcos-vinicius-f-santos-projects'
   npx vercel@60.0.1 whoami
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   ```

3. Na saída, escolha a versão mais recente com ambiente Production e status Ready
   anterior à release defeituosa. Defina os valores somente depois de conferir a saída:

   ```powershell
   $KnownGoodDeploymentId = '<ID Production/Ready anterior confirmado>'
   $KnownGoodUrl = '<URL Production/Ready anterior confirmada>'
   npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope $VercelScope
   ```

4. Se o deployment confirmado não estiver `Ready`, pare e escolha outro deployment
   anterior `Production/Ready` na saída de `vercel ls`.
5. Faça o rollback para o deployment confirmado:

   ```powershell
   npx vercel@60.0.1 rollback $KnownGoodDeploymentId --yes --scope $VercelScope
   npx vercel@60.0.1 rollback status portfolio --scope $VercelScope
   ```

6. Confirme que a produção voltou ao deployment estável e faça a checagem mínima:

   ```powershell
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   $Response = npx vercel@60.0.1 curl "$KnownGoodUrl/" --scope $VercelScope --yes 2>$null | Out-String
   if ($LASTEXITCODE -ne 0 -or $Response -notmatch '<app-root') {
     throw 'A versão restaurada não retornou o HTML Angular esperado.'
   }
   ```

7. Em uma janela anônima, abra `$KnownGoodUrl/`, confirme a página pública e a
   alternância PT/EN. Não retome uploads/substituições até a causa estar registrada e
   uma nova prévia ser validada.

### B. Desfazer a migration somente se o incidente exigir

O rollback do frontend não apaga arquivos nem desfaz a migration automaticamente. Se o
incidente for causado pela policy, grant ou função SQL, execute esta sequência somente
depois de concluir a etapa A:

1. Confirme que não há operação administrativa em andamento e mantenha uploads e
   substituições bloqueados.
2. Não edite nem apague a migration já aplicada. Crie uma migration compensatória usando
   o CLI versionado:

   ```powershell
   $SupabaseProjectRef = 'jjndvtjhxutuerwvjocy'
   npx supabase@2.117.0 migration new rollback_enable_admin_media_replacement
   ```

3. No arquivo gerado, coloque exatamente as operações abaixo, revise o diff e preserve
   os registros e objetos existentes:

   ```sql
   drop function if exists public.replace_portfolio_project_image(uuid, text, text, text, bigint);
   drop function if exists public.replace_portfolio_curriculum(text, text, text, text, bigint);
   drop policy if exists storage_admin_delete on storage.objects;
   revoke delete on storage.objects from authenticated;
   ```

4. Aplique a migration compensatória pelo fluxo versionado:

   ```powershell
   npx supabase@2.117.0 db push --linked --project-ref $SupabaseProjectRef
   ```

5. Verifique que as funções e a policy não existem mais, que `anon` continua sem escrita
   ou remoção e que os buckets, registros e objetos correntes permanecem intactos.
6. Não apague manualmente arquivos, referências, currículos, imagens ou registros para
   “limpar” o incidente. A gestão de mídia deve continuar indisponível até Marcos
   aprovar a correção, uma nova migration e uma nova prévia.

Se o problema for apenas variável de ambiente, não faça rollback do banco: corrija a
variável no ambiente correto da Vercel, crie uma nova prévia e repita todos os gates. Se
houver suspeita de vazamento de segredo, interrompa a entrega e faça a rotação do segredo
pelo painel/fluxo oficial, sem registrar o valor neste documento.

## Notas de recuperação de dados

- A migration não altera as linhas existentes de `portfolio_project_images` ou
  `portfolio_files` e não remove arquivos do Storage por si só.
- O rollback não deve apagar objetos correntes, objetos históricos ou referências. Os
  arquivos permanecem disponíveis para investigação e recuperação.
- Se a remoção do objeto anterior falhar após uma substituição, preserve o novo vínculo
  corrente, registre o caminho antigo e o erro, e não faça exclusão manual durante o
  incidente.
- Se um objeto órfão for identificado após falha de persistência, use somente o fluxo de
  limpeza aprovado pela feature; não exclua objetos em lote.
- Registre horário, sintomas, deployment defeituoso, deployment restaurado, migration
  compensatória (se houver), comandos executados e impacto observado.

## Histórico do deploy

Registro desta execução aprovada:

```text
Data: 2026-09-25
Preview validada: https://portfolio-ibhi78nem-marcos-vinicius-f-santos-projects.vercel.app
Preview deployment: dpl_6vBxQVYm4PyvWv1Dk8PGk1PsSXVW
Produção promovida: https://portfolio-marcos-vinicius-f-santos-projects.vercel.app
Production deployment: dpl_BameZjc8zinGp9jSTNwVSvZuiHqL
Migration aplicada: 20260925120000_enable_admin_media_replacement.sql em jjndvtjhxutuerwvjocy
Testes/build: 107 testes em 15 arquivos passaram; build passou com avisos de orçamento conhecidos
Validação manual: página pública e shell de /admin validados; fluxo autenticado de mídia não foi executado nesta sessão
Logs: nenhum log de erro encontrado na prévia ou na produção durante a janela de verificação
Rollback necessário: não
Aprovação de Marcos: recebida; escopo ampliado para todo o working tree atual
```

## Aprovação

O procedimento somente pode ser executado após Marcos revisar a prévia, as evidências e
o plano de rollback e responder explicitamente:

**Aprovado pra deploy?**
