# Registro de Decisão — Incorporação das Atualizações Upstream (Marcos) e Adaptação Arquitetural

Data: 2026-10-13  
Status: Aprovado  
Specs Relacionadas:
- [Painel de Contato WhatsApp e E-mail](../03-features/painel-contato-whatsapp-email/spec.md)
- [Componentes Reutilizáveis do Admin](../03-features/reusable-components/spec.md)
- [Integração Supabase](../03-features/integracao-supabase/spec.md)
- [Padronização da Arquitetura do Frontend](../03-features/padronizacao-arquitetura-frontend/spec.md)

---

## 1. Contexto

O repositório original de Marcos (`upstream/master`) evoluiu com a entrega de novos commits:
1. `feat: add WhatsApp and email contact panel` e `style: adjust contact section layout`: criação do painel de contato sem persistência, permitindo encaminhar o visitante para WhatsApp ou cliente de e-mail via `mailto:`.
2. `feat: add reusable admin components`: criação dos componentes visuais compartilhados de administração (`AdminCard`, `AdminFeedback`, `AdminPageHeader`, `AdminSectionHeader`).
3. `feat: make Supabase settings environment-specific`: extração dinâmica do `adminUserId` para permitir configurações por ambiente via runtime config e `.env`.
4. `fix: add override modifier and static fallback to PublishedSnapshotContentService`.

No entanto, o repositório de João Vitor já havia consolidado a **Padronização Arquitetural do Frontend** ([DECISAO-013](./DECISAO-013-padronizacao-arquitetural-frontend.md)), que estabeleceu:
- Migração global de SCSS para CSS nativo (`style: css` no `angular.json`), eliminando falso SCSS e overhead de compilação Sass.
- Nomenclatura canônica do Angular Style Guide (`*.component.ts`, `*.component.html`, `*.component.css`).
- Organização em camadas limpas (`pages/`, `services/`, `directives/`).
- Identidade e dados de contato próprios de João Vitor.

Ao realizar o merge do upstream, surgiram conflitos de mesclagem e divergências estruturais (arquivos em SCSS e caminhos relativos de importação alterados pela camada `pages/`).

---

## 2. Decisão

1. **Incorporação Completa das Features do Upstream:**
   - Adicionar o **Painel de Contato por WhatsApp e E-mail** na seção de contato do portfólio.
   - Adicionar os **Componentes Reutilizáveis da Área Administrativa** (`app-admin-card`, `app-admin-feedback`, `app-admin-page-header`, `app-admin-section-header`).
   - Adotar o `getAuthorizedAdminUserId()` dinâmico via `supabaseRuntimeConfig.adminUserId`.

2. **Adaptação Arquitetural Imediata (Alinhamento à DECISAO-013):**
   - **Migração para CSS Nativo**: converter todos os novos estilos (`contact-panel.scss`, `admin-card.scss`, `admin-feedback.scss`, `admin-page-header.scss`, `admin-section-header.scss`, `admin-ui.scss`) para CSS nativo limpo (`.css`), sem falso SCSS ou diretivas inválidas (`@use`, `@include`).
   - **Compatibilidade de Nomenclatura**: manter compatibilidade total exportando os aliases canônicos (`AdminCardComponent`, `AdminFeedbackComponent`, `AdminPageHeaderComponent`, `AdminSectionHeaderComponent`, `ContactPanelComponent`) juntamente com os nomes originais (`AdminCard`, etc.).
   - **Caminhos de Importação**: ajustar os imports relativos em `content-management.component.ts` e `media-management.component.ts` considerando a profundidade da pasta `pages/` (`../../../../shared/ui/...`).
   - **Dados de Contato Próprios**: vincular o painel de contato na página pública de João Vitor aos seus próprios canais de contato (`+55 (37) 99429-018` e `profissional.joaovitordf@gmail.com`), mantendo os fallbacks e testes do upstream preservados.

---

## 3. Consequências e Resultados

- Zero quebra na suíte de testes: **154 testes unitários passando com 100% de sucesso**.
- Build de produção (`npm run build`) validado com sucesso.
- O portfólio de João Vitor passa a dispor do painel moderno de contato e das melhorias administrativas do upstream, mantendo sua identidade profissional e sua arquitetura limpa e padronizada.
