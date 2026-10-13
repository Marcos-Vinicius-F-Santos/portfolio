# Tarefas — Painel de contato por WhatsApp e e-mail

Plano relacionado: `spec/04-plano/painel-contato-whatsapp-email/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para revisão individual, referencia o requisito
correspondente e descreve como verificar que ficou pronta. Nenhuma tarefa deve ser
marcada como concluída sem a revisão e aprovação de Marcos.

## Fase 1 — Base

- [x] T-001 [FR-006, FR-009] Expandir o contrato de conteúdo localizado com as chaves do painel, dos campos, das validações, do assunto e do placeholder da mensagem em português e inglês.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.ts`, `src/app/features/portfolio/content/portfolio-translations.ts`, `src/app/features/admin/content-management/`
  - Verificação: os tipos compilam, o fallback contém todas as chaves e o editor administrativo lista cada chave para os dois idiomas.

- [x] T-002 [FR-001, FR-006, FR-007] Criar o componente local `ContactPanel` e seu contrato de entrada/estado, mantendo a composição dentro de `features/portfolio/presentation/contact-panel/`.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/contact-panel/`
  - Verificação: o componente standalone pode ser instanciado em teste, possui estados identificáveis e não cria chamadas de banco, fila ou backend.

## Fase 2 — Lógica principal

- [x] T-003 [FR-002] Implementar a validação dos campos de nome, e-mail e mensagem, incluindo mensagens localizadas e preservação dos valores válidos.
  - Arquivos/módulos: `contact-panel.ts`, `contact-panel.html`, testes do componente
  - Verificação: campos vazios, espaços e e-mail inválido impedem as ações e exibem erros identificáveis; dados válidos seguem disponíveis.

- [x] T-004 [FR-003, BR-005] Implementar a montagem do destino WhatsApp com o número confirmado, os dados preenchidos e URL encoding, sem mensagem padrão fixa.
  - Arquivos/módulos: `contact-channel-url.ts`, `contact-panel.ts`, testes das funções puras
  - Verificação: o destino `wa.me` contém os três dados do visitante corretamente codificados, inclusive Unicode, quebras de linha e caracteres reservados.

- [x] T-005 [FR-004, BR-005] Implementar a montagem do destino `mailto:` com e-mail confirmado, assunto editável, corpo formado pelos dados preenchidos e URL encoding.
  - Arquivos/módulos: `contact-channel-url.ts`, `contact-panel.ts`, testes das funções puras
  - Verificação: o link contém destinatário, assunto e corpo corretos, sem quebrar os parâmetros quando os campos possuem caracteres especiais.

- [x] T-006 [FR-005, BR-002, BR-003] Garantir que as ações apenas abram o canal externo e não apresentem confirmação de envio nem persistam os dados.
  - Arquivos/módulos: `contact-panel.ts`, testes do componente e do fluxo de conteúdo
  - Verificação: não há chamada ao Supabase, API própria ou fila; fechar o canal externo não gera mensagem de sucesso no portfólio.

## Fase 3 — Interface

- [x] T-007 [FR-001, FR-008] Renderizar a nova subseção dentro da área de contato e preservar os links diretos e atributos editoriais existentes.
  - Arquivos/módulos: `portfolio-page.html`, `portfolio-page.ts`, `portfolio-page.scss`
  - Verificação: a seção de contato mantém LinkedIn, GitHub, e-mail, telefone e currículos, e a nova subseção aparece sem substituir esses canais.

- [x] T-008 [FR-006, FR-009] Conectar rótulos, placeholders e assunto do e-mail aos textos localizados editáveis por idioma, usando `{{name}}`, `{{email}}` e `{{message}}` quando houver texto configurável.
  - Arquivos/módulos: `portfolio-page.ts`, `ContactPanel`, `PortfolioContentService`, testes do editor administrativo
  - Verificação: alternar entre PT-BR e inglês altera o painel; salvar uma tradução no editor altera somente o idioma correspondente; o painel aparece após os links atuais e abre os canais em nova aba/janela quando possível.

- [x] T-009 [FR-007] Aplicar marcação semântica, estados de validação e estilos responsivos para teclado, desktop e dispositivo móvel.
  - Arquivos/módulos: `contact-panel.html`, `contact-panel.scss`, `portfolio-page.scss`
  - Verificação: labels estão associados aos controles, erros são percebidos por tecnologia assistiva e não há sobreposição ou corte em larguras móveis.

## Fase 4 — Testes

- [x] T-010 [FR-002, FR-003, FR-004] Cobrir o caminho feliz e os erros mais óbvios com testes focados do painel e do construtor de URLs.
  - Arquivos/módulos: `contact-panel.spec.ts`, `contact-channel-url.spec.ts`
  - Verificação: a validação, os destinos WhatsApp/e-mail, a interpolação e os casos com caracteres especiais passam.

- [x] T-011 [FR-005, FR-006, FR-007, FR-008] Cobrir integração com a página pública, alternância de idioma, preservação dos links atuais e ausência de persistência.
  - Arquivos/módulos: `portfolio-page.spec.ts`, `portfolio-content.spec.ts`, `admin-content.service.spec.ts`, `content-management.spec.ts`
  - Verificação: os testes de regressão passam e nenhum teste observa uma gravação ou envio automático.

- [x] T-012 [AC-001, AC-005, AC-006] Executar a suíte completa, o build e a checagem visual responsiva prevista no projeto.
  - Arquivos/módulos: suíte do projeto e checklist da feature
  - Verificação: todos os testes e o build passam; desktop e mobile são revisados; não há erro fatal no console nos caminhos de contato.

## Fase 5 — Entrega

- [x] T-013 [AC-001, AC-002, AC-003, AC-004] Atualizar e revisar o procedimento de deploy e rollback da feature.
  - Arquivos/módulos: `spec/06-deploy/painel-contato-whatsapp-email/deploy.md`
  - Verificação: o procedimento registra que não há migration, descreve validação de WhatsApp/e-mail e define rollback frontend sem alterar Supabase.

## Adiado (fora do escopo desta rodada)

- [ ] T-014 Persistência de mensagens, caixa de entrada administrativa, envio de e-mail por servidor, RabbitMQ, CAPTCHA, rate limiting, anexos e analytics.
