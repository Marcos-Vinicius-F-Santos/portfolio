# Tarefas — Envio Direto de Mensagem no Formulário de Contato (Web3Forms)

Spec relacionada: `spec/03-features/envio-direto-formulario-contato/spec.md`

## Regra das tarefas
Cada tarefa é pequena o suficiente para revisão individual, referencia o requisito correspondente e descreve como verificar que ficou pronta. Nenhuma tarefa deve ser marcada como concluída sem a revisão e aprovação de João Vitor.

## Fase 1 — Contrato e Configuração

- [x] T-001 [FR-005, FR-006] Expandir tipos e chaves de tradução em `PortfolioCopy` para estados de envio: `contactSendingLabel`, `contactSuccessTitle`, `contactSuccessBody`, `contactErrorMessage`.
  - Arquivos: `src/app/features/portfolio/services/portfolio-content.ts`, `src/app/features/portfolio/services/portfolio-ui-labels.ts`
  - Verificação: `npm test` passa, tipos compilam sem `any`.

- [x] T-002 [FR-005] Adicionar suporte a `WEB3FORMS_ACCESS_KEY` no gerador de runtime-config e no modelo de destinos/configurações do painel.
  - Arquivos: `scripts/generate-runtime-config.mjs`, `.env.example`, `src/app/shared/components/contact-panel/contact-panel.models.ts`
  - Verificação: runtime-config inclui a chave opcional e os valores default funcionam em desenvolvimento.

## Fase 2 — Serviço e Lógica de Envio

- [x] T-003 [FR-001, FR-004] Criar serviço/helper desacoplado `sendContactEmail()` para chamada HTTPS à API do Web3Forms com tratamento de resposta e erros de rede.
  - Arquivos: `src/app/shared/components/contact-panel/contact-email-sender.ts`, `contact-email-sender.spec.ts`
  - Verificação: testes unitários cobrem caso de sucesso (200), caso de erro de API e caso de exceção de rede com mocks de `fetch`.

- [x] T-004 [FR-002, FR-003, FR-004] Integrar envio direto ao `ContactPanelComponent`, adicionando sinais de estado (`isSubmitting`, `submitStatus`), desativação de botão durante envio, banner de sucesso e limpeza de formulário.
  - Arquivos: `src/app/shared/components/contact-panel/contact-panel.component.ts`, `contact-panel.component.html`, `contact-panel.component.css`
  - Verificação: botão de e-mail altera label para "Enviando...", exibe spinner, limpa campos após sucesso e exibe banner; clique no WhatsApp permanece inalterado.

## Fase 3 — Testes e Verificação de Regressão

- [x] T-005 [FR-001, FR-002, FR-003, FR-006] Atualizar testes de componentes para cobrir o fluxo completo do novo envio e verificar ausência de regressões.
  - Arquivos: `src/app/shared/components/contact-panel/contact-panel.component.spec.ts`
  - Verificação: `npm test -- --watch=false` com 100% dos testes passando.

