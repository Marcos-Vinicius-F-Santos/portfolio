# Plano de Tarefas — Adição da Avante Soluções Digitais como Projeto Profissional

Spec relacionada: [`spec/03-features/projeto-profissional-avante-erp/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/projeto-profissional-avante-erp/spec.md)  
Verificação: [`spec/05-verificacao/projeto-profissional-avante-erp/plano-verificacao.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/05-verificacao/projeto-profissional-avante-erp/plano-verificacao.md)

---

## Fase 0 — Alinhamento da Spec (Gate Inicial)

- [x] **T-000:** Alinhamento com João Vitor sobre a inclusão da Avante Soluções Digitais como Projeto Profissional na vitrine `#portfolio` e com página de detalhes completa `/projetos/:id`.

---

## Fase 1 — Mapeamento de Ícones de Tecnologias

- [x] **T-001 [FR-002]:** Atualizar `src/app/features/portfolio/services/technology-icons.ts` para mapear de forma neutra `primefaces`, `hibernate`, `spring framework`, `sql` e `erp` para ícones do catálogo de assets.
- [x] **T-002 [FR-002]:** Atualizar o teste unitário de resolução de ícones em `src/app/features/portfolio/pages/project-detail/project-detail.component.spec.ts` para garantir cobertura das novas tecnologias.

---

## Fase 2 — População e Validação do Snapshot Editorial

- [x] **T-003 [FR-001]:** Adicionar a entidade de projeto da Avante (`7f41a8c9-9ca4-4155-b6ab-8bf4dcf6c9a9`) e seus 9 itens estruturados (`technicalDecisions-1..4`, `results-1..3`, `learnings-1..2`) em `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`, com traduções completas em `pt-BR` e `en`.
- [x] **T-004 [FR-004]:** Atualizar `spec/05-verificacao/joao-vitor/verify-snapshot.mjs` para validar a contagem atualizada de 6 projetos (4 profissionais e 2 pessoais) e executar a validação.
- [x] **T-005 [FR-003]:** Executar `spec/05-verificacao/joao-vitor/generate-publication-sql.mjs` para regerar `publicar_snapshot_joao_vitor.sql` sincronizado com o novo snapshot.

---

## Fase 3 — Testes, Verificação e Registro

- [x] **T-006:** Executar todos os testes automatizados da aplicação (`npm test -- --watch=false`).
- [x] **T-007:** Executar o portão de conformidade white-label (`npm run check:white-label`).
- [x] **T-008:** Executar a compilação de produção (`npm run build`).
- [x] **T-009:** Documentar as alterações em `docs/alteracoes/` e apresentar o resultado detalhado com as queries SQL necessárias para João Vitor.
