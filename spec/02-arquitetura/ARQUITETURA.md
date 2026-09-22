# Arquitetura — Portfólio Profissional — Marcos Santos

Status: Rascunho  
Última atualização: 2026-09-22

## 1. Visão geral do sistema

O sistema será uma aplicação Angular com duas áreas dentro do mesmo projeto:

- uma experiência pública de página única, responsiva e bilíngue;
- uma área administrativa protegida, acessível somente por Marcos.

Não haverá um backend próprio separado. O Supabase fornecerá autenticação, API de acesso
aos dados, PostgreSQL e armazenamento de arquivos. A aplicação Angular consumirá esses
serviços através de uma camada de serviços da própria aplicação.

```text
                           [GitHub]
                              │
                              ▼
                           [Vercel]
                              │ deploy
                              ▼
                    [Aplicação Angular]
                       │             │
             leitura pública       rota protegida
                       │             │
                       ▼             ▼
                 [Supabase API]  [Supabase Auth]
                       │             │
                       └──────┬──────┘
                              ▼
                   [PostgreSQL + RLS]
                              │
                              ▼
                    [Supabase Storage]
```

Fluxos principais:

1. O visitante acessa a aplicação publicada na Vercel.
2. A página pública lê o conteúdo disponível no Supabase e apresenta a versão do idioma
   selecionado.
3. Marcos acessa a área administrativa e autentica-se com e-mail e senha.
4. Após a autenticação, a área administrativa pode criar e editar o conteúdo autorizado
   e enviar imagens de projetos ou arquivos de currículo.
5. As alterações salvas ficam imediatamente disponíveis para a página pública, conforme
   a decisão do produto de não utilizar rascunho e publicação separados.

Integrações externas visíveis ao visitante, como LinkedIn, GitHub, e-mail e telefone,
serão links de contato. Elas não constituem integrações de escrita ou sincronização com
serviços externos.

## 2. Princípio de organização: por domínio/feature, não por tipo de arquivo

A aplicação deve ser organizada por responsabilidade de negócio. Componentes, serviços e
modelos relacionados à mesma capacidade devem permanecer próximos, em vez de serem
espalhados em pastas globais por tipo de arquivo.

Estrutura inicial proposta:

```text
src/
  app/
    core/
      auth/                  # sessão, proteção da área administrativa e usuário único
      supabase/              # cliente e configuração do Supabase
      config/                # configuração carregada por ambiente
    features/
      portfolio/             # página pública e composição das seções
        presentation/        # apresentação, sobre, impacto, experiências, projetos,
                              # habilidades, formação e contato
        content/              # leitura e seleção do conteúdo por idioma
      admin/                 # área administrativa protegida
        authentication/      # entrada e encerramento de sessão
        content-management/  # inclusão e edição do conteúdo do portfólio
        media-management/    # imagens de projetos e arquivos de currículo
    shared/                  # elementos realmente compartilhados entre features
  assets/                    # recursos fixos do frontend

supabase/
  migrations/                # schema, relacionamentos, índices e políticas versionadas
  seed/                      # dados iniciais, se necessários para desenvolvimento
```

As subdivisões devem crescer somente quando houver conteúdo suficiente para justificá-las.
Por exemplo, experiências, projetos e habilidades podem começar dentro do domínio de
conteúdo e ser separados em features próprias apenas quando a complexidade exigir.

A estrutura de traduções será separada do conteúdo principal. O modelo de dados deve
permitir relacionar uma entidade de conteúdo à sua tradução em português e à sua
tradução em inglês, sem duplicar a regra de seleção de idioma em cada seção da interface.

## 3. Decisões grandes já tomadas

### 3.1 Angular em uma aplicação única

Angular será utilizado como preferência pessoal de Marcos e para manter a experiência
pública e a área administrativa no mesmo projeto frontend. A experiência pública será
uma página única; a área administrativa será uma rota protegida dentro da aplicação.

### 3.2 Supabase como backend gerenciado

Supabase será utilizado como alternativa ao Firebase já conhecida por Marcos. Ele
concentrará PostgreSQL, autenticação, API e armazenamento de arquivos, eliminando a
necessidade de um servidor backend próprio nesta fase.

### 3.3 Conteúdo relacional com traduções separadas

O conteúdo principal será persistido no PostgreSQL. As traduções ficarão em uma estrutura
separada, relacionada ao conteúdo original, para suportar português e inglês sem prender
o layout a textos fixos no código.

### 3.4 Um único administrador e publicação imediata

A área administrativa terá somente um administrador: Marcos. O acesso utilizará e-mail e
senha pelo Supabase Auth. Não haverá perfis ou permissões administrativas adicionais.

Toda alteração salva pelo administrador será imediatamente considerada pública. Não haverá
estado de rascunho, workflow de aprovação ou publicação posterior nesta fase.

### 3.5 Arquivos no Supabase Storage

Imagens de projetos e arquivos de currículo serão armazenados no Supabase Storage. O
PostgreSQL manterá as referências e os metadados necessários para o conteúdo utilizar
esses arquivos.

### 3.6 GitHub como origem e Vercel como deploy

O código será versionado no GitHub. Um novo projeto será criado na conta Vercel de Marcos
e conectado ao repositório do portfólio. A configuração do domínio será definida durante
o deploy.

## 4. Limites que não devem ser cruzados

- A interface pública não pode permitir escrita ou alteração de conteúdo.
- Toda escrita de conteúdo deve passar pela área administrativa autenticada e pelas
  políticas de acesso do Supabase.
- As políticas de Row Level Security (RLS) devem restringir operações de escrita ao único
  administrador autorizado.
- Nenhuma chave de service role, senha ou segredo pode ser enviado ao frontend ou
  versionado no GitHub.
- A aplicação frontend deve usar variáveis de ambiente para as configurações por
  ambiente. O cliente público do Supabase não substitui as políticas RLS.
- Componentes de apresentação não devem conter chamadas diretas ao banco. A leitura e a
  escrita devem passar pelos serviços da feature correspondente.
- A área administrativa não deve duplicar regras de conteúdo que já pertençam ao domínio
  de conteúdo compartilhado.
- Imagens e currículos não devem ser armazenados como dados binários dentro das tabelas
  de conteúdo; devem usar o Storage e referências persistidas no banco.
- Alterações no schema, relacionamentos ou políticas devem ser feitas por migrations
  versionadas, com caminho de volta definido antes da aplicação.
- O conteúdo de experiências relacionadas a empresas deve permanecer anonimizado e não
  pode expor informações confidenciais.
- O layout público deve continuar extensível para novos projetos sem exigir alteração na
  estrutura principal da página.
- O fluxo público deve continuar sendo uma única página responsiva, mesmo que a aplicação
  contenha uma rota separada para a administração.

## 5. O que fica de fora (por agora)

- backend próprio, microsserviços ou funções de negócio fora dos serviços do Supabase;
- múltiplos administradores, papéis, permissões avançadas ou gestão de equipe;
- login, cadastro ou área personalizada para visitantes;
- workflow de rascunho, revisão e publicação;
- fila de mensagens, processamento assíncrono ou arquitetura orientada a eventos;
- cache distribuído, busca avançada ou sincronização em tempo real;
- CMS externo;
- formulário persistente de contato;
- blog e publicação de artigos;
- múltiplas páginas na experiência pública;
- aplicação mobile nativa;
- integração de escrita ou sincronização automática com LinkedIn, GitHub ou outros perfis
  profissionais;
- definição do domínio público final da Vercel;
- refinamento definitivo da identidade visual além da primeira versão funcional.

