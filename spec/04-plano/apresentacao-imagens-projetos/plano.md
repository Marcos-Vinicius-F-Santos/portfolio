# Plano de Implementação — Apresentação pública de imagens de projetos

Spec relacionada: `spec/03-features/apresentacao-imagens-projetos/spec.md`  
Status: Aprovado

## 1. Resumo técnico

A feature reutilizará o contrato `PortfolioProject.images` e o snapshot publicado já
consumido pela aplicação. A página única passará a renderizar uma capa por card,
começando pela primeira imagem por `display_order` e tentando as próximas quando houver
falha de carregamento. A página de detalhes manterá a galeria existente, com regressão
de acessibilidade, fallback e responsividade.

O enquadramento da capa será implementado somente com o estilo da apresentação pública,
usando uma área visual fixa de `600 × 320 px` e preservando a proporção da imagem. Não
haverá alteração de schema, Storage, policies, grants, upload, publicação ou fonte de
dados.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` | Controlar a seleção ordenada da capa e as tentativas seguintes após falha | Médio: estado de falha pode ser compartilhado entre cards se não for indexado por projeto |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` | Adicionar a imagem representativa ao card do projeto | Médio: card sem imagem e imagem quebrada não podem interromper o conteúdo textual |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss` | Criar enquadramento fixo, sem distorção, com comportamento móvel | Médio: `object-fit`/dimensões inadequados podem cortar informação ou gerar overflow |
| `src/app/features/portfolio/presentation/projects/project-detail.html` | Preservar e, se necessário, ajustar alt/fallback da galeria existente | Médio: alteração pode regredir a galeria já funcional |
| `src/app/features/portfolio/presentation/projects/project-detail.scss` | Apenas ajustes necessários para validar o layout responsivo existente | Baixo |
| `src/app/features/portfolio/presentation/portfolio-page.spec.ts` | Cobrir capa, ordenação, fallback e ausência de imagem | Médio: testes precisam representar múltiplos projetos e múltiplas imagens |
| `src/app/features/portfolio/presentation/projects/project-detail.spec.ts` | Cobrir ordem, alt, imagem ausente e falha da galeria | Médio |
| `src/app/features/portfolio/content/` e snapshot publicado | Somente verificação do contrato existente; nenhuma alteração prevista | Alto se o leitor público passar a consumir uma fonte diferente da publicada |

## 3. Componentes novos

Nenhum componente novo é necessário nesta rodada. A arquitetura existente por domínio já
possui `PortfolioPage`, `ProjectDetail` e o modelo de projeto; a apresentação da capa
será adicionada ao componente da página única.

Se a lógica de imagem ficar complexa demais para o componente atual, a criação de um
componente local de mídia de projeto deverá ser justificada antes de ser feita e manterá
o mesmo contrato `PortfolioProjectImage`.

## 4. Mudança de dados/banco (se houver)

Não haverá mudança de dados ou banco.

Serão reutilizados:

- `PortfolioProject.images`;
- as referências de imagens do snapshot publicado;
- a ordem `displayOrder`/`display_order`;
- as URLs já resolvidas pelo leitor público.

Não criar migration, tabela, bucket, policy, grant, RPC ou fluxo de upload para esta
feature. O rollback consiste em remover a renderização da capa e os estilos/testes
associados, preservando o leitor e os dados existentes.

## 5. Sequência de implementação

### Fase 1 — Base

1. Confirmar a Spec e congelar as decisões de seleção, fallback e enquadramento.
2. Inventariar o contrato público já carregado e os testes existentes de projetos,
   garantindo que a implementação não altere a fonte de dados nem o fluxo editorial.
3. Registrar a ausência de migration e a necessidade de regressão da galeria de detalhes.

### Fase 2 — Lógica principal

1. Implementar a seleção da primeira imagem por `display_order` para cada projeto.
2. Implementar o estado de imagens que falharam por projeto, permitindo tentar a próxima
   imagem publicada na ordem sem afetar outros cards.
3. Manter a filtragem e a leitura exclusivamente pelo conteúdo publicado já fornecidas
   pelo serviço atual.

### Fase 3 — Interface

1. Adicionar a área de capa ao card da página única somente quando houver uma imagem
   candidata.
2. Aplicar enquadramento fixo, `object-fit` sem distorção, texto alternativo e estados
   sem imagem/fallback.
3. Validar a galeria da página de detalhes em desktop e mobile, alterando apenas o que
   for necessário para cumprir a Spec sem remover funcionalidades atuais.

### Fase 4 — Testes

1. Testar card com uma imagem, várias imagens e ordenação por `display_order`.
2. Testar tentativa da próxima imagem após erro da primeira.
3. Testar projeto sem imagens, alt text, conteúdo publicado e preservação dos dados
   textuais.
4. Testar galeria de detalhes, falha de imagem, abertura individual e mudança de idioma.
5. Executar verificação visual em desktop e viewport móvel, incluindo ausência de
   rolagem horizontal e estabilidade do enquadramento.

### Fase 5 — Entrega (deploy/rollback)

1. Atualizar o checklist/plano de verificação da feature com as evidências dos testes.
2. Comparar Spec ↔ plano ↔ tarefas ↔ código ↔ testes e registrar qualquer divergência.
3. Revisar o diff e o comportamento público antes de qualquer deploy.
4. Em caso de rollback, remover somente a apresentação da capa e seus estilos, mantendo o
   contrato de mídia, a galeria existente e os dados publicados.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar |
|---|---|---|---|
| Falha da capa de um projeto afetar outro card | Média | Alto | Indexar o estado de falha por `project.id` e testar vários cards simultaneamente |
| Enquadramento fixo cortar uma parte importante da imagem | Média | Médio | Usar `object-fit: cover` somente dentro de uma área definida e validar visualmente; registrar eventual ajuste de posicionamento |
| Projeto sem imagem apresentar espaço vazio ou elemento quebrado | Média | Médio | Renderização condicional, fallback explícito e teste de ausência de imagem |
| Alteração da galeria quebrar detalhes já publicados | Baixa | Alto | Preferir nenhuma mudança estrutural no detalhe e executar regressão dos testes existentes |
| Mídia de rascunho aparecer na página pública | Baixa | Crítico | Não alterar o leitor de snapshot; validar que os testes usam somente entidades publicadas |
| Layout móvel criar overflow ou deslocamento excessivo | Média | Médio | Definir dimensões responsivas, `max-width: 100%`, `aspect-ratio` e teste em viewport móvel |

Nenhum risco identificado exige novo Registro de Decisão arquitetural: as decisões de
dados, publicação e ciclo de vida de mídia já estão registradas; as decisões restantes
são de apresentação e foram incorporadas à Spec.

## 7. Perguntas abertas antes de começar

Não há perguntas abertas bloqueantes. A Spec foi aprovada e o enquadramento fixo está
definido como `600 × 320 px`, sem distorção da imagem.
