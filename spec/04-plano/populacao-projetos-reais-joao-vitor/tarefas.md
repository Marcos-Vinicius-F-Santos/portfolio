# Tarefas — População de Projetos Reais e Autênticos no Portfólio (João Vitor)

Spec relacionada: `spec/03-features/populacao-projetos-reais-joao-vitor/spec.md`

## Regra das tarefas
Cada tarefa é atômica, implementada na ordem estipulada, referencia os requisitos da spec e só é considerada pronta após validação dos critérios de aceite.

---

## Fase 1 — Catálogo de Tecnologias e Mapeamento de Ícones

- [x] T-001 [FR-001, FR-002] Garantir que todas as tecnologias dos 4 projetos estejam devidamente cadastradas com seus ícones e rótulos.
  - Arquivos: `src/app/features/portfolio/services/technology-icons.ts` e `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`.
  - Tecnologias: `Angular`, `TypeScript`, `RxJS`, `Bootstrap`, `Chart.js`, `Python`, `FastAPI`, `PostgreSQL`, `Redis`, `Docker`, `OpenCV`, `YOLOv8`, `MediaPipe`, `Flutter`, `Dart`, `REST APIs`, `CUDA`.
  - Verificação: cada tecnologia possui mapeamento para seu ícone correspondente sem gerar referências quebradas.

---

## Fase 2 — População e Enriquecimento do Snapshot de João Vitor

- [x] T-002 [FR-001] Adicionar as entidades de projeto para os 4 projetos no `snapshot-joao-v1.json`.
  - Arquivo: `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`.
  - Projetos cadastrados:
    1. SensorEng (`professional`, posição 0)
    2. Aplicativo Ponto IFMG (`professional`, posição 1)
    3. Russian Mastery (`personal`, posição 2)
    4. Pipeline de Visão Computacional para Boxe (`personal`, posição 3)
  - Estrutura: IDs UUID v4 únicos para cada projeto, seus itens de lista (`technicalDecisions`, `results`, `learnings`) e links de projeto.
  - Verificação: JSON válido e em conformidade estrita com o schema `EditorialSnapshotV1`.

- [x] T-003 [FR-001, FR-003] Adicionar traduções completas em `pt-BR` e `en` para os 4 projetos no snapshot.
  - Arquivo: `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`.
  - Campos traduzidos: `name`, `description`, `problemContext`, `solution`, `role`, além de todos os itens de `technicalDecisions`, `results` e `learnings`.
  - Verificação: traduções em ambos os idiomas sincronizadas e alinhadas aos currículos oficiais de João Vitor.

---

## Fase 3 — Geração do Script SQL de Carga e Publicação

- [x] T-004 [FR-005] Regenerar o script SQL de publicação para o Supabase.
  - Arquivos: `spec/05-verificacao/joao-vitor/generate-publication-sql.mjs` e `spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql`.
  - Execução: `node spec/05-verificacao/joao-vitor/generate-publication-sql.mjs`.
  - Verificação: `publicar_snapshot_joao_vitor.sql` gerado com hash SHA-256 válido e payload completo contendo os 4 projetos.

---

## Fase 4 — Validação dos Filtros e Exibição Pública

- [x] T-005 [FR-002, FR-003] Verificar os filtros da vitrine de projetos e páginas de detalhes.
  - Verificação visual/unitária:
    - Filtro "Todos": exibe 4 cards (2 profissionais e 2 pessoais).
    - Filtro "Profissionais": exibe 2 cards (*SensorEng* e *Ponto IFMG*).
    - Filtro "Pessoais": exibe 2 cards (*Russian Mastery* e *Boxe*).
    - Rota `/projetos/:id`: renderiza todos os campos detalhados com Topbar e Footer intactos.

---

## Fase 5 — Gate de Segurança, White-Label e Aprovação

- [x] T-006 [FR-004] Validar blindagem de white-label contra vazamentos de dados ou nomes proibidos no código compartilhado.
  - Execução: `npm run check:white-label`.
  - Critério: Passar com código 0 e zero referências proibidas em `src/`, `scripts/`, `supabase/`, `public/`.

- [x] T-007 [FR-001 até FR-005] Executar a suíte completa de testes automatizados.
  - Execução: `npm test`.
  - Critério: 100% dos testes passando sem nenhuma regressão (183/183 testes).

- [ ] T-008 Portão de Aprovação de João Vitor.
  - Apresentar o resultado completo, evidências e aguardar validação explícita de João Vitor antes de qualquer commit ou push para o GitHub.

