# Spec da Feature — Layout de Contato Moderno em Duas Colunas (Estilo Josias Broch)

Status: Aprovada  
Projeto: Portfólio Profissional — João Vitor Dias Fernandes  
Onde vive no código:  
- `src/app/features/portfolio/pages/portfolio-page/`  
- `src/app/shared/components/contact-panel/`  
- `src/app/features/portfolio/services/portfolio-content.ts`  
- `src/app/features/portfolio/services/portfolio-translations.ts`  

---

## 1. Objetivo

Modernizar a seção final da página (`#contato`), transformando o layout atual em uma composição moderna de **duas colunas** inspirada na referência de excelência ([josiasbroch-dev.vercel.app](https://josiasbroch-dev.vercel.app/)), posicionando:
- **Coluna da Esquerda**: Texto explicativo detalhado de disponibilidade e a lista vertical de cards modernos das plataformas de contato (E-mail, WhatsApp, LinkedIn, GitHub e Currículo em PDF).
- **Coluna da Direita**: Formulário de envio de mensagem direto e elegante (`app-contact-panel`) com campos para Nome, E-mail e Mensagem, botões com ícone de envio e mensagem explicativa de redirecionamento.

---

## 2. Como funciona hoje

Atualmente, a seção de contato exibe os links em uma grade horizontal de 5 blocos (`.contact-grid`) e posiciona o painel de formulário abaixo dos links em uma largura de 50%. A apresentação carece do contexto explicativo presente na referência e não aproveita a largura da tela em um layout de duas colunas balanceadas.

---

## 3. Requisitos funcionais

### FR-001 — Cabeçalho e Texto Explicativo de Contato
QUANDO a seção `#contato` for renderizada  
O SISTEMA DEVE apresentar no cabeçalho introdutório (ocupando a largura total das duas colunas, acima dos cards):
1. Eyebrow de seção (`CONTATO` / `CONTACT`).
2. Headline calorosa e profissional (`Vamos Trabalhar Juntos!` / `Let's Work Together!`).
3. Subtítulo descritivo (`Tem um projeto, oportunidade ou desafio interessante? Vamos conversar.` / `Have a project, opportunity or interesting challenge? Let's talk.`).
4. Parágrafo explicativo detalhado preenchendo toda a largura superior antes da divisão das duas colunas de cards.

### FR-002 — Coluna da Esquerda: Cards Modernos de Plataformas
QUANDO a seção `#contato` for renderizada  
O SISTEMA DEVE exibir na coluna da esquerda os cards horizontais para cada canal de contato:
1. **E-mail**: `contato@exemplo.com`
2. **WhatsApp / Telefone**: `+55 (11) 99999-0000`
3. **LinkedIn**: `linkedin.com/in/exemplo`
4. **GitHub**: `github.com/exemplo`
5. **Currículo (PDF)**: Botão de download do currículo no idioma ativo (`curriculum-pt.pdf` ou `curriculum-en.pdf`).

Cada card deve conter:
- Ícone vetorial SVG em caixa arredondada de acento.
- Rótulo superior em caixa alta sutil (ex: `EMAIL`, `WHATSAPP`, `LINKEDIN`, `GITHUB`).
- Valor / link em destaque com truncamento seguro.
- Efeito hover com elevação suave (`translateY(-2px)`) e realce de borda.

### FR-003 — Coluna da Direita: Formulário de Mensagem Refinado e Alinhado
QUANDO o formulário de contato (`app-contact-panel`) for renderizado na coluna da direita  
O SISTEMA DEVE apresentar um card estilizado ocupando o mesmo espaço e altura da coluna da esquerda (alinhado no topo e na base com a pilha de cards da esquerda), contendo:
- Campos de Nome, E-mail e Mensagem com placeholders claros e foco visual consistente.
- Botões de ação com ícone vetorial de envio (avião de papel).
- Nota explicativa inferior: *"Você será redirecionado para o WhatsApp / E-mail para enviar a mensagem."*
- Preservação dos contratos de teste existentes (`data-testid="contact-panel"`, `data-testid="contact-panel-whatsapp"`, `data-testid="contact-panel-email"`).

### FR-004 — Preservação dos Seletores e Testes Existentes
QUANDO a suíte de testes for executada  
O SISTEMA DEVE manter a integridade dos IDs e atributos de teste:
- `data-testid="contact-links"` englobando os links das plataformas.
- `data-testid="contact-curriculum"` identificando o link de currículo.
- `data-testid="contact-panel"` dentro de `app-contact-panel.contact-panel-layout`.
- A ordem dos elementos no DOM para consulta por seletores deve manter compatibilidade com as asserções existentes.

### FR-005 — Responsividade e Internacionalização
QUANDO o portfólio for visualizado em dispositivos móveis ou desktop  
O SISTEMA DEVE exibir em desktop uma grade de 2 colunas (`lg:grid-cols-2`) e em dispositivos móveis uma coluna única fluida, com textos totalmente traduzidos conforme o idioma selecionado (PT-BR ou EN).

---

## 4. Critérios de aceite

### AC-001 — Layout em duas colunas no desktop
Dado que o usuário acessa o portfólio em resolução desktop (>= 1024px)  
Quando visualizar a seção `#contato`  
Então as plataformas de contato devem estar posicionadas na coluna da esquerda  
E o formulário de mensagem deve estar posicionado na coluna da direita, lado a lado.

### AC-002 — Disposição das plataformas e informações
Dado que a coluna da esquerda é renderizada  
Quando o visitante visualiza as plataformas  
Então devem ser exibidos cards estilizados para E-mail, Telefone/WhatsApp, LinkedIn, GitHub e Currículo, com seus respectivos rótulos, valores e ícones.

### AC-003 — Funcionamento do formulário de mensagem
Dado que o visitante preenche o formulário na coluna da direita  
Quando clicar em enviar via WhatsApp ou E-mail  
Então os dados devem ser validados e o canal correspondente acionado com a mensagem formatada.

### AC-004 — Suíte de testes e regressão zero
Dado que as alterações foram aplicadas  
Quando os testes unitários forem executados (`npm test`)  
Então todos os testes da aplicação devem passar com 100% de sucesso.

