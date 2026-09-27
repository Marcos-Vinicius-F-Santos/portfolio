# Spec da Feature — Gestão de conteúdo pela área administrativa

> **Reconciliação editorial — 2026-09-26:** Salvar passa a alterar rascunho privado; criar/remover/desfazer não publica. Os formulários legados não podem continuar escrevendo diretamente após o corte. A [spec de edição visual](../edicao-visual-rascunho-publicacao/spec.md) prevalece nesses pontos quando implantada. Os requisitos anteriores continuam referência para o comportamento não alterado e a regressão; esta nota não comprova implementação ou testes.

Status: Aprovada  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/admin/content-management/`, integrado aos
serviços de conteúdo definidos em `src/app/features/portfolio/content/`, conforme
`spec/02-arquitetura/ARQUITETURA.md`

## 1. Objetivo

Permitir que Marcos adicione e edite, pela área administrativa protegida, os conteúdos
principais do portfólio: textos, resultados, experiências, projetos, habilidades,
formação e contatos.

As alterações salvas devem ser persistidas e publicadas imediatamente na página pública,
sem exigir uma etapa posterior de publicação.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

A autenticação e a proteção de acesso administrativo com Supabase já foram criadas.
Entretanto, ainda não existe uma área administrativa acessível para gerenciar o conteúdo
do portfólio.

Atualmente, Marcos não consegue adicionar nem editar pela aplicação os textos,
resultados, experiências, projetos, habilidades, formação ou contatos. Esta feature
introduz a área e as operações de gestão desses conteúdos, preservando a autenticação e
a proteção já existentes.

## 3. Requisitos funcionais

### FR-001

QUANDO Marcos acessar a área administrativa autenticada  
O SISTEMA DEVE permitir que ele adicione textos, resultados, experiências, projetos,
habilidades, formação e contatos.

### FR-002

QUANDO existir um texto, resultado, experiência, projeto, habilidade, formação ou contato
gerenciado pelo sistema  
O SISTEMA DEVE permitir que Marcos edite esse conteúdo, em português e em inglês, pela
área administrativa autenticada.

### FR-003

QUANDO Marcos salvar uma adição ou edição de conteúdo pela área administrativa  
O SISTEMA DEVE persistir a alteração no armazenamento definido para o portfólio.

### FR-004

QUANDO uma adição ou edição for salva com sucesso  
O SISTEMA DEVE tornar a alteração imediatamente disponível na página pública
correspondente.

### FR-005

QUANDO uma adição ou edição não puder ser persistida  
O SISTEMA DEVE indicar que o salvamento falhou e NÃO DEVE publicar a alteração como se
ela tivesse sido salva com sucesso.

### FR-006

QUANDO ocorrer uma falha depois que uma alteração tiver sido persistida, mas antes de
ficar disponível na página pública  
O SISTEMA DEVE registrar a falha em um log.

## 4. Regras de negócio

### BR-001

A gestão de conteúdo desta feature deve estar disponível somente pela área administrativa
autenticada e protegida já definida para Marcos.

### BR-002

Os tipos de conteúdo administrados por esta feature são exclusivamente: textos,
resultados, experiências, projetos, habilidades, formação e contatos.

### BR-003

Uma alteração somente deve ser considerada publicada quando o salvamento tiver sido
concluído com sucesso.

### BR-004

Não haverá uma etapa separada de rascunho, revisão ou publicação posterior nesta
feature. O salvamento bem-sucedido publica imediatamente a alteração.

### BR-005

A página pública deve continuar sendo somente leitura para visitantes. A escrita de
conteúdo deve ocorrer pela área administrativa protegida.

### BR-006

As regras de segurança do Supabase devem continuar restringindo a escrita ao
administrador autorizado, conforme a arquitetura e a feature de autenticação.

### BR-007

Quando houver conteúdo traduzível, a área administrativa deve permitir a gestão das
versões em português e em inglês.

### BR-008

Os campos obrigatórios para cada tipo de conteúdo devem seguir as specs já aprovadas dos
respectivos domínios.

### BR-009

Quando a ordem de exibição existir para um tipo de conteúdo, Marcos deve poder alterá-la
pela área administrativa.

### BR-010

Falhas ocorridas depois da persistência devem ser registradas em log para permitir sua
identificação e correção operacional.

### BR-011

Adicionar textos e resultados significa adicionar ou editar itens dentro das seções e
chaves públicas já existentes. Esta feature não cria novos blocos públicos nem altera o
layout principal para acomodar conteúdo arbitrário.

## 5. Critério de aceite

### AC-001 — caminho feliz: adicionar conteúdo

Dado que Marcos esteja autenticado e consiga acessar a área administrativa  
Quando ele adicionar um texto, resultado, experiência, projeto, habilidade, formação ou
contato e salvar a alteração  
Então o sistema deve persistir o conteúdo e disponibilizá-lo imediatamente na página
pública correspondente.

### AC-002 — caminho feliz: editar conteúdo

Dado que exista um texto, resultado, experiência, projeto, habilidade, formação ou
contato já persistido  
Quando Marcos editar esse conteúdo pela área administrativa e salvar a alteração  
Então o sistema deve persistir a nova versão e apresentá-la imediatamente na página
pública correspondente.

### AC-003 — caminho feliz: editar os idiomas e a ordem de exibição

Dado que um conteúdo possua versões em português e inglês e que exista uma ordem de
exibição aplicável  
Quando Marcos editar as versões e alterar a ordem pela área administrativa  
Então o sistema deve persistir as alterações e apresentá-las imediatamente na página
pública conforme o idioma e a ordem salvos.

### AC-004 — caminho de erro: falha ao salvar

Dado que Marcos tente adicionar ou editar um conteúdo e que a persistência esteja
indisponível ou seja recusada  
Quando ele salvar a alteração  
Então o sistema deve indicar a falha, não deve informar que a alteração foi publicada e
a página pública não deve passar a exibir a alteração não persistida.

### AC-005 — caminho de erro: falha após persistência

Dado que uma alteração tenha sido persistida, mas não tenha ficado disponível na página
pública  
Quando o sistema detectar a falha  
Então deve registrar a falha em um log para permitir sua identificação e correção.

## 6. Casos de erro / edge cases

- Supabase indisponível durante o salvamento → a operação deve ser indicada como falha e
  não deve ser tratada como publicada.
- Operação de escrita recusada pelas políticas de segurança → o conteúdo não deve ser
  alterado nem publicado.
- Falha depois do envio da alteração, mas antes da confirmação do salvamento → o sistema
  não deve indicar sucesso sem confirmação da persistência.
- Falha depois da persistência, mas antes da disponibilidade pública → a falha deve ser
  registrada em log para permitir identificação e correção.
- Conteúdo existente que não possa ser carregado para edição → Marcos não deve sobrescrevê-lo
  sem que a operação de leitura tenha sido concluída corretamente.

## 7. Fora de escopo desta feature

- Criação ou alteração da autenticação e da proteção da área administrativa.
- Cadastro de administradores adicionais, papéis ou permissões avançadas.
- Exclusão de conteúdos.
- Upload ou gerenciamento de imagens de projetos e arquivos de currículo.
- Workflow de rascunho, revisão, aprovação ou publicação posterior.
- Alteração do layout principal ou criação de uma nova página pública.
- Sincronização automática com LinkedIn, GitHub ou outros serviços externos.
- Definição de novos campos de conteúdo que não estejam previstos nas specs dos
  respectivos domínios.
- Criação de novos blocos públicos ou alteração do layout para exibir conteúdo arbitrário.
- Alteração manual de dados de produção sem migration quando houver mudança de schema.

## 8. Suposições e perguntas abertas

- [x] **Suposição confirmada por Marcos:** a autenticação e a proteção com Supabase já
      existem, mas ainda não há uma área administrativa acessível para gestão de
      conteúdo.
- [x] **Suposição:** a área administrativa reutilizará a autenticação, a autorização e
      os serviços do Supabase já definidos, sem criar um mecanismo paralelo de acesso.
- [x] **Suposição:** “salvar” significa concluir a persistência do conteúdo com sucesso;
      uma operação sem confirmação não será considerada publicada.
- [x] **Suposição:** a publicação imediata vale para cada tipo de conteúdo listado nesta
      spec, tanto em adições quanto em edições.
- [x] **Decisão confirmada:** todos os tipos de conteúdo desta spec devem poder ser
      editados em português e em inglês. Cada conteúdo deve apresentar uma caixa própria
      para cada idioma na interface administrativa.
- [x] **Decisão confirmada:** os campos obrigatórios de cada tipo de conteúdo já estão
      definidos nas specs dos domínios de textos, resultados, experiências, projetos,
      habilidades, formação e contato; esta spec não inventa campos novos.
- [x] **Suposição:** a exclusão não faz parte desta feature porque o pedido contempla
      somente adicionar e editar conteúdos.
- [x] **Decisão confirmada:** quando existir uma ordem de exibição para o conteúdo,
      Marcos poderá alterá-la pela área administrativa.
- [x] **Decisão confirmada:** uma falha detectada depois da persistência deve ser
      registrada em log para identificação e correção.
- [x] **Decisão confirmada:** cada conteúdo terá uma caixa para português e outra para
      inglês na interface administrativa.
- [x] **Decisão confirmada:** campos obrigatórios não preenchidos ou com valor inválido
      devem exibir a mensagem padrão de validação da aplicação.
- [x] **Decisão confirmada:** adicionar textos e resultados significa gerenciar itens
      dentro das seções e chaves públicas já existentes; novos blocos públicos e
      alterações do layout não fazem parte desta feature.

## 9. Definition of Done desta feature

- [ ] Os critérios de aceite da seção 5 foram satisfeitos.
- [ ] Marcos consegue adicionar e editar cada um dos sete tipos de conteúdo definidos.
- [ ] Marcos consegue editar as versões em português e inglês e alterar a ordem de
      exibição quando aplicável, usando uma caixa para cada idioma.
- [ ] Campos obrigatórios não preenchidos ou inválidos exibem a mensagem padrão de
      validação da aplicação.
- [ ] Uma alteração salva aparece imediatamente na página pública correspondente.
- [ ] Falhas de persistência não são apresentadas como sucesso nem publicadas
      indevidamente.
- [ ] Falhas ocorridas após a persistência são registradas em log.
- [ ] Visitantes continuam sem permissão para escrever ou alterar o conteúdo público.
- [ ] As features públicas existentes continuam funcionando, com regressão mínima
      verificada.
- [ ] Schema e políticas, caso precisem ser alterados, foram entregues por migrations
      versionadas com caminho de volta definido.
- [ ] O plano de verificação desta feature foi criado após a aprovação desta spec.
- [ ] Marcos revisou e aprovou a implementação antes de qualquer deploy.
