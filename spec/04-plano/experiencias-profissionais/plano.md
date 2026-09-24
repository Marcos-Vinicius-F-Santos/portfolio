# Plano de Implementação — Experiências profissionais

Spec relacionada: `spec/03-features/experiencias-profissionais/spec.md`  
Arquitetura: `spec/02-arquitetura/ARQUITETURA.md`  
Status: Rascunho

## 1. Resumo técnico

A feature será implementada dentro da página pública única já existente, reutilizando
`src/app/features/portfolio/presentation/` e o contrato de conteúdo em
`src/app/features/portfolio/content/`.

O mock atual de experiências será substituído pela leitura de
`PortfolioContentService.listExperiences()`, pela ordenação cronológica definida na
Spec e pela renderização dos campos estruturados. A navegação e a seção de experiências
serão renderizadas somente quando houver experiências disponíveis.

As tabelas `portfolio_experiences` e `portfolio_experience_translations` já existem e
já suportam período, contexto, cargo, responsabilidades, decisões técnicas e
resultados. Como a decisão aprovada separa contexto e nome, a coluna persistida
`company_context` deverá ser renomeada para `name` por migration versionada antes da
implementação. O contrato de domínio deve expor esse valor como `name`, sem criar uma
nova tabela ou rota.

Não será criada uma nova feature de domínio, componente global ou camada de acesso ao
banco. A arquitetura existente já possui o local correto para uma seção da página
pública e o serviço existente já centraliza a leitura do Supabase. A única alteração de
schema será a migration versionada para separar semanticamente o nome do contexto.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/portfolio/content/portfolio-content.models.ts` | Ajustar o contrato de `PortfolioExperience` para representar explicitamente o nome da empresa e os campos exibidos | Médio: consumidores futuros podem depender do nome atual `companyContext` |
| `src/app/features/portfolio/content/portfolio-content.service.ts` | Reutilizar `listExperiences()`, mapear o nome da empresa, garantir a ordenação necessária e manter o retorno seguro em caso de erro | Alto: uma ordenação ou mapeamento incorreto altera a trajetória apresentada |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` | Carregar experiências, controlar a visibilidade da seção/navegação e preparar a coleção para a interface | Alto: a página hoje sempre exibe o mock e os testes esperam esse destino |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` | Substituir o texto mockado pela apresentação estruturada das experiências | Médio: uma condição incorreta pode exibir conteúdo vazio ou ocultar seções existentes |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss` | Estilizar a lista de experiências dentro do layout responsivo existente | Médio: risco de overflow, perda de legibilidade ou regressão visual |
| `src/app/features/portfolio/content/portfolio-content.service.spec.ts` | Cobrir mapeamento, ordenação, período e retorno seguro do serviço | Médio: testes insuficientes podem aceitar dados fora da regra da Spec |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts` | Atualizar expectativas do mock e cobrir caminho feliz, ordenação e ausência da seção | Alto: os testes atuais assumem que `#experiencias` sempre existe |

Não há alteração prevista em autenticação, área administrativa, Storage, RLS ou nas
outras seções públicas. A leitura continuará passando pelo serviço do domínio de
conteúdo, sem chamadas diretas ao Supabase nos componentes de apresentação.

## 3. Componentes novos

- Contrato de apresentação estruturada para experiências dentro do domínio de conteúdo
  já existente.
- Estado derivado da página para a coleção de experiências e para a visibilidade da
  seção e do item de navegação.
- Template da lista de experiências com período, empresa, cargo, contexto,
  responsabilidades, decisões técnicas e resultados.
- Testes específicos do serviço e da página pública.

Não criar uma nova pasta de domínio, rota pública, serviço global, componente
compartilhado ou repository. A subdivisão `portfolio/presentation` já é o limite
arquitetural definido para essa seção.

## 4. Mudança de dados/banco (se houver)

Haverá uma migration versionada para alinhar o schema ao contrato aprovado:

- criar uma migration com nome no padrão `<timestamp>_rename_company_context_to_name.sql`;
- renomear `public.portfolio_experiences.company_context` para
  `public.portfolio_experiences.name`, preservando os valores, a obrigatoriedade e as
  demais constraints existentes;
- revisar os registros existentes para garantir que `name` contenha o nome aprovado da
  empresa e que o campo traduzido `context` continue contendo somente o contexto;
- atualizar o modelo e o serviço para ler `name` e não depender de
  `company_context`.

A migration não deve inventar nomes nem sobrescrever conteúdo aprovado. Se os valores
existentes forem descrições de contexto, a correção deve seguir um caminho de dados
aprovado antes da publicação.

Rollback: executar a migration reversa para renomear `name` de volta para
`company_context`, restaurar o contrato de código correspondente e reverter a
renderização da feature. A migration está aprovada e deve possuir rollback verificável.

## 5. Sequência de implementação
Executar uma tarefa por vez, na ordem de `tarefas.md`. Nenhuma tarefa deve ser marcada
como concluída sem a verificação descrita e sem checar a regressão da página pública.

### Fase 1 — Base

1. Confirmar os pontos de integração existentes: modelo, serviço, página, navegação e
   testes.
2. Criar a migration versionada que renomeia `company_context` para `name`, preservando
   dados e constraints, e validar os registros aprovados.
3. Registrar ou aprovar o Registro de Decisão sobre a publicação do nome da empresa e do
   cargo, considerando que o limite anterior de anonimização foi alterado.
4. Fixar `start_date` como a data que define “mais recente” e `display_order` como o
   critério de desempate pela ordem de inclusão.
### Fase 2 — Lógica principal

1. Ajustar o contrato de experiência e o mapeamento do serviço sem criar uma nova camada
   de acesso ao Supabase.
2. Carregar as experiências no ciclo de vida já usado pela página, inclusive quando o
   idioma for alterado.
3. Ordenar da mais recente para a mais antiga e usar a ordem de inclusão no desempate,
   conforme a decisão confirmada na Fase 1.
4. Derivar a visibilidade da seção e da navegação a partir da existência de experiências;
   em erro de leitura ou coleção vazia, não renderizar a seção.

### Fase 3 — Interface

1. Substituir o parágrafo mockado pela lista estruturada dentro da seção `experiencias`.
2. Renderizar o período em `MM/YYYY`, o nome da empresa, o cargo, o contexto e as listas
   de responsabilidades, decisões técnicas e resultados.
3. Aplicar estilos locais e validar a leitura em telas estreitas e largas, preservando a
   página única e as demais seções.

### Fase 4 — Testes

1. Testar o mapeamento do serviço, a ordenação, o formato do período e o retorno seguro
   em erro.
2. Testar o caminho feliz com todas as experiências e os campos obrigatórios.
3. Testar o caminho de erro sem experiências, garantindo que a seção e seu item de
   navegação não apareçam.
4. Executar regressão da navegação, alternância de idioma, resultados profissionais,
   build e suíte de testes existente.

### Fase 5 — Entrega (deploy/rollback)

1. Comparar Spec, plano, tarefas, código e testes.
2. Revisar que os nomes das empresas e cargos publicados são os aprovados e que não há
   informações confidenciais.
3. Validar preview, procedimento de rollback e ausência de alterações fora do escopo.
4. Submeter o resultado à revisão e aprovação de Marcos antes de qualquer deploy.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Merece Registro de Decisão? |
|---|---|---|---|---|
| Publicação de nome de empresa e cargo altera o limite anterior de anonimização | Média | Alto | Registrar a mudança no produto e na arquitetura, revisar os registros antes da publicação e exigir aprovação de Marcos | Sim; decisão de exposição pública com impacto de privacidade e reversão de conteúdo |
| `company_context` conter contexto genérico em vez do nome da empresa | Média | Alto | Renomear a coluna para `name` por migration, validar os valores existentes e corrigir qualquer dado não aprovado antes da publicação | Sim; migration e contrato de dados precisam ser rastreáveis |
| Critério de “mais recente” ficar ambíguo em experiências atuais ou sobrepostas | Média | Alto | Confirmar a data-base antes da lógica; cobrir ordenação e desempate com fixtures determinísticas | Não, salvo se exigir mudança de schema ou regra de produto |
| A seção e a navegação atuais sempre renderizam o mock | Alta | Médio | Alterar a visibilidade de forma conjunta e atualizar testes de navegação, ausência e regressão | Não; mudança local e reversível |
| Dados traduzidos incompletos produzirem cards vazios | Média | Médio | Validar os campos obrigatórios antes da publicação e cobrir fixtures completas em `pt-BR` e `en` | Não; regra já está na Spec |
| Mudança no contrato `companyContext` afetar consumidor futuro | Baixa | Médio | Confirmar consumidores com busca no repositório e manter o mapeamento concentrado no serviço | Não; contrato interno e reversível |
| Estilos da lista causarem overflow ou reduzir legibilidade em mobile | Média | Médio | Manter estilos no componente existente e testar viewports desktop e mobile | Não; decisão visual reversível |

## 7. Perguntas abertas antes de começar

- As decisões de produto estão confirmadas: o nome da empresa e o cargo podem ser
  publicados quando aprovados por Marcos.
- As decisões de dados estão confirmadas: `start_date` define a experiência mais recente,
  `display_order` representa a ordem de inclusão e existem registros e traduções aprovados
  para todos os campos obrigatórios.
- A migration para renomear `company_context` para `name` está aprovada e deve ser
  executada somente com seu caminho de rollback validado.