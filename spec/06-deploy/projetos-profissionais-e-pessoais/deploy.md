# Procedimento de Deploy — Projetos profissionais e pessoais

## Ambiente e escopo

- Projeto Vercel: portfolio
- Escopo Vercel: marcos-vinicius-f-santos-projects
- Vercel Project ID: prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj
- Vercel Organization ID: team_f40xcyXvtR6SnxVzP1VbKdPW
- Projeto Supabase: portfolio-profissional
- Supabase Project Ref: jjndvtjhxutuerwvjocy
- Região Supabase: sa-east-1
- Diretório do checkout: E:\Projects\portfolio
- Estratégia: gerar um Preview remoto na Vercel, validar e promover o mesmo deployment para Production
- Ambientes locais: não utilizados neste procedimento
- Status deste procedimento: aguardando aprovação explícita para deploy

## Pré-condições

- [x] A revisão de convergência da feature foi aprovada por Marcos.
- [ ] O diff final foi revisado e contém somente as mudanças aprovadas.
- [ ] A migration nova passou pelo dry-run remoto.
- [ ] Não há registros existentes sem classificação que façam a migration falhar.
- [ ] As variáveis necessárias estão configuradas no ambiente Production da Vercel.
- [ ] Existe um deployment Production conhecido como estável para rollback.
- [ ] O Preview remoto foi validado visualmente em desktop e mobile.
- [ ] Marcos autorizou explicitamente a promoção para Production.

Se qualquer item obrigatório estiver desmarcado, interromper o procedimento antes da promoção.

## Variáveis de ambiente e segredos

Esta feature não exige uma variável nova.

Variáveis já necessárias no ambiente Production:

| Variável | Uso | Tratamento |
|---|---|---|
| SUPABASE_URL | URL pública do projeto Supabase | Deve apontar para https://jjndvtjhxutuerwvjocy.supabase.co |
| SUPABASE_PUBLISHABLE_KEY | Acesso público do cliente web ao Supabase | Deve ser a chave publishable/anon. Nunca usar service_role ou outra chave secreta |
| VERCEL_TOKEN | Autenticação opcional da CLI em CI | Não é necessária para a execução manual autenticada. Nunca registrar o valor no repositório ou na saída |

A chave service_role não deve ser adicionada ao frontend, ao runtime-config.js, às variáveis públicas da Vercel ou a qualquer commit.

## Procedimento de deploy

### 1. Confirmar identidade e projeto remoto

No PowerShell, em E:\Projects\portfolio:

    npx vercel whoami

Confirmar que a conta retornada tem acesso ao escopo marcos-vinicius-f-santos-projects.

Confirmar que E:\Projects\portfolio\.vercel\project.json ainda contém:

    projectId: prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj
    orgId: team_f40xcyXvtR6SnxVzP1VbKdPW
    projectName: portfolio

Se a conta, o escopo ou o projeto não forem os esperados, parar.

### 2. Revisar e registrar o conjunto de mudanças

Executar:

    git status --short
    git diff --check
    git diff --name-only

Não executar git add . ou incluir arquivos de ambiente, artefatos de build, credenciais ou mudanças de outra feature.

O conjunto esperado inclui somente os caminhos aprovados da feature, da migration e dos documentos de especificação. Depois da revisão, criar o commit com os arquivos aprovados:

    git add -- src/app/features/portfolio/content src/app/features/portfolio/presentation/portfolio-page spec/02-arquitetura/DECISAO-002-classificacao-tipo-projeto.md spec/03-features/projetos-profissionais-e-pessoais spec/04-plano/projetos-profissionais-e-pessoais spec/05-verificacao/projetos-profissionais-e-pessoais spec/06-deploy/projetos-profissionais-e-pessoais supabase/migrations/20260924205845_add_project_type_to_portfolio_projects.sql
    git diff --cached --check
    git commit -m "feat: apresenta projetos profissionais e pessoais"
    git rev-parse HEAD

Registrar o commit retornado. Se aparecer qualquer arquivo fora do escopo aprovado, parar e revisar antes de continuar.

### 3. Verificar variáveis remotas da Vercel

Executar:

    npx vercel env ls --scope marcos-vinicius-f-santos-projects

Confirmar que SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY existem para Production. Não imprimir valores secretos nem copiá-los para o repositório.

Se alguma variável estiver ausente ou apontar para outro projeto Supabase, parar e corrigir a configuração pela Vercel antes de continuar. Não criar uma chave service_role para resolver erro de frontend.

### 4. Registrar o deployment Production conhecido como estável

Executar:

    npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects

Escolher o deployment Production atualmente servindo a aplicação e registrar seu identificador como KNOWN_GOOD_DEPLOYMENT. Confirmar os detalhes:

    npx vercel inspect KNOWN_GOOD_DEPLOYMENT --scope marcos-vinicius-f-santos-projects

Substituir KNOWN_GOOD_DEPLOYMENT pelo identificador real antes de executar. Esse valor é obrigatório para o rollback de frontend.

### 5. Pré-checar o estado remoto do Supabase

Não usar --local em nenhum comando.

Listar o histórico remoto:

    npx supabase migration list --project-ref jjndvtjhxutuerwvjocy

A ordem esperada das migrations relevantes é:

1. 20260923194714_create_portfolio_content.sql
2. 20260923200309_restrict_portfolio_grants.sql
3. 20260924090000_rename_company_context_to_name.sql
4. 20260924205845_add_project_type_to_portfolio_projects.sql

Antes de aplicar a migration nova, verificar remotamente se a coluna já existe e quantos projetos existem:

    npx supabase db query --project-ref jjndvtjhxutuerwvjocy "select count(*) as projects_total from public.portfolio_projects;"

Se a migration 20260924205845_add_project_type_to_portfolio_projects.sql estiver pendente e projects_total for maior que zero, interromper o deploy. A migration não inventa uma classificação para dados existentes e falhará enquanto houver project_type nulo. Não executar UPDATE manual com valores inferidos.

Se a coluna já existir, não reaplicar nem editar uma migration aplicada. Registrar a divergência e revisar o histórico remoto antes de prosseguir.

### 6. Simular e aplicar a migration aprovada

Executar o dry-run remoto:

    npx supabase db push --project-ref jjndvtjhxutuerwvjocy --dry-run

O dry-run deve listar somente a migration aprovada 20260924205845_add_project_type_to_portfolio_projects.sql, além de confirmar que as migrations anteriores já estão sincronizadas.

Se qualquer migration inesperada aparecer, parar.

Aplicar somente depois de revisar o resultado:

    npx supabase db push --project-ref jjndvtjhxutuerwvjocy

Confirmar o histórico após a aplicação:

    npx supabase migration list --project-ref jjndvtjhxutuerwvjocy

A migration adiciona project_type, restringe os valores a professional ou personal e torna a coluna obrigatória. Ela não deve apagar projetos nem reclassificar dados existentes.

### 7. Validar o schema e o conteúdo remoto

Verificar a distribuição dos tipos:

    npx supabase db query --project-ref jjndvtjhxutuerwvjocy "select project_type, count(*) as total from public.portfolio_projects group by project_type order by project_type;"

Verificar se existem registros sem os campos obrigatórios no idioma canônico pt-BR. A consulta deve retornar zero linhas:

    npx supabase db query --project-ref jjndvtjhxutuerwvjocy "select id, name from public.portfolio_project_translations where locale = 'pt-BR' and (name is null or trim(name) = '' or description is null or trim(description) = '' or problem_context is null or trim(problem_context) = '' or role is null or trim(role) = '' or technical_decisions is null or cardinality(technical_decisions) = 0 or technologies is null or cardinality(technologies) = 0 or results is null or cardinality(results) = 0 or learnings is null or cardinality(learnings) = 0);"

Executar a revisão manual de confidencialidade antes do Preview. Confirmar que o conteúdo aprovado não expõe informação confidencial. Essa revisão é manual nesta feature; não há redator automático ou filtro de segredo no código.

### 8. Criar e inspecionar o Preview remoto

A partir de E:\Projects\portfolio, gerar um Preview:

    npx vercel deploy --yes --scope marcos-vinicius-f-santos-projects

Guardar a URL retornada como PREVIEW_URL e o identificador como PREVIEW_DEPLOYMENT.

Aguardar e inspecionar o build remoto:

    npx vercel inspect PREVIEW_URL --wait --timeout 3m --scope marcos-vinicius-f-santos-projects

Se o build falhar, não promover. Corrigir a causa em um novo commit e repetir o fluxo de Preview.

Verificar remotamente o HTML e a configuração pública:

    npx vercel curl "PREVIEW_URL/" --scope marcos-vinicius-f-santos-projects

Confirmar que o HTML carrega public/runtime-config.js e que esse arquivo contém somente a URL do Supabase e a chave pública esperada. Nunca aceitar uma resposta que contenha service_role, token privado ou segredo.

### 9. Validar o Preview na interface

Abrir PREVIEW_URL remotamente, sem iniciar servidor local, e verificar em desktop e mobile:

- A seção de projetos aparece quando existe ao menos um projeto completo.
- Os projetos profissionais e pessoais aparecem em subseções separadas.
- Uma subseção sem projetos fica oculta.
- Cada projeto apresenta nome, descrição, contexto, papel, decisões técnicas, tecnologias, resultados, aprendizados e links relacionados.
- A ordem dos projetos corresponde ao campo de ordenação editável.
- O idioma selecionado é respeitado; quando a tradução selecionada não existe, o conteúdo pt-BR é usado como fallback.
- Links no formato aprovado, com label e url, são apresentados.
- Não há overflow visual, erro de navegação, erro no console ou conteúdo confidencial.
- A navegação e os conteúdos já existentes continuam acessíveis.

Se qualquer verificação falhar, interromper e não promover.

### 10. Promover o mesmo Preview para Production

Somente após a validação remota e a aprovação explícita de Marcos:

    npx vercel promote PREVIEW_URL --yes --scope marcos-vinicius-f-santos-projects

Acompanhar:

    npx vercel promote status portfolio --scope marcos-vinicius-f-santos-projects
    npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects

Registrar o deployment promovido, o horário e a URL Production. Não reconstruir uma segunda versão para Production; a promoção deve usar o mesmo Preview validado.

## Ordem obrigatória das operações

1. Confirmar identidade Vercel, projeto e checkout.
2. Revisar diff e criar commit.
3. Confirmar variáveis Production.
4. Registrar deployment Production conhecido como estável.
5. Listar migrations remotas.
6. Verificar quantidade e classificação dos projetos.
7. Executar dry-run remoto.
8. Aplicar a migration aprovada.
9. Validar schema, campos obrigatórios e confidencialidade.
10. Criar Preview remoto.
11. Inspecionar o build e runtime-config.js.
12. Validar a interface remotamente.
13. Obter aprovação explícita.
14. Promover o mesmo Preview para Production.
15. Executar a validação pós-deploy.

Não executar supabase db reset, não usar comandos --local, não aplicar seed e não remover manualmente a coluna em Production.

## Validação pós-deploy

Executar:

    npx vercel curl "PRODUCTION_URL/" --scope marcos-vinicius-f-santos-projects
    npx vercel inspect PRODUCTION_DEPLOYMENT --scope marcos-vinicius-f-santos-projects
    npx vercel logs --project portfolio --environment production --level error --since 15m --scope marcos-vinicius-f-santos-projects

Abrir a URL Production remotamente e repetir a verificação visual do Preview. Confirmar também:

- A migration nova aparece como aplicada no histórico remoto.
- A seção e as subseções obedecem às regras da feature.
- A página não expõe segredo no HTML ou no runtime-config.js.
- Não há erros novos de produção.
- A navegação das features existentes continua funcionando.

Registrar os identificadores, URLs e resultados no histórico deste documento.

## Rollback executável

### Rollback de frontend em caso de emergência

Use esta sequência se a versão Production apresentar erro funcional, visual ou de carregamento.

1. Pare qualquer promoção ou novo deploy em andamento.
2. Confirme a conta e o escopo:

       npx vercel whoami

3. Liste os deployments:

       npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects

4. Use o identificador KNOWN_GOOD_DEPLOYMENT registrado antes do deploy. Nunca escolha um deployment apenas pelo nome ou por memória.
5. Confirme o deployment estável:

       npx vercel inspect KNOWN_GOOD_DEPLOYMENT --scope marcos-vinicius-f-santos-projects

6. Faça o rollback:

       npx vercel rollback KNOWN_GOOD_DEPLOYMENT --yes --scope marcos-vinicius-f-santos-projects

7. Aguarde o status:

       npx vercel rollback status portfolio --scope marcos-vinicius-f-santos-projects

8. Confirme qual deployment está servindo Production:

       npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects

9. Valide a página e os erros recentes:

       npx vercel curl "PRODUCTION_URL/" --scope marcos-vinicius-f-santos-projects
       npx vercel logs --project portfolio --environment production --level error --since 15m --scope marcos-vinicius-f-santos-projects

10. Abra PRODUCTION_URL remotamente e confirme que a página, navegação, idioma e conteúdos existentes voltaram a funcionar.
11. Registre horário, deployment revertido, deployment restaurado e sintoma observado.
12. Se o rollback não concluir ou o deployment estável não estiver disponível, não tente reconstruir às pressas. Escale para recuperação pela Vercel e preserve os identificadores exibidos nos comandos.

Como alternativa operacional, se o comando rollback não estiver disponível ou falhar depois de identificar o deployment estável, promover explicitamente o deployment conhecido:

    npx vercel promote KNOWN_GOOD_DEPLOYMENT --yes --scope marcos-vinicius-f-santos-projects
    npx vercel promote status portfolio --scope marcos-vinicius-f-santos-projects

### Rollback da migration Supabase

O rollback de frontend não desfaz a migration. A coluna project_type é aditiva e deve ser preservada durante um rollback de emergência do frontend, pois a versão anterior pode continuar funcionando com a coluna extra.

Se o db push falhar antes de registrar a migration como aplicada:

1. Execute:

       npx supabase migration list --project-ref jjndvtjhxutuerwvjocy

2. Confirme que 20260924205845_add_project_type_to_portfolio_projects.sql não aparece como aplicada.
3. Não apague nem edite a migration.
4. Corrija a causa em um novo commit, execute novamente o dry-run remoto e só então repita o push.

Se a migration já estiver aplicada e houver problema no schema ou nos dados:

1. Faça primeiro o rollback do frontend, conforme a sequência acima.
2. Não execute DROP COLUMN, não edite uma migration aplicada e não remova o registro do histórico.
3. Preserve os dados e faça uma exportação/backup aprovado antes de qualquer alteração estrutural.
4. Abra uma decisão técnica para o rollback do schema.
5. Crie uma migration compensatória versionada somente após aprovação:

       npx supabase migration new rollback_project_type_to_previous_schema

6. Revise o SQL da migration compensatória, faça dry-run remoto e obtenha aprovação explícita antes de aplicar.
7. Depois da aplicação aprovada, valide o schema e o frontend novamente.

O rollback de schema não é automático e não deve ser improvisado às 2h. A opção segura imediata é restaurar o frontend e manter a coluna nova até existir uma migration compensatória revisada.

## Riscos e decisões

- A migration falha se já houver projetos sem project_type. Risco: o deploy de banco pode parar antes da aplicação. Mitigação: preflight remoto e nenhuma classificação inventada. Registro de Decisão: sim, já coberto por DECISAO-002-classificacao-tipo-projeto.md.
- Promover um deployment diferente do Preview validado pode reintroduzir um erro. Risco: divergência entre o que foi testado e o que foi publicado. Mitigação: promover o mesmo PREVIEW_URL.
- Uma chave service_role exposta no frontend comprometeria o banco. Risco: incidente de segurança. Mitigação: validar runtime-config.js e aceitar somente SUPABASE_PUBLISHABLE_KEY. Registro de Decisão: sim, qualquer exceção exige decisão de segurança antes do deploy.
- O rollback da Vercel não reverte dados. Risco: frontend antigo coexistir com schema novo. Mitigação: migration aditiva e preservação de project_type; rollback de schema somente por migration compensatória aprovada.

## Histórico de execução

Preencher durante o deploy:

- Status:
- Commit publicado:
- Known-good deployment:
- Preview URL:
- Preview deployment:
- Production URL/alias:
- Production deployment:
- Migration Supabase:
- Validação remota:
- Warnings aceitos:
- Rollback:
- Aprovação de Marcos:

