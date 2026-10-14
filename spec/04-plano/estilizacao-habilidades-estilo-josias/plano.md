# Plano de Implementação — Estilização Moderna da Seção de Habilidades

Spec relacionada: `spec/03-features/estilizacao-habilidades-estilo-josias/spec.md`  
Tarefas: `spec/04-plano/estilizacao-habilidades-estilo-josias/tarefas.md`  

---

## 1. Visão Geral

Implementar a reformulação visual da seção de habilidades (`#stack-tecnica`), transformando as categorias em seções limpas e abertas contendo grades de cards modernos (com ícone colorido no topo e nome abaixo), alinhando o design com a referência de [Josias Broch](https://josiasbroch-dev.vercel.app/) mantendo o tema visual quente/editorial do projeto.

---

## 2. Ordem de Execução

### Fase 1 — Catálogo de Habilidades
- Enriquecer `PORTFOLIO_SKILL_CATEGORIES` em `src/app/features/portfolio/services/portfolio-content.ts` com tecnologias de contato real (`MediaPipe`, `Redis`), mantendo estritamente todos os 30 itens originais validados por testes.

### Fase 2 — Estilização CSS da Seção de Habilidades
- Atualizar `src/app/features/portfolio/pages/portfolio-page/portfolio-page.component.css`:
  - Modificar `.skills-grid` para fluxo vertical amplo (`display: flex; flex-direction: column; gap: 2.75rem;`).
  - Remover a borda sólida e o fundo boxed de `.skill-category`, tornando-o um contêiner transparente e espaçoso.
  - Estilizar o título de categoria `h3` com tipografia em caixa alta, letter-spacing e tom de acento quente (`var(--green)` / âmbar).
  - Configurar a lista `ul` com grade fluida responsiva (`display: grid; grid-template-columns: repeat(auto-fill, minmax(7.2rem, 1fr)); gap: 1rem;`).
  - Estilizar cada card `.skill-item` como um retângulo arredondado com fundo suave, borda sutil, ícone oficial centralizado no topo e nome abaixo.
  - Implementar efeitos dinâmicos de hover: elevação suave (`translateY(-4px)`), destaque de borda (`#c48b52`), iluminação de fundo e sombra envolvente.

### Fase 3 — Verificação e Testes
- Executar a suíte de testes unitários (`npm test -- --no-watch`).
- Executar o build de produção (`npm run build`).

