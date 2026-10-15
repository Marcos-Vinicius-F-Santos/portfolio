# Plano de Implementação — Padronização Arquitetural do Frontend

Status: Proposto — pronto para revisão  
Spec: [Spec da Feature](../../03-features/padronizacao-arquitetura-frontend/spec.md)  
Decisão Arquitetural: [ADR-013](../../02-arquitetura/DECISAO-013-padronizacao-arquitetural-frontend.md)  

---

## 1. Abordagem de Execução

A refatoração será executada em fases estritamente ordenadas e incrementais para garantir que a aplicação nunca fique em estado quebrado e que nenhum teste sofra regressão não detectada.

### Fases:

1. **Fase 1: Configurações Globais e Migração SCSS -> CSS**
   - Alterar `angular.json` para definir `css` como padrão de schematics e inline styles.
   - Renomear `src/styles.scss` para `src/styles.css` e atualizar `angular.json`.
   - Renomear todos os arquivos `*.scss` de componentes para `*.css` e atualizar `styleUrl` nos metadados `@Component`.
   - Executar build preliminar para validar a compilação limpa dos estilos.

2. **Fase 2: Criação da Camada Shared e Desacoplamento de Componentes**
   - Criar diretório `src/app/shared/components/project-technologies/`.
   - Separar o componente `<app-project-technologies>` (que possui template e estilos inline em `project-technologies.ts`) em 3 arquivos:
     - `project-technologies.component.ts`
     - `project-technologies.component.html`
     - `project-technologies.component.css`
   - Nomear a classe como `ProjectTechnologiesComponent`.

3. **Fase 3: Reestruturação e Nomenclatura do Domínio Portfolio**
   - Criar subdiretórios `src/app/features/portfolio/pages/` e `src/app/features/portfolio/services/`.
   - Mover e renomear:
     - `portfolio-page.ts` / `html` / `scss` / `spec` -> `pages/portfolio-page/portfolio-page.component.*` (Classe: `PortfolioPageComponent`).
     - `project-detail.ts` / `html` / `scss` / `spec` -> `pages/project-detail/project-detail.component.*` (Classe: `ProjectDetailComponent`).
     - `content/*` -> `services/` (preservando modelos e utilitários de ícones).
   - Atualizar imports internos de portfolio.

4. **Fase 4: Reestruturação e Nomenclatura do Domínio Admin**
   - Criar subdiretórios:
     - `src/app/features/admin/pages/`
     - `src/app/features/admin/services/`
     - `src/app/features/admin/directives/`
   - Mover e renomear componentes:
     - `admin-authentication.*` -> `pages/authentication/admin-authentication.component.*` (`AdminAuthenticationComponent`).
     - `content-management.*` -> `pages/content-management/content-management.component.*` (`ContentManagementComponent`).
     - `media-management.*` -> `pages/media-management/media-management.component.*` (`MediaManagementComponent`).
     - `visual-editor.*` -> `pages/visual-editor/visual-editor.component.*` (`VisualEditorComponent`).
     - `editorial-project-detail.*` -> `pages/editorial-project-detail/editorial-project-detail.component.*` (`EditorialProjectDetailComponent`).
   - Mover diretivas do editor para `admin/directives/`.
   - Mover serviços do editor e mídias para `admin/services/`.

5. **Fase 5: Padronização do Componente Raiz `App` e Rotas Globais**
   - Renomear `app.ts`, `app.html`, `app.scss`, `app.spec.ts` para `app.component.ts`, `app.component.html`, `app.component.css`, `app.component.spec.ts` (Classe: `AppComponent`).
   - Atualizar `src/main.ts` para inicializar `AppComponent`.
   - Atualizar `src/app/app.routes.ts` com os novos caminhos e classes de componentes.

6. **Fase 6: Verificação Completa e Build**
   - Executar `npm test -- --watch=false` garantindo que todos os 137 testes passem.
   - Executar `npm run build` garantindo geração correta dos pacotes de produção.
   - Verificação de layout e funcionalidades.
