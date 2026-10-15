# Plano de Implementação — Layout de Contato Moderno em Duas Colunas

Spec relacionada: `spec/03-features/layout-contato-duas-colunas/spec.md`  
Tarefas: `spec/04-plano/layout-contato-duas-colunas/tarefas.md`  

---

## 1. Visão Geral

Implementar a reestruturação visual da seção final de contato (`#contato`), criando a diagramação em duas colunas (plataformas à esquerda, formulário à direita), textos explicativos de acolhimento e estilização moderna alinhada a [josiasbroch-dev.vercel.app](https://josiasbroch-dev.vercel.app/).

---

## 2. Ordem de Execução

### Fase 1 — Contratos e Traduções
- Adicionar chaves de cópia se necessário (`contactHeadline`, `contactSubtitle`, `contactExplanation`, `contactRedirectNote`) em `portfolio-content.ts` e `portfolio-translations.ts`.

### Fase 2 — Refatoração do Componente `contact-panel`
- Atualizar `contact-panel.component.html` e `contact-panel.component.css`:
  - Ícone de envio SVG (avião de papel Lucide) nos botões.
  - Estilização do card com borda sutil, campos com focus ring elegante e nota explicativa de redirecionamento.
  - Preservação de todos os `data-testid` existentes (`contact-panel`, `contact-panel-whatsapp`, `contact-panel-email`).

### Fase 3 — Refatoração do Layout da Seção `#contato` no Portfólio
- Atualizar `portfolio-page.component.html`:
  - Criar o container grid de duas colunas `.contact-section-layout`.
  - Coluna da esquerda: texto explicativo e lista vertical de cards modernos para cada link (`data-testid="contact-links"`, `data-testid="contact-curriculum"`).
  - Coluna da direita: `<app-contact-panel class="contact-panel-layout" ... />`.
- Atualizar `portfolio-page.component.css`:
  - Grid de 2 colunas no desktop (`min-width: 1024px`) e 1 coluna em mobile.
  - Estilização dos cards de plataforma com caixas de ícones modernos, labels em caixa alta e efeitos de hover.

### Fase 4 — Testes e Validação
- Executar a suíte de testes unitários (`npm test -- --no-watch`).
- Executar a compilação de produção (`npm run build`).

