# Plano de Implementação — Refatoração White-Label e Isolamento por Perfil

Spec relacionada: [spec/03-features/refatoracao-white-label-multi-tenant/spec.md](../../03-features/refatoracao-white-label-multi-tenant/spec.md)
Status: Rascunho

## 1. Resumo técnico

A implementação vai retirar identidade pessoal do código compartilhado, dos fallbacks,
dos assets e dos artefatos operacionais consumidos por build/deploy. Cada instância
receberá nome, monograma, imagem, contatos e conteúdo pelo runtime config e/ou pelo
snapshot publicado no Supabase da própria instância.

As variáveis `PORTFOLIO_AUTHOR_NAME`, `PORTFOLIO_PROFILE_ID` e
`PORTFOLIO_PROFILE_IMAGE_URL` serão incorporadas ao arquivo de configuração pública,
sem expor segredos. A imagem principal deixará o repositório e será lida do Supabase
Storage por uma referência genérica publicada no snapshot; na ausência ou falha da
imagem, a interface exibirá um avatar genérico.

Scripts, seeds, snapshots, testes e comandos de build/deploy serão renomeados para
nomes funcionais em uma única migração. Specs e documentos históricos não consumidos
por código, build ou deploy permanecerão preservados. As instâncias continuarão usando
bancos Supabase separados; não será criado um modelo multi-tenant compartilhado.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `scripts/generate-runtime-config.mjs` e `src/app/core/config/supabase-runtime-config.ts` | Emitir e tipar identidade configurável, `profileId` e URL de imagem, com fallback neutro | Médio: uma variável ausente pode alterar o conteúdo inicial da página |
| `portfolio-page.component.ts/html/css` | Resolver a imagem e a identidade pelo contrato de perfil; remover referência a asset nomeado | Médio: quebra visual ou URL indisponível pode deixar o hero sem mídia |
| `portfolio-content.ts` e `contact-panel.models.ts` | Remover links, e-mails, telefones e biografias pessoais dos defaults | Alto: contatos ausentes precisam ser ocultados sem reutilizar outro perfil |
| `editorial-snapshot.models.ts`, validador, adapter e serviço de publicação | Adicionar suporte à identidade/imagem de perfil referenciada por mídia publicada | Alto: altera o contrato consumido pela página pública |
| `scripts/generate-joao-editorial-snapshot.mjs`, `scripts/bundle-editorial-sql.mjs`, SQL e snapshot inicial | Renomear artefatos operacionais e parametrizar entradas de perfil | Alto: imports, comandos e deploy podem apontar para caminhos antigos |
| `src/assets/profile/joao-vitor.jpg` e `src/assets/profile/marcos-santos.jpg` | Retirar imagens pessoais do caminho empacotado e adicionar apenas o avatar genérico | Médio: a remoção deve ocorrer somente após a referência por Storage estar validada |
| Testes de portfolio, snapshot, autenticação e integração | Substituir fixtures pessoais por fixtures neutras e cobrir isolamento/fallback | Médio: testes atuais podem depender de dados específicos do ambiente |
| Supabase Storage e configuração por instância | Publicar a imagem no Storage separado de cada projeto e configurar a referência | Alto: bucket, política ou URL pública incorreta impede a renderização |

## 3. Componentes novos

- Não será criado um novo componente visual. O hero existente continuará responsável
  pela apresentação e consumirá uma identidade resolvida por configuração/conteúdo.
- Será criado um contrato genérico de identidade de perfil dentro dos módulos existentes
  de configuração e conteúdo, evitando uma camada global sem responsabilidade definida.
- Será criado um fixture/avatar neutro para fallback e para testes, sem nome ou imagem de
  pessoa.
- Os geradores e arquivos SQL atuais serão substituídos por equivalentes genéricos e
  parametrizáveis, preservando o fluxo editorial existente.

## 4. Mudança de dados/banco (se houver)

Não há migração para um banco multi-tenant: cada instância continuará apontando para seu
próprio projeto Supabase. A imagem deverá ser enviada ao bucket de Storage da instância,
com políticas compatíveis com o fluxo administrativo e leitura pública, e o conteúdo
publicado deverá guardar somente a referência da mídia, nunca o binário.

O snapshot precisará representar a identidade do perfil e sua mídia. A decisão aprovada
é adicionar uma entidade genérica de perfil contendo `profileId` e `mediaId`, resolvida
pelo adapter a partir da coleção `media`, sem alterar o `formatVersion: 1`. Essa decisão
deve ser registrada no plano/registro arquitetural antes da alteração do adapter; a
validação deve preservar a leitura de snapshots v1 existentes.

Cada instância usará o Storage do seu próprio projeto Supabase, sem bucket compartilhado
entre perfis. Caso o schema atual de mídia/Storage seja suficiente, a entrega usará
somente os artefatos de conteúdo, configuração e Storage já existentes. Se forem
necessárias políticas ou metadados novos, a alteração deverá ser criada com migration
versionada, incluindo RLS e permissões mínimas. Nenhuma chave `service_role` poderá
chegar ao frontend.

Rollback: restaurar o snapshot e o bundle operacional anterior, reverter a configuração
de runtime e apontar o hero para o fallback neutro. Os arquivos do Storage não devem ser
apagados durante rollback; a remoção definitiva de assets pessoais do repositório só
ocorre após a verificação do novo caminho.

## 5. Sequência de implementação

### Fase 1 — Base

1. Confirmar a matriz de referências operacionais versus documentos históricos e criar
   uma lista de busca que será usada como gate da migração.
2. Registrar o contrato aditivo da identidade do perfil em `formatVersion: 1`, a
   precedência de runtime config sobre snapshot e a forma da referência de mídia.
3. Adicionar os nomes de configuração previstos, seus tipos e defaults neutros.
4. Renomear os scripts, snapshots, SQL, fixtures e testes consumidos por build/deploy
   para nomes genéricos, atualizando todas as referências no mesmo conjunto de mudanças.

### Fase 2 — Lógica principal

1. Implementar o resolvedor de identidade sem fallback cruzado entre instâncias; quando
   houver valor no runtime config, ele sobrescreve o valor equivalente do snapshot.
2. Ajustar o modelo, validador e adapter do snapshot para resolver a imagem publicada
   pelo Storage por referência genérica.
3. Parametrizar geradores de snapshot/seed e o bundle SQL; entradas de perfil devem ser
   explícitas e falhar com diagnóstico quando obrigatórias estiverem ausentes.
4. Remover contatos e conteúdo pessoais dos defaults e tornar canais ausentes vazios ou
   ocultos.
5. Manter a seleção de banco por instância, sem introduzir `profile_id` compartilhado,
   tenant global ou fallback de dados residuais.

### Fase 3 — Interface

1. Fazer o hero consumir a imagem resolvida, com avatar genérico versionado para
   configuração ausente, URL inválida ou falha de carregamento.
2. Remover referências aos arquivos locais nomeados e preservar o layout, navegação,
   idioma, projetos, contato e área administrativa existentes.
3. Confirmar que o painel de contato só renderiza canais presentes no perfil ativo.

### Fase 4 — Testes

1. Cobrir runtime config, precedência de identidade, ausência de valores e fallback
   neutro.
2. Cobrir snapshot válido, mídia publicada, mídia ausente, URL quebrada e `profileId`
   incompatível.
3. Executar fixtures de duas instâncias Supabase separadas e verificar que não há
   vazamento de nome, imagem, contato ou conteúdo.
4. Executar busca automatizada por referências pessoais nos artefatos operacionais,
   build, testes e assets empacotados.
5. Executar lint/testes/build e uma verificação visual da página pública e do admin.

### Fase 5 — Entrega (deploy/rollback)

1. Configurar as três variáveis de cada instância e publicar a imagem no Storage
   correspondente, sem versionar segredos.
2. Gerar e validar o snapshot/bundle genérico e executar a migração em um único commit.
3. Fazer smoke test local e de deploy para página pública, idioma, contato, projetos e
   acesso administrativo.
4. Registrar o procedimento de rollback e manter os objetos do Storage até a validação
   pós-deploy.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar |
|---|---|---|---|
| Extensão aditiva do contrato do snapshot v1 não ser aceita pelo validador atual | Média | Alto | Registrar o contrato antes do adapter; manter `formatVersion: 1` e testar snapshot antigo e novo |
| Variável de ambiente ausente ou precedence incorreta | Média | Médio | Defaults neutros, diagnóstico sem dados pessoais e testes de configuração por instância |
| URL do Storage inválida, privada ou com política incorreta | Média | Alto | Validar bucket/política, testar leitura pública e preservar avatar genérico como fallback |
| Renomeação deixa referência operacional antiga | Média | Alto | Busca automatizada, `npm run build`, execução dos scripts e revisão do diff completo |
| Dados pessoais permanecem em defaults de contato ou fixtures | Média | Alto | Fixtures genéricos, gate de busca e testes que afirmam ausência de identificadores conhecidos |
| Mudanças de duas instâncias ainda geram conflito na mesma lógica | Baixa | Médio | Manter a lógica compartilhada genérica; não prometer ausência absoluta de conflitos |
| Snapshot/configuração de uma instância é lido por outra | Baixa | Alto | Bancos separados, validação de `profileId`, testes com duas configurações e fallback neutro |

## 7. Decisões confirmadas antes de começar

- O contrato de identidade será aditivo dentro do `formatVersion: 1`, com registro da
  decisão antes da alteração do adapter.
- A imagem de perfil será armazenada no Storage do Supabase individual de cada instância;
  não haverá bucket compartilhado entre perfis.
- A precedência será `runtime config → snapshot publicado → fallback neutro`. Um valor
  configurado no runtime sobrescreve o campo equivalente do snapshot.
- O avatar genérico será um recurso versionado, sem identidade pessoal e fora do Storage
  específico do perfil.
- Não será criada uma padronização adicional de comandos de geração/deploy nesta rodada;
  a tarefa deve apenas atualizar as referências necessárias para a migração.

