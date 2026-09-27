# Procedimento de Deploy — Portfólio público e conteúdo administrável

Ambiente: Preview e Production na Vercel; dados no Supabase  
Projeto local: `E:\Projects\portfolio`  
Projeto Vercel: `portfolio`  
Escopo Vercel: `marcos-vinicius-f-santos-projects`  
Project ID Vercel: `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`  
Projeto Supabase: `portfolio-profissional`  
Project ref Supabase: `jjndvtjhxutuerwvjocy`  
Região Supabase: `sa-east-1`  
Fluxo: Vercel CLI, porque este repositório não possui remote Git configurado  
Status: publicado e validado em 2026-09-25

## Pré-condições

- [x] Marcos informou que a revisão de convergência foi aprovada.
- [ ] Os testes manuais público e administrativo foram executados e registrados em
      `spec/05-verificacao/portfolio-publico-e-conteudo-administravel/`.
- [x] `npm test -- --watch=false --no-progress` passou: 15 arquivos e 108 testes.
- [x] `npm run build` passou.
- [x] O dry-run das migrations mostrou somente a migration esperada
      `20260925195359_extend_portfolio_public_content.sql`.
- [ ] RLS, Storage, limite de 1 MB e ausência de escrita anônima foram validados em
      ambiente controlado.
- [ ] O diff final foi revisado por Marcos.
- [x] Existe uma deployment Production/Ready anterior identificada para rollback:
      `dpl_BameZjc8zinGp9jSTNwVSvZuiHqL`.
- [x] Marcos aprovou explicitamente a promoção para Production.

Antes da promoção, nenhuma pré-condição não revisada deve ser ignorada. Neste deploy,
Marcos autorizou explicitamente a promoção após a revisão de convergência; a validação
manual administrativa, mobile e a consulta ampla de policies permaneceram pendentes e
não são consideradas concluídas neste registro.

## Variáveis de ambiente e segredos

Esta feature não cria variável nova. A aplicação Angular gera
`public/runtime-config.js` no `prebuild` usando somente estas variáveis públicas:

| Variável | Valor/configuração | Onde configurar | Classificação |
|---|---|---|---|
| `SUPABASE_URL` | `https://jjndvtjhxutuerwvjocy.supabase.co` | Vercel Preview e Production | Pública |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key do projeto Supabase | Vercel Preview e Production | Pública para o frontend; nunca usar `service_role` |

Conferir sem imprimir os valores:

```powershell
Set-Location 'E:\Projects\portfolio'
npx vercel@60.0.1 env list preview --scope marcos-vinicius-f-santos-projects
npx vercel@60.0.1 env list production --scope marcos-vinicius-f-santos-projects
```

Se faltar alguma variável, adicionar interativamente:

```powershell
npx vercel@60.0.1 env add SUPABASE_URL preview --scope marcos-vinicius-f-santos-projects
# Informe: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel@60.0.1 env add SUPABASE_PUBLISHABLE_KEY preview --scope marcos-vinicius-f-santos-projects
# Cole a publishable key; nunca cole service_role, secret key ou senha

npx vercel@60.0.1 env add SUPABASE_URL production --scope marcos-vinicius-f-santos-projects
# Informe: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel@60.0.1 env add SUPABASE_PUBLISHABLE_KEY production --scope marcos-vinicius-f-santos-projects
# Cole a mesma publishable key
```

Para build local, defina as variáveis somente na sessão atual do PowerShell. Não crie
`.env` versionado e não comite `public/runtime-config.js`:

```powershell
$env:SUPABASE_URL = 'https://jjndvtjhxutuerwvjocy.supabase.co'
$env:SUPABASE_PUBLISHABLE_KEY = 'COLE_AQUI_A_PUBLISHABLE_KEY'
```

`VERCEL_TOKEN` só é necessário em CI. No fluxo manual, use `vercel login`. Não configurar
`SUPABASE_SERVICE_ROLE_KEY`, senha do banco ou qualquer segredo no frontend.

## Passos do deploy

1. Confirmar conta e vínculo da Vercel:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel@60.0.1 whoami
   Get-Content '.vercel\project.json'
   ```

   Confirme `projectName=portfolio`, o Project ID
   `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj` e o org ID
   `team_f40xcyXvtR6SnxVzP1VbKdPW`.

2. Conferir o estado do working tree e não incluir alterações não relacionadas:

   ```powershell
   git status --short
   git diff --check
   git diff --name-only
   ```

   Confirme que `public/runtime-config.js`, `.env*` e credenciais não aparecem no diff.

3. Instalar exatamente o lockfile e executar a verificação local:

   ```powershell
   npm ci
   npm test -- --watch=false --no-progress
   npm run build
   ```

   Pare se qualquer comando falhar. O build esperado fica em
   `E:\Projects\portfolio\dist\portfolio`.

4. Registrar a Production conhecida como boa antes de criar a Preview:

   ```powershell
   npx vercel@60.0.1 ls portfolio --scope marcos-vinicius-f-santos-projects
   ```

   Escolha a deployment `Production/Ready` anterior, copie sua URL imutável e seu ID e
   guarde-os nesta sessão:

   ```powershell
   $KnownGoodUrl = 'COLE_AQUI_A_URL_IMUTAVEL_DA_PRODUCTION_ANTERIOR'
   $KnownGoodDeploymentId = 'COLE_AQUI_O_ID_DA_PRODUCTION_ANTERIOR'
   npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope marcos-vinicius-f-santos-projects
   ```

   Não avance sem uma versão anterior `Ready` conhecida como boa.

5. Conferir o estado remoto do Supabase e fazer o dry-run das migrations:

   ```powershell
   $SupabaseProjectRef = 'jjndvtjhxutuerwvjocy'
   npx supabase@2.117.0 migration list --project-ref $SupabaseProjectRef
   npx supabase@2.117.0 db push --project-ref $SupabaseProjectRef --dry-run
   ```

   Nesta release, as migrations locais relacionadas ao portfólio devem aparecer, em ordem,
   como:

   ```text
   20260923194714_create_portfolio_content.sql
   20260923200309_restrict_portfolio_grants.sql
   20260924090000_rename_company_context_to_name.sql
   20260924205845_add_project_type_to_portfolio_projects.sql
   20260924220000_restrict_curriculum_files_to_pdf.sql
   20260925090000_add_editable_portfolio_catalogs.sql
   20260925120000_enable_admin_media_replacement.sql
   20260925195359_extend_portfolio_public_content.sql
   ```

   O dry-run deve conter somente migrations locais ainda ausentes no Supabase remoto.
   Se aparecer qualquer migration inesperada, pare e revise antes de aplicar.

6. Registrar contagens mínimas antes da alteração do schema, usando conexão autenticada do
   administrador no ambiente controlado:

   ```sql
   select 'experiences' as entity, count(*) from public.portfolio_experiences
   union all select 'projects', count(*) from public.portfolio_projects
   union all select 'skills', count(*) from public.portfolio_skills
   union all select 'academic', count(*) from public.portfolio_academic_entries
   union all select 'contacts', count(*) from public.portfolio_contact_links;
   ```

   Guarde o resultado para comparar depois. Não altere dados manualmente.

7. Aplicar as migrations somente depois de confirmar o dry-run:

   ```powershell
   npx supabase@2.117.0 db push --project-ref $SupabaseProjectRef
   npx supabase@2.117.0 migration list --project-ref $SupabaseProjectRef
   ```

   Pare se alguma migration falhar. Não edite uma migration aplicada e não execute
   `supabase db reset`.

8. Conferir schema, bucket e policies após a migration:

   ```powershell
   npx supabase@2.117.0 db lint --linked --project-ref $SupabaseProjectRef --fail-on error
   npx supabase@2.117.0 db advisors --linked --project-ref $SupabaseProjectRef
   ```

   No SQL Editor autenticado, confirme:

   ```sql
   select id, public, file_size_limit, allowed_mime_types
   from storage.buckets
   where id in ('project-images', 'skill-icons', 'curricula')
   order by id;

   select schemaname, tablename, policyname, cmd, roles
   from pg_policies
   where (schemaname = 'public' and tablename in (
     'portfolio_skills', 'portfolio_academic_entries',
     'portfolio_academic_entry_translations', 'portfolio_contact_links',
     'portfolio_contact_link_translations'
   ))
   or (schemaname = 'storage' and tablename = 'objects')
   order by schemaname, tablename, policyname;

   select routine_name, security_type
   from information_schema.routines
   where routine_schema = 'public'
     and routine_name in (
       'replace_portfolio_project_image',
       'replace_portfolio_curriculum',
       'replace_portfolio_skill_icon'
     )
   order by routine_name;
   ```

   Resultado esperado: bucket `skill-icons` público para leitura, limite de 1048576 bytes,
   escrita/deleção condicionadas ao administrador, nenhuma policy de escrita para `anon` e
   funções de substituição sem `SECURITY DEFINER`.

9. Criar a Preview sem promover para Production:

   ```powershell
   $PreviewUrl = npx vercel@60.0.1 deploy --yes --scope marcos-vinicius-f-santos-projects
   $PreviewUrl
   npx vercel@60.0.1 inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
   ```

   Se a saída tiver texto além da URL, copie manualmente somente a URL `https://*.vercel.app`.

10. Validar a Preview tecnicamente:

    ```powershell
    $PageResponse = npx vercel@60.0.1 curl "$PreviewUrl/" --scope marcos-vinicius-f-santos-projects --yes 2>$null | Out-String
    if ($LASTEXITCODE -ne 0 -or $PageResponse -notmatch '<app-root') {
      throw 'A Preview não retornou o HTML Angular esperado'
    }

    $RuntimeResponse = npx vercel@60.0.1 curl "$PreviewUrl/runtime-config.js" --scope marcos-vinicius-f-santos-projects --yes 2>$null | Out-String
    if ($LASTEXITCODE -ne 0 -or
        $RuntimeResponse -notmatch '__PORTFOLIO_SUPABASE_CONFIG__' -or
        $RuntimeResponse -notmatch 'jjndvtjhxutuerwvjocy\.supabase\.co' -or
        $RuntimeResponse -match 'service_role|secret') {
      throw 'runtime-config.js ausente ou com configuração Supabase insegura'
    }

    npx vercel@60.0.1 logs $PreviewUrl --scope marcos-vinicius-f-santos-projects --level error --since 1h
    ```

11. Validar a Preview no navegador, em desktop e mobile:

    - header fixo, ordem atual, âncoras e ausência de numerações;
    - apresentação, contatos compactos e seção completa `Contact`;
    - alternância `pt-BR`/`en` e fallback para `pt-BR`;
    - experiências da mais recente para a mais antiga, sem empresas;
    - skills com ícone manual, URL válida, URL inválida e sem ícone;
    - formação, projeto novo, imagens e links;
    - login administrativo, edição, inserção, exclusão existente e publicação imediata;
    - rejeição de imagens acima de 1 MB;
    - nenhuma escrita anônima e nenhum erro fatal no console.

    Se qualquer item falhar, não promova a Preview.

12. Depois da revisão explícita de Marcos, promover exatamente a Preview validada:

    ```powershell
    npx vercel@60.0.1 promote $PreviewUrl --yes --scope marcos-vinicius-f-santos-projects
    npx vercel@60.0.1 promote status portfolio --scope marcos-vinicius-f-santos-projects
    npx vercel@60.0.1 ls portfolio --scope marcos-vinicius-f-santos-projects
    ```

## Ordem de migration de banco

1. Conferir o histórico remoto com `migration list`.
2. Executar `db push --dry-run`.
3. Confirmar que o dry-run contém somente as migrations locais pendentes, na ordem
   cronológica listada na etapa 5.
4. Registrar contagens dos dados existentes.
5. Executar `db push`.
6. Conferir migrations, schema, RLS, bucket, policies e funções.
7. Comparar as contagens após a migration.
8. Somente então criar e validar a Preview.

Não executar SQL manual para substituir migration, não editar migration aplicada e não
usar `db reset` em produção.

## Validação depois do deploy

```powershell
$ProductionUrl = 'COLE_AQUI_A_URL_IMUTAVEL_OU_ALIAS_DE_PRODUCTION'

$Response = npx vercel@60.0.1 curl "$ProductionUrl/" --scope marcos-vinicius-f-santos-projects --yes 2>$null | Out-String
if ($LASTEXITCODE -ne 0 -or $Response -notmatch '<app-root') {
  throw 'Production não retornou o HTML Angular esperado'
}

npx vercel@60.0.1 logs $ProductionUrl --scope marcos-vinicius-f-santos-projects --level error --since 15m
```

Depois:

1. Confirmar no dashboard/CLI que a deployment está `Ready` e o alias Production aponta
   para a deployment promovida.
2. Repetir os cenários públicos da etapa 11 nos dois idiomas e em mobile.
3. Entrar na Admin page e confirmar leitura, edição, inserção, exclusão existente e mídia.
4. Confirmar que o conteúdo e as contagens do Supabase permanecem íntegros.
5. Registrar URL, deployment ID, migrations aplicadas, horário e qualquer warning aceito.

## Procedimento de rollback

Execute exatamente nesta ordem em caso de tela em branco, erro fatal, falha de runtime,
erro de autenticação/RLS/Storage ou regressão após a promoção.

### Rollback imediato do frontend

1. Pare novas edições na Admin page e não faça nova promoção.

2. Liste as deployments e confirme o ID conhecido como bom registrado na etapa 4:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel@60.0.1 whoami
   npx vercel@60.0.1 ls portfolio --scope marcos-vinicius-f-santos-projects
   npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope marcos-vinicius-f-santos-projects
   ```

   Só continue se o `inspect` confirmar que o deployment está `Ready` e é a versão
   anterior aprovada.

3. Reaponte Production para a versão conhecida como boa:

   ```powershell
   npx vercel@60.0.1 promote $KnownGoodDeploymentId --yes --scope marcos-vinicius-f-santos-projects
   npx vercel@60.0.1 promote status portfolio --scope marcos-vinicius-f-santos-projects
   ```

4. Confirme que a versão restaurada responde:

   ```powershell
   $RollbackUrl = $KnownGoodUrl
   $RollbackResponse = npx vercel@60.0.1 curl "$RollbackUrl/" --scope marcos-vinicius-f-santos-projects --yes 2>$null | Out-String
   if ($LASTEXITCODE -ne 0 -or $RollbackResponse -notmatch '<app-root') {
     throw 'A versão conhecida como boa não retornou o HTML Angular esperado'
   }
   npx vercel@60.0.1 logs $KnownGoodDeploymentId --scope marcos-vinicius-f-santos-projects --level error --since 15m
   ```

5. Abra o alias Production em janela anônima e confirme carregamento, navegação e idioma.
   Se a versão anterior estiver saudável, encerre o rollback do frontend neste ponto.

### Banco, Storage e dados

1. Não reverta migrations, não execute `db reset`, não use `DROP TABLE`, `DROP BUCKET` e
   não remova objetos do Storage durante o rollback imediato.
2. As migrations desta feature são aditivas; a versão anterior do frontend deve continuar
   lendo o schema anterior sem exigir remoção dos novos campos, tabelas, bucket ou funções.
3. Se o incidente continuar depois do rollback do frontend, mantenha a edição administrativa
   suspensa, preserve os dados e registre o erro de migration/RLS/Storage.
4. Só depois de diagnóstico e nova revisão crie uma migration compensatória versionada:

   ```powershell
   npx supabase@2.117.0 migration new incidente_compensacao_portfolio
   npx supabase@2.117.0 db push --project-ref jjndvtjhxutuerwvjocy --dry-run
   ```

   Não aplique a compensação sem revisar o SQL e confirmar que ela preserva registros e
   objetos existentes. Depois de aplicada, execute `migration list`, `db lint` e as consultas
   de RLS/Storage da etapa 8.

5. Registre horário, sintoma, deployment defeituoso, deployment restaurado, migrations
   aplicadas, impacto nos dados e ação tomada. Nova tentativa exige nova Preview, validação
   e aprovação explícita.

## Notas de recuperação de dados

- O rollback do frontend não remove conteúdo, campos, registros ou objetos do Storage.
- Antes da migration, registrar as contagens da etapa 6 e, em produção, confirmar que o
  backup disponível do projeto Supabase está atual.
- Dados novos gravados pela Admin page depois da migration devem ser preservados mesmo que
  o frontend seja revertido.
- Não armazenar senha do Supabase Auth, senha do banco, `service_role` ou token Vercel
  neste documento.

## Registro pós-deploy

```text
Status: publicado e validado
Horário: 2026-09-25 17:35:27 -03:00
Preview: https://portfolio-8d000jev1-marcos-vinicius-f-santos-projects.vercel.app
Deployment da Preview: dpl_4G2ryunyHZLpqMXXE5puKKgAy89H
Production promovida: https://portfolio-marcos-vinicius-f-santos-projects.vercel.app
Deployment de Production: dpl_9zq1o7SFFpkdPfkAfVocyDGsmqyn
Migrations aplicadas: 20260925195359_extend_portfolio_public_content.sql
Validação pública: HTML, runtime-config, smoke visual desktop e console sem erros
Validação administrativa: não executada neste deploy
RLS/Storage validados: db lint sem erros, security advisors sem issues, buckets e funções conferidos; consulta ampla de policies não concluída
Rollback executado: não; alvo conhecido como bom: dpl_BameZjc8zinGp9jSTNwVSvZuiHqL
Aprovação de Marcos: recebida antes da promoção
```

**Aprovado pra deploy?**
