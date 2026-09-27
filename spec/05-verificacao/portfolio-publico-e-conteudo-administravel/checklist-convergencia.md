# Checklist de convergência — Portfólio público e conteúdo administrável

Status: Revisão de convergência realizada; deploy não aprovado  
Spec: `spec/03-features/portfolio-publico-e-conteudo-administravel/spec.md`  
Plano: `spec/04-plano/portfolio-publico-e-conteudo-administravel/plano.md`  
Tarefas: `spec/04-plano/portfolio-publico-e-conteudo-administravel/tarefas.md`

## Requisitos

- [ ] FR-001 a FR-019 conferidos contra o código final.
- [ ] AC-001 a AC-015 executados e evidenciados.
- [ ] A pergunta visual de “About me” foi confirmada por Marcos.
- [ ] A regra de não expor empresas foi aprovada também no registro arquitetural.
- [ ] A estratégia de falha de persistência foi revisada por Marcos.

### Resultado detalhado da comparação

Legenda: `[x]` confirmado por código e teste automatizado; `[ ]` não confirmado,
parcial ou divergente e dependente de correção, teste manual ou decisão.

- [ ] FR-001 — os destinos e a responsividade básica estão implementados, mas o
      `.page-header` não possui `position: fixed` ou `position: sticky`; portanto o
      comportamento de header fixo informado como existente não está confirmado.
- [x] FR-002 — os índices numéricos foram removidos e há teste que verifica ausência de
      `.section-index`.
- [x] FR-003 — nome, posicionamento/resumo e contatos compactos estão presentes na
      apresentação; a renderização inicial é coberta por testes existentes.
- [ ] FR-004 — os quatro links compactos existem, mas a sincronização após uma alteração
      administrativa não foi testada de ponta a ponta.
- [ ] FR-005 — há uma ampliação provisória de “About me”, porém a pergunta visual da Spec
      continua aberta e não houve validação visual desktop/mobile.
- [x] FR-006 — as seis categorias e suas skills continuam representadas pelos catálogos
      e pela página pública.
- [ ] FR-007 — URL manual, fallback para imagem manual e ausência de imagem estão no
      código, mas não há teste automatizado do evento de imagem inválida nem teste manual;
      upload manual está restrito a PNG/JPEG, decisão ainda não confirmada para SVG.
- [x] FR-008 — o contrato, migration e apresentação incluem instituição, período,
      andamento, competências e conteúdos estudados.
- [x] FR-009 — os modelos e serviços mantêm os locales `pt-BR` e `en`.
- [x] FR-010 — o DTO público não expõe `name`, a ordenação por início é testada e os
      campos de experiência continuam disponíveis.
- [x] FR-011 — projetos continuam sendo lidos/renderizados por dados e preservam os
      campos, links e imagens previstos; há testes de mapeamento e renderização.
- [x] FR-012 — a seção completa de contato e seus quatro canais são renderizados e
      testados.
- [ ] FR-013 — compactos e completos usam o mesmo signal público, mas a persistência e a
      sincronização após edição administrativa não têm teste de integração.
- [ ] FR-014 — a alternância existe, mas o fallback não está convergente: `loadCopy()` e
      `listExperiences()` consultam apenas o locale selecionado e podem retornar conteúdo
      vazio ou catálogo local, em vez da tradução persistida `pt-BR`.
- [x] FR-015 — a seleção inicial e o fallback de idioma já possuem cobertura nos testes
      do serviço de idioma.
- [ ] FR-016 — os formulários de conteúdo existem, mas não foram confirmadas operações
      administrativas de exclusão; não foram encontrados métodos ou controles de delete na
      Admin page apesar de esse comportamento ter sido declarado como existente.
- [ ] FR-017 — a UI restaura o draft após erro, mas `AdminContentService` faz vários
      `upsert` sequenciais; uma falha intermediária pode deixar parte da alteração publicada
      no banco. Isso diverge da exigência de manter o conteúdo original.
- [ ] FR-018 — o limite de 1 MB está no cliente, no banco e no bucket, mas não há teste
      automatizado específico para arquivo acima do limite nem validação controlada do
      Storage.
- [ ] FR-019 — há estilos responsivos, mas não houve teste manual em dispositivo móvel.

### Critérios de aceite

- [x] AC-002, AC-009 e AC-011 têm cobertura automatizada para ausência de numeração,
      ordem/empresa das experiências e alternância de idioma.
- [ ] AC-001 — há cobertura automatizada parcial para âncoras e destinos, mas header fixo
      e uso em mobile não foram confirmados.
- [ ] AC-003, AC-004, AC-005, AC-006, AC-007 e AC-008 — há implementação e parte da
      cobertura de serviço, mas faltam cenários manuais/integrados de contatos, mídia,
      skill sem ícone e formação salva pela Admin page.
- [ ] AC-010 — a página renderiza projetos por dados, mas não foi executado o fluxo
      administrativo de cadastrar e publicar um novo projeto.
- [ ] AC-012 — o fallback de preferência do navegador possui teste do serviço de idioma,
      mas não foi executado no fluxo público real.
- [ ] AC-013 — não confirmado; os fallbacks de textos gerais e experiências têm a
      divergência descrita no FR-014.
- [ ] AC-014 — não satisfeito de forma confiável para falha intermediária de persistência;
      o estado visual é restaurado, mas não há garantia de rollback das operações já
      persistidas.
- [ ] AC-015 — não houve confirmação end-to-end de salvar na Admin page e recarregar o
      público.

## Arquitetura e segurança

- [x] Código permanece em `portfolio/content`, `portfolio/presentation`,
      `admin/content-management` e `admin/media-management`.
- [x] Não há backend próprio, feature paralela por tipo de arquivo ou chave `service_role`
      no frontend.
- [x] A migration é versionada e aparece na lista local como
      `20260925195359_extend_portfolio_public_content`; não foi aplicada remotamente.
- [ ] RLS e grants restringem escrita ao administrador — a definição SQL e o lint foram
      revisados, mas não houve teste controlado de autorização.
- [ ] `anon` não possui escrita ou remoção de conteúdo/mídia — não confirmado em execução
      contra um ambiente local/remoto funcional.
- [x] Nenhuma chave `service_role` é usada no frontend.

## Dados e mídia

- [ ] Campos de formação e ícone manual preservam registros existentes — a migration é
      aditiva e passou no lint, mas a preservação não foi verificada com dados reais.
- [ ] Imagens de projeto e skill respeitam 1 MB — há validação no cliente, constraints e
      bucket, mas falta teste de rejeição e Storage controlado.
- [ ] URL inválida usa imagem manual; sem imagem manual, fica em branco — lógica existe,
      mas falta teste do evento de erro e teste manual.
- [ ] Falha de associação remove objeto novo quando aplicável — há teste para um upload de
      currículo e para substituições bem-sucedidas; falta teste de falha específica de
      associação de skill e de projeto.
- [x] O procedimento documentado de rollback não remove registros ou objetos sem backup e
      aprovação.

## Testes

- [x] Suíte automatizada atual: 108 testes em 15 arquivos passou.
- [x] Build atual passou com avisos de orçamento.
- [x] Lint local do Supabase não encontrou erros de schema.
- [ ] Teste manual público em desktop e mobile.
- [ ] Teste manual administrativo autenticado.
- [ ] Teste controlado de RLS/Storage.

## Aprovação

- [ ] Marcos revisou o diff e as evidências.
- [ ] Marcos aprovou a implementação.
- [ ] Deploy aprovado separadamente.

## Divergências e bloqueios para aprovação

1. **Header fixo:** a Spec e o inventário informado exigem header fixo, mas o CSS atual
   não fixa o `.page-header`.
2. **Fallback de tradução:** `loadCopy()` e `listExperiences()` não usam fallback
   persistido para `pt-BR`; o comportamento não atende integralmente FR-014/AC-013.
3. **Persistência parcial:** a restauração do draft na UI não desfaz `upsert`s anteriores a
   uma falha intermediária. FR-017/AC-014 permanecem divergentes até haver transação,
   compensação confiável ou uma decisão explícita que altere esse contrato.
4. **Exclusão administrativa:** não foram localizados controles ou operações de exclusão
   no código atual. Não é possível confirmar que a feature preserva a funcionalidade
   declarada como existente.
5. **Conflito de arquitetura/produto:** a Spec da Feature oculta empresas, mas a Spec do
   Produto e a arquitetura ainda permitem publicar nomes aprovados. A
   [DECISAO-006](../../02-arquitetura/DECISAO-006-escopo-publico-experiencias.md) está
   apenas como proposta para revisão de Marcos.
6. **Validação operacional:** `db lint` passou e `db advisors` não apontou achados nas
   tabelas desta feature, mas os cenários de RLS/Storage, dados existentes, browser e
   Admin page ainda não foram executados. As migrations da feature aparecem apenas como
   locais na lista; não houve aplicação remota.
