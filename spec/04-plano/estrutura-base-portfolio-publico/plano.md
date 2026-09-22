# Plano de Implementação — Estrutura Base do Portfólio Público

Spec relacionada: `spec/03-features/estrutura-base-portfolio-publico/spec.md`  
Status: Rascunho

## 1. Resumo técnico

Inicializar a aplicação com Angular 22.x, usando o patch estável mais recente disponível
no momento da implementação, e renderizar a experiência pública como uma única página,
usando a estrutura já definida em `src/app/features/portfolio/presentation/`. A página
será composta pelas seções “Sobre mim”, “Experiências” e “Stack técnica”, com navegação
interna por alvos de seção.

A primeira implementação usará conteúdo estrutural estático apenas para validar layout e
navegação. A leitura de conteúdo pelo Supabase, as traduções e a área administrativa ficam
para features posteriores. A identidade visual será aplicada com uma paleta simples de
preto, vermelho e verde, e o layout será ajustado para desktop e dispositivos móveis.

Não será criada uma nova camada arquitetural. Os arquivos específicos ficarão dentro do
domínio `portfolio/presentation`, conforme a arquitetura existente; os arquivos de
bootstrap e configuração Angular serão apenas os necessários ao funcionamento da
aplicação.

## 2. Impacto no que já existe

O projeto é novo e não há aplicação pública, componentes ou banco de dados existentes.
Portanto, não há comportamento de runtime a preservar. A criação de arquivos de
bootstrap, configuração e estilos globais será necessária para iniciar a aplicação.

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/` e arquivos de configuração Angular | Criar o bootstrap da aplicação Angular, scripts de execução e configuração mínima do projeto | Médio: uma configuração inicial inadequada pode impedir build ou execução local |
| `src/app/features/portfolio/presentation/` | Criar a página pública, a navegação interna e as três seções previstas | Baixo: não há consumidores existentes, mas IDs inconsistentes podem quebrar a navegação |
| `src/styles.scss` ou equivalente global | Definir tokens visuais mínimos e regras responsivas compartilhadas | Médio: estilos globais podem afetar features futuras se não forem escopados |
| Supabase, PostgreSQL e Storage | Nenhuma alteração | Nenhum: integração de conteúdo está fora desta feature |

## 3. Componentes novos

- Bootstrap da aplicação Angular e componente raiz que renderiza a experiência pública.
- Componente de página do portfólio dentro de
  `src/app/features/portfolio/presentation/`.
- Navegação interna associada às três seções da página.
- Seção “Sobre mim”.
- Seção “Experiências”.
- Seção “Stack técnica”.
- Estilos da feature e tokens visuais mínimos para preto, vermelho e verde.
- Testes de estrutura, navegação, responsividade e comportamento seguro quando um alvo de
  navegação não estiver disponível.

As seções permanecerão dentro do domínio `portfolio/presentation`. Não será criada uma
feature `content` nesta rodada, porque a Spec coloca a integração com conteúdo externo e
Supabase fora do escopo.

## 4. Mudança de dados/banco (se houver)

Não haverá mudança de dados, banco, Storage, autenticação ou Supabase. Nenhuma migration
é necessária.

Como não haverá persistência, o rollback será feito revertendo o commit da implementação
ou restaurando a versão anterior dos arquivos da aplicação, sem alteração de dados
externos.

## 5. Sequência de implementação

### Fase 1 — Base

1. Inicializar ou completar o workspace Angular no repositório usando Angular 22.x, com o
   patch estável mais recente disponível, mantendo CLI e pacotes `@angular/*` na mesma
   major e respeitando os arquivos e scripts já existentes caso sejam encontrados.
2. Criar a estrutura mínima em `src/app/features/portfolio/presentation/` e conectar o
   componente raiz à página pública.
3. Confirmar que a aplicação inicia e que a página única pode ser renderizada sem
   dependência do Supabase.

### Fase 2 — Lógica principal

1. Definir os identificadores estáveis das seções “Sobre mim”, “Experiências” e “Stack
   técnica”.
2. Implementar a navegação interna entre os itens de navegação e suas seções.
3. Garantir que um alvo inexistente não provoque tela de erro nem inutilize a página.

### Fase 3 — Interface

1. Aplicar a identidade visual técnica com a paleta preta, vermelha e verde.
2. Compor visualmente as três seções sem antecipar conteúdo detalhado ou integração de
   dados.
3. Implementar o comportamento responsivo para desktop e dispositivos móveis, escolhendo
   breakpoints adequados durante a implementação.
4. Manter tipografia, ícones, densidade visual, tonalidades específicas e refinamentos
   avançados como decisões substituíveis, pois permanecem fora do detalhamento desta
   feature.

### Fase 4 — Testes

1. Executar os testes automatizados disponíveis para a estrutura da página e a navegação.
2. Verificar os critérios de aceite em viewport desktop e móvel.
3. Verificar o caminho de erro de navegação com alvo ausente.
4. Executar o build de produção e a checagem de qualidade configurada no projeto.

### Fase 5 — Entrega (deploy/rollback)

1. Revisar a correspondência entre a Spec, este plano, as tarefas e os testes.
2. Confirmar que não houve alteração em Supabase, banco, autenticação ou features fora do
   escopo.
3. Registrar o commit/estado que representa a feature e documentar o rollback por reversão
   do commit, sem executar deploy nesta rodada.
4. Submeter o resultado para revisão e aprovação de Marcos antes de qualquer publicação.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Merece Registro de Decisão? |
|---|---|---|---|---|
| O repositório ainda não possuir workspace Angular ou configuração de execução | Média | Alto | Inspecionar o estado atual na primeira tarefa, preservar arquivos existentes e validar `build` e execução local antes de avançar | Não. É uma etapa operacional reversível |
| IDs de navegação e IDs das seções divergirem | Média | Alto | Definir os IDs em um único contrato da página e cobrir cada destino com teste automatizado e verificação manual | Não. O risco é coberto por implementação e teste |
| Estilos globais da paleta afetarem futuras áreas da aplicação | Média | Médio | Manter estilos específicos da feature dentro de `portfolio/presentation` e limitar tokens globais ao mínimo necessário | Não. A decisão é reversível e não muda limite arquitetural |
| A combinação preto, vermelho e verde apresentar leitura visual insuficiente em algum contexto | Média | Médio | Usar tonalidades provisórias com contraste verificável e deixar as tonalidades finais substituíveis | Não. O refinamento visual já está previsto como aberto na Spec |
| Breakpoints escolhidos não cobrirem adequadamente algum dispositivo | Média | Médio | Verificar pelo menos uma viewport desktop, uma móvel estreita e uma móvel larga, além de redimensionamento manual | Não. É uma decisão de implementação reversível |
| A estrutura visual ficar acoplada à futura integração de conteúdo | Baixa | Médio | Usar conteúdo estrutural estático nesta rodada e manter a página dentro de `portfolio/presentation`, sem criar serviços de conteúdo prematuramente | Não. A arquitetura já define a separação futura |

Não foi identificado risco que exija um Registro de Decisão em
`spec/02-arquitetura/DECISAO_TEMPLATE.md`. Angular, página única e organização por
feature já são decisões da arquitetura; os demais pontos são reversíveis e estão cobertos
por testes ou pela própria Spec.

## 7. Perguntas abertas antes de começar

- Decisão registrada: usar Angular 22.x, com o patch estável mais recente disponível no
  início da implementação. A versão exata instalada deve ser registrada no
  `package.json` e no resultado da T-001.
- Proposta de ferramenta de testes: usar Vitest, que é o runner padrão de novos projetos
  criados pelo Angular CLI. A escolha poderá ser substituída antes da implementação se
  Marcos preferir Karma ou outra ferramenta compatível.
- As tonalidades específicas de preto, vermelho e verde, tipografia, ícones e densidade
  visual continuam abertas. Elas não bloqueiam a implementação estrutural, desde que sejam
  aplicadas de forma substituível.
- Os breakpoints não foram definidos pelo produto. O plano assume que serão escolhidos e
  validados durante a implementação, conforme a decisão registrada na Spec.
