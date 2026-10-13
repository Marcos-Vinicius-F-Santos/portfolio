# Tarefas — Isolamento de Dados Pessoais e Padronização Arquitetural

## Fase 1 — Padronização e Reorganização de Pastas
- [x] T001: Mover e renomear arquivos do `contact-panel` para `src/app/shared/components/contact-panel/` com sufixo `.component.*`.
- [x] T002: Mover e renomear componentes `admin-card`, `admin-feedback`, `admin-page-header`, `admin-section-header` para `src/app/shared/components/` com sufixo `.component.*`.
- [x] T003: Atualizar imports em todos os consumidores e specs, excluindo pastas legadas `presentation/` e `ui/`.

## Fase 2 — Neutralização de Dados Estáticos (White-Label)
- [x] T004: Neutralizar dados de fallback em `portfolio-content.ts` e `portfolio-translations.ts`.
- [x] T005: Neutralizar `DEFAULT_CONTACT_PANEL_DESTINATIONS` em `contact-panel.models.ts`.
- [x] T006: Calcular `contactDestinations` dinamicamente em `portfolio-page.component.ts` com base no snapshot do Supabase.
- [x] T007: Ajustar `index.html` com título neutro e `lang="pt-BR"`.
- [x] T008: Excluir PDFs duplicados em `public/` (`Curriculum.pdf`, `Currículo.pdf`).

## Fase 3 — Lazy Loading Universal de Rotas
- [x] T009: Converter todas as rotas em `src/app/app.routes.ts`, `portfolio.routes.ts` e `admin.routes.ts` para lazy loading modular com `loadComponent` e `loadChildren`.

## Fase 4 — Desacoplamento e Estabilização dos Testes
- [x] T010: Desacoplar asserções de testes unitários que procuravam nomes/textos específicos de autores.
- [x] T011: Silenciar mensagens esperadas de erro em `media-management.service.spec.ts`.

## Fase 5 — Validação e Convergência
- [x] T012: Validar compilação de produção com `npm run build` e confirmar resolução do warning de budget (< 500 kB).
- [x] T013: Executar a suíte de testes com `npm test` garantindo 100% de sucesso.
- [x] T014: Criar documentação de verificação e deploy.
