# Procedimento de Deploy — Experiências profissionais

Ambiente: Preview e Production na Vercel, com migration no Supabase de produção
Projeto Vercel: portfolio
Escopo Vercel: marcos-vinicius-f-santos-projects
Project ID: prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj
Supabase: portfolio-profissional / jjndvtjhxutuerwvjocy
Diretório local: E:\Projects\portfolio
Data: 2026-09-24
Status: procedimento preparado; deploy ainda não executado

O repositório não possui remote Git configurado. O fluxo real desta entrega usa a Vercel
CLI no projeto local vinculado por .vercel/project.json. A aplicação Angular é publicada
a partir de dist/portfolio e gera public/runtime-config.js durante o prebuild usando as
variáveis públicas do Supabase.

## Pré-condições

- [x] Marcos informou que a revisão de convergência da feature passou.
- [ ] A suíte automatizada e o build foram executados novamente no estado exato que será
      publicado.
- [ ] A migration de rename foi validada com --dry-run, aplicada e conferida no histórico
      remoto do Supabase.
- [ ] Os registros e traduções aprovados foram conferidos depois da migration.
- [ ] As variáveis de ambiente existentes foram confirmadas em Preview e Production.
- [ ] O diff final foi revisado e existe um estado versionado específico deste release.
- [ ] Marcos aprovou explicitamente a promoção da Preview para Production.

## Variáveis de ambiente e segredos

Esta feature não cria nem altera nomes de variáveis. Ela depende das variáveis públicas já
usadas pela integração Supabase:

| Variável | Mudança nesta feature | Onde configurar | Regra |
|---|---|---|---|
| SUPABASE_URL | Nenhuma | Vercel Preview e Production | Deve apontar para https://jjndvtjhxutuerwvjocy.supabase.co |
| SUPABASE_PUBLISHABLE_KEY | Nenhuma | Vercel Preview e Production | Deve ser a publishable key; nunca service_role, secret key ou senha |
| VERCEL_TOKEN | Não necessário no fluxo manual | Somente CI, se automatizado no futuro | Nunca colocar em código, Markdown ou commit |

Confirme a presença das variáveis sem imprimir seus valores:

~~~powershell
Set-Location 'E:\Projects\portfolio'
npx vercel env ls --scope marcos-vinicius-f-santos-projects
~~~

Se SUPABASE_URL ou SUPABASE_PUBLISHABLE_KEY estiver ausente em qualquer ambiente, pare
o deploy e restaure a configuração pelo procedimento de integração Supabase. Não crie
.env versionado. Para um build local que precise consultar o Supabase, defina as variáveis
apenas na sessão atual do PowerShell:

~~~powershell
$env:SUPABASE_URL = 'https://jjndvtjhxutuerwvjocy.supabase.co'
$env:SUPABASE_PUBLISHABLE_KEY = 'COLE_AQUI_A_PUBLISHABLE_KEY'
~~~

O arquivo public/runtime-config.js é gerado pelo prebuild/prestart e está ignorado pelo
Git. Nunca copie uma chave de service role para ele.

## Passos do deploy

### 1. Confirmar conta e vínculo Vercel

~~~powershell
Set-Location 'E:\Projects\portfolio'
npx vercel whoami
Get-Content '.vercel\project.json'
~~~

Confirme projectName portfolio, projectId prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj,
orgId team_f40xcyXvtR6SnxVzP1VbKdPW e o escopo
marcos-vinicius-f-santos-projects. Se a conta ou o projeto forem diferentes, pare.

### 2. Confirmar o escopo do release

~~~powershell
git status --short
git diff --check
git diff --name-only
~~~

Para esta feature, as alterações esperadas são somente:

- src/app/features/portfolio/content/
- src/app/features/portfolio/presentation/portfolio-page/
- spec/01-produto/SPEC_PRODUTO.md
- spec/02-arquitetura/ARQUITETURA.md
- spec/02-arquitetura/DECISAO-001-publicacao-nome-cargo-experiencias.md
- spec/03-features/experiencias-profissionais/
- spec/04-plano/experiencias-profissionais/
- spec/05-verificacao/experiencias-profissionais/
- spec/06-deploy/experiencias-profissionais/
- supabase/migrations/20260924090000_rename_company_context_to_name.sql

Se aparecer qualquer arquivo fora do escopo, pare e resolva a separação antes de criar o
commit. Não use git add ..

### 3. Instalar, testar e gerar o build

~~~powershell
npm ci
npm test -- --watch=false --no-progress
npm run build
~~~

Continue somente se os testes e o build terminarem sem erro. O build deve gerar
E:\Projects\portfolio\dist\portfolio. O warning já conhecido de orçamento do
portfolio-page.scss não falha o build, mas deve ser registrado: o limite de alerta é
4.00 kB e o arquivo está em aproximadamente 5.07 kB.

### 4. Conferir e aplicar a migration antes da Preview

A ordem esperada no Supabase é:

1. 20260923194714_create_portfolio_content
2. 20260923200309_restrict_portfolio_grants
3. 20260924090000_rename_company_context_to_name

Confira o histórico remoto:

~~~powershell
npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
~~~

A CLI pode solicitar autenticação ou senha do banco. Digite-a somente no prompt; nunca
coloque senha, token ou chave no comando, no Git ou neste documento.

Faça o dry-run e revise que a única alteração desta release é o rename da coluna:

~~~powershell
npx supabase db push --project-ref jjndvtjhxutuerwvjocy --dry-run
~~~

Se o dry-run mostrar qualquer alteração além de
public.portfolio_experiences.company_context para name, pare.

Aplique e confira:

~~~powershell
npx supabase db push --project-ref jjndvtjhxutuerwvjocy
npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
~~~

O histórico precisa mostrar a versão 20260924090000 como aplicada antes de a Preview
ser validada contra os dados reais.

### 5. Validar schema e conteúdo

No SQL Editor do projeto Supabase, execute consultas somente de leitura e confirme que:

- a coluna name existe e company_context não existe mais;
- name contém o nome aprovado da empresa, não uma descrição de contexto;
- cada experiência tem start_date, end_date, name e display_order preenchidos;
- há tradução aprovada em pt-BR e en para título, contexto, responsabilidades, decisões
  técnicas e resultados;
- nenhum valor contém informação confidencial ou placeholder.

Consulta para detectar registros incompletos:

~~~sql
select
  e.id,
  e.start_date,
  e.end_date,
  e.name,
  t.locale,
  t.title,
  t.context,
  coalesce(cardinality(t.responsibilities), 0) as responsibilities_count,
  coalesce(cardinality(t.technical_decisions), 0) as technical_decisions_count,
  coalesce(cardinality(t.results), 0) as results_count
from public.portfolio_experiences e
left join public.portfolio_experience_translations t
  on t.experience_id = e.id
where e.start_date is null
   or e.end_date is null
   or e.name is null
   or btrim(e.name) = ''
   or t.id is null
   or btrim(coalesce(t.title, '')) = ''
   or btrim(coalesce(t.context, '')) = ''
   or coalesce(cardinality(t.responsibilities), 0) = 0
   or coalesce(cardinality(t.technical_decisions), 0) = 0
   or coalesce(cardinality(t.results), 0) = 0;
~~~

O resultado esperado é zero linhas. Se retornar qualquer linha, não promova a Preview.
Corrija os dados pelo fluxo administrativo aprovado ou pare e execute o rollback desta
documentação; não sobrescreva dados manualmente para forçar o deploy.

### 6. Registrar a Production conhecida como boa

Antes da Preview, registre a implantação Production atual:

~~~powershell
npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
~~~

Inspecione a implantação que estiver ativa e Ready:

~~~powershell
$KnownGoodUrl = 'https://portfolio-eight-pied-855iwa1x0n.vercel.app'
npx vercel inspect $KnownGoodUrl --scope marcos-vinicius-f-santos-projects
~~~

O URL acima é a referência conhecida nos procedimentos anteriores. Se vercel ls mostrar
uma Production mais recente, substitua $KnownGoodUrl e registre também o ID retornado.
Não prossiga sem uma versão anterior conhecida como boa.

### 7. Publicar a Preview

~~~powershell
$PreviewUrl = npx vercel deploy --yes --scope marcos-vinicius-f-santos-projects
$PreviewUrl
~~~

Se a saída incluir texto além da URL, copie manualmente somente o endereço
https://...vercel.app:

~~~powershell
$PreviewUrl = 'COLE_AQUI_A_URL_DA_PREVIEW'
npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
~~~

Não promova a Preview neste passo.

### 8. Validar a Preview

Confirme o HTML e a configuração runtime sem imprimir a publishable key:

~~~powershell
$pageResponse = (npx vercel curl "$PreviewUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or $pageResponse -notmatch '<app-root') {
  throw 'A Preview não retornou o HTML Angular esperado'
}

$runtimeResponse = (npx vercel curl "$PreviewUrl/runtime-config.js" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or
    $runtimeResponse -notmatch 'jjndvtjhxutuerwvjocy\.supabase\.co' -or
    $runtimeResponse -notmatch '"publishableKey":"[^"]+"' -or
    $runtimeResponse -match 'service_role|secret') {
  throw 'runtime-config.js ausente, vazio ou com configuração insegura'
}

Write-Host "HTML e configuração runtime válidos em $PreviewUrl"
~~~

No navegador, valide a Preview em desktop, mobile estreito e mobile largo:

1. a página pública abre sem erro fatal;
2. a seção Experiências aparece quando há dados;
3. cada card mostra período MM/YYYY – MM/YYYY, nome da empresa, cargo, contexto,
   responsabilidades, decisões técnicas e resultados;
4. a experiência mais recente aparece primeiro;
5. períodos com mesma posição cronológica respeitam display_order;
6. os nomes das empresas e cargos correspondem ao conteúdo aprovado;
7. a alternância PT/EN atualiza os campos traduzidos;
8. a navegação da página única continua funcionando;
9. não há overflow horizontal nem erro JavaScript no console;
10. nenhuma seção existente desapareceu;
11. não faça alterações de dados de produção somente para testar o caso sem experiências.

Se qualquer item falhar, não promova. Corrija, gere uma nova Preview e valide novamente.

### 9. Promover somente após aprovação explícita

Depois de Marcos revisar a Preview e aprovar a promoção:

~~~powershell
npx vercel promote $PreviewUrl --yes --scope marcos-vinicius-f-santos-projects
npx vercel promote status --scope marcos-vinicius-f-santos-projects
npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
~~~

Registre o commit/estado local, o ID do deployment, a URL imutável e o alias de
Production no histórico ao final deste documento.

## Ordem de migration de banco

Esta feature possui uma migration obrigatória antes da publicação do frontend:

20260924090000_rename_company_context_to_name.sql

Ela renomeia public.portfolio_experiences.company_context para
public.portfolio_experiences.name sem alterar os valores. A ordem operacional é:

1. confirmar as migrations anteriores;
2. executar db push --dry-run;
3. aplicar db push;
4. confirmar 20260924090000 no histórico;
5. validar os registros e traduções;
6. publicar e validar a Preview;
7. somente então promover para Production.

Não execute supabase db reset, não edite uma migration já aplicada e não faça rename
manual pelo SQL Editor fora de uma migration versionada.

## Validação depois do deploy

Use o alias de Production retornado por vercel ls:

~~~powershell
$ProductionUrl = 'COLE_AQUI_O_ALIAS_DE_PRODUCTION'
$response = (npx vercel curl "$ProductionUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
if ($LASTEXITCODE -ne 0 -or $response -notmatch '<app-root') {
  throw 'Production não retornou o HTML Angular esperado'
}
~~~

Depois:

1. confirme no dashboard Vercel que o deployment está Ready;
2. confirme que o alias aponta para o deployment promovido;
3. repita a validação funcional da Preview;
4. confirme a leitura pública dos dados de experiências nos dois idiomas;
5. confirme que nome da empresa, cargo e conteúdo exibidos são os aprovados;
6. confirme no Supabase que a migration 20260924090000 continua aplicada;
7. confira logs recentes da Vercel e o console do navegador para erros fatais;
8. registre horário, deployment, URL, resultado e qualquer warning aceito.

## Procedimento de rollback

Use este procedimento se a Production apresentar tela em branco, erro fatal, seção de
experiências quebrada, dados incorretos ou falha de configuração após a promoção.

### Rollback de emergência do frontend

1. Pare novas promoções e abra o PowerShell:

   ~~~powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel whoami
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   ~~~

2. Defina a implantação conhecida como boa registrada no passo 6:

   ~~~powershell
   $KnownGoodUrl = 'COLE_AQUI_A_URL_KNOWN_GOOD_REGISTRADA_NO_PASSO_6'
   npx vercel inspect $KnownGoodUrl --scope marcos-vinicius-f-santos-projects
   ~~~

   Só continue se o inspect confirmar que ela está Ready e é a versão anterior aprovada.

3. Promova imediatamente a versão conhecida como boa:

   ~~~powershell
   npx vercel promote $KnownGoodUrl --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ~~~

4. Confirme que o alias voltou a responder:

   ~~~powershell
   $response = (npx vercel curl "$KnownGoodUrl/" --scope marcos-vinicius-f-santos-projects 2>$null | Out-String)
   if ($LASTEXITCODE -ne 0 -or $response -notmatch '<app-root') {
     throw 'A versão conhecida como boa não respondeu com o HTML Angular esperado'
   }
   ~~~

5. Abra a Production em janela anônima e confirme página, navegação, idioma e ausência
   de erro fatal antes de mexer no banco.

### Rollback da migration do Supabase

Faça esta parte depois que o frontend antigo estiver novamente ativo. O Supabase não
desfaz migrations aplicadas automaticamente; use uma migration compensatória versionada.

1. Crie uma nova migration, sem editar nem apagar
   20260924090000_rename_company_context_to_name.sql:

   ~~~powershell
   npx supabase migration new rollback_experiencias_name_to_company_context
   ~~~

2. Abra o arquivo criado em supabase/migrations/ e deixe exatamente este SQL:

   ~~~sql
   alter table public.portfolio_experiences
     rename column name to company_context;
   ~~~

3. Faça o dry-run e aplique a compensação:

   ~~~powershell
   npx supabase db push --project-ref jjndvtjhxutuerwvjocy --dry-run
   npx supabase db push --project-ref jjndvtjhxutuerwvjocy
   npx supabase migration list --project-ref jjndvtjhxutuerwvjocy
   ~~~

4. No SQL Editor, confirme que company_context voltou a existir e name não existe mais.
   Confirme também que os valores permaneceram iguais; o rollback é apenas de nome de
   coluna.

5. Registre o nome exato da migration compensatória e o horário no histórico deste
   documento. Preserve o arquivo no Git; nunca remova o histórico de uma migration que
   já foi aplicada.

6. Se a feature for corrigida e tentada novamente depois deste rollback, crie uma nova
   migration versionada para voltar de company_context para name; não reutilize nem edite
   o arquivo já aplicado.

Se o problema for somente visual/frontend e a versão anterior continuar funcional, ainda
assim não altere dados de experiências. O rename não apaga valores, mas o schema deve ser
revertido pela migration compensatória para ficar alinhado ao frontend restaurado.

## Notas de recuperação de dados

- O rename de coluna não deve perder nem transformar valores.
- Não execute supabase db reset, DROP TABLE, DROP COLUMN, exclusão manual de experiências
  ou restauração de backup como primeira resposta.
- Se uma consulta revelar que name contém contexto em vez de nome de empresa, pare a
  publicação e corrija o conteúdo pelo fluxo aprovado; não copie context para name
  automaticamente.
- O rollback do frontend e o rollback da migration são etapas separadas e devem ser
  registradas com horário, deployment e migration compensatória.

## Histórico do deploy

~~~text
Status: procedimento preparado; deploy ainda não executado
Commit/estado candidato:
Preview:
Deployment de Preview:
Production promovida:
Deployment de Production:
Baseline conhecido como bom:
Migration aplicada: 20260924090000_rename_company_context_to_name.sql (pendente de execução)
Migration compensatória: não criada
Validação pós-deploy: pendente
Rollback executado: não
Aprovação de Marcos para promoção: pendente
~~~

**Aprovado pra deploy?**
