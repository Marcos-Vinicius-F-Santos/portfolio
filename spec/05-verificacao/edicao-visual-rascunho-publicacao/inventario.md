# Inventário real — 2026-09-26

Status: Coleta somente leitura concluída e baseline T-001 registrado; não é aprovação de segurança nem teste da feature editorial.
Projeto Supabase: jjndvtjhxutuerwvjocy. Evidência: [JSON completo](inventario-2026-09-26.json).
Base Git local: f7f57bf52308bdfbd2f7a28af447278918df946a, com alterações locais preexistentes; não equivale ao commit de produção.

## Conteúdo remoto e local

| Domínio | Remoto observado | Fonte efetiva a importar |
| --- | --- | --- |
| Textos | 1 chave, eyebrow; 2 traduções | 61 chaves locais PT/EN, sobrepostas pelo remoto conforme leitor atual |
| Experiências | 2 entidades | Registros e traduções no JSON; preservar UUIDs e datas, ordem inicial por início decrescente |
| Projetos | 2 entidades, 4 traduções | DocFlow e Gestão Pro; preservar IDs/URLs e classificação personal |
| Imagens de projeto | 0 registros | Não criar imagens |
| Currículos | 0 registros | Não criar PDFs nem afirmar que existem downloads disponíveis |
| Skills | 0 categorias/itens | 6 categorias, 27 skills locais |
| Formação | 0 registros | 3 entradas locais, inclusive Design Gráfico |
| Contatos | 0 registros | 4 links locais compartilhados entre apresentação/rodapé |
| Storage | 0 objetos em todos os buckets | Nenhum binário remoto para mover na data da coleta |
| Assets | 18 PNGs de skills, 5 SVGs de contato | Arquivos locais; mapa e tamanhos coletados |

Dados completos públicos, traduções e fallbacks estão no JSON. Não exportados auth.users, senhas, chaves ou sessões. Campos internos presentes em entidades existentes não devem entrar automaticamente no snapshot público: DTO de experiências omite nome de empresa e essa filtragem deve permanecer.

O inventário não executou comparação visual de produção. A importação deve reproduzir a composição do leitor, não apenas copiar todas as linhas: textos vazios, traduções ausentes, nomes próprios, listas e rótulos têm regras distintas. Migração futura registra proveniência por campo e identifica traduções de formação ainda compartilhadas em português; não as inventa nem bloqueia a versão inicial sem decisão de compatibilidade.

## Buckets e limites

| Bucket | Público | MIME | Limite específico |
| --- | --- | --- | --- |
| project-images | sim | PNG/JPEG | 1.048.576 bytes |
| skill-icons | sim | PNG/JPEG/SVG | 1.048.576 bytes |
| curricula | sim | application/pdf | null: sem teto específico no bucket |

Banco: imagem/ícone até 1 MiB, tamanho positivo; PDF tamanho positivo e MIME PDF. Limite global do Storage/plano não é inferível desse catálogo e não foi confirmado. Não há tamanho máximo explícito de PDF nos checks coletados; manter configuração atual não significa upload ilimitado.

## Grants, policies e funções

17 tabelas portfolio_* com RLS ativada; 57 policies no conjunto public/Storage consultado. Três RPCs de substituição são SECURITY INVOKER, com EXECUTE para authenticated/service_role e não para anon/PUBLIC segundo ACL coletada.

Policies de conteúdo permitem leitura pública e restringem INSERT/UPDATE ao cadastro portfolio_admins. Catálogos mais recentes têm grants amplos para anon/authenticated: INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES e TRIGGER, além de SELECT. **RLS não governa TRUNCATE/REFERENCES**; o privilégio efetivo de TRUNCATE nas oito tabelas de catálogo foi confirmado por has_table_privilege, sem executar a operação. Não foi demonstrada explorabilidade pelo Data API: não há endpoint genérico de SQL presumido.

Ajustar grants mínimos via migration futura, depois de revisar impacto. Não executar TRUNCATE nem prova destrutiva em produção. Storage.objects também mostra grants amplos da plataforma; não revogar indiscriminadamente permissões do schema gerenciado. Avaliar separadamente suas políticas e superfície API.
[Semântica RLS PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

Histórico remoto consultado: nove migrations, de create_portfolio_content até add_svg_skill_icons, incluindo restrição PDF, catálogos editáveis e substituição de mídia.

## Lacunas que permanecem explícitas

- Limite global do Storage e políticas de cache efetivamente servidas: conferir no ambiente de teste/configuração da conta.
- Leituras do catálogo comprovam configuração, não substituem testes com tokens de três perfis.
- Binários remotos ausentes: teste de upload/assinatura/expiração depende de fixtures em ambiente controlado.
- Licenças dos assets atuais e ícones externos ainda devem ser inventariadas para empacotamento.
- Estado do código local difere de HEAD; antes da migração final repetir coleta e comparação com release alvo.

## Reprodução

Consultas realizadas: SELECT em tabelas públicas de conteúdo; pg_class/pg_namespace para RLS; pg_policies; information_schema.role_table_grants; pg_proc/ACL; pg_constraint; has_table_privilege; storage.buckets; agregação de storage.objects. Coleta local: exportações de portfolio-content.ts e portfolio-translations.ts, arquivos de assets e leitura do serviço. Nenhuma alteração remota foi feita.

## Baseline da implementação — T-001

Alvo registrado em 2026-09-26:

- branch `master`, HEAD `f7f57bf52308bdfbd2f7a28af447278918df946a`;
- working tree com alterações preexistentes, fingerprint SHA-256 `5EA20B1C4D039D67E6B9C82CE366DDDFD74ED1DDC918E46C0CA00A520FC61F3E` sobre 96 arquivos de código, assets, migrations e configuração;
- deployment público `https://portfolio-eight-pied-855iwa1x0n.vercel.app` e projeto Supabase `jjndvtjhxutuerwvjocy`;
- manifesto reproduzível em [baseline-2026-09-26.json](baseline-2026-09-26.json).

### Rotas observadas

| Rota | Resultado do baseline |
| --- | --- |
| `/` | `PortfolioPage`; produção renderiza conteúdo remoto sobre fallbacks locais. |
| `/projetos/:id` | `ProjectDetail`; DocFlow renderiza em produção. A declaração aparece duas vezes em `app.routes.ts`, apontando para o mesmo componente; condição preexistente registrada, sem correção na T-001. |
| `/admin` | Visitante recebe `AdminAuthentication`; sessão autorizada é direcionada ao `AdminWorkspace`. |
| `**` | Redireciona para `/`. |

### Evidências visuais

| Evidência | Viewport | Resultado |
| --- | --- | --- |
| [Home desktop](baseline/production-home-desktop-ptbr.png) | 1440 × 1200 | Home pública em PT-BR. |
| [DocFlow desktop](baseline/production-docflow-desktop.png) | 1440 × 1200 | Página completa com contexto, solução, papel e tecnologias. |
| [Admin sem sessão](baseline/production-admin-logged-out.png) | 1440 × 900 | Tela de autenticação protegida. |
| [Home mobile](baseline/production-home-mobile-390x844-ptbr.png) | 390 × 844 | Renderiza, com overflow horizontal e navegação cortada já existentes. |
| [Detalhe local sem configuração](baseline/docflow-desktop.png) | 1440 × 1200 | Falha controlada ao carregar projeto porque o runtime local não possui URL/chave pública Supabase. |

Em navegador novo com locale inglês, a home abre o modal de sugestão de idioma. Essa condição também pertence ao baseline e não é falha introduzida pela feature editorial.

### Verificação técnica

- `npm test -- --watch=false`: 16 arquivos e 115 testes aprovados.
- `npm run build`: aprovado; permanecem os avisos existentes de bundle inicial (608,88 kB para orçamento de 500 kB) e `portfolio-page.scss` (7,98 kB para orçamento de 4 kB).
- Conteúdo reconciliado: 61 chaves PT/EN, seis categorias/27 skills, três formações, quatro contatos, 18 PNGs de skills e cinco SVGs de contato; contagens remotas, IDs, buckets, limites, grants e policies permanecem detalhados acima e no JSON de inventário.

### Condições conhecidas antes da implementação

1. O working tree não corresponde a um commit limpo; o fingerprint identifica exatamente o alvo adotado.
2. A página local de projeto depende de configuração pública do Supabase; o deployment comprova o comportamento configurado.
3. A navegação móvel apresenta overflow no baseline. Corrigi-la não pertence à T-001 e exigirá escopo explícito se a feature editorial precisar tocá-la.
4. A duplicação da rota de projeto não muda o componente resolvido, mas deve ser considerada antes de qualquer alteração de rotas.

A T-001 fica pronta para revisão de Marcos, sem marcar seu checkbox como concluído.
