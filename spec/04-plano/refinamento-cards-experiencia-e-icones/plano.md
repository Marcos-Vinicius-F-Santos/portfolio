# Plano de Implementação — Refinamento dos Cards de Experiência e Ícones de Tecnologias

Status: Implementado — pronto para revisão  
Data: 2026-10-06  
Spec: `spec/03-features/refinamento-cards-experiencia-e-icones/spec.md`  
Tarefas: `spec/04-plano/refinamento-cards-experiencia-e-icones/tarefas.md`

---

## 1. Arquitetura e Decisões Técnicas

### 1.1 Limites e Estilização dos Cards de Experiência e Containers (`portfolio-page.scss`)

1. **Quadrantes com Linhas Contínuas Sólidas**:
   - `experience-card` com `padding: 0` e `experience-card-header` com `padding` e `border-bottom: 1px solid var(--line)` contínua de ponta a ponta.
   - 4 quadrantes contínuos sem gaps (`gap: 0`):
     - Linha vertical contínua sólida (`border-left: 1px solid var(--line)`) da base do cabeçalho ao final do card (`.experience-block--decisions` e `.experience-block--results`).
     - Linha horizontal contínua sólida (`border-bottom: 1px solid var(--line)`) de uma extremidade à outra do card (`.experience-block--context` e `.experience-block--decisions`).
   - Cada quadrante possui padding interno uniforme `clamp(1.25rem, 3vw, 2rem)`.
   - No mobile (<= 760px), empilhamento em 1 coluna vertical com bordas inferiores sólidas contínuas.
2. **Remoção de Restrição Arbitrária de Largura (`max-width: 24rem`)**:
   - Eliminação da regra restritiva em `section p:last-child` que limitava textos prematuramente (como "Conteúdos estudados" e "Contexto").
   - Escopo direcionado a `section > p` sem `max-width`, permitindo que parágrafos e listas preencham toda a largura do seu container.
3. **Controle de Tamanho do CSS**:
   - Manter as regras compactas para garantir que o bundle final do SCSS de `portfolio-page` permaneça rigorosamente abaixo do budget de 8 kB (atual: 7.74 kB).

### 1.2 Inclusão e Mapeamento dos Ícones de Tecnologias

1. **Arquivos Vetoriais SVG**:
   - Obter e incluir os SVGs oficiais leves (monocromáticos ou em cores originais padronizadas em 24x24 / 32x32) na pasta `src/assets/skills/`.
2. **Atualização do Catálogo Local (`technology-icons.ts` e `portfolio-content.ts`)**:
   - Mapear cada uma das novas tecnologias no dicionário `FALLBACK_SKILL_ICON_URLS` e em `DIRECT_ICON_URLS`/`RELATED_ICON_NAMES` de `technology-icons.ts`:
     - Python, OpenCV, YOLOv8, MediaPipe, Flutter, Angular, FastAPI, Laravel, Dart, PHP, JSF, Supabase, Oracle, Redis, GitLab, GitKraken, Gradle, Maven.
3. **Atualização do Gerador de Snapshot (`generate-joao-editorial-snapshot.mjs`)**:
   - Atualizar `FALLBACK_SKILL_ICON_URLS` no script do snapshot para registrar as referências de mídia no snapshot publicado e gerar a sincronização com o Supabase.

---

## 2. Estratégia de Verificação

1. **Verificação Visual e Responsiva**:
   - Testar o layout dos cards em resoluções desktop (1440px, 1200px, 1024px) e mobile (375px, 414px, 768px).
   - Confirmar ausência de sobreposição ou "rios de espaço em branco" no texto.
   - Confirmar renderização nítida de cada um dos novos ícones em `<app-project-technologies>` e na grade de Habilidades.
2. **Verificação Automatizada**:
   - Executar `npm test` para assegurar que os seletores existentes continuem passando nos 137 testes unitários.
   - Executar `npm run build` para validar compilação de produção e limites de budget do Angular CLI.
