# Checklist de Convergência — Habilidades, formação acadêmica e contato

Status: Revisão concluída — deploy não aprovado  
Data: 2026-09-24  
Base revisada: working tree sem commit específico da feature; testes e build executados nesta revisão

Spec relacionada: `spec/03-features/habilidades-formacao-contato/spec.md`  
Plano relacionado: `spec/04-plano/habilidades-formacao-contato/plano.md`  
Tarefas relacionadas: `spec/04-plano/habilidades-formacao-contato/tarefas.md`

## Resumo da revisão

A comparação foi feita entre a Spec da feature, o plano/tarefas, o código em
`src/app/features/portfolio/`, os recursos estáticos, a migration e os testes Vitest.

A implementação converge funcionalmente para a apresentação das habilidades, formação e
contato, preserva o anchor `#stack-tecnica`, mantém as seções existentes e cobre a
seleção de currículo por locale no contrato do serviço. A suíte atual passou com 7
arquivos e 85 testes; o build de produção também passou.

A convergência completa ainda não pode ser confirmada. A migration de PDF não está
aplicada no projeto remoto, o bucket `curricula` ainda não possui a restrição de MIME e
não há registros remotos de currículo. Portanto, o download real nos dois idiomas e a
T-018 permanecem sem confirmação. A validação visual anterior confirmou o desktop, mas
não houve validação em viewport mobile. Também não há classificação formal de prioridade
alta no plano da feature.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito/critério | Código/evidência | Teste/verificação | Status |
|---|---|---|---|
| FR-001 — seção pública “Habilidades” | `portfolio-page.ts` preserva `targetId: 'stack-tecnica'`; `portfolio-page.html` renderiza o título a partir do catálogo bilíngue | `portfolio-page.spec.ts` verifica o título “Habilidades”; preview desktop exibiu a seção | Confirmado |
| FR-002 — habilidades como nomes legíveis | `portfolio-page.html` renderiza cada tecnologia em um `<li>` individual | `portfolio-content.spec.ts` verifica o catálogo; `portfolio-page.spec.ts` verifica a renderização de uma tecnologia | Confirmado |
| FR-003 — seis categorias e tecnologias aprovadas | `PORTFOLIO_SKILL_CATEGORIES` contém as seis categorias e o catálogo definido na Spec | `portfolio-content.spec.ts` verifica seis categorias e todas as tecnologias aprovadas | Confirmado |
| FR-004 — formação acadêmica | `PORTFOLIO_ACADEMIC_ENTRIES` contém as duas pós-graduações e `Unopar Anhanguera`; template renderiza os dois cards | `portfolio-content.spec.ts` e `portfolio-page.spec.ts` verificam as duas entradas; idioma inglês também foi verificado | Confirmado |
| FR-005 — contato como última seção | `navigationItems()` adiciona `contato` depois de `formacao-academica`; template mantém a ordem do DOM | `portfolio-page.spec.ts` verifica que `#contato` é a última seção | Confirmado |
| FR-006 — símbolos oficiais e labels abaixo | `src/assets/contact/` contém os SVGs; template usa símbolo e label; CSS organiza o conteúdo em coluna | Testes verificam os caminhos dos símbolos e labels; preview desktop confirmou símbolos carregados | Parcialmente confirmado: a implementação não documenta a origem/licença oficial dos SVGs |
| FR-007 — destinos dos canais | `PORTFOLIO_CONTACT_LINKS` define os hrefs exatos para LinkedIn, GitHub, `mailto:` e `tel:` | `portfolio-page.spec.ts` verifica os quatro hrefs; não houve navegação externa end-to-end | Confirmado quanto ao contrato dos links |
| FR-008 — acesso aos currículos PT-BR e inglês | `getCurriculum()` consulta `portfolio_files` por locale e o template renderiza o link quando há registro válido | Testes usam registros simulados; consulta remota retornou zero currículos | Parcialmente confirmado |
| FR-009 — currículo correspondente ao idioma | `loadCurriculum()` recarrega após troca de idioma e usa `download` com o nome do arquivo | `portfolio-page.spec.ts` verifica URLs simuladas PT-BR/en após troca; download real não foi executado | Parcialmente confirmado |
| AC-001 — apresentação das três seções | Seções `stack-tecnica`, `formacao-academica` e `contato` são renderizadas na página única | Teste da página verifica existência e ordem; preview desktop confirmado | Confirmado |
| AC-002 — habilidades organizadas | Catálogo e template renderizam categorias e listas individuais | Testes de catálogo e página aprovados | Confirmado |
| AC-003 — canais acionáveis e identificáveis | Cada canal é um `<a>` com símbolo e label visível | Hrefs e label foram verificados no DOM; acionamento externo não foi executado | Confirmado quanto ao contrato; navegação externa pendente |
| AC-004 — currículo por idioma | Serviço filtra locale; página alterna o link conforme idioma | Teste com mocks aprovado; não há arquivos/URLs reais no Storage | Não confirmado end-to-end |
| AC-005 — destino/arquivo indisponível sem falso sucesso | Currículo ausente é omitido e a página continua utilizável; destino de contato é catálogo estático | Teste cobre currículo ausente e alvo de navegação ausente; não há teste/validação para href de contato inválido | Parcialmente confirmado; divergência de implementação para destino de contato inválido |

## Requisitos

- [ ] Todo comportamento implementado corresponde integralmente à Spec.
  - A maior parte converge com a Spec, mas AC-005 exige tratamento para destino de
    contato ausente ou inválido e o código não valida nem omite links de contato; os
    destinos são sempre renderizados a partir de constantes.
  - A origem oficial/licenciamento dos SVGs não está registrada, embora os símbolos
    existam localmente e tenham carregado no preview.
- [ ] O critério de aceite reflete integralmente o comportamento verificado.
  - AC-001 a AC-003 estão cobertos no DOM e no preview desktop.
  - AC-004 depende dos dois registros reais e não foi confirmado.
  - AC-005 está coberto para currículo ausente, mas não para destino de contato inválido.
- [ ] O estado documental está sincronizado com a aprovação informada.
  - A Spec e o plano ainda estão com `Status: Rascunho` e as tarefas T-001 a T-020
    permanecem sem marcação. Este checklist não altera esses estados automaticamente.

## Arquitetura

- [x] A estrutura de pastas/módulos respeita `spec/02-arquitetura/ARQUITETURA.md`.
  - O código permanece em `src/app/features/portfolio/content/` e
    `src/app/features/portfolio/presentation/portfolio-page/`.
  - Os símbolos estão em `src/assets/`, conforme o plano.
- [x] Nenhum limite arquitetural novo foi cruzado.
  - Não foram criadas nova rota, nova tabela, serviço global ou feature de domínio.
  - A leitura continua passando por `PortfolioContentService`; a página não acessa o
    Supabase diretamente.
- [x] O anchor existente `#stack-tecnica` foi preservado.
- [x] A decisão sobre o contrato de PDF está registrada em
      `spec/02-arquitetura/DECISAO-003-contrato-curriculos-pdf.md`.

## Dados e migration

- [ ] Migration aplicada no projeto remoto.
  - A lista remota de migrations contém até `20260924205845`, mas não contém
    `20260924220000_restrict_curriculum_files_to_pdf`.
- [ ] Bucket `curricula` restringido a PDF.
  - Consulta remota mostrou `allowed_mime_types = null` e `file_size_limit = null`.
- [x] Migration possui caminho textual de rollback.
  - O arquivo remove a constraint criada e restaura `allowed_mime_types` para `null`.
- [ ] Migration aplicada e revertida em ambiente real.
  - Não pôde ser confirmado nesta revisão; a migration ainda não foi aplicada.
- [ ] Exatamente um currículo PDF por locale disponível no Storage e em
      `public.portfolio_files`.
  - A consulta remota retornou zero registros de `file_type = 'curriculum'`.
- [x] Os dois PDFs fornecidos localmente foram validados como PDFs de duas páginas e não
      estão versionados no Git.
- [ ] Download público real PT-BR e inglês confirmado.
  - Não há arquivos remotos para executar esta verificação.

## Testes

- [ ] Requisitos de prioridade alta estão formalmente identificados no plano.
  - O plano descreve caminho principal, erro e regressão, mas não atribui prioridade alta
    a FRs/ACs nem possui plano de teste específico desta feature.
- [x] Caminho principal automatizado.
  - A página cobre habilidades, formação, contato, ordem, links e troca de currículo com
    fixtures/mocks.
- [x] Caminho de erro parcialmente automatizado.
  - Há cobertura para currículo ausente, MIME inválido e alvo de navegação inexistente.
- [ ] Caminho de erro completo da Spec automatizado.
  - Falta o cenário de destino de contato ausente ou inválido.
- [x] Regressão automatizada sem indício de falha.
  - A suíte passou: 7 arquivos e 85 testes aprovados.
  - Os testes existentes de navegação, alternância de idioma, experiências, resultados e
    projetos continuam passando.
- [x] Build de produção executado com sucesso via `npm run build`.
  - O build reporta warning de orçamento: `portfolio-page.scss` totaliza 7.46 kB contra
    o limite de 4.00 kB. O build não falhou.
- [x] `git diff --check` executado.
  - Não foram encontrados erros de whitespace; os avisos são apenas sobre conversão futura
    de LF para CRLF.
- [ ] Lint ou checagem equivalente dedicada.
  - Não há script `lint` configurado no `package.json`.
- [ ] Verificação visual responsiva completa.
  - O preview desktop e o carregamento dos cinco SVGs foram confirmados anteriormente.
    Mobile estreito e mobile largo não foram validados em viewport dedicada nesta revisão.
- [ ] Verificação visual com os dois currículos reais.
  - Não pôde ser feita porque os arquivos ainda não estão no Storage.

## Entrega

- [ ] T-017 totalmente confirmada.
  - Testes, build e preview desktop passaram, mas migration, mobile, download real e
    evidências completas com os dois PDFs permanecem pendentes.
- [ ] T-018 confirmada.
  - Os dois PDFs existem localmente, mas não foram enviados ao bucket nem registrados no
    banco por falta de autenticação/execução do upload.
- [x] Existe um caminho de rollback documentado para a migration.
- [ ] Rollback operacional da entrega confirmado.
  - A migration não foi aplicada/revertida e a feature está no working tree sem commit
    próprio.
- [x] Nenhum deploy foi executado nesta revisão.
- [ ] Aprovação final de Marcos registrada.
  - Permanece pendente por decisão explícita do aprovador.
- [x] As tarefas originais não foram marcadas automaticamente.

## Divergências encontradas

1. **Currículos ainda não estão disponíveis no ambiente remoto.** A Spec exige dois
   currículos por idioma e T-018 exige registros e arquivos acessíveis. O banco remoto
   não possui registros de currículo, e o bucket ainda não foi populado.
2. **Migration de PDF não aplicada.** A migration existe no repositório e possui rollback,
   mas não está na lista de migrations remotas e a configuração do bucket permanece sem
   allowlist de MIME.
3. **AC-005 não é atendido integralmente para contatos inválidos.** O código trata a
   ausência de currículo, mas não valida links de contato ausentes ou inválidos antes de
   renderizar os anchors.
4. **“Símbolos oficiais públicos” sem origem documentada.** Os SVGs locais carregam e
   representam os canais, mas não há fonte, licença ou referência oficial registrada para
   comprovar a exigência de oficialidade.
5. **Prioridade alta não está formalizada.** O plano não classifica FRs/ACs como alta
   prioridade; por isso a execução do caminho principal não pode ser declarada como
   confirmação formal do item de prioridade alta.
6. **Verificação visual incompleta.** Desktop foi verificado; mobile estreito e mobile
   largo não foram confirmados em viewport dedicada.
7. **Warning de orçamento do SCSS.** O build passa, mas `portfolio-page.scss` excede o
   budget de 4 kB em 3.46 kB. Isso não bloqueou a compilação, mas deve ser considerado
   antes do deploy.
8. **Status documental não sincronizado.** A Spec e o plano continuam como `Rascunho` e
   as tarefas continuam desmarcadas, apesar da aprovação informada anteriormente.

## Decisão do portão

- [ ] Convergência funcional total de FR-001 a FR-009 e AC-001 a AC-005 confirmada.
  - Parcial: FR-001 a FR-005 e o contrato de FR-007 convergem; FR-006 tem ressalva de
    proveniência; FR-008/FR-009 dependem dos arquivos reais; AC-005 tem lacuna para
    destinos inválidos.
- [x] Regressão automatizada sem indício de quebra nas features existentes.
- [ ] Requisitos de prioridade alta formalmente confirmados.
- [ ] Migration aplicada, revertida e contrato de PDF confirmado no projeto remoto.
- [ ] Dois currículos publicados e downloads PT-BR/en confirmados.
- [ ] Verificação visual desktop/mobile completa confirmada.
- [ ] Rollback operacional confirmado.
- [ ] Deploy aprovado — permanece pendente da decisão de Marcos.
