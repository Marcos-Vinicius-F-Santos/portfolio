# Tarefas — Migração de hospedagem para GitHub Pages

Plano relacionado: [plano.md](./plano.md)
Spec relacionada: [spec.md](../../03-features/migracao-hospedagem-github-pages/spec.md)

## Fase 1 — Spec e arquitetura

- [x] **T-001 [FR-001..FR-007]** Atualizar a spec da feature para registrar a migração completa, o baseline da Vercel e as decisões do repositório.
- [x] **T-002** Registrar ADR de hospedagem GitHub Pages, branch `master`, URL do projeto, subcaminho e fallback `404.html`.
- [x] **T-003** Atualizar a spec do produto e a arquitetura ativa para remover Vercel como destino oficial.

## Fase 2 — Build e artefato

- [x] **T-004 [FR-004]** Adicionar build Angular de produção com `base href` `/portfolio/`.
- [x] **T-005 [FR-005]** Criar preparação do artefato com `404.html` e `.nojekyll`.
- [x] **T-006 [FR-003, FR-007]** Validar runtime-config obrigatório e impedir marcadores de segredo no artefato.

## Fase 3 — Workflow

- [x] **T-007 [FR-001, FR-002]** Criar workflow de GitHub Actions para build e publicação do Pages.
- [x] **T-008 [FR-003]** Documentar as Actions Variables públicas necessárias sem incluir valores no Git.

## Fase 4 — Limpeza Vercel

- [x] **T-009 [FR-006]** Remover `vercel.json`, `.vercel/` e scripts exclusivos do fluxo Vercel.
- [x] **T-010 [FR-006]** Marcar documentação histórica Vercel como não operacional, sem apagar evidências de deploy.

## Fase 5 — Verificação

- [x] **T-011 [FR-001..FR-007]** Executar build, testes, checks, inspeção de segurança e `git diff --check`.
- [x] **T-012 [FR-004, FR-005]** Validar artefato local, base, assets, `404.html`, `runtime-config.js` e rotas profundas.
- [ ] **T-013 [FR-001, FR-002, FR-005]** Executar o workflow no GitHub e validar a URL pública do Pages.

## Fase 6 — Entrega

- [ ] **T-014 [FR-007]** Documentar e testar rollback por commit anterior.
- [ ] **T-015** Solicitar revisão e aprovação final antes de remover o projeto remoto Vercel.
