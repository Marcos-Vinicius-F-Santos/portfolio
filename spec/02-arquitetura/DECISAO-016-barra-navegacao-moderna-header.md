# Registro de Decisão — Barra de Navegação Moderna e Header Flutuante (Inspirado em josiasbroch-dev)

Data: 2026-10-13  
Status: Proposto para Aprovação  
Feature: [Barra de Navegação Moderna](../03-features/barra-navegacao-moderna-header/spec.md)

---

## 1. Contexto

A barra de navegação anterior do portfólio possuía uma apresentação básica e estática no topo da página:
1. Links em lista simples sem indicação visual da seção atualmente em exibição (*ScrollSpy*).
2. O seletor de idiomas consistia em um elemento HTML `<select>` cru inserido no bloco de apresentação do cabeçalho da página (`.header-top`), poluindo o espaço visual da introdução.
3. O download do currículo estava restrito ao rodapé/seção de contatos, exigindo que o recrutador ou visitante rolasse toda a página até o fim para encontrar o arquivo PDF.

O usuário solicitou a modernização da barra superior inspirando-se na referência visual de excelência [josiasbroch-dev.vercel.app](https://josiasbroch-dev.vercel.app/), adaptando-a para as funcionalidades do portfólio atual com três definições:
1. **Monograma Dinâmico:** Gerado automaticamente a partir do nome do autor cadastrado no banco (`copy().name` $\to$ Iniciais + `.dev`, ex: `JV.dev`, `MS.dev`, fallback `DEV`).
2. **Download CV (Opção A):** Botão cápsula na barra superior que abre um menu suspenso (*dropdown*) oferecendo as versões em Português e Inglês para download imediato.
3. **Seletor de Idioma em Menu Discreto:** Mover o controle de idioma para a barra superior, em um botão discreto de fácil acesso, limpando a área de apresentação.

---

## 2. Decisão

1. **Design System & Estética (Glassmorphism):**
   - A barra superior será fixa (`position: fixed; top: 0; left: 0; right: 0; z-index: 50;`).
   - Fundo translúcido com *backdrop-filter: blur(12px)* e borda sutil, com transição ao rolar a página.
2. **Monograma / Brand (Esquerda):**
   - Elemento interativo que exibe `<span class="brand-initials">{{ initials() }}</span><span class="brand-suffix">.dev</span>`.
   - Ao ser clicado, aciona `scrollIntoView` suave para o início da página (`#apresentacao`).
3. **Navegação Central em Pílulas com ScrollSpy:**
   - Container central em formato de pílula (*capsule bar*).
   - Uso de `IntersectionObserver` reativo com Signals do Angular para destacar em tempo real a seção visível na viewport com pílula de fundo e traço indicador animado.
4. **Ações da Direita:**
   - **Download CV Dropdown:** Botão cápsula com ícone de download e chevron; ao abrir, exibe opções para baixar a versão em Português ou Inglês, consumindo `curriculum()` do Supabase Storage ou fallbacks locais.
   - **Seletor de Idioma:** Botão discreto com ícone de globo/idioma exibindo o idioma atual e dropdown para alternância entre `Português (Brasil)` e `English`.
5. **Responsividade Móvel:**
   - Em telas `< 768px`, a barra preserva o monograma e o botão de ação rápida, ocultando os links horizontais e disponibilizando um botão de menu hambúrguer animado com painel retrátil.
6. **Agnosticismo & Retrocompatibilidade:**
   - 100% agnóstico (White-Label): funciona de forma transparente tanto para João Vitor quanto para Marcos Santos.
   - Preserva todos os `data-testid` (`language-select`, `compact-contact-links`, etc.) e atributos editoriais para garantir 100% de compatibilidade com a suíte de testes existente.

---

## 3. Consequências

- **Positivas:**
  - Experiência do usuário (UX) premium de nível sênior, com navegação intuitiva e acesso imediato ao currículo em ambos os idiomas a partir de qualquer ponto da rolagem.
  - O cabeçalho da página principal fica limpo e desobstruído de elementos `<select>`.
  - O código continua totalmente desacoplado e aderente ao padrão multi-tenant orientado a dados do Supabase.
- **Cuidados:**
  - Garantir fechamento acessível dos menus dropdowns ao clicar fora (`clickOutside`), pressionar tecla `Escape` ou navegar via teclado.
  - Preservar o orçamento de CSS e scripts para evitar alertas de bundle no build do Angular.

