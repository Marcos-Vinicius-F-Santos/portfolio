# Tarefas — Auditoria de Arquivos, Limpeza de Obsoletos e Blindagem White-Label

Status: Implementado — Aguardando Aprovação Final de João Vitor  
Feature: `spec/03-features/auditoria-limpeza-lixo-e-blindagem-whitelabel/spec.md`  
Data: 15/10/2026  

---

## Ordem Incremental de Execução

### Fase 1: Neutralização de Dados em Código e Testes Ativos (Concluída)

- [x] **T-001**: Neutralizar `ENGLISH_COPY` em `src/app/features/portfolio/services/portfolio-translations.ts` (`'Software Engineer'`).
- [x] **T-002**: Substituir nomes de pessoas em `contact-email-sender.spec.ts`, `contact-panel.component.spec.ts` e `portfolio-page.component.spec.ts` por rótulos neutros (`'Contato Teste'`, `'Usuario Principal'`, `'Conta Teste'`, `'Perfil de Exemplo'`).
- [x] **T-003**: Implementar normalização de acentos Unicode (`NFD`) e varredura completa de `public/` (incluindo bloqueio de `.pdf` estático) em `scripts/check-white-label-references.mjs`, e documentar variáveis White-Label no `.env.example`.
- [x] **T-004**: Remover o arquivo obsoleto `spec/05-verificacao/joao-vitor/setup_joao_vitor.sql`.

---

### Fase 2: Remoção da Interferência em Runtime (`public/` e `services/`) (Concluída)

- [x] **T-005**: Remover `public/snapshot.json`, `public/profile.jpg`, `public/curriculum-pt.pdf` e `public/curriculum-en.pdf` da pasta `public/`
  - Impede que o builder do Angular empacote dados/currículos pessoais no build e que `downloadCurriculum()` baixe currículo pessoal como fallback.
- [x] **T-006**: Alinhar `src/app/features/portfolio/services/published-snapshot.service.ts` e `published-snapshot-content.service.ts` com `upstream/master`, e ajustar `downloadCurriculum()` em `portfolio-page.component.ts` para consumir apenas `file?.publicUrl` do Supabase.

---

### Fase 3: Limpeza de E-mails, Telefones e Arquivos Mortos em `spec/` (Concluída)

- [x] **T-007**: Substituir e-mails e telefones pessoais reais por placeholders neutros (`contato@exemplo.com`, `+55 11 99999-0000`) nos arquivos de documentação em `spec/`:
  - `spec/02-arquitetura/DECISAO-014-incorporacao-atualizacoes-upstream-painel-contato-e-componentes-admin.md`
  - `spec/03-features/envio-direto-formulario-contato/spec.md`
  - `spec/03-features/layout-contato-duas-colunas/spec.md`
  - `spec/03-features/populacao-perfil-projetos-contatos-banco/spec.md`
  - `spec/03-features/hospedagem-vercel-joao-vitor/spec.md`
  - `spec/06-deploy/hospedagem-vercel-joao-vitor/deploy.md`
  - `spec/03-features/habilidades-formacao-contato/spec.md`
  - `spec/03-features/painel-contato-whatsapp-email/spec.md`
  - `spec/05-verificacao/edicao-visual-rascunho-publicacao/inventario-2026-09-26.json`
- [x] **T-008**: Remover a pasta de lixo legado `spec/05-verificacao/historico/` (390 KB de arquivos obsoletos de 05/10).
- [x] **T-009**: Desvincular `spec/05-verificacao/joao-vitor/` do Git (`git rm -r --cached spec/05-verificacao/joao-vitor`) e adicionar ao `.gitignore`
  - Mantém o `publicar_snapshot_joao_vitor.sql` salvo no computador para rodar no Supabase, mas **remove os dados pessoais do repositório Git compartilhado**.

---

### Fase 4: Validação Final (Concluída)

- [x] **T-010**: Executar verificação global (`git grep`), `npm run check:white-label` e `npm test` (180 testes).
