# Plano de Implementação — Painel de contato por WhatsApp e e-mail

Spec relacionada: `spec/03-features/painel-contato-whatsapp-email/spec.md`
Status: Rascunho

## 1. Resumo técnico

Adicionar uma nova subseção dentro da seção pública de contato existente. A subseção
terá um componente local da feature com campos de nome, e-mail e mensagem, validação
client-side e duas ações: WhatsApp como caminho principal e e-mail como fallback.

Os textos do painel serão adicionados ao contrato existente de `PortfolioCopy`, às
traduções padrão e ao mecanismo de edição de textos já usado pela área administrativa.
Assim, os rótulos, placeholders e assunto do e-mail continuarão editáveis por idioma sem
criar uma nova estrutura de dados. Não haverá mensagem padrão fixa: o corpo será montado
com os dados preenchidos pelo visitante.

Os destinos serão montados somente no navegador, com URL encoding e sem persistência,
backend próprio, Supabase, RabbitMQ ou outro mecanismo de filas.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/portfolio/content/portfolio-content.ts` | Adicionar chaves de textos localizados e valores padrão do painel; reutilizar o telefone e o e-mail públicos existentes | Médio: novas chaves precisam permanecer compatíveis com o fallback e o editor genérico |
| `src/app/features/portfolio/content/portfolio-translations.ts` | Adicionar os valores padrão em inglês | Baixo: alteração isolada no contrato de cópia |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` | Integrar o componente da nova subseção e fornecer o conteúdo localizado e os destinos confirmados | Médio: a seção de contato e a alternância de idioma já existem |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` | Renderizar a nova subseção sem remover os links diretos atuais | Médio: risco visual e de regressão na seção pública |
| `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss` | Acomodar o novo painel dentro do layout responsivo existente | Baixo a médio: risco de quebra em telas estreitas |
| `src/app/features/admin/content-management/` | Cobrir no teste que as novas chaves aparecem e são salvas por idioma; o fluxo genérico existente deve ser reutilizado | Baixo: não deve exigir novo editor ou nova API |
| `src/app/features/portfolio/presentation/contact-panel/` | Criar o componente local, validação, montagem dos destinos e testes focados | Médio: contém o novo comportamento de contato |
| Supabase e migrations | Nenhuma alteração de schema; os textos continuam nas tabelas existentes quando salvos pelo editor | Baixo: não há migration nem alteração de dados automática |

## 3. Componentes novos

- `ContactPanel`: componente standalone local da feature para campos, estados de
  validação e ações de contato.
- `contact-channel-url.ts`: funções puras para validar os dados, interpolar os textos
  padrão e montar destinos `wa.me` e `mailto:` com encoding seguro.
- Testes unitários do componente e das funções de montagem de URL.

O componente permanecerá em `features/portfolio/presentation/contact-panel/`, porque a
regra pertence à apresentação pública de contato e não é um padrão compartilhado entre
domínios.

## 4. Mudança de dados/banco (se houver)

Não há mudança de schema, migration ou policy.

As novas chaves textuais serão adicionadas ao contrato local de `PortfolioCopy` e aos
valores padrão em português e inglês. O editor administrativo já percorre
`PORTFOLIO_EDITABLE_COPY_KEYS` e salva textos por idioma usando `portfolio_texts` e
`portfolio_text_translations`; portanto, cada chave poderá ser criada ou atualizada pelo
fluxo existente quando Marcos salvar o conteúdo.

O fallback local continuará garantindo uma interface utilizável se o conteúdo remoto
estiver ausente. O número de WhatsApp e o e-mail reutilizarão os destinos públicos já
confirmados, sem armazenar mensagens de visitantes.

## 5. Sequência de implementação

### Fase 1 — Base

- Expandir o contrato de cópia localizada com as chaves do painel, dos campos, das
  validações e dos textos padrão de WhatsApp e e-mail.
- Criar o componente local e o contrato mínimo de dados, sem ainda alterar a seção
  pública existente além do ponto de integração planejado.
- Definir a composição dos valores de nome, e-mail e mensagem sem criar uma mensagem
  padrão fixa; o campo de mensagem terá apenas um placeholder editável.
- Quando houver texto configurável que use variáveis, adotar `{{name}}`, `{{email}}` e
  `{{message}}` como sintaxe aprovada.

### Fase 2 — Lógica principal

- Implementar a validação de campos obrigatórios e formato de e-mail.
- Implementar a montagem segura do link `wa.me`, preservando caracteres Unicode,
  quebras de linha e valores fornecidos pelo visitante, sem mensagem padrão fixa.
- Implementar a montagem segura do `mailto:` com destinatário, assunto editável e corpo
  formado pelos dados preenchidos.
- Garantir que fechar o canal ou não possuir cliente instalado não seja tratado como
  envio confirmado.

### Fase 3 — Interface

- Inserir a nova subseção depois dos links atuais e antes do bloco de currículos, sem
  substituir os canais existentes.
- Conectar os rótulos, placeholders, validações e assunto do e-mail ao idioma selecionado.
- Abrir as ações em nova aba/janela quando o navegador permitir.
- Adicionar marcação semântica, estados de erro identificáveis, navegação por teclado e
  layout responsivo.
- Garantir que o editor administrativo exiba as novas chaves separadamente por idioma
  através do fluxo genérico existente.

### Fase 4 — Testes

- Testar validação, encoding, interpolação e os dois destinos.
- Testar o caminho feliz e os erros mais óbvios do componente.
- Testar alternância de idioma, preservação dos links atuais e ausência de persistência.
- Executar a suíte completa, o build e a verificação visual responsiva definida para o
  projeto.

### Fase 5 — Entrega (deploy/rollback)

- Atualizar o procedimento específico em `spec/06-deploy/painel-contato-whatsapp-email/`.
- Confirmar que não existe migration ou ação de recuperação de dados para esta feature.
- Revisar o diff, validar Preview e só então permitir a promoção conforme o procedimento
  de deploy existente.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar |
|---|---|---|---|
| Chaves novas não serem carregadas pelo editor ou pelo fallback | Média | Alto: textos podem aparecer vazios ou não serem editáveis | Adicionar chaves nos dois contratos, testar `loadCopy`, `saveCopy` e fallback local |
| Dados do visitante quebrarem os parâmetros do WhatsApp ou e-mail | Média | Médio: mensagem truncada ou destino incorreto | Usar encoding da plataforma, funções puras e testes com Unicode, quebras de linha e caracteres reservados |
| Alteração da seção de contato quebrar links existentes | Baixa | Alto: perda de canais já publicados | Manter `contactLinks` e seus atributos editoriais, cobrir regressão no teste da página |
| Formulário ficar difícil de usar em telas pequenas | Média | Médio: piora da experiência de contato | Testar layout móvel e desktop antes da entrega |
| Cliente de WhatsApp ou e-mail não assumir a ação | Média | Baixo: o visitante não consegue concluir pelo dispositivo | Não afirmar sucesso; manter o painel e os links diretos utilizáveis |
| Placeholder ou assunto não serem revisados antes da publicação | Média | Médio: experiência de contato pouco clara | Deixar esses textos editáveis por idioma e exigir revisão antes da aprovação final |

Nenhum risco identificado exige um novo Registro de Decisão neste momento; a feature
segue a arquitetura pública existente e não introduz backend, fila ou mudança de schema.

## 7. Perguntas abertas antes de começar

- [x] Confirmado por Marcos: não haverá mensagem padrão fixa; haverá somente um
      placeholder editável para o campo de mensagem. O assunto do e-mail poderá ser
      preenchido posteriormente.
- [x] Confirmada por Marcos: quando houver texto configurável com variáveis, a sintaxe
      será `{{name}}`, `{{email}}` e `{{message}}`.
- [x] Confirmado por Marcos: as ações devem abrir o WhatsApp e o cliente de e-mail em
      nova aba/janela quando o navegador permitir.
- [x] Confirmado por Marcos: a nova subseção aparecerá após os links atuais e antes do
      bloco de currículos.
