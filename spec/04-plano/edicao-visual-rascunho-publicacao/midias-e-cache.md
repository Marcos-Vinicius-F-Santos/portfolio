# Autorização de mídias, URLs e cache

Status: Direção aprovada pelas ADR-008/009; novos SVGs dependem da implementação e dos testes de integração antes do corte.
Base aprovada: DT-002/003. Nenhum bucket foi alterado.

## Acesso

- Novos arquivos: buckets privados separados por finalidade (imagem, ícone, PDF), com os mesmos MIME/limites observados. Caminhos UUID exclusivos; sem overwrite.
- Admin autorizado: lê rascunho e versões retidas; upload INSERT no caminho reservado; sem UPDATE/DELETE arbitrário de objetos.
- Público: policy SELECT em storage.objects exige media_id pronto e associação a snapshot ativo ou com public_until válido. Retenção administrativa de dez versões não libera todo o histórico ao visitante.
- Usuário autenticado não administrador recebe no máximo a mesma leitura pública de anon.
- Autorização por helper estreito consulta a associação, não por parâmetro do cliente, prefixo adivinhável ou metadados editáveis. Funções e RLS não devem gerar recursão entre policies.
- Snapshot não armazena URL assinada; leitor resolve media_id para referência permitida e pede URL ao Storage sob o papel atual. Nunca entregar chave privilegiada ao frontend.

## Expiração e limitações precisas

Cliente solicita URLs por 300 segundos e renova quando restarem 60 segundos ou antes do download. Guarda somente em memória por publication_id/media_id; preview limpa o cache na saída/logout. Tokens completos não aparecem nos logs.

**300 segundos é a política do cliente, não um teto de segurança imposto pelo Storage.** Um chamador com SELECT pode solicitar outra duração se a API permitir; esta proposta não promete revogação máxima em cinco minutos. O requisito principal é não emitir acesso a arquivo inédito antes de publicar. Se for exigido TTL máximo imposto pelo servidor ou revogação imediata, será necessária uma decisão adicional de serviço assinador/proxy e restrição ao endpoint direto. Não introduzir esse backend silenciosamente.

URLs assinadas já emitidas continuam até expirar, inclusive após logout/rotação de chaves Auth. Dados que já foram publicados podem ter cópias externas. [Referência Supabase](https://supabase.com/docs/guides/storage/serving/downloads).

## Versão navegada e cache

Resolver versão ativa em cada entrada/reload sem cache persistente desse ponteiro. Leitura de snapshot imutável em memória; todos os componentes usam o mesmo ID. A navegação home → projeto usa Router e o serviço de sessão da versão; corrigir os atuais href que fazem reload para manter a revisão na navegação interna.

Após nova publicação, versão anterior pode ser lida por 30 minutos. Janela permite completar navegação sem misturar versões; não cresce a cada leitura. Depois disso, resposta VERSION_EXPIRED pede atualização integral, em vez de trocar partes da tela. Uma home já carregada não precisa atualizar em tempo real, mas sua próxima operação que requer versão expirada deve solicitar recarga.

Rascunho e respostas do editor sem cache público; não usar service worker/offline ou CDN cache para dados editoriais. Snapshot histórico não deve receber cache persistente indefinido: retenção e acesso são limitados. Binários únicos: sem sobrescrita; TTL de cache solicitado não excede a URL. Verificar comportamento real de CDN na implantação, não prometer que cache externo pode ser apagado.

## Upload seguro

Reservar media_id/path por comando autorizado → enviar arquivo privado → confirmar objeto pelo backend/Storage e metadados reais → associar ao rascunho por revisão. Não confiar somente em MIME/tamanho declarados pelo browser. Imagens decodificáveis; SVG validado/sanitizado antes de marcar pronto, sem scripts, recursos externos ou eventos. Arquivos privados inválidos não podem entrar em publicação.

A implementação precisa demonstrar como a inspeção de bytes ocorre em ambiente confiável. Se SQL/Storage não bastarem para validação de SVG, bloquear SVG novo até solução aprovada ou propor serviço limitado; nunca afirmar sanitização do cliente como barreira de segurança. Esse detalhe é gate da tarefa de mídia, não mudança de formato já aplicada. A ADR-009 aceita a exceção arquitetural necessária; novos SVGs permanecem bloqueados até a Edge Function e o corpus de segurança serem verificados, enquanto assets SVG locais continuam como `source=bundled`.

## Arquivos legados

Inventário atual: zero objetos e zero PDFs/imagens cadastrados. Não há binários remotos a mover hoje; repetir a contagem antes do corte.
Os 18 PNGs de skills e cinco SVGs de contato são assets locais; incluir referências estáveis e respectivas licenças no catálogo. Preservar URLs públicas existentes caso apareçam arquivos entre inventário e corte. Marcar source=legacy_public; não converter bucket inteiro para privado e quebrar URLs. Substituições futuras são privadas até publicar. Referências externas são públicas por origem, sem garantia de disponibilidade.

## Retenção e coleta

Reter dez publicações; versões retiradas além disso só podem ser purgadas após acabar a janela de navegação. GC calcula referências de rascunho + publicações retidas + janela pública. Iniciar unreferenced_since apenas quando todas zerarem; zerar o relógio se arquivo voltar a ser associado.

Após sete dias continuamente órfão, claim transacional muda media para deleting; nenhuma associação/publicação/restauração pode usar esse estado. Chamar Storage remove fora do SQL e finalizar resultado. Falha permanece visível e repetível, não apaga metadados como se o binário tivesse sido removido. Reserva/claims têm lease e recuperação após queda.

Inicialmente limpeza operacional autenticada, em lote e com dry-run; não criar automação recorrente nesta tarefa. Antes de automatizar, definir executor e monitoramento. Nunca executar DELETE direto em storage.objects para fingir exclusão de arquivo.


