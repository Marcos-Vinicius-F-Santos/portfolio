# Plano de Implementação — Projetos profissionais e pessoais

Spec relacionada: `spec/03-features/projetos-profissionais-e-pessoais/spec.md`  
Arquitetura: `spec/02-arquitetura/ARQUITETURA.md`  
Status: Aprovado

## 1. Resumo técnico

A feature será implementada dentro do domínio público já existente, reutilizando a
página única em `src/app/features/portfolio/presentation/`, o contrato de conteúdo
em `src/app/features/portfolio/content/` e o `PortfolioContentService.listProjects()`,
que já lê projetos, traduções, ordem e imagens do Supabase.

A implementação deve carregar os projetos no idioma selecionado, validar a presença
de todos os campos obrigatórios, separar os projetos profissionais e pessoais em duas
subseções e ocultar a seção e o item de navegação quando não houver projeto completo
disponível. Os links serão apresentados sem validação prévia, conforme a Spec.

Não será criada uma nova rota, uma nova feature de domínio, um serviço global ou um
componente compartilhado. A página pública existente já é o limite arquitetural
adequado para essa seção.

A migration para persistir o tipo profissional/pessoal faz parte do escopo desta implementação e deve ser concluída antes da lógica principal. Ela precisa ser versionada, tratar registros existentes com segurança usando somente classificações aprovadas e falhar sem inventar valores quando a classificação não existir, atualizar o contrato do domínio e possuir rollback documentado.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/portfolio/content/portfolio-content.models.ts` | Estender o modelo de projeto com o tipo profissional/pessoal e um contrato verificável para links e campos obrigatórios | Alto: o tipo não existe no retorno persistido atual e um contrato incorreto pode ocultar projetos válidos |
| `src/app/features/portfolio/content/portfolio-content.service.ts` | Reutilizar `listProjects()`, acrescentando a classificação, a seleção de tradução, a normalização dos campos e a ordenação configurável | Alto: a consulta atual não carrega tipo; falhas de tradução ou dados incompletos podem alterar a disponibilidade da seção |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` | Carregar projetos, separar subseções, controlar a presença da seção e integrar a alternância de idioma | Alto: a composição da navegação é compartilhada por todas as seções existentes |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` | Renderizar a nova seção, subseções, campos obrigatórios e links dentro da página única | Médio: condições incorretas podem exibir conteúdo vazio ou afetar a estrutura atual |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss` | Adicionar estilos locais e responsivos para a seção de projetos | Médio: overflow, quebra de listas ou regressão visual nas seções existentes |
| `src/app/features/portfolio/content/portfolio-content.service.spec.ts` | Cobrir leitura, classificação, ordem, campos obrigatórios, links e traduções | Médio: mocks podem mascarar a ausência do tipo no schema real |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts` | Cobrir caminho feliz, ausência de projetos, subseções, navegação, idioma e regressão | Alto: testes insuficientes podem quebrar IDs, ordem e idioma existentes sem detecção |
| supabase/migrations/ | Criar migration versionada para persistir project_type em portfolio_projects, com backfill, constraint e rollback | Alto: adicionar uma coluna muda o contrato de dados e pode falhar se houver projeto sem classificação aprovada |
| spec/03-features/projetos-profissionais-e-pessoais/spec.md | Registrar as decisões confirmadas sobre migration, fallback, links e subseções vazias | Médio: plano e Spec divergentes podem gerar implementação inconsistente |

## 3. Componentes novos

- Novo modelo/helper dentro de `src/app/features/portfolio/content/` para:
  - representar o tipo profissional ou pessoal;
  - verificar se um projeto possui todos os campos obrigatórios;
  - agrupar os projetos por subseção;
  - preservar a ordem configurada de cada projeto.
- Nova seção e subseções dentro do componente existente
  `portfolio-page`; não criar uma rota nem um componente de página separado.
- Novas chaves de interface para títulos, rótulos e subseções nos arquivos de conteúdo
  e traduções já existentes.
- Novos cenários de teste nos arquivos de teste dos domínios existentes.

A arquitetura atual já prevê projetos em `portfolio/presentation` e
`portfolio/content`. Uma pasta ou componente novo só deve ser criado se a
implementação demonstrar que a página existente ultrapassou o limite de
responsabilidade; nesse caso, a justificativa deve ser registrada antes da mudança.

## 4. Mudança de dados/banco (se houver)

O schema atual já possui:

- `portfolio_projects` com `display_order`;
- `portfolio_project_translations` com nome, descrição, contexto, papel, decisões,
  tecnologias, resultados, aprendizados e links;
- traduções separadas por `locale`;
- relação com imagens no Storage.

Porém, `portfolio_projects` não possui o tipo profissional/pessoal. Sem esse dado,
FR-001 e FR-003 não podem ser satisfeitos de forma extensível pela leitura do
Supabase.

A migration faz parte desta feature. Ela deve:

- adicionar project_type em portfolio_projects;
- restringir o valor a professional ou personal;
- preencher registros existentes somente com classificação aprovada;
- impedir que a migration termine com projeto sem classificação;
- manter as policies RLS existentes, salvo necessidade comprovada;
- registrar rollback para remover a coluna e a constraint somente depois de retirar os consumidores.

Se houver registros existentes sem classificação aprovada, a migration deve falhar de forma segura e a implementação deve parar até que Marcos forneça a classificação. Não deve haver valor padrão inventado.

A migration deve ser acompanhada de um Registro de Decisão em spec/02-arquitetura/, pois altera o contrato persistido de projetos.

A ordenação deve reutilizar `display_order`, preservando a ordem configurada dentro
de cada subseção. A interface administrativa para editar projetos ou essa ordem
continua fora desta rodada; o frontend público apenas respeita o valor recebido.

## 5. Sequência de implementação

Executar as tarefas uma por vez e na ordem de `tarefas.md`. O portão de classificação
de dados deve ser resolvido antes de qualquer código da lógica principal.

### Fase 1 — Base

1. Confirmar os pontos de integração existentes na página pública, no serviço de conteúdo, no serviço de idioma, nos testes e na navegação.
2. Registrar a incompatibilidade entre a Spec e o schema atual: não existe tipo de projeto persistido e vários campos aceitam vazio no banco.
3. Criar e revisar a migration do tipo profissional/pessoal, incluindo backfill seguro, constraints, rollback e Registro de Decisão.
4. Definir o view model mínimo, a regra de completude, o fallback pt-BR, as chaves traduzidas e o formato label/url dos links.
5. Confirmar o uso de display_order como ordem configurável dentro de cada subseção e a ocultação de subseções vazias.

### Fase 2 — Lógica principal

1. Estender o contrato do domínio para representar o tipo e os campos obrigatórios.
2. Reutilizar `listProjects()` para carregar os projetos no idioma selecionado,
   preservando o acesso por serviço e sem chamadas diretas ao banco na apresentação.
3. Descartar da apresentação projetos sem nome ou sem qualquer campo obrigatório.
4. Agrupar os projetos completos nas subseções profissional e pessoal e preservar
   `display_order`.
5. Expor os links armazenados sem validação prévia, sem gerar links fictícios.
6. Recarregar a coleção ao alternar o idioma e usar pt-BR como fallback quando a tradução selecionada estiver ausente.
7. Definir `showProjects` para ocultar a seção e seu item de navegação quando a
   coleção final estiver vazia.

### Fase 3 — Interface

1. Adicionar a seção de projetos à navegação existente sem alterar os IDs ou destinos
   atuais.
2. Renderizar as subseções profissional e pessoal somente quando houver conteúdo
   correspondente.
3. Renderizar nome, descrição, contexto, papel, decisões técnicas, tecnologias,
   resultados, aprendizados e links de cada projeto completo.
4. Aplicar estilos locais e responsivos dentro do domínio de apresentação existente.
5. Conferir que conteúdo longo, listas e links não geram corte, sobreposição ou
   overflow horizontal.

### Fase 4 — Testes

1. Cobrir o contrato do serviço, a classificação e a ordenação por
   `display_order`.
2. Cobrir o caminho feliz com projetos dos dois tipos e todos os campos obrigatórios.
3. Cobrir ausência total, projeto incompleto e ausência de links.
4. Cobrir navegação e regressão das seções existentes.
5. Cobrir alternância de idioma e fallback para pt-BR.
6. Validar manualmente que nenhum conteúdo confidencial aprovado para exclusão foi
   incluído; a aplicação não deve tentar inferir confidencialidade automaticamente.
7. Executar build, suíte de testes e verificação responsiva nos tamanhos já usados
   pelo projeto.

### Fase 5 — Entrega (deploy/rollback)

1. Comparar Spec, plano, tarefas, código e testes.
2. Confirmar que a decisão sobre o tipo foi refletida nos documentos e, se aplicável,
   na migration e no Registro de Decisão.
3. Validar preview, navegação, idioma, subseções, ausência total e rollback.
4. Não executar deploy antes da revisão e aprovação de Marcos.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Merece Registro de Decisão? |
|---|---|---|---|---|
| Migration de classificação falhar por haver projeto existente sem tipo aprovado | Média | Alto | Validar e interromper a migration quando houver registro sem classificação; obter os valores aprovados antes do backfill | Sim: afeta o contrato persistido |
| Campos obrigatórios da Spec são opcionais/vazios no schema atual | Alta | Alto | Validar completude antes de renderizar; não exibir projeto incompleto; não alterar constraints nesta rodada sem decisão adicional | Não inicialmente; pode exigir ADR se alterar constraints |
| Fallback de tradução de projetos não usar pt-BR de forma consistente | Média | Alto | Implementar fallback explícito para pt-BR e cobrir inicialização, troca de idioma e tradução ausente | Não; decisão confirmada e local à feature |
| Formato de links JSONB divergir do contrato label/url | Média | Médio | Tipar o view model como label/url, preservar os dados recebidos e não validar disponibilidade externa | Não; contrato confirmado e reversível |
| Alteração da navegação quebrar IDs e destinos existentes | Média | Alto | Adicionar somente um destino estável, preservar IDs atuais e testar todos os links | Não; mudança local e reversível |
| Subsecção sem projetos aparecer vazia | Baixa | Médio | Filtrar a subseção antes da renderização e cobrir um único tipo disponível | Não; comportamento confirmado |
| Conteúdo confidencial ser incluído por engano | Média | Alto | Revisão manual de conteúdo aprovado; não publicar fixtures ou dados internos nos testes | Não; portão editorial confirmado |
| Mudança visual causar overflow em textos, listas ou links longos | Média | Médio | Estilos locais, testes em desktop/móvel e verificação visual antes da aprovação | Não; risco reversível |

## 7. Perguntas abertas antes de começar

Não há perguntas abertas de produto nesta versão do plano. As decisões confirmadas são:

- o tipo profissional/pessoal será persistido por migration em portfolio_projects;
- subseções sem projetos serão ocultadas;
- o fallback de idioma será pt-BR;
- links usarão os campos label e url, sem validação prévia;
- a revisão de confidencialidade será manual.

A migration deve parar com segurança se existir projeto sem classificação aprovada. Isso é
uma pré-condição de dados, não uma autorização para inventar classificações.