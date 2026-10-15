# Registro de Decisão — Tipografia Moderna (Inter & Space Grotesk) e Hero Card com Avatar Placeholder

Data: 2026-10-14  
Status: Aprovado  
Feature: Apresentação Hero e Tipografia Visual  

---

## 1. Contexto

Após a implementação da barra de navegação e da paleta bege e marrom, foram solicitadas as seguintes melhorias:
1. **Tipografia Moderna:** A fonte anterior na barra superior e no corpo utilizava Courier New / Consolas mono e fontes padrão do sistema, resultando em uma estética pixelada e com espaçamentos irregulares no Windows. O usuário solicitou a adoção da tipografia refinada do site de referência [josiasbroch-dev.vercel.app](https://josiasbroch-dev.vercel.app/).
2. **Hero Card em Duas Colunas:**
   - Adicionar botão "Contact Me" ("Fale Comigo") que direciona suavemente via âncora para a seção de contato (`#contato`), estilizado com ícone de avião de papel (*send*).
   - Manter os canais de contato rápido (LinkedIn, GitHub, Email, Telefone), convertendo seus links de texto para botões circulares elegantes com ícones SVG modernos e estados de foco/hover acessíveis.
   - Adicionar na coluna da direita um card de template para foto de perfil com silhueta cinza neutra, permitindo visualizar a diagramação antes da inclusão da foto real do autor.

---

## 2. Decisão

### A. Tipografia Global e Componentizada
- **Fontes Importadas via Google Fonts CDN (`src/index.html`):**
  - `Inter` (pesos 400, 500, 600, 700): utilizada para a navegação da barra superior, botões de ação, menus dropdown, textos de parágrafos e corpo da aplicação.
  - `Space Grotesk` (pesos 500, 600, 700, 800): utilizada para o monograma da marca (`.brand-logo`), título de apresentação no hero (`.page-header h1`) e títulos de seção (`section h2`).
  - `JetBrains Mono` (pesos 400, 500, 600): utilizada para metadados técnicos, períodos, badges de status e rótulos específicos.
- **Tamanho e Proporção do Título Hero:**
  - Redução do clamp excessivo anterior (que atingia `8.5rem`, causando quebras inadequadas em nomes longos) para `clamp(2.5rem, 5.5vw, 4.25rem)` no desktop e `clamp(2.2rem, 9vw, 3.2rem)` no mobile.

### B. Layout do Hero Card (`.page-header`) e Centralização do Topbar
- **Centralização da Barra de Navegação (Topbar):**
  - No desktop, `.site-header__container` utiliza grid de 3 colunas (`1fr auto 1fr`), garantindo que o menu central de navegação (`.nav-capsule`) fique perfeitamente centralizado na viewport, independente das larguras do logo à esquerda e dos botões à direita.
  - Alinhamento vertical milimétrico dos itens da cápsula (`.nav-capsule__link`), com `display: inline-flex; align-items: center; justify-content: center; line-height: 1; min-height: 2.25rem`, eliminando qualquer descompasso visual de baseline ou assimetria de padding.
- **Coluna da Esquerda do Hero (Conteúdo & Ações):**
  - Remoção do eyebrow genérico ("Portfólio profissional" / "Professional portfolio").
  - Título principal (`h1.hero-name`) exibindo o nome completo do autor (`João Vitor Dias Fernandes`, derivável dinamicamente de `authorName`).
  - Subtítulo de cargo (`.hero-subtitle`) em destaque dourado/caramelo (`#d6ba90`): `"Engenheiro de Software"` em português e `"Software Engineer"` em inglês.
  - Parágrafo de introdução bio com line-height 1.6 e cor `#d8cbbe`.
  - Grupo de botões de ação (`.hero-actions`):
    - Botão primário: "Ver projetos" / "View Projects" (quando houver projetos cadastrados), com ícone de seta `→`.
    - Botão secundário (`data-testid="hero-contact-button"`): "Fale comigo" / "Contact Me", ancorado em `#contato` com ícone SVG de avião de papel.
  - Rodapé do hero (`.hero-footer`):
    - Botões circulares para LinkedIn, GitHub, Email e Telefone com ícones SVG vetoriais nítidos, preservando o `data-testid="compact-contact-links"` e todos os atributos do editor visual editorial (`data-editorial-entity`, `data-editorial-field="href"` e `label` acessível via `sr-only`).
    - Badge de status ativo com indicador pulsante: `● Disponível para novos projetos · Remoto` / `● Open to new opportunities · Remote`.
- **Coluna da Direita (Media & Avatar Placeholder):**
  - Card estilizado em degradê marrom escuro com borda dourada sutil (`.profile-card`).
  - Moldura de avatar com borda pontilhada suave e silhueta humana em vetor SVG cinza neutro.
  - Badge inferior indicativo ("Foto de perfil" / "Profile photo") antecipando o local de inserção da foto pessoal.

---

## 3. Consequências

- **Positivas:**
  - Visual moderno, limpo e idêntico à referência de excelência, com tipografia legível e profissional.
  - Conversão direta para o formulário de contato a partir do primeiro dobra da tela com o botão "Fale comigo".
  - Totalmente responsivo, performático e compatível com acessibilidade (WCAG).
  - 163 testes automatizados passando sem quebra de contrato ou regressão.
  - Build de produção do Angular com 469.41 kB inicial (dentro do orçamento estrito de 500 kB) e zero avisos de compilação.

