# Spec da Feature — Edição visual do portfólio com rascunho e publicação

Status: Rascunho
Decisões técnicas: oito recomendações aprovadas por Marcos em 2026-09-26; formalizadas na seção 8.
Projeto: Portfólio Profissional — Marcos Santos
Onde vive no código: domínio administrativo em `src/app/features/admin/`; apresentação e contratos de conteúdo em `src/app/features/portfolio/`; autenticação em `src/app/core/auth/`; persistência e políticas em `supabase/migrations/`, conforme `spec/02-arquitetura/ARQUITETURA.md`.
Criada em: 2026-09-26
Template: `E:/Projects/SPECS/specs/03-features/FEATURE_TEMPLATE/spec.md`

Esta spec documenta a feature inteira para revisão de Marcos. Não autoriza implementação, migrations ou deploy. Os comportamentos explicitamente pedidos estão separados das propostas ainda não aprovadas na seção 8. Requisitos relacionados a essas propostas são normativos somente após sua aprovação.

## 1. Objetivo

Permitir que Marcos edite o portfólio no próprio contexto visual, incluindo textos, traduções, mídias e ordem dos blocos, sem depender de uma página com formulários separados. Salvar automaticamente as alterações em um rascunho privado e tornar o conjunto público somente ao acionar **Publicar alterações**.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

### Base analisada

Foram lidos os princípios, a Spec do Produto, a arquitetura, os registros DECISAO-005 e DECISAO-007, as specs de projetos e de conteúdo administrável e os serviços atuais de conteúdo, mídias e apresentação. Esta análise é de documentos e código local; não constitui auditoria do banco de produção nem validação de todas as funcionalidades existentes.

- A aplicação Angular usa Supabase Auth, PostgreSQL e Storage. Somente Marcos é administrador.
- `/admin` apresenta autenticação ou a área administrativa com formulários de conteúdo e mídias.
- Os métodos `saveCopy`, `saveExperience`, `saveProject` e os demais salvamentos escrevem nas tabelas lidas pelo site público. Não há uma versão editorial privada, mesmo que os modelos usem o nome “Draft”.
- Entidades e traduções são gravadas em chamadas separadas. Restaurar um formulário após erro não desfaz gravações já concluídas no banco; essa limitação está registrada na DECISAO-007.
- PT-BR e inglês são fixos nos contratos, seletores e validações. Adicionar um idioma exige mais que criar uma aba.
- A ordem das seções é montada no código. Experiências priorizam data inicial decrescente e depois `display_order`; portanto arrastar exige mudar a precedência dessa regra.
- A home exibe resumos de projetos e existe uma página completa em `/projetos/:id`, com detalhes e imagens. As duas superfícies devem continuar existindo.
- Imagens, ícones e currículos são armazenados separadamente dos metadados. A substituição atual pode remover o arquivo anterior depois de associar o novo, o que não atende a histórico de versões.
- Não foram identificados métodos de exclusão geral de conteúdo no serviço administrativo inspecionado. Remover itens no editor é uma capacidade proposta, não uma capacidade atual presumida.

### Divergências e mudanças intencionais

| Referência | Regra atual documentada | Mudança desta feature |
| --- | --- | --- |
| Produto, itens 3.11, 6, 7 e 9 | Salvamento com publicação imediata | Salvamento privado e publicação explícita do conjunto |
| Arquitetura, fluxos e seção 3.4 | Sem rascunho ou fluxo editorial | Rascunho persistente, versões publicadas e promoção controlada |
| Produto e experiências | Ordem cronológica | Ordem manual das experiências, preservando as datas |
| Produto e contratos de idioma | Português e inglês | Catálogo extensível de idiomas, com ativação pública controlada |
| Produto/arquitetura | Uma única página pública | Preservar a home e as páginas completas de projetos já implementadas |
| DECISAO-005 | Remover mídia anterior após substituição | Preservar arquivos referenciados por versões ainda retidas |
| DECISAO-007 | Salvamentos textuais em múltiplas chamadas | Publicação consistente com controle transacional de versão |

Esses documentos deverão ser reconciliados na etapa de aprovação/planejamento, sem apagar o histórico das decisões. A implementação atual de página completa é uma divergência anterior que esta spec reconhece; não é autorização para criar páginas públicas arbitrárias.

### Ponderações de viabilidade e arquitetura

1. **Edição no local: viável com reaproveitamento.** Reutilizar a apresentação e os contratos de conteúdo, com controles administrativos opcionais; evitar uma segunda página visual que se desalinhe da pública.
2. **Editor de conteúdo, não construtor livre de sites.** Recomenda-se edição de campos sem HTML arbitrário e ordenação dentro de contêineres conhecidos. Arrastar não muda coordenadas, CSS, largura ou hierarquia de negócio.
3. **Rascunho remoto privado.** Persistir no Supabase permite retomar em outro dispositivo. Estado local não confirmado não deve ser apresentado como salvo; funcionamento offline completo não é necessário.
4. **Publicação é a parte mais crítica.** Recomenda-se preparar uma revisão completa e alterar a referência da versão publicada em uma transação no PostgreSQL. Cada leitura pública deve usar uma única revisão; várias consultas “à última versão” podem misturar dados mesmo com promoção atômica.
5. **Storage não participa da transação SQL.** Preparar e validar arquivos antes da promoção; nunca sobrescrever o arquivo publicado para editar o rascunho. Somente referências prontas entram na versão publicada.
6. **Privacidade inclui os binários.** Ocultar referências no frontend não protege arquivos em bucket público. Arquivos novos de rascunho precisam de acesso privado; a estratégia de entrega pública e de promoção deve impedir exposição antecipada por URL.
7. **Um administrador ainda pode ter duas abas.** Controle de revisão deve detectar salvamento obsoleto; “última resposta vence” pode perder alterações.
8. **Migração deve importar o que realmente aparece hoje.** Conteúdos locais usados como fallback, entidades persistidas, traduções, URLs, mídias e ordenação devem ser inventariados antes de criar a versão inicial.
9. **Histórico custa armazenamento.** Retenção e limpeza precisam ser definidas antes de automatizar exclusões; restaurar textos sem preservar suas imagens não restaura uma versão.
10. **Crescimento incremental.** Após aprovação, planejar fatias: base privada e publicação segura; edição visual de textos; traduções; ordenação e coleções; mídias; idiomas adicionais e restauração. Até o caminho completo estar pronto, controles incompletos não podem substituir a administração em produção.

A definição física de tabelas, revisão imutável, transação/RPC, Storage, políticas e migração pertence ao plano e a um registro arquitetural revisado. Não se exige backend próprio, colaboração em tempo real nem CMS externo.

## 3. Requisitos funcionais

### FR-001 — Entrar e sair do modo de edição

QUANDO Marcos autenticar-se e ativar o modo admin
O SISTEMA DEVE apresentar o portfólio com controles de edição autorizados e identificação clara de **Rascunho**, mantendo a experiência pública sem esses controles.

QUANDO sair do modo de edição
O SISTEMA DEVE manter o rascunho confirmado para retomada; sair não publica nem descarta alterações.

### FR-002 — Editar no contexto

QUANDO Marcos clicar ou focar e ativar um campo editável
O SISTEMA DEVE permitir editar aquele conteúdo no próprio lugar, com indicação do campo e idioma, preservando estrutura e responsividade.

QUANDO o alvo for um link ou controle de navegação
O SISTEMA DEVE distinguir editar de navegar, evitando executar acidentalmente a ação durante a edição.

### FR-003 — Cobertura de conteúdo

QUANDO utilizar o editor
O SISTEMA DEVE permitir administrar os conteúdos abaixo, sem alterar código:

| Área | Conteúdo editável |
| --- | --- |
| Apresentação e Sobre mim | Nome exibido, posicionamento, resumo, títulos e textos |
| Resultados | Títulos, descrições e valores exibidos; sem gerar alegações automaticamente |
| Experiências | Períodos, cargo/título, contexto, responsabilidades, decisões e resultados |
| Skills | Categorias, nomes, tecnologias e ícones |
| Formação | Curso, instituição, período, andamento, competências e conteúdos estudados |
| Projetos | Nome, tipo, descrição, contexto, solução, papel, decisões, tecnologias, resultados, aprendizados, links e imagens |
| Contatos e currículos | Rótulos, destinos, dados de contato e PDF por idioma |
| Navegação e interface pública | Rótulos traduzíveis, preservando a identidade dos destinos |

A edição do resumo e da página completa de um projeto deve atuar sobre a mesma entidade. Contatos compactos e completos compartilham o mesmo dado. Campos de datas, URLs, tipo e arquivos podem abrir um controle contextual adequado; não se exige editar tudo como texto livre.

### FR-004 — Salvamento automático privado

QUANDO sair de um campo alterado, concluir uma reordenação ou confirmar um controle contextual
O SISTEMA DEVE validar e salvar a mudança no rascunho, indicando **Alterações não salvas**, **Salvando**, **Rascunho salvo** ou **Falha ao salvar**.

QUANDO houver erro
O SISTEMA DEVE preservar a edição na sessão, identificar o alvo e permitir corrigir ou tentar novamente, sem afirmar persistência remota.

### FR-005 — Retomada e navegação

QUANDO Marcos retornar após encerrar a sessão ou usar outro dispositivo autenticado
O SISTEMA DEVE carregar o último rascunho confirmado, incluindo textos, traduções, mídias associadas e posições.

QUANDO navegar entre home, página completa e pré-visualização com mudanças pendentes
O SISTEMA DEVE tentar concluí-las ou avisar do risco antes de abandonar a edição. Fechamento abrupto não garante recuperação de conteúdo ainda não confirmado.

### FR-006 — Abas de tradução

QUANDO ativar a edição de um texto traduzível
O SISTEMA DEVE mostrar abas dos idiomas cadastrados e indicar traduções ausentes.

QUANDO mudar de aba
O SISTEMA DEVE salvar a edição anterior ou manter sua pendência identificada, sem sobrescrever outra tradução nem trocar IDs do conteúdo. A aba editorial não muda a preferência de idioma do visitante.

### FR-007 — Adicionar e disponibilizar idiomas

QUANDO adicionar um idioma válido e ainda inexistente
O SISTEMA DEVE criar sua entrada no rascunho e disponibilizar a aba nos conteúdos traduzíveis existentes e futuros, sem preencher traduções inventadas.

QUANDO Marcos solicitar a disponibilização pública desse idioma
O SISTEMA DEVE verificar os requisitos de completude da BR-006 e incluí-lo no seletor público somente após publicação. Idiomas em preparação permanecem privados.

### FR-008 — Reordenar seções

QUANDO arrastar uma seção para uma posição permitida
O SISTEMA DEVE atualizar sua ordem no rascunho e a ordem correspondente do menu, preservando IDs, âncoras e conteúdo.

QUANDO publicar
O SISTEMA DEVE apresentar a mesma ordem em desktop e mobile. Sobre mim pode ficar depois de Skills.

### FR-009 — Reordenar itens

QUANDO mover uma experiência ou item ordenável
O SISTEMA DEVE persistir a ordem dentro de sua coleção, independentemente do idioma.

Coleções propostas: experiências; resultados; projetos dentro do tipo pessoal/profissional; categorias e skills dentro da categoria; formações; contatos; imagens e links de um projeto. Mover entre categorias ou mudar o tipo de projeto exige uma alteração explícita de associação, não um arraste acidental.

### FR-010 — Acessibilidade da edição

QUANDO não for possível arrastar com precisão ou usar mouse
O SISTEMA DEVE oferecer ações equivalentes por teclado e controles **Mover acima/abaixo**, com foco visível, rótulos e anúncio de salvamento/erro. Edição e ordenação devem funcionar em tela pequena sem depender apenas de hover.

### FR-011 — Inserir, remover e recuperar itens no rascunho

QUANDO criar conteúdo ou preencher uma seção vazia
O SISTEMA DEVE oferecer um ponto de inserção contextual, inclusive para conteúdo que não aparece no site por estar vazio.

QUANDO remover um item
O SISTEMA DEVE retirá-lo apenas do rascunho e permitir desfazer; itens publicados permanecem disponíveis até nova publicação. Se houver dependências, explicar o impacto antes de confirmar. Esta proposta não permite remover templates de seção nem apagar imediatamente arquivos físicos.

### FR-012 — Mídias no contexto

QUANDO enviar, substituir, remover uma associação ou ordenar imagens, ícones e currículos
O SISTEMA DEVE refletir a alteração no rascunho, com progresso, validação de formato/tamanho e alternativa em caso de erro.

Mídias novas permanecem privadas antes da publicação; substituir no rascunho não altera o arquivo da versão pública. Imagens de projetos continuam opcionais, e os arquivos existentes continuam utilizáveis durante a migração.

### FR-013 — Pré-visualização

QUANDO selecionar **Pré-visualizar**
O SISTEMA DEVE mostrar o rascunho sem controles de edição, usando a mesma apresentação da versão pública, com escolha de idioma e visualização desktop/mobile.

A pré-visualização inclui a navegação à página completa do projeto e mantém acesso restrito ao administrador; não cria URL pública de rascunho.

### FR-014 — Revisão antes de publicar

QUANDO selecionar **Publicar alterações**
O SISTEMA DEVE finalizar o campo ativo, aguardar salvamentos e uploads, validar o rascunho completo e apresentar um resumo do conjunto: conteúdos, traduções, posições, mídias, inclusões e remoções.

Erros bloqueadores devem apontar o campo/idioma e impedir publicação. Confirmar o resumo publica exatamente a revisão revisada; alterações posteriores exigem nova revisão.

### FR-015 — Publicação completa

QUANDO Marcos confirmar a publicação de uma revisão válida
O SISTEMA DEVE disponibilizar textos, traduções, ordem, links, idiomas e referências de mídia como uma única versão coerente, mantendo a anterior se a promoção falhar.

A interface só deve informar sucesso após confirmação do servidor. Repetir a mesma solicitação por clique duplo ou falha de rede não cria publicações duplicadas.

### FR-016 — Leitura pública consistente

QUANDO um visitante carregar a home ou uma página completa
O SISTEMA DEVE carregar uma revisão publicada consistente, nunca o rascunho nem uma composição parcial de revisões.

Uma sessão pública já aberta pode continuar exibindo sua revisão até recarregar; não haverá atualização ao vivo obrigatória. Nova carga após publicação confirmada deve receber a revisão atual, sem cache indefinidamente desatualizado.

### FR-017 — Descartar alterações

QUANDO Marcos escolher **Descartar alterações** e confirmar o impacto
O SISTEMA DEVE restaurar o rascunho para a versão atualmente publicada, sem mudar o site público e sem apagar arquivos ainda referenciados.

### FR-018 — Desfazer e refazer

QUANDO Marcos desfizer ou refizer uma edição confirmada da sessão
O SISTEMA DEVE aplicar a operação no rascunho e salvá-la como nova alteração, sem alterar retroativamente uma versão publicada. A abrangência proposta está na seção 8.

### FR-019 — Histórico e restauração

QUANDO consultar versões publicadas
O SISTEMA DEVE mostrar identificador, data/hora e resumo das alterações.

QUANDO escolher restaurar uma versão retida
O SISTEMA DEVE preparar seu conteúdo como rascunho após confirmação de substituição do rascunho atual, incluindo as referências de mídia disponíveis. A restauração só afeta visitantes após **Publicar alterações**.

### FR-020 — Conflitos e resultado desconhecido

QUANDO uma gravação usar uma revisão desatualizada, inclusive por outra aba de Marcos
O SISTEMA DEVE rejeitar a sobrescrita silenciosa e permitir recuperar a edição local ou carregar a versão atual.

QUANDO a resposta da publicação se perder
O SISTEMA DEVE consultar o resultado da operação antes de repetir, mostrando estado de confirmação pendente até saber se houve publicação.

### FR-021 — Sessão e autorização

QUANDO a sessão expirar ou o acesso não estiver autorizado
O SISTEMA DEVE bloquear gravações, uploads, histórico privado e publicação também no servidor, permitir reautenticação e preservar edições locais pendentes enquanto a sessão da página existir.

Visitantes e usuários autenticados não administradores não podem ler rascunhos por API ou Storage nem obter permissões por manipulação do modo visual.

### FR-022 — Transição da administração

QUANDO a nova edição for ativada em produção
O SISTEMA DEVE preservar o conteúdo público atual como primeira versão publicada e oferecer acesso à edição a partir da autenticação existente.

Os formulários antigos devem ser desativados para escrita ou passar pelo mesmo rascunho. Nenhum fluxo legado pode continuar publicando diretamente e contornar **Publicar alterações**.

## 4. Regras de negócio

### BR-001 — Autoridade e escopo da publicação

Somente Marcos, autenticado e autorizado, publica. Publicação de conteúdo não é deploy de código na Vercel e não exige um deploy para cada edição. Aprovação de spec e aprovação de deploy continuam sendo portões separados.

### BR-002 — Rascunho e versão

Proposta: um rascunho compartilhado entre as sessões de Marcos, baseado na última versão publicada, com revisões para detectar conflitos. O rascunho pode conter campos incompletos; a publicação não pode violar os contratos obrigatórios.

### BR-003 — Unidade editorial

Proposta: publicar o portfólio inteiro, incluindo páginas de projetos, idiomas ativos, textos e mídias relacionadas. Não há publicação parcial por bloco ou por idioma nesta versão.

### BR-004 — Segurança do conteúdo

Campos são texto simples ou listas estruturadas. Colar conteúdo não autoriza HTML, scripts, estilos ou eventos executáveis. Links aceitam protocolos apropriados ao destino (HTTP(S), e-mail e telefone); protocolos executáveis devem ser rejeitados. SVG e demais uploads exigem validação adequada ao uso seguro como imagem.

### BR-005 — Identidade e ordenação

IDs e rotas são estáveis e independem de texto, idioma e posição. Ordem manual prevalece sobre data nas experiências; datas continuam visíveis. Ordenação é compartilhada entre idiomas. Header e controles editoriais não são arrastáveis; a apresentação inicial permanece no topo por proposta P-03.

### BR-006 — Idiomas e completude

Proposta: PT-BR permanece idioma padrão não removível. Um idioma em preparação não aparece publicamente. Para ativá-lo, exigir traduções dos rótulos públicos e campos obrigatórios do conteúdo publicado; campos opcionais podem estar ausentes sem criar texto falso.

Se um idioma já ativo perder um campo obrigatório no rascunho, bloquear a publicação ou exigir sua desativação explícita. Em falha inesperada de leitura, usar fallback PT-BR por campo e não apresentar valores técnicos/chaves ao visitante.

Nomes próprios, tecnologias, datas, URLs e valores estruturados podem ser compartilhados. A tradução não deve duplicar identidade nem quantidade/posição de itens; listas usam itens estáveis, não associação exclusivamente pelo índice.

### BR-007 — Currículos e novos idiomas

Proposta: novos idiomas podem ser ativados sem PDF, omitindo o link de download correspondente. Nunca servir um currículo de outro idioma como se fosse o solicitado. PT-BR e inglês preservam seus arquivos atuais. Essa política requer confirmação em P-05.

### BR-008 — Limites da composição

Reordenar blocos dentro dos contêineres autorizados não muda layout livremente. Reutilizar o comportamento responsivo; não permitir redimensionamento livre, arraste por coordenadas, edição de CSS ou novos tipos arbitrários de seção.

### BR-009 — Mídia e retenção

Arquivo associado à versão pública ou a versão restaurável não pode ser removido por descarte, substituição ou limpeza de rascunho. Arquivos publicados anteriormente não podem ser considerados novamente secretos apenas por sair da página; cópias externas e caches não são revogáveis.

Arquivos inéditos do rascunho não podem ficar em acesso público antecipadamente. Links externos públicos inseridos por Marcos não passam a ser privados; apenas sua associação ao rascunho é privada.

### BR-010 — Integridade de publicação

Validar existência e disponibilidade das mídias gerenciadas e coerência de entidades/traduções antes da promoção. Não exigir disponibilidade permanente de sites externos como condição de publicação; validar seus destinos. Publicação falha mantém a revisão pública anterior e o rascunho recuperável.

### BR-011 — Sem edição concorrente silenciosa

Gravações e publicações devem informar a revisão esperada. Detectar respostas fora de ordem; uma resposta antiga não substitui uma edição recente. O resumo e a confirmação referem-se a uma revisão específica.

### BR-012 — Migração e rollback

Criar migrations versionadas e plano de rollback antes de alterar schema/políticas. Migrar sem apagar dados e preservar IDs, URLs de projetos, mídia e a aparência pública inicial. Importar explicitamente os fallbacks locais necessários, em vez de deixá-los contornar o versionamento.

Rollback de código deve ser compatível com os dados e preservar rascunhos/histórico. Reativar o escritor antigo sem adaptação não é rollback seguro.

## 5. Critério de aceite

### AC-001 — Edição privada e retomada [FR-001 a FR-005; alta]

Dado Marcos autenticado e um visitante na versão pública
Quando Marcos alterar um texto, sair do campo e reabrir o editor após confirmação do salvamento
Então o rascunho deve conter a alteração e o visitante deve continuar vendo a versão publicada anterior.

### AC-002 — Edição no local e superfícies compartilhadas [FR-002, FR-003; alta]

Dado um projeto e um contato existentes
Quando Marcos editar seus dados no contexto visual
Então resumo/página completa e contatos compactos/completos devem mostrar o mesmo rascunho, sem duplicar entidades, e a navegação deve continuar disponível fora da ação de editar.

### AC-003 — Abas de tradução [FR-006; alta]

Dado um texto com português e inglês
Quando editar português e mudar para a aba inglesa
Então a tradução portuguesa deve ser salva ou marcada pendente, a inglesa deve permanecer independente e a preferência pública não deve ser alterada pela aba.

### AC-004 — Novo idioma [FR-007, BR-006, BR-007; alta]

Dado um novo idioma adicionado ao rascunho
Quando Marcos abrir um texto existente e criar outro item
Então ambos devem ter a nova aba, sem tradução inventada, e o idioma não deve aparecer ao visitante até ativação e publicação válida.

Dado um idioma incompleto solicitado para ativação
Quando tentar publicar
Então os campos obrigatórios ausentes devem ser indicados e a ativação deve ser bloqueada; ausência de PDF segue a política aprovada.

### AC-005 — Ordenação [FR-008, FR-009; alta]

Dado Sobre mim antes de Skills e duas experiências ordenadas por data
Quando mover Sobre mim para depois de Skills e inverter as experiências
Então o rascunho deve refletir a ordem manual em ambos os idiomas, preservar datas e âncoras, alinhar o menu e só afetar visitantes após publicação.

### AC-006 — Uso acessível e mobile [FR-010; alta]

Dado uso por teclado ou tela pequena
Quando editar e reordenar por controles alternativos
Então deve ser possível concluir as mesmas ações sem arraste, com foco identificável, feedback de salvamento e sem conteúdo cortado ou rolagem horizontal indevida.

### AC-007 — Inclusão, remoção e desfazer [FR-011, FR-018; alta]

Dado uma seção sem itens e um projeto publicado
Quando criar um item, remover o projeto do rascunho e desfazer a remoção
Então o novo item deve ser editável, o projeto restaurado deve manter identidade/dados e nada disso deve alterar a versão pública antes da publicação.

### AC-008 — Mídia privada [FR-012, BR-009; alta]

Dado uma imagem publicada e uma substituta enviada ao rascunho
Quando um visitante tentar ler a substituta pela API ou URL antes de publicar
Então o acesso ao arquivo inédito deve ser negado, a imagem pública anterior deve funcionar e Marcos deve conseguir pré-visualizar a nova.

Quando descartar a substituição
Então nenhuma mídia referenciada por versões retidas deve ser removida.

### AC-009 — Pré-visualização [FR-013; alta]

Dado o rascunho com alterações de texto, ordem e imagem
Quando pré-visualizar em desktop/mobile e abrir a página completa do projeto
Então deve ver a mesma revisão privada, sem controles de edição, preservando acesso restrito e podendo retornar ao editor.

### AC-010 — Publicação com campo ativo [FR-014, FR-015; alta]

Dado um campo ainda em edição e um upload pendente
Quando clicar em Publicar alterações
Então o sistema deve concluir/validar o salvamento, aguardar o upload e apresentar o resumo da revisão completa; somente após confirmação deve torná-la pública.

### AC-011 — Atomicidade e consistência [FR-015, FR-016; alta]

Dado alterações em texto, tradução, ordem e imagem
Quando ocorrer uma publicação, inclusive com visitante fazendo múltiplas leituras durante a promoção
Então cada carregamento deve obter uma revisão coerente anterior ou nova, nunca uma mistura, e uma nova carga após sucesso deve obter a nova versão.

### AC-012 — Falha e repetição de publicação [FR-015, FR-020; alta]

Dado uma publicação cuja transação falha
Quando consultar o site e retomar o editor
Então a versão anterior deve permanecer pública e o rascunho deve continuar disponível.

Dado uma publicação concluída cuja resposta se perdeu
Quando Marcos tentar novamente
Então o sistema deve recuperar seu resultado sem duplicar a versão nem afirmar falha antes da confirmação.

### AC-013 — Falha de autosave e conflito [FR-004, FR-020; alta]

Dado uma falha de rede ou duas abas editando uma mesma revisão
Quando uma gravação falhar ou chegar obsoleta
Então deve haver feedback preciso, preservação da edição local e nenhuma sobrescrita silenciosa ou indicação falsa de rascunho salvo.

### AC-014 — Autorização e sessão [FR-021; alta]

Dado visitante, usuário não administrador ou sessão expirada
Quando tentar ler rascunho, acessar mídia inédita, salvar ou publicar diretamente pela API
Então a operação deve ser negada no servidor, independentemente de esconder controles no frontend; Marcos deve poder reautenticar sem perder a edição local ainda presente.

### AC-015 — Descarte e restauração [FR-017, FR-019; alta]

Dado alterações privadas e versões anteriores retidas
Quando confirmar descarte
Então o rascunho deve voltar à versão publicada atual, sem alterar o público.

Quando escolher restaurar uma versão anterior
Então deve obter um rascunho com seus textos, ordem, idiomas e mídias, e só torná-lo público após revisão e publicação.

### AC-016 — Transição sem regressão [FR-022, BR-012; alta]

Dado o portfólio atual com DocFlow, Gestão Pro, experiências, skills, contatos e currículos
Quando migrar e ativar a edição visual
Então o conteúdo público inicial, IDs, links, traduções e arquivos devem permanecer equivalentes; nenhum formulário antigo deve gravar diretamente na versão pública.

### AC-017 — Entrada inválida [FR-003, FR-012, BR-004; alta]

Dado texto colado com HTML/script, URL executável ou arquivo fora dos limites aprovados
Quando tentar salvar/enviar/publicar
Então o conteúdo não deve executar código, a entrada inválida deve ser identificada e a versão pública deve permanecer íntegra.

## 6. Casos de erro / edge cases

| Caso | Resultado esperado | Prioridade |
| --- | --- | --- |
| Campo vazio obrigatório | Permitir rascunho incompleto; impedir publicação com indicação do campo | Alta |
| Falha de autosave | Preservar edição na sessão, indicar pendência e permitir nova tentativa | Alta |
| Respostas fora de ordem/duas abas | Verificar revisão, não sobrescrever silenciosamente | Alta |
| Sessão expirada durante upload/publicação | Revalidar autorização no servidor; reautenticar e consultar estado da operação | Alta |
| Imagem nova acessível antes de publicar | Considerar falha de isolamento; bloquear entrega até corrigir | Alta |
| Falha de upload ou preparação da mídia | Não promover referência quebrada; preservar mídia pública anterior | Alta |
| Falha após promoção na limpeza de órfãos | Não reverter publicação válida; registrar limpeza pendente sem apagar referências vivas | Média |
| Arquivo removido externamente de versão antiga | Avisar e bloquear restauração incompleta até resolver; não prometer restauração íntegra | Alta |
| Publicar sem alterações | Não criar versão duplicada; informar ausência de alterações | Média |
| Descartar enquanto há gravações em trânsito | Invalidar revisão antiga para que respostas pendentes não ressuscitem alterações | Alta |
| Renomear/mover projeto | Preservar rota por ID; seção de origem não muda sua identidade | Alta |
| Remover projeto e publicar | Sua rota atual informa ausência, sem expor a versão antiga automaticamente | Média |
| Idioma duplicado/inválido | Rejeitar cadastro; normalizar identificador antes de comparar | Média |
| Remover/desativar idioma selecionado pelo visitante | Na próxima carga, retornar ao idioma padrão disponível | Média |
| Texto longo ou tradução muito maior | Preservar legibilidade, foco e composição responsiva | Média |
| Arrastar para coleção incompatível | Recusar operação e preservar posição anterior | Média |
| Teclado virtual/mobile e perda de foco | Salvar o campo correto sem acionar publicação ou navegação inadvertida | Alta |
| Navegador encerrado antes de confirmar autosave | Não garantir recuperação; comunicar o limite, sem afirmar salvamento | Média |
| Cache ou URL externa de mídia já publicada | Não prometer revogação de cópias externas; distinguir associação pública de confidencialidade | Média |
| Idiomas com escrita da direita para a esquerda | Escopo precisa de decisão P-05; não anunciar suporte não validado | Média |

A verificação deve priorizar isolamento privado/público, autosave, publicação, conflitos, migração e o fluxo de edição mais frequente. Testes de leitura como anônimo, administrador e autenticado não autorizado devem fazer parte do plano; testes somente de componentes não comprovam as garantias do servidor.

## 7. Fora de escopo desta feature

- Múltiplos administradores, colaboração simultânea em tempo real, comentários e aprovação por equipe.
- Publicação agendada, publicação parcial por seção e testes A/B.
- Construtor livre de páginas, novos tipos arbitrários de bloco, edição de CSS/HTML/JavaScript e posicionamento por coordenadas.
- Tradução automática, geração de texto/imagens por IA ou alteração automática de alegações profissionais.
- Blog, formulário persistente de contato, CRM ou cadastro de visitantes.
- Edição offline completa e garantia de recuperação após fechamento abrupto de conteúdo não salvo.
- Histórico de cada tecla; o histórico durável proposto é de versões publicadas.
- Compartilhamento público do preview.
- Novo backend próprio ou CMS externo sem decisão arquitetural posterior.
- Alterar os conteúdos profissionais existentes durante a implantação.
- Deploy automático de código a cada publicação de conteúdo.
- Resolver nesta tarefa os problemas preexistentes de Git remoto, budgets de bundle ou documentação não relacionada.

## 8. Suposições e perguntas abertas

### Decisões explicitamente confirmadas na conversa

- [x] Edição no próprio contexto visual ao ativar o modo admin.
- [x] Clicar diretamente no texto para editar.
- [x] Salvar ao sair do campo.
- [x] Abas de idiomas junto ao conteúdo e criação de aba ao adicionar idioma.
- [x] Arrastar seções e experiências para mudar sua posição.
- [x] Editar tudo e clicar em **Publicar alterações**: autosave deve guardar o rascunho, não publicar imediatamente.
- [x] Criar a spec completa seguindo o template indicado e os princípios/produto, sem iniciar implementação nesta solicitação.

### Propostas para aprovação — não são decisões atribuídas a Marcos

| ID | Proposta e ponderação | Impacto / alternativa |
| --- | --- | --- |
| P-01 | Um rascunho remoto por portfólio, publicação integral e detecção de conflitos por revisão | Mais simples que múltiplos rascunhos; impede trabalho paralelo independente. Afeta FR-004/005/015/020 |
| P-02 | Resumo de alterações e confirmação antes da promoção | Acrescenta um passo para evitar publicar mudanças esquecidas. Alternativa: publicar diretamente no primeiro clique. Afeta FR-014 |
| P-03 | Apresentação inicial fixa no topo; todas as seções de conteúdo abaixo dela podem ser reordenadas, inclusive Contato. Itens só se movem dentro da coleção | Mantém estrutura previsível; confirmar se Marcos também quer mover a apresentação. Afeta FR-008/009 e BR-005 |
| P-04 | Permitir criar/remover itens e desfazer/refazer operações confirmadas durante a sessão; descarte geral volta à versão pública | Extensão necessária para substituir os formulários, mas não foi detalhada pelo usuário. Definir exatamente as operações reversíveis, incluindo associações de mídia. Afeta FR-011/017/018 |
| P-05 | Idiomas inicialmente com escrita esquerda-direita; PT-BR obrigatório; ativação exige campos obrigatórios e rótulos traduzidos, mas PDF é opcional. Desativar idioma preserva traduções; não excluir definitivamente nesta fase | Evita mistura silenciosa de idiomas. Confirmar idiomas desejados e política de fallback/completude. Afeta FR-007 e BR-006/007 |
| P-06 | Histórico das 10 publicações mais recentes, incluindo a atual; versões restauradas tornam-se novo rascunho. Sem limpeza automática até validar referências e definir política para órfãos | Equilibra recuperação e custo; número e prazo de limpeza precisam ser aprovados. Afeta FR-019 e BR-009 |
| P-07 | Texto simples/listas estruturadas; links/datas/mídias editados em controles contextuais; sem editor rich text nesta fase | Menor complexidade e superfície de falhas; confirmar se há necessidade de negrito/itálico dentro dos textos. Afeta FR-002/003 |
| P-08 | Preservar limites atuais: imagens de projeto PNG/JPEG até 1 MiB; ícones PNG/JPEG/SVG até 1 MiB; currículo PDF com limite atual inventariado no plano | Não ampliar formatos/tamanhos implicitamente. Validar tratamento seguro de SVG e limite real do PDF antes da implementação. Afeta FR-012 |
| P-09 | `/admin` permanece como entrada de autenticação e acesso ao editor; formulários antigos deixam de escrever diretamente quando a feature for ativada | Evita dois caminhos incompatíveis. Confirmar se os formulários serão removidos ou temporariamente adaptados ao rascunho. Afeta FR-022 |

### Decisões técnicas aprovadas — 2026-09-26

Marcos respondeu **“Todos aprovados”** às oito recomendações técnicas apresentadas após sua pergunta sobre as decisões pendentes. Os itens abaixo registram aprovação de direção técnica, não execução, teste ou aprovação de deploy. Prevalecem sobre as ponderações e propostas anteriores nos pontos que resolvem.

- [x] **DT-001 — Representação híbrida.** Um rascunho remoto estruturado por entidades; publicações como cópias completas, imutáveis e versionadas em JSON estruturado. Arquivos separados, referenciados por IDs estáveis. Traduções associadas ao ID do conteúdo e código do idioma. Autosave atualiza campos/entidades sem reenviar toda a página. Plano/ADR definirão schema e validação do documento publicado.
- [x] **DT-002 — Publicação transacional e leitura coerente.** Uma operação no banco verifica autorização, revisão esperada, campos e referências, cria a versão e atualiza a referência ativa na mesma transação. Identificador único de operação evita duplicação por repetição. Autosave detecta revisão obsoleta e preserva a edição local. Home e página completa usam a mesma versão durante a navegação; nova carga resolve a versão publicada atual.
- [x] **DT-003 — Mídias privadas e retenção.** Novos arquivos ficam em bucket privado, com caminhos únicos e sem sobrescrita. Administrador acessa mídias do rascunho; visitantes obtêm URLs temporárias somente para mídias autorizadas pela publicação. A promoção altera referências/autorização no banco sem exigir cópia para bucket público. Reter as dez versões publicadas mais recentes, incluindo a atual. Limpar somente arquivos sem referência no rascunho ou em qualquer versão retida, após sete dias continuamente sem referência e nova conferência antes da remoção. URLs já emitidas podem funcionar até expirar. Preservar arquivos/URLs existentes durante a migração, sem prometer tornar secreto o que já foi público.
- [x] **DT-004 — Migração gradual.** Inventariar banco, arquivos e fallbacks locais; criar a primeira versão a partir do conteúdo efetivamente exibido; comparar home, projetos, idiomas, contatos e currículos; criar o rascunho dessa versão; ativar o editor e bloquear a escrita pública antiga. Preservar IDs e URLs. Manter temporariamente as tabelas antigas para recuperação, sem segunda fonte editável. Inventário e conferência de policies/grants/limites ainda deverão ser executados no plano.
- [x] **DT-005 — Cobertura editorial.** Conteúdo editado no local; datas, URLs, tipos e arquivos em controles contextuais; menus, botões e títulos de campos públicos em “Textos da interface”, com abas de idiomas. Mensagens internas do editor permanecem controladas pelo sistema. Seções vazias aparecem apenas no modo admin com ações de inserção. Resumo/página completa e contatos repetidos compartilham a mesma entidade.
- [x] **DT-006 — Catálogo de ícones.** Precedência: personalizado explicitamente escolhido → catálogo padrão → símbolo genérico com nome. Skills e projetos compartilham IDs de tecnologia e o mesmo catálogo; nomes com versão, como React 18, podem apontar para a mesma tecnologia. Hospedar localmente os ícones padrão utilizados, respeitando licenças. Esta decisão altera explicitamente a prioridade atual do catálogo padrão; não é uma mudança já implementada.
- [x] **DT-007 — Reconciliação documental.** Atualizar produto, arquitetura e specs impactadas e criar ADR de versionamento/publicação editorial. Preservar decisões anteriores como histórico e identificar os pontos substituídos. Reconhecer as páginas completas já existentes. A aprovação é da direção; os documentos ainda precisam ser produzidos/reconciliados.
- [x] **DT-008 — Ordem incremental e verificação.** Planejar: (1) rascunho privado, leitura versionada e publicação segura com uma fatia pequena completa; (2) edição visual, autosave e retomada; (3) traduções PT/EN; (4) ordenação, inclusão/remoção e desfazer; (5) mídias privadas e preview; (6) idiomas adicionais, histórico e restauração; (7) migração final e substituição da administração. Testar publicação, autorização e conflitos com banco/Storage e edição, teclado, arraste e mobile no navegador. Controles incompletos não substituem o fluxo público em produção.

### Consequências para as propostas anteriores

- P-01: um rascunho remoto, publicação integral e conflitos por revisão aprovados por DT-001/002.
- P-04: inclusão/remoção e desfazer aprovados na sequência de DT-008; granularidade de desfazer/refazer e regras de descarte ainda precisam de detalhamento.
- P-06: retenção de dez versões e prazo de sete dias para órfãos aprovados por DT-003; a limpeza depende das verificações de referência, não apenas da idade do arquivo.
- P-07: controles contextuais aprovados por DT-005; suporte a rich text não foi acrescentado pela aprovação técnica.
- P-09: bloqueio da escrita pública antiga e substituição da administração aprovados por DT-004/008; remoção física dos formulários e momento de retirada das tabelas antigas serão definidos no plano.
- P-02, P-03, P-05 e P-08 conservam os detalhes de produto ainda não explicitamente resolvidos pelas recomendações técnicas: confirmação editorial, limites de movimentação, política de ativação de idiomas e formatos/tamanhos de mídia. Não foram silenciosamente aprovados como um pacote separado.

### Regras de produto aprovadas — 2026-09-26

Marcos confirmou **“Aprovar esse conjunto de regras”** durante a preparação do plano: confirmação do resumo antes de publicar; apresentação fixa e demais seções reordenáveis; texto simples; desfazer/refazer na sessão e descarte com confirmação; PT-BR obrigatório, novos idiomas inicialmente ltr e completos antes da ativação, PDF opcional; preservar formatos/limites atuais. Isso resolve P-02/P-03/P-05/P-07/P-08 e os limites de produto de P-04. A marcação anterior como proposta é mantida como histórico, não como pergunta a repetir.

### Refinamento aprovado — catálogo compartilhado de Skills

Na ADR-012, Marcos definiu que o Gerenciador de mídias é a superfície única para criar e
editar habilidades e seus ícones. Projetos e a seção geral de Habilidades somente associam
tecnologias já existentes no catálogo editorial compartilhado; a alteração do rótulo no
catálogo sincroniza as entidades de Skill que o referenciam. O fluxo usa as RPCs
revisionadas e a validação privada de PNG/JPEG/SVG já aprovada pela ADR-009.

Limite observado: PNG/JPEG e ícones até 1 MiB, PDF sem teto específico no bucket; teto global da conta ainda não confirmado. Não confundir essa ausência de limite específico com arquivo ilimitado. As DTs e as regras de produto estão aprovadas; schema/ADR/planos abaixo são detalhamento produzido para revisão, sem implementação.

### Trabalho documental e técnico executado

- [x] Formalizar [ADR-008](../../02-arquitetura/DECISAO-008-versionamento-publicacao-editorial.md) e [schema proposto](../../04-plano/edicao-visual-rascunho-publicacao/schema-proposto.md), incluindo snapshot v1 e validação de publicação. Propostas técnicas documentadas, não aplicadas.
- [x] Detalhar [mídias e cache](../../04-plano/edicao-visual-rascunho-publicacao/midias-e-cache.md), incluindo limitações do TTL, janela navegável e arquivos legados.
- [x] Executar [inventário real](../../05-verificacao/edicao-visual-rascunho-publicacao/inventario.md) de dados públicos, fallbacks, arquivos, limites específicos, grants e policies. Coleta somente leitura; limite global e testes de autorização/bytes ainda pendentes, explicitados no relatório.
- [x] Reconciliar produto, arquitetura, decisões e specs afetadas com notas explícitas de precedência e transição, preservando o histórico.
- [x] Produzir [plano](../../04-plano/edicao-visual-rascunho-publicacao/plano.md), [tarefas](../../04-plano/edicao-visual-rascunho-publicacao/tarefas.md) e [plano de verificação](../../05-verificacao/edicao-visual-rascunho-publicacao/plano-de-teste.md), após aprovação das regras de produto. Todas as tarefas de implementação/testes permanecem pendentes.

## 9. Definition of Done desta feature

- [ ] Marcos revisou e aprovou esta spec e as propostas aplicáveis da seção 8.
- [ ] Documentos de produto, arquitetura e features afetadas reconciliados, sem divergências silenciosas.
- [ ] Plano/tarefas seguem implementação incremental, com cada fatia verificável antes da seguinte.
- [ ] AC-001 a AC-017 satisfeitos e evidenciados; exceções explicitamente acordadas, nunca marcadas como teste executado.
- [ ] Casos de erro de prioridade alta tratados; riscos restantes documentados.
- [ ] Migrations, migração da versão inicial e rollback revisados e testados em ambiente controlado.
- [ ] Isolamento de rascunho e mídia comprovado por API/Storage para anônimo, administrador e usuário não autorizado.
- [ ] Publicação consistente, conflitos e repetição após falha de rede verificados.
- [ ] Home, páginas completas, PT/EN, contatos, currículos e mídias existentes continuam funcionando.
- [ ] Edição por teclado e em mobile, pré-visualização e navegação conferidas em navegador.
- [ ] Testado conforme plano em `spec/05-verificacao/edicao-visual-rascunho-publicacao/`, a criar seguindo o template de verificação do processo.
- [ ] Comparação final SPEC ↔ PLANO/TAREFAS ↔ CÓDIGO ↔ TESTE registrada.
- [ ] Marcos revisou o resultado e aprovou antes do deploy.
