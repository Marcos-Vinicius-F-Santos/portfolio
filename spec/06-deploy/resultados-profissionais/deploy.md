# Procedimento de Deploy — Resultados profissionais

Ambiente: Preview e Production na Vercel  
Projeto: `portfolio`  
Escopo Vercel: `marcos-vinicius-f-santos-projects`  
Project ID: `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`  
Diretório local: `E:\Projects\portfolio`  
Data: 2026-09-24  
Status: Aguardando aprovação para deploy

Este projeto não possui remote Git configurado. O fluxo real desta entrega usa a Vercel
CLI, já vinculada ao projeto local por `.vercel/project.json`.

## Pré-condições

- [x] Revisão de convergência preenchida em
      `spec/05-verificacao/resultados-profissionais/checklist-convergencia.md`.
- [x] `npm test -- --watch=false --no-progress` passou com 67 testes.
- [x] `npm run build` passou.
- [x] `npx prettier --check` passou nos arquivos alterados.
- [x] Não há migration, alteração de schema, Storage, RLS ou dado de produção nesta
      feature.
- [x] Não há remote Git; o deploy será feito pela Vercel CLI vinculada ao projeto local.
- [ ] Marcos revisou o diff final e respondeu explicitamente **“Aprovado pra deploy?”**.

## Variáveis de ambiente e segredos

Esta feature não cria, remove ou altera variáveis de ambiente.

As variáveis já existentes da integração Supabase devem permanecer configuradas nos
ambientes `preview` e `production` da Vercel:

| Variável | Mudança nesta feature | Tratamento |
|---|---|---|
| `SUPABASE_URL` | Nenhuma | Confirmar que continua configurada; não imprimir o valor em logs desnecessários |
| `SUPABASE_PUBLISHABLE_KEY` | Nenhuma | Confirmar que continua configurada; deve ser a publishable key, nunca `service_role` ou secret key |

Verifique sem expor valores:

```powershell
Set-Location 'E:\Projects\portfolio'
npx vercel env ls --scope marcos-vinicius-f-santos-projects
```

Se uma variável existente estiver ausente, pare o deploy e restaure-a pelo procedimento
da feature de integração Supabase. Não crie `.env` versionado, não coloque chaves no
Markdown e não cole uma `service_role` no frontend.

## Passos do deploy

1. Abra o PowerShell na raiz e confirme o vínculo local e a conta Vercel:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   Get-Content '.vercel\project.json'
   npx vercel whoami
   ```

   Confirme `projectName: portfolio`, o Project ID acima e o escopo
   `marcos-vinicius-f-santos-projects`. Se a conta ou o projeto forem diferentes, pare.

2. Confirme que as alterações do release estão limitadas à feature e à documentação
   relacionada:

   ```powershell
   git status --short
   git diff --check
   git diff
   ```

   O conjunto esperado inclui:

   - `src/app/features/portfolio/content/`
   - `src/app/features/portfolio/presentation/portfolio-page/`
   - `spec/03-features/resultados-profissionais/`
   - `spec/04-plano/resultados-profissionais/`
   - `spec/05-verificacao/resultados-profissionais/`
   - `spec/06-deploy/resultados-profissionais/`

   Pare se aparecer alteração não relacionada.

3. Instale exatamente as dependências do lockfile e repita as verificações locais:

   ```powershell
   npm ci
   npm test -- --watch=false --no-progress
   npm run build
   npx prettier --check src/app/features/portfolio/content/portfolio-content.ts src/app/features/portfolio/content/portfolio-translations.ts src/app/features/portfolio/content/portfolio-content.spec.ts src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts
   ```

   Continue somente se os 67 testes, o build e o Prettier passarem.

4. Confirme que não há migration para aplicar:

   ```powershell
   git status --short -- 'supabase/migrations'
   ```

   O comando deve não retornar alterações desta feature. Não execute `supabase db push`,
   `supabase db reset` ou qualquer alteração de banco para esta entrega.

5. Crie um commit local revisado para que exista um estado versionado antes da
   publicação:

   ```powershell
   git add -- 'src/app/features/portfolio/content' 'src/app/features/portfolio/presentation/portfolio-page' 'spec/03-features/resultados-profissionais' 'spec/04-plano/resultados-profissionais' 'spec/05-verificacao/resultados-profissionais' 'spec/06-deploy/resultados-profissionais'
   git diff --cached --check
   git diff --cached --stat
   git commit -m 'feat: adiciona resultados profissionais'
   git rev-parse HEAD
   ```

   Registre o SHA retornado. Se o diff staged não corresponder exclusivamente ao release,
   pare antes do commit.

6. Registre a produção conhecida como estável antes de criar a Preview:

   ```powershell
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   npx vercel inspect 'https://portfolio-eight-pied-855iwa1x0n.vercel.app' --scope marcos-vinicius-f-santos-projects
   ```

   Baseline documentado anteriormente:

   ```text
   URL: https://portfolio-eight-pied-855iwa1x0n.vercel.app
   Deployment ID: dpl_BaAnS4V7AKad4vZLLKjiFWXV2MMu
   Deployment anterior disponível: dpl_E5djeir5AVhQmyzfG6Fqb2kFQw2h
   ```

   Se `vercel ls` mostrar uma Production mais recente, substitua o URL e o ID usados no
   rollback pelos valores retornados nesse momento. Não prossiga sem registrar esse
   baseline.

7. Publique uma Preview, sem promover para Production:

   ```powershell
   npx vercel deploy --yes --scope marcos-vinicius-f-santos-projects
   ```

   Copie a URL `https://...vercel.app` retornada e defina-a somente na sessão atual:

   ```powershell
   $PreviewUrl = 'COLE_AQUI_A_URL_DA_PREVIEW'
   npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
   ```

8. Execute toda a validação da seção abaixo na Preview. Se qualquer item falhar, não
   promova. Corrija localmente, repita testes/build, crie nova Preview e valide novamente.

9. Somente após a aprovação explícita de Marcos, promova exatamente a Preview validada:

   ```powershell
   npx vercel promote $PreviewUrl --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ```

10. Registre a implantação promovida e repita a validação na URL de Production:

    ```powershell
    npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
    npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
    ```

## Ordem de migration de banco

Não se aplica. A feature não cria nem altera tabelas, migrations, Storage, policies ou
dados de produção. Não executar comandos de migration como parte deste deploy.

## Validação depois do deploy

Substitua `$TargetUrl` pela URL da Preview ou pelo alias de Production:

```powershell
$TargetUrl = 'COLE_AQUI_A_URL_VALIDADA'
$pageResponse = (npx vercel curl "$TargetUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or $pageResponse -notmatch '<app-root') {
  throw 'A aplicação não retornou o HTML Angular esperado'
}
Write-Host "HTML Angular respondeu corretamente em $TargetUrl"
```

No navegador:

1. Abra a URL em janela anônima e confirme que a página pública carrega sem erro fatal.
2. Confirme a seção **Resultados profissionais** com quatro cards:
   **Redução de tempo**, **Redução de etapas**, **Usuários atendidos** e **Ganhos de
   produtividade**.
3. Confirme os valores aprovados: onboarding de dias para horas, etapas de 8–10 para
   3–5, mais de 2.000 usuários mensais, 30% no tempo de conclusão, aproximadamente 50%
   no esforço de mapeamento JSON e 25% nas solicitações de alteração em formulários.
4. Confirme que o item de navegação leva à seção sem criar nova rota e que os links das
   seções anteriores continuam funcionando.
5. Alterne para inglês e confirme os quatro cards em inglês; volte para português.
6. Verifique uma tradução ausente/fallback somente se houver uma fixture ou configuração
   de Preview que permita fazer isso sem alterar dados de produção.
7. Redimensione para desktop, móvel estreito e móvel largo; confirme ausência de overflow
   horizontal, cards legíveis e navegação utilizável.
8. Abra o console e confirme ausência de erro JavaScript fatal.
9. No dashboard da Vercel, confirme que a implantação está `Ready` e corresponde ao
   commit candidato registrado no passo 5.

## Procedimento de rollback

Execute na ordem abaixo se a Production apresentar tela em branco, erro fatal, seção
quebrada, regressão da navegação ou falha de configuração após a promoção.

1. Pare novas ações e abra o PowerShell na raiz:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel whoami
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   ```

2. Defina o baseline registrado imediatamente antes do deploy. Comece usando a referência
   documentada abaixo; se o passo 6 do deploy tiver registrado uma URL/ID mais recente,
   use os valores daquele registro:

   ```powershell
   $KnownGoodUrl = 'https://portfolio-eight-pied-855iwa1x0n.vercel.app'
   $KnownGoodId = 'dpl_BaAnS4V7AKad4vZLLKjiFWXV2MMu'
   npx vercel inspect $KnownGoodUrl --scope marcos-vinicius-f-santos-projects
   ```

   Só continue se o `inspect` mostrar a implantação `Ready` esperada. Se não mostrar,
   pare e escolha, em `vercel ls`, a última implantação Production conhecida como boa.

3. Promova a versão conhecida como boa:

   ```powershell
   npx vercel promote $KnownGoodUrl --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ```

4. Confirme que a Production voltou para uma implantação `Ready`:

   ```powershell
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   $response = (npx vercel curl "$KnownGoodUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
   if ($LASTEXITCODE -ne 0 -or $response -notmatch '<app-root') {
     throw 'A versão conhecida como boa não respondeu com o HTML Angular esperado'
   }
   ```

5. Abra `$KnownGoodUrl` em janela anônima e confirme carregamento, navegação, alternância
   de idioma e ausência de erro fatal.

6. Não altere variáveis Supabase nem execute rollback de banco para uma falha somente do
   frontend. Esta feature não possui migration nem dado novo para desfazer.

7. Registre o incidente com horário, sintoma, Preview/Production defeituosa, ID da
   implantação promovida e resultado da validação. Uma nova tentativa exige correção,
   testes, build, nova Preview e nova aprovação explícita.

## Notas de recuperação de dados

- Não há dados novos nesta feature para recuperar ou apagar.
- O rollback é somente do frontend na Vercel.
- Não executar `supabase db reset`, `DROP TABLE`, `DROP BUCKET` ou exclusão manual de
  conteúdo como resposta a uma falha deste deploy.
- As variáveis `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` permanecem inalteradas.

## Histórico do deploy

```text
Status: procedimento preenchido; deploy ainda não executado
Baseline documentado: dpl_BaAnS4V7AKad4vZLLKjiFWXV2MMu
Commit da feature: registrar no passo 5 antes da Preview
Preview: registrar após npx vercel deploy
Production promovida: registrar somente após aprovação explícita
Rollback executado: não
Aprovação de Marcos: pendente
```

Aprovado pra deploy?
