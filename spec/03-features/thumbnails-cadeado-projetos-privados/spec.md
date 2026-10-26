# Spec da Feature — Placeholder Visual com Cadeado e Identificação de Código Proprietário nos Cards de Projetos

Status: Proposta para Revisão e Aprovação de João Vitor  
Data: 18/10/2026  
Projeto: Portfólio Profissional (`joaovitordf/portfolio`)  
Autor: João Vitor Dias Fernandes  
Onde vive no código:
- `src/app/features/portfolio/services/portfolio-ui-labels.ts` (rótulos bilíngues para "Código Proprietário" / "Código Aberto")
- `src/app/shared/components/project-card/project-card.component.html` (estrutura do placeholder central condicional)
- `src/app/shared/components/project-card/project-card.component.css` (estilização do ícone de cadeado, glow âmbar e tipografia)
- `src/app/shared/components/project-card/project-card.component.spec.ts` (testes unitários de renderização)

---

## 1. Contexto e Motivação

Projetos corporativos e de pesquisa aplicada desenvolvidos para empresas clientes (como **SensorEng**, **Polo EMBRAPII** e **Ponto IFMG**) possuem código proprietário e estão protegidos por sigilo contratual e confidencialidade. Nesses casos, estampar o logotipo das empresas como thumbnail pode gerar conflitos de marca registrada (uso indevido) e violar cláusulas de NDA.

Atualmente, quando um projeto não possui imagem de capa cadastrada (`coverImage() == null`), o card exibe no centro um ícone genérico de código (`< >`) e as iniciais truncadas do título (ex: `S—`).

A proposta desta feature é substituir esse placeholder genérico por uma apresentação visual intencional, moderna e de alta qualidade:
1. **Para Projetos Privados:** Um ícone central de **cadeado de segurança estilizado**, acompanhado de iluminação sutil (glow âmbar/ouro `#c48b52`) e a legenda **`CÓDIGO PROPRIETÁRIO`** (em PT) ou **`PROPRIETARY CODE`** (em EN).
2. **Para Projetos Públicos:** Um ícone de código aberto (`< >`), acompanhado de glow verde e a legenda **`CÓDIGO ABERTO`** / **`OPEN SOURCE`** (ou exibindo a imagem real caso enviada).
3. **Preservação de Imagens Reais:** Quando o usuário subir screenshots reais (como no Russian Mastery e no TCC de Boxe), a imagem de capa continua tendo prioridade total e é exibida normalmente.

---

## 2. Requisitos Funcionais (Given / When / Then)

### FR-001 — Rótulos Bilíngues no UI Service
- **GIVEN** o serviço de textos de interface `portfolio-ui-labels.ts`
- **WHEN** for consultado o dicionário de rótulos em `pt-BR` ou `en`
- **THEN** deve fornecer as chaves:
  - `proprietaryCode`: `"Código Proprietário"` (PT) / `"Proprietary Code"` (EN)
  - `openSourceCode`: `"Código Aberto"` (PT) / `"Open Source"` (EN)

### FR-002 — Renderização do Cadeado no Placeholder de Projetos Privados
- **GIVEN** um card de projeto na vitrine `#portfolio`
- **WHEN** o projeto possuir visibilidade `private` e não tiver `coverImage` associada
- **THEN** a área de thumbnail (16:10) deve renderizar no centro:
  - Um ícone SVG de cadeado de segurança com traço moderno (`width="34"` / `height="34"`, cor âmbar `#dfcdbd` / `#c48b52`).
  - Um efeito de brilho radial (`glow`) elegante ao fundo em tons quentes/âmbar (`rgba(196, 139, 82, 0.22)`).
  - A legenda em caixa alta com espaçamento entre letras contendo `ui().proprietaryCode`.
  - O monograma/iniciais truncadas atuais (`projectInitials()`) deve ser removido do centro do placeholder privado para manter o design limpo e focado no cadeado.

### FR-003 — Renderização do Placeholder de Projetos Públicos
- **GIVEN** um card de projeto na vitrine `#portfolio`
- **WHEN** o projeto possuir visibilidade `public` e não tiver `coverImage` associada
- **THEN** a área de thumbnail deve exibir o ícone de código `< >` com a legenda `ui().openSourceCode` e glow verde sutil.

### FR-004 — Prioridade de Imagens Reais
- **GIVEN** qualquer projeto que possua `coverImage` cadastrada (URL válida)
- **WHEN** o card for renderizado
- **THEN** a imagem real deve ser exibida no elemento `<img>`, ocultando o placeholder do cadeado.

### FR-005 — Conformidade White-Label e Testes
- **GIVEN** as modificações de template, estilos e textos
- **WHEN** forem executados `npm run check:white-label` e `npm test`
- **THEN** o gate de white-label deve passar com código 0 e os testes do `ProjectCardComponent` devem cobrir os novos cenários de placeholder.

### FR-006 — Remoção da Barra Superior de Janela (`window-bar`)
- **GIVEN** os cards de projetos na vitrine `#portfolio`
- **WHEN** o card for renderizado
- **THEN** a barra superior de simulação de janela de navegador (com os 3 círculos coloridos e o título duplicado) deve ser removida
- **AND** o card deve iniciar diretamente na mídia de capa (`cover-wrapper`), aproveitando o `border-radius: 1.25rem` e `overflow: hidden` do próprio card para um visual mais limpo e moderno.

---

## 3. Critérios de Aceite (Definition of Done)

1. [x] Projetos privados sem imagem de capa exibem no centro da thumbnail o ícone de cadeado e a legenda "CÓDIGO PROPRIETÁRIO" (ou "PROPRIETARY CODE" em inglês).
2. [x] Projetos públicos sem imagem de capa exibem o ícone `< >` e a legenda "CÓDIGO ABERTO" (ou "OPEN SOURCE" em inglês).
3. [x] Projetos com imagem de capa real continuam renderizando a imagem normalmente.
4. [x] O badge de visibilidade (`PRIVADO` / `PÚBLICO`) no canto superior esquerdo permanece intacto.
5. [ ] A barra superior de janela com os 3 dots e título (`.project-card__window-bar`) foi removida de todos os cards de projetos.
6. [x] `npm run check:white-label` passa com 100% de sucesso (código 0).
7. [x] Todos os testes unitários passando (`npm test` — 190 testes).
8. [x] `npm run build` gerando pacote sem erros.
9. [ ] **NÃO realizar commit nem push para o GitHub antes da aprovação explícita de João Vitor.**

