# Tarefas — Layout em Coluna Única e Redesign dos Cards na Página de Detalhes

Spec relacionada: [`spec/03-features/detalhes-projeto-coluna-unica/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/detalhes-projeto-coluna-unica/spec.md)  
Verificação: [`spec/05-verificacao/detalhes-projeto-coluna-unica/plano-verificacao.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/05-verificacao/detalhes-projeto-coluna-unica/plano-verificacao.md)

---

## Fase 0 — Alinhamento da Spec (Gate Inicial)

- [x] **T-000:** Confirmar com João Vitor a ordem exata entre *Solução*, *Papel Desempenhado* e a posição da *Galeria de Imagens* na sequência em coluna única. (Confirmado: Contexto ➔ Papel ➔ Solução ➔ Galeria ➔ Decisões Técnicas ➔ Aprendizados ➔ Resultados ➔ Tecnologias ➔ Links).

---

## Fase 1 — Estruturação do Template HTML e Modelo de Dados

- [x] **T-001 [FR-001, FR-002]:** Atualizar `project-detail.component.html` para reordenar os cards em fluxo de coluna única:
  - Contexto (`problemContext`)
  - Papel desempenhado (`role`)
  - Solução (`solution` — se existir)
  - Galeria de imagens (se houver imagens válidas)
  - Decisões técnicas (`technicalDecisions`)
  - Aprendizados (`learnings`)
  - Resultados (`results`)
  - Tecnologias (`technologies` — por último na narrativa técnica)
  - Links externos (GitHub / Demo)
- [x] **T-002 [FR-003, FR-004]:** Adicionar micro-ícones SVG inline nos cabeçalhos de cada card (`card-heading`) e preservar todos os atributos `data-editorial-*`.

---

## Fase 2 — Estilização CSS e Refinamento Visual

- [x] **T-003 [FR-001, FR-003]:** Refatorar `project-detail.component.css`:
  - Converter `.project-content-grid` para layout de coluna única centralizado (`display: flex; flex-direction: column; max-width: 52rem; margin: 0 auto; gap: 1.5rem;`);
  - Estilizar os cards com superfície refinada, cantos arredondados modernos, bordas sutis e elevação suave no hover;
  - Adicionar acento temático diferenciado para o card de *Resultados*;
  - Personalizar marcadores de lista para *Decisões Técnicas*, *Aprendizados* e *Resultados*.

---

## Fase 3 — Testes, Verificação e Registro

- [x] **T-004:** Atualizar os testes unitários em `project-detail.component.spec.ts` para validar a nova sequência de renderização dos cards (Contexto primeiro, Resultados antes de Tecnologias, Tecnologias por último).
- [x] **T-005:** Executar os gates de qualidade do projeto (`npm run check:white-label`, `npm test -- --watch=false`, `npm run build`).
- [x] **T-006:** Adicionar documento descritivo em `docs/alteracoes/` registrando o redesign e solicitar aprovação final de João Vitor.
