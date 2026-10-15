# Tarefas de Implementação — Refinamento dos Cards de Experiência e Ícones de Tecnologias

Status: Concluído  
Spec: `spec/03-features/refinamento-cards-experiencia-e-icones/spec.md`  
Plano: `spec/04-plano/refinamento-cards-experiencia-e-icones/plano.md`

---

- [x] **T-001 [FR-001, FR-002, FR-003, FR-004] Delimitação e Estilos das Colunas de Experiência**
  - Implementar linha divisória vertical sutil e borda de quadrante horizontal entre os 4 blocos de experiência em `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss`.
  - Configurar tipografia e alinhamento equilibrado (avaliar `hyphens: auto; text-align: justify;` vs alinhamento à esquerda refinado com margens adequadas).
  - Ajustar colapso fluido para 1 coluna no mobile (<= 760px), removendo a divisória vertical.
  - *Critério de aceite*: Cards possuem divisão visual clara e elegante em desktop sem quebras anômalas no mobile, mantendo SCSS <= 8 kB.

- [x] **T-002 [FR-005, FR-006] Obtenção e Adição dos SVGs de Tecnologias em `src/assets/skills/`**
  - Criar/adicionar os SVGs oficiais para as 18 tecnologias pendentes:
    - `python.svg`, `opencv.svg`, `yolo.svg`, `mediapipe.svg`, `flutter.svg`, `angular.svg`, `fastapi.svg`, `laravel.svg`, `dart.svg`, `php.svg`, `jsf.svg`, `supabase.svg`, `oracle.svg`, `redis.svg`, `gitlab.svg`, `gitkraken.svg`, `gradle.svg`, `maven.svg`.
  - Otimizar os arquivos para serem vetoriais limpos, leves e com viewBox padronizado.
  - *Critério de aceite*: Todos os arquivos existem em `src/assets/skills/` e abrem corretamente.

- [x] **T-003 [FR-005, FR-006] Mapeamento no Catálogo de Ícones do Código**
  - Atualizar `FALLBACK_SKILL_ICON_URLS` em `src/app/features/portfolio/content/portfolio-content.ts`.
  - Atualizar `DIRECT_ICON_URLS` e `RELATED_ICON_NAMES` em `src/app/features/portfolio/content/technology-icons.ts`.
  - Atualizar `scripts/generate-joao-editorial-snapshot.mjs` para refletir os novos ícones no snapshot.
  - *Critério de aceite*: `<app-project-technologies>` renderiza as imagens para Python, OpenCV, YOLOv8, MediaPipe e Flutter sem exibir `</>`.

- [x] **T-004 [AC-005] Testes Automatizados e Verificação de Build**
  - Executar `npm test` para garantir 100% de testes unitários passando.
  - Executar `npm run build` para garantir que a compilação de produção conclua com sucesso respeitando todos os budgets.
  - *Critério de aceite*: 137 testes passando e build bem-sucedido.
