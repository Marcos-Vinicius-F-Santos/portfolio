# Plano de Implementação — Resultados profissionais

Spec relacionada: `spec/03-features/resultados-profissionais/spec.md`  
Arquitetura: `spec/02-arquitetura/ARQUITETURA.md`  
Status: Aprovado

## 1. Resumo técnico

A feature será implementada dentro do domínio público já existente, reutilizando a
página única em `src/app/features/portfolio/presentation/`, o contrato de conteúdo em
`src/app/features/portfolio/content/`, o serviço de idioma e o fallback de conteúdo
original já implementados.

Cada uma das quatro categorias será tratada como um resultado independente. A seção
renderizará somente as categorias cujo conteúdo aprovado esteja disponível; se nenhum
resultado estiver disponível, a seção e seu item de navegação não serão renderizados.

Os textos continuarão usando as chaves de conteúdo e traduções já suportadas por
`portfolio_texts` e `portfolio_text_translations`. Não será criada uma nova pasta de
domínio, uma nova rota pública, uma tabela ou uma migration. Um novo componente isolado
não é necessário nesta rodada, porque a seção permanece parte da composição existente da
página pública.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/portfolio/content/portfolio-content.ts` | Estender o contrato de cópia com as chaves da seção e as regras de disponibilidade individual dos resultados | Médio: uma chave ausente pode ocultar a seção ou alterar a navegação |
| `src/app/features/portfolio/content/portfolio-translations.ts` | Adicionar os textos de interface em português e inglês; valores só entram quando aprovados por Marcos | Médio: textos ou fallback podem ficar inconsistentes entre idiomas |
| `src/app/features/portfolio/content/portfolio-content.service.ts` | Reutilizar o carregamento genérico de chaves existentes, sem criar um acesso direto ao banco ou uma nova camada | Médio: divergência entre chaves locais e remotas pode causar fallback inesperado |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` | Adicionar o item de navegação, o identificador da seção e a filtragem de resultados disponíveis | Alto: pode quebrar destinos e a ordem de navegação já existentes |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` | Renderizar a seção e os resultados disponíveis dentro da página única | Médio: erro de condição pode exibir conteúdo vazio ou ocultar seções atuais |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss` | Adicionar estilos locais para a seção, preservando o layout responsivo existente | Baixo: regressão visual ou overflow em telas menores |
| Testes de conteúdo e página pública | Cobrir caminho feliz, ausência parcial/total, idioma e regressão da navegação | Médio: testes incompletos podem deixar quebra de comportamento existente |

Não haverá alteração em autenticação, área administrativa, Storage, políticas RLS ou
schema. A feature consumirá o contrato genérico de conteúdo já integrado.

## 3. Componentes novos

- Novas chaves de conteúdo para o título, rótulos e textos dos resultados dentro do
  domínio existente `src/app/features/portfolio/content/`.
- Nova seção e item de navegação dentro de
  `src/app/features/portfolio/presentation/portfolio-page/`.
- Testes específicos para disponibilidade individual, ausência total e fallback de
  idioma.

Não criar uma nova feature de domínio, rota pública, serviço global, repository ou
componente compartilhado. A arquitetura existente já oferece o local adequado para uma
seção da página pública.

## 4. Mudança de dados/banco (se houver)

Não haverá migration nem alteração de schema nesta feature.

O contrato utilizará as tabelas genéricas já existentes:

- `portfolio_texts` para as chaves estáveis dos conteúdos;
- `portfolio_text_translations` para os textos em `pt-BR` e `en`;
- `PortfolioContentService.loadCopy()` para carregamento remoto e composição com o
  conteúdo local.

Cada categoria será representada por uma chave independente. A presença de conteúdo
aprovado nessa chave determina se o resultado pode ser exibido. Os valores, unidades e
contextos não serão inventados durante a implementação; cada resultado só poderá ser
incluído depois da aprovação explícita de Marcos.

Rollback: remover a seção, as chaves e os estilos da feature, preservando o contrato
existente de conteúdo e as migrations já aplicadas. Não editar nem reverter migrations
existentes.

## 5. Sequência de implementação

Executar uma tarefa por vez, na ordem de `tarefas.md`. Nenhuma tarefa deve ser marcada
como concluída sem a verificação descrita e sem confirmar que não houve regressão na
página pública existente.

### Fase 1 — Base

1. Confirmar os pontos de integração existentes na página pública, no serviço de
   conteúdo, no serviço de idioma e na navegação.
2. Definir as chaves estáveis da seção e os contratos de texto sem acrescentar valores
   não aprovados.
3. Confirmar quais resultados possuem conteúdo aprovado para a rodada; categorias sem
   aprovação devem continuar ausentes.

### Fase 2 — Lógica principal

1. Implementar a seleção independente das quatro categorias.
2. Renderizar somente os resultados disponíveis e ocultar a seção quando nenhum estiver
   disponível.
3. Reutilizar a seleção de idioma existente, com fallback independente para o conteúdo
   original de cada resultado.

### Fase 3 — Interface

1. Integrar a seção à página única e à navegação existente, sem criar nova rota.
2. Apresentar os resultados de maneira objetiva e contextualizada, preservando conteúdo
   aprovado e anonimização.
3. Aplicar estilos locais e validar o comportamento responsivo nas viewports já usadas
   pelo projeto.

### Fase 4 — Testes

1. Testar a seção com as quatro categorias disponíveis.
2. Testar disponibilidade parcial e ausência total de resultados.
3. Testar troca de idioma e fallback por resultado.
4. Executar regressão da página pública, navegação, idioma, build e suíte de testes.

### Fase 5 — Entrega (deploy/rollback)

1. Comparar Spec, plano, tarefas, código e testes.
2. Revisar que nenhum valor ou afirmação não aprovado foi incluído.
3. Validar preview, procedimento de rollback e ausência de alterações fora do escopo.
4. Submeter a feature para revisão e aprovação de Marcos antes de qualquer deploy.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Merece Registro de Decisão? |
|---|---|---|---|---|
| Inclusão de resultado sem valor, unidade ou contexto aprovado | Média | Alto | Tratar o conteúdo aprovado como pré-condição; revisar cada resultado antes de adicioná-lo | Não; é um portão de conteúdo da própria Spec |
| Alteração da navegação quebrar IDs ou destinos existentes | Média | Alto | Manter IDs atuais, adicionar um ID estável para a seção e cobrir todos os destinos em teste | Não; é uma mudança local e reversível |
| Chaves locais e remotas divergirem | Média | Médio | Definir um contrato único de chaves, testar carregamento remoto e manter fallback local por campo | Não; usa o contrato já aprovado da integração |
| Apenas parte dos resultados estar disponível e a seção ficar vazia ou incoerente | Média | Médio | Filtrar cada categoria independentemente e testar disponibilidade parcial e total | Não; comportamento já definido na Spec |
| O formato de texto simples deixar de atender a uma futura necessidade de campos estruturados | Baixa | Alto | Não criar tabela ou modelo novo agora; se a implementação exigir nova entidade, parar e propor ADR antes de alterar a arquitetura | Sim, caso seja necessário mudar o contrato de dados ou criar nova tabela |
| Estilos da nova seção causarem overflow ou regressão visual | Média | Médio | Manter estilos no domínio da página, reutilizar padrões existentes e verificar desktop/móvel | Não; decisão reversível |

Não há Registro de Decisão obrigatório para o plano atual. Um ADR em
`spec/02-arquitetura/DECISAO_TEMPLATE.md` só deverá ser criado se a implementação
demonstrar que o contrato genérico de textos não atende aos resultados sem uma nova
entidade, migration ou limite arquitetural.

## 7. Perguntas abertas antes de começar

- Não há perguntas de produto pendentes na Spec aprovada.
- É pré-condição de conteúdo que Marcos forneça ou aprove os valores, unidades e
  contextos de cada resultado antes de o respectivo item ser incluído na página.
- A implementação não deve usar placeholders apresentados como resultados reais.
