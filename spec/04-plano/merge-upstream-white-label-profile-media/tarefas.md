# Tarefas — Merge de Upstream: Arquitetura White-Label e Gestão de Mídia de Perfil

Spec relacionada: [spec/03-features/merge-upstream-white-label-profile-media/spec.md](../../03-features/merge-upstream-white-label-profile-media/spec.md)

## Regra das tarefas

Cada tarefa é incremental, referencia os requisitos `FR-XXX` implementados e estabelece o critério exato de verificação. A execução só deve iniciar após a confirmação e aprovação de João Vitor.

---

## Fase 1 — Alinhamento e Preparação

- [x] T-001 [FR-007, FR-008] Esclarecer com João Vitor as decisões pendentes antes do merge
  - Verificação: Decisões aprovadas: arquivo único `.env`, Opção B (sem `#experiencias`) e upload posterior de foto via `/admin/midias`.

- [ ] T-002 [FR-007] Configurar arquivo local `.env` com as variáveis de identidade de João Vitor
  - Arquivos: `.env`
  - Verificação: O arquivo `.env` contém `PORTFOLIO_AUTHOR_NAME=João Vitor`, `PORTFOLIO_BRAND_INITIALS=JV`, `PORTFOLIO_PROFILE_ID=profile-generic`, não havendo `.env.local`.

---

## Fase 2 — Execução do Merge e Resolução de Conflitos

- [ ] T-003 [FR-001, FR-004, FR-008] Executar git merge de `upstream/master` priorizando a arquitetura do upstream
  - Arquivos: árvore git completa
  - Verificação: `git merge upstream/master` executado; conflitos resolvidos adotando as alterações do upstream (Opção B, remoção de referências autorais no código).

- [ ] T-004 [FR-004] Sanar defeito residual de marcadores de conflito git no `angular.json`
  - Arquivos: `angular.json`
  - Verificação: `angular.json` sem marcadores `<<<<<<<`, `=======` ou `>>>>>>>`; JSON perfeitamente válido com `maximumWarning: 26kB` e `maximumError: 32kB`.

- [ ] T-005 [FR-001, FR-005] Harmonizar código compartilhado para estrita conformidade com o gate white-label
  - Arquivos: `src/`, `scripts/`, `package.json`
  - Verificação: Nenhuma referência direta a nomes próprios nos arquivos compartilhados; execução de `node scripts/check-white-label-references.mjs` retorna 0 ("White-label reference gate passed.").

- [ ] T-006 [FR-005, FR-006] Integrar as novas migrations do Supabase para gestão de perfil e mídias
  - Arquivos: `supabase/migrations/20261015*.sql`, `supabase/setup_editorial.sql`
  - Verificação: 5 novas migrations presentes e íntegras no diretório `supabase/migrations/`.

---

## Fase 3 — Interface e Mídia de Perfil

- [ ] T-007 [FR-001, FR-002, FR-008] Validar hero com precedência de identidade, avatar genérico e seções aprovadas
  - Arquivos: `src/app/features/portfolio/pages/portfolio-page/`
  - Verificação: O hero renderiza "João Vitor" como nome principal via `.env`, monograma "JV", avatar genérico `/assets/profile/avatar-generic.svg` exibido, e seções limitadas a *Início*, *Sobre mim*, *Habilidades*, *Portfólio* e *Contato*.

- [ ] T-008 [FR-003] Validar tela de gestão de mídias administrativas `/admin/midias`
  - Arquivos: `src/app/features/admin/media-management/`
  - Verificação: Interface de upload de foto de perfil para o bucket `editorial-profile-images` funcional e aderente aos tipos permitidos.

---

## Fase 4 — Verificação e Garantia de Qualidade

- [ ] T-009 [FR-005] Executar o gate automatizado de verificação white-label
  - Comando: `node scripts/check-white-label-references.mjs`
  - Verificação: Script termina com código de saída 0 e exibe "White-label reference gate passed.".

- [ ] T-010 [FR-001, FR-002, FR-004] Executar suíte completa de testes unitários
  - Comando: `npm test`
  - Verificação: 100% dos testes unitários passando sem falhas nem regressões.

- [ ] T-011 [FR-004] Executar build de produção da aplicação
  - Comando: `npm run build`
  - Verificação: `ng build --configuration production` compila com sucesso dentro dos budgets.

- [ ] T-012 Revisão final de convergência e aprovação de João Vitor
  - Verificação: Apresentar o resultado e aguardar a validação formal de João Vitor.
