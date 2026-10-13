# Especificação de Funcionalidade — Isolamento de Dados Pessoais e Padronização Arquitetural

## 1. Contexto e Problema

O portfólio é compartilhado entre dois forks com autores distintos (João Vitor Dias Fernandes e Marcos Santos). Cada autor possui seu próprio ambiente de hospedagem (Vercel) e sua própria instância de banco de dados (Supabase).

Atualmente, constantes de fallback nos arquivos TypeScript do Angular contêm dados pessoais (nome, biografia, telefone, e-mail, redes sociais e formação acadêmica) hardcoded. Se uma sincronização de código ocorrer ou caso o Supabase falhe ou demore a responder, os dados pessoais de um autor vazam para o portfólio do outro.

Adicionalmente, novos componentes incorporados do upstream violaram a padronização arquitetural da DECISAO-013, e o carregamento antecipado (*eager loading*) das rotas estourou o orçamento de tamanho do pacote inicial.

---

## 2. Requisitos da Feature

### RF-001: Isolamento de Dados Pessoais (Agnosticismo no Código-Fonte)
- O código-fonte TypeScript, HTML e CSS compartilhado no Git não deve conter nomes próprios, telefones, e-mails, biografias ou métricas específicas de nenhum autor.
- Os dados estáticos de fallback devem ser genéricos e neutros (ex: "Desenvolvedor de Software", links institucionais neutros).
- Todo o conteúdo autoral específico deve vir exclusivamente do snapshot publicado no Supabase de cada instância.

### RF-002: Destinos Dinâmicos no Painel de Contato
- O número de WhatsApp e o e-mail utilizados pelo `ContactPanelComponent` para abrir os canais devem ser obtidos dinamicamente das entidades de contato (`symbol: 'phone'` e `symbol: 'email'`) do snapshot publicado.
- `DEFAULT_CONTACT_PANEL_DESTINATIONS` deve ser neutro (`{ whatsappNumber: '', email: '' }`), garantindo que nenhum contato pessoal fique hardcoded.

### RF-003: Padronização de Componentes Compartilhados
- Os componentes `contact-panel` e os componentes administrativos (`admin-card`, `admin-feedback`, `admin-page-header`, `admin-section-header`) devem ser consolidados em `src/app/shared/components/`.
- Todos os arquivos devem seguir o sufixo canônico `.component.ts`, `.component.html`, `.component.css`, e classes sufixadas com `Component`.
- Eliminar as pastas legadas `presentation/` e `ui/`.

### RF-004: Lazy Loading de Rotas e Otimização de Performance
- Todas as rotas em `app.routes.ts` devem utilizar `loadComponent: () => import(...)`.
- O tamanho do chunk inicial de carregamento da aplicação (`initial bundle`) deve ficar abaixo de 500 kB, eliminando os warnings do compilador Angular.

### RF-005: Desacoplamento e Estabilidade da Suíte de Testes
- Testes unitários devem testar comportamento e estrutura utilizando dados de teste mockados (fixtures), sem asserções sobre nomes literais ou telefones de pessoas reais.
- A suíte de testes deve rodar 100% verde sem ruídos espúrios no console.

---

## 3. Critérios de Aceite (Given / When / Then)

### Cenário 1: Renderização com Supabase Ativo
- **Given** que o visitante acessa o portfólio com a conexão Supabase funcional;
- **When** o snapshot editorial publicado é carregado;
- **Then** a aplicação renderiza o nome, bio, projetos, experiências e canais de contato específicos daquele autor cadastrado no banco;
- **And** os botões de WhatsApp e e-mail utilizam os destinos informados nas entidades de contato do banco.

### Cenário 2: Falha ou Ausência de Conexão com o Supabase (Opção A)
- **Given** que o visitante acessa o portfólio sem conectividade ou com o banco de dados temporariamente inacessível;
- **When** a tentativa de carregar o snapshot falha;
- **Then** a aplicação exibe fallbacks estáticos neutros sem expor dados pessoais de João Vitor nem de Marcos Santos;
- **And** nenhuma informação confidencial ou contato pessoal inexistente é exibido.

### Cenário 3: Otimização do Bundle Inicial
- **Given** que o comando `npm run build` é executado para produção;
- **When** a compilação do Angular é concluída;
- **Then** o tamanho do pacote inicial de script/estilos deve respeitar rigorosamente o orçamento de 500 kB;
- **And** nenhum warning de budget é emitido pelo builder.

### Cenário 4: Execução da Suíte de Testes
- **Given** que os testes unitários são executados com `ng test`;
- **When** todos os 33 arquivos de spec forem processados;
- **Then** 100% dos testes passam com sucesso;
- **And** nenhuma asserção depende de dados pessoais voláteis.
