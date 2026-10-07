# Spec da Feature — Painel de contato por WhatsApp e e-mail

Status: Rascunho
Projeto: Portfólio Profissional — Marcos Santos
Onde vive no código: `src/app/features/portfolio/presentation/`, dentro da seção pública de contato, conforme a arquitetura.

## 1. Objetivo

Adicionar um painel público para que uma pessoa interessada escreva nome, e-mail e
mensagem e escolha um canal de contato. O caminho principal será o WhatsApp, com o
e-mail como alternativa, sem persistir mensagens no portfólio nem criar uma caixa de
entrada própria.

## 2. Como funciona hoje

A seção pública de contato já prevê links diretos para LinkedIn, GitHub, e-mail, telefone
e currículos. Atualmente não há um painel que reúna nome, e-mail e mensagem antes de
encaminhar a pessoa para um canal de contato.

O produto atualmente exclui formulário persistente de contato. Esta feature adiciona um
formulário não persistente: a mensagem será apenas preparada para o canal escolhido e a
pessoa deverá revisar e enviá-la no WhatsApp ou no próprio cliente de e-mail.

## 3. Requisitos funcionais

### FR-001

QUANDO o visitante visualizar a seção pública de contato
O SISTEMA DEVE apresentar um painel com os campos nome, e-mail e mensagem, além das
ações para WhatsApp e e-mail.

### FR-002

QUANDO o visitante tentar usar um canal com nome, e-mail ou mensagem inválidos ou vazios
O SISTEMA DEVE impedir o encaminhamento e apresentar uma indicação clara dos campos que
precisam ser corrigidos, mantendo a página utilizável.

### FR-003

QUANDO o visitante preencher o painel e escolher WhatsApp
O SISTEMA DEVE abrir o destino público de WhatsApp com uma mensagem pré-preenchida,
codificada para URL, contendo nome, e-mail e mensagem para revisão e envio manual.

### FR-004

QUANDO o visitante preencher o painel e escolher e-mail
O SISTEMA DEVE abrir um link `mailto:` com assunto e corpo pré-preenchidos, contendo
nome, e-mail e mensagem para revisão e envio no cliente de e-mail.

### FR-005

QUANDO o visitante usar qualquer um dos canais
O SISTEMA NÃO DEVE enviar automaticamente a mensagem, persistir o conteúdo no Supabase
ou exigir um backend próprio.

### FR-006

QUANDO o portfólio estiver em português ou inglês
O SISTEMA DEVE apresentar os rótulos, placeholders, validações e mensagens da nova
subseção no idioma atualmente selecionado.

### FR-007

QUANDO o visitante acessar o painel em desktop ou dispositivo móvel
O SISTEMA DEVE manter os campos, ações e mensagens legíveis, utilizáveis por teclado e
adaptados à largura disponível.

### FR-008

QUANDO o painel for adicionado
O SISTEMA DEVE preservar os links diretos já existentes para LinkedIn, GitHub, e-mail,
telefone e currículos.

### FR-009

QUANDO Marcos editar o conteúdo localizado do portfólio
O SISTEMA DEVE permitir editar, separadamente por idioma, os rótulos, placeholders,
assunto do e-mail e o placeholder do campo de mensagem, seguindo o mecanismo de edição
já usado pelo restante do site.

## 4. Regras de negócio

### BR-001 — canal preferencial

WhatsApp será a ação principal do painel e o e-mail será o caminho alternativo. Ambos
usarão os mesmos dados preenchidos no formulário.

### BR-002 — revisão e envio manual

O portfólio somente prepara o conteúdo. A pessoa interessada deve revisar e confirmar o
envio dentro do WhatsApp ou do cliente de e-mail.

### BR-003 — ausência de persistência

Nome, e-mail e mensagem não serão gravados no navegador, no Supabase, em uma API própria
ou em uma fila de mensagens.

### BR-004 — destinos configuráveis sem segredo

O número público do WhatsApp e o endereço público de e-mail devem ser definidos como
configuração do portfólio sem incluir credenciais ou segredos no repositório.

### BR-005 — codificação segura dos destinos

Os dados preenchidos devem ser codificados antes de compor os destinos `wa.me` e
`mailto:`. Nenhum texto fornecido pelo visitante pode quebrar a URL ou alterar seus
parâmetros estruturais.

### BR-006 — conteúdo localizado editável

Os textos apresentados pela subseção devem pertencer ao conteúdo localizado do
portfólio. A edição em português não pode sobrescrever a versão em inglês, e vice-versa.

### BR-007 — placeholder sem mensagem padrão

Não haverá uma mensagem padrão fixa para o corpo do contato. O campo de mensagem terá
somente um placeholder editável por idioma. A implementação deve montar o conteúdo
encaminhado a partir dos dados preenchidos pelo visitante.

O assunto do e-mail permanece editável por idioma e poderá ser preenchido posteriormente
por Marcos, sem exigir alteração de código.

## 5. Critério de aceite

### AC-001 — apresentação do painel

Dado que o visitante tenha carregado a página pública
Quando chegar à seção de contato
Então deve encontrar os campos de nome, e-mail e mensagem e as ações de WhatsApp e
e-mail, sem perder os links de contato existentes.

### AC-002 — encaminhamento para WhatsApp

Dado que nome, e-mail e mensagem válidos tenham sido preenchidos
Quando o visitante escolher WhatsApp
Então o navegador deve abrir o destino configurado com uma mensagem pré-preenchida,
contendo os três valores para revisão e envio manual.

### AC-003 — encaminhamento para e-mail

Dado que nome, e-mail e mensagem válidos tenham sido preenchidos
Quando o visitante escolher e-mail
Então o navegador deve abrir um `mailto:` com destinatário, assunto e corpo
pré-preenchidos, contendo os três valores.

### AC-004 — validação

Dado que um ou mais campos estejam vazios ou que o e-mail seja inválido
Quando o visitante escolher qualquer canal
Então nenhum destino deve ser aberto, os erros devem ser identificáveis e os valores
válidos já preenchidos devem ser preservados.

### AC-005 — experiência responsiva e bilíngue

Dado que o visitante esteja em desktop ou dispositivo móvel e em qualquer idioma
suportado
Quando visualizar e usar o painel
Então os controles devem continuar utilizáveis, e os textos devem acompanhar o idioma
selecionado.

### AC-006 — ausência de persistência

Dado que o visitante tenha enviado os dados para um canal
Quando a ação for concluída
Então o portfólio não deve criar registro no Supabase, chamada para backend próprio ou
mensagem em fila.

### AC-007 — edição por idioma

Dado que Marcos esteja editando o conteúdo do portfólio
Quando alterar um rótulo, placeholder ou mensagem da subseção em um idioma
Então a alteração deve ser salva somente na versão desse idioma e deve aparecer quando o
visitante selecionar o idioma correspondente.

## 6. Casos de erro / edge cases

- Campo nome vazio ou composto apenas por espaços → impedir o encaminhamento e indicar a
  correção necessária.
- E-mail inválido → impedir o encaminhamento e indicar o formato esperado.
- Mensagem vazia ou composta apenas por espaços → impedir o encaminhamento.
- Texto com acentos, quebras de linha, símbolos ou caracteres reservados → preservar o
  conteúdo na mensagem depois da codificação do destino.
- WhatsApp indisponível ou não instalado → abrir o destino web configurado; a página não
  deve apresentar falso sucesso nem quebrar.
- Cliente de e-mail não configurado → abrir o `mailto:` quando possível e manter o
  painel utilizável se nenhum cliente assumir a ação.
- Destinatário de WhatsApp ou e-mail ausente ou inválido → não montar um destino falso;
  manter os links diretos e o restante da página utilizáveis.
- Visitante fecha o WhatsApp ou o cliente de e-mail sem enviar → não mostrar confirmação
  de envio pelo portfólio.
- Mensagem muito longa para o canal escolhido → preservar o conteúdo até o limite
  suportado pelo destino e não afirmar que o envio foi concluído.

## 7. Fora de escopo desta feature

- Persistir mensagens, criar uma caixa de entrada ou consultar contatos no admin.
- Enviar e-mail diretamente pelo servidor ou por um provedor como Resend.
- RabbitMQ, filas, workers, processamento assíncrono ou arquitetura orientada a eventos.
- Alterações em Supabase, migrations, Storage, Auth ou policies.
- CAPTCHA, rate limiting, anti-spam avançado ou analytics de conversão.
- Anexos, upload de arquivos ou múltiplas mensagens em uma única submissão.
- Integração de escrita ou sincronização com LinkedIn, GitHub ou outros serviços.
- Substituir os links diretos já existentes na seção de contato.
- Implementar o código antes da aprovação desta spec, do plano e das tarefas.

## 8. Suposições e perguntas abertas

- [x] Suposição de escopo: a feature será um painel não persistente dentro da seção
      pública de contato.
- [x] Decisão de produto proposta: WhatsApp será a ação principal e e-mail será o
      fallback no mesmo painel.
- [x] Confirmado por Marcos: o número de WhatsApp deve reutilizar o telefone público já
      definido na feature de contato: `+55 37 998292763`.
- [x] Confirmado por Marcos: o destinatário do e-mail deve reutilizar o endereço público
      já definido: `marcossantosjdev@gmail.com`.
- [x] Confirmado por Marcos: não haverá mensagem padrão fixa; o campo de mensagem terá
      somente um placeholder editável por idioma. O assunto do e-mail também permanece
      editável e poderá ser preenchido posteriormente por Marcos.
- [x] Confirmado por Marcos: o painel será uma nova subseção visual da área pública de
      contato, sem substituir os links atuais.
- [x] Confirmado por Marcos: os rótulos, placeholders e mensagens serão derivados do
      conteúdo localizado e editáveis separadamente em PT-BR e inglês, como no restante
      do site.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] Destinatários, assunto e placeholder revisados por Marcos.
- [ ] Rótulos, placeholder e assunto editáveis por idioma integrados ao conteúdo
      localizado existente.
- [ ] Validação de campos e codificação dos destinos verificadas para PT-BR e inglês.
- [ ] WhatsApp e e-mail testados sem persistência ou envio automático pelo portfólio.
- [ ] Layout verificado em desktop, dispositivo móvel e navegação por teclado.
- [ ] Casos de erro de prioridade alta tratados.
- [ ] Features existentes continuam funcionando — regressão checada.
- [ ] Testado seguindo o plano de verificação definido a partir desta Spec.
- [ ] Marcos revisou e aprovou antes do deploy.
