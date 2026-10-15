# Spec da Feature — Envio Direto de Mensagem no Formulário de Contato (Web3Forms)

Status: Proposta para Aprovação
Projeto: Portfólio Profissional — João Vitor
Onde vive no código: `src/app/shared/components/contact-panel/`, integrado na seção pública de contato.

## 1. Objetivo

Permitir que um visitante (recrutador, cliente ou colega) envie uma mensagem diretamente pelo formulário de contato do portfólio sem abrir clientes externos de desktop (como Outlook, que gerava travamentos e falhas de protocolo `mailto:`). A mensagem será entregue de forma transparente na caixa postal de João Vitor (`profissional.joaovitordf@gmail.com`) utilizando a API segura e gratuita da Web3Forms, mantendo feedback visual imediato de sucesso e preservando a ação de envio alternativo via WhatsApp.

## 2. Como funciona hoje vs. O que muda

- **Hoje:**
  - O painel possui Nome, E-mail, Mensagem e dois botões: "Enviar pelo WhatsApp" e "Enviar por e-mail".
  - O botão de e-mail monta uma URL `mailto:` que falha em desktops quando o usuário usa webmail no navegador, abrindo abas em branco ou travando o sistema ao tentar iniciar o Outlook.
- **O que muda:**
  - O botão "Enviar por e-mail" passa a realizar um envio direto assíncrono via `fetch()` para o endpoint da Web3Forms.
  - Durante o envio, exibe indicador de carregamento ("Enviando...") e bloqueia múltiplos cliques.
  - Ao concluir com sucesso, exibe banner de sucesso elegante ("Mensagem enviada com sucesso! Entrarei em contato em breve.") e limpa os campos.
  - Se ocorrer falha de rede ou serviço indisponível, exibe mensagem clara de erro com opção de enviar pelo WhatsApp ou tentar novamente.
  - O botão "Enviar pelo WhatsApp" permanece funcionando 100% como já validado.

## 3. Requisitos funcionais (Given / When / Then)

### FR-001 — Envio assíncrono transparente
- **GIVEN** que o visitante preencheu Nome, E-mail válido e Mensagem
- **WHEN** clicar em "Enviar por e-mail"
- **THEN** o sistema deve disparar requisição POST HTTPS para `https://api.web3forms.com/submit` com a chave de acesso, nome, e-mail do remetente e corpo da mensagem, sem abrir nenhuma janela externa ou cliente de desktop.

### FR-002 — Estado de carregamento e prevenção de duplo clique
- **GIVEN** que o envio foi disparado e está em andamento
- **WHEN** o visitante observar o formulário
- **THEN** o botão deve apresentar estado de carregamento ("Enviando..."), desabilitando novos cliques até que a resposta chegue.

### FR-003 — Feedback visual de sucesso e limpeza de campos
- **GIVEN** que a API retornou status de sucesso (200 / success)
- **WHEN** a resposta for processada
- **THEN** o sistema deve apresentar uma notificação de sucesso com texto localizado (PT/EN), e resetar os campos Nome, E-mail e Mensagem para vazios.

### FR-004 — Tratamento de erro resiliente
- **GIVEN** que a requisição falhou por falta de conexão, timeout ou erro da API
- **WHEN** a falha for identificada
- **THEN** o sistema deve exibir mensagem clara de erro sem perder os dados preenchidos pelo usuário, permitindo nova tentativa ou sugestão de contato via WhatsApp.

### FR-005 — Suporte a chave configurável
- **GIVEN** o ambiente de execução
- **WHEN** a aplicação inicializar
- **THEN** a `access_key` da Web3Forms deve ser obtida prioritariamente via configuração de ambiente/runtime (`WEB3FORMS_ACCESS_KEY`), permitindo substituição sem recompilação, mantendo fallback funcional para desenvolvimento/testes.

### FR-006 — Internacionalização (PT / EN)
- **GIVEN** que o portfólio estiver em português ou inglês
- **WHEN** os feedbacks de envio, carregamento e erro forem exibidos
- **THEN** todos os textos devem respeitar o idioma atualmente selecionado pelo usuário.

## 4. Regras de negócio

- **BR-001:** O WhatsApp continua como canal direto alternativo prioritário.
- **BR-002:** Nenhuma credencial confidencial ou senha é exposta; chaves públicas de envio da Web3Forms são desenhadas para frontends com proteção por domínio e honeypot anti-spam.
- **BR-003:** O envio não requer backend próprio, Edge Functions ou persistência em banco nesta fase.

