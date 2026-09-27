# Plano de Implementação — Habilidades, formação acadêmica e contato

Spec relacionada: `spec/03-features/habilidades-formacao-contato/spec.md`  
Arquitetura: `spec/02-arquitetura/ARQUITETURA.md`  
Status: Rascunho

## 1. Resumo técnico

A feature será implementada dentro da página pública única já existente, reutilizando
`src/app/features/portfolio/presentation/` para a composição visual e
`src/app/features/portfolio/content/` para modelos, catálogo de conteúdo, traduções,
links de contato e leitura dos currículos.

A seção atual com o destino `stack-tecnica` será completada e exibida com o título
“Habilidades”, preservando o destino existente para não quebrar a navegação atual ou
links externos. A formação acadêmica e o contato serão adicionados ao mesmo fluxo de
seções, com contato como última seção da página.

As habilidades, a formação e os destinos de contato serão mantidos no domínio de
conteúdo existente, pois estão definidos pela Spec aprovada e a edição administrativa
destes itens está fora do escopo desta rodada. Não será criada nova feature, rota,
serviço global ou biblioteca de ícones. Os símbolos oficiais públicos serão adicionados
como recursos estáticos em `src/assets/`, estrutura já prevista pela arquitetura.

Os currículos reutilizarão a tabela `portfolio_files`, o bucket `curricula` e o método
`PortfolioContentService.getCurriculum()` já existentes. A aplicação pública apenas
lerá as referências; o fluxo de upload e substituição continuará pertencendo à área
administrativa ou à etapa própria de gestão de mídia.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/portfolio/content/portfolio-content.ts` | Expandir o contrato de textos e o catálogo local bilíngue para títulos, labels e conteúdo das novas seções | Médio: uma chave ausente pode afetar o fallback ou a alternância de idioma |
| `src/app/features/portfolio/content/portfolio-translations.ts` | Adicionar traduções em inglês para habilidades, formação, contato e currículo | Médio: traduções incompletas podem deixar labels em português |
| `src/app/features/portfolio/content/portfolio-content.models.ts` | Criar os tipos de domínio para categorias de habilidades, formação e links de contato | Baixo: alteração interna e coberta por testes |
| `src/app/features/portfolio/content/portfolio-content.service.ts` | Reutilizar e endurecer `getCurriculum()` para aceitar somente registros de currículo PDF válidos | Alto: uma validação incorreta pode ocultar ou expor um currículo inválido |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` | Completar a navegação, carregar o currículo do idioma atual e fornecer o estado das novas seções | Alto: a página e a alternância de idioma já dependem deste estado |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` | Substituir o texto incompleto da Stack por Habilidades e renderizar formação e contato | Alto: alteração no renderizador genérico pode quebrar seções existentes |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss` | Adicionar estilos responsivos para categorias, símbolos, labels e links | Médio: risco de overflow ou regressão visual em mobile |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts` | Atualizar expectativas de navegação e cobrir as novas seções, links e downloads | Alto: os testes atuais preservam o contrato de `stack-tecnica` |
| `src/app/features/portfolio/content/portfolio-content.service.spec.ts` | Cobrir currículo por locale, PDF válido, ausência e registro inválido | Médio: validação insuficiente pode aceitar arquivo que não atende à Spec |
| `src/app/features/portfolio/content/portfolio-content.spec.ts` | Cobrir o catálogo de habilidades, formação, contatos e fallback bilíngue | Baixo: testes de conteúdo evitam divergência silenciosa |
| `src/assets/` | Adicionar os símbolos oficiais públicos e o símbolo de currículo, sem criar nova camada arquitetural | Baixo: recursos estáticos podem precisar ser substituídos se a origem oficial mudar |
| `supabase/migrations/<timestamp>_restrict_curriculum_files_to_pdf.sql` | Restringir o contrato dos currículos a `application/pdf` e configurar o bucket `curricula` para PDF | Alto: registros ou uploads incompatíveis podem ser rejeitados |

Não haverá alteração nas tabelas de experiências, projetos ou traduções existentes além
da migration específica do contrato dos currículos. Componentes de apresentação não farão
chamadas diretas ao Supabase.

## 3. Componentes novos

- Tipos de domínio para categorias de habilidades, formação acadêmica e links de contato,
  dentro de `portfolio/content`.
- Catálogo aprovado de habilidades, com as seis categorias e tecnologias da Spec do
  Produto.
- Catálogo bilíngue de formação e labels das novas seções.
- Catálogo de contatos com os destinos confirmados para LinkedIn, GitHub, e-mail e
  telefone.
- Estado da página para o currículo correspondente ao idioma selecionado.
- Marcação da seção de contato com símbolos, labels abaixo dos símbolos e links de
  currículo.
- Recursos estáticos dos símbolos na pasta `src/assets/` existente.
- Testes unitários do conteúdo e do serviço, além dos testes da página pública.

Não criar uma nova pasta de domínio, rota, componente global, serviço global ou tabela.
A arquitetura existente já define `portfolio/presentation` e `portfolio/content` como
os limites corretos para esta feature.

## 4. Mudança de dados/banco (se houver)

A tabela `public.portfolio_files`, a restrição única `(file_type, locale)`, o bucket
`curricula`, as políticas de leitura pública e o método `getCurriculum()` já existem.
Não será criada nova tabela.

Será criada uma migration versionada para:

- garantir que registros de `file_type = 'curriculum'` usem `mime_type =
  'application/pdf'`;
- configurar o bucket `curricula` para aceitar somente `application/pdf`;
- preservar a restrição de no máximo um currículo por locale (`pt-BR` e `en`);
- não inserir os dois arquivos reais nesta etapa, pois Marcos fará o upload posteriormente.

Antes da aplicação, os registros existentes devem ser auditados. Se houver arquivo não
PDF, a migration não deve descartá-lo silenciosamente; o item deve ser corrigido ou
substituído por um arquivo aprovado antes da aplicação.

Rollback: remover a restrição de MIME criada pela migration e restaurar a configuração
anterior do bucket `curricula`, sem apagar arquivos ou registros. A migration e o
rollback devem ser verificados antes da aprovação da feature.

A existência dos dois arquivos — exatamente um PDF em português brasileiro e um PDF em
inglês — será verificada como dado de entrega depois do upload. A ausência temporária
antes desse upload deve continuar sendo tratada como recurso indisponível, sem quebrar a
página.

## 5. Sequência de implementação

Executar uma tarefa por vez, na ordem de `tarefas.md`. Nenhuma tarefa deve ser marcada
como concluída sem a verificação descrita e sem a checagem de regressão da página pública.

### Fase 1 — Base

1. Confirmar os pontos de integração existentes e preservar o destino `stack-tecnica`.
2. Expandir os tipos e o catálogo do domínio de conteúdo para habilidades, formação e
   contato, mantendo o conteúdo fora do template.
3. Adicionar os símbolos oficiais públicos e os recursos necessários em `src/assets/`,
   sem introduzir dependência de ícones.
4. Criar a migration que restringe os currículos a PDF, com auditoria prévia dos dados e
   rollback definido.

### Fase 2 — Lógica principal

1. Ajustar as chaves de conteúdo e o fallback português/inglês para os títulos, labels e
   categorias das novas seções.
2. Validar `getCurriculum()` para retornar somente o arquivo de currículo do locale
   selecionado, com URL pública e MIME PDF válidos; ausência ou erro deve retornar estado
   seguro.
3. Integrar o carregamento do currículo ao ciclo de vida existente da página e repetir o
   carregamento quando o visitante alternar o idioma.
4. Atualizar a navegação sem alterar o destino `stack-tecnica`, mantendo as seções atuais
   e adicionando formação e contato, com contato ao final.

### Fase 3 — Interface

1. Substituir o corpo incompleto de “Stack técnica” pela seção “Habilidades”, renderizando
   as seis categorias e as tecnologias aprovadas.
2. Renderizar a formação acadêmica com as duas pós-graduações e a instituição indicada.
3. Renderizar a seção de contato no final, com símbolo oficial, label abaixo e destino
   funcional para cada canal.
4. Renderizar os acessos aos dois currículos usando o arquivo correspondente ao idioma
   atual; quando o arquivo estiver ausente, não exibir sucesso falso.
5. Aplicar estilos responsivos e marcação semântica, preservando o layout vertical,
   navegabilidade, legibilidade e os anchors existentes.

### Fase 4 — Testes

1. Cobrir o catálogo bilíngue, as categorias e a formação no domínio de conteúdo.
2. Cobrir `getCurriculum()` para português, inglês, ausência, erro, MIME inválido e
   atualização após troca de idioma.
3. Cobrir o caminho feliz da página: seções, ordem, labels, símbolos, destinos, PDFs e
   preservação da navegação atual.
4. Cobrir o caminho de erro: currículo indisponível, destino ausente ou inválido e
   página ainda utilizável.
5. Executar testes, build e verificação visual em desktop e mobile, incluindo alternância
   de idioma e regressão das seções existentes.

### Fase 5 — Entrega

1. Fazer o upload autorizado dos dois PDFs — um `pt-BR` e um `en` — sem versioná-los no
   repositório, e validar seus registros e URLs públicas.
2. Comparar Spec, plano, tarefas, código e testes, incluindo a migration e seu rollback.
3. Revisar o preview e documentar como reverter somente as alterações desta feature.
4. Aguardar a revisão e aprovação de Marcos antes de qualquer deploy.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Registro de decisão? |
|---|---|---|---|---|
| Alterar o título da Stack e sua renderização pode quebrar a navegação ou links que usam `#stack-tecnica` | Alta | Alto | Preservar o `targetId` `stack-tecnica`, alterar apenas o título exibido e atualizar testes de navegação | Não; preservação reversível do contrato existente |
| A migration de PDF pode rejeitar um registro ou upload incompatível | Média | Alto | Auditar registros antes da migration, restringir MIME no banco e no bucket, testar rollback e não apagar dados automaticamente | Sim; registrar a decisão do contrato de arquivos PDF em `DECISAO_TEMPLATE.md` antes da migration |
| Currículo ausente ou erro no Storage pode produzir link quebrado | Média | Alto | Validar registro, locale, MIME e URL no serviço; ocultar ou desabilitar acesso sem indicar sucesso; testar AC-005 | Não; comportamento já definido na Spec |
| Troca de idioma pode deixar habilidades, formação, labels ou currículo em locale incorreto | Média | Médio | Centralizar seleção no serviço de idioma existente, usar fallback por campo e testar troca nos dois sentidos | Não; segue a decisão existente de idioma |
| Inclusão de novas seções no renderizador atual pode afetar experiências, resultados ou projetos | Média | Alto | Manter o fluxo genérico, adicionar ramificações isoladas, preservar IDs e executar regressão completa | Não; mudança local e reversível |
| Símbolos oficiais e labels podem causar overflow ou perder legibilidade em telas estreitas | Média | Médio | Usar recursos estáticos locais, CSS responsivo e verificação visual em mobile e desktop | Não; decisão visual reversível |
| Catálogo fixo de habilidades e contatos poderá exigir migração futura para edição administrativa | Média | Médio | Mantê-lo no domínio `content`, fora do template, e registrar como evolução separada; não criar schema prematuramente | Não nesta rodada; a edição administrativa está fora do escopo aprovado |

## 7. Perguntas abertas antes de começar

Não há perguntas de produto abertas para iniciar a implementação.

Há duas dependências operacionais para a entrega:

- os dois PDFs reais deverão ser enviados posteriormente por fluxo autorizado, um para
  `pt-BR` e outro para `en`, antes da validação final do download;
- o contrato de armazenamento em PDF deve ser registrado em um Registro de Decisão antes
  da aplicação da migration, conforme o risco identificado na seção 6.
