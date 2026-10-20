# Spec da Feature — Adição da Avante Soluções Digitais como Projeto Profissional no Portfólio

Status: Aprovado por João Vitor  
Data de Criação: 19/10/2026  
Última Atualização: 19/10/2026  
Projeto: Portfólio Profissional (`joaovitordf/portfolio`)  
Autor do Conteúdo: João Vitor Dias Fernandes  
Onde vive no código:
- `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json` (cadastro da entidade de projeto, traduções PT/EN e itens estruturados)
- `spec/05-verificacao/joao-vitor/generate-publication-sql.mjs` e `publicar_snapshot_joao_vitor.sql`
- `src/app/features/portfolio/services/technology-icons.ts` (mapeamento neutro de ícones: PrimeFaces, Hibernate, Spring Framework, ERP, SQL)
- `spec/05-verificacao/joao-vitor/verify-snapshot.mjs` (validação estrutural de contagem e integridade)

---

## 1. Contexto e Motivação

João Vitor identificou em revisão do currículo que a sua atuação na **Avante Soluções Digitais** (Ago 2024 – Jan 2025) não estava visível na vitrine de projetos do portfólio.
Embora existisse um registro de entidade do tipo `experience` no banco editorial do Supabase, a página inicial do portfólio (`PortfolioPageComponent`) não exibe a seção de experiências (removida no commit `14d023403`).

Como as outras experiências reais de João Vitor (SensorEng, Ponto IFMG e Gestão de Crédito) foram modeladas com sucesso como projetos da vitrine `#portfolio`, João Vitor aprovou equiparar a **Avante Soluções Digitais** como **Projeto Profissional**, permitindo:
1. Exibição imediata do card na vitrine de projetos sob o filtro **"Profissionais"** e **"Todos"**;
2. Destaque de tecnologias corporativas de backend e fullstack de alto valor: **Java**, **Spring Framework**, **PrimeFaces (JSF)**, **Hibernate**, **Oracle Database**, **SQL**, **Git**, **ERP**;
3. Acesso à página completa de estudo de caso em coluna única (`/projetos/:id`).

---

## 2. Especificação Detalhada do Projeto Avante ERP

### 2.1. Metadados da Entidade
- **ID da Entidade:** `7f41a8c9-9ca4-4155-b6ab-8bf4dcf6c9a9` (UUID consistente)
- **Tipo de Projeto:** `professional`
- **Visibilidade:** `private` (Código proprietário corporativo com thumbnail e badge de cadeado)
- **Posição no catálogo:** Posição indexada contígua aos projetos profissionais existentes.
- **Lista de IDs de Tecnologias:** `['java', 'spring', 'jsf', 'primefaces', 'hibernate', 'oracle', 'sql', 'git']`

### 2.2. Textos e Conteúdo Estruturado (pt-BR)
- **Nome:** `Avante Soluções Digitais — Sistema ERP Corporativo`
- **Descrição Curta:**
  `Desenvolvimento e evolução de módulos de negócio para sistema ERP corporativo em Java, Spring Framework e PrimeFaces (JSF), com persistência e otimização de consultas em Oracle Database e Hibernate.`
- **Contexto do Problema (`problemContext`):**
  `Sistemas de gestão empresarial (ERP) demandam alta confiabilidade transacional, precisão contábil e consistência de dados em operações concorrentes entre múltiplos departamentos, exigindo resolução ágil de defeitos em produção e evolução contínua de regras fiscais e operacionais sem interrupção dos serviços.`
- **Solução Desenvolvida (`solution`):**
  `Atuação presencial full-stack no desenvolvimento de novos módulos e funcionalidades de negócio com Java e Spring Framework, construção de interfaces corporativas ricas com PrimeFaces (JSF), mapeamento objeto-relacional eficiente com Hibernate e diagnóstico/otimização de consultas e procedimentos em Oracle Database.`
- **Papel Desempenhado (`role`):**
  `Desenvolvedor Júnior Fullstack responsável pelo desenvolvimento de novas funcionalidades, manutenção corretiva e evolutiva, otimização de queries SQL e persistência de dados em produção.`
- **Decisões Técnicas (`technicalDecisions`):**
  1. `Implementação de regras de negócio em camadas de serviço desacopladas com Java e Spring Framework, assegurando atomicidade transacional e integridade de dados.`
  2. `Construção e manutenção de interfaces ricas com PrimeFaces e JavaServer Faces (JSF), estruturando formulários dinâmicos complexos para fluxos operacionais.`
  3. `Gerenciamento de persistência de dados e mapeamento objeto-relacional com Hibernate/JPA, prevenindo sobrecarga de consultas N+1 e bloqueios de concorrência.`
  4. `Diagnóstico, depuração e indexação de consultas SQL complexas diretamente no Oracle Database para otimização de desempenho e geração de relatórios operacionais.`
- **Resultados Alcançados (`results`):**
  1. `Estabilidade e evolução contínua dos módulos de ERP atendendo à rotina operacional diária de múltiplos departamentos e segmentos de negócio.`
  2. `Redução sensível no tempo de diagnóstico e resolução de incidentes críticos em backend e banco de dados em ambiente de produção.`
  3. `Melhoria expressiva de tempo de resposta em consultas e transações de banco de dados no Oracle Database através de refatoração de rotinas SQL.`
- **Aprendizados Consolidados (`learnings`):**
  1. `Engenharia de software aplicada a sistemas ERP legados e corporativos de grande porte com regras de negócio densas e dados transacionais críticos.`
  2. `Melhores práticas de depuração full-stack entre camadas de interface JSF/PrimeFaces, serviços Spring e banco de dados relacional Oracle.`

### 2.3. Textos e Conteúdo Estruturado (en)
- **Name:** `Avante Soluções Digitais — Enterprise ERP Platform`
- **Short Description:**
  `Development and maintenance of business modules for an enterprise ERP platform using Java, Spring Framework, and PrimeFaces (JSF), managing persistence and optimizing complex queries with Oracle Database and Hibernate.`
- **Problem Context (`problemContext`):**
  `Enterprise Resource Planning (ERP) systems require high transactional reliability, accounting precision, and data consistency under concurrent operations across multiple business departments, demanding agile defect resolution in production and continuous evolution of financial and operational workflows without service downtime.`
- **Developed Solution (`solution`):**
  `On-site full-stack development of new modules and business features using Java and Spring Framework, building rich UI workflows with PrimeFaces (JSF), configuring efficient object-relational mapping via Hibernate, and diagnosing/optimizing complex queries and procedures on Oracle Database.`
- **Role (`role`):**
  `Junior Fullstack Developer responsible for building new features, performing bug diagnosis and maintenance, optimizing SQL queries, and managing enterprise data persistence in production.`
- **Technical Decisions (`technicalDecisions`):**
  1. `Implementation of business logic in decoupled service layers using Java and Spring Framework, ensuring atomic transactions and data integrity.`
  2. `Development and maintenance of rich enterprise interfaces with PrimeFaces and JavaServer Faces (JSF), structuring dynamic forms for operational workflows.`
  3. `Management of data persistence and optimization of object-relational mapping with Hibernate/JPA to prevent N+1 query overhead and concurrency table locks.`
  4. `Diagnosis, debugging, and indexing of complex SQL queries directly on Oracle Database to optimize performance and operational reporting.`
- **Results (`results`):**
  1. `Continuous stability and evolution of core ERP modules supporting daily business operations across multiple company departments and market segments.`
  2. `Reduced turnaround time for diagnosing and resolving critical production incidents across backend services and database layers.`
  3. `Noticeable response time improvements for database queries and transactions in Oracle Database through refactoring of SQL routines and index tuning.`
- **Learnings (`learnings`):**
  1. `Software engineering applied to large-scale enterprise ERP systems with dense business rules and mission-critical transactional data.`
  2. `Best practices in full-stack debugging across JSF/PrimeFaces presentation layers, Spring business services, and Oracle relational database.`

---

## 3. Requisitos Funcionais

- **FR-001 (Cadastro no Snapshot Editorial):**
  - Adicionar a entidade de projeto `7f41a8c9-9ca4-4155-b6ab-8bf4dcf6c9a9` com seus respectivos `listItem` (Decisões, Resultados e Aprendizados) em `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`.
  - Incluir traduções completas para `pt-BR` e `en`.
- **FR-002 (Mapeamento de Ícones de Tecnologias):**
  - Mapear em `technology-icons.ts`: `PrimeFaces` (para `jsf.svg`), `Hibernate` (para `java.png`), `Spring Framework` (para `spring.svg`), `SQL` (para `sql-server.png`).
- **FR-003 (Script de Publicação SQL):**
  - Atualizar `generate-publication-sql.mjs` e gerar `publicar_snapshot_joao_vitor.sql` contemplando os 6 projetos no Supabase.
- **FR-004 (Validação de Snapshot e Testes):**
  - Atualizar `verify-snapshot.mjs` para validar os 6 projetos (4 profissionais e 2 pessoais).
  - Executar todos os testes da suíte e gates de qualidade (`npm test`, `check:white-label`, `build`).

---

## 4. Critérios de Aceite (Given / When / Then)

- **CA-01 (Filtro Profissionais):**
  - *Given* a navegação para `#portfolio`,
  - *When* o usuário clica na aba "Profissionais",
  - *Then* o card da **Avante Soluções Digitais** é exibido ao lado de SensorEng, Ponto IFMG e Gestão de Crédito com badge de projeto profissional e privado (código proprietário).

- **CA-02 (Página de Detalhes em Coluna Única):**
  - *Given* o clique no card da Avante,
  - *When* a rota `/projetos/7f41a8c9-9ca4-4155-b6ab-8bf4dcf6c9a9` é carregada,
  - *Then* a página renderiza todos os cards na sequência aprovada (Contexto ➔ Papel ➔ Solução ➔ Decisões Técnicas ➔ Aprendizados ➔ Resultados destacada ➔ Tecnologias ➔ Links), com os chips de tecnologias contendo ícones adequados.

