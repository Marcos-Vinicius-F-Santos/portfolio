# Registro de Alterações — Thumbnails com Cadeado, Remoção da Window Bar e Alternância de Senha no Admin

Data: 18/10/2026  
Escopo:
1. Implementação do placeholder visual com cadeado e identificação de "Código Proprietário" para projetos privados, e "Código Aberto" para projetos públicos no `ProjectCardComponent`.
2. Remoção da barra superior de janela de navegador dos cards de projetos (`.project-card__window-bar`).
3. Adição do botão de alternância de visualização da senha (ícone de olho / eye toggle) na tela de autenticação do administrador (`/admin`).

---

## 1. Placeholder Visual de Cadeado e Código Proprietário

- **Rótulos Bilíngues (`portfolio-ui-labels.ts`):**
  - `proprietaryCode`: `"Código Proprietário"` (PT) / `"Proprietary Code"` (EN)
  - `openSourceCode`: `"Código Aberto"` (PT) / `"Open Source"` (EN)
- **Visual para Projetos Privados:**
  - Ícone de cadeado de segurança estilizado com glow âmbar/ouro (`rgba(196, 139, 82, 0.26)`).
  - Legenda em tipografia `Space Grotesk` uppercase com letter-spacing refinado exibindo `CÓDIGO PROPRIETÁRIO` (ou `PROPRIETARY CODE`).
- **Visual para Projetos Públicos:**
  - Ícone de código `< >` com glow verde e legenda `CÓDIGO ABERTO` (ou `OPEN SOURCE`).

---

## 2. Remoção da Barra Superior de Janela de Navegador (`window-bar`)

- Removida a barra superior (`.project-card__window-bar`) com os 3 círculos coloridos e o título duplicado em `project-card.component.html`.
- O card de projeto agora inicia diretamente na área da mídia/capa (16:10), que se ajusta perfeitamente ao `border-radius: 1.25rem` do card, conferindo um design mais limpo, minimalista e moderno.
- Removidas as regras CSS órfãs associadas à barra de janela em `project-card.component.css`.

---

## 3. Alternância de Visualização de Senha no Admin (`/admin`)

- Adicionado sinal reativo `showPassword = signal(false)` e método `toggleShowPassword()` em `AdminAuthenticationComponent`.
- Adicionado botão interativo com ícone SVG de olho (`eye`) / olho riscado (`eye-off`) no campo de senha em `admin-authentication.component.html`.
- Suporte a acessibilidade com `aria-label` dinâmico (`"Exibir senha"` / `"Ocultar senha"`).
- Estilização em `admin-authentication.component.css` com espaçamento interno à direita para evitar sobreposição de texto digitado e efeito hover/focus alinhado ao design system.

---

## 4. Validação e Testes

- **White-Label Gate:** `npm run check:white-label` aprovado (código 0).
- **Testes Unitários:** 36 arquivos / 191 testes passando (`npm test -- --watch=false`).
- **Build de Produção:** `npm run build` gerado com sucesso sem erros.
