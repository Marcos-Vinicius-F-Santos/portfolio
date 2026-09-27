# Procedimento de Deploy — Gestão de conteúdo pela área administrativa

**Ambiente:** Preview e Production na Vercel, com Supabase remoto  
**Data:** 2026-09-25  
**Status:** executado e validado em 2026-09-25

## Contexto operacional

Este projeto é uma aplicação Angular publicada diretamente pela Vercel CLI. Não há
remote Git configurado neste checkout; portanto, o procedimento usa o projeto já vinculado
em `.vercel/project.json`.

- **Diretório do projeto:** `E:\Projects\portfolio`
- **Projeto Vercel:** `portfolio`
- **Escopo Vercel:** `marcos-vinicius-f-santos-projects`
- **Project ID Vercel:** `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`
- **Projeto Supabase:** `portfolio-profissional`
- **Project ref Supabase:** `jjndvtjhxutuerwvjocy`
- **Região Supabase:** `sa-east-1`
- **CLI Vercel usada no procedimento:** `60.0.1`
- **CLI Supabase usada no procedimento:** `2.117.0`

Os comandos abaixo são PowerShell e devem ser executados na raiz do projeto.

## Pré-condições

- [x] A revisão de convergência da feature foi aprovada.
- [x] Os testes automatizados e o build local passaram na revisão.
- [x] O diff final que será publicado foi revisado no fluxo aprovado.
- [x] Existe uma versão Production `Ready` registrada como referência de rollback:
      `dpl_C6msXkFPnLEVt7HWirarb5JwRinH`.
- [x] A migration da feature foi revisada e aplicada:
      `supabase/migrations/20260925090000_add_editable_portfolio_catalogs.sql`.
- [x] O procedimento de recuperação do Supabase foi revisado antes da migration.
- [x] As variáveis de ambiente da Vercel foram conferidas em Preview e Production.
- [x] Marcos respondeu explicitamente **“Aprovado”**.

Não prossiga enquanto os itens manuais acima estiverem pendentes.

## Variáveis de ambiente e segredos

A feature não cria uma nova variável de ambiente, mas exige que estas duas variáveis
públicas estejam configuradas na Vercel em **Preview** e **Production**:

| Variável                   | Valor esperado                             | Tratamento                                                             |
| -------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| `SUPABASE_URL`             | `https://jjndvtjhxutuerwvjocy.supabase.co` | Pode ser exposta ao navegador                                          |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key do projeto Supabase        | Pode ser exposta ao navegador; nunca usar `service_role` ou secret key |

O build executa `scripts/generate-runtime-config.mjs` e gera
`public/runtime-config.js`. Esse arquivo não deve ser versionado.

Confirme os nomes e ambientes sem imprimir valores secretos:

```powershell
Set-Location 'E:\Projects\portfolio'
$VercelScope = 'marcos-vinicius-f-santos-projects'

npx vercel@60.0.1 env ls --scope $VercelScope
```

Se alguma variável estiver ausente, adicione-a de forma interativa. Não coloque a chave
na linha de comando:

```powershell
npx vercel@60.0.1 env add SUPABASE_URL preview --scope $VercelScope
# Cole: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel@60.0.1 env add SUPABASE_PUBLISHABLE_KEY preview --scope $VercelScope
# Cole a publishable key; nunca use service_role ou secret key

npx vercel@60.0.1 env add SUPABASE_URL production --scope $VercelScope
# Cole: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel@60.0.1 env add SUPABASE_PUBLISHABLE_KEY production --scope $VercelScope
# Cole a mesma publishable key
```

A autenticação da Vercel CLI e o acesso de migration do Supabase são credenciais
operacionais. Use `vercel login` ou o prompt da CLI; informe a senha do banco somente
quando solicitada. Não crie nem registre `VERCEL_TOKEN`, senha do banco, token do
Supabase, `service_role` ou secret key no código, no Markdown ou no Git.

## Passos do deploy

### 1. Confirmar conta, projeto e working tree

```powershell
Set-Location 'E:\Projects\portfolio'
$VercelScope = 'marcos-vinicius-f-santos-projects'
$SupabaseProjectRef = 'jjndvtjhxutuerwvjocy'

npx vercel@60.0.1 whoami
Get-Content '.vercel\project.json'
git status --short
git diff --check
```

Confirme que `.vercel\project.json` aponta para o projeto `portfolio`, o escopo
esperado e o Project ID informado acima. Pare se houver alterações não relacionadas,
se `git diff --check` falhar ou se a conta da Vercel estiver incorreta.

### 2. Registrar a Production conhecida como estável

Antes de aplicar a migration ou criar a Preview, registre a versão Production atual:

```powershell
npx vercel@60.0.1 ls portfolio --scope $VercelScope
```

Na saída, escolha a implantação mais recente com ambiente Production e status Ready.
Guarde os valores, por exemplo:

```powershell
$KnownGoodDeploymentId = 'COLE_AQUI_O_ID_PRODUCTION_READY'
$KnownGoodUrl = 'COLE_AQUI_A_URL_IMUTAVEL_DA_PRODUCTION'
npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope $VercelScope
```

Não avance sem registrar uma versão estável que possa ser promovida em caso de
emergência.

### 3. Conferir e aplicar a migration do Supabase

A migration desta feature é aditiva e cria as tabelas persistidas de habilidades,
formação e contatos. Ela deve ser aplicada antes de publicar o frontend.

Primeiro, confirme a conta Supabase, o histórico e o backup aprovado:

```powershell
npx supabase@2.117.0 migration list --project-ref $SupabaseProjectRef
```

A migration esperada nesta release é:

```text
20260925090000_add_editable_portfolio_catalogs
```

Execute o dry-run:

```powershell
npx supabase@2.117.0 db push --project-ref $SupabaseProjectRef --dry-run
```

Revise se o dry-run contém somente a migration aprovada. Se houver qualquer outra
migration pendente, pare e trate-a separadamente. Depois aplique:

```powershell
npx supabase@2.117.0 db push --project-ref $SupabaseProjectRef
npx supabase@2.117.0 migration list --project-ref $SupabaseProjectRef
```

Verifique que as oito tabelas novas existem, estão com RLS habilitado e possuem
policies de leitura pública e escrita somente para administrador autorizado:

```powershell
npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename in ('portfolio_skill_categories','portfolio_skill_category_translations','portfolio_skills','portfolio_skill_translations','portfolio_academic_entries','portfolio_academic_entry_translations','portfolio_contact_links','portfolio_contact_link_translations') order by tablename;"

npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public' and tablename in ('portfolio_skill_categories','portfolio_skill_category_translations','portfolio_skills','portfolio_skill_translations','portfolio_academic_entries','portfolio_academic_entry_translations','portfolio_contact_links','portfolio_contact_link_translations') order by tablename, policyname;"
```

Pare se a migration falhar, se aparecer alteração não aprovada, se RLS estiver desabilitado
ou se faltar policy de leitura pública, insert ou update administrativo.

### 4. Executar os gates locais

```powershell
npm ci
npm test -- --watch=false --no-progress
npm run build
```

Pare imediatamente se qualquer comando falhar. Os warnings de orçamento já conhecidos
não são erro de compilação, mas uma nova falha ou aumento relevante exige revisão antes
do deploy.

### 5. Criar uma Preview

```powershell
$PreviewUrl = npx vercel@60.0.1 deploy --yes --scope $VercelScope | Select-Object -Last 1
$PreviewUrl
npx vercel@60.0.1 inspect $PreviewUrl --scope $VercelScope
```

Confirme que a saída é uma URL `https://...vercel.app`, que o deployment está Ready e
que o ambiente é Preview. Se a CLI imprimir texto adicional em vez da URL, copie
manualmente a URL retornada e defina `$PreviewUrl`.

### 6. Validar a configuração publicada

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

Não prossiga se a página não carregar ou se `runtime-config.js` estiver vazio, usar
outro projeto ou contiver qualquer chave que não seja publishable.

### 7. Validar o fluxo da feature na Preview

Na URL de Preview:

1. Abra `/` em janela anônima e confirme que a página pública carrega sem login.
2. Abra `/admin` sem sessão e confirme que o acesso administrativo não é concedido.
3. Faça login com credenciais inválidas e confirme a mensagem padrão sem acesso.
4. Faça login com a conta autorizada de Marcos e confirme a área administrativa.
5. Adicione ou edite, usando conteúdo aprovado para teste, os sete tipos: texto/resultado,
   experiência, projeto, habilidade, formação e contato.
6. Para cada texto editável, preencha a box `pt-BR` e a box `en`; altere a ordem onde
   a seção pública tiver ordenação.
7. Salve, recarregue a página pública e confirme o conteúdo nos dois idiomas e a ordem
   esperada.
8. Tente salvar um formulário incompleto e confirme a mensagem padrão de campo inválido.
9. Em ambiente de teste aprovado, simule uma recusa/indisponibilidade do Supabase e
   confirme que a interface não informa sucesso falso e que o erro aparece no log.
10. Teste leitura anônima dos dados públicos e confirme que uma sessão não autorizada
    não consegue inserir ou atualizar conteúdo.
11. Confirme que a alternância PT/EN e as áreas públicas existentes continuam funcionando.

Use somente dados de teste reversíveis na Preview. Não crie conteúdo artificial em
Production como parte desta validação.

### 8. Promover a Preview para Production

Somente depois de todos os passos anteriores e da aprovação explícita de Marcos:

```powershell
npx vercel@60.0.1 promote $PreviewUrl --yes --scope $VercelScope
npx vercel@60.0.1 promote status portfolio --scope $VercelScope
npx vercel@60.0.1 inspect $PreviewUrl --scope $VercelScope
```

Registre o ID e a URL imutável do deployment promovido antes de encerrar o procedimento.

## Validação depois do deploy

Substitua `$TargetUrl` pela URL de Production validada:

```powershell
$TargetUrl = 'COLE_AQUI_A_URL_DE_PRODUCTION'
$PageResponse = npx vercel@60.0.1 curl "$TargetUrl/" --scope $VercelScope --yes 2>$null | Out-String
if ($LASTEXITCODE -ne 0 -or $PageResponse -notmatch '<app-root') {
  throw 'Production não retornou o HTML Angular esperado.'
}

$RuntimeResponse = npx vercel@60.0.1 curl "$TargetUrl/runtime-config.js" --scope $VercelScope --yes 2>$null | Out-String
if ($LASTEXITCODE -ne 0 -or $RuntimeResponse -notmatch '__PORTFOLIO_SUPABASE_CONFIG__' -or $RuntimeResponse -notmatch 'jjndvtjhxutuerwvjocy.supabase.co' -or $RuntimeResponse -notmatch 'sb_publishable_') {
  throw 'Production está sem runtime-config.js válido.'
}

npx vercel@60.0.1 logs $TargetUrl --scope $VercelScope --level error --since 1h
```

No navegador, confirme:

1. `/` carrega para visitante sem login.
2. A alternância PT/EN continua funcionando.
3. `/admin` bloqueia visitante e permite somente Marcos.
4. O conteúdo publicado na Preview está presente em Production.
5. Não há escrita pública nem acesso administrativo para conta não autorizada.
6. Não há erro fatal de inicialização, roteamento ou autenticação nos logs.

## Procedimento de rollback

### A. Rollback de emergência do frontend — executar primeiro

Este caminho não apaga conteúdo nem desfaz a migration. Use-o para tela branca, erro
fatal, configuração Supabase ausente, falha de rota ou acesso administrativo indevido.

1. Pare novas edições e anote o deployment defeituoso:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   $VercelScope = 'marcos-vinicius-f-santos-projects'
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   ```

2. Confirme que `$KnownGoodDeploymentId` ou a URL estável registrada no passo 2 está
   Ready:

   ```powershell
   $KnownGoodDeploymentId = 'COLE_AQUI_O_ID_PRODUCTION_READY'
   $KnownGoodUrl = 'COLE_AQUI_A_URL_IMUTAVEL_DA_PRODUCTION'
   npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope $VercelScope
   ```

   Se não estiver Ready, escolha a implantação Production Ready imediatamente anterior
   na saída do passo 1. Não promova uma implantação com status Error, Building ou
   Canceled.

3. Promova a versão estável:

   ```powershell
   npx vercel@60.0.1 promote $KnownGoodDeploymentId --yes --scope $VercelScope
   npx vercel@60.0.1 promote status portfolio --scope $VercelScope
   ```

4. Confirme que a Production aponta para o deployment estável e faça a checagem mínima:

   ```powershell
   npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope $VercelScope
   $Response = npx vercel@60.0.1 curl "$KnownGoodUrl/" --scope $VercelScope --yes 2>$null | Out-String
   if ($LASTEXITCODE -ne 0 -or $Response -notmatch '<app-root') {
     throw 'A versão estável não retornou o HTML Angular esperado.'
   }
   ```

   Abra `$KnownGoodUrl/` em janela anônima e confirme a página pública e a
   alternância PT/EN.

5. Não execute `supabase db reset`, `DROP TABLE`, exclusão de conteúdo, revogação de
   chave ou alteração de Auth como resposta imediata a uma falha do frontend.

### B. Rollback da migration — somente se a migration for a causa

A versão anterior do frontend pode permanecer funcionando com as tabelas novas presentes;
por isso, não remova o schema só porque houve rollback do frontend.

Execute esta parte somente se a migration precisar ser desfeita, depois de:

1. concluir o rollback do frontend;
2. confirmar que nenhum deployment ativo consulta as oito tabelas novas;
3. exportar/backup dos dados de habilidades, formação e contatos;
4. obter aprovação explícita para remover esses dados persistidos.

No Supabase Dashboard, abra o projeto `portfolio-profissional`
(`jjndvtjhxutuerwvjocy`) → **SQL Editor**, cole e execute a sequência inteira:

```sql
begin;

drop table public.portfolio_contact_link_translations;
drop table public.portfolio_contact_links;
drop table public.portfolio_academic_entry_translations;
drop table public.portfolio_academic_entries;
drop table public.portfolio_skill_translations;
drop table public.portfolio_skills;
drop table public.portfolio_skill_category_translations;
drop table public.portfolio_skill_categories;

commit;
```

Depois, confirme no SQL Editor:

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'portfolio_skill_categories',
    'portfolio_skill_category_translations',
    'portfolio_skills',
    'portfolio_skill_translations',
    'portfolio_academic_entries',
    'portfolio_academic_entry_translations',
    'portfolio_contact_links',
    'portfolio_contact_link_translations'
  );
```

O resultado deve ser vazio. Não remova `portfolio_texts`, `portfolio_experiences`,
`portfolio_projects`, `portfolio_admins`, imagens ou currículos.

Se qualquer `drop table` falhar, não repita em partes: mantenha a transação abortada,
não force a remoção e registre o erro para correção controlada.

## Notas de recuperação de dados

- O rollback do frontend pela Vercel não altera dados do Supabase.
- O rollback da migration remove as tabelas novas e os dados nelas; é destrutivo.
- Textos, resultados, experiências e projetos usam tabelas existentes e não devem ser
  removidos neste rollback.
- Habilidades, formação e contatos mantêm fallback local no frontend; isso permite
  recuperar a página pública sem apagar imediatamente os registros novos.
- Nenhuma senha, token, `service_role` ou secret key deve ser registrada neste documento.
- Registre horário, sintoma, deployment defeituoso, deployment restaurado, migration,
  comandos executados e impacto no banco após qualquer rollback.

## Histórico do deploy

```text
Data: 2026-09-25
Preview validada: https://portfolio-dgv0eeafi-marcos-vinicius-f-santos-projects.vercel.app
Preview deployment: dpl_6bcGqN2VHQHFE3zpvisoM6RUjMXU
Production promovida: https://portfolio-7nv2y25ad-marcos-vinicius-f-santos-projects.vercel.app
Production deployment: dpl_9k7xMyRMoThsQTbJ1Bcqw1MtwUKJ
Alias de Production: https://portfolio-marcos-vinicius-f-santos-projects.vercel.app
Deployment estável anterior: dpl_C6msXkFPnLEVt7HWirarb5JwRinH
Migration aplicada: 20260925090000_add_editable_portfolio_catalogs
Testes: 102 testes em 13 arquivos passaram
Build: passou com warnings de orçamento já conhecidos
Logs: nenhum log de erro encontrado na última hora
Validação manual: autenticação, área administrativa e salvamento sem alteração confirmados na Preview
HTML/runtime Production: confirmados
Rollback necessário: não
Aprovação de Marcos: recebida
```

## Aprovação

O procedimento foi executado após a revisão final e a confirmação explícita:

**Aprovado pra deploy?**
