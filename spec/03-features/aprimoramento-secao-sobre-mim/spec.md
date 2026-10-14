# Spec da Feature — Aprimoramento da Seção "Sobre mim" com Estilo Moderno e Pilares de Engenharia

Status: Aprovada  
Projeto: Portfólio Profissional — João Vitor Dias Fernandes  
Onde vive no código:  
- `src/app/features/portfolio/services/portfolio-content.ts`  
- `src/app/features/portfolio/services/portfolio-translations.ts`  
- `src/app/features/portfolio/pages/portfolio-page/`  

---

## 1. Objetivo

Aprimorar a seção **"Sobre mim"** (`#sobre-mim`), elevando sua apresentação visual e profundidade técnica para um padrão de qualidade comparável à referência de mercado ([josiasbroch-dev.vercel.app](https://josiasbroch-dev.vercel.app/)), alinhando integralmente o conteúdo à trajetória real e ao currículo de João Vitor Dias Fernandes.

A seção deve comunicar com clareza a formação como Bacharel em Ciência da Computação (IFMG), a experiência sólida em produção (SensorEng, Avante, Polo de Inovação IFMG), a postura orientada a boas práticas e arquitetura de software, complementada por um grid visual de três pilares de especialidade técnica com ícones vetoriais modernos e suporte bilíngue completo (PT-BR e EN).

---

## 2. Como funciona hoje

A seção `#sobre-mim` é renderizada como um bloco genérico com um título `h2` ("Sobre mim") e um único parágrafo de texto corrido curto. O texto atual não explora o histórico de impacto de João Vitor (como redução de 85% de bundle, telemetria em tempo real, bibliotecas reutilizáveis, OCR e visão computacional) nem possui diferenciação visual de cards ou pilares.

---

## 3. Requisitos funcionais

### FR-001 — Headline de Posicionamento e Bio Narrativa
QUANDO a seção "Sobre mim" for exibida  
O SISTEMA DEVE apresentar:
1. O identificador / título de seção (`Sobre mim` / `About me`).
2. Uma headline de impacto técnico que sintetize a proposta de valor profissional de João Vitor (*"Construindo soluções robustas com engenharia de software, performance e visão técnica"*).
3. Uma narrativa profissional detalhada destacando a formação em Ciência da Computação pelo IFMG, a vivência em desenvolvimento de software e sistemas em produção, plataformas de monitoramento industrial em tempo real e arquiteturas modulares.
4. Um bloco de destaque para as principais tecnologias de foco (TypeScript, Angular, Python/FastAPI, Java/Spring Boot, OpenCV/YOLOv8, PostgreSQL, Supabase e Docker).

### FR-002 — Grid de Três Pilares Técnicos (Cards com Ícones)
QUANDO a seção "Sobre mim" for renderizada  
O SISTEMA DEVE exibir um grid responsivo com 3 cards de especialidade técnica baseados no currículo do autor:
1. **Engenharia Front-end & Performance**: foco em SPAs escaláveis (Angular, TypeScript), arquitetura modular com lazy loading (redução de 85% de pacote), bibliotecas de componentes reutilizáveis (-60% tempo de entrega) e telemetria de sensores em tempo real.
2. **Backend & Integrações Corporativas**: foco em APIs RESTful de alta performance (FastAPI, Spring Boot, Laravel), modelagem e persistência (PostgreSQL, Supabase), cache com Redis e containerização Docker.
3. **Visão Computacional & Automação Inteligente**: foco em pipelines em tempo real (OpenCV, YOLOv8), OCR automatizado para reconhecimento e extração documental e inferência integrada a fluxos de vídeo.

Cada card deve conter:
- Ícone vetorial SVG nítido em cor de acento.
- Título do pilar em tipografia Space Grotesk.
- Descrição clara e concisa das competências e tecnologias aplicadas.
- Efeitos visuais de elevação e realce de borda ao passar o cursor (hover).

### FR-003 — Internacionalização (Bilíngue PT-BR / EN)
QUANDO o idioma da página for alternado entre Português e Inglês  
O SISTEMA DEVE atualizar dinamicamente todos os textos da seção (título, headline, narrativa, linha de foco e os 3 cards) para o idioma selecionado, sem perda de estado, recarga de página ou quebra de layout.

### FR-004 — Compatibilidade com o Sistema Editorial e CMS
QUANDO a aplicação for executada em modo editorial ou carregar snapshots do Supabase  
O SISTEMA DEVE manter a estabilidade dos seletores de âncora (`#sobre-mim`, `[data-editorial-section-id="about-section"]`) e dos atributos de edição de texto para os campos de cópia da seção.

---

## 4. Regras de negócio

- **BR-001**: O conteúdo da seção deve refletir estritamente as qualificações e projetos reais do currículo de João Vitor Dias Fernandes, sem dados ou alegacões fictícias.
- **BR-002**: O design visual dos cards deve seguir rigorosamente os tokens de design do portfólio (paleta bege/marrom, tipografia Inter & Space Grotesk, cantos arredondados e bordas sutis).
- **BR-003**: A responsividade deve garantir visualização ideal em mobile (cards empilhados em 1 coluna) e desktop (grid em 3 colunas balanceadas).

---

## 5. Critérios de aceite

### AC-001 — Caminho feliz (Renderização completa no idioma padrão)
Dado que a página pública do portfólio foi carregada em `pt-BR`  
Quando o usuário visualizar a seção `#sobre-mim`  
Então o título "Sobre mim", a headline de engenharia, a bio profissional detalhada e o destaque de foco tecnológico devem estar visíveis  
E exatamente três cards de pilares técnicos devem ser renderizados com seus respectivos ícones vetoriais e textos explicativos.

### AC-002 — Alternância de idioma (English)
Dado que a seção `#sobre-mim` está visível  
Quando o usuário selecionar o idioma `English (EN)`  
Então todos os elementos da seção devem ser exibidos em inglês ("About me", headline em inglês, bio em inglês e os três cards em inglês).

### AC-003 — Responsividade e Comportamento Visual
Dado que o portfólio é visualizado em tela móvel (largura < 768px) ou desktop (>= 1024px)  
Quando a página for renderizada  
Então em dispositivos móveis os cards de pilares devem se organizar verticalmente de forma limpa, e em desktop devem formar um grid equilibrado de 3 colunas com efeitos fluidos de hover.

