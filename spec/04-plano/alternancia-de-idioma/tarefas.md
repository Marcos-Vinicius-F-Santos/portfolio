# Tarefas — Alternância de Idioma

Plano relacionado: `spec/04-plano/alternancia-de-idioma/plano.md`  
Spec relacionada: `spec/03-features/alternancia-de-idioma/spec.md`  
Status: Concluídas — todas aprovadas por Marcos em 2026-09-23  
Data: 2026-09-23

## Regra das tarefas

Executar uma tarefa por vez, na sequência numérica e sem pular fases, conforme aprovação de Marcos. Todos os checkboxes foram atualizados após a aprovação explícita de Marcos. As verificações previstas estão abaixo; evidências de execução estão no registro ao final. Os caminhos de código são relativos à raiz do portfólio; `content/` e `presentation/` pertencem a `src/app/features/portfolio/`.

## Fase 1 — Base

- [x] T-001 [FR-002, FR-004, FR-005, FR-006, FR-007, FR-009] Consolidar as definições ainda abertas da seção 7 do plano, preservando a aprovação da spec.
  - Arquivos/módulos: seção 8 da spec da feature e seção 7 do plano.
  - Verificação: cache indisponível/inválido e detalhes remanescentes dos controles possuem decisão registrada por Marcos. As suposições da spec, incluindo original por conteúdo, cache local, preservação da recusa, alcance dos textos, fallback de detecção e normalização editorial, já estão confirmadas; não perguntar novamente. Cache apagado e pop-up simples também estão confirmados. Tarefas dependentes não começam com comportamento indefinido.

- [x] T-002 [FR-004, FR-008, FR-009] Inventariar textos e registrar a referência de regressão da página existente.
  - Arquivos/módulos: `presentation/portfolio-page/`; futuro `spec/05-verificacao/alternancia-de-idioma/plano-de-teste.md`.
  - Verificação: inventário inclui cabeçalho, navegação, rótulos e três seções; identifica textos originais e traduções a revisar. Registrar navegação/rolagem em desktop e móvel e resultados iniciais dos testes/build; não criar conteúdo profissional novo.

- [x] T-003 [FR-001, FR-002, FR-006, FR-009] Preparar contratos mínimos de idioma, preferência local e conteúdo separado das traduções.
  - Arquivos/módulos: `content/portfolio-language.ts`, `content/portfolio-content.ts` e `content/portfolio-translations.ts`.
  - Verificação: contratos representam apenas pt-BR/en, idioma original, traduções por chave e registro local; IDs das seções são independentes do texto; compilação sem nova dependência ou estrutura fora da arquitetura.

## Fase 2 — Lógica principal

- [x] T-004 [FR-002, FR-005] Implementar normalização e classificação do idioma principal.
  - Arquivos/módulos: `content/portfolio-language.ts`.
  - Verificação: pt-BR/pt-PT são português; en-US/en-GB são inglês; espanhol permite sugestão de inglês; preferência secundária não interfere; ausência/falha é identificada para fallback. Rastreio: AC-001, AC-005, AC-006, AC-007 e AC-011.

- [x] T-005 [FR-006, FR-007] Implementar armazenamento isolado da escolha e recusa conforme a política definida em T-001.
  - Arquivos/módulos: `content/portfolio-language-storage.ts`.
  - Verificação: leitura após gravação preserva idioma e recusa; alternância posterior não apaga a recusa; nenhum dado de outras chaves é alterado; registro inválido e exceções seguem a decisão documentada. Rastreio: AC-003, AC-010 e AC-012.

- [x] T-006 [FR-001, FR-002, FR-005, FR-006, FR-007] Implementar inicialização e precedência do cache sobre o navegador.
  - Arquivos/módulos: `content/portfolio-language.service.ts`.
  - Verificação: estado inicial pt-BR precede restauração automática; idioma salvo dispensa sugestão; sem escolha salva, português não sugere, outros idiomas sugerem salvo recusa; após apagar o registro, reaplica-se a sugestão somente para idioma principal diferente de português; falha de detecção mantém pt-BR. Rastreio: AC-001, AC-002, AC-003, AC-005, AC-006, AC-007, AC-010, AC-011 e AC-012.

- [x] T-007 [FR-003, FR-004, FR-006, FR-007] Implementar aceitação, recusa e alternância manual no estado único.
  - Arquivos/módulos: `content/portfolio-language.service.ts`.
  - Verificação: aceitar seleciona inglês; recusar mantém português e registra recusa; escolha manual funciona nos dois sentidos após recusa e grava o idioma. Rastreio: AC-002, AC-003 e AC-004.

- [x] T-008 [FR-004, FR-009] Preencher o catálogo aprovado e implementar seleção com fallback de conteúdo.
  - Arquivos/módulos: `content/portfolio-content.ts` e `content/portfolio-translations.ts`.
  - Verificação: cada texto inventariado recebe a tradução revisada ou original conforme regra; ausência de tradução e falha simulada da fonte mantêm conteúdo original. Não adicionar rede/backend para produzir um erro de teste. Rastreio: AC-004, AC-008 e AC-009.

## Fase 3 — Interface

- [x] T-009 [FR-001, FR-004, FR-006, FR-009] Conectar a página aos textos e ao estado de idioma.
  - Arquivos/módulos: `presentation/portfolio-page/portfolio-page.ts` e `.html`.
  - Verificação: primeira abertura, restauração e alternância atualizam os textos; as três seções, seus IDs e destinos continuam os mesmos; fallback não deixa conteúdo vazio. Rastreio: AC-001, AC-004, AC-008, AC-009 e AC-010.

- [x] T-010 [FR-002, FR-003, FR-004, FR-007] Incluir pop-up simples de sugestão e controle manual conforme apresentação aprovada.
  - Arquivos/módulos: `presentation/portfolio-page/portfolio-page.html`, `.ts` e `.scss`.
  - Verificação: pop-up simples exibe “Idioma sugerido: Inglês”; aceitar/recusar e seleção manual funcionam; recusa e cache impedem sugestão indevida; controles permanecem utilizáveis por teclado, em desktop e móvel, sem sobreposição. Rastreio: AC-002, AC-003, AC-004, AC-006 e AC-011.

- [x] T-011 [FR-004, FR-008, FR-009] Preservar seção e posição de rolagem ao atualizar o conteúdo.
  - Arquivos/módulos: `presentation/portfolio-page/portfolio-page.ts` e `.scss`.
  - Verificação: comparar seção e coordenada de rolagem antes/depois nos dois sentidos, em cada seção, no fim da página e com textos de alturas diferentes; repetir com fallback. A navegação normal continua suave e funcional. Se houver impossibilidade de manter ambas, registrar conflito e resolver com Marcos sem reduzir FR-008. Rastreio: AC-002, AC-004, AC-008 e AC-009.

## Fase 4 — Testes

- [x] T-012 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-009] Completar testes automatizados das regras, persistência e fallback.
  - Arquivos/módulos: testes `.spec.ts` junto aos arquivos de `content/`, usando Vitest existente.
  - Verificação: cobrir AC-001 a AC-012 nos comportamentos de lógica aplicáveis, incluindo inglês salvo com navegador português, português salvo com navegador inglês, recusa seguida de alternância, nova sugestão após apagar o cache, falha de leitura e falha de conteúdo. Isolar armazenamento entre testes; demonstrar a ordem pt-BR → restauração, não só o estado final.

- [x] T-013 [FR-003, FR-004, FR-007, FR-008, FR-009] Completar integração da página e regressão da navegação.
  - Arquivos/módulos: `presentation/portfolio-page/portfolio-page.spec.ts`; executar também `src/app/app.spec.ts`.
  - Verificação: clique nos controles altera o conteúdo esperado, os três destinos funcionam em ambos os idiomas e a página tolera destino realmente ausente. Corrigir a montagem do teste atual removendo o elemento alvo antes do clique, sem alterar o comportamento de produção. A simulação de rolagem não substitui T-014.

- [x] T-014 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Executar verificação por prioridade e registrar evidências.
  - Arquivos/módulos: `spec/05-verificacao/alternancia-de-idioma/plano-de-teste.md`, seguindo o template de verificação; aplicação e scripts existentes.
  - Verificação: AC-001 a AC-012 rastreados a resultados; roteiro cobre primeira visita, aceitar/recusar, nova visita, cache preservado e apagado, pop-up, variantes, idioma não suportado, erros, rolagem e regressão. Executar em desktop e móvel e numa segunda combinação navegador/dispositivo. `npm test -- --watch=false --no-progress` e `npm run build` passam; nenhuma regressão ou falha crítica aberta. Registrar bloqueios reais sem marcar testes não executados como aprovados.

## Fase 5 — Entrega

- [x] T-015 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Revisar convergência e preparar o resultado para aprovação de Marcos.
  - Arquivos/módulos: spec, plano, tarefas e `spec/05-verificacao/alternancia-de-idioma/plano-de-teste.md`.
  - Verificação: cada FR possui implementação e evidência; todos os AC foram avaliados; divergências e limitações foram explicitadas; arquivos alheios à feature permanecem preservados. Checklist registra revisão humana pendente até Marcos aprovar.

- [x] T-016 [FR-001, FR-004, FR-006, FR-007, FR-008] Documentar entrega futura e rollback, sem publicar.
  - Arquivos/módulos: futuro `spec/06-deploy/alternancia-de-idioma/deploy.md`, referenciando o procedimento existente da estrutura base.
  - Verificação: documento identifica revisão anterior válida, passos de validação dos dois idiomas/navegação, efeito do cache remanescente após rollback e pendências do fluxo de publicação. Deploy e mudanças remotas não são executados; aprovação da implementação não é registrada como autorização automática de publicação.

## Adiado (fora do escopo desta rodada)

- Integração com banco, autenticação, administração e edição remota de traduções.
- Conteúdo de novas seções, currículos, tradução automática e idiomas adicionais.
- Sincronização da preferência entre dispositivos ou identidade de visitantes.
- Execução de deploy e configuração da integração GitHub–Vercel.

A execução foi autorizada posteriormente por Marcos e está registrada abaixo, sem marcar conclusão automaticamente.



## Registro da T-001

Propostas do plano confirmadas pela aprovação explícita de Marcos: cache local versionado, fallback em memória, registro inválido ausente, catálogo local dos textos existentes, seletor no cabeçalho e pop-up sem fechamento alternativo. A implementação T-001 a T-016 foi autorizada em sequência. A conclusão foi posteriormente aprovada por Marcos.


## Registro de execução — aprovado por Marcos

| Tarefas | Resultado preparado para revisão |
|---|---|
| T-001 | Decisões do plano aprovado incorporadas na spec e no plano |
| T-002 | Inventário e referência anterior: 5 testes e build passaram; página desktop/móvel registrada |
| T-003 | Contratos de idioma, preferência e conteúdo dentro do domínio previsto |
| T-004 | Normalização de idioma principal e variantes |
| T-005 | Cache local versionado, validação e fallback em memória |
| T-006 | pt-BR inicial, restauração e precedência de cache |
| T-007 | Aceitação, recusa e alternância manual persistidas |
| T-008 | Catálogo separado e fallback por conteúdo |
| T-009 | Página consome estado/textos preservando IDs |
| T-010 | Pop-up simples e seletor no cabeçalho; Escape não fecha |
| T-011 | Geometria estável entre idiomas; medições desktop/móvel preservadas |
| T-012 | Testes de regras, persistência e erros |
| T-013 | Integração e regressão; alvo realmente ausente no teste corrigido |
| T-014 | 54 testes passaram, build passou, browser e evidências registradas |
| T-015 | Convergência e limitações documentadas, sem divergência funcional conhecida |
| T-016 | Procedimento de entrega/rollback preparado, sem deploy |

Evidências: `spec/05-verificacao/alternancia-de-idioma/plano-de-teste.md`.
Marcos confirmou: Todas aprovadas e concluidas. T-001 a T-016 marcadas concluídas com base nessa aprovação; ela não autoriza deploy.

