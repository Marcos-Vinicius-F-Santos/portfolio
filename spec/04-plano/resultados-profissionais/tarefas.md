# Tarefas — Resultados profissionais

Plano relacionado: `spec/04-plano/resultados-profissionais/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
que implementa e define como verificar que ficou pronta.

## Fase 1 — Base

- [ ] T-001 [FR-001, FR-006, FR-007] Confirmar os pontos de integração existentes na página pública, no contrato de conteúdo, no serviço de idioma e no fallback original antes de alterar arquivos.
  - Arquivos/módulos: `src/app/features/portfolio/content/`, `src/app/features/portfolio/presentation/portfolio-page/` e testes existentes da página.
  - Verificação: registrar no diff/plano os arquivos reutilizados; confirmar que não será criada nova rota, pasta de domínio, service global ou acesso direto ao Supabase pelo template.

- [ ] T-002 [FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Definir as chaves estáveis do conteúdo dos resultados e estender os tipos locais para representar as quatro categorias de forma independente.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.ts`, `portfolio-translations.ts` e, se necessário, os testes do contrato de conteúdo.
  - Verificação: cada categoria possui uma chave independente; o contrato não exige conteúdo para as quatro categorias simultaneamente; nenhum valor não aprovado é adicionado.

- [ ] T-003 [FR-002, FR-003, FR-004, FR-005, FR-006] Registrar somente os textos, valores, unidades e contextos explicitamente aprovados por Marcos para os resultados disponíveis nesta rodada.
  - Arquivos/módulos: conteúdo local em `src/app/features/portfolio/content/` e, quando aplicável, as chaves já suportadas em `portfolio_texts`/`portfolio_text_translations`.
  - Verificação: cada resultado incluído tem aprovação explícita; categorias sem aprovação permanecem vazias/ausentes; não há placeholder apresentado como resultado real.

## Fase 2 — Lógica principal

- [ ] T-004 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Implementar a seleção independente dos resultados e a regra de exibir somente as categorias com conteúdo aprovado.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` e helpers do domínio de conteúdo, se necessários.
  - Verificação: com quatro resultados disponíveis, todos são selecionados; com apenas parte disponível, somente esses resultados são selecionados; sem nenhum resultado, a seção não é selecionada.

- [ ] T-005 [FR-001, FR-006] Aplicar a regra de ausência total para não renderizar a seção nem seu item de navegação quando não houver resultado aprovado.
  - Arquivos/módulos: `portfolio-page.ts` e a composição de navegação da página pública.
  - Verificação: fixture sem resultados não possui a seção de resultados nem link para ela e continua renderizando as seções existentes.

- [ ] T-006 [FR-007] Reutilizar a seleção de idioma existente e aplicar fallback independente para o conteúdo original de cada resultado sem duplicar a regra de idioma.
  - Arquivos/módulos: `portfolio-content.ts`, `portfolio-translations.ts`, `portfolio-content.service.ts` somente se necessário para o contrato existente, e `portfolio-page.ts`.
  - Verificação: tradução disponível aparece no idioma selecionado; tradução ausente usa o conteúdo original aprovado daquele resultado; a troca de idioma não remove resultados válidos.

## Fase 3 — Interface

- [ ] T-007 [FR-001] Integrar a seção de resultados profissionais à página única e adicionar sua navegação sem alterar os IDs ou destinos das seções existentes.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` e `portfolio-page.ts`.
  - Verificação: existe um ID estável para a seção; o link da navegação leva até ela; apresentação, “Sobre mim”, experiências e stack continuam acessíveis.

- [ ] T-008 [FR-002, FR-003, FR-004, FR-005, FR-006] Renderizar os resultados disponíveis com categoria, valor aprovado e contexto aprovado, sem inventar conteúdo ausente.
  - Arquivos/módulos: `portfolio-page.html` e os dados selecionados pelo domínio de conteúdo.
  - Verificação: o caminho feliz apresenta as quatro categorias quando disponíveis; conteúdo parcial apresenta somente os itens disponíveis; nenhum card ou texto vazio é exibido como resultado.

- [ ] T-009 [FR-001, FR-006] Aplicar o estilo responsivo da seção dentro do domínio de apresentação existente, sem criar uma nova estrutura global de estilos.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss` e estilos globais somente se indispensável.
  - Verificação: validar desktop, móvel estreito e móvel largo; confirmar legibilidade, ausência de overflow horizontal e preservação visual das seções existentes.

## Fase 4 — Testes

- [ ] T-010 [FR-002, FR-003, FR-004, FR-005, FR-006] Cobrir o contrato de conteúdo e a seleção independente das categorias.
  - Arquivos/módulos: testes de `portfolio-content.ts`, `portfolio-content.service.spec.ts` ou novo teste no mesmo domínio, conforme o contrato final.
  - Verificação: testes passam para quatro resultados, conteúdo parcial, conteúdo ausente e resultado sem valor aprovado; nenhum valor é criado pelo código.

- [ ] T-011 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Cobrir o caminho feliz da página pública e o caminho de erro sem resultados.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts`.
  - Verificação: AC-001 e AC-002 são reproduzidos; a seção e sua navegação aparecem quando há conteúdo e desaparecem quando não há conteúdo, sem regressão nas seções atuais.

- [ ] T-012 [FR-007] Cobrir alternância de idioma e fallback independente por resultado.
  - Arquivos/módulos: `portfolio-page.spec.ts` e testes do serviço/helper de conteúdo.
  - Verificação: AC-003 e AC-004 passam; a tradução disponível é exibida no idioma selecionado e a tradução ausente usa o original aprovado.

- [ ] T-013 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Executar regressão da página pública, build e suíte de testes do projeto.
  - Arquivos/módulos: aplicação completa, testes atuais e configuração existente do projeto.
  - Verificação: build e testes concluem sem erro; navegação, idioma, seções existentes e fallback anterior continuam funcionando.

## Fase 5 — Entrega

- [ ] T-014 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Comparar Spec, plano, tarefas, implementação e testes antes da entrega.
  - Arquivos/módulos: diff da feature, `spec/03-features/resultados-profissionais/spec.md`, plano e tarefas.
  - Verificação: todos os FR e AC estão cobertos; nenhum requisito fora da Spec foi introduzido; nenhum schema, migration, autenticação ou área administrativa foi alterado.

- [ ] T-015 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Validar preview, rollback e aprovação final antes de qualquer deploy.
  - Arquivos/módulos: preview da aplicação, checklist de verificação e estado de referência do repositório.
  - Verificação: confirmar comportamento em desktop/móvel, registrar o rollback local da feature e obter a revisão/aprovação de Marcos; não executar deploy antes dessa aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Criar ou alterar tabelas, migrations, policies, buckets ou estrutura de Storage para resultados.
- [ ] Criar área administrativa, autenticação adicional ou fluxo de edição dos resultados.
- [ ] Calcular, auditar ou validar automaticamente os valores profissionais.
- [ ] Criar gráficos, filtros, ordenação interativa ou comparação entre resultados.
- [ ] Criar nova rota pública, nova feature de domínio ou novo serviço global.
- [ ] Inserir valores ou afirmações que não tenham aprovação explícita de Marcos.
