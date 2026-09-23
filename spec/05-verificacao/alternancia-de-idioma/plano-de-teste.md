# Plano de Verificação — Alternância de Idioma

Status: Verificação concluída e entrega aprovada por Marcos em 2026-09-23.
Spec: `spec/03-features/alternancia-de-idioma/spec.md`.

## Referência anterior (T-002)

Revisão: cf6c2bf88acb361f735126fe6da9a88645ccaa62.
Testes existentes: 5 passaram; build de produção passou.
Chrome de teste: página carrega, três seções e navegação presentes, sem erros de runtime.
Inventário: Portfólio profissional; Marcos Santos (não traduzir); apresentação de engenharia;
Navegação principal; Sobre mim; Experiências; Stack técnica; três parágrafos estruturais.
IDs preservados: sobre-mim, experiencias, stack-tecnica; índices 01/02/03 preservados.
Controles novos: Idioma/Language, Português (Brasil)/English, sugestão, Aceitar/Recusar.
Catálogo local escrito a partir desses textos; não há conteúdo profissional novo.

## Estratégia

Alta: primeira visita, decisão, cache, recusa, alternância, rolagem e regressão.
Média: preferência indisponível, tradução ausente, erro de fonte e armazenamento bloqueado.
Automatizar regras e integração; conferir navegação/layout em navegador real desktop e móvel.

## Rastreio e resultados — T-014

Execução em 2026-09-23. Resultado técnico posteriormente aprovado por Marcos, que confirmou a conclusão de todas as tarefas.

| Requisito | Critérios | Evidência | Prioridade | Resultado |
|---|---|---|---|---|
| FR-001 | AC-001, AC-002, AC-010 | Teste do estado inicial pt-BR antes de initialize; navegador inicia em português sem cache | Alta | Passou |
| FR-002 | AC-001, AC-002, AC-006, AC-007, AC-011 | Classificação unitária; navegador pt-PT sem sugestão, es/en-GB com pop-up; lista secundária pt-BR não sobrepõe es | Alta | Passou |
| FR-003 | AC-002, AC-003 | Clique aceitar/recusar no navegador e testes de estado/armazenamento | Alta | Passou |
| FR-004 | AC-004 | Seletor nos dois sentidos, após recusa; textos e nós das seções preservados | Alta | Passou |
| FR-005 | AC-005 | Simulação de getter de navigator.language lançando erro; página pt-BR sem pop-up | Média | Passou |
| FR-006 | AC-003, AC-010 | Inglês restaurado após reload sem sugestão; registro mantém declined=true após troca manual | Alta | Passou |
| FR-007 | AC-003, AC-012 | Recusa impede pop-up após reload; remoção da chave permite nova sugestão e aceitação | Alta | Passou |
| FR-008 | AC-002, AC-004, AC-008, AC-009 | scroll-desktop.json, scroll-mobile.json, scroll-device.json; fallback simulado sem deslocamento | Alta | Passou |
| FR-009 | AC-008, AC-009 | Testes de campo ausente, fonte com erro e campo com erro; simulação no navegador mantém original por conteúdo | Média | Passou |

### Testes automatizados e build

- `npm test -- --watch=false --no-progress`: 6 arquivos, 54 testes passaram na execução final.
- `npm run build`: passou, bundle inicial 140,68 kB; nenhuma nova dependência da aplicação.
- `git diff --check`: sem erro de whitespace; avisos de conversão LF/CRLF são do ambiente Windows.
- Teste de alvo ausente corrigido: remove o elemento de destino de verdade antes do clique.

### Navegador e layout

Chrome for Testing 154.0.8037.57, servidor local `http://127.0.0.1:4200/`.
Combinações: desktop 1440×900, móvel 390×844 e 320×568, além de perfil iPhone 15 emulado (393 px).
Emulação usa Chrome, não Safari nem dispositivo físico; não se afirma cobertura desses ambientes.

- Todos os três links navegam para as coordenadas possíveis da página nos dois idiomas.
- Oito trocas por perfil de medição (três seções e fim de página, nos dois sentidos): scrollY, altura da página e posições das seções iguais antes/depois.
- Nenhum overflow horizontal nos tamanhos medidos.
- Pop-up móvel inspecionado visualmente; desktop inglês inspecionado visualmente.
- Escape inicialmente fechava o diálogo no navegador apesar do handler simulado passar. Corrigido com `closedby="none"`; reteste manteve o pop-up aberto.
- Armazenamento bloqueado: recusa e escolha manual funcionam na página sem erro.
- Fallback: tradução parcial manteve título About me e parágrafo original; erro da fonte manteve Sobre mim. Rolagem permaneceu igual nos dois cenários.
- Sem erros de runtime reportados pela ferramenta ao final dos cenários.

### Evidências e reprodução

Capturas: `popup-mobile.png`, `english-mobile.png`, `english-desktop.png`.
Medições: `scroll-desktop.json`, `scroll-mobile.json`, `scroll-device.json`.

`browser-init.js` é injetado somente numa sessão de teste via `agent-browser --init-script`; aceita parâmetros `primary`, `reset=1` e `blocked=1`. Não é importado nem publicado pela aplicação. Permite repetir pt-PT, es, en-GB, falha de detecção (`primary=unavailable`) e bloqueio de armazenamento.

`browser-scroll.js` deve ser passado a `agent-browser eval --stdin` após fechar a sugestão e configurar viewport. Compara medidas antes/depois sem intervir na lógica da aplicação.

`browser-fallback.js` usa a API de depuração Angular apenas no servidor de desenvolvimento para substituir a fonte por uma tradução parcial e uma fonte que falha. Recarregar a página ao terminar. Nenhum mecanismo de falha foi inserido no código de produção.

## Convergência — T-015

A implementação está em `src/app/features/portfolio/content/` e `presentation/portfolio-page/`, como previsto. Sem nova camada global, biblioteca de tradução, alteração de dependências, schema ou integração externa.

Refinamento técnico da T-011: duas cópias invisíveis e ignoradas por leitores de tela reservam a maior área necessária aos textos português/inglês; somente a cópia selecionada fica visível. Isso evita que a troca mude alturas e force ajuste de rolagem, inclusive no fallback. Preservam-se os mesmos elementos e IDs de seção. É um detalhe de implementação compatível com o plano, não alteração de requisito.

A ferramenta de navegador precisou instalar Chrome em seu cache porque Chrome não existia e o Edge do sistema não iniciou. Não houve mudança nas dependências ou lockfile do projeto.

Não há divergência funcional conhecida nos critérios verificados. Marcos aprovou a entrega e a conclusão das tarefas; os checkboxes T-001 a T-016 foram atualizados com essa autorização.

## Critério de saída para revisão humana

Resultados técnicos: requisitos de prioridade alta verificados, sem regressão ou defeito crítico identificado nos cenários executados. Revisão e aprovação da conclusão confirmadas por Marcos. Teste em Safari ou aparelho físico não foi executado e não é apresentado como evidência. Deploy não foi executado.

