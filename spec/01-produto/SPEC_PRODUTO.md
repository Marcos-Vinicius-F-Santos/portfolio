# Spec do Produto — Portfólio Profissional — Marcos Santos

Status: Rascunho  
Tipo de projeto: Portfólio  
Criado em: 2026-09-22  
Última atualização: 2026-09-22

## 1. Objetivo

Criar um site portfólio pessoal, bilíngue e responsivo para apresentar Marcos Santos
como engenheiro de software e facilitar oportunidades de entrevistas, contatos
profissionais e novas colaborações.

O site deve comunicar rapidamente sua atuação em engenharia de software, arquitetura de
soluções, integrações corporativas, automação de processos e transformação digital. Deve
também apresentar sua trajetória, competências, resultados profissionais e projetos de
forma técnica, objetiva e segura.

O conteúdo público será organizado em uma única página, com alternância entre português
e inglês durante a navegação. Uma área administrativa permitirá adicionar e editar o
conteúdo principal, incluindo experiências, textos, projetos e imagens de projetos, sem
precisar alterar o layout público a cada novo conteúdo.

## 2. Sistema existente (só se for brownfield)

Não se aplica. Este é um projeto novo.

## 3. Funcionalidades (visão geral, em ordem de construção)

1. **Estrutura base do portfólio público** — criar a aplicação Angular, a identidade
   visual técnica, a estrutura de página única e o comportamento responsivo.
2. **Conteúdo bilíngue** — permitir alternar entre português e inglês e apresentar o
   conteúdo correspondente ao idioma selecionado durante a navegação. As traduções serão
   armazenadas em uma estrutura separada, relacionada ao conteúdo principal.
3. **Integração de conteúdo** — conectar a aplicação ao Supabase para ler o conteúdo
   publicado, mantendo textos, experiências, projetos, imagens e demais informações
   principais fora do layout fixo.
4. **Apresentação inicial e perfil profissional** — implementar a apresentação de Marcos
   e a seção “Sobre mim”, destacando análise de alternativas técnicas, trade-offs,
   soluções reutilizáveis, sistemas escaláveis e sustentáveis, colaboração,
   adaptabilidade e empatia.
5. **Resultados profissionais** — apresentar, de forma objetiva e contextualizada, os
   seguintes resultados divulgáveis:
   - suporte a uma plataforma utilizada por mais de 2.000 usuários mensais;
   - redução de processos de onboarding de dias para horas;
   - redução de etapas manuais de 8–10 para 3–5;
   - redução aproximada de 50% no esforço de mapeamento JSON;
   - redução de 25% nas solicitações de alteração em formulários;
   - redução de 30% no tempo de conclusão de tarefas.
6. **Experiências profissionais** — exibir as experiências em ordem cronológica, incluindo
   os nomes das empresas e os cargos aprovados para publicação. A primeira experiência será apresentada como atuação
   em uma empresa de grande porte do setor de laticínios, de maio de 2025 a março de
   2026, com decisões arquiteturais, modernização do cadastro de produtores, integrações,
   módulos compartilhados e componentes reutilizáveis. A segunda será apresentada como
   atuação em uma empresa de digitalização corporativa, de dezembro de 2023 a maio de
   2025, com formulários dinâmicos, modernização de interfaces legadas e migração para
   uma interface baseada em React.

   Cada experiência deve permitir apresentar período, contexto, responsabilidades,
   decisões técnicas e resultados alcançados.
7. **Projetos** — apresentar projetos com nome, descrição, problema ou contexto,
   solução proposta, papel desempenhado, principais decisões técnicas, tecnologias,
   resultados, aprendizados e links publicados para código, demonstração ou
   documentação. A estrutura deve permitir adicionar novos projetos sem alterar o layout
   principal. Projetos relacionados a empresas ou sistemas internos devem ser descritos
   sem informações confidenciais.
8. **Habilidades** — apresentar habilidades organizadas por categorias:
   - linguagens e runtime: Java, JavaScript, TypeScript, Node.js e ABAP;
   - sistemas corporativos e integrações: SAP, RFC, BAPI, JCo, REST APIs, SMTP, Mendix
     e OutSystems;
   - frontend: React, HTML e CSS;
   - DevOps e observabilidade: Docker, Gradle, Maven e Grafana;
   - bancos de dados: SQL Server, MySQL, PostgreSQL e MongoDB;
   - versionamento: Git, GitHub e GitLab.
9. **Formação acadêmica** — apresentar as pós-graduações em Ciência de Dados e
   Estatística Aplicada realizadas na Unopar Anhanguera.
10. **Contato e currículos** — disponibilizar LinkedIn, GitHub, e-mail e telefone, com
    links funcionais para os perfis profissionais. Permitir o download dos currículos em
    português e inglês, utilizando o arquivo correspondente ao idioma selecionado.
11. **Área administrativa** — disponibilizar uma área protegida para que Marcos possa
    adicionar e editar o conteúdo principal do portfólio, incluindo textos,
    experiências e projetos, além de adicionar imagens de projetos. As alterações devem
    ser persistidas no Supabase e ficar imediatamente públicas na página pública.
12. **Publicação e verificação** — configurar o repositório no GitHub e o deploy na
    Vercel, validar os fluxos públicos e administrativos e revisar o resultado antes da
    aprovação para publicação.

## 4. Fora de escopo

Nesta fase, não fazem parte do produto:

- login ou cadastro para visitantes do portfólio;
- múltiplos perfis administrativos, permissões avançadas ou gestão de equipe;
- blog, notícias ou publicação de artigos;
- formulário persistente de contato ou caixa de mensagens armazenada;

- publicação de informações confidenciais de empresas, clientes ou sistemas internos;
- alteração manual direta dos dados de produção sem migration quando houver mudança de
  schema;
- necessidade de alterar o layout principal para adicionar novos projetos;
- aplicação mobile nativa;
- múltiplas páginas na experiência pública do portfólio;
- uso de um CMS externo.

A área administrativa é parte do escopo, mas permanece restrita ao proprietário do
portfólio. O site público continua sendo uma experiência de página única.

## 5. Stack técnico e por quê

| Camada | Escolha | Motivo |
|---|---|---|
| Frontend | Angular | Preferência pessoal e alinhamento com a experiência de Marcos como desenvolvedor focado em Java. A aplicação também precisa organizar uma interface pública e uma área administrativa dentro do mesmo projeto. |
| Backend e serviços de dados | Supabase | É a solução que Marcos já está utilizando como alternativa ao Firebase e oferece uma base conhecida para o projeto. |
| Banco de dados | PostgreSQL, via Supabase | Armazenará o conteúdo principal editável do portfólio, como textos, experiências e projetos. A escolha acompanha o Supabase e utiliza um banco relacional conhecido. |
| Armazenamento de arquivos | Supabase Storage | Necessário para armazenar imagens dos projetos e os arquivos de currículo em português e inglês. A definição detalhada de buckets e políticas fica para a arquitetura. |
| Autenticação administrativa | Supabase Auth com e-mail e senha | A área administrativa será acessível somente por Marcos, usando seu e-mail e sua senha. Não haverá outros usuários administradores nem fluxo OAuth nesta fase. |
| Código e versionamento | GitHub | Será o repositório do projeto e a origem do fluxo de integração com a hospedagem. |
| Deploy/Hospedagem | Vercel, em um novo projeto conectado ao GitHub | É a opção recomendada para integração com GitHub, deploy automático, previews e separação de variáveis de ambiente entre desenvolvimento e produção. A conexão com a conta Vercel de Marcos e a criação do projeto serão feitas na etapa de deploy, após o repositório estar disponível. |

Segredos, chaves e tokens não devem ser armazenados no repositório. As configurações
devem ser fornecidas por variáveis de ambiente e as políticas do Supabase devem impedir
alterações anônimas no conteúdo.

## 6. Arquitetura de pastas

Resumo inicial, sujeito ao detalhamento em `specs/02-arquitetura/`:

```text
src/
  app/
    core/                    # configuração global, guards e integração de plataforma
    features/
      portfolio/             # página pública e seções do portfólio
      admin/                 # autenticação e área administrativa protegida
      content/               # modelos e operações do conteúdo do portfólio
    shared/                  # componentes e recursos usados por mais de uma feature
  assets/                    # recursos estáticos, incluindo referências de currículo
supabase/
  migrations/                # alterações versionadas de schema
  policies/                  # regras de acesso, quando separadas da migration
```

Visão geral dos limites:

```text
[Visitante]
     ↓
[Página pública Angular]
     ↓ leitura
[Supabase API] → [PostgreSQL]
     ↓ leitura de arquivos
[Supabase Storage]

[Marcos]
     ↓ autenticação
[Área administrativa Angular]
     ↓ leitura e escrita autorizadas; publicação imediata
[Supabase Auth + RLS + API]
     ├── [PostgreSQL]
     └── [Supabase Storage]

[GitHub] → [Vercel] → [Aplicação Angular publicada]
```

O código deve ser organizado por domínio ou feature, e não por um agrupamento global de
componentes, serviços e telas. A interface pública não deve acessar o banco diretamente
sem passar pelos serviços definidos para o conteúdo. Mudanças de schema devem ser feitas
por migrations versionadas.

## 7. Critérios de sucesso

O produto será considerado funcional quando:

- a página pública apresentar corretamente as seções de apresentação, perfil, impacto,
  experiências, projetos, habilidades, formação e contato;
- o visitante conseguir alternar entre português e inglês durante a navegação;
- o conteúdo público for responsivo e utilizável em dispositivos móveis e telas maiores;
- os resultados profissionais forem apresentados com os valores e o contexto definidos
  nesta Spec;
- as experiências aparecerem em ordem cronológica, com os nomes das empresas e os cargos aprovados para publicação;
- novos projetos puderem ser adicionados pela área administrativa sem alteração no
  layout principal;
- Marcos conseguir autenticar-se na área administrativa, adicionar e editar conteúdo e
  carregar imagens de projetos;
- alterações autorizadas no conteúdo persistirem no Supabase e aparecerem na página
  pública;
- os links de LinkedIn, GitHub, e-mail e telefone funcionarem corretamente;
- o currículo baixado corresponder ao idioma selecionado;
- nenhum visitante não autenticado conseguir alterar o conteúdo público;
- não houver bug crítico nos fluxos principais público, alternância de idioma,
  autenticação administrativa, edição de conteúdo e download de currículo;
- o deploy pela integração GitHub–Vercel estiver configurado e o resultado publicado for
  revisado por Marcos antes da aprovação final.

## 8. Quem usa IA e como

- [ ] Eu escrevo todo o código (ex: Aegis-Core)
- [x] IA implementa a partir da minha spec/arquitetura, eu reviso e aprovo (padrão)

## 9. Decisões confirmadas e pontos a detalhar

- A área administrativa usará autenticação por e-mail e senha pelo Supabase Auth.
- Existirá somente um usuário administrador: Marcos.
- As traduções serão mantidas em uma estrutura separada do conteúdo principal.
- Alterações salvas na área administrativa ficarão imediatamente públicas; não haverá
  fluxo de rascunho e publicação nesta fase.
- Os nomes das empresas e os cargos das experiências profissionais podem ser publicados
  quando fizerem parte do conteúdo aprovado por Marcos. Informações confidenciais de
  empresas, clientes ou sistemas internos continuam fora de escopo.
- Será criado um novo projeto na conta Vercel de Marcos, conectado ao repositório GitHub
  do portfólio. O domínio final será definido durante essa configuração.
- A identidade visual inicial será baseada em padrões comuns de portfólios técnicos de
  desenvolvedores, com foco em colocar o produto em funcionamento. O refinamento visual
  conforme as preferências de Marcos ocorrerá depois da primeira versão funcional.

Os detalhes de campos, relacionamentos, migrations, políticas RLS, buckets do Storage e
fluxos da área administrativa devem ser definidos nas specs das features e na
arquitetura, sem alterar as decisões de produto acima.
