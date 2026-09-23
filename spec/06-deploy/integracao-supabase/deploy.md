# Procedimento de Deploy — Integração com Supabase

**Ambiente:** produção e preview na Vercel  
**Projeto Vercel:** `portfolio`  
**Escopo Vercel:** `marcos-vinicius-f-santos-projects`  
**Project ID:** `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`  
**Supabase:** `portfolio-profissional` / `jjndvtjhxutuerwvjocy`  
**Região Supabase:** `sa-east-1`  
**Data:** 2026-09-23

O repositório não possui Git remoto configurado. O procedimento real desta entrega usa a
Vercel CLI, já vinculada ao projeto local por `.vercel/project.json`.

## Pré-condições

- [x] Checklist de convergência preenchido em
  `spec/05-verificacao/integracao-supabase/checklist-convergencia.md`.
- [x] `npm test -- --watch=false --no-progress` passou com 58 testes.
- [x] `npm run build` passou.
- [x] Nenhum `service_role`, segredo ou senha está no código.
- [x] As variáveis `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` foram adicionadas à
  Vercel para `production` e `preview`.
- [x] O diff final foi revisado por Marcos.
- [x] Marcos respondeu explicitamente **“Aprovado”** para este deploy.

## Variáveis de ambiente e segredos

Hoje a Vercel não possui variáveis configuradas para o projeto `portfolio`. Antes da
prévia, adicionar estas duas variáveis em `production` e `preview`:

| Variável | Valor | É segredo? | Onde usar |
|---|---|---:|---|
| `SUPABASE_URL` | `https://jjndvtjhxutuerwvjocy.supabase.co` | Não | Build/runtime público |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key do projeto Supabase | Não é `service_role` | Build/runtime público |

`SUPABASE_PUBLISHABLE_KEY` será exposta ao navegador por desenho. Ela deve ser a chave
publishable `sb_publishable_...` copiada em Supabase → Project Settings → API. Nunca
usar `service_role`, secret key ou senha do banco nesta variável.

No PowerShell, a configuração é interativa; cole os valores somente quando a CLI pedir:

```powershell
Set-Location 'E:\Projects\portfolio'

npx vercel env add SUPABASE_URL production --scope marcos-vinicius-f-santos-projects
# Cole: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel env add SUPABASE_PUBLISHABLE_KEY production --scope marcos-vinicius-f-santos-projects
# Cole a publishable key do projeto Supabase

npx vercel env add SUPABASE_URL preview --scope marcos-vinicius-f-santos-projects
# Cole: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel env add SUPABASE_PUBLISHABLE_KEY preview --scope marcos-vinicius-f-santos-projects
# Cole a mesma publishable key do projeto Supabase

npx vercel env ls --scope marcos-vinicius-f-santos-projects
```

Para desenvolvimento local, não criar `.env` versionado. Defina as variáveis somente na
sessão atual do PowerShell antes de iniciar ou compilar:

```powershell
$env:SUPABASE_URL = 'https://jjndvtjhxutuerwvjocy.supabase.co'
$env:SUPABASE_PUBLISHABLE_KEY = 'COLE_AQUI_A_PUBLISHABLE_KEY'
npm run build
```

O arquivo `public/runtime-config.js` é gerado pelo `prebuild`/`prestart` e permanece
ignorado pelo Git.

## Ordem de migration de banco

O projeto remoto já possui estas migrations aplicadas:

```text
20260923194714_create_portfolio_content
20260923200309_restrict_portfolio_grants
```

Antes de cada deploy, confirme o histórico. A CLI pode pedir a senha do banco; digite-a
somente no prompt e nunca a coloque no comando, no Git ou na Vercel:

```powershell
Set-Location 'E:\Projects\portfolio'
npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
```

O resultado precisa conter as duas versões acima. Se houver migration nova nesta release:

```powershell
npx supabase db push --project-ref jjndvtjhxutuerwvjocy --dry-run
npx supabase db push --project-ref jjndvtjhxutuerwvjocy
npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
```

Não usar `--include-seed`: esta feature não possui seed de conteúdo. Aplicar e conferir
as migrations antes de publicar o novo frontend.

## Passos do deploy

1. Abra o PowerShell no projeto e confirme a conta/projeto Vercel:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel whoami
   Get-Content '.vercel\project.json'
   ```

   O usuário deve ser `marcos-vinicius-f-santos`; o `projectName` deve ser `portfolio` e
   o `orgId` deve ser `team_f40xcyXvtR6SnxVzP1VbKdPW`.

2. Confirme que não há alterações não relacionadas:

   ```powershell
   git status --short
   git diff --check
   git diff
   ```

   A release desta feature deve abranger, no mínimo, `src/app/core/`, o serviço e os
   modelos em `src/app/features/portfolio/content/`, `src/app/app.config.ts`,
   `src/index.html`, `scripts/`, `supabase/`, `package.json`, `package-lock.json` e as
   specs/plano/verificação/deploy de `integracao-supabase`.

3. Confirme as migrations e configure as variáveis conforme as seções anteriores.

4. Execute a verificação local com as variáveis públicas carregadas:

   ```powershell
   npm test -- --watch=false --no-progress
   npm run build
   ```

   Pare se qualquer comando falhar.

5. Registre o deployment de produção atual antes de criar a prévia. Esta é a versão
   conhecida como estável no momento deste procedimento:

   ```powershell
   $KnownGoodUrl = 'https://portfolio-6tzm90785-marcos-vinicius-f-santos-projects.vercel.app'
   $KnownGoodId = 'dpl_E5djeir5AVhQmyzfG6Fqb2kFQw2h'
   npx vercel inspect $KnownGoodUrl --scope marcos-vinicius-f-santos-projects
   ```

   Se a produção já tiver mudado, substitua `$KnownGoodUrl` e `$KnownGoodId` pelos dados
   retornados pelo `vercel ls` imediatamente antes do deploy.

6. Crie uma prévia sem publicar em produção:

   ```powershell
   npx vercel deploy --yes --scope marcos-vinicius-f-santos-projects
   ```

   Copie da saída a URL `https://...vercel.app` e defina-a:

   ```powershell
   $PreviewUrl = 'COLE_AQUI_A_URL_DA_PREVIA'
   npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
   ```

7. Valide a prévia conforme a seção abaixo. Não promova se a configuração runtime estiver
   vazia, se a página não abrir ou se a leitura remota gerar erro sem fallback.

8. Depois da aprovação explícita de Marcos, promova exatamente a prévia validada:

   ```powershell
   npx vercel promote $PreviewUrl --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ```

9. Registre o ID e a URL imutável do deployment promovido:

   ```powershell
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
   ```

## Validação depois do deploy

Substitua `$TargetUrl` pela URL da prévia ou pelo alias de produção. Como as previews
podem estar protegidas pela Vercel, use `vercel curl`, que autentica a requisição pela
sessão da CLI sem imprimir o conteúdo completo:

```powershell
$TargetUrl = 'COLE_AQUI_A_URL_VALIDADA'
$pageResponse = (npx vercel curl "$TargetUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or $pageResponse -notmatch '<app-root') {
  throw 'Página não retornou o HTML Angular esperado'
}

$runtimeResponse = (npx vercel curl "$TargetUrl/runtime-config.js" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or $runtimeResponse -notmatch '__PORTFOLIO_SUPABASE_CONFIG__' -or $runtimeResponse -notmatch 'jjndvtjhxutuerwvjocy.supabase.co' -or $runtimeResponse -notmatch 'sb_publishable_') {
  throw 'runtime-config.js ausente ou configuração Supabase inválida'
}

Write-Host "Página e runtime-config.js responderam corretamente em $TargetUrl"
```

No navegador:

1. Abra a URL e confirme que a página pública continua carregando sem erro fatal.
2. Confirme que a página começa em português e que o switch PT/EN continua funcionando.
3. Com o conteúdo remoto ainda sem seed, confirme que o fallback local permanece visível.
4. Abra o DevTools → Network e confirme que as consultas Supabase usam somente a URL do
   projeto e a publishable key; não deve existir `service_role` ou secret key.
5. Confirme que uma consulta pública não exige login.
6. Se houver dados publicados antes desta validação, confirme texto, experiência, projeto,
   traduções, imagens e currículo correspondentes ao idioma selecionado.
7. Em uma janela anônima, confirme que a leitura pública não permite qualquer escrita.

## Procedimento de rollback

Execute na ordem abaixo se a produção apresentar tela em branco, erro fatal, configuração
Supabase ausente ou regressão após a promoção.

1. Pare novas ações e anote a URL/ID do deployment defeituoso:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel whoami
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   ```

2. Promova a versão conhecida como estável. Para o estado registrado neste documento:

   ```powershell
   $KnownGoodUrl = 'https://portfolio-6tzm90785-marcos-vinicius-f-santos-projects.vercel.app'
   $KnownGoodId = 'dpl_E5djeir5AVhQmyzfG6Fqb2kFQw2h'

   npx vercel inspect $KnownGoodUrl --scope marcos-vinicius-f-santos-projects
   npx vercel promote $KnownGoodUrl --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ```

   Se o passo 5 do deploy tiver registrado outro deployment estável, use aquele URL/ID,
   não o exemplo acima.

3. Confirme que o alias de produção voltou para uma versão `Ready`:

   ```powershell
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   npx vercel inspect 'https://portfolio-eight-pied-855iwa1x0n.vercel.app' --scope marcos-vinicius-f-santos-projects
   ```

4. Faça a checagem mínima da página restaurada:

   ```powershell
   $ProductionUrl = 'https://portfolio-eight-pied-855iwa1x0n.vercel.app'
   $response = Invoke-WebRequest -UseBasicParsing "$ProductionUrl/"
   if ($response.StatusCode -ne 200) { throw 'Produção não respondeu HTTP 200 após rollback' }
   ```

   Abra a URL em uma janela anônima e confirme carregamento, navegação e alternância de
   idioma.

5. Não remova as migrations do Supabase durante o rollback do frontend. As migrations desta
   feature são aditivas e a versão anterior do frontend não depende delas. Não execute
   `supabase db reset`, `DROP TABLE`, `DROP BUCKET` ou exclusão manual de dados como resposta
   imediata a uma falha de deploy.

6. Se o incidente for especificamente no banco, preserve primeiro os dados e crie uma
   migration compensatória versionada; nunca edite uma migration já aplicada:

   ```powershell
   npx supabase migration new incidente_compensacao_integracao_supabase
   # Edite o arquivo criado, revise o SQL e só então:
   npx supabase db push --project-ref jjndvtjhxutuerwvjocy --dry-run
   npx supabase db push --project-ref jjndvtjhxutuerwvjocy
   npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
   ```

   A migration compensatória não deve apagar conteúdo sem backup e aprovação específica.

7. Registre no histórico deste documento: horário, sintoma, deployment defeituoso, URL/ID
   restaurado, ação tomada e se houve impacto no Supabase. Uma nova tentativa exige nova
   correção, testes, build, prévia e aprovação.

## Notas de recuperação de dados

- Nesta release não há seed nem conteúdo real inserido pelas telas da aplicação.
- O rollback do frontend não reverte migrations nem apaga dados.
- Se dados forem inseridos posteriormente pela área administrativa, o rollback do frontend
  deve continuar separado de qualquer rollback de banco.
- Não armazenar senha do Supabase Auth, senha do banco ou `service_role` na Vercel. A única
  configuração necessária ao frontend é a URL e a publishable key.

## Histórico do deploy

```text
Status: publicado e validado
Commit publicado: 47500e74295dc7354463355c7eead39bb93ded64
Preview validada: https://portfolio-8l3qbu4s1-marcos-vinicius-f-santos-projects.vercel.app
Preview deployment: dpl_2ppcCmWmpPX5igAnGu8BquddtCPr
Produção promovida: https://portfolio-5xtmjtlch-marcos-vinicius-f-santos-projects.vercel.app
Production deployment: dpl_BaAnS4V7AKad4vZLLKjiFWXV2MMu
Alias de produção: https://portfolio-eight-pied-855iwa1x0n.vercel.app
Deployment anterior: dpl_E5djeir5AVhQmyzfG6Fqb2kFQw2h
Variáveis Supabase: configuradas em Production e Preview
Migrations Supabase: aplicadas e verificadas
Início: 2026-09-23 17:51 BRT
Conclusão: 2026-09-23 17:56 BRT
Validação: página Angular e runtime-config.js confirmados via vercel curl
Observabilidade: nenhum log de erro encontrado na última hora
Rollback necessário: não
Aprovação de Marcos: recebida
```

**Aprovado pra deploy?**
