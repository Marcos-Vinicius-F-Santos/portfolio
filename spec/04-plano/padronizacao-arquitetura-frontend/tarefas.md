# Tarefas de Implementação — Padronização Arquitetural do Frontend

Status: Concluído  
Spec: `spec/03-features/padronizacao-arquitetura-frontend/spec.md`  
Plano: `spec/04-plano/padronizacao-arquitetura-frontend/plano.md`  

---

- [x] **T-001 [FR-001, FR-002, FR-003] Configuração do Angular CLI e Migração de SCSS para CSS**
  - Atualizar `angular.json` alterando o schematics para `"style": "css"` e removendo `"inlineStyleLanguage": "scss"`.
  - Renomear `src/styles.scss` para `src/styles.css` e atualizar no `angular.json`.
  - Renomear todos os arquivos `.scss` de componentes para `.css` e ajustar seus respectivos metadados `styleUrl`.
  - *Critério de aceite*: `npm run build` executa sem referências a pré-processamento Sass.

- [x] **T-002 [FR-006, FR-007] Criação da Camada Shared e Desacoplamento de `<app-project-technologies>`**
  - Criar `src/app/shared/components/project-technologies/`.
  - Desacoplar o componente de tecnologias em `project-technologies.component.ts`, `project-technologies.component.html` e `project-technologies.component.css`.
  - Atualizar a classe para `ProjectTechnologiesComponent`.
  - *Critério de aceite*: O componente está totalmente desacoplado em 3 arquivos sem inline templates/styles e exportado em `shared`.

- [x] **T-003 [FR-004, FR-005, FR-008] Reorganização e Nomenclatura da Feature Portfolio**
  - Organizar subpastas em `src/app/features/portfolio/pages/` e `src/app/features/portfolio/services/`.
  - Renomear e mover `PortfolioPage` para `pages/portfolio-page/portfolio-page.component.*` (`PortfolioPageComponent`).
  - Renomear e mover `ProjectDetail` para `pages/project-detail/project-detail.component.*` (`ProjectDetailComponent`).
  - Mover o conteúdo de `features/portfolio/content/` para `features/portfolio/services/`.
  - Atualizar imports correspondentes.
  - *Critério de aceite*: Pastas organizadas, componentes usando nomenclatura canônica `*.component.*` e testes da feature passando.

- [x] **T-004 [FR-004, FR-005, FR-008] Reorganização e Nomenclatura da Feature Admin**
  - Organizar subpastas `pages/`, `services/` e `directives/` em `src/app/features/admin/`.
  - Renomear e mover:
    - `AdminAuthenticationComponent` em `pages/authentication/`
    - `ContentManagementComponent` em `pages/content-management/`
    - `MediaManagementComponent` em `pages/media-management/`
    - `VisualEditorComponent` em `pages/visual-editor/`
    - `EditorialProjectDetailComponent` em `pages/editorial-project-detail/`
  - Mover diretivas para `admin/directives/` e serviços para `admin/services/`.
  - Atualizar imports correspondentes.
  - *Critério de aceite*: Todos os componentes administrativos renomeados para `*.component.*`, organizados por responsabilidade e com imports consistentes.

- [x] **T-005 [FR-004, FR-005] Padronização do Componente Raiz `App` e Rotas Globais**
  - Renomear `src/app/app.ts`, `app.html`, `app.css`, `app.spec.ts` para `app.component.ts`, `app.component.html`, `app.component.css`, `app.component.spec.ts`.
  - Atualizar a classe para `AppComponent`.
  - Atualizar `src/main.ts` para fazer o bootstrap de `AppComponent`.
  - Atualizar `src/app/app.routes.ts` com todas as novas rotas e componentes padronizados.
  - *Critério de aceite*: A aplicação inicializa normalmente com o novo `AppComponent` e rotas corretas.

- [x] **T-006 [FR-009, FR-010, AC-001..AC-005] Bateria de Testes Automatizados e Validação Final de Build**
  - Executar suíte completa de testes (`npm test -- --watch=false`) e garantir 100% dos 137 testes passando.
  - Executar `npm run build` e certificar que a compilação de produção gera todos os artefatos com sucesso.
  - Validar visualmente e funcionalmente a aplicação.
  - *Critério de aceite*: 137 testes unitários passando e bundle de produção gerado sem falhas.
