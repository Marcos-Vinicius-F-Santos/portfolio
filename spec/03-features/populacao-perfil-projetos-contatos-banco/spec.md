# Spec da Feature — Ativação de Foto de Perfil, Projetos e Contatos via White-Label e Banco de Dados

Status: Proposta para Aprovação de João Vitor  
Data: 15/10/2026  
Projeto: Portfólio Profissional (`joaovitordf/portfolio`)  
Onde vive no código:
- `public/profile.jpg` (cópia neutra de `C:\Users\xjoao\Desktop\linkedin.jpg`)
- `.env` (`PORTFOLIO_PROFILE_IMAGE_URL=/profile.jpg`)
- `scripts/bundle-editorial-sql.mjs` e `scripts/generate-initial-editorial-snapshot.mjs`
- `spec/05-verificacao/joao-vitor/` (snapshot e script SQL para carga no Supabase)
- `src/app/features/portfolio/pages/portfolio-page/` (renderização pública de hero, projetos e contato)

---

## 1. Contexto e Motivação

1. **Impacto da Arquitetura White-Label:**
   - Com o merge do upstream, o código-fonte compartilhado (`src/app/`) foi completamente desacoplado de identidades autorais hardcoded.
   - Os links de contato (`PORTFOLIO_CONTACT_LINKS = []`) e os projetos (`projects = []`) foram zerados no código compartilhado para que venham exclusivamente do banco de dados (Supabase) via snapshot publicado.
   - Como resultado, quando o banco de dados Supabase não está conectado ou não possui dados publicados:
     - A foto de perfil recorre ao avatar neutro SVG (`/assets/profile/avatar-generic.svg`);
     - Os botões de contato (LinkedIn, E-mail, GitHub, Telefone) não são renderizados;
     - A seção `#portfolio` é ocultada porque não há projetos carregados.

2. **Diretriz Expressa de João Vitor:**
   - João Vitor solicitou:
     > *"Coloca minha foto ali, pega a foto chamada linkedin que esta na area de trabalho. Alem disso, no final, na section de contact me, esta faltando os botoes que antes eu gostava, contendo cards com linkedin, email, github e telefone. Alem disso, cade a section de portfolio? FAZER ISSO TUDO PRIORIZANDO A QUESTAO DO WHITELABEL, OU SEJA, SE FOR PRECISO POPULAR O BANCO DE DADOS, FAZER ISSO AO INVES DE COLOCAR MEU NOME OU QUALQUER COISA ESPECIFICA MANUALMENTE EM CODIGO. monte o sdd"*
   - Essa diretriz reforça 100% a conformidade com as regras de negócio white-label (BR-001, BR-002, BR-003).

3. **Diagnóstico da Conexão com o Supabase:**
   - Ao testar a URL cadastrada no `.env` (`https://efxcpncyzqtfaewdbaar.supabase.co`), foi identificado o erro `ENOTFOUND`.
   - No plano gratuito do Supabase, instâncias sem consultas por 7 dias são automaticamente pausadas, removendo a resolução DNS do subdomínio.
   - Para reativar o banco, João Vitor precisará acessar o dashboard (`https://supabase.com/dashboard/project/efxcpncyzqtfaewdbaar`) e clicar em "Restore Project" / "Resume".
   - Enquanto isso, a foto de perfil pode ser ativada imediatamente via runtime config (`PORTFOLIO_PROFILE_IMAGE_URL`), que tem precedência na arquitetura white-label.

---

## 2. Requisitos Funcionais (Given / When / Then)

### FR-001 — Foto de Perfil via Runtime Config e Asset Neutro
- **GIVEN** a foto `C:\Users\xjoao\Desktop\linkedin.jpg`
- **WHEN** for copiada para `public/profile.jpg` e configurada em `.env` como `PORTFOLIO_PROFILE_IMAGE_URL=/profile.jpg`
- **THEN** a foto real de João Vitor deve ser exibida no círculo de apresentação do Hero
- **AND** nenhum nome próprio deve constar no nome do arquivo ou no código compartilhado, passando com sucesso pelo `scripts/check-white-label-references.mjs`.

### FR-002 — Preparação do Snapshot e Script SQL de Carga (Supabase)
- **GIVEN** os dados pessoais e profissionais de João Vitor:
  - 4 contatos: LinkedIn, GitHub, E-mail, Telefone;
  - 2 projetos: *Russian Mastery* e *Pipeline de Visão Computacional para Boxe*;
  - Habilidades e entidade `profile`;
- **WHEN** for gerado o snapshot editorial v1 e o script SQL `spec/05-verificacao/joao-vitor/setup_joao_vitor.sql`
- **THEN** o script deve conter a criação dos buckets (incluindo `editorial-profile-images`), tabelas, triggers, RLS policies e a publicação do snapshot correspondente à instância de João Vitor.

### FR-003 — Exibição dos Botões/Pills de Contato na Seção `#contato`
- **GIVEN** a página pública do portfólio conectada ao banco de dados com snapshot publicado
- **WHEN** a seção `#contato` for renderizada
- **THEN** a coluna esquerda deve exibir os 4 pills de plataformas com ícone, label e valor legível:
  - LinkedIn: `linkedin.com/in/exemplo`
  - GitHub: `github.com/exemplo`
  - E-mail: `contato@exemplo.com`
  - Telefone: `+55 (11) 99999-0000`
- **AND** ao clicar no pill, deve abrir a plataforma correspondente em nova aba (ou cliente de e-mail / discador).

### FR-004 — Exibição da Vitrine de Projetos `#portfolio`
- **GIVEN** a página pública do portfólio conectada ao banco de dados com snapshot publicado
- **WHEN** a lista de projetos for carregada
- **THEN** a seção `#portfolio` deve ser exibida na página e na navegação
- **AND** deve apresentar os tabs de filtro (*Todos*, *Profissionais*, *Pessoais*)
- **AND** renderizar os cards dos projetos (*Russian Mastery* e *Pipeline de Visão Computacional para Boxe*) com título, descrição, tags de tecnologia e links para os repositórios no GitHub.

### FR-005 — Resiliência com Fallback Local Parametrizado (Opcional offline)
- **GIVEN** que a conexão com o Supabase esteja temporariamente indisponível (projeto pausado ou sem internet)
- **WHEN** a aplicação inicializar
- **THEN** se configurado um snapshot local em `public/initial-snapshot.json` (ou lido pelo serviço de fallback neutro parametrizado), a aplicação pode apresentar os dados publicados mesmo antes da reativação do DNS do Supabase.

---

## 3. Critérios de Aceite (DoD)

1. [ ] A foto real de João Vitor (`linkedin.jpg`) é exibida no Hero da aplicação através de `PORTFOLIO_PROFILE_IMAGE_URL=/profile.jpg`.
2. [ ] O arquivo `public/profile.jpg` não viola o gate white-label (`node scripts/check-white-label-references.mjs`).
3. [ ] Script SQL `spec/05-verificacao/joao-vitor/setup_joao_vitor.sql` gerado e pronto para execução no Supabase de João Vitor.
4. [ ] Seção `#contato` exibe os 4 botões de contato (LinkedIn, GitHub, E-mail, Telefone).
5. [ ] Seção `#portfolio` está visível e exibe os cards dos projetos (*Russian Mastery* e *Boxe*).
6. [ ] 100% dos testes unitários passando (`npm test`).
7. [ ] Build de produção (`npm run build`) concluído com sucesso.
8. [ ] Aprovação formal de João Vitor.

