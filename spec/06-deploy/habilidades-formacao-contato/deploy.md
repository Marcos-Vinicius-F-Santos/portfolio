# Procedimento de Deploy — Habilidades, formação acadêmica e contato

Ambiente: Preview e Production na Vercel; dados públicos no Supabase  
Projeto local: `E:\Projects\portfolio`  
Projeto Vercel: `portfolio`  
Escopo Vercel: `marcos-vinicius-f-santos-projects`  
Project ID Vercel: `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`  
Projeto Supabase: `portfolio-profissional`  
Project ref Supabase: `jjndvtjhxutuerwvjocy`  
Região Supabase: `sa-east-1`  
Fluxo: Vercel CLI, pois não há remote Git configurado neste repositório  
Data: 2026-09-24

## Pré-condições

- [ ] Checklist de convergência preenchido em
      `spec/05-verificacao/habilidades-formacao-contato/checklist-convergencia.md`.
- [ ] Spec, plano, tarefas e diff final revisados por Marcos.
- [ ] `npm test -- --watch=false` passou.
- [ ] `npm run build` passou.
- [ ] A migration `20260924220000_restrict_curriculum_files_to_pdf` foi aplicada e
      verificada no projeto Supabase.
- [ ] Existe exatamente um registro PDF para `pt-BR` e um para `en` em
      `public.portfolio_files`.
- [ ] Os dois arquivos estão acessíveis no bucket público `curricula`.
- [ ] O download de cada currículo foi testado na Preview no idioma correspondente.
- [ ] Nenhum PDF foi adicionado ao Git.
- [ ] Nenhum segredo, senha ou `service_role` está no código, no diff ou neste documento.
- [ ] Marcos aprovou explicitamente a promoção para Production.

Não execute a promoção enquanto qualquer pré-condição permanecer desmarcada.

## Variáveis de ambiente e segredos

Esta feature não cria uma variável nova. O build existente precisa continuar recebendo
estas variáveis na Vercel, em **Preview** e **Production**:

| Variável | Valor/configuração | Classificação |
|---|---|---|
| `SUPABASE_URL` | `https://jjndvtjhxutuerwvjocy.supabase.co` | Pública |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key do projeto Supabase | Pública para o frontend; nunca usar `service_role` |

Confirme sem imprimir os valores:

~~~powershell
Set-Location 'E:\Projects\portfolio'
npx vercel env ls --scope marcos-vinicius-f-santos-projects
~~~

Se alguma variável estiver ausente, adicione-a interativamente:

~~~powershell
npx vercel env add SUPABASE_URL preview --scope marcos-vinicius-f-santos-projects
# Informe: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel env add SUPABASE_PUBLISHABLE_KEY preview --scope marcos-vinicius-f-santos-projects
# Cole a publishable key, nunca uma service_role key

npx vercel env add SUPABASE_URL production --scope marcos-vinicius-f-santos-projects
# Informe: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel env add SUPABASE_PUBLISHABLE_KEY production --scope marcos-vinicius-f-santos-projects
# Cole a mesma publishable key
~~~

Não configure `SUPABASE_SERVICE_ROLE_KEY`, senha do banco ou qualquer token no
frontend. `VERCEL_TOKEN` só é necessário em CI; não é necessário no fluxo manual
autenticado com `vercel login`.

## Passos do deploy

### 1. Conferir conta, vínculo e escopo do release

~~~powershell
Set-Location 'E:\Projects\portfolio'
npx vercel whoami
Get-Content '.vercel\project.json'
git status --short
git diff --check
git diff --name-only
~~~

Confirme:

- o usuário Vercel é o usuário do projeto;
- `projectName` é `portfolio`;
- `projectId` é `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`;
- o `orgId` é `team_f40xcyXvtR6SnxVzP1VbKdPW`;
- não existem alterações não relacionadas;
- os PDFs não aparecem no resultado do Git.

Se a CLI não estiver autenticada, execute `npx vercel login`, conclua o login e repita
esta etapa.

### 2. Instalar, testar e gerar o build

~~~powershell
npm ci
npm test -- --watch=false
npm run build
~~~

Pare se houver falha. O build esperado fica em:

~~~text
E:\Projects\portfolio\dist\portfolio
~~~

O warning conhecido de orçamento de `portfolio-page.scss` não interrompe o build, mas
deve ser registrado na revisão do release.

### 3. Aplicar e verificar a migration do contrato PDF

Confira o histórico remoto:

~~~powershell
npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
~~~

Faça o dry-run e confirme que a única alteração nova é a migration da feature:

~~~powershell
npx supabase db push --project-ref jjndvtjhxutuerwvjocy --dry-run
~~~

Se aparecer qualquer alteração inesperada, pare. Em seguida aplique e confira:

~~~powershell
npx supabase db push --project-ref jjndvtjhxutuerwvjocy
npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
~~~

A versão `20260924220000_restrict_curriculum_files_to_pdf` precisa aparecer como
aplicada. A CLI pode solicitar autenticação; informe credenciais somente nos prompts.

No SQL Editor do projeto Supabase, confirme a constraint e o bucket:

~~~sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.portfolio_files'::regclass
  and conname = 'portfolio_files_curriculum_pdf_mime_check';

select id, public, allowed_mime_types
from storage.buckets
where id = 'curricula';
~~~

Resultado esperado: a constraint exige `application/pdf`, o bucket é público e
`allowed_mime_types` contém somente `application/pdf`.

### 4. Disponibilizar e registrar os dois currículos

No Supabase Dashboard, abra o projeto
`jjndvtjhxutuerwvjocy`, vá em **Storage → curricula → Upload files** e envie:

| Locale | Arquivo local | Nome do objeto | MIME |
|---|---|---|---|
| `pt-BR` | `C:\Users\marco\Downloads\Resume_Marcos_Santos_PT.pdf` | `Resume_Marcos_Santos_PT.pdf` | `application/pdf` |
| `en` | `C:\Users\marco\Downloads\Resume_Marcos_Santos.pdf` | `Resume_Marcos_Santos.pdf` | `application/pdf` |

Depois do upload, confirme primeiro que a entrega ainda não possui registros:

~~~sql
select file_type, locale, storage_path
from public.portfolio_files
where file_type = 'curriculum'
order by locale;
~~~

Para o primeiro deploy desta feature, o resultado esperado é zero linhas. Se houver
qualquer linha, pare e faça uma revisão explícita dos arquivos existentes antes de
substituí-los; não use o insert abaixo para sobrescrever dados sem essa revisão.

No SQL Editor, registre os metadados. Os tamanhos abaixo correspondem aos arquivos
fornecidos nesta release: 59011 bytes PT-BR e 56604 bytes inglês.

~~~sql
insert into public.portfolio_files
  (file_type, locale, storage_path, original_name, mime_type, size_bytes)
values
  ('curriculum', 'pt-BR', 'Resume_Marcos_Santos_PT.pdf',
   'Resume_Marcos_Santos_PT.pdf', 'application/pdf', 59011),
  ('curriculum', 'en', 'Resume_Marcos_Santos.pdf',
   'Resume_Marcos_Santos.pdf', 'application/pdf', 56604);
~~~

Confirme antes de prosseguir:

~~~sql
select file_type, locale, storage_path, original_name, mime_type, size_bytes
from public.portfolio_files
where file_type = 'curriculum'
order by locale;
~~~

O resultado precisa ter exatamente duas linhas, uma para `pt-BR` e uma para `en`,
ambas com MIME `application/pdf`. Abra as duas URLs públicas geradas pelo serviço
Storage e confirme HTTP 200 antes de criar a Preview.

### 5. Registrar a Production conhecida como boa

Faça isso antes da nova Preview:

~~~powershell
npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
~~~

Escolha a implantação Production atual que esteja `Ready`, copie sua URL imutável e
guarde-a nesta sessão:

~~~powershell
$KnownGoodUrl = 'COLE_AQUI_A_URL_IMUTAVEL_DA_PRODUCTION_ATUAL'
npx vercel inspect $KnownGoodUrl --scope marcos-vinicius-f-santos-projects
~~~

Não avance sem uma versão anterior conhecida como boa para rollback.

### 6. Criar e inspecionar a Preview

~~~powershell
$PreviewUrl = npx vercel deploy --yes --scope marcos-vinicius-f-santos-projects
$PreviewUrl
~~~

Se a saída tiver texto além da URL, copie manualmente apenas a URL
`https://*.vercel.app`:

~~~powershell
$PreviewUrl = 'COLE_AQUI_A_URL_DA_PREVIEW'
npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
~~~

Não promova a Preview neste passo.

### 7. Validar a Preview

Valide HTML e runtime:

~~~powershell
$pageResponse = (npx vercel curl "$PreviewUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or $pageResponse -notmatch '<app-root') {
  throw 'A Preview não retornou o HTML Angular esperado'
}

$runtimeResponse = (npx vercel curl "$PreviewUrl/runtime-config.js" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or
    $runtimeResponse -notmatch 'jjndvtjhxutuerwvjocy\.supabase\.co' -or
    $runtimeResponse -match 'service_role|secret') {
  throw 'runtime-config.js ausente ou com configuração insegura'
}
~~~

No navegador, confirme nos dois idiomas:

1. As seções “Habilidades”, formação e contato aparecem; contato é a última.
2. O anchor `#stack-tecnica` e a navegação existente continuam funcionando.
3. As seis categorias e todas as tecnologias estão legíveis.
4. LinkedIn, GitHub, e-mail e telefone exibem símbolos e labels e possuem os destinos
   corretos.
5. O currículo PT-BR aparece no idioma português e o inglês aparece no idioma inglês.
6. Cada currículo abre/baixa o PDF correspondente ao idioma.
7. A ausência de currículo não quebra a página e não produz sucesso falso.
8. Não há erro fatal no console nem overflow horizontal em desktop, mobile estreito e
   mobile largo.

Se qualquer item falhar, não promova a Preview. Corrija, repita testes/build, gere nova
Preview e valide novamente.

### 8. Solicitar aprovação e promover

Entregue a Marcos a URL da Preview, o resultado dos testes e as evidências dos dois
downloads. Só depois da resposta explícita de aprovação execute:

~~~powershell
npx vercel promote $PreviewUrl --yes --scope marcos-vinicius-f-santos-projects
npx vercel promote status --scope marcos-vinicius-f-santos-projects
npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
~~~

Registre o ID do deployment promovido, a URL imutável, o horário e o commit/estado local.

## Ordem de migration de banco

A ordem obrigatória é:

1. confirmar migrations anteriores;
2. executar `db push --dry-run`;
3. aplicar `20260924220000_restrict_curriculum_files_to_pdf`;
4. confirmar a constraint e o bucket;
5. enviar os dois PDFs e registrar os dois metadados;
6. verificar URLs públicas e downloads;
7. criar e validar a Preview;
8. somente após aprovação explícita, promover para Production.

Não execute `supabase db reset`, não edite migration aplicada e não altere o schema
manualmente fora de uma migration versionada.

## Validação depois do deploy

~~~powershell
$ProductionUrl = 'COLE_AQUI_A_URL_IMUTAVEL_OU_ALIAS_DE_PRODUCTION'

$response = (npx vercel curl "$ProductionUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or $response -notmatch '<app-root') {
  throw 'Production não retornou o HTML Angular esperado'
}
~~~

Depois:

1. confirme no dashboard Vercel que o deployment está `Ready`;
2. confirme que o alias Production aponta para o deployment promovido;
3. repita a validação funcional da Preview nos dois idiomas;
4. abra os dois links de currículo e confirme o PDF correto;
5. consulte os registros `portfolio_files` e confirme exatamente os dois locales;
6. confira logs recentes e o console do navegador;
7. registre qualquer warning aceito.

## Procedimento de rollback

Execute exatamente na ordem abaixo em caso de tela em branco, erro fatal, currículo
incorreto, falha de runtime ou regressão após a promoção.

### Rollback imediato do frontend

1. Pare novas promoções e liste os deployments:

   ~~~powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel whoami
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   ~~~

2. Use a URL registrada na etapa 5, não uma URL inventada:

   ~~~powershell
   $KnownGoodUrl = 'COLE_AQUI_A_URL_IMUTAVEL_REGISTRADA_ANTES_DA_PREVIEW'
   npx vercel inspect $KnownGoodUrl --scope marcos-vinicius-f-santos-projects
   ~~~

   Só continue se o inspect confirmar que a implantação está `Ready` e é a versão
   anterior aprovada.

3. Reaponte Production para a versão conhecida como boa:

   ~~~powershell
   npx vercel promote $KnownGoodUrl --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ~~~

4. Confirme o rollback antes de mexer no Supabase:

   ~~~powershell
   $response = (npx vercel curl "$KnownGoodUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
   if ($LASTEXITCODE -ne 0 -or $response -notmatch '<app-root') {
     throw 'A versão conhecida como boa não retornou o HTML Angular esperado'
   }
   ~~~

5. Abra o alias Production em janela anônima e confirme carregamento, navegação e idioma.
   Se a versão anterior estiver saudável, encerre o rollback aqui. Não apague os PDFs nem
   os registros apenas porque o frontend foi revertido.

### Rollback da migration do contrato PDF

Só execute esta parte se o problema for causado pelo contrato do banco/Storage e o
frontend anterior já estiver restaurado.

1. Crie uma migration compensatória; não edite a migration já aplicada:

   ~~~powershell
   npx supabase migration new rollback_curriculum_pdf_contract
   ~~~

2. No arquivo criado em `supabase/migrations/`, coloque exatamente:

   ~~~sql
   alter table public.portfolio_files
     drop constraint portfolio_files_curriculum_pdf_mime_check;

   update storage.buckets
   set allowed_mime_types = null
   where id = 'curricula';
   ~~~

3. Revise, faça dry-run, aplique e confirme:

   ~~~powershell
   npx supabase db push --project-ref jjndvtjhxutuerwvjocy --dry-run
   npx supabase db push --project-ref jjndvtjhxutuerwvjocy
   npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
   ~~~

4. No SQL Editor, confirme que a constraint nova foi removida e que o bucket voltou à
   configuração anterior. Não apague os registros nem os objetos PDF durante esse
   rollback.

5. Registre a migration compensatória, horário, sintoma e deployment restaurado. Para
   tentar novamente, corrija a causa, rode testes/build, aplique nova migration se
   necessário, crie nova Preview e aguarde nova aprovação.

Não execute `supabase db reset`, `drop table`, `drop bucket` ou exclusão manual de
currículos como resposta imediata a uma falha de frontend.

## Notas de recuperação de dados

- Os PDFs não devem ser versionados no Git; permanecem no bucket `curricula`.
- Rollback do frontend não remove arquivos nem registros do Supabase.
- O rollback da migration é separado do rollback da Vercel e deve ser compensatório.
- Ao substituir um currículo, envie e valide o novo PDF antes de atualizar o registro;
  mantenha o arquivo anterior até confirmar o download novo.
- Não coloque senhas, tokens, publishable keys ou URLs com credenciais neste documento.

## Registro pós-deploy

~~~text
Status:
Preview:
Deployment da Preview:
Production promovida:
Deployment de Production:
Migration aplicada:
Currículo PT-BR validado:
Currículo inglês validado:
Rollback executado:
Aprovação de Marcos:
~~~

**Aprovado pra deploy?**
