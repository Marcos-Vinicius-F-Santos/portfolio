# Spec da Feature — Alinhamento Fiel dos Textos dos Projetos e Correção da Publicação Editorial

Status: Em elaboração para aprovação de João Vitor  
Data: 20/10/2026  
Feature: `alinhamento-textos-projetos-e-publicacao-editorial`  

---

## 1. Contexto e Problema

O portfólio possui 6 projetos cadastrados. Durante a revisão de conteúdo, João Vitor forneceu os textos exatos e auditados de **Descrição**, **Contexto**, **Solução** e **Resultados** para os 6 projetos, eliminando afirmações não comprovadas (como "nota máxima", "tempo de resposta", "latência < 25ms" ou "erradicação de esquecimentos").

No entanto, ao editar os campos no painel administrativo:
1. **O site público não refletiu as mudanças:** A tela de detalhe editorial (`/admin/editor/projetos/:id`) apenas salva comandos no **rascunho privado** (`portfolio_editorial.draft`). Como a publicação requer ação explícita em `/admin/editor` (e o banco estava com conflito de revisão antes), o snapshot ativo publicado continuou exibindo a versão desatualizada de 18/10/2026.
2. **O método `saveList` tem limitação estrutural:** No componente `EditorialProjectDetailComponent`, o método `saveList` faz um loop limitado a `Math.min(ids.length, next.length)`. Se o usuário adicionar ou remover linhas (ex: passar de 4 para 3 resultados), o componente ignora as linhas extras e não remove nem adiciona entidades `listItem` via comandos atômicos.

---

## 2. Conteúdo Fiel dos 6 Projetos (Dados Aprovados)

### 2.1. SensorEng — Monitoramento industrial
- **Descrição:** `Plataforma de monitoramento industrial com transmissão de vídeo por múltiplos protocolos, timelapses, detecção de EPIs e objetos por inteligência artificial e visualização georreferenciada de dados de sensores IoT.`
- **Contexto:** `Aplicação monolítica com alto acoplamento e carregamento inicial lento, que precisava exibir múltiplos fluxos de vídeo e informações de sensores sem comprometer o desempenho.`
- **Resultados:**
  1. `Redução de 85% no tamanho do pacote inicial após a modularização da aplicação Angular e a implementação de carregamento sob demanda por rota.`
  2. `Aumento de 60% na agilidade de desenvolvimento de novas telas com uma biblioteca interna de componentes reutilizáveis.`
  3. `Plataforma utilizada por mais de 50 empresas do setor industrial.`

### 2.2. Avante — Sistema ERP
- **Contexto:** `Sistema ERP voltado à gestão empresarial, com necessidade de manutenção contínua, correção de falhas e evolução das funcionalidades utilizadas por diferentes setores.`
- **Solução:** `Desenvolvimento e manutenção de funcionalidades de negócio, correção de problemas na aplicação e no banco de dados e ajustes em consultas SQL conforme as necessidades do sistema.`
- **Resultados:**
  1. `Contribuição para a evolução e manutenção dos módulos de gestão empresarial.`
  2. `Correção de problemas na aplicação e no banco de dados para apoiar a continuidade operacional.`
  3. `Ajustes em consultas SQL e funcionalidades conforme as necessidades dos usuários.`

### 2.3. Plataforma de Gestão de Crédito e OCR
- **Contexto:** `A análise manual de documentos cadastrais e financeiros exigia leitura e transcrição de informações, tornando a triagem de propostas de crédito mais trabalhosa e suscetível a erros.`
- **Resultados:**
  1. `Desenvolvimento de serviços para leitura e extração automatizada de informações documentais.`
  2. `Reconhecimento e classificação de mais de 20 tipos de documentos, incluindo contratos sociais, demonstrativos financeiros, CNHs e documentos veiculares.`
  3. `Integração de recursos de visão computacional ao fluxo de automação de crédito comercial.`

### 2.4. Aplicativo Ponto IFMG
- **Resultados:**
  1. `Automatização da autenticação e do registro de ponto no SUAP por meio do aplicativo mobile.`
  2. `Consulta automatizada ao histórico diário de marcações por web scraping.`
  3. `Implementação de lembretes sonoros programados para ajudar a prevenir esquecimentos de marcação.`

### 2.5. Russian Mastery
- **Descrição:** `Plataforma de aprendizado de russo com repetição espaçada, exercícios interativos de digitação cirílica, gamificação e uma base com mais de 43 mil palavras e sentenças.`
- **Resultados:**
  1. `Base com mais de 43 mil palavras e sentenças, com recursos de apoio à pronúncia e ao aprendizado do vocabulário.`
  2. `Implementação de cache com Redis para otimizar consultas frequentes.`
  3. `Conteinerização da aplicação para facilitar a configuração e execução do ambiente.`

### 2.6. Pipeline de Visão Computacional para Boxe
- **Solução:** `Pipeline que combina detecção de atletas, estimativa de pose e análise de movimentos para automatizar a identificação e contagem de golpes. A solução utiliza regiões de interesse dinâmicas para reduzir o custo computacional e integra um aplicativo mobile a um servidor de processamento de vídeo.`
- **Resultados:**
  1. `Redução de 83,6% no tempo total de processamento por meio da implementação de regiões de interesse dinâmicas.`
  2. `Implementação de mecanismos para detecção e contagem automatizada de golpes e faltas.`
  3. `Desenvolvimento e aprovação do Trabalho de Conclusão de Curso em Ciência da Computação no IFMG.`

---

## 3. Requisitos Funcionais

- **FR-001 (Sincronização de Conteúdo no Banco e Snapshot Ativo):**
  - Atualizar o rascunho e publicar um novo snapshot ativo contendo os textos revisados em `pt-BR` e suas correspondências em `en`.
  - Garantir que a frase `"com nota máxima"` e outras alegações não verificadas sejam permanentemente removidas do snapshot ativo publicado.
- **FR-002 (Correção Dinâmica de Listas no Editorial de Projetos):**
  - No `EditorialProjectDetailComponent`, refatorar `saveList` para que, ao alterar o número de linhas (adição ou remoção), despache comandos atômicos de `add_entity` e `remove_entity` para o rascunho, sincronizando a coleção completa de `listItem`.
- **FR-003 (Feedback e Fluxo de Publicação no Detalhe do Projeto):**
  - Na barra de navegação superior e/ou rodapé de `EditorialProjectDetailComponent`, incluir indicador claro de status do rascunho e um botão/atalho direto para **"Revisar e Publicar Alterações"**, garantindo que o usuário saiba que as alterações precisam ser publicadas para irem ao ar.

---

## 4. Critérios de Aceite (Given / When / Then)

- **CA-01 (Conteúdo Fiel na Página Pública do Projeto):**
  - *Given* que o visitante acessa `/projetos/pipeline-visao-computacional-boxe`,
  - *When* o card de Resultados é renderizado,
  - *Then* o item do TCC exibe `"Desenvolvimento e aprovação do Trabalho de Conclusão de Curso em Ciência da Computação no IFMG."` sem a menção a `"nota máxima"`.
- **CA-02 (Atualização de Todos os 6 Projetos):**
  - *Given* a navegação por qualquer um dos 6 projetos no site público,
  - *When* os cards de Contexto, Solução e Resultados forem visualizados,
  - *Then* os textos correspondem estritamente aos textos auditados nesta especificação.
- **CA-03 (Edição Dinâmica de Listas no Painel):**
  - *Given* o editor de projetos no painel administrativo (`/admin/editor/projetos/:id`),
  - *When* o administrador adiciona uma linha a mais ou apaga uma linha no campo de lista (Resultados, Decisões ou Aprendizados),
  - *Then* as entidades de lista correspondentes são criadas ou removidas no rascunho sem ficarem presas no tamanho original.

