# Spec da Feature — Estilização Moderna da Seção de Habilidades (Inspirada no Estilo Josias Broch)

Status: Aprovada  
Projeto: Portfólio Profissional — João Vitor Dias Fernandes  
Onde vive no código:
- `src/app/features/portfolio/pages/portfolio-page/`
- `src/app/features/portfolio/services/portfolio-content.ts`
- `src/app/features/portfolio/services/portfolio-translations.ts`

---

## 1. Objetivo

Aprimorar a apresentação visual da seção de **Habilidades** (`#stack-tecnica`), inspirando-se na referência moderna e limpa do portfólio de [Josias Broch](https://josiasbroch-dev.vercel.app/), mantendo integralmente os **ícones coloridos e oficiais de cada tecnologia** (`/assets/skills/...`), a organização categorizada e os contratos de teste e de edição editorial.

---

## 2. Como funciona hoje

Atualmente, a seção de habilidades exibe as 6 categorias divididas em uma grade rígida de 2 colunas (`.skills-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }`), onde cada categoria é envolvida por um container pesado de borda sólida (`.skill-category`) contendo uma lista flexível de itens compactos. A apresentação carece do espaçamento elegante e dos cards individuais em destaque presentes na referência.

---

## 3. Requisitos funcionais

### FR-001 — Estrutura de Categorias Abertas e Fluidas
QUANDO a seção `#stack-tecnica` for renderizada  
O SISTEMA DEVE:
1. Organizar as categorias em fluxo vertical limpo com espaçamento generoso entre elas.
2. Apresentar os títulos de cada categoria em caixa alta sutil com letter-spacing refinado (`0.08em`) e tonalidade de acento.
3. Eliminar a caixa externa cinza pesada em volta de toda a categoria, dando destaque individual aos cards de cada tecnologia.

### FR-002 — Cards Individuais de Habilidade (Estilo Josias Broch)
QUANDO cada habilidade (`.skill-item`) for exibida  
O SISTEMA DEVE renderizar um card individual com:
1. **Ícone oficial colorido** da tecnologia posicionado no topo e centralizado (mantendo os SVGs/PNGs reais de alta qualidade em `/assets/skills/`).
2. **Nome da tecnologia** centralizado logo abaixo do ícone com tipografia legível e contraste confortável.
3. Cantos arredondados (`border-radius: 1rem`), fundo quente (`var(--paper-strong)`), borda sutil (`var(--line)`) e sombra suave.
4. Efeito de hover moderno: elevação do card (`translateY(-4px)`), realce da borda com tom âmbar/dourado (`#c48b52`), leve escala no ícone e aumento sutil de sombra.

### FR-003 — Tecnologias e Contato Real de João Vitor
QUANDO o catálogo de habilidades for carregado  
O SISTEMA DEVE:
1. Preservar todas as tecnologias já aprovadas e validadas por testes (TypeScript, Python, Java, PHP, JavaScript, Dart, FastAPI, Spring Boot, Laravel, REST APIs, JSF, Angular, Flutter, HTML, CSS, React, Docker, Gradle, Maven, Grafana, PostgreSQL, Supabase, MySQL, Oracle Database, Git, GitHub, GitLab, GitKraken, OpenCV, YOLOv8).
2. Adicionar tecnologias com ícones já existentes no repositório com as quais João Vitor possui contato comprovado em projetos (como `MediaPipe` em visão computacional e `Redis` em bancos de dados).

### FR-004 — Compatibilidade com Seletores e Atributos Editoriais
QUANDO a suíte de testes for executada  
O SISTEMA DEVE preservar:
1. O seletor `#stack-tecnica h2` contendo o título "Habilidades" / "Skills".
2. As 6 categorias com a classe `.skill-category` e os atributos `[data-testid]="'skills-' + category.id"`.
3. O container principal com `[data-testid]="skills-section"`.
4. Os atributos `data-editorial-collection-kind="skillCategory"`, `data-editorial-collection-kind="skill"`, `data-editorial-item-id` e `data-editorial-entity`.

---

## 4. Critérios de aceite

### AC-001 — Visual de cards individuais categorizados
Dado que o visitante visualiza a seção `#stack-tecnica`  
Quando os itens forem renderizados  
Então cada tecnologia deve ser exibida como um card independente, com seu ícone oficial colorido centralizado no topo e nome abaixo, agrupados por categorias com títulos em caixa alta.

### AC-002 — Preservação dos ícones reais
Dado que os cards de tecnologia são renderizados  
Quando o visitante inspeciona os ícones  
Então todos os ícones exibidos devem ser os oficiais reais da tecnologia (ex: Python colorido, Angular vermelho, Docker baleia azul, etc.), e não ícones genéricos de outline.

### AC-003 — Efeito interativo de hover
Dado que o visitante passa o cursor sobre qualquer card de tecnologia  
Quando o evento de hover ocorrer  
Então o card deve elevar suavemente com transição fluida, realce de borda e sombra reforçada.

### AC-004 — Regressão zero na suíte de testes
Dado que a estilização e catálogo foram aplicados  
Quando os testes unitários forem executados (`npm test`)  
Então todos os 170 testes devem passar com 100% de sucesso.

