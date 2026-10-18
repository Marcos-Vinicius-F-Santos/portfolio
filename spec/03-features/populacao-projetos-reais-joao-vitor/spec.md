# Spec da Feature — População de Projetos Reais e Autênticos no Portfólio (João Vitor)

Status: Proposta para Revisão e Aprovação de João Vitor  
Data: 16/10/2026  
Projeto: Portfólio Profissional (`joaovitordf/portfolio`)  
Autor do Snapshot: João Vitor Dias Fernandes  
Onde vive no código:
- `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json` (carga oficial de dados autorais de João Vitor para o Supabase)
- `spec/05-verificacao/joao-vitor/generate-publication-sql.mjs` e `publicar_snapshot_joao_vitor.sql`
- `src/app/features/portfolio/services/technology-icons.ts` (mapeamento neutro de ícones de tecnologias)
- `src/app/features/portfolio/pages/portfolio-page/` (renderização e filtros: Todos, Profissionais, Pessoais)
- `src/app/features/portfolio/pages/project-detail/` (página completa de detalhes técnicos de cada projeto)

---

## 1. Contexto e Motivação

1. **Diagnóstico da Seção de Portfólio Atual:**
   - O `snapshot-joao-v1.json` atualmente possui apenas 2 projetos cadastrados (*Russian Mastery* e *Pipeline de Visão Computacional para Boxe*), ambos classificados como `personal`.
   - Com isso, ao selecionar a aba de filtro **"Profissionais"** (`projects.filter(p => p.type === 'professional')`), nenhum projeto é renderizado.
   - João Vitor possui 4 projetos autênticos inspecionados diretamente de suas pastas locais de desenvolvimento e validados com seu currículo oficial (`Currículo.pdf` e `Curriculum.pdf`):
     1. **SensorEng — Plataforma de Monitoramento Industrial e Telemetria IoT** (`professional`)
     2. **Aplicativo Ponto IFMG — Controle de Jornada e Ponto Eletrônico** (`professional`)
     3. **Russian Mastery — Plataforma Full-Stack de Idiomas e Repetição Espaçada** (`personal`)
     4. **Pipeline de Visão Computacional para Boxe / TCC** (`personal`)

2. **Diretriz de Segurança e Sigilo (CRÍTICO):**
   - **Zero Segredos / Credenciais:** Nenhuma chave de API de clientes, tokens JWT, senhas de banco ou credenciais de usuários (como senhas do SUAP do Ponto IFMG ou chaves da SensorEng) podem constar no código, snapshot ou scripts.
   - **Zero Informação Confidencial de Negócio:** Respeitar a propriedade intelectual das empresas clientes e instituições parceiras, descrevendo os desafios de engenharia, arquitetura, tecnologias e métricas sem expor segredos industriais ou de clientes.
   - **Conformidade 100% White-Label:** Nomes próprios e identificadores autorais (`joao`, `marcos`, `santos`, `joaovitordf`) permanecem estritamente proibidos nos diretórios rastreados pelo gate de white-label (`src/`, `scripts/`, `supabase/`, `public/`, `package.json`), residindo exclusivamente na camada de dados do perfil (`spec/05-verificacao/joao-vitor/snapshot-joao-v1.json` e no Supabase).

---

## 2. Especificação Detalhada dos 4 Projetos

### 2.1. Projeto 1: SensorEng — Plataforma de Monitoramento Industrial e Telemetria IoT
- **Tipo:** `professional`
- **Origem inspecionada:** `C:\Users\xjoao\Desktop\sensoreng-frontend` e `Currículo.pdf`
- **Papel:** Desenvolvedor Front-end / Engenheiro de Software Frontend
- **Tecnologias:** `Angular`, `TypeScript`, `RxJS`, `Bootstrap`, `Chart.js`, `REST APIs` (com uso de `OpenLayers` e streaming `HLS.js` para monitoramento de câmeras)
- **Contexto do Problema (pt-BR):**
  Plataforma de automação industrial para monitoramento contínuo de esteiras, maquinário pesado e ativos industriais que enfrentava alto acoplamento em um monólito frontend legado, resultando em tempos de carregamento inicial elevados e lentidão no carregamento de rotas em ambientes industriais com conectividade restrita.
- **Solução Desenvolvida (pt-BR):**
  Refatoração arquitetural completa para Angular 17 modular com carregamento sob demanda (*lazy loading*), integração reativa de telemetria IoT de sensores com mapas georreferenciados interativos e streaming de vídeo de câmeras industriais (HLS), além da criação de uma biblioteca proprietária de componentes de UI reutilizáveis (tabelas dinâmicas, filtros complexos e modais padronizados) e controle de permissões por perfil (RBAC) para isolamento multi-tenant seguro.
- **Decisões Técnicas (pt-BR):**
  1. Divisão do monólito em módulos de domínio desacoplados com carregamento sob demanda (lazy loading) por rota.
  2. Implementação de biblioteca interna de componentes compartilhados com Angular Material e Bootstrap para uniformidade de UI/UX.
  3. Gerenciamento reativo de fluxos contínuos de eventos assíncronos e telemetria de sensores utilizando RxJS.
  4. Integração de mapas interativos vetoriais com OpenLayers e streaming de baixa latência com HLS.js.
  5. Camada robusta de autenticação e proteção de rotas com guards garantindo isolamento estrito entre empresas clientes.
- **Resultados (pt-BR):**
  1. Redução de 85% no tamanho do pacote inicial de carregamento (*bundle size*) da aplicação.
  2. Aceleração de 60% no tempo de desenvolvimento e entrega de novas telas através da biblioteca de componentes reutilizáveis.
  3. Suporte escalável a mais de 50 empresas clientes corporativas com estabilidade no monitoramento simultâneo de telemetria e vídeo.
- **Aprendizados (pt-BR):**
  Otimização de performance web para sistemas de missão crítica, arquitetura escalável orientada a componentes e tratamento de múltiplos fluxos de dados concorrentes em tempo real.
- **Bilingual (en):**
  Versão em inglês espelhada fidedignamente a partir do `Curriculum.pdf` aprovado ("SensorEng — Industrial IoT Monitoring Platform").

---

### 2.2. Projeto 2: Aplicativo Ponto IFMG — Controle de Jornada e Ponto Eletrônico
- **Tipo:** `professional`
- **Origem inspecionada:** `C:\Users\xjoao\Desktop\ponto-ifmg-master\ponto-ifmg-master` e `Currículo.pdf`
- **Papel:** Desenvolvedor Mobile Flutter / Estagiário de Engenharia de Software
- **Tecnologias:** `Flutter`, `Dart`, `REST APIs` (com injeção de script via `flutter_inappwebview`, web scraping e armazenamento seguro local)
- **Contexto do Problema (pt-BR):**
  Servidores e colaboradores do campus precisavam realizar o registro de ponto diário no sistema institucional governamental (SUAP). A interface web no celular exigia múltiplos passos, recarregamentos e telas repetitivas, levando a frequentes esquecimentos de marcação e divergências na conferência de folha.
- **Solução Desenvolvida (pt-BR):**
  Aplicativo mobile multiplataforma desenvolvido em Flutter/Dart que automatiza o login e registro de ponto em um único toque através de injeção controlada de scripts, com rotinas de web scraping em tempo real para extração e renderização simplificada da folha diária de frequência, agendamento de alarmes sonoros inteligentes e validação de conexão na rede Wi-Fi institucional.
- **Decisões Técnicas (pt-BR):**
  1. Utilização de WebView headless com injeção segura de scripts JavaScript para autenticação automatizada no SUAP sem expor credenciais em servidores terceiros.
  2. Rotinas assíncronas de web scraping em tempo real para processar e estruturar o extrato diário de batidas diretamente no dispositivo.
  3. Módulo de agendamento de lembretes e alarmes sonoros com execução em segundo plano para alertar horários de entrada e saída.
  4. Validação de segurança baseada no SSID da rede Wi-Fi institucional para conformidade com normas de registro presencial.
  5. Armazenamento local seguro e criptografado de credenciais do usuário utilizando SharedPreferences.
- **Resultados (pt-BR):**
  1. Redução do tempo de registro de ponto de minutos para menos de 3 segundos em um único toque.
  2. Erradicação das falhas e esquecimentos de registro entre os colaboradores atendidos devido aos lembretes automáticos.
  3. Interface mobile intuitiva e confiável integrada a um sistema público legado sem necessidade de alteração na API institucional.
- **Aprendizados (pt-BR):**
  Engenharia de integração com sistemas legados, automação cliente via script injection, ciclo de vida de apps mobile em segundo plano e design centrado na rotina diária do usuário.
- **Bilingual (en):**
  Versão em inglês espelhada fidedignamente a partir do `Curriculum.pdf` aprovado ("IFMG Time & Attendance Mobile App").

---

### 2.3. Projeto 3: Russian Mastery — Plataforma Full-Stack de Aprendizado de Russo
- **Tipo:** `personal`
- **Origem inspecionada:** `C:\Users\xjoao\Desktop\russian-mastery` e `Currículo.pdf`
- **Papel:** Criador e Engenheiro Full-Stack
- **Tecnologias:** `Angular`, `TypeScript`, `Python`, `FastAPI`, `PostgreSQL`, `Redis`, `Docker`
- **Contexto do Problema (pt-BR):**
  O aprendizado de russo apresenta alta barreira de entrada devido ao alfabeto cirílico, digitação não trivial para estrangeiros (layout JCUKEN) e gramática com declinações complexas, gerando rápido desestímulo em estudantes por falta de ferramentas interativas que combinem digitação fonética e repetição científica.
- **Solução Desenvolvida (pt-BR):**
  Plataforma full-stack moderna com estúdio de digitação cirílica em tempo real, teclado virtual responsivo em tela, algoritmo adaptativo de repetição espaçada (SM-2 / SuperMemo), base lexicográfica indexada de mais de 43.500 termos, sistema de gamificação com progressão de XP em 10 níveis e infraestrutura conteinerizada com cache ultra-rápido via Redis.
- **Decisões Técnicas (pt-BR):**
  1. Frontend reativo em Angular 17 com controle avançado de eventos de teclado físico e virtual com destaque visual das teclas.
  2. Backend assíncrono em Python com FastAPI estruturado em Clean Architecture com injeção de dependência nativa.
  3. Implementação do algoritmo SuperMemo-2 (SM-2) para agendamento matemático de revisões e retenção ótima de longo prazo.
  4. Camada de cache de alto desempenho com Redis 7 para sessões e consultas, reduzindo a latência média da API para menos de 25ms.
  5. Banco relacional PostgreSQL 16 indexado para buscas eficientes sobre mais de 43.500 vocábulos e frases.
  6. Conteinerização completa com Docker e orquestração reprodutível com Docker Compose.
- **Resultados (pt-BR):**
  1. Plataforma full-stack em produção local com tempo de resposta inferior a 25ms para consultas e exercícios.
  2. Base completa de 43.500 vocábulos russos com cálculo instantâneo de retenção e progressão de usuário.
  3. Experiência de aprendizado imersiva combinando digitação ativa, áudio nativo e gamificação contínua.
- **Aprendizados (pt-BR):**
  Sinergia arquitetural entre Angular e FastAPI, modelagem de algoritmos de repetição espaçada, otimização de latência com Redis e design de UI responsiva para alfabetos não latinos.
- **Bilingual (en):**
  Versão em inglês espelhada a partir do `Curriculum.pdf` ("Russian Mastery — Full-Stack Language Learning Platform").

---

### 2.4. Projeto 4: Pipeline de Visão Computacional para Boxe (TCC IFMG)
- **Tipo:** `personal` (Trabalho de Conclusão de Curso / Pesquisa Aplicada)
- **Origem inspecionada:** `C:\Users\xjoao\Desktop\Pipeline_visao_computacional_para_deteccao_de_golpes_de_lutas_de_boxe` e `Currículo.pdf`
- **Papel:** Pesquisador e Engenheiro de Software / Visão Computacional
- **Tecnologias:** `Python`, `OpenCV`, `YOLOv8`, `MediaPipe`, `Flutter`, `CUDA`
- **Contexto do Problema (pt-BR):**
  Arbitragem e análise de desempenho em lutas de boxe são tradicionalmente manuais e suscetíveis a erros devido à alta velocidade dos golpes e oclusões visuais. Soluções computacionais existentes são pesadas demais para inferência em tempo real a partir de vídeos comuns de câmeras sem hardware de data center dedicado.
- **Solução Desenvolvida (pt-BR):**
  Pipeline completo de visão computacional e estimativa de pose combinando modelos YOLO customizados com MediaPipe Pose, um algoritmo inédito de Regiões de Interesse Dinâmicas (Dynamic ROIs) que reduziu o tempo de processamento por frame em 83,6%, uma Máquina de Estados Finitos (FSM) para detecção de golpes válidos (jabs, diretos, cruzados) e faltas, e um aplicativo companion em Flutter para streaming de vídeo ao vivo.
- **Decisões Técnicas (pt-BR):**
  1. Treinamento e ajuste fino de rede neural YOLOv8 sobre base de dados customizada de atletas em combate.
  2. Mapeamento articular contínuo de 33 marcos anatômicos esqueléticos via MediaPipe Pose para modelagem biomecânica.
  3. Formulação de segmentação geométrica com ROIs dinâmicas calculadas frame a frame, substituindo clusterização pesada.
  4. Modelagem de autômato de estados finito (FSM) baseado em velocidade vetorial, ângulo de extensão de cotovelo e trajetória.
  5. Companion app mobile em Flutter com streaming ao vivo de vídeo para servidor assíncrono e aceleração GPU via CUDA.
- **Resultados (pt-BR):**
  1. Redução comprovada de 83,6% no tempo total de processamento por quadro, viabilizando análise em tempo real.
  2. Detecção e classificação precisa de golpes de boxe com geração automática de relatórios de métricas esportivas.
  3. Apresentação e aprovação com distinção no Trabalho de Conclusão de Curso em Ciência da Computação no IFMG.
- **Aprendizados (pt-BR):**
  Deep learning aplicado a esportes, engenharia de pipelines de vídeo de baixa latência, biomecânica computacional e aceleração de inferência em GPU.
- **Bilingual (en):**
  Versão em inglês espelhada a partir do `Curriculum.pdf` ("Computer Vision Pipeline for Boxing Matches").

---

## 3. Requisitos Funcionais (Given / When / Then)

### FR-001 — População Completa dos 4 Projetos no Snapshot
- **GIVEN** o arquivo `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`
- **WHEN** for atualizado com os 4 projetos (2 profissionais e 2 pessoais)
- **THEN** as entidades `project`, `listItem` (technicalDecisions, results, learnings) e `projectLink` devem estar devidamente estruturadas com UUIDs v4 únicos
- **AND** conter traduções completas e ricas em `pt-BR` e `en` para todos os campos (`name`, `description`, `problemContext`, `solution`, `role`, itens de lista).

### FR-002 — Funcionamento Perfeito dos Filtros na Página Pública
- **GIVEN** a seção `#portfolio` da aplicação
- **WHEN** o usuário seleciona a aba de filtro:
  - **"Todos"**: deve exibir os 4 cards de projetos (2 profissionais e 2 pessoais)
  - **"Profissionais"**: deve exibir exatamente os 2 projetos profissionais (*SensorEng* e *Ponto IFMG*)
  - **"Pessoais"**: deve exibir exatamente os 2 projetos pessoais (*Russian Mastery* e *Boxe CV*)
- **THEN** cada card deve renderizar título, descrição, badges de tecnologias com ícones correspondentes e botão para ver detalhes.

### FR-003 — Navegação e Página de Detalhes de Cada Projeto
- **GIVEN** a rota `/projetos/:id` para qualquer um dos 4 projetos
- **WHEN** o usuário navega diretamente ou clica no card de projeto
- **THEN** a página de detalhe deve exibir a descrição completa, contexto do problema, solução, papel, decisões técnicas, tecnologias com ícones, resultados e aprendizados em layout responsivo com Topbar e Footer integrados.

### FR-004 — Conformidade Absoluta com White-Label
- **GIVEN** a execução do script `node scripts/check-white-label-references.mjs`
- **WHEN** todos os arquivos em `src/`, `scripts/`, `supabase/`, `public/` forem analisados
- **THEN** nenhuma menção aos termos bloqueados (`joao`, `marcos`, `santos`, `joaovitordf`) deve existir no código compartilhado.

### FR-005 — Geração e Sincronização do Script de Publicação SQL
- **GIVEN** o snapshot atualizado em `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`
- **WHEN** for executado `node spec/05-verificacao/joao-vitor/generate-publication-sql.mjs`
- **THEN** o arquivo `spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql` deve ser regenerado com sucesso, contendo o payload serializado pronto para execução no Supabase de João Vitor.

---

## 4. Critérios de Aceite (Definition of Done)

1. [ ] Os 4 projetos autênticos estão descritos com precisão técnica em `snapshot-joao-v1.json` em português e inglês.
2. [ ] Aba "Profissionais" exibe 2 projetos (*SensorEng* e *Ponto IFMG*); Aba "Pessoais" exibe 2 projetos (*Russian Mastery* e *Boxe*); Aba "Todos" exibe os 4 projetos.
3. [ ] Todos os ícones de tecnologia associados aos 4 projetos são reconhecidos e renderizados sem quebras.
4. [ ] Nenhuma credencial, segredo ou informação confidencial presente em qualquer arquivo.
5. [ ] Script `publicar_snapshot_joao_vitor.sql` sincronizado e pronto para carga no banco.
6. [ ] Gate de White-Label passando com 100% de sucesso (`npm run check:white-label`).
7. [ ] Suite completa de testes unitários passando sem regressões (`npm test`).
8. [ ] **NÃO realizar commit nem push para o GitHub antes da aprovação explícita de João Vitor.**

