# Plano de Implementação — Layout vertical das seções

Spec relacionada: `spec/03-features/layout-vertical-secoes/spec.md`  
Status: Rascunho

## 1. Resumo técnico

A implementação será feita na página pública existente, dentro de
`src/app/features/portfolio/presentation/`. O container atual que organiza as seções em
três colunas será ajustado para uma única coluna em todos os tamanhos de tela suportados.

A composição da página também será reorganizada para apresentar “Sobre mim” primeiro,
“Stack técnica” em seguida e as demais seções depois. Os componentes, conteúdos,
identificadores de navegação e integração de dados existentes serão preservados.

Não será criada uma nova camada arquitetural, feature ou componente estrutural. A
arquitetura já reserva `portfolio/presentation` para a composição e apresentação das
seções públicas, portanto a mudança ficará nesse domínio. Não haverá alteração no
Supabase, banco, Storage, autenticação ou área administrativa.

## 2. Impacto no que já existe

A feature altera somente a experiência pública e deve preservar o conteúdo, os
identificadores de navegação e as demais funcionalidades existentes.

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| Template/composição existente em `src/app/features/portfolio/presentation/` | Reorganizar a ordem dos blocos para “Sobre mim”, “Stack técnica” e demais seções | Médio: uma alteração incorreta pode quebrar âncoras, navegação ou a ordem de leitura |
| Estilos do domínio `src/app/features/portfolio/presentation/` | Substituir a disposição atual de três colunas por uma coluna vertical em todos os breakpoints existentes | Médio: regras responsivas ou estilos de seções podem ser afetados |
| Regras de largura e overflow da página pública | Permitir que conteúdo excedente seja quebrado e distribuído verticalmente dentro da coluna | Médio: conteúdo pode sofrer corte, sobreposição ou overflow horizontal se as regras atuais forem mantidas |
| Identificadores e navegação das seções, caso estejam no mesmo domínio | Preservar IDs, links e destinos apesar da alteração da ordem visual | Médio: links internos podem deixar de apontar para a seção correta |
| Supabase, PostgreSQL, Storage, Auth e área administrativa | Nenhuma mudança | Nenhum para esta feature |

Não será alterado o agrupamento arquitetural existente. Também não será criada uma nova
pasta por tipo de arquivo; os arquivos permanecerão próximos da página e das seções que
já pertencem ao domínio `portfolio/presentation`.

## 3. Componentes novos

Nenhum componente funcional novo será criado.

Podem ser criados ou ajustados somente os testes associados à página pública, seguindo o
runner e a organização já existentes no projeto. A implementação deve reutilizar a página,
as seções e os estilos atuais.

## 4. Mudança de dados/banco (se houver)

Não haverá mudança de dados, schema, banco, Storage, autenticação ou Supabase.

Nenhuma migration é necessária. O rollback será feito revertendo o commit da alteração
de template e estilos ou restaurando os arquivos anteriores, sem necessidade de restaurar
dados externos.

## 5. Sequência de implementação

### Fase 1 — Base

1. Inspecionar a composição atual da página pública, identificando o container que aplica o
   grid de três colunas, os estilos responsivos, a ordem atual das seções, os IDs de
   navegação e os testes/comandos existentes.
2. Registrar o estado inicial por meio dos testes existentes e de uma verificação visual
   da página, sem alterar a arquitetura ou criar uma estrutura paralela.
3. Confirmar que a implementação poderá ser feita nos arquivos existentes de
   `portfolio/presentation`, sem alteração de banco ou integração.

### Fase 2 — Lógica principal

1. Reorganizar a composição da página para colocar “Sobre mim” primeiro, “Stack técnica”
   em seguida e as demais seções posteriormente.
2. Preservar os IDs, links, conteúdo e componentes das seções existentes.
3. Manter a ordem relativa das demais seções depois de “Stack técnica” até que qualquer
   necessidade diferente seja explicitamente aprovada e registrada na Spec.

### Fase 3 — Interface

1. Ajustar o container existente para uma única coluna vertical em todos os breakpoints
   suportados pela página pública.
2. Remover ou sobrescrever apenas as regras necessárias da disposição em três colunas,
   sem alterar a identidade visual ou criar uma nova estrutura de layout.
3. Garantir que conteúdos maiores que a largura disponível sejam quebrados e distribuídos
   verticalmente dentro da própria coluna, sem corte, sobreposição ou overflow horizontal.
4. Preservar espaçamentos, navegação e estilos das seções sempre que não forem necessários
   para a mudança de layout.

### Fase 4 — Testes

1. Executar os testes automatizados existentes e adicionar cobertura para a ordem das
   seções e a disposição em coluna única, caso essa cobertura ainda não exista.
2. Verificar a página em todos os tamanhos de tela suportados, incluindo ao menos as
   viewports desktop e móvel já utilizadas pelo projeto.
3. Verificar o caminho de erro de conteúdo extenso, confirmando que o conteúdo é
   distribuído verticalmente e não causa corte, sobreposição ou retorno a três colunas.
4. Executar build, lint e demais verificações já configuradas no projeto.
5. Fazer uma checagem de regressão da navegação, do conteúdo das seções e da experiência
   pública existente.

### Fase 5 — Entrega (deploy/rollback)

1. Comparar Spec da feature, plano, tarefas, implementação e testes, confirmando que FR-001
   e FR-002 estão cobertos.
2. Revisar o diff para confirmar que não houve alteração em Supabase, banco, Storage,
   autenticação, área administrativa ou outras features.
3. Registrar o commit/estado de referência e o procedimento de rollback por reversão do
   commit ou restauração dos arquivos alterados.
4. Submeter a implementação para revisão e aprovação de Marcos antes de qualquer deploy.
   Não executar deploy nesta rodada de planejamento.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Merece Registro de Decisão? |
|---|---|---|---|---|
| A alteração da ordem do DOM quebrar âncoras, navegação interna ou a ordem de leitura | Média | Alto | Preservar IDs, testar cada destino e verificar a ordem final no DOM e visualmente | Não. É uma mudança local e reversível dentro da apresentação |
| Regras responsivas existentes continuarem aplicando três colunas em algum breakpoint | Média | Médio | Mapear todos os breakpoints na Fase 1 e validar cada um na Fase 4 | Não. Não altera limite arquitetural |
| Conteúdo extenso provocar corte, sobreposição ou overflow horizontal | Média | Alto | Remover restrições conflitantes, validar quebra vertical e testar conteúdo longo em viewports estreitas | Não. É comportamento visual reversível |
| A mudança de estilos afetar outras áreas por causa de regras globais | Baixa | Médio | Preferir estilos escopados ao domínio `portfolio/presentation`; alterar estilos globais somente se comprovadamente necessário | Não. A arquitetura já orienta a organização por feature |
| A ordem das demais seções após “Stack técnica” permanecer ambígua | Média | Médio | Não alterar a ordem relativa atual sem confirmação; registrar divergência e atualizar a Spec se necessário | Não. É uma decisão de escopo, não arquitetural |

Nenhum risco identificado exige um Registro de Decisão em
`spec/02-arquitetura/DECISAO_TEMPLATE.md`. Os riscos são locais, reversíveis e não
alteram os limites arquiteturais, contratos públicos de dados ou integrações do sistema.

## 7. Perguntas abertas antes de começar

- A ordem relativa das demais seções depois de “Stack técnica” não foi detalhada. O plano
  preserva a ordem atual dessas demais seções e não autoriza uma nova ordem sem atualização
  explícita da Spec.
- Os nomes exatos dos arquivos de template e estilo serão confirmados na T-001 para
  respeitar a implementação existente.
- Os breakpoints serão os já suportados pela página pública; não será criado um breakpoint
  novo apenas para esta feature.
- O runner e os comandos de teste serão os já configurados no projeto. Caso não haja
  cobertura adequada, a necessidade de uma ferramenta adicional deverá ser avaliada antes
  de introduzi-la.

