# Tarefas — Estrutura Base do Portfólio Público

Plano relacionado: `spec/04-plano/estrutura-base-portfolio-publico/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
que implementa e define como verificar que ficou pronta.

## Fase 1 — Base

- [x] T-001 [FR-001] Identificar o estado atual do repositório e inicializar ou completar o workspace usando Angular 22.x com o patch estável mais recente disponível, sem criar uma estrutura de domínio diferente da arquitetura aprovada.
  - Arquivos/módulos: arquivos de configuração Angular e `package.json`, somente se ainda não existirem ou precisarem ser completados.
  - Verificação: confirmar no `package.json` a versão exata instalada de Angular CLI e dos pacotes `@angular/*`, registrar o runner de testes escolhido — Vitest é a proposta padrão —, instalar dependências e executar o comando de build ou inicialização definido para o projeto sem erro.

- [x] T-002 [FR-001] Criar o bootstrap mínimo da aplicação e conectar o componente raiz ao domínio `src/app/features/portfolio/presentation/`.
  - Arquivos/módulos: `src/main.*`, `src/app/` e configuração de entrada da aplicação, conforme o padrão Angular escolhido.
  - Verificação: iniciar a aplicação e confirmar que a página pública é renderizada no endereço principal.

## Fase 2 — Lógica principal

- [x] T-003 [FR-001] Compor a página única com as seções “Sobre mim”, “Experiências” e “Stack técnica”, usando conteúdo estrutural estático.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/`.
  - Verificação: confirmar que as três seções aparecem na mesma página, com identificadores estáveis e sem dependência do Supabase.

- [x] T-004 [FR-003] Implementar a navegação interna entre os itens de navegação e as três seções da página.
  - Arquivos/módulos: componente da página pública e componente/estrutura de navegação dentro de `src/app/features/portfolio/presentation/`.
  - Verificação: ativar cada item de navegação e confirmar que a seção correspondente é alcançada sem mudar para outra página ou rota pública.

- [x] T-005 [FR-003] Garantir o comportamento seguro quando um alvo de navegação não estiver disponível.
  - Arquivos/módulos: lógica de navegação da página pública e teste associado.
  - Verificação: simular ou testar um alvo inexistente e confirmar que a aplicação permanece aberta e utilizável, sem tela de erro dedicada.

## Fase 3 — Interface

- [x] T-006 [FR-002] Aplicar a identidade visual técnica inicial com paleta baseada em preto, vermelho e verde.
  - Arquivos/módulos: estilos da feature em `src/app/features/portfolio/presentation/` e estilos globais mínimos, se necessários.
  - Verificação: inspecionar a página e confirmar uso consistente da paleta nas áreas definidas, sem introduzir uma dependência de dados ou backend.

- [x] T-007 [FR-004] Implementar o layout responsivo da página e das três seções para desktop e dispositivos móveis.
  - Arquivos/módulos: estilos e templates da feature em `src/app/features/portfolio/presentation/`.
  - Verificação: validar a página em uma viewport desktop, uma viewport móvel estreita e uma viewport móvel larga; confirmar ausência de overflow horizontal e manutenção da navegação.

## Fase 4 — Testes

- [x] T-008 [FR-001, FR-003] Criar testes automatizados para a renderização da página única, existência das três seções e navegação entre seus destinos.
  - Arquivos/módulos: testes dos componentes da feature, usando o framework adotado no bootstrap Angular.
  - Verificação: executar a suíte automatizada e confirmar que cada seção pode ser localizada a partir de seu item de navegação.

- [x] T-009 [FR-002, FR-004] Verificar visualmente a identidade técnica e o comportamento responsivo.
  - Arquivos/módulos: página pública e estilos da feature.
  - Verificação: revisar as viewports definidas em T-007, confirmar a paleta preta/vermelha/verde, legibilidade básica e ausência de quebra visual.

- [x] T-010 [FR-003] Cobrir o caminho de erro de navegação com alvo inexistente.
  - Arquivos/módulos: teste automatizado ou teste de integração da navegação.
  - Verificação: executar o cenário de alvo ausente e confirmar que a página continua utilizável, conforme AC-003.

- [x] T-011 [FR-001, FR-002, FR-003, FR-004] Executar a verificação final de build, testes e critérios de aceite.
  - Arquivos/módulos: aplicação completa e configuração de qualidade do projeto.
  - Verificação: build de produção concluído, testes aprovados e AC-001, AC-002 e AC-003 conferidos manualmente.

## Fase 5 — Entrega

- [x] T-012 [FR-001, FR-002, FR-003, FR-004] Revisar a convergência entre Spec, plano, tarefas e implementação e preparar o rollback.
  - Arquivos/módulos: diff completo da feature e documentação de entrega, se necessária.
  - Verificação: confirmar que não houve alteração em Supabase, banco, autenticação ou features fora do escopo; registrar o commit/estado de referência e o procedimento de reversão.

- [x] T-013 [FR-001, FR-002, FR-003, FR-004] Submeter a feature para revisão de Marcos antes de qualquer deploy.
  - Arquivos/módulos: resultado final da feature.
  - Verificação: revisão humana concluída e aprovação registrada; nenhum deploy deve ser executado antes dessa aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Integração com Supabase e leitura de conteúdo publicado.
- [ ] Conteúdo bilíngue e alternância entre português e inglês.
- [ ] Área administrativa, autenticação e edição de conteúdo.
- [ ] Definição final de tipografia, ícones, tonalidades específicas e refinamento visual.
- [ ] Requisitos específicos adicionais de acessibilidade.
- [ ] Deploy da aplicação na Vercel.
