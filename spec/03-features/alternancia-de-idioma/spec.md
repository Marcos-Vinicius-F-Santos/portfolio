# Spec da Feature — Alternância de Idioma

> **Reconciliação editorial — 2026-09-26:** PT-BR permanece padrão; idiomas deixam de ser fixos. Abas editoriais não alteram a preferência pública. Idiomas incompletos ficam em preparação; ativação e desativação só se tornam públicas após publicação. A [spec de edição visual](../edicao-visual-rascunho-publicacao/spec.md) prevalece nesses pontos quando implantada. Os requisitos anteriores continuam referência para o comportamento não alterado e a regressão; esta nota não comprova implementação ou testes.

Status: Concluída — conclusão aprovada explicitamente por Marcos em 2026-09-23  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/portfolio/`, com apresentação em `presentation/` e seleção de conteúdo por idioma em `content/`, conforme a arquitetura.  
Criada em: 2026-09-22  
Atualizada em: 2026-09-23

## 1. Objetivo

Permitir alternância entre português brasileiro e inglês durante a navegação. A página começa em português brasileiro, sugere inglês quando o idioma principal do navegador for outro e guarda a escolha do visitante em cache.

## 2. Como funciona hoje

Marcos confirmou que não existe comportamento atual de detecção, alternância ou escolha salva de idioma.

A spec aprovada da estrutura base prevê uma página única com navegação entre “Sobre mim”, “Experiências” e “Stack técnica”. A nova feature se integra a essa experiência, preservando a seção e a posição de rolagem ao alternar o idioma.

## 3. Requisitos funcionais

### FR-001 — Idioma inicial

QUANDO o visitante abrir ou recarregar o portfólio  
O SISTEMA DEVE apresentar a página inicialmente em português brasileiro.

Após iniciar em português brasileiro, o sistema deve restaurar automaticamente o idioma válido salvo em cache, conforme FR-006.

### FR-002 — Sugestão baseada no idioma principal

QUANDO a página iniciar, o idioma principal do navegador for diferente de português e não houver idioma válido salvo em cache nem recusa anterior registrada  
O SISTEMA DEVE oferecer inglês em um pop-up simples com o texto “Idioma sugerido: Inglês” e ações de aceitar e recusar, mantendo português brasileiro até o visitante aceitar.

O sistema deve considerar somente o idioma principal, inclusive quando for espanhol ou outro idioma não suportado. Variantes de português são tratadas como português brasileiro, e variantes de inglês como inglês. Havendo idioma válido salvo em cache, aplica-se a restauração automática do FR-006.

### FR-003 — Resposta à sugestão

QUANDO o visitante aceitar a sugestão de inglês  
O SISTEMA DEVE apresentar o conteúdo em inglês, respeitando o fallback de conteúdo do FR-009.

QUANDO o visitante recusar a sugestão  
O SISTEMA DEVE manter português brasileiro e registrar a recusa para não apresentar novamente a sugestão enquanto o registro local existir.

### FR-004 — Alternância manual

QUANDO o visitante escolher português brasileiro ou inglês pelo controle de idioma disponível no site  
O SISTEMA DEVE apresentar o conteúdo no idioma escolhido, permitindo alternância nos dois sentidos, inclusive após recusar a sugestão.

### FR-005 — Fallback da preferência do navegador

QUANDO não for possível obter uma preferência válida do navegador e não houver idioma válido salvo em cache  
O SISTEMA DEVE manter português brasileiro e disponibilizar a alternância manual.

### FR-006 — Escolha em cache

QUANDO o visitante aceitar ou recusar a sugestão, ou escolher um idioma manualmente  
O SISTEMA DEVE guardar sua escolha em cache local ao navegador para mantê-la entre recarregamentos e visitas. O registro deve conter o idioma escolhido e a recusa da sugestão, preservando a recusa mesmo após alternância manual.

QUANDO o visitante abrir ou recarregar o portfólio e houver idioma válido salvo em cache  
O SISTEMA DEVE, após iniciar em português brasileiro, restaurar automaticamente o idioma salvo, sem exigir nova confirmação e sem apresentar a sugestão de idioma. A restauração respeita o fallback de conteúdo do FR-009. A recusa salva deve impedir novas sugestões, conforme FR-007.

### FR-007 — Não repetir sugestão recusada

QUANDO houver uma recusa anterior registrada  
O SISTEMA DEVE deixar de apresentar a sugestão, inclusive em recarregamentos e visitas futuras, mantendo disponível a opção manual de idioma.

QUANDO o registro local da escolha e da recusa tiver sido apagado e o visitante abrir ou recarregar a página com idioma principal diferente de português  
O SISTEMA DEVE apresentar novamente a sugestão de inglês em um pop-up simples, conforme FR-002.

Se o armazenamento estiver indisponível, manter a escolha e a recusa em memória durante a página, sem quebrar a navegação. Registro inválido é tratado como ausente; a persistência entre visitas depende de armazenamento disponível.

### FR-008 — Preservação da navegação

QUANDO o visitante alternar o idioma  
O SISTEMA DEVE preservar a seção atual e a posição de rolagem.

### FR-009 — Fallback de conteúdo

QUANDO faltar uma tradução ou houver falha ao carregar o conteúdo no idioma escolhido  
O SISTEMA DEVE manter a língua original do conteúdo afetado.

“Língua original” significa a língua de origem do conteúdo afetado. O fallback é aplicado por conteúdo, sem reverter toda a página ao idioma anterior, conforme confirmado na seção 8.

## 4. Regras de negócio

### BR-001 — Idiomas disponíveis

Esta feature contempla português brasileiro e inglês.

### BR-002 — Preferência do navegador

Somente o idioma principal é considerado. Na ausência de idioma válido salvo em cache, qualquer idioma principal diferente de português gera uma sugestão de inglês, respeitando a recusa registrada. Variantes de português, como `pt-PT`, são tratadas como português brasileiro; variantes de inglês, como `en-US` e `en-GB`, são tratadas como inglês. A preferência não provoca mudança automática na primeira visita.

### BR-003 — Português inicial

A página sempre começa em português brasileiro e depois restaura automaticamente o idioma válido salvo em cache. A escolha salva tem precedência sobre a preferência do navegador e dispensa nova sugestão ou confirmação.

### BR-004 — Recusa enquanto o registro local existir

A sugestão recusada não deve reaparecer enquanto o registro local existir. Se esse registro for apagado, a sugestão deve aparecer novamente na próxima abertura elegível, conforme FR-002. O visitante também poderá mudar de ideia usando a opção manual de idioma do site.

### BR-005 — Conteúdo original como fallback

Tradução ausente ou falha no carregamento não deve substituir o conteúdo original por conteúdo indisponível; mantém-se a língua original.

### Limites arquiteturais existentes

A experiência pública continua em uma única página responsiva. A seleção do idioma não deve ser duplicada em cada seção. As traduções permanecem separadas do conteúdo principal, conforme a arquitetura. Esta spec não define schema, migrations ou integração de dados.

## 5. Critério de aceite

### AC-001 — Caminho feliz: português brasileiro

Dado que o idioma principal do navegador é português brasileiro e não existe escolha salva  
Quando o visitante abrir o portfólio  
Então a página deve começar em português brasileiro sem sugerir inglês.

### AC-002 — Caminho feliz: aceitar inglês

Dado que o idioma principal do navegador é inglês e não existe escolha salva  
Quando o visitante abrir o portfólio  
Então a página deve começar em português brasileiro e exibir um pop-up simples com “Idioma sugerido: Inglês” e ações de aceitar e recusar.

Dado que a sugestão está sendo apresentada e as traduções estão disponíveis  
Quando o visitante aceitar  
Então o conteúdo deve mudar para inglês, a escolha deve ser guardada em cache e a seção e a posição de rolagem devem ser preservadas.

### AC-003 — Caminho feliz: recusa e visitas seguintes

Dado que a sugestão está sendo apresentada  
Quando o visitante recusar  
Então a página deve permanecer em português brasileiro e a recusa deve ser guardada em cache.

Dado que a recusa continua registrada em cache  
Quando o visitante recarregar a página ou voltar em outra visita  
Então a sugestão não deve reaparecer e a opção manual de idioma deve continuar disponível.

### AC-004 — Caminho feliz: alternância manual

Dado que o visitante está em uma seção da página em português brasileiro, inclusive após recusar a sugestão, e há tradução disponível  
Quando escolher inglês pelo controle de idioma  
Então o conteúdo deve mudar para inglês, a escolha deve ser guardada em cache e a seção e a posição de rolagem devem ser preservadas.

Dado que o visitante está navegando em inglês  
Quando escolher português brasileiro pelo controle de idioma  
Então o conteúdo deve mudar para português brasileiro, a escolha deve ser guardada em cache e a seção e a posição de rolagem devem ser preservadas.

### AC-005 — Caminho de erro: preferência indisponível

Dado que não é possível obter uma preferência válida do navegador e não existe escolha salva  
Quando o visitante abrir o portfólio  
Então a página deve permanecer em português brasileiro, com a alternância manual disponível.

### AC-006 — Caminho feliz: idioma não suportado

Dado que o idioma principal do navegador é espanhol ou outro idioma não suportado e não existe escolha salva  
Quando o visitante abrir o portfólio  
Então a página deve começar em português brasileiro e oferecer inglês com o texto “Idioma sugerido: Inglês”.

### AC-007 — Caminho feliz: somente o idioma principal

Dado que o idioma principal do navegador é espanhol, português é uma preferência secundária e não existe escolha salva  
Quando o visitante abrir o portfólio  
Então o sistema deve sugerir inglês com base no idioma principal.

Dado que o idioma principal é português brasileiro, inglês é uma preferência secundária e não existe escolha salva  
Quando o visitante abrir o portfólio  
Então o sistema não deve sugerir inglês com base na preferência secundária.

### AC-008 — Caminho de erro: tradução ausente

Dado que um conteúdo não possui tradução para o idioma escolhido  
Quando o visitante selecionar esse idioma  
Então o conteúdo afetado deve permanecer na língua original, preservando a seção e a posição de rolagem.

### AC-009 — Caminho de erro: falha no carregamento

Dado que ocorre uma falha ao carregar o conteúdo no idioma escolhido  
Quando o visitante tentar alternar o idioma  
Então o conteúdo afetado deve permanecer na língua original, preservando a seção e a posição de rolagem.

### AC-010 — Caminho feliz: restauração automática do cache

Dado que inglês está salvo em cache e as traduções estão disponíveis, independentemente do idioma principal do navegador  
Quando o visitante abrir ou recarregar o portfólio  
Então a página deve iniciar em português brasileiro e restaurar automaticamente inglês, sem exibir nova sugestão nem exigir confirmação.

Dado que português brasileiro está salvo em cache e o idioma principal do navegador é inglês  
Quando o visitante abrir ou recarregar o portfólio  
Então a página deve permanecer em português brasileiro, respeitando a escolha salva, sem exibir nova sugestão.

### AC-011 — Caminho feliz: variantes regionais

Dado que o idioma principal do navegador é `pt-PT` ou outra variante de português e não existe escolha salva  
Quando o visitante abrir o portfólio  
Então o sistema deve tratar a preferência como português brasileiro e não sugerir inglês.

Dado que o idioma principal do navegador é `en-US`, `en-GB` ou outra variante de inglês e não existe escolha salva nem recusa registrada  
Quando o visitante abrir o portfólio  
Então o sistema deve tratar a preferência como inglês, iniciar em português brasileiro e exibir “Idioma sugerido: Inglês”.

### AC-012 — Nova sugestão após apagar o cache

Dado que o visitante recusou a sugestão anteriormente, apagou o registro local da escolha e da recusa e o idioma principal do navegador é inglês ou outro idioma diferente de português  
Quando abrir ou recarregar o portfólio  
Então a página deve iniciar em português brasileiro e apresentar novamente o pop-up “Idioma sugerido: Inglês”, com ações de aceitar e recusar.

Dado que o registro local foi apagado e o idioma principal é português ou uma variante de português  
Quando abrir ou recarregar o portfólio  
Então a página deve permanecer em português brasileiro sem sugerir inglês.
## 6. Casos de erro / edge cases

- Preferência ausente, inválida ou falha na leitura: restaurar o idioma válido salvo, se houver; caso contrário, manter português brasileiro. Permitir escolha manual.
- Idioma principal não suportado: sugerir inglês quando não houver idioma válido salvo nem recusa registrada.
- Múltiplas preferências: considerar somente o idioma principal.
- Tradução ausente ou falha no carregamento: manter a língua original do conteúdo afetado.
- Variantes regionais: português corresponde a português brasileiro; inglês corresponde a inglês.
- Cache apagado: reaplicar a regra de primeira visita e sugerir inglês novamente quando o idioma principal for diferente de português.
- Armazenamento bloqueado ou indisponível: manter estado em memória durante a página; em nova visita sem registro, reaplicar a regra inicial. Registro inválido é tratado como ausente.
- Inglês previamente salvo: iniciar em português brasileiro e restaurar inglês automaticamente, sem nova sugestão; respeitar o fallback de conteúdo em caso de erro.
- Traduções com alturas de texto diferentes: preservar seção e posição de rolagem conforme FR-008; validar esse cenário na verificação.

## 7. Fora de escopo desta feature

- Suporte a idiomas adicionais além de português brasileiro e inglês.
- Tradução automática ou geração de traduções por serviços externos.
- Criação da área administrativa ou de ferramentas para edição de traduções.
- Integração com Supabase, alteração de schema e armazenamento de traduções no banco; esses itens pertencem às features correspondentes do produto.
- Implementação de download de currículos e de novas seções do portfólio.
- Criação de páginas públicas separadas por idioma.
- Deploy da aplicação.

## 8. Suposições e perguntas abertas

### Decisões confirmadas em 2026-09-23

- [x] Não existe comportamento atual de idioma a preservar.
- [x] Permitir alternância manual entre português brasileiro e inglês.
- [x] Sempre começar em português brasileiro.
- [x] Considerar somente o idioma principal do navegador.
- [x] Sugerir inglês também para espanhol e outros idiomas não suportados.
- [x] Guardar a escolha em cache entre recarregamentos e visitas.
- [x] Após iniciar em português brasileiro, restaurar automaticamente o idioma salvo em cache.
- [x] Tratar variantes de português como português brasileiro e variantes de inglês como inglês.
- [x] Não repetir a sugestão após recusa enquanto o registro local existir; se for apagado, sugerir novamente conforme o idioma principal.
- [x] Apresentar a sugestão em um pop-up simples, com ações de aceitar e recusar; manter a opção manual de idioma no site.
- [x] Texto da sugestão fornecido por Marcos: “Ïdioma sugerido: Ingles”. A normalização ortográfica usada no documento está explicitada abaixo.
- [x] Manter a língua original quando faltar tradução ou falhar o carregamento.
- [x] Preservar a seção atual e a posição de rolagem ao alternar idioma.

### Suposições confirmadas por Marcos

- [x] Suposição editorial confirmada: normalizar “Ïdioma sugerido: Ingles” para “Idioma sugerido: Inglês”, sem alterar o sentido ou acrescentar texto à sugestão.
- [x] Suposição confirmada: “língua original” significa a língua de origem do conteúdo afetado, e o fallback se aplica a esse conteúdo. Não se reverte toda a página ao idioma anterior.
- [x] Suposição confirmada: o cache é local ao navegador e guarda tanto o idioma escolhido quanto a recusa da sugestão, sem apagar a recusa quando houver alternância manual posterior.
- [x] Suposição confirmada: a alternância abrange os textos visíveis da interface pública e o conteúdo textual disponível das seções existentes, preservando nomes próprios e nomes de tecnologias. O alcance está confirmado; a origem e a revisão do catálogo local proposto no plano serão definidas antes de preenchê-lo.
- [x] Suposição confirmada: a impossibilidade de ler a preferência do navegador usa o fallback solicitado de português brasileiro.

### Perguntas abertas

- [x] T-001: política de memória e registro inválido confirmada pela aprovação do plano.
- [x] T-001: seletor no cabeçalho e pop-up com aceitar/recusar, sem fechamento por X, Escape ou clique externo, conforme plano aprovado.

Marcos confirmou as suposições e aprovou o plano e as tarefas. As propostas da seção 7 do plano foram incorporadas na T-001; não restam decisões comportamentais abertas. O catálogo local conterá traduções apenas dos textos existentes e dos controles.

## 9. Definition of Done desta feature

- [x] Spec revisada e aprovada por Marcos antes da implementação.
- [x] Suposições e perguntas que afetam o comportamento resolvidas e incorporadas à spec.
- [x] Plano, tarefas e verificação definidos a partir da spec aprovada.
- [x] Critérios de aceite da seção 5 satisfeitos, incluindo restauração automática do cache e variantes regionais.
- [x] Casos de erro de prioridade alta tratados.
- [x] Navegação entre seções e layout responsivo existentes continuam funcionando em ambos os idiomas.
- [x] Preservação da seção e da posição de rolagem verificada.
- [x] Persistência da escolha e não repetição após recusa verificadas.
- [x] Testado conforme `spec/05-verificacao/alternancia-de-idioma/plano-de-teste.md`, elaborado a partir do template de verificação.
- [x] Convergência entre spec, plano/tarefas, código e testes verificada, com divergências explicitadas.
- [x] Marcos revisou e aprovou o resultado antes do deploy.






Conclusão registrada mediante confirmação de Marcos: Todas aprovadas e concluidas. Deploy permanece fora do escopo e não foi autorizado nem executado.

