# Spec da Feature — Portfólio público e conteúdo administrável

> **Reconciliação editorial — 2026-09-26:** Publicação imediata será substituída por revisão/publicação do conjunto. Home e detalhe compartilham versão e entidades; nomes internos de empresas continuam fora do DTO público. A [spec de edição visual](../edicao-visual-rascunho-publicacao/spec.md) prevalece nesses pontos quando implantada. Os requisitos anteriores continuam referência para o comportamento não alterado e a regressão; esta nota não comprova implementação ou testes.

Status: Aprovada  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/portfolio/` e `src/app/features/admin/`, com
conteúdo compartilhado em `src/app/features/portfolio/content/`, conforme
`spec/02-arquitetura/ARQUITETURA.md`  
Criada em: 2026-09-25  
Atualizada em: 2026-09-25

## 1. Objetivo

Evoluir o portfólio profissional bilíngue para uma página única, responsiva e
tecnicamente orientada, com apresentação, habilidades, formação, experiências,
projetos e contatos administráveis.

A feature também deve permitir que Marcos mantenha esse conteúdo pela área
administrativa existente, sem precisar alterar a estrutura principal ou o layout
público para incluir novos conteúdos.

## 2. Como funciona hoje

O portfólio já possui um header fixo, navegação entre as seções, numerações exibidas no
início das seções e uma seção “About me” apresentada em uma coluna estreita.

Já existe uma página administrativa funcional que permite a Marcos inserir, editar e
excluir conteúdos. Esta feature amplia e organiza o conteúdo administrável conforme os
campos descritos nesta spec e altera a apresentação pública para remover as numerações,
ampliar a seção “About me” e apresentar as novas seções e dados.

As experiências, habilidades, formações, projetos e contatos existentes devem continuar
acessíveis pela área administrativa, sem que esta feature altere silenciosamente as
regras atuais de exclusão.

## 3. Requisitos funcionais

### FR-001 — Navegação fixa e responsiva

QUANDO o visitante acessar ou rolar a página pública  
O SISTEMA DEVE manter um header fixo no topo com menus que direcionem às principais
seções do portfólio.

QUANDO o portfólio for acessado em uma tela menor  
O SISTEMA DEVE adaptar a navegação para permanecer utilizável e funcional.

### FR-002 — Identificação das seções

QUANDO uma seção do portfólio for exibida  
O SISTEMA DEVE identificar a seção por seu título e pela navegação do header, sem exibir
numerações no início da seção.

### FR-003 — Apresentação inicial

QUANDO o visitante abrir o portfólio  
O SISTEMA DEVE apresentar o nome de Marcos, seu posicionamento profissional, seu resumo
de atuação e uma versão compacta dos contatos.

### FR-004 — Contatos compactos da apresentação

QUANDO os contatos compactos forem exibidos na apresentação inicial  
O SISTEMA DEVE permitir acesso rápido ao LinkedIn, GitHub, e-mail e telefone, sem
substituir a seção completa de contato no final da página.

### FR-005 — Largura da seção “About me”

QUANDO a seção “About me” for exibida  
O SISTEMA DEVE utilizar o máximo possível do espaço horizontal disponível, preservando
legibilidade, margens adequadas e adaptação para telas menores.

### FR-006 — Categorias de habilidades

QUANDO a seção de habilidades for exibida  
O SISTEMA DEVE organizar as skills nas categorias de linguagens, sistemas corporativos e
integrações, frontend, DevOps e observabilidade, bancos de dados e controle de versão.

### FR-007 — Ícone opcional de skill

QUANDO Marcos cadastrar ou editar uma skill pela área administrativa  
O SISTEMA DEVE permitir que ele informe uma imagem enviada por ele ou uma URL pública
para um SVG ou outra imagem, limitando a imagem enviada manualmente a 1 MB.

QUANDO uma skill for cadastrada sem imagem ou ícone  
O SISTEMA DEVE permitir a conclusão do cadastro e a exibição da skill sem impedir sua
apresentação por causa da ausência do ícone.

QUANDO a URL pública informada para o ícone estiver inválida ou indisponível  
O SISTEMA DEVE utilizar a imagem enviada manualmente, quando existir, e deixar o ícone
em branco quando não existir uma imagem manual disponível.

### FR-008 — Formação acadêmica

QUANDO Marcos cadastrar ou editar uma formação pela área administrativa  
O SISTEMA DEVE permitir informar instituição, nome do curso, período de início, período
de término ou indicação de que a formação está em andamento, competências desenvolvidas
e principais conteúdos estudados.

### FR-009 — Traduções da formação

QUANDO uma formação acadêmica for cadastrada ou editada  
O SISTEMA DEVE permitir manter suas informações em português e em inglês.

### FR-010 — Experiências profissionais

QUANDO o visitante acessar a seção de experiências  
O SISTEMA DEVE apresentar as experiências em ordem cronológica, da mais recente para a
mais antiga, sem expor os nomes das empresas.

QUANDO uma experiência profissional for cadastrada ou editada pela área administrativa

O SISTEMA DEVE permitir informar período, cargo, contexto, responsabilidades, decisões
técnicas e resultados alcançados, com conteúdo em português e inglês.

### FR-011 — Projetos extensíveis

QUANDO um projeto for apresentado na página pública  
O SISTEMA DEVE permitir exibir nome, descrição, contexto, problema, solução, papel
desempenhado, decisões técnicas, tecnologias, resultados, aprendizados, imagens e
links para código, demonstração ou documentação.

QUANDO Marcos cadastrar um novo projeto pela área administrativa  
O SISTEMA DEVE incluí-lo na apresentação pública sem exigir alteração na estrutura
principal ou no layout da página.

QUANDO Marcos enviar uma imagem para um projeto  
O SISTEMA DEVE aceitar a imagem somente quando ela tiver no máximo 1 MB.

### FR-012 — Contatos completos

QUANDO o visitante chegar ao final da página  
O SISTEMA DEVE apresentar uma seção “Contact” com elementos equivalentes a cards para
LinkedIn, GitHub, e-mail e telefone.

### FR-013 — Fonte única dos contatos

QUANDO Marcos atualizar um contato pela área administrativa  
O SISTEMA DEVE utilizar os mesmos dados atualizados na versão compacta da apresentação
inicial e na seção completa “Contact”.

### FR-014 — Alternância de idioma

QUANDO o visitante alternar entre português e inglês durante a navegação  
O SISTEMA DEVE alterar os títulos, textos, botões, experiências, projetos, habilidades,
formação e demais conteúdos textuais para o idioma selecionado.

QUANDO um conteúdo não possuir tradução no idioma selecionado  
O SISTEMA DEVE apresentar esse conteúdo no idioma padrão, português brasileiro (`pt-BR`).

### FR-015 — Idioma inicial

QUANDO o visitante abrir o portfólio pela primeira vez  
O SISTEMA DEVE considerar a preferência de idioma do navegador para selecionar o idioma
inicial e utilizar português brasileiro (`pt-BR`) como fallback quando a preferência não
for suportada.

### FR-016 — Gestão administrativa do conteúdo

QUANDO Marcos acessar a área administrativa autenticada  
O SISTEMA DEVE permitir adicionar e editar textos, traduções, experiências, projetos,
habilidades, formações, contatos e imagens do portfólio.

### FR-017 — Persistência e disponibilidade pública

QUANDO Marcos salvar uma alteração válida na área administrativa  
O SISTEMA DEVE persistir a alteração e disponibilizá-la na página pública imediatamente,
sem exigir alteração manual no layout público.

QUANDO uma alteração administrativa não puder ser persistida  
O SISTEMA DEVE manter o conteúdo original, sem substituí-lo por uma alteração não
confirmada.

### FR-018 — Limite de imagens enviadas

QUANDO Marcos enviar uma imagem de skill ou de projeto pela área administrativa  
O SISTEMA DEVE aceitar arquivos de até 1 MB e rejeitar arquivos maiores.

### FR-019 — Uso responsivo

QUANDO o visitante acessar qualquer seção em desktop ou dispositivo móvel  
O SISTEMA DEVE manter o conteúdo e os controles utilizáveis, incluindo header, navegação,
alternância de idioma, contatos, imagens e links.

## 4. Regras de negócio

### BR-001 — Empresas não expostas

Os registros de experiências apresentados publicamente não devem expor os nomes das
empresas.

### BR-002 — Contatos sem duplicidade de cadastro

Os contatos exibidos na apresentação inicial e na seção final devem ser alimentados pelos
mesmos dados administrativos.

### BR-003 — Ícone não obrigatório

A ausência de imagem ou ícone não pode impedir o cadastro ou a apresentação de uma
skill.

### BR-004 — Idioma de apresentação

O conteúdo textual público deve estar disponível em português brasileiro (`pt-BR`) e
inglês (`en`). A preferência do navegador deve ser considerada no idioma inicial, com
português brasileiro como fallback e como idioma padrão para conteúdo sem tradução.

### BR-005 — Publicação imediata

Uma alteração salva pela área administrativa deve ficar disponível na página pública
imediatamente. Não há etapa separada de rascunho e publicação nesta feature.

### BR-006 — Conteúdo confidencial

Informações confidenciais de empresas, clientes ou projetos profissionais não devem ser
expostas na página pública.

## 5. Critério de aceite

### AC-001 — caminho feliz: navegação pública

Dado que o visitante esteja em qualquer ponto da página pública  
Quando ele usar um item do header  
Então o sistema deve direcioná-lo para a seção correspondente, mantendo o header fixo
e a navegação utilizável em desktop e dispositivo móvel.

### AC-002 — caminho feliz: identificação sem numeração

Dado que uma seção do portfólio esteja visível  
Quando o visitante observar o início da seção  
Então ele deve ver o título da seção sem uma numeração inicial.

### AC-003 — caminho feliz: apresentação e “About me”

Dado que o visitante abra a página pública  
Quando a apresentação inicial e a seção “About me” forem renderizadas  
Então o nome, o posicionamento, o resumo, os contatos compactos e o texto de “About me”
devem aparecer, com a seção “About me” aproveitando a largura disponível sem perder
legibilidade.

### AC-004 — caminho feliz: contatos sincronizados

Dado que Marcos altere um contato na área administrativa  
Quando a alteração for salva  
Então o mesmo valor atualizado deve aparecer na apresentação inicial e na seção completa
“Contact”.

### AC-005 — caminho feliz: skill com imagem ou URL

Dado que Marcos esteja cadastrando ou editando uma skill  
Quando ele enviar uma imagem própria ou informar uma URL pública de SVG ou imagem e
salvar o registro  
Então a skill deve ser persistida e sua imagem deve poder ser utilizada na apresentação
pública.

### AC-006 — caminho de contingência: URL de imagem indisponível

Dado que uma skill tenha uma URL pública inválida ou indisponível  
Quando existir uma imagem enviada manualmente  
Então o sistema deve utilizar a imagem manual.

Dado que uma skill tenha uma URL pública inválida ou indisponível  
Quando não existir uma imagem enviada manualmente  
Então o sistema deve deixar o ícone em branco.

### AC-007 — caminho de contingência: skill sem imagem

Dado que Marcos esteja cadastrando uma skill sem enviar imagem e sem informar URL  
Quando ele salvar o registro  
Então o cadastro deve ser concluído e a skill deve continuar disponível na página pública
sem exigir um ícone.

### AC-008 — caminho feliz: formação acadêmica

Dado que Marcos esteja cadastrando uma formação  
Quando ele informar instituição, curso, período, situação da formação e competências ou
conteúdos estudados em português e inglês  
Então a formação deve ser persistida e apresentada com os dados do idioma selecionado.

### AC-009 — caminho feliz: experiência profissional

Dado que existam experiências profissionais cadastradas  
Quando o visitante acessar a seção correspondente  
Então elas devem aparecer em ordem cronológica, com período, cargo, contexto,
responsabilidades, decisões técnicas e resultados, sem os nomes das empresas.

### AC-010 — caminho feliz: novo projeto

Dado que Marcos cadastre um novo projeto com seus dados disponíveis  
Quando ele salvar o projeto  
Então o projeto deve aparecer na página pública usando o layout existente, sem exigir
alteração manual na estrutura principal.

### AC-011 — caminho feliz: idioma

Dado que o visitante escolha português ou inglês  
Quando ele alternar o idioma durante a navegação  
Então os conteúdos textuais públicos devem ser apresentados no idioma selecionado.

### AC-012 — caminho de erro/contingência: idioma não suportado

Dado que a preferência principal do navegador não seja português nem inglês  
Quando o visitante abrir o portfólio sem ter selecionado um idioma  
Então o sistema deve utilizar português brasileiro (`pt-BR`) como fallback.

### AC-013 — caminho de contingência: tradução ausente

Dado que um conteúdo não possua tradução no idioma selecionado  
Quando o visitante visualizar esse conteúdo  
Então o sistema deve apresentar o conteúdo em português brasileiro (`pt-BR`), o idioma
padrão.

### AC-014 — caminho de erro: falha de persistência

Dado que o conteúdo original esteja publicado  
Quando Marcos salvar uma alteração e a persistência falhar  
Então o sistema deve manter o conteúdo original, sem publicar a alteração não
confirmada.

### AC-015 — caminho feliz: atualização pública

Dado que Marcos salve uma alteração válida na área administrativa  
Quando o visitante acessar ou recarregar a página pública  
Então o conteúdo atualizado deve estar disponível sem alteração manual do layout.

## 6. Casos de erro / edge cases

- Preferência do navegador em idioma diferente de português ou inglês → utilizar
  português brasileiro (`pt-BR`) como fallback.
- Skill sem imagem ou ícone → concluir o cadastro e exibir a skill sem ícone.
- URL pública de imagem ou SVG inválida ou indisponível → usar a imagem manual quando
  existir; caso contrário, deixar o espaço da imagem em branco.
- Imagem enviada para skill ou projeto acima de 1 MB → rejeitar o arquivo.
- Formação em andamento → permitir a ausência de período de término e indicar a situação
  de andamento.
- Conteúdo sem tradução no idioma selecionado → apresentar o idioma padrão (`pt-BR`).
- Falha de persistência administrativa → manter o conteúdo original.

## 7. Fora de escopo desta feature

- Login ou cadastro para visitantes.
- Múltiplos administradores ou gestão de permissões administrativas.
- Blog ou publicação de artigos.
- Formulário persistente de contato.
- Múltiplas páginas públicas.
- CMS externo.
- Publicação automática em redes sociais.
- Sincronização automática com LinkedIn ou GitHub.
- Alteração dos nomes anonimizados das empresas.
- Exposição de informações confidenciais de projetos profissionais.
- Alteração das regras atuais de exclusão da Admin page, que já permite excluir
  conteúdos.
- Definição de formatos técnicos adicionais ou validação detalhada para imagens e URLs,
  além do limite de 1 MB e dos comportamentos de fallback definidos nesta spec.

## 8. Suposições e perguntas abertas

- [x] **Suposição confirmada:** o idioma português corresponde ao português brasileiro
      (`pt-BR`),
      conforme a spec do produto, e o inglês corresponde a `en`.
- [x] **Decisão confirmada:** a ordem das seções e os títulos exibidos no header e na
      página pública permanecem exatamente como estão hoje.
- [x] **Decisão confirmada:** as experiências são exibidas da mais recente para a mais
      antiga.
- [x] **Decisão confirmada:** imagens enviadas para ícones de skills e imagens de
      projetos têm limite máximo de 1 MB.
- [x] **Decisão confirmada:** uma URL pública de imagem ou SVG inválida ou indisponível
      deve ser substituída pela imagem manual, quando existir; sem imagem manual, o
      espaço deve permanecer em branco.
- [x] **Decisão confirmada:** conteúdo sem tradução no idioma selecionado deve ser
      apresentado no idioma padrão, português brasileiro (`pt-BR`).
- [x] **Decisão confirmada:** quando uma alteração administrativa não puder ser
      persistida, o conteúdo original deve ser mantido.
- [x] **Suposição confirmada:** a funcionalidade atual de inserir, editar e excluir da Admin page
      permanece disponível; esta feature não redefine suas regras de exclusão.
- [ ] **Pergunta aberta:** qual unidade ou critério visual será usado para considerar que
      “About me” utiliza o máximo possível da largura sem comprometer a leitura?

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] Casos de erro e contingência de prioridade alta tratados.
- [ ] Header, navegação, conteúdo público e Admin page continuam funcionando após a
      mudança.
- [ ] A página é utilizável em desktop e dispositivos móveis.
- [ ] O conteúdo está disponível em português e inglês conforme as decisões aprovadas.
- [ ] A sincronização dos contatos entre apresentação inicial e seção final foi
      verificada.
- [ ] A inclusão de skill sem ícone foi verificada.
- [ ] A inclusão de formação e projeto sem alteração manual do layout foi verificada.
- [ ] Foi feito teste de regressão das funcionalidades existentes.
- [ ] Foi feito o teste de verificação conforme o plano aprovado da feature.
- [ ] Marcos revisou e aprovou a spec, a implementação e o resultado antes do deploy.
