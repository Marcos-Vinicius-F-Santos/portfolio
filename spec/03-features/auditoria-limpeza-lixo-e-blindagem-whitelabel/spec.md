# Spec da Feature — Auditoria de Arquivos, Limpeza de Obsoletos e Blindagem White-Label

Status: Implementado — Aguardando Aprovação Final de João Vitor  
Data: 15/10/2026  
Projeto: Portfólio Profissional (`joaovitordf/portfolio`)  
Branch: `master`  
Upstream: `https://github.com/Marcos-Vinicius-F-Santos/portfolio.git` (`upstream/master`)

---

## 1. Contexto e Diagnóstico Completo (`Ctrl + Shift + F`)

Ao pesquisar e-mails, telefones e usernames pessoais (tanto do titular deste fork quanto do autor upstream) em todo o workspace, foram mapeados quatro grupos de ocorrências que precisavam de saneamento:

### Grupo 1 — Interferência Real no White-Label em Runtime (`public/` e `services/`)
1. **`public/snapshot.json`** (e **`public/profile.jpg`**):
   - Arquivos criados localmente no disco dentro de `public/`.
   - **Por que interferiam no White-Label:** Embora estivessem no `.gitignore`, o builder do Angular (`angular.json`) copiava qualquer arquivo presente em `public/` para o bundle local. Além disso, `src/app/features/portfolio/services/published-snapshot.service.ts` havia sido alterado para fazer `fetch('/snapshot.json')` caso o Supabase falhasse, carregando dados pessoais locais em vez do fallback neutro White-Label.
2. **`src/app/features/portfolio/services/published-snapshot.service.ts`** e **`published-snapshot-content.service.ts`**:
   - Divergiam do `upstream/master` do Marcos por causa desse fallback local `/snapshot.json`.

### Grupo 2 — E-mail e Telefone Pessoais Escritos em Specs (`spec/02-arquitetura/`, `spec/03-features/`, `spec/06-deploy/`)
9 arquivos de documentação/spec continham endereços de e-mail e telefones reais hardcoded nos exemplos de documentação:
1. `spec/02-arquitetura/DECISAO-014-incorporacao-atualizacoes-upstream-painel-contato-e-componentes-admin.md`
2. `spec/03-features/envio-direto-formulario-contato/spec.md`
3. `spec/03-features/layout-contato-duas-colunas/spec.md`
4. `spec/03-features/populacao-perfil-projetos-contatos-banco/spec.md`
5. `spec/03-features/hospedagem-vercel-joao-vitor/spec.md`
6. `spec/06-deploy/hospedagem-vercel-joao-vitor/deploy.md`
7. `spec/03-features/habilidades-formacao-contato/spec.md`
8. `spec/03-features/painel-contato-whatsapp-email/spec.md`
9. `spec/05-verificacao/edicao-visual-rascunho-publicacao/inventario-2026-09-26.json`

### Grupo 3 — Lixo Histórico de 05/10 (`spec/05-verificacao/historico/`)
4 arquivos antigos (390 KB) de quando o portfólio ainda não era White-Label e tinha os textos antigos repetitivos:
1. `spec/05-verificacao/historico/generate-joao-editorial-snapshot.mjs`
2. `spec/05-verificacao/historico/initial-editorial-snapshot-joao-v1.json`
3. `spec/05-verificacao/historico/setup_editorial_joao_vitor.sql`
4. `spec/05-verificacao/historico/update_academic_translations.sql`

### Grupo 4 — Arquivos de Carga do Seu Banco Supabase (`spec/05-verificacao/joao-vitor/`)
1. `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`
2. `spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql`
3. `spec/05-verificacao/joao-vitor/generate-publication-sql.mjs`
- **Nota arquitetural:** O Marcos **não** commita o snapshot/SQL pessoal dele no Git (não existe pasta `marcos-santos/` no repo), pois os dados pessoais pertencem exclusivamente ao banco Supabase de cada instância. Portanto, essa pasta deve existir apenas localmente na máquina do autor e ser ignorada pelo Git (`.gitignore`).

---

## 2. Requisitos Funcionais (Given / When / Then)

### FR-001 — Neutralização de Fallback e Mocks de Testes em `src/`
- **GIVEN** `ENGLISH_COPY` e os testes unitários em `src/` (`contact-email-sender.spec.ts`, `contact-panel.component.spec.ts`, `portfolio-page.component.spec.ts`)
- **WHEN** inspecionados
- **THEN** usam `'Software Engineer'` e rótulos neutros (`'Contato Teste'`, `'Usuario Principal'`, `'Conta Teste'`, `'Perfil de Exemplo'`), sem nenhum nome de pessoa real ou histórica.

### FR-002 — Remoção de Arquivos Pessoais em `public/` (`snapshot.json`, `profile.jpg`, `curriculum-pt.pdf`, `curriculum-en.pdf`)
- **GIVEN** os arquivos locais e versionados em `public/` e os serviços `PublishedSnapshotService` e `PortfolioPageComponent.downloadCurriculum()`
- **WHEN** a limpeza White-Label for aplicada
- **THEN** `public/snapshot.json`, `public/profile.jpg`, `public/curriculum-pt.pdf` e `public/curriculum-en.pdf` DEVEM ser removidos de `public/`
- **AND** `published-snapshot.service.ts` e `published-snapshot-content.service.ts` DEVEM ficar idênticos ao `upstream/master`
- **AND** `downloadCurriculum()` DEVE usar apenas `file?.publicUrl` vindo do Supabase (onde os PDFs reais já estão salvos em `portfolio_files` / bucket `curricula`).

### FR-003 — Neutralização de E-mails, Telefones e Links Pessoais nas Specs (`spec/`)
- **GIVEN** os arquivos de especificação em `spec/02-arquitetura/`, `spec/03-features/`, `spec/05-verificacao/` e `spec/06-deploy/`
- **WHEN** mencionarem exemplos de canais de contato
- **THEN** DEVEM usar placeholders genéricos (`contato@exemplo.com`, `+55 11 99999-0000`, `github.com/exemplo`, `linkedin.com/in/exemplo`) em vez de e-mails ou telefones reais.

### FR-004 — Remoção dos Arquivos Obsoletos de `spec/05-verificacao/historico/`
- **GIVEN** a pasta `spec/05-verificacao/historico/` com 390 KB de snapshots e SQLs antigos de 05/10
- **WHEN** a limpeza for executada
- **THEN** os 4 arquivos legados DEVEM ser removidos para não poluir o repositório nem as buscas globais (`Ctrl+Shift+F`).

### FR-005 — Desacoplamento do Script de Carga Pessoal (`spec/05-verificacao/joao-vitor/`)
- **GIVEN** que os dados reais de João Vitor vivem no seu projeto Supabase (após rodar `publicar_snapshot_joao_vitor.sql`)
- **WHEN** o repositório for preparado para White-Label puro
- **THEN** `spec/05-verificacao/joao-vitor/` DEVE ser removida do rastreamento Git (`git rm --cached`) e adicionada ao `.gitignore` (mantendo o arquivo local na máquina para execução no Supabase quando necessário, mas sem commitar dados pessoais no Git compartilhado com o Marcos).

### FR-006 — Blindagem Completa no `check-white-label-references.mjs` e `.env.example`
- **GIVEN** o script `scripts/check-white-label-references.mjs` e o arquivo `.env.example`
- **WHEN** executado via `npm run check:white-label`
- **THEN** DEVE inspecionar toda a pasta `public/`, normalizar acentos Unicode (`NFD`), proibir PDFs estáticos em `public/` e bloquear referências pessoais.

---

## 3. Critérios de Aceite (DoD)

1. [x] `ENGLISH_COPY` em `portfolio-translations.ts` usa `'Software Engineer'`.
2. [x] Todos os testes unitários (`contact-email-sender.spec.ts`, `contact-panel.component.spec.ts`, `portfolio-page.component.spec.ts`) usam termos neutros sem nomes de pessoas.
3. [x] `public/snapshot.json`, `public/profile.jpg`, `public/curriculum-pt.pdf` e `public/curriculum-en.pdf` removidos de `public/`, `published-snapshot.service.ts` alinhado 100% com `upstream/master`, e `downloadCurriculum()` consumindo exclusivamente a URL pública do Supabase.
4. [x] Todas as specs em `spec/` limpas de e-mails e telefones pessoais reais.
5. [x] Pasta `spec/05-verificacao/historico/` removida.
6. [x] Pasta `spec/05-verificacao/joao-vitor/` desvinculada do Git (`git rm --cached`) e ignorada no `.gitignore` (preservada apenas localmente na máquina).
7. [x] `.env.example` atualizado com as chaves White-Label vazias e `npm run check:white-label` + `npm test` (180 testes) passando 100%.
8. [x] Aprovação final de João Vitor.
