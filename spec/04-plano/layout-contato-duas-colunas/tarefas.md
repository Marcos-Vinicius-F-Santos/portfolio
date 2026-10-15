# Tarefas — Layout de Contato Moderno em Duas Colunas

Plano relacionado: `spec/04-plano/layout-contato-duas-colunas/plano.md`  
Spec relacionada: `spec/03-features/layout-contato-duas-colunas/spec.md`  

---

## Fase 1 — Contratos e Traduções
- [x] T-001 [FR-001, FR-005] Adicionar novas chaves de cópia (`contactHeadline`, `contactSubtitle`, `contactExplanation`, `contactRedirectNote`) em `src/app/features/portfolio/services/portfolio-content.ts` e `portfolio-translations.ts`.

## Fase 2 — Refatoração do Formulário de Contato (`app-contact-panel`)
- [x] T-002 [FR-003] Atualizar `contact-panel.component.html` com ícone de envio (avião de papel), nota explicativa de redirecionamento e preservação de testes.
- [x] T-003 [FR-003, FR-005] Atualizar `contact-panel.component.css` com design moderno, largura fluida dentro de sua coluna e foco nos campos.

## Fase 3 — Refatoração do Layout da Seção `#contato`
- [x] T-004 [FR-001, FR-002, FR-004] Atualizar `portfolio-page.component.html` para estruturar a seção em 2 colunas: esquerda com texto explicativo e cards de plataformas verticais (`contact-links` e `contact-curriculum`), direita com o formulário (`app-contact-panel`).
- [x] T-005 [FR-002, FR-005] Atualizar `portfolio-page.component.css` com grid responsivo de 2 colunas e estilo refinado dos cards de plataformas.

## Fase 4 — Verificação e Testes
- [x] T-006 [AC-001 até AC-004] Executar a suíte de testes unitários (`npm test -- --no-watch`).
- [x] T-007 Executar o build de produção (`npm run build`).

## Fase 5 — Balanceamento de Altura e Tipografia da Coluna Esquerda
- [x] T-008 Aumentar tipografia e padding dos cards e texto explicativo da coluna esquerda para equiparar a altura à coluna da direita (`app-contact-panel`).
- [x] T-009 Revalidar testes unitários e build de produção.
