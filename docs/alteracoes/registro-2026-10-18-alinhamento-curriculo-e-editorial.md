# Registro de Alterações — Revisão Geral, Saneamento de Dados, Refinamento Profissional e Blindagem Gitignore

Data: 18/10/2026  
Spec de referência: [`spec/03-features/revisao-geral-e-refinamento-portfolio/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/revisao-geral-e-refinamento-portfolio/spec.md)  
Plano de tarefas: [`spec/04-plano/revisao-geral-e-refinamento-portfolio/tarefas.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/04-plano/revisao-geral-e-refinamento-portfolio/tarefas.md)  

---

## 1. Alterações no Front-end Angular (`src/`)

1. **Saneamento do Catálogo de Habilidades e Categorias (`FR-001`):**
   - [`portfolio-content.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/portfolio/services/portfolio-content.ts) e [`portfolio-translations.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/portfolio/services/portfolio-translations.ts):
     - Adicionada chave de interface `skillsComputerVisionLabel` (`"Visão Computacional"` / `"Computer Vision"`).
     - Removidas `React` e `Node.js` de `PORTFOLIO_SKILL_CATEGORIES` (mantendo seus ícones diretos em `technology-icons.ts` para compatibilidade white-label com projetos legados).
     - Criada a 7ª categoria `computer-vision` agrupando `OpenCV`, `YOLOv8`, `MediaPipe` e `OCR`, deixando `version-control` estritamente com `Git`, `GitHub`, `GitLab` e `GitKraken`.
2. **Rótulo Fiel do Link Externo e Singularidade no Detalhe (`FR-004`):**
   - [`project-card.component.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/shared/components/project-card/project-card.component.ts) e [`project-card.component.html`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/shared/components/project-card/project-card.component.html):
     - Substituído o texto fixo `"Demo"` no badge sobre a capa por `externalLinkLabel()`, exibindo o rótulo real do link cadastrado (ex: `"GitHub"`).
   - [`portfolio-ui-labels.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/portfolio/services/portfolio-ui-labels.ts) e [`project-detail.component.html`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/portfolio/pages/project-detail/project-detail.component.html):
     - Adicionados `personalProjectSingular` (`"Projeto Pessoal"` / `"Personal Project"`) e `professionalProjectSingular` (`"Projeto Profissional"` / `"Professional Project"`) para o badge na página de projeto único.
3. **Navegação SPA sem Reload de Página (`FR-005`):**
   - [`app.config.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/app.config.ts): Habilitado `withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })`.
   - [`project-card.component.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/shared/components/project-card/project-card.component.ts) e [`project-detail.component.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/portfolio/pages/project-detail/project-detail.component.ts): Navegação interna fluida via `Router` preservando `href` nativo para permitir abertura em nova aba.
4. **SEO e `<title>` Dinâmico (`FR-006`):**
   - [`portfolio-page.component.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/portfolio/pages/portfolio-page/portfolio-page.component.ts) e [`project-detail.component.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/portfolio/pages/project-detail/project-detail.component.ts):
     - Injeção de `Title` e `Meta` para atualizar dinamicamente o título da aba (`<Autor> — <Cargo>` na Home e `<Projeto> — <Autor>` no Detalhe) e as meta tags `description`, `og:title` e `og:description`.
     - Carregamento de `remoteCopy` também em `ProjectDetailComponent` para garantir que acessos diretos a `/projetos/:id` carreguem o nome e monograma reais do autor.

---

## 2. Blindagem de Repositório (`.gitignore`)

Para garantir que o repositório permaneça neutro, seguro e utilizável como template White-Label por qualquer desenvolvedor, foram adicionadas regras restritivas ao [`.gitignore`](file:///c:/Users/xjoao/Desktop/portfolio/.gitignore):

1. **Scripts SQL Ad-hoc e Patches de Banco (`/supabase/sql/`, `*.sql`):**
   - Scripts de mutação pontual em instâncias específicas não devem poluir o histórico git.
   - Foram abertas exceções estritas apenas para as migrations oficiais e o setup arquitetural (`!supabase/setup_editorial.sql`, `!supabase/migrations/*.sql`).
2. **Documentações e Análises Pessoais (`/docs/auditoria*.md`, `/docs/*auditoria*`):**
   - Relatórios comparativos de currículo pessoal vs banco são documentos transitórios de auditoria local e não devem subir para o repositório público.
3. **Trilhas Individuais de Verificação (`/spec/**/joao-vitor/`):**
   - Pastas com anotações de validação de desenvolvedores individuais continuam estritamente ignoradas.

---

## 3. Alterações no Banco de Dados (Script SQL Consolidado)

Como arquivos `.sql` ad-hoc estão ignorados pelo `.gitignore`, o script SQL idempotente e atômico para execução no painel do Supabase fica registrado abaixo como documentação histórica:

```sql
BEGIN;

DO $$
DECLARE
  v_next_copy_pos integer;
  v_new_revision bigint;
  v_content jsonb;
  v_pub_id uuid;
  v_created_at timestamptz;
  v_snapshot jsonb;
  v_hash text;
BEGIN
  -- 1. Alinhamento de Datas e Visibilidade (FR-003)
  UPDATE portfolio_editorial.draft_entities
  SET data = jsonb_set(data, '{endDate}', '"2025-03-31"'::jsonb, true)
  WHERE draft_id = 1 AND id = '5ab9dd44-8d76-4490-a254-d7bd01029e37';

  UPDATE portfolio_editorial.draft_entities
  SET data = jsonb_set(data, '{visibility}', '"private"'::jsonb, true)
  WHERE draft_id = 1 AND id IN (
    'c11e35e2-7645-428b-b819-281511b94801',
    'd22f46e3-8756-439c-c920-392622c05912',
    'e33a57f4-9867-440d-d031-403733d16023'
  );

  UPDATE portfolio_editorial.draft_entities
  SET data = jsonb_set(data, '{visibility}', '"public"'::jsonb, true)
  WHERE draft_id = 1 AND id IN (
    '5b468d55-a913-465e-a69a-a052348efd26',
    '3f6fa6a5-f038-4ae5-a186-42a376465892'
  );

  -- 2. Uniformização de Avante Sistemas (PT-BR e EN) + JSF
  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(fields, '{title}', '"Desenvolvedor Fullstack Júnior · Avante Sistemas"'::jsonb, true)
  WHERE draft_id = 1 AND entity_id = '147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(fields, '{title}', '"Junior Fullstack Developer · Avante Sistemas"'::jsonb, true)
  WHERE draft_id = 1 AND entity_id = '147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9' AND locale_code = 'en';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{text}',
    '"Desenvolvi novos módulos e funcionalidades de negócio para o sistema ERP corporativo utilizando Java, Spring Framework e PrimeFaces (JSF — JavaServer Faces)."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-1' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{text}',
    '"Developed new modules and business features for the enterprise ERP platform using Java, Spring Framework, and PrimeFaces (JSF — JavaServer Faces)."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-1' AND locale_code = 'en';

  -- 3. Remover React, Node.js e chaves legadas não utilizadas
  DELETE FROM portfolio_editorial.draft_entities
  WHERE draft_id = 1 AND id IN (
    'skill-node-js',
    'skill-react',
    'copy-educationAppliedStatistics',
    'copy-educationGraphicDesign'
  );

  UPDATE portfolio_editorial.draft_entities SET position = 0 WHERE draft_id = 1 AND id = 'skill-fastapi';
  UPDATE portfolio_editorial.draft_entities SET position = 1 WHERE draft_id = 1 AND id = 'skill-spring-boot';
  UPDATE portfolio_editorial.draft_entities SET position = 2 WHERE draft_id = 1 AND id = 'skill-laravel';
  UPDATE portfolio_editorial.draft_entities SET position = 3 WHERE draft_id = 1 AND id = 'skill-rest-apis';
  UPDATE portfolio_editorial.draft_entities SET position = 4 WHERE draft_id = 1 AND id = 'skill-jsf';

  -- 4. Criar categoria Visão Computacional (computer-vision) e skill OCR
  SELECT coalesce(max(position) + 1, 0) INTO v_next_copy_pos
  FROM portfolio_editorial.draft_entities
  WHERE draft_id = 1 AND kind = 'interfaceText' AND parent_id IS NULL AND id <> 'copy-skillsComputerVisionLabel';

  INSERT INTO portfolio_editorial.draft_entities (draft_id, id, kind, parent_id, position, data)
  VALUES (1, 'copy-skillsComputerVisionLabel', 'interfaceText', NULL, v_next_copy_pos, '{"key": "skillsComputerVisionLabel"}'::jsonb)
  ON CONFLICT (draft_id, id) DO UPDATE SET data = EXCLUDED.data;

  INSERT INTO portfolio_editorial.draft_translations (draft_id, entity_id, locale_code, fields)
  VALUES
    (1, 'copy-skillsComputerVisionLabel', 'pt-BR', '{"text": "Visão Computacional"}'::jsonb),
    (1, 'copy-skillsComputerVisionLabel', 'en', '{"text": "Computer Vision"}'::jsonb)
  ON CONFLICT (draft_id, entity_id, locale_code) DO UPDATE SET fields = EXCLUDED.fields;

  INSERT INTO portfolio_editorial.draft_entities (draft_id, id, kind, parent_id, position, data)
  VALUES (1, 'computer-vision', 'skillCategory', NULL, 6, '{}'::jsonb)
  ON CONFLICT (draft_id, id) DO UPDATE SET position = 6, data = '{}'::jsonb;

  INSERT INTO portfolio_editorial.draft_translations (draft_id, entity_id, locale_code, fields)
  VALUES
    (1, 'computer-vision', 'pt-BR', '{"label": "Visão Computacional"}'::jsonb),
    (1, 'computer-vision', 'en', '{"label": "Computer Vision"}'::jsonb)
  ON CONFLICT (draft_id, entity_id, locale_code) DO UPDATE SET fields = EXCLUDED.fields;

  UPDATE portfolio_editorial.draft_entities SET parent_id = 'computer-vision', position = 0 WHERE draft_id = 1 AND id = 'skill-opencv';
  UPDATE portfolio_editorial.draft_entities SET parent_id = 'computer-vision', position = 1 WHERE draft_id = 1 AND id = 'skill-yolov8';
  UPDATE portfolio_editorial.draft_entities SET parent_id = 'computer-vision', position = 2 WHERE draft_id = 1 AND id = 'skill-mediapipe';

  INSERT INTO portfolio_editorial.draft_entities (draft_id, id, kind, parent_id, position, data)
  VALUES (1, 'skill-ocr', 'skill', 'computer-vision', 3, '{"iconMediaId": "asset-ocr", "technologyId": "ocr"}'::jsonb)
  ON CONFLICT (draft_id, id) DO UPDATE SET parent_id = 'computer-vision', position = 3, data = EXCLUDED.data;

  INSERT INTO portfolio_editorial.draft_translations (draft_id, entity_id, locale_code, fields)
  VALUES
    (1, 'skill-ocr', 'pt-BR', '{"name": "OCR"}'::jsonb),
    (1, 'skill-ocr', 'en', '{"name": "OCR"}'::jsonb)
  ON CONFLICT (draft_id, entity_id, locale_code) DO UPDATE SET fields = EXCLUDED.fields;

  -- 5. Contextualização de Siglas (SUAP, EMBRAPII, CNH, CRLV, HLS, RBAC, JCUKEN, ROIs, FSM)
  UPDATE portfolio_editorial.draft_translations
  SET fields = fields || jsonb_build_object(
    'description', 'Aplicativo mobile multiplataforma integrado ao SUAP (Sistema Unificado de Administração Pública) para automação de login e registro de ponto em um toque, histórico diário em tempo real e alarmes inteligentes.',
    'problemContext', 'O registro de ponto no portal governamental SUAP (Sistema Unificado de Administração Pública) via navegador no celular era burocrático e lento, gerando constantes esquecimentos de marcação e divergências de folha entre os colaboradores.'
  )
  WHERE draft_id = 1 AND entity_id = 'd22f46e3-8756-439c-c920-392622c05912' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = fields || jsonb_build_object(
    'description', 'Cross-platform mobile application integrated with SUAP (Unified Public Administration System) for one-tap automated clock-in, real-time daily attendance tracking, and smart audio reminders.',
    'problemContext', 'Logging daily work attendance on mobile browsers through the legacy government portal SUAP (Unified Public Administration System) was cumbersome, leading to frequent missed punches.'
  )
  WHERE draft_id = 1 AND entity_id = 'd22f46e3-8756-439c-c920-392622c05912' AND locale_code = 'en';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{context}',
    '"Pesquisador bolsista e desenvolvedor de software no Polo de Inovação EMBRAPII (Empresa Brasileira de Pesquisa e Inovação Industrial) do IFMG, atuando no desenvolvimento de uma plataforma de gestão de crédito comercial com APIs escaláveis em Java/Spring Boot e microsserviço de OCR (Reconhecimento Óptico de Caracteres) em Python/OpenCV."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '5ab9dd44-8d76-4490-a254-d7bd01029e37' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{context}',
    '"Scholarship researcher and software developer at the EMBRAPII (Brazilian Company of Research and Industrial Innovation) Innovation Hub at IFMG, building a commercial credit management platform with scalable Java/Spring Boot REST APIs and a Python/OpenCV OCR (Optical Character Recognition) microservice."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '5ab9dd44-8d76-4490-a254-d7bd01029e37' AND locale_code = 'en';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{text}',
    '"Desenvolvi e integrei serviço de processamento de imagem e OCR com Python e OpenCV para triagem e extração automatizada de dados em mais de 20 tipos de documentos comerciais (contratos sociais, demonstrativos financeiros, documentos de habilitação — CNH e registro veicular — CRLV)."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '5ab9dd44-8d76-4490-a254-d7bd01029e37-responsibilities-2' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = fields || jsonb_build_object(
    'role', 'Desenvolvedor de Software e Pesquisador Bolsista (Polo de Inovação EMBRAPII — Empresa Brasileira de Pesquisa e Inovação Industrial / IFMG)',
    'problemContext', 'O processo manual de concessão de crédito comercial exigia análise individual e morosa de dezenas de tipos de documentos (contratos sociais, balanços patrimoniais, documentos de habilitação — CNH, registro veicular — CRLV e certidões), gerando gargalos operacionais e vulnerabilidade a erros de digitação.'
  )
  WHERE draft_id = 1 AND entity_id = 'e33a57f4-9867-440d-d031-403733d16023' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = fields || jsonb_build_object(
    'role', 'Software Developer & Research Scholar (EMBRAPII — Brazilian Company of Research and Industrial Innovation Hub / IFMG)'
  )
  WHERE draft_id = 1 AND entity_id = 'e33a57f4-9867-440d-d031-403733d16023' AND locale_code = 'en';

  UPDATE portfolio_editorial.draft_translations
  SET fields = fields || jsonb_build_object(
    'description', 'Plataforma de monitoramento industrial para esteiras e maquinário com transmissão contínua de vídeo via protocolo HLS (HTTP Live Streaming), inferências de IA e telemetria de sensores IoT em mapas georreferenciados.',
    'solution', 'Refatoração arquitetural em Angular modular com lazy loading, biblioteca de componentes reutilizáveis para uniformidade de UI, mapas vetoriais dinâmicos e controle de acesso baseado em perfis (RBAC) multi-tenant seguro.'
  )
  WHERE draft_id = 1 AND entity_id = 'c11e35e2-7645-428b-b819-281511b94801' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = fields || jsonb_build_object(
    'description', 'Industrial monitoring platform for conveyor belts and machinery featuring continuous HLS (HTTP Live Streaming) video feeds, AI inferences, and IoT sensor telemetry on georeferenced maps.',
    'solution', 'Modular architecture refactoring with lazy loading in Angular, reusable UI component library, dynamic OpenLayers geospatial layers, and secure multi-tenant role-based access control (RBAC).'
  )
  WHERE draft_id = 1 AND entity_id = 'c11e35e2-7645-428b-b819-281511b94801' AND locale_code = 'en';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{problemContext}',
    '"O aprendizado de russo apresenta alta barreira pelo alfabeto cirílico, digitação no layout padrão de teclado russo (JCUKEN) e declinações complexas, carecendo de ferramentas que unam digitação ativa e repetição espaçada."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '5b468d55-a913-465e-a69a-a052348efd26' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{problemContext}',
    '"Learning Russian presents a steep barrier due to the Cyrillic alphabet, standard Russian keyboard layout (JCUKEN), and complex declensions, requiring active typing and spaced recall."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '5b468d55-a913-465e-a69a-a052348efd26' AND locale_code = 'en';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{solution}',
    '"Pipeline combinando YOLOv8 fine-tuned com MediaPipe Pose, algoritmo inovador de Regiões de Interesse (ROIs) dinâmicas (-83,6% no tempo de quadro), Máquina de Estados Finitos (FSM) para contagem de golpes e streaming via app mobile."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '3f6fa6a5-f038-4ae5-a186-42a376465892' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{solution}',
    '"Pipeline integrating fine-tuned YOLOv8 with MediaPipe Pose, dynamic geometric Regions of Interest (ROIs) reducing frame processing time by 83.6%, a Finite-State Machine (FSM) for strike counting, and a companion mobile streaming app."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '3f6fa6a5-f038-4ae5-a186-42a376465892' AND locale_code = 'en';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{text}',
    '"Formulação de segmentação geométrica com Regiões de Interesse (ROIs) dinâmicas, reduzindo em 83,6% o tempo total de processamento por quadro."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-3' AND locale_code = 'pt-BR';

  UPDATE portfolio_editorial.draft_translations
  SET fields = jsonb_set(
    fields,
    '{text}',
    '"Modelagem de Máquina de Estados Finitos (FSM) para validação e contagem de jabs, diretos e cruzados com base em limiares cinemáticos."'::jsonb,
    true
  )
  WHERE draft_id = 1 AND entity_id = '3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-4' AND locale_code = 'pt-BR';

  -- 6. Publicação Atômica da Nova Revisão no Snapshot Público
  UPDATE portfolio_editorial.draft
  SET revision = revision + 1, updated_at = now()
  WHERE id = 1
  RETURNING revision INTO v_new_revision;

  v_content := portfolio_editorial.build_publication_content();
  v_pub_id := gen_random_uuid();
  v_created_at := clock_timestamp();
  v_snapshot := v_content || jsonb_build_object('publicationId', v_pub_id, 'createdAt', v_created_at);
  v_hash := encode(extensions.digest(v_snapshot::text, 'sha256'), 'hex');

  INSERT INTO portfolio_editorial.publications (id, format_version, snapshot, hash, source_revision)
  VALUES (v_pub_id, 1, v_snapshot, v_hash, v_new_revision);

  UPDATE portfolio_editorial.site_state SET active_publication_id = v_pub_id, updated_at = now() WHERE id = 1;
  UPDATE portfolio_editorial.draft SET base_publication_id = v_pub_id, updated_at = now() WHERE id = 1;
END $$;

COMMIT;
```

---

## 4. Verificação e Gates de Qualidade

- `npm run check:white-label` → **Aprovado (0 violações)**
- `npm test -- --watch=false` → **36 suítes aprovadas (191 testes)**
- `npm run build` → **Build de produção gerado com sucesso**
