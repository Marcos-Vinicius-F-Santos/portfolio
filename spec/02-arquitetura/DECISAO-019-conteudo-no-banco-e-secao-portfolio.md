# DECISÃO-019: Conteúdo Editorial no Banco e Vitrine de Portfólio em Cards

- **Status:** Aprovado
- **Data:** 2026-10-14
- **Autor:** João Vitor Dias Fernandes / Antigravity Agent
- **Contexto:** Feature `conteudo-no-banco-e-secao-portfolio` (SDD)

---

## 1. Contexto e Motivação

O portfólio precisava de duas evoluções fundamentais:
1. **Desacoplamento de Conteúdo Pessoal (T1) e Internacionalização:** Garantir que todas as informações biográficas (headline, foco, pilares, nome, cargo, disponibilidade e subtítulos) fossem persistidas no banco de dados / snapshot editorial (editáveis via `/admin/editor` de forma bifurcada em `pt-BR` e `en`), mantendo o código-fonte em TypeScript 100% white-label (ADR-015).
2. **Modernização Visual da Vitrine de Projetos (Estilo Josias Broch):** Unificar a seção de projetos sob o nome "Portfólio" com cards visuais elegantes em proporção 16:10, fallback robusto em SVG/CSS quando não houver imagem, chips de tecnologias, ação rápida de Demo e abas de filtro por categoria ("Todos", "Profissionais", "Pessoais").
3. **Tratamento da Seção "Resultados Profissionais":** Ocultar os cards de métricas genéricas da página inicial pública e da barra de navegação principal, mantendo as estruturas preservadas no estado para exibição contextual nas páginas de detalhe de projeto (`/projetos/:id`).

---

## 2. Decisões de Arquitetura

### 2.1 Separação em Três Camadas (T1, T2, T3)
- **T1 — Conteúdo Pessoal Editorial (Banco / Snapshot):**
  - Chaves de interface persistidas como `interfaceText` com `data-editorial-*`: `heroName`, `heroRole`, `heroAvailability`, `aboutHeadline`, `aboutFocus`, `aboutPillar1Title`, `aboutPillar1Description`, `aboutPillar2Title`, `aboutPillar2Description`, `aboutPillar3Title`, `aboutPillar3Description`, `portfolioEyebrow`, `portfolioTitle`, `portfolioSubtitle`.
  - No código-fonte, os fallbacks em `portfolio-content.ts` e `portfolio-translations.ts` são estritamente neutros e anônimos. Os dados reais de João Vitor são carregados exclusivamente a partir do Supabase (`setup_editorial_joao_vitor.sql` e snapshot versionado).
- **T2 — Rótulos de Ação e Vocabulário de Interface (Dicionário Tipado):**
  - Centralizados em `src/app/features/portfolio/services/portfolio-ui-labels.ts` (`UiLabels`).
  - Abrange botões como `filterAll`, `filterProfessional`, `filterPersonal`, `cvButton`, `viewProjects`, `contactMe`, `viewFullProject`, etc.
  - Elimina ternários inline duplicados nos templates HTML.
- **T3 — Estrutura e Estilização (HTML / CSS):**
  - Grid responsivo de 1 coluna (mobile), 2 colunas (tablet a partir de 640px) e 3 colunas (desktop a partir de 1080px).
  - Cores alinhadas à paleta quente institucional bege/marrom (`--paper`, `--paper-strong`, `--ink`, `--green`, `--line`).

### 2.2 Componente Reutilizável `ProjectCardComponent`
- Localizado em `src/app/shared/components/project-card/`.
- **Top Mockup Bar:** Simula janela de navegador com 3 pontinhos coloridos e título do projeto.
- **Área de Capa (Aspect Ratio 16:10):**
  - Quando imagem existe: exibe a primeira imagem por `displayOrder` com `loading="lazy"`. Caso a imagem falhe (`(error)`), o componente faz fallback resiliente para a próxima imagem da galeria.
  - Quando imagem não existe: renderiza placeholder limpo com ícone SVG de código e o monograma do projeto calculado dinamicamente.
  - Botão overlay "Demo ↗": exibido no hover com link externo configurado.
- **Badges de Tecnologias:** Reutiliza `ProjectTechnologiesComponent` para manter consistência visual e atributos de CMS.
- **Link Direto:** "Ver projeto completo →" com suporte transparente ao modo editorial (`/admin/editor/projetos/:id` vs `/projetos/:id`).

### 2.3 Contrato de Mídia no Supabase
- Atualizados os buckets `project-images` e `editorial-project-images` no Supabase Storage:
  - Formatos permitidos: `['image/png', 'image/jpeg', 'image/webp']`.
  - Limite por arquivo aumentado de 1 MB para 3 MB (`3145728` bytes).
- Migration idempotente `20261014130000_update_project_images_bucket_limits.sql` com atualização da procedure `portfolio_editorial.reserve_media`.

---

## 3. Consequências e Validação

- **Testes Unitários:** 34 suítes e 176 testes unitários executados com 100% de aprovação (`npm test`).
- **Performance de Build:** `npm run build` gerou chunk inicial de 469.32 kB, respeitando rigorosamente o limite de orçamento de 500 kB (ADR-015).
- **Compatibilidade Retroativa:** Preservada a âncora `<span id="projetos" class="section-anchor-compat"></span>` para garantir compatibilidade com links e fluxos anteriores.

