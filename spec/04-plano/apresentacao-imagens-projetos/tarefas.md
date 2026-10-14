# Tarefas — Apresentação pública de imagens de projetos

Plano relacionado: `spec/04-plano/apresentacao-imagens-projetos/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para revisão individual, referencia o requisito
`FR-XXX` correspondente e define como verificar que ficou pronta. Nenhuma tarefa deve
ser marcada como concluída antes da implementação e da verificação correspondente.

## Fase 1 — Base

- [ ] T-001 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Confirmar a Spec,
  o contrato `PortfolioProject.images` e a fonte de dados do snapshot publicado.
  - Arquivos/módulos: `spec/03-features/apresentacao-imagens-projetos/spec.md`,
    `src/app/features/portfolio/content/portfolio-content.models.ts`,
    `src/app/features/portfolio/content/published-snapshot-content.service.ts`.
  - Verificação: decisões de primeira imagem, fallback e enquadramento estão refletidas
    na Spec; nenhuma migration ou mudança de fonte de dados é necessária.

- [ ] T-002 [FR-001, FR-002, FR-006] Registrar a baseline dos testes e do comportamento
  atual de cards, galeria, idioma e publicação.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/`,
    `src/app/features/portfolio/presentation/projects/`, suíte de testes existente.
  - Verificação: os testes atuais passam ou falhas preexistentes são registradas antes
    da implementação.

## Fase 2 — Lógica principal

- [ ] T-003 [FR-001, FR-005] Implementar a seleção da primeira imagem por
  `display_order` e a tentativa sequencial da próxima imagem quando a candidata atual
  falhar.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`.
  - Verificação: cada projeto seleciona sua própria imagem; a ordem é respeitada; após
    erro, a próxima imagem válida é tentada sem alterar outros cards.

- [ ] T-004 [FR-004, FR-006] Preservar a filtragem de conteúdo publicado e o estado de
  projeto sem imagem.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`,
    `src/app/features/portfolio/content/published-snapshot-content.service.ts`.
  - Verificação: nenhum dado de rascunho é consultado pela apresentação pública; projeto
    sem imagens continua exibindo seus dados textuais sem candidato de capa.

## Fase 3 — Interface

- [ ] T-005 [FR-001, FR-003, FR-004, FR-005, FR-006] Adicionar a imagem representativa
  ao card de projeto da página única com renderização condicional, alt text e fallback.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html`.
  - Verificação: card com imagem renderiza a capa; card sem imagem não renderiza imagem
    quebrada; falha de carregamento chama a tentativa seguinte; o texto continua legível.

- [ ] T-006 [FR-001, FR-007] Aplicar o enquadramento fixo da capa e o comportamento
  responsivo sem distorção ou rolagem horizontal.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss`.
  - Verificação: imagem usa a área visual definida, preserva proporção, não estoura o
    card e funciona nas viewports desktop e móvel previstas.

- [ ] T-007 [FR-002, FR-003, FR-004, FR-005, FR-007] Revisar a galeria de detalhes e
  fazer somente os ajustes necessários de alt text, fallback e responsividade.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/projects/project-detail.html`,
    `src/app/features/portfolio/presentation/projects/project-detail.scss`.
  - Verificação: uma ou várias imagens aparecem na ordem publicada, podem ser abertas,
    falhas são isoladas e o projeto sem imagens não mostra galeria vazia.

## Fase 4 — Testes

- [ ] T-008 [FR-001, FR-003, FR-004, FR-005] Cobrir a imagem de capa no teste da página
  única.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts`.
  - Verificação: testes cobrem primeira imagem por ordem, alt text, ausência de imagem,
    falha da primeira imagem e tentativa da próxima sem afetar outro projeto.

- [ ] T-009 [FR-002, FR-003, FR-004, FR-005] Cobrir a galeria de detalhes e seus estados
  de erro.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/projects/project-detail.spec.ts`.
  - Verificação: testes cobrem ordem, imagens, links individuais, alt text, imagem
    indisponível, projeto sem imagens e projeto inexistente.

- [ ] T-010 [FR-006, FR-007] Executar regressão de publicação, idioma e layout.
  - Arquivos/módulos: testes da página pública, snapshot/content services e evidências
    em `spec/05-verificacao/apresentacao-imagens-projetos/`.
  - Verificação: conteúdo não publicado não aparece; PT-BR e inglês continuam corretos;
    desktop e mobile não apresentam overflow horizontal.

## Fase 5 — Entrega

- [ ] T-011 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Atualizar as
  evidências e o checklist de convergência da feature.
  - Arquivos/módulos: `spec/05-verificacao/apresentacao-imagens-projetos/`, Spec, plano,
    tarefas, código e testes.
  - Verificação: cada FR e AC possui uma evidência correspondente; divergências estão
    registradas e não há mudança de banco não documentada.

- [ ] T-012 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Revisar o diff,
  executar build/testes finais e preparar rollback.
  - Arquivos/módulos: aplicação Angular, documentação de deploy e rollback da feature.
  - Verificação: build e suíte indicada passam; rollback remove apenas a apresentação da
    capa; Marcos revisa e aprova antes do deploy.

## Adiado (fora do escopo desta rodada)

- [ ] Criar ou alterar upload, substituição, remoção ou publicação de imagens.
- [ ] Alterar tabelas, migrations, buckets, policies, grants ou RPCs do Supabase.
- [ ] Adicionar carrossel, lightbox, zoom avançado ou edição visual da imagem.
- [ ] Definir imagens diferentes por idioma.
- [ ] Processar, comprimir, converter ou recortar arquivos.
