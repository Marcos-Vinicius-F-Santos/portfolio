# Especificação de Funcionalidade — Barra de Navegação Moderna e Header Flutuante

Feature: Barra de Navegação Moderna e Header Flutuante  
Decisão Arquitetural: `spec/02-arquitetura/DECISAO-016-barra-navegacao-moderna-header.md`  
Status: Em Planejamento  
Data: 2026-10-13  

---

## 1. Contexto e Objetivo

Modernizar a barra superior do portfólio inspirando-se na referência visual [josiasbroch-dev.vercel.app](https://josiasbroch-dev.vercel.app/), incorporando:
1. Marca/monograma com iniciais dinâmicas do autor.
2. Navegação central em pílulas com indicador de seção ativa (*ScrollSpy*).
3. Botão de download rápido de currículo em formato de pílula com menu suspenso para escolha de idioma (Português ou Inglês).
4. Menu discreto de seleção de idioma integrado à barra superior.
5. Menu hambúrguer responsivo para telas móveis.

---

## 2. Requisitos Funcionais

- **RF-001 (Monograma Dinâmico):** Exibir no canto esquerdo da barra o monograma estilizado gerado a partir do nome do autor (ex: "João Vitor Dias Fernandes" $\to$ `JV.dev`, "Marcos Santos" $\to$ `MS.dev`, fallback `DEV`). Ao clicar, a página deve rolar suavemente para o topo.
- **RF-002 (Navegação em Pílulas com ScrollSpy):** Renderizar a lista de links de seções em container cápsula com efeito vidro (*glassmorphism*). Conforme o usuário rola a página, a seção visível deve receber destaque visual com pílula ativa e indicador animado.
- **RF-003 (Download CV Dropdown — Opção A):** No canto direito da barra, disponibilizar um botão pílula "Download CV" com ícone e chevron. Ao clicar, deve abrir um menu flutuante permitindo o download do currículo em Português (`PT-BR`) ou Inglês (`EN`).
- **RF-004 (Menu Discreto de Idioma):** Integrar um botão discreto de idioma com ícone na barra superior que, ao ser clicado, permite alternar entre `Português (Brasil)` e `English`.
- **RF-005 (Responsividade Móvel):** Em telas com largura menor que 768px, a barra horizontal deve compactar os links em um botão de menu hambúrguer com painel deslizante ou sanfona acessível.
- **RF-006 (Acessibilidade & Fechamento Inteligente):** Menus suspensos devem fechar automaticamente ao clicar fora, ao selecionar uma opção ou ao pressionar a tecla `Escape`.

---

## 3. Critérios de Aceite (Given / When / Then)

### Cenário 1: Exibição da Marca Dinâmica
- **Given** que a aplicação carrega o nome do autor do banco ou do fallback;
- **When** a barra de navegação é renderizada;
- **Then** o logotipo exibe as iniciais em destaque seguidas por `.dev`;
- **And** clicar no logotipo aciona o scroll suave para o topo da página.

### Cenário 2: Indicação da Seção Ativa (ScrollSpy)
- **Given** que o usuário está navegando pela página;
- **When** uma seção entra no campo de visão (viewport);
- **Then** o link correspondente na barra central recebe a classe/estilo de ativo e o indicador sublinhado animado;
- **And** ao clicar em um link, a página desliza suavemente até a seção correspondente.

### Cenário 3: Download de Currículo em Múltiplos Idiomas (Opção A)
- **Given** que o usuário clica no botão "Download CV";
- **When** o menu suspenso é aberto;
- **Then** são exibidas as opções para download em Português e Inglês;
- **And** ao clicar em uma opção, o download do respectivo arquivo PDF é iniciado e o menu é fechado.

### Cenário 4: Alternância de Idioma no Menu Discreto
- **Given** que o usuário clica no controle de idioma da barra;
- **When** seleciona outro idioma (ex: English);
- **Then** a aplicação atualiza todos os textos para o idioma selecionado;
- **And** o controle exibe o estado ativo correspondente.

### Cenário 5: Navegação em Dispositivos Móveis
- **Given** que a página é acessada em um dispositivo com largura < 768px;
- **When** o usuário toca no ícone de menu hambúrguer;
- **Then** o menu é expandido exibindo os links de seções, as opções de currículo e a seleção de idiomas;
- **And** tocar em qualquer link navega para o destino e fecha o menu automaticamente.

