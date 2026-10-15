# Spec da Feature — Merge de Upstream: Arquitetura White-Label e Gestão de Mídia de Perfil

Status: Aprovado por João Vitor  
Data: 15/10/2026  
Projeto: Portfólio Profissional (fork de João Vitor: `joaovitordf/portfolio`)  
Branch Base: `master`  
Origem upstream: `upstream/master` (commit `14d0234`)  
Onde vive no código:
- `scripts/check-white-label-references.mjs` e `scripts/generate-runtime-config.mjs`
- `src/app/core/config/supabase-runtime-config.ts`
- `src/app/features/admin/media-management/` e `src/app/features/admin/services/media-management.service.ts`
- `src/app/features/portfolio/pages/portfolio-page/`
- `src/app/features/portfolio/services/` (adapter, validator, fixtures de snapshot)
- `src/assets/profile/avatar-generic.svg`
- `supabase/migrations/` (migrations `20261015100000` a `20261015123000`)
- `angular.json`

---

## 1. Contexto e Motivação

1. **Evolução Arquitetural do Upstream (Marcos):**
   - O upstream realizou uma grande refatoração descrita em `docs/alteracoes/registro-2026-10-15-white-label-media.md` e na spec `spec/03-features/refatoracao-white-label-multi-tenant/spec.md`.
   - O repositório passa a ser um template neutro (white-label), desacoplando a identidade autoral (nome, iniciais da marca, foto de perfil, links pessoais) do código compartilhado.
   - Implementado gate automatizado de verificação `scripts/check-white-label-references.mjs` que barra nomes autorais hardcoded no código compartilhado.
   - Criada gestão de foto de perfil com upload administrativo para o bucket Supabase Storage `editorial-profile-images` e fallback para `/assets/profile/avatar-generic.svg`.
   - Adicionadas 5 migrations no Supabase para suportar entidade `profile` e propósito de mídia `profile_image`.
   - O PR #3 de João Vitor (cards Josias, Web3Forms, design tokens) já foi incorporado ao upstream.

2. **Decisões Alinhadas com João Vitor:**
   - **Arquivo único de ambiente (`.env`):** Não utilizar `.env.local`, mantendo apenas `.env` (devidamente listado no `.gitignore`). As variáveis de identidade serão injetadas através dele:
     ```env
     PORTFOLIO_AUTHOR_NAME=João Vitor
     PORTFOLIO_BRAND_INITIALS=JV
     PORTFOLIO_PROFILE_ID=profile-generic
     ```
   - **Seções da Página Pública (Opção B):** Alinhamento 100% com o upstream do Marcos. Remoção tanto de `#formacao-academica` quanto de `#experiencias` da página pública, concentrando a vitrine profissional na seção `#portfolio`.
   - **Foto de Perfil:** Exibição inicial do avatar neutro SVG (`/assets/profile/avatar-generic.svg`), deixando o upload da foto real para ser feito diretamente pelo painel administrativo em `/admin/midias`.

3. **Defeito Identificado no Upstream (`angular.json`):**
   - No commit `14d0234` do upstream, foram commitados acidentalmente marcadores de conflito git (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) nas linhas 51-57 do `angular.json`.
   - O merge precisa sanar este defeito adotando o orçamento de bundle aprovado (`maximumWarning: 26kB`, `maximumError: 32kB`).

---

## 2. Requisitos Funcionais (Given / When / Then)

### FR-001 — Resolução de Identidade White-Label via Runtime Config
- **GIVEN** que a aplicação inicializa no navegador
- **WHEN** o componente de apresentação (`PortfolioPageComponent`) for renderizado
- **THEN** deve resolver o nome do autor pela seguinte ordem de precedência:
  1. `PORTFOLIO_AUTHOR_NAME` injetado via runtime config (`globalThis.__PORTFOLIO_SUPABASE_CONFIG__.authorName`);
  2. Snapshot publicado no Supabase (`copy.heroName` ou `copy.name`, se não genérico);
  3. Fallback neutro (`"Desenvolvedor de Software"`).
- **AND** deve resolver o monograma da marca por:
  1. `PORTFOLIO_BRAND_INITIALS` injetado via runtime config;
  2. Iniciais calculadas a partir do nome;
  3. Fallback neutro (`"PF"`).

### FR-002 — Foto de Perfil Dinâmica com Fallback Neutro
- **GIVEN** o hero da página principal
- **WHEN** renderizar a foto de apresentação
- **THEN** deve resolver a URL da imagem pela precedência:
  1. `PORTFOLIO_PROFILE_IMAGE_URL` injetado via runtime config;
  2. Mídia de perfil (`profile.profileImage`) do snapshot publicado via Supabase Storage;
  3. Fallback genérico neutro versionado: `/assets/profile/avatar-generic.svg`.
- **AND** se a URL da foto falhar no carregamento (`(error)`), deve chavear automaticamente para o SVG neutro.

### FR-003 — Gestão Administrativa de Foto de Perfil
- **GIVEN** um administrador autenticado na rota `/admin/midias`
- **WHEN** selecionar um arquivo de imagem (PNG, JPG, WebP de até 3 MB) no campo "Foto de perfil" e confirmar o envio
- **THEN** a imagem deve ser carregada no bucket `editorial-profile-images` e associada à entidade `profile` no rascunho editorial.

### FR-004 — Correção do `angular.json`
- **GIVEN** o arquivo `angular.json` recebido do upstream
- **WHEN** for executado o merge
- **THEN** os marcadores de conflito git residuais devem ser eliminados e os budgets de bundle configurados como:
  ```json
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "1.5MB",
      "maximumError": "2MB"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "26kB",
      "maximumError": "32kB"
    }
  ]
  ```

### FR-005 — Gate White-Label Automatizado
- **GIVEN** o script `scripts/check-white-label-references.mjs`
- **WHEN** executado via `node scripts/check-white-label-references.mjs` ou no CI
- **THEN** deve validar `src/`, `scripts/`, `supabase/`, `public/assets/`, `.github/` e `package.json`
- **AND** deve passar com saída zero (0) garantindo que nenhum nome próprio conste hardcoded nesses caminhos compartilhados.

### FR-006 — Migrations de Banco de Dados
- **GIVEN** as novas migrations criadas pelo upstream:
  1. `20261015100000_add_profile_media_support.sql`
  2. `20261015110000_add_profile_entity_to_existing_draft.sql`
  3. `20261015113000_allow_profile_media_constraints.sql`
  4. `20261015120000_fix_profile_media_association.sql`
  5. `20261015123000_fix_profile_media_conflict_target.sql`
- **WHEN** aplicadas no Supabase
- **THEN** devem configurar o bucket `editorial-profile-images`, constraints e stored procedures sem ambiguidades SQL.

### FR-007 — Configuração Local de João Vitor (`.env`)
- **GIVEN** o ambiente local de desenvolvimento
- **WHEN** o arquivo `.env` (ignorado pelo git) for configurado
- **THEN** deve conter:
  ```env
  PORTFOLIO_AUTHOR_NAME=João Vitor
  PORTFOLIO_BRAND_INITIALS=JV
  PORTFOLIO_PROFILE_ID=profile-generic
  ```
- **AND** nenhum arquivo `.env.local` duplicado deve ser mantido.
- **AND** nenhum dado pessoal deve ser commitado no repositório.

### FR-008 — Seções Públicas da Página Inicial (Opção B)
- **GIVEN** a página inicial do portfólio
- **WHEN** for renderizada
- **THEN** deve conter unicamente as seções: *Início (Apresentação)*, *Sobre mim*, *Habilidades (Stack Técnica)*, *Portfólio (Projetos)* e *Contato*.
- **AND** as seções `#formacao-academica` e `#experiencias` não devem ser renderizadas na página pública nem constar na barra de navegação superior ou mobile.

---

## 3. Critérios de Aceite (DoD)

1. [ ] Branch `master` deste repositório contém todas as alterações de `upstream/master` (commit `14d0234`).
2. [ ] `angular.json` é um JSON válido sem nenhum marcador de conflito git residual.
3. [ ] `npm run check:white-label` (ou `node scripts/check-white-label-references.mjs`) é executado e passa com sucesso.
4. [ ] 100% dos testes unitários passam (`npm test`).
5. [ ] Build de produção (`npm run build`) conclui sem erros.
6. [ ] A apresentação local exibe "João Vitor" e "JV" através da injeção do `.env`.
7. [ ] A tela `/admin/midias` possui o formulário funcional para upload da foto de perfil.
8. [ ] O avatar genérico `/assets/profile/avatar-generic.svg` é exibido quando não houver foto configurada.
9. [ ] Apenas as seções *Início*, *Sobre mim*, *Habilidades*, *Portfólio* e *Contato* compõem a página pública.
10. [ ] João Vitor revisou e aprovou as decisões antes da conclusão.
