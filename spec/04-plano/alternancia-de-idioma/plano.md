# Plano de Implementação — Alternância de Idioma

Spec relacionada: `spec/03-features/alternancia-de-idioma/spec.md`  
Arquitetura: `spec/02-arquitetura/ARQUITETURA.md`  
Status: Concluído — conclusão aprovada por Marcos em 2026-09-23  
Data: 2026-09-23

Os documentos deste projeto estão em `spec/`, no singular. Este plano usa os templates de `E:/Projects/SPECS/specs/04-plano/FEATURE_TEMPLATE/`. A spec, este plano e as tarefas foram aprovados por Marcos, que autorizou executar T-001 a T-016. Marcos aprovou a conclusão de todas as tarefas. Qualquer deploy exige autorização separada.

## 1. Resumo técnico

Reutilizar a página Angular existente e concentrar estado, normalização de idioma, seleção de textos e persistência no domínio `src/app/features/portfolio/content/`. Essa pasta já está prevista na arquitetura e passa a ter conteúdo nesta feature. A apresentação continua em `presentation/portfolio-page/`; não criar nova camada global, rotas por idioma ou dependências de tradução.

Solução implementada e aprovada: manter conteúdo original e traduções locais separados, relacionados por chaves estáveis, limitados aos textos existentes aprovados. A futura integração de conteúdo fica fora desta rodada. Usar um serviço de idioma com estado reativo e funções puras para as regras; encapsular o acesso ao armazenamento local para permitir validação e simulação de falhas nos testes. Não atualizar Angular nem substituir o runner Vitest existente.

Fluxo de inicialização: começar em pt-BR; ler a preferência salva; se válida, restaurá-la automaticamente sem sugestão; caso contrário, consultar somente o idioma principal do navegador. Normalizar variantes `pt-*` para pt-BR e `en-*` para inglês. Sugerir inglês em um pop-up simples para outros idiomas principais, salvo recusa registrada. Se o registro local for apagado, reaplicar a regra de primeira visita e sugerir novamente quando elegível. Aceitação, recusa e seleção manual atualizam o estado e o cache. Falha de detecção sem escolha salva mantém pt-BR.

A seleção de conteúdo deve manter o original quando faltar tradução ou falhar sua obtenção. A apresentação deve atualizar os textos sem recriar as seções, preservando IDs, seção atual e posição de rolagem. A restauração do cache não deve disparar transitoriamente a sugestão antes de concluir sua leitura.

As propostas sobre armazenamento, fonte dos textos e apresentação foram confirmadas na seção 7; não acrescentam funcionalidades à spec.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` | Consumir estado e textos do domínio de conteúdo; conectar eventos de idioma e preservar navegação | Médio: inicialização fora de ordem ou recriação do componente pode perder estado |
| `portfolio-page.html`, na mesma pasta | Substituir textos fixos por conteúdo selecionado; incluir sugestão e opção manual | Alto: traduções podem alterar altura e deslocar seções; IDs não podem ser traduzidos |
| `portfolio-page.scss`, na mesma pasta | Acomodar os controles e textos em ambos os idiomas | Médio: regressão responsiva ou interferência na identidade visual |
| `portfolio-page.spec.ts`, na mesma pasta | Acrescentar integração de idioma e preservar testes de navegação | Médio: o teste atual de alvo ausente altera apenas o href, mas o handler continua usando o targetId original; não comprova ausência real do destino |
| `src/app/app.spec.ts` | Executar como regressão; ajustar apenas expectativas afetadas legitimamente | Baixo: evitar que o cache de um teste contamine outro |
| Armazenamento local do navegador | Introduzir registro exclusivo da preferência e recusa | Médio: falha, limpeza ou formato inválido afetam persistência |

Manter os alvos `sobre-mim`, `experiencias` e `stack-tecnica`, os vínculos de navegação e a página única. Não alterar configurações globais, banco, autenticação ou integrações externas para esta feature.

## 3. Componentes novos

Arquivos propostos dentro de `src/app/features/portfolio/content/`, sem subpastas adicionais:

- `portfolio-language.ts`: tipos e normalização do idioma principal; regras puras de decisão.
- `portfolio-language.service.ts`: estado único, inicialização, aceitação, recusa e escolha manual.
- `portfolio-language-storage.ts`: leitura, validação e escrita do registro local, isoladas do componente.
- `portfolio-content.ts` e `portfolio-translations.ts`: conteúdo original e traduções por chave; seleção e fallback podem permanecer junto desses arquivos, sem criar uma camada de repositório prematura.
- Testes `.spec.ts` junto às regras, serviço e seleção de conteúdo, conforme os comportamentos verificados.

Os controles visuais começam no componente de página existente. Extrair um componente só se a complexidade real justificar; não é necessário criar outra estrutura para este plano.

## 4. Mudança de dados/banco (se houver)

Não há mudança de schema, banco ou migration. Há apenas uma nova preferência local do navegador.

Proposta: uma chave exclusiva e versionada, como `portfolio.language.v1`, com idioma (`pt-BR` ou `en`) e indicador de recusa. Validar o registro antes de consumi-lo e preservar a recusa ao alternar manualmente. Nunca limpar todo o armazenamento do navegador. O tratamento de registro inválido e armazenamento indisponível depende da política da seção 7.

Rollback de código: voltar à revisão anterior validada da aplicação. O registro local pode permanecer inerte na versão anterior, que não o consome; documentar esse fato e verificar compatibilidade antes de republicar a feature. Não apagar preferências dos visitantes como parte automática de rollback. Uma futura mudança do formato deverá definir compatibilidade ou migração local.

## 5. Sequência de implementação

Executar uma tarefa por vez, na ordem de `tarefas.md`. A execução T-001 a T-016 foi autorizada; não executar deploy nem marcar tarefas concluídas sem aprovação de Marcos.

### Fase 1 — Base

T-001 a T-003: registrar as decisões remanescentes, inventariar textos e comportamento existente, preparar os contratos mínimos no domínio já previsto. O inventário deve preservar os textos e a navegação atuais, sem criar conteúdo profissional novo.

### Fase 2 — Lógica principal

T-004 a T-008: normalizar idioma principal; persistir idioma/recusa; implementar ordem de inicialização; implementar ações de escolha; selecionar traduções com fallback. Não conectar a um backend para simular uma falha de carregamento: usar uma fonte substituível em teste.

### Fase 3 — Interface

T-009 a T-011: conectar os textos, o pop-up simples de sugestão e o controle manual, manter identidade visual e responsividade, preservar seção e rolagem após a atualização do conteúdo. Verificar também restauração automática e fallback.

### Fase 4 — Testes

T-012 a T-014: completar testes de regras e integração, executar roteiro real de navegador e regressão e registrar evidências em `spec/05-verificacao/alternancia-de-idioma/plano-de-teste.md`, a criar durante a execução.

| Prioridade | Cobertura | Verificação planejada |
|---|---|---|
| Alta | FR-001 a FR-004, FR-006 a FR-008; AC-001 a AC-004, AC-006, AC-007, AC-010, AC-011 e AC-012 | Testes automatizados de decisão/estado e roteiro manual de primeira visita, cache, recusa e alternância; desktop e móvel |
| Média | FR-005 e FR-009; AC-005, AC-008 e AC-009 | Falhas simuladas de detecção e conteúdo, com teste automatizado do resultado e inspeção manual |
| Alta | Regressão de navegação e layout, inclusive destino ausente | Testes existentes e roteiro em navegador real; não aceitar somente simulação de scroll no jsdom |
| Média | Cache inválido ou indisponível | Registro inválido como ausente; memória durante falha de armazenamento; testes e navegador |

Executar `npm test -- --watch=false --no-progress` e `npm run build` na raiz do projeto. Não há script de lint declarado; não inventar uma etapa de lint ou ferramenta nova. Usar pelo menos desktop e dispositivo/viewport móvel, com uma segunda combinação de navegador/dispositivo no roteiro manual.

### Fase 5 — Entrega (deploy/rollback)

T-015 e T-016: comparar spec, plano, tarefas, código e testes; registrar divergências e preparar procedimento de publicação/rollback para revisão. Identificar a revisão anterior válida e anexar evidências. Não executar deploy: está fora do escopo da spec e exige aprovação separada de Marcos.

O documento de deploy da estrutura base registra uma publicação direta e pendência de integração GitHub–Vercel. Conferir a situação quando houver uma tarefa de publicação; não tratar esse registro histórico como autorização para repetir o procedimento.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Merece Registro de Decisão? |
|---|---|---|---|---|
| Armazenamento bloqueado impede persistência entre visitas; cache apagado exige nova sugestão por decisão confirmada | Média | Alto | Testar AC-012 e definir apenas a política de armazenamento indisponível na seção 7; a garantia de recusa vale enquanto o registro existir; não introduzir identidade ou backend | Não para política local reversível. Sim se a solução exigir identidade, persistência remota ou mudança de limites arquiteturais |
| Textos com alturas diferentes impedem preservar simultaneamente seção e coordenada exata em alguns layouts, sobretudo no fim da página | Alta | Alto | Medir antes/depois em navegador; evitar recriar seções; ajustar layout dentro do existente. Se não for possível satisfazer FR-008, levar conflito a Marcos, sem relaxar o requisito | Não para ajuste local. Sim se exigir alteração do contrato público de navegação |
| Inicialização em pt-BR seguida de inglês provoca mudança visual ou sugestão transitória indevida | Média | Médio | Separar estado inicial da decisão de sugestão, concluir leitura do cache antes de sugerir e não introduzir atraso artificial | Não; requisito aprovado e implementação reversível |
| Acoplar traduções aos templates ou criar conteúdo além da spec | Média | Alto | Catálogo separado, inventário dos textos existentes e traduções revisadas; integração futura fora de escopo | Não; segue a arquitetura existente |
| Fallback interpretado como idioma anterior da página em vez de original do conteúdo | Média | Alto | Aplicar interpretação confirmada de original por conteúdo; cobrir ausência e erro sem reverter toda a página | Não; regra da feature confirmada |
| Traduzir IDs ou recriar seções quebra âncoras e rolagem | Média | Alto | IDs estáveis e testes de todos os destinos nos dois idiomas | Sim se for proposta mudança das âncoras públicas; este plano as preserva |
| Teste atual de alvo ausente gera falsa confiança | Alta | Médio | Remover realmente o elemento alvo em teste e acionar o link original | Não; correção da verificação, sem mudar comportamento |
| Rollback/publicação se apoiar em procedimento histórico divergente | Média | Alto | Documentar revisão válida e conferir fluxo antes de eventual publicação autorizada | Sim se for proposta nova exceção ao fluxo arquitetural; não é necessária nesta rodada |

Nenhum Registro de Decisão é exigido pela solução proposta. Se uma das alternativas condicionais acima for necessária, usar `E:/Projects/SPECS/specs/02-arquitetura/DECISAO_TEMPLATE.md` e registrar em `spec/02-arquitetura/` antes de executá-la.

## 7. Decisões consolidadas na T-001

Marcos confirmou as suposições e aprovou o plano e as tarefas, autorizando sua execução. As propostas ficam registradas como decisões, sem nova solicitação de confirmação:

| Ponto | Decisão |
|---|---|
| Cache apagado | Reaplicar regra inicial e sugerir inglês quando o idioma principal for diferente de português |
| Cache inválido ou indisponível | Registro inválido é ausente; falha de armazenamento mantém estado em memória durante a página, sem garantia entre visitas |
| Conteúdo original | Fallback por conteúdo, sem reverter toda a página |
| Traduções | Catálogo local separado dos textos originais; somente textos existentes e controles; preservar nomes próprios e tecnologias |
| Sugestão | Pop-up simples com “Idioma sugerido: Inglês” e aceitar/recusar |
| Controles | Seletor no cabeçalho; pop-up sem fechamento por X, Escape ou clique externo |
| Cache | Chave exclusiva portfolio.language.v1 com idioma e recusa; alternância manual não apaga a recusa |

## Registro de execução para revisão

T-001 a T-016 executadas no escopo técnico e documental. Evidências e limitações em `spec/05-verificacao/alternancia-de-idioma/plano-de-teste.md`; procedimento futuro em `spec/06-deploy/alternancia-de-idioma/deploy.md`. T-001 a T-016 marcadas concluídas mediante aprovação explícita de Marcos.

Sem desvio arquitetural ou funcional identificado. A preservação de rolagem usa reserva de espaço para ambas as traduções no layout existente. O teste real de Escape motivou `closedby="none"` no diálogo. Ambos são detalhes de implementação dos requisitos aprovados.

