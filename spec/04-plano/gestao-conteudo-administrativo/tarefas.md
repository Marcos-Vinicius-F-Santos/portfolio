# Tarefas — Gestão de conteúdo pela área administrativa

Plano relacionado: `spec/04-plano/gestao-conteudo-administrativo/plano.md`  
Spec relacionada: `spec/03-features/gestao-conteudo-administrativo/spec.md`  
Status: Aprovado

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia os FR-XXX
que implementa ou verifica e define como saber que ficou pronta. Executar em ordem
numérica, sem pular fases. Nenhuma tarefa está concluída antes da implementação e da
verificação correspondente.

## Fase 1 — Base

- [ ] T-001 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Consolidar o contrato de conteúdo e os campos obrigatórios das specs relacionadas.
  - Arquivos/módulos: `spec/03-features/`, `src/app/features/portfolio/content/`, migrations existentes e documentação das features públicas.
  - Verificação: cada um dos sete tipos de conteúdo possui origem, campos obrigatórios, locale, regra de ordem quando aplicável e operação de adição/edição identificados; divergências são registradas antes de qualquer código.

- [ ] T-002 [FR-001, FR-002, FR-003, FR-004] Inventariar a diferença entre o contrato atual e a gestão persistida exigida.
  - Arquivos/módulos: `portfolio-content.ts`, `portfolio-content.models.ts`, `portfolio-content.service.ts`, `supabase/migrations/` e `admin-workspace.ts`.
  - Verificação: textos, resultados, experiências e projetos são mapeados às tabelas existentes; habilidades, formação e contatos são explicitamente identificados como catálogos locais sem persistência administrativa.

- [ ] T-003 [FR-001, FR-002, FR-003, FR-004, FR-006] Aprovar Registro de Decisão para o modelo persistido de habilidades, formação e contatos.
  - Arquivos/módulos: `spec/02-arquitetura/DECISAO_TEMPLATE.md` e novo registro em `spec/02-arquitetura/`.
  - Verificação: o registro define tabelas/relacionamentos, locale, ordem, campos de contato, compatibilidade com a arquitetura e rollback; Marcos aprova antes da migration.

- [ ] T-004 [FR-003, FR-005, FR-006] Registrar a estratégia de consistência do salvamento e o mecanismo simples de log de falhas.
  - Arquivos/módulos: Registro de Decisão em `spec/02-arquitetura/`, contrato do serviço de conteúdo e documentação operacional.
  - Verificação: está definido como evitar falso sucesso e detectar falha após persistência; o mecanismo de log escolhido é observável, simples, não cria infraestrutura desnecessária e não depende de segredo no frontend.

- [ ] T-005 [FR-003, FR-005, FR-006] Criar as migrations versionadas, policies, grants e rollback necessários.
  - Arquivos/módulos: `supabase/migrations/` e documentação de rollback.
  - Verificação: migration executa sem alterar migrations aplicadas diretamente, mantém leitura pública, restringe insert/update a Marcos, não concede delete e possui rollback revisado; auditoria não inventa dados existentes.

- [ ] T-006 [FR-001, FR-002, FR-003, FR-004] Confirmar o contrato de criação/edição de conteúdo na rota administrativa existente.
  - Arquivos/módulos: `src/app/app.routes.ts`, `src/app/core/auth/`, `src/app/features/admin/admin-page/`.
  - Verificação: `/admin` continua protegido pelo guard existente e o workspace é o único ponto de entrada da gestão; não há nova autenticação ou rota pública criada.

## Fase 2 — Lógica principal

- [ ] T-007 [FR-001, FR-002, FR-005] Criar modelos de edição, locale e validação compartilhados.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.models.ts` e `src/app/features/admin/content-management/`.
  - Verificação: os modelos representam os campos obrigatórios das specs, duas versões (`pt-BR` e `en`), ordem quando aplicável e erros de validação sem duplicar contratos incompatíveis.

- [ ] T-008 [FR-001, FR-002, FR-003, FR-004] Implementar leitura e escrita de textos e resultados dentro das seções e chaves públicas existentes.
  - Arquivos/módulos: serviço/repositório em `src/app/features/portfolio/content/` e orquestração em `src/app/features/admin/content-management/`.
  - Verificação: Marcos consegue carregar, adicionar e editar os itens suportados nas duas versões; após confirmação do salvamento, a leitura pública retorna o valor salvo.

- [ ] T-009 [FR-001, FR-002, FR-003, FR-004] Implementar leitura e escrita de experiências, incluindo traduções e ordem.
  - Arquivos/módulos: adaptador do domínio de conteúdo e serviço de gestão administrativa.
  - Verificação: os campos obrigatórios de experiência são validados, as duas caixas de idioma são persistidas e `display_order` altera a ordem pública sem quebrar a ordenação cronológica existente.

- [ ] T-010 [FR-001, FR-002, FR-003, FR-004] Implementar leitura e escrita de projetos, incluindo tipo, traduções, links e ordem.
  - Arquivos/módulos: adaptador de `portfolio_projects`/`portfolio_project_translations` e serviço administrativo.
  - Verificação: projeto profissional ou pessoal é adicionado/editado com as duas traduções, links e ordem; imagens não são alteradas e o tipo persistido permanece válido.

- [ ] T-011 [FR-001, FR-002, FR-003, FR-004] Implementar leitura e escrita de habilidades, formação e contatos conforme o Registro de Decisão aprovado.
  - Arquivos/módulos: novas estruturas dentro de `src/app/features/portfolio/content/`, serviço administrativo e migration correspondente.
  - Verificação: Marcos consegue adicionar e editar cada tipo, as versões por idioma são carregadas, a ordem aplicável é persistida e a página pública deixa de depender exclusivamente das constantes locais.

- [ ] T-012 [FR-003, FR-004, FR-005, FR-006] Implementar a coordenação de salvamento, confirmação e log.
  - Arquivos/módulos: serviço de gestão em `src/app/features/admin/content-management/` e logger definido no Registro de Decisão.
  - Verificação: sucesso só é exibido após confirmação; falha antes da persistência não publica; falha após persistência é registrada no destino aprovado; a página pública não recebe alteração não confirmada.

- [ ] T-013 [FR-004] Integrar a leitura pública à fonte persistida sem remover o fallback antes da hora.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.ts`, `portfolio-content.service.ts`, modelos e componentes públicos.
  - Verificação: conteúdo salvo aparece após nova leitura/recarregamento, alternância PT/EN usa a caixa correspondente e falha de leitura mantém o fallback seguro existente.

## Fase 3 — Interface

- [ ] T-014 [FR-001, FR-002] Evoluir o workspace administrativo protegido para a composição dos editores.
  - Arquivos/módulos: `src/app/features/admin/admin-page/` e `src/app/features/admin/content-management/`.
  - Verificação: somente Marcos autorizado vê o workspace; o layout apresenta acesso aos sete tipos sem alterar o fluxo de autenticação.

- [ ] T-015 [FR-001, FR-002, FR-005] Criar os editores de textos/resultados com uma caixa por idioma.
  - Arquivos/módulos: `src/app/features/admin/content-management/`.
  - Verificação: cada item editável apresenta uma caixa `pt-BR` e uma `en`; campos obrigatórios inválidos exibem a mensagem padrão e não são enviados como salvamento válido.

- [ ] T-016 [FR-001, FR-002, FR-005] Criar os editores de experiências e projetos.
  - Arquivos/módulos: `src/app/features/admin/content-management/`.
  - Verificação: formulários exibem todos os campos obrigatórios das specs, duas caixas de idioma, controle de ordem aplicável e não oferecem upload de imagens nem exclusão.

- [ ] T-017 [FR-001, FR-002, FR-005] Criar os editores de habilidades, formação e contatos.
  - Arquivos/módulos: `src/app/features/admin/content-management/` e modelos do domínio de conteúdo.
  - Verificação: Marcos consegue adicionar/editar os três tipos, alterar a ordem quando aplicável e receber a mensagem padrão para valores obrigatórios inválidos.

- [ ] T-018 [FR-003, FR-004, FR-005, FR-006] Exibir estados de carregamento, sucesso, falha e log operacional.
  - Arquivos/módulos: componentes da área administrativa e logger da feature.
  - Verificação: a interface não exibe publicação quando o salvamento falha, informa o erro com tratamento padrão e o evento exigido é registrado no destino aprovado.

- [ ] T-019 [FR-004, FR-005] Validar a atualização pública após cada salvamento confirmado.
  - Arquivos/módulos: integração entre admin, serviços de conteúdo e `src/app/features/portfolio/presentation/`.
  - Verificação: recarregar a página pública mostra a alteração salva, sem exigir alteração do layout principal e sem permitir escrita por visitante.

## Fase 4 — Testes

- [ ] T-020 [FR-001, FR-002, FR-005] Testar modelos, validações, duas caixas de idioma e ordem.
  - Arquivos/módulos: testes em `src/app/features/admin/content-management/` e `src/app/features/portfolio/content/`.
  - Verificação: testes cobrem campos obrigatórios de cada spec, mensagem padrão, `pt-BR`, `en`, arrays/links e `display_order` quando aplicável.

- [ ] T-021 [FR-001, FR-002, FR-003, FR-004] Testar os serviços de leitura e escrita de todos os tipos de conteúdo.
  - Arquivos/módulos: testes dos serviços/repositórios de conteúdo e mocks controlados do Supabase.
  - Verificação: adição e edição de textos, resultados, experiências, projetos, habilidades, formação e contatos são persistidas e lidas pela fonte pública correspondente.

- [ ] T-022 [FR-003, FR-005, FR-006] Testar falhas de persistência, falhas após persistência e log.
  - Arquivos/módulos: testes do serviço de gestão e do logger.
  - Verificação: indisponibilidade/recusa não produz falso sucesso; falha após persistência gera evento de log; conteúdo não persistido não aparece publicamente.

- [ ] T-023 [FR-003, FR-005, FR-006] Verificar migration, constraints, grants e RLS em ambiente controlado.
  - Arquivos/módulos: `supabase/migrations/`, policies, evidências em `spec/05-verificacao/gestao-conteudo-administrativo/`.
  - Verificação: anon lê quando permitido, conta não autorizada não escreve, Marcos escreve/atualiza, delete continua negado e rollback está documentado/testado.

- [ ] T-024 [FR-001, FR-002, FR-004] Executar fluxo integrado de adição, edição, idioma, ordem e publicação pública.
  - Arquivos/módulos: aplicação Angular, Supabase de teste e roteiro de verificação da feature.
  - Verificação: cada tipo de conteúdo é adicionado e editado, as duas caixas são conferidas, a ordem muda quando aplicável e a página pública mostra a alteração após nova leitura.

- [ ] T-025 [FR-004, FR-005, FR-006] Executar regressão da autenticação, rota administrativa e página pública.
  - Arquivos/módulos: testes existentes de `src/app/core/auth/`, `src/app/features/admin/`, `src/app/features/portfolio/`, build e verificação browser.
  - Verificação: login/proteção continuam funcionando; visitantes não escrevem; alternância de idioma, experiências, projetos, resultados, habilidades, formação, contatos, currículos e imagens não apresentam regressão óbvia.

- [ ] T-026 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Conferir convergência antes da entrega.
  - Arquivos/módulos: Spec, plano, tarefas, código, migrations, testes e evidências.
  - Verificação: cada FR e AC possui cobertura; riscos residuais, decisões e divergências estão registradas; nenhum item é marcado concluído sem evidência.

## Fase 5 — Entrega

- [ ] T-027 [FR-003, FR-005, FR-006] Documentar configuração, log, migrations e rollback.
  - Arquivos/módulos: documentação em `spec/05-verificacao/` e `spec/06-deploy/`, sem segredos.
  - Verificação: documentação contém ordem de aplicação, destino do log, checagens pós-deploy, rollback frontend/banco e nenhum token, senha ou chave privada.

- [ ] T-028 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Submeter a implementação para revisão e aprovação de Marcos.
  - Arquivos/módulos: diff final, Spec, plano, tarefas e evidências de verificação.
  - Verificação: Marcos revisa e aprova Spec ↔ plano/tarefas ↔ código ↔ testes; nenhum deploy é executado antes dessa aprovação.

## Adiado — fora do escopo desta rodada

- [ ] Upload ou gerenciamento de imagens de projetos.
- [ ] Upload ou substituição de currículos.
- [ ] Exclusão de conteúdos.
- [ ] Rascunho, revisão, aprovação ou publicação posterior.
- [ ] Múltiplos administradores, papéis ou permissões avançadas.
- [ ] Sincronização ou escrita em LinkedIn, GitHub, e-mail ou telefone.
- [ ] Novas páginas públicas ou alteração estrutural do layout para suportar conteúdo
      arbitrário.
