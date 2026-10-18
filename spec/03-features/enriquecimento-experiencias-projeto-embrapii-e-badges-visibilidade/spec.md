# Spec da Feature — Enriquecimento do Portfólio via LinkedIn, 5º Projeto (EMBRAPII) e Badges de Visibilidade (Público/Privado)

Status: Proposta para Revisão e Aprovação de João Vitor  
Data: 18/10/2026  
Projeto: Portfólio Profissional (`joaovitordf/portfolio`)  
Autor: João Vitor Dias Fernandes  
Onde vive no código:
- `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json` (dados das 4 experiências e dos 5 projetos em PT e EN)
- `spec/05-verificacao/joao-vitor/generate-publication-sql.mjs` e `publicar_snapshot_joao_vitor.sql`
- `src/app/features/portfolio/services/portfolio-content.models.ts` (modelo de visibilidade de projetos)
- `src/app/shared/components/project-card/` (badge visual de Público / Privado no card da vitrine)
- `src/app/features/portfolio/pages/project-detail/` (badge visual de Público / Privado na página de detalhes)
- `src/app/features/portfolio/services/portfolio-ui-labels.ts` (rótulos bilíngues para "Público" / "Privado")

---

## 1. Contexto e Motivação

Com base nos dados extraídos diretamente do perfil oficial de João Vitor no LinkedIn:
1. **Adição do 5º Projeto (Plataforma de Gestão de Crédito e OCR — Polo EMBRAPII):**
   - O projeto desenvolvido no Polo de Inovação EMBRAPII - IFMG destaca fortemente competências em **Java, Spring Boot, MySQL e Docker** combinadas com **Python, OpenCV e OCR** para processamento automatizado de documentos.
   - Atualmente, ele constava apenas como experiência e não como card de projeto no `#portfolio`. Sua inclusão como projeto profissional amplia a vitrine para 5 projetos (3 profissionais e 2 pessoais).

2. **Enriquecimento Técnico das 4 Experiências Profissionais:**
   - **SensorEng Soluções em Inteligência Artificial:** Incluir o desenvolvimento de interfaces para visualização de alertas de detecção de EPIs (Equipamentos de Proteção Individual / PPE) com IA.
   - **Polo de Inovação EMBRAPII - IFMG:** Atualizar período para Março 2024 - Abril 2025 (1 ano e 2 meses), detalhar APIs RESTful em Java/Spring Boot, microserviço de OCR em Python/OpenCV, MySQL e Docker.
   - **Avante Soluções Digitais:** Especificar a atuação com Java, Spring Framework, PrimeFaces (JSF), Hibernate e Oracle Database no sistema ERP.
   - **Polo de Inovação IFMG (Ponto):** Detalhar a integração mobile com APIs em Laravel (PHP) e persistência local com SQLite e SharedPreferences.

3. **Novo Requisito Visual — Badges de Visibilidade (Público / Privado):**
   - Os cards de projetos no `#portfolio` e a página de detalhes `/projetos/:id` devem exibir um badge sutil e elegante indicando se o projeto é **Público** (*Public*) ou **Privado** (*Private*), deixando clara a natureza do código para recrutadores.

---

## 2. Classificação de Visibilidade dos Projetos

| Projeto | Categoria | Visibilidade | Link Externo | Justificativa de Visibilidade |
| :--- | :---: | :---: | :---: | :--- |
| **SensorEng — Monitoramento Industrial e Alertas de EPIs** | `Profissional` | **Privado** | *Sem link* | Código proprietário de empresa cliente. |
| **Plataforma de Gestão de Crédito e OCR (EMBRAPII)** | `Profissional` | **Privado** | *Sem link* | Código institucional corporativo do Polo de Inovação EMBRAPII. |
| **Aplicativo Ponto IFMG — Controle de Ponto Mobile** | `Profissional` | **Privado** | *Sem link* | Código institucional interno do campus. |
| **Russian Mastery — Plataforma Full-Stack de Russo** | `Pessoal` | **Público** | `GitHub` | Repositório público de código aberto. |
| **Pipeline de Visão Computacional para Boxe (TCC)** | `Pessoal` | **Público** | `GitHub` | Trabalho acadêmico/científico com código público. |

---

## 3. Requisitos Funcionais (Given / When / Then)

### FR-001 — Cadastro do 5º Projeto (Gestão de Crédito EMBRAPII)
- **GIVEN** o catálogo de projetos no `snapshot-joao-v1.json`
- **WHEN** for cadastrada a entidade do projeto `Plataforma de Gestão de Crédito e OCR`
- **THEN** deve conter tipo `professional`, visibilidade `private`, stack com `Java`, `Spring Boot`, `Python`, `OpenCV`, `OCR`, `MySQL`, `Docker`, `REST APIs`
- **AND** possuir descrições detalhadas, contexto, solução, papel, decisões técnicas, resultados e aprendizados em `pt-BR` e `en`.

### FR-002 — Enriquecimento das 4 Experiências Profissionais
- **GIVEN** as experiências existentes no snapshot
- **WHEN** os dados forem sincronizados com o LinkedIn
- **THEN** as descrições e títulos devem refletir as tecnologias e conquistas reais:
  - SensorEng: menção a alertas de EPIs via IA e refatoração modular lazy loading.
  - Polo EMBRAPII: Java, Spring Boot, microserviço de OCR com Python/OpenCV, MySQL e Docker (período mar/2024 - abr/2025).
  - Avante Soluções Digitais: Java, Spring Framework, PrimeFaces, Hibernate e Oracle Database.
  - Polo IFMG: Flutter, Dart, SQLite, SharedPreferences e backend Laravel.

### FR-003 — Badges de Visibilidade nos Cards de Projeto (`#portfolio`)
- **GIVEN** os cards de projetos na vitrine da página inicial
- **WHEN** o card for renderizado
- **THEN** deve exibir um badge discreto e moderno indicando `Público` (para projetos abertos) ou `Privado` (para projetos corporativos/institucionais)
- **AND** alternar para `Public` ou `Private` quando o idioma for trocado para inglês (`en`).

### FR-004 — Badges de Visibilidade no Topo Direito da Página de Detalhes (`/projetos/:id`)
- **GIVEN** a página de detalhe de qualquer projeto
- **WHEN** a tela for carregada
- **THEN** o cabeçalho (`header.project-hero`) deve exibir o badge do tipo de projeto (`Profissional` / `Pessoal`) no topo esquerdo e o badge de visibilidade (`Privado` / `Público` — `Private` / `Public`) alinhado no **topo direito** (`justify-content: space-between; width: 100%`).

### FR-005 — Blindagem White-Label e Sincronização do SQL
- **GIVEN** as alterações efetuadas
- **WHEN** os scripts `check-white-label-references.mjs` e `generate-publication-sql.mjs` forem executados
- **THEN** o gate de white-label deve passar com código 0 e o script `publicar_snapshot_joao_vitor.sql` deve ser regenerado com o novo hash e payload completo.

### FR-006 — Posicionamento das Tecnologias Logo Após a Descrição no Card do Projeto (`ProjectCardComponent`)
- **GIVEN** os cards de projetos na vitrine da seção `#portfolio`
- **WHEN** o card for renderizado
- **THEN** a lista de tecnologias (`.project-card__technologies`) deve ser exibida **imediatamente após a descrição do projeto** (`margin-top: 0.25rem;`, sem `margin-top: auto`), enquanto o rodapé (`.project-card__footer`) recebe `margin-top: auto;` para manter o botão *"Ver projeto completo"* alinhado na base do card.

### FR-007 — Ícones SVG Dedicados para Todas as Tecnologias dos Projetos (`RxJS`, `Bootstrap`, `Chart.js`, `OpenLayers`, `CUDA`, `OCR`)
- **GIVEN** as tecnologias listadas nos 5 projetos do portfólio
- **WHEN** os chips de tecnologias forem renderizados nos cards ou na página de detalhes
- **THEN** todas as tecnologias devem exibir ícones gráficos próprios (sem cair no fallback `</>`), incluindo ícones SVG dedicados em `src/assets/skills/` para `RxJS`, `Bootstrap`, `Chart.js`, `OpenLayers`, `CUDA` e `OCR`, devidamente mapeados em `technology-icons.ts`, `portfolio-content.ts` e no `snapshot-joao-v1.json`.

---

## 4. Critérios de Aceite (Definition of Done)

1. [x] Vitrine de projetos exibe 5 projetos (3 profissionais e 2 pessoais).
2. [x] Todos os 5 projetos exibem badge de `Público` ou `Privado` (e `Public` / `Private` em inglês) no card e no **topo direito** da tela de detalhes.
3. [x] Nos cards de projetos, as tecnologias aparecem logo após a descrição (sem espaço vazio intermediário), mantendo o rodapé alinhado na parte inferior.
4. [x] Todas as tecnologias dos projetos (`RxJS`, `Bootstrap`, `Chart.js`, `OpenLayers`, `CUDA`, `OCR`, etc.) possuem ícones SVG dedicados e não exibem o placeholder `</>`.
5. [x] As 4 experiências profissionais trazem os detalhes enriquecidos do LinkedIn (EPIs, Java/Spring, PrimeFaces/Oracle, Laravel/SQLite).
6. [x] `npm run check:white-label` passa com 100% de sucesso.
7. [x] Todos os testes unitários passando (`npm test`).
8. [x] Script `publicar_snapshot_joao_vitor.sql` atualizado e pronto para carga no Supabase.
9. [x] **NÃO realizar commit nem push para o GitHub antes da aprovação explícita de João Vitor.**


