# Registro de Alterações — 20/10/2026: Alinhamento de Textos dos Projetos e Publicação Editorial

## 1. Motivação e Contexto
- Revisão completa e final dos textos dos 6 projetos do portfólio (`SensorEng`, `Plataforma de Crédito e OCR`, `Aplicativo Ponto IFMG`, `Avante Soluções Digitais ERP`, `Russian Mastery`, e `Pipeline de Visão Computacional para Boxe`).
- Eliminação rigorosa de afirmações não comprovadas (menção a "com nota máxima" no TCC de Boxe, latência não comprovada "< 25ms", alegação indevida sobre "consultas N+1 e bloqueios de concorrência" no projeto Avante, e afirmações absolutas como "erradicação de esquecimentos").
- Expansão mandatória de todas as siglas técnicas na sua **primeira ocorrência visual** em cada página e card (EPIs, IoT, RBAC, HLS, OCR, IFMG, EMBRAPII, API, SUAP, SSID, HTML, ERP, JSF, SQL, JPA, SM-2, YOLOv8, ROIs, FSM, TCC, GPU, CUDA).
- Correção no frontend editorial (`saveList`) e resolução de erro de sintaxe SQL (`42601`) via Dollar-Quoting (`$migration$` e `$snapshot$`).

## 2. Diagnóstico e Ações Realizadas
1. **Mapeamento Exato dos UUIDs aos Títulos Reais**:
   - `c11e35e2-7645-428b-b819-281511b94801` ➔ **SensorEng — Monitoramento Industrial**
   - `e33a57f4-9867-440d-d031-403733d16023` ➔ **Plataforma de Gestão de Crédito e Reconhecimento Óptico de Caracteres (OCR)**
   - `d22f46e3-8756-439c-c920-392622c05912` ➔ **Aplicativo Ponto do Instituto Federal de Minas Gerais (IFMG) — Controle de Ponto Mobile**
   - `7f41a8c9-9ca4-4155-b6ab-8bf4dcf6c9a9` ➔ **Avante Soluções Digitais — Sistema de Gestão Empresarial (ERP, do inglês Enterprise Resource Planning)**
   - `5b468d55-a913-465e-a69a-a052348efd26` ➔ **Russian Mastery — Plataforma Full-Stack de Russo**
   - `3f6fa6a5-f038-4ae5-a186-42a376465892` ➔ **Pipeline de Visão Computacional para Boxe — Trabalho de Conclusão de Curso (TCC) no Instituto Federal de Minas Gerais (IFMG)**

2. **Remoção Crítica da Afirmação sobre N+1 (Projeto Avante)**:
   - Campo: `technical_decisions` (item 3).
   - Texto anterior: *"Gerenciamento de persistência de dados e mapeamento objeto-relacional com Hibernate/JPA, prevenindo sobrecarga de consultas N+1 e bloqueios de concorrência."*
   - Texto corrigido: *"Utilização de Hibernate e Java Persistence API (JPA) para mapeamento objeto-relacional e persistência de dados."* (e espelho em inglês: *"Use of Hibernate and Java Persistence API (JPA) for object-relational mapping and data persistence."*).

3. **Auditoria e Expansão de Siglas na 1ª Ocorrência**:
   - Respeitada a ordem visual de leitura: Título ➔ Descrição ➔ Contexto ➔ Papel ➔ Solução ➔ Decisões Técnicas ➔ Aprendizados ➔ Resultados.
   - Nenhuma sigla é utilizada de forma isolada sem ter sido previamente expandida no fluxo da página ou no card correspondente da página inicial.

4. **Frontend `EditorialProjectDetailComponent`**:
   - Refatoração do método `saveList` para comparar o array anterior e novo, chamando `saveField` para itens mantidos, `add_entity` para novos itens e `remove_entity` para itens deletados.
   - Inclusão de botões `"Revisar e Publicar Alterações ➔"` no cabeçalho e rodapé.

5. **Geração de Snapshot e Scripts SQL**:
   - Geração de snapshot limpo e validado com 249 entidades (`validateEditorialSnapshot` com 0 erros).
   - Criação de [`supabase/atualizar_textos_projetos_v5.sql`](file:///c:/Users/xjoao/Desktop/portfolio/supabase/atualizar_textos_projetos_v5.sql) com Postgres Dollar Quoting (`$snapshot${...}$snapshot$::jsonb;`).

## 3. Arquivos Alterados
- [`src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.ts)
- [`src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.html`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.html)
- [`src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.css`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.css)
- [`spec/03-features/alinhamento-textos-projetos-e-publicacao-editorial/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/alinhamento-textos-projetos-e-publicacao-editorial/spec.md)
- [`spec/04-plano/alinhamento-textos-projetos-e-publicacao-editorial/tarefas.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/04-plano/alinhamento-textos-projetos-e-publicacao-editorial/tarefas.md)
- [`docs/alteracoes/registro-2026-10-20-alinhamento-textos-projetos-e-publicacao-editorial.md`](file:///c:/Users/xjoao/Desktop/portfolio/docs/alteracoes/registro-2026-10-20-alinhamento-textos-projetos-e-publicacao-editorial.md)

## 4. Verificação
- **Testes Unitários:** 193/193 testes passando (`npm test -- --watch=false`).
- **Build de Produção:** `ng build` gerado com sucesso sem erros.
- **Validação de Sintaxe SQL:** Bloco de dollar-quoting verificado e testado com parser JSON.
