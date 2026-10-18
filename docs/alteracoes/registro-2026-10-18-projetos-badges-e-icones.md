# Registro de Alterações — Badges de Visibilidade, Layout de Cards de Projetos e Ícones SVG de Tecnologias

Data: 18/10/2026  
Escopo: Implementação de badges de visibilidade (`Público` / `Privado` — `Public` / `Private`) nos cards de projetos e no topo direito da página de detalhes (`/projetos/:id`), ajuste do posicionamento das tecnologias logo abaixo da descrição nos cards de projetos e adição de ícones SVG dedicados para tecnologias (`RxJS`, `Bootstrap`, `Chart.js`, `OpenLayers`, `CUDA`, `OCR`), mantendo 100% de conformidade white-label.

---

## 1. Badges de Visibilidade (`Público` / `Privado`)

- **Modelo e Serviços (`portfolio-content.models.ts`, `editorial-snapshot.validator.ts`, `published-snapshot-content.service.ts`, `editorial-snapshot-adapter.ts`, `portfolio-content.service.ts`):**
  - Adicionado o tipo `PortfolioProjectVisibility = 'public' | 'private'` e a propriedade opcional `visibility?: PortfolioProjectVisibility` em `PortfolioProject`.
  - Inferência automática de visibilidade baseada na presença de links externos (`links.length > 0 ? 'public' : 'private'`) quando o campo não está explicitamente definido no payload, mantendo total retrocompatibilidade com snapshots existentes.
- **Rótulos Bilíngues (`portfolio-ui-labels.ts`):**
  - Adicionados `publicProject` (`"Público"` / `"Public"`) e `privateProject` (`"Privado"` / `"Private"`).
- **Card de Projeto (`ProjectCardComponent`):**
  - Adicionado badge discreto sobre a capa do projeto indicando se o código é público (com ícone de globo) ou privado (com ícone de cadeado).
- **Página de Detalhes do Projeto (`ProjectDetailComponent`):**
  - Adicionado o badge `.project-visibility-badge` posicionado no **topo direito** do cabeçalho (`header.project-hero`), alinhado no extremo oposto ao badge de categoria (`Projetos Profissionais` / `Projetos Pessoais`).

---

## 2. Posicionamento das Tecnologias nos Cards de Projetos (`ProjectCardComponent`)

- Em `src/app/shared/components/project-card/project-card.component.css`:
  - Removido `margin-top: auto` de `.project-card__technologies` (substituído por `margin-top: 0.25rem; padding-top: 0.15rem;`), fazendo com que os chips de tecnologias fiquem imediatamente abaixo da descrição do projeto, sem buracos visuais quando cards vizinhos possuem textos maiores.
  - Aplicado `margin-top: auto` em `.project-card__footer`, garantindo que a linha divisória e o botão *"Ver projeto completo"* permaneçam alinhados na parte inferior de todos os cards da grade.

---

## 3. Novos Ícones SVG Dedicados para Tecnologias (`src/assets/skills/`)

- Criados 6 novos ícones vetoriais SVG em `src/assets/skills/`:
  - `rxjs.svg` (`RxJS`)
  - `bootstrap.svg` (`Bootstrap`)
  - `chartjs.svg` (`Chart.js`)
  - `openlayers.svg` (`OpenLayers`)
  - `cuda.svg` (`CUDA`)
  - `ocr.svg` (`OCR`)
- Registrados os caminhos diretos em `DIRECT_ICON_URLS` (`src/app/features/portfolio/services/technology-icons.ts`) e `FALLBACK_SKILL_ICON_URLS` (`src/app/features/portfolio/services/portfolio-content.ts`), eliminando o placeholder genérico `</>`.

---

## 4. Validação e Conformidade White-Label

- **White-Label Gate:** `npm run check:white-label` aprovado com 0 ocorrências de dados pessoais no código-fonte.
- **Testes Unitários:** 36 arquivos de teste / 189 testes passando (`npm test -- --watch=false`).
- **Build de Produção:** `npm run build` concluído com código 0.
