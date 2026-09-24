# Tarefas — Projetos profissionais e pessoais

Plano relacionado: `spec/04-plano/projetos-profissionais-e-pessoais/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
que implementa e define como verificar que ficou pronta.

## Fase 1 — Base

- [ ] T-001 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013] Confirmar os pontos de integração existentes no domínio de conteúdo, no serviço `listProjects()`, na página pública, na navegação, no idioma e nos testes.
  - Arquivos/módulos: `src/app/features/portfolio/content/`, `src/app/features/portfolio/presentation/portfolio-page/`, `supabase/migrations/` e testes existentes.
  - Verificação: registrar que a implementação reutilizará a página única e os serviços existentes; confirmar que não haverá nova rota, acesso direto ao Supabase pelo template, serviço global ou pasta de domínio sem justificativa.

- [ ] T-002 [FR-001, FR-003, FR-012] Criar a migration que persiste o tipo profissional/pessoal em portfolio_projects.
  - Arquivos/módulos: supabase/migrations/, portfolio-content.models.ts, Spec, plano e spec/02-arquitetura/DECISAO-*.md.
  - Verificação: a migration cria project_type com valores professional e personal, preenche somente classificações aprovadas, falha com segurança diante de registro sem classificação e possui rollback documentado; o Registro de Decisão foi criado e aceito.

- [ ] T-003 [FR-002, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-013] Definir o view model de projeto completo, o critério de campos obrigatórios, o fallback pt-BR e o contrato de links label/url.
  - Arquivos/módulos: portfolio-content.models.ts, portfolio-content.service.ts e portfolio-content.service.spec.ts.
  - Verificação: o contrato identifica nome, descrição, contexto, papel, decisões, tecnologias, resultados, aprendizados, links com label/url, tipo, idioma e ordem; os testes documentam projeto incompleto e tradução ausente com fallback para pt-BR.

- [ ] T-004 [FR-001, FR-003, FR-012, FR-013] Definir os identificadores estáveis da seção, os títulos das subseções e as chaves de tradução, preservando os destinos atuais.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.ts`, `portfolio-translations.ts`, `portfolio-page.ts` e `portfolio-page.html`.
  - Verificação: os IDs existentes de apresentação, sobre mim, stack, experiências e resultados permanecem inalterados; as novas chaves possuem português e inglês aprovados.

- [ ] T-005 [FR-001, FR-003, FR-012] Confirmar o uso de `display_order` como ordem configurável dos projetos dentro de cada subseção.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.ts`, modelo de projeto e testes do serviço.
  - Verificação: fixtures com projetos de tipos diferentes preservam a ordem crescente configurada dentro de cada subseção; nenhuma ordem fixa é hardcoded na interface.

## Fase 2 — Lógica principal

- [ ] T-006 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-013] Estender `PortfolioContentService.listProjects()` para retornar o tipo aprovado, os campos normalizados, a ordem e os textos do idioma selecionado.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.ts` e `portfolio-content.models.ts`.
  - Verificação: o serviço consulta somente através da camada de conteúdo; o resultado contém todos os campos do view model; a ordenação usa `display_order`; uma falha de leitura retorna coleção vazia e registra o erro sem quebrar a página.

- [ ] T-007 [FR-002, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010] Filtrar projetos sem nome ou sem qualquer campo obrigatório antes da apresentação.
  - Arquivos/módulos: helper do domínio de conteúdo ou `portfolio-page.ts`, conforme o contrato definido em T-003.
  - Verificação: fixture incompleta não aparece em nenhuma subseção; fixture completa aparece; nenhum texto vazio é renderizado como conteúdo obrigatório.

- [ ] T-008 [FR-001, FR-003, FR-012] Agrupar os projetos completos nas subseções profissional e pessoal e definir `showProjects` conforme a coleção final.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`.
  - Verificação: projetos de ambos os tipos são separados corretamente; quando a coleção final está vazia, `showProjects` é falso; nenhum projeto é atribuído ao tipo errado.

- [ ] T-009 [FR-011] Expor os links armazenados junto ao projeto sem validação prévia e sem gerar links fictícios.
  - Arquivos/módulos: `portfolio-content.models.ts`, `portfolio-content.service.ts`, `portfolio-page.ts` e helper de renderização, se necessário.
  - Verificação: links existentes são preservados na ordem recebida e aparecem no projeto correspondente; coleção vazia de links não gera link visual; a implementação não faz chamada de validação externa.

- [ ] T-010 [FR-013] Integrar a recarga de projetos à alternância de idioma e aplicar fallback para pt-BR quando a tradução selecionada não estiver disponível.
  - Arquivos/módulos: portfolio-page.ts, portfolio-content.service.ts e testes de conteúdo/idioma.
  - Verificação: inicialização, troca manual e resposta ao popup carregam o idioma selecionado; tradução ausente apresenta o conteúdo aprovado em pt-BR; a troca de idioma preserva a existência dos projetos válidos.

## Fase 3 — Interface

- [ ] T-011 [FR-001, FR-003, FR-012] Integrar a seção de projetos à navegação e à página única sem alterar IDs ou destinos das seções existentes.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` e `portfolio-page.html`.
  - Verificação: com projetos completos existe um item de navegação e uma seção com ID estável; sem projetos não existe nem seção nem item; os destinos existentes continuam funcionando.

- [ ] T-012 [FR-001, FR-003] Renderizar as subseções de projetos profissionais e pessoais, ocultando qualquer subseção sem projetos correspondentes.
  - Arquivos/módulos: portfolio-page.html.
  - Verificação: com somente projetos profissionais, a subseção pessoal não aparece; com somente projetos pessoais, a subseção profissional não aparece; com ambos, as duas aparecem; nenhum projeto aparece em ambas.

- [ ] T-013 [FR-002, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010] Renderizar nome, descrição, contexto, papel, decisões técnicas, tecnologias, resultados e aprendizados de cada projeto completo.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html`.
  - Verificação: o caminho feliz apresenta todos os campos obrigatórios por projeto; listas vazias não são usadas para mascarar projeto incompleto; o texto exibido corresponde ao idioma selecionado.

- [ ] T-014 [FR-011] Renderizar os links relacionados no formato label/url dentro do projeto correspondente.
  - Arquivos/módulos: portfolio-page.html.
  - Verificação: cada label aponta para a url do projeto correto; links inexistentes não geram elemento vazio; não há validação externa ou link inventado.

- [ ] T-015 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013] Aplicar o estilo responsivo da seção dentro do domínio existente.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss`.
  - Verificação: desktop, móvel estreito e móvel largo mantêm leitura dos campos, listas e links sem corte, sobreposição ou overflow horizontal; as seções existentes não sofrem regressão visual óbvia.

## Fase 4 — Testes

- [ ] T-016 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-013] Cobrir o contrato e o carregamento de projetos no serviço de conteúdo.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.spec.ts` e testes do modelo/helper.
  - Verificação: testes cobrem tipo profissional/pessoal, ordem por `display_order`, campos obrigatórios, traduções, fallback, links e resposta a erro de leitura.

- [ ] T-017 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012] Cobrir o caminho feliz da página pública e a ausência total de projetos.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts`.
  - Verificação: AC-001 e AC-002 são reproduzidos; as duas subseções, todos os campos e links aparecem no caminho feliz; sem projetos a seção e a navegação não aparecem.

- [ ] T-018 [FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011] Cobrir projeto incompleto, projeto sem links e separação incorreta de tipos.
  - Arquivos/módulos: `portfolio-page.spec.ts` e testes do serviço.
  - Verificação: projetos incompletos não são renderizados; ausência de links não gera link vazio; cada projeto aparece somente na subseção correspondente.

- [ ] T-019 [FR-013] Cobrir alternância de idioma e fallback dos projetos para pt-BR.
  - Arquivos/módulos: portfolio-page.spec.ts, portfolio-content.service.spec.ts e helper de conteúdo, se necessário.
  - Verificação: troca português↔inglês atualiza os textos sem remover projetos válidos; tradução ausente apresenta o conteúdo aprovado em pt-BR.

- [ ] T-020 [FR-001, FR-003, FR-012, FR-013] Executar regressão da página pública, navegação, idioma, build e suíte completa de testes.
  - Arquivos/módulos: aplicação completa, testes existentes e configuração do projeto.
  - Verificação: build e testes terminam sem erro; IDs e destinos atuais continuam funcionando; alternância de idioma e seções existentes permanecem estáveis.

- [ ] T-021 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013] Fazer verificação visual e revisão manual de conteúdo antes da entrega.
  - Arquivos/módulos: preview local/preview de deploy, checklist de verificação e fixtures aprovadas.
  - Verificação: validar desktop e móvel; confirmar ausência de informação confidencial; confirmar que nenhum placeholder, link fictício ou conteúdo não aprovado foi apresentado.

## Fase 5 — Entrega

- [ ] T-022 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013] Comparar Spec, plano, tarefas, implementação e testes.
  - Arquivos/módulos: diff da feature, `spec/03-features/projetos-profissionais-e-pessoais/spec.md`, plano, tarefas e testes.
  - Verificação: cada FR e AC possui implementação e teste/verificação correspondente; divergências estão registradas; nenhuma alteração fora do escopo foi incluída.

- [ ] T-023 [FR-001, FR-003, FR-012] Validar preview, rollback e o Registro de Decisão da classificação dos projetos.
  - Arquivos/módulos: preview da aplicação, supabase/migrations/, spec/02-arquitetura/ e procedimento de rollback.
  - Verificação: preview confirma subseções, ausência total, navegação, idioma e responsividade; rollback da migration e da interface está documentado; o Registro de Decisão da classificação está aceito.

- [ ] T-024 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013] Submeter o resultado para revisão e aprovação final de Marcos antes de qualquer deploy.
  - Arquivos/módulos: resultado final da feature, checklist de convergência e preview.
  - Verificação: Marcos revisou e aprovou a feature; nenhum deploy é executado antes dessa aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Criar ou alterar a área administrativa para cadastrar, editar, excluir ou
      reordenar projetos.
- [ ] Alterar constraints do banco para tornar os campos obrigatórios.
- [ ] Implementar upload ou galeria de imagens na apresentação dos projetos.
- [ ] Criar validação automática, crawler ou teste de disponibilidade dos links.
- [ ] Criar filtros, ordenação interativa ou novas páginas públicas.
