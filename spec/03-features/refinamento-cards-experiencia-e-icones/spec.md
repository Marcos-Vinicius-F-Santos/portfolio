# Spec da Feature — Refinamento dos Cards de Experiência e Ícones de Tecnologias

Status: Implementado — pronto para revisão  
Data: 2026-10-06  
Projeto: Portfólio Profissional — João Vitor Dias Fernandes  
Onde vive no código:  
- Layout & Estilos: `src/app/features/portfolio/presentation/portfolio-page/`
- Ícones e Tecnologias: `src/assets/skills/`, `src/assets/technologies/`, `src/app/features/portfolio/content/technology-icons.ts`, `src/app/features/portfolio/content/portfolio-content.ts`

---

## 1. Objetivo

1. **Delimitação e Ergonomia Visual dos Cards de Experiência**:
   - Estabelecer limites visuais profissionais e claros entre as colunas esquerda (Contexto e Responsabilidades) e direita (Decisões Técnicas e Resultados), evitando a sensação de espaço difuso ou desbalanceado.
   - Tratar a tipografia e o alinhamento de texto (avaliando a viabilidade de `text-align: justify` com hifenização controlada vs. alinhamento à esquerda refinado).
2. **Ícones Oficiais para Tecnologias Faltantes**:
   - Fornecer e associar os ícones oficiais em formato SVG/PNG para todas as tecnologias do catálogo e dos projetos que atualmente exibem o marcador genérico `</>` ou caixas vazias (Python, OpenCV, YOLOv8, MediaPipe, Flutter, Angular, FastAPI, Laravel, Dart, PHP, JSF, Supabase, Oracle Database, Redis, GitLab, GitKraken, Gradle, Maven).

---

## 2. Contexto e Problemas Diagnosticados

### 2.1 Cards de Experiência
- **Falta de Delimitação entre Colunas**: O layout de 2 colunas (`.experience-details`) utiliza apenas um `gap: 1.5rem` sobre o mesmo fundo (`#e8e4d9`), sem divisória vertical, bordas ou sub-cards.
- **Assimetria de Conteúdo**: O bloco de Contexto possui 1 parágrafo curto, enquanto Responsabilidades possui múltiplos itens detalhados. Na coluna direita, Decisões Técnicas e Resultados possuem itens concisos. Sem bordas ou separadores, o leitor não percebe onde termina a coluna esquerda e onde inicia a coluna direita.
- **Alinhamento do Texto**: O alinhamento à esquerda gera quebras irregulares na margem direita de cada coluna. Se for aplicado `text-align: justify` direto sem `hyphens: auto`, surgem espaçamentos excessivos entre palavras ("rios de espaço branco").

### 2.2 Tecnologias com Ícone Faltante (`</>`)
- No componente `<app-project-technologies>`, tecnologias sem URL de imagem mapeada caem no fallback `<span class="symbol">&lt;/&gt;</span>`.
- Na seção pública de Habilidades, tecnologias sem ícone ficam sem ilustração gráfica.
- Total de tecnologias pendentes identificadas: 18 itens.

---

## 3. Requisitos Funcionais (EARS)

### 3.1 Limites dos Cards de Experiência e Largura dos Containers
- **FR-001**: QUANDO o visitante visualizar os cards de experiência em tela desktop (>= 768px), O SISTEMA DEVE apresentar linhas divisórias sólidas contínuas (`1px solid var(--line)`) de uma extremidade à outra do card, tanto na vertical (da base do cabeçalho até o final do card) quanto na horizontal (entre os quadrantes superiores e inferiores), sem tracejados e sem quebras centrais.
- **FR-002**: O SISTEMA DEVE estruturar os blocos de experiência em 4 quadrantes contínuos (Superior Esquerdo: Contexto, Inferior Esquerdo: Responsabilidades, Superior Direito: Decisões Técnicas, Inferior Direito: Resultados) com padding interno consistente em cada célula.
- **FR-003**: QUANDO textos e parágrafos forem renderizados em seções e cards (como "Conteúdos estudados" e "Contexto"), O SISTEMA DEVE permitir que o texto ocupe toda a largura disponível de seus containers até o limite natural, sem restrições arbitrárias de `max-width`.
- **FR-004**: QUANDO o visitante acessar via dispositivo móvel (<= 760px), O SISTEMA DEVE colapsar os quadrantes de forma fluida para 1 coluna vertical contínua, com divisórias horizontais sólidas separando cada bloco.

### 3.2 Ícones de Tecnologias e Habilidades
- **FR-005**: QUANDO o visitante visualizar as tecnologias de um projeto (ex: Python, OpenCV, YOLOv8, MediaPipe, Flutter), O SISTEMA DEVE renderizar os respectivos logotipos oficiais em vetor/imagem limpa, eliminando a exibição do placeholder genérico `</>`.
- **FR-006**: QUANDO o visitante visualizar a seção pública de Habilidades, O SISTEMA DEVE exibir os ícones correspondentes para todas as tecnologias do catálogo (incluindo Angular, FastAPI, Spring Boot, Laravel, PHP, Dart, JSF, Supabase, Oracle, Gradle, Maven, GitLab e GitKraken).
- **FR-007**: Se por qualquer razão uma imagem de ícone falhar ao carregar via rede ou caminho quebrado, O SISTEMA DEVE manter o tratamento de fallback gracioso sem quebrar o layout.

---

## 4. Critérios de Aceite (Given / When / Then)

- **AC-001 (Limites e Separador de Colunas em Experiência)**:
  - *Dado* que estou na seção de Experiências no desktop,
  - *Quando* observo qualquer card de experiência,
  - *Então* há uma separação visual evidente entre a coluna esquerda (Contexto + Responsabilidades) e a coluna direita (Decisões Técnicas + Resultados), com margens equilibradas e sem mistura visual.

- **AC-002 (Tipografia e Alinhamento)**:
  - *Dado* que visualizo parágrafos e listas nos cards de experiência,
  - *Quando* leio o texto em diferentes resoluções,
  - *Então* o espaçamento entre palavras é homogêneo, sem lacunas desproporcionais e com contraste de acordo com o design editorial.

- **AC-003 (Exibição dos Ícones nos Projetos)**:
  - *Dado* que visualizo os cards dos projetos Russian Mastery e Pipeline de Visão Computacional para Boxe,
  - *Quando* olho para a linha de Tecnologias,
  - *Então* todos os itens (Python, OpenCV, YOLOv8, MediaPipe, Flutter, Redis, FastAPI, PostgreSQL, Docker, Angular, etc.) exibem seus respectivos logotipos oficiais em vez do símbolo `</>`.

- **AC-004 (Exibição dos Ícones nas Habilidades)**:
  - *Dado* que abro a seção Habilidades,
  - *Quando* navego por todas as categorias técnicas,
  - *Então* as tecnologias possuem ícones associados sem espaços vazios.

- **AC-005 (Performance e Build)**:
  - *Dado* que os arquivos de ícones foram incorporados ao projeto,
  - *Quando* executo `npm run build` e `npm test`,
  - *Então* o bundle respeita rigorosamente os budgets do Angular CLI (estilos <= 8 kB) e todos os 137 testes passam com sucesso.

---

## 5. Catálogo de Ícones a Adicionar

| Categoria | Tecnologia | Arquivo de Asset | Formato |
| :--- | :--- | :--- | :---: |
| Linguagens | Python | `src/assets/skills/python.svg` | SVG |
| Linguagens | PHP | `src/assets/skills/php.svg` | SVG |
| Linguagens | Dart | `src/assets/skills/dart.svg` | SVG |
| Frameworks / Web | Angular | `src/assets/skills/angular.svg` | SVG |
| Frameworks / Web | Flutter | `src/assets/skills/flutter.svg` | SVG |
| Frameworks / Web | FastAPI | `src/assets/skills/fastapi.svg` | SVG |
| Frameworks / Web | Laravel | `src/assets/skills/laravel.svg` | SVG |
| Frameworks / Web | Spring Boot | `src/assets/technologies/spring.svg` *(já existe)* | SVG |
| Frameworks / Web | JSF | `src/assets/skills/jsf.svg` | SVG / PNG |
| Bancos de Dados | Supabase | `src/assets/skills/supabase.svg` | SVG |
| Bancos de Dados | Oracle Database | `src/assets/skills/oracle.svg` | SVG |
| Bancos de Dados | Redis | `src/assets/skills/redis.svg` | SVG |
| DevOps | Gradle | `src/assets/skills/gradle.svg` | SVG |
| DevOps | Maven | `src/assets/skills/maven.svg` | SVG |
| Visão / Versionamento | OpenCV | `src/assets/skills/opencv.svg` | SVG |
| Visão / Versionamento | YOLOv8 | `src/assets/skills/yolo.svg` | SVG |
| Visão / Versionamento | MediaPipe | `src/assets/skills/mediapipe.svg` | SVG |
| Visão / Versionamento | GitLab | `src/assets/skills/gitlab.svg` | SVG |
| Visão / Versionamento | GitKraken | `src/assets/skills/gitkraken.svg` | SVG |
