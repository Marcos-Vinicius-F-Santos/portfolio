# Spec da Feature — Área administrativa autenticada

> **Reconciliação editorial — 2026-09-26:** /admin preserva autenticação do único administrador e passa a dar acesso ao editor/preview privados. O modo visual não substitui autorização no servidor. A [spec de edição visual](../edicao-visual-rascunho-publicacao/spec.md) prevalece nesses pontos quando implantada. Os requisitos anteriores continuam referência para o comportamento não alterado e a regressão; esta nota não comprova implementação ou testes.

Status: Aprovada  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/core/auth/` e `src/app/features/admin/`, conforme
`spec/02-arquitetura/ARQUITETURA.md`

## 1. Objetivo

Criar uma área administrativa protegida para que Marcos possa acessar as
funcionalidades administrativas do portfólio usando autenticação por e-mail e senha
do Supabase Auth. O acesso deve ser restrito exclusivamente a Marcos.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

Não se aplica como mudança de comportamento existente: o projeto é novo e ainda não
possui área administrativa, tela de autenticação, rota protegida ou fluxo de acesso
administrativo.

A integração com o Supabase já prevê policies para restringir futuras escritas ao
administrador, mas ainda não implementa o fluxo de autenticação nem a proteção da área
administrativa.

## 3. Requisitos funcionais

### FR-001

QUANDO Marcos informar seu e-mail e sua senha válidos  
O SISTEMA DEVE autenticar Marcos por meio do Supabase Auth e permitir seu acesso à área
administrativa.

### FR-002

QUANDO uma pessoa não autenticada tentar acessar a área administrativa  
O SISTEMA DEVE impedir o acesso às funcionalidades administrativas.

### FR-003

QUANDO uma conta autenticada que não seja a conta autorizada de Marcos tentar acessar
a área administrativa  
O SISTEMA DEVE impedir o acesso às funcionalidades administrativas.

### FR-004

QUANDO o sistema verificar a autorização para a área administrativa  
O SISTEMA DEVE considerar somente Marcos como administrador autorizado.

### FR-005

QUANDO a autenticação da área administrativa for realizada  
O SISTEMA DEVE utilizar o Supabase Auth com e-mail e senha.

### FR-006

QUANDO Marcos concluir uma autenticação válida  
O SISTEMA DEVE manter sua sessão persistida para acessos futuros à área administrativa;
uma conta diferente da conta autorizada não deve manter uma sessão administrativa
persistida.

## 4. Regras de negócio

### BR-001

Existe somente um administrador autorizado: Marcos.

### BR-002

Visitantes do portfólio não precisam se autenticar para acessar a experiência pública,
mas não podem acessar as funcionalidades administrativas.

### BR-003

A autenticação administrativa utiliza e-mail e senha pelo Supabase Auth. Não fazem
parte desta feature outros métodos de autenticação.

### BR-004

Estar autenticado não é suficiente para acessar a administração; a conta autenticada
também deve ser a conta autorizada de Marcos.

### BR-005

A persistência de sessão administrativa é permitida somente para a conta autorizada de
Marcos. Uma conta autenticada diferente deve ser desautorizada e ter sua sessão
encerrada antes de qualquer acesso administrativo.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que a conta de Marcos esteja configurada no Supabase Auth e que ele informe
credenciais válidas  
Quando Marcos tentar entrar na área administrativa  
Então o sistema deve autenticá-lo e permitir seu acesso às funcionalidades
administrativas.

### AC-002 — caminho de erro: visitante não autenticado

Dado que uma pessoa não esteja autenticada  
Quando ela tentar acessar a área administrativa  
Então o sistema deve impedir o acesso às funcionalidades administrativas.

### AC-003 — caminho de erro: conta não autorizada

Dado que uma conta diferente da conta autorizada de Marcos esteja autenticada  
Quando essa conta tentar acessar a área administrativa  
Então o sistema deve impedir o acesso às funcionalidades administrativas.

### AC-004 — caminho de erro: credenciais inválidas

Dado que sejam informados um e-mail ou uma senha inválidos  
Quando a pessoa tentar autenticar-se na área administrativa  
Então o sistema não deve conceder acesso à área administrativa.

### AC-005 — persistência da sessão autorizada

Dado que Marcos tenha concluído uma autenticação válida  
Quando ele retornar à aplicação após o encerramento da visita  
Então a sessão deve permanecer persistida e permitir novamente o acesso administrativo,
sem exigir nova autenticação enquanto a sessão permanecer válida.

## 6. Casos de erro / edge cases

- Credenciais inválidas → a autenticação deve falhar e o acesso administrativo não deve
  ser concedido.
- Pessoa não autenticada tentando acessar diretamente a área protegida → o acesso deve
  ser impedido.
- Conta autenticada que não corresponde à conta autorizada de Marcos → o acesso deve
  ser impedido.
- Configuração indisponível ou falha do Supabase Auth → a autenticação não deve ser
  tratada como bem-sucedida nem conceder acesso administrativo.
- Conta autenticada diferente da conta autorizada → o acesso deve ser impedido e a
  sessão dessa conta deve ser encerrada, sem persistência de sessão administrativa.

## 7. Fora de escopo desta feature

- Cadastro público de usuários.
- Login ou área personalizada para visitantes.
- OAuth ou outros métodos de autenticação além de e-mail e senha.
- Gestão de múltiplos administradores, papéis ou permissões avançadas.
- Recuperação ou alteração de senha.
- Detalhamento das telas, formulários e operações para editar textos, experiências,
  projetos ou imagens.
- Definição de campos e migrations do conteúdo administrativo.
- Publicação, rascunho ou aprovação de conteúdo.
- Configuração de deploy ou domínio.

## 8. Suposições e perguntas abertas

- [x] **Suposição:** esta feature define a autenticação e a proteção de acesso; as
      funcionalidades específicas de edição de conteúdo e imagens serão detalhadas em
      features próprias.
- [x] **Decisão:** a conta autorizada de Marcos é a conta do Supabase Auth com UUID
      `21fbb14d-8e11-4166-b320-639d8a7cb4df`.
- [x] **Decisão:** o cadastro e a vinculação dessa conta à allowlist serão feitos
      manualmente no painel ou no procedimento operacional aprovado.
- [x] **Decisão:** a sessão de Marcos será persistida; uma conta diferente não terá
      sessão administrativa persistida e será encerrada quando for desautorizada.
- [x] **Decisão:** credenciais inválidas, conta não autorizada e indisponibilidade do
      Supabase usarão o tratamento visual padrão da aplicação.
- [x] **Decisão:** a entrada da autenticação e a área administrativa utilizarão a rota
      `/admin`, acessível por navegação direta pela URL e sem link público na página.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] Casos de erro de prioridade alta tratados.
- [ ] Visitantes continuam acessando a experiência pública sem autenticação.
- [ ] Nenhuma conta diferente da conta autorizada de Marcos acessa a área administrativa.
- [ ] Testado conforme o plano de verificação da feature.
- [ ] Spec, plano, código e testes conferidos quanto à convergência.
- [ ] Marcos revisou e aprovou antes de qualquer deploy.
