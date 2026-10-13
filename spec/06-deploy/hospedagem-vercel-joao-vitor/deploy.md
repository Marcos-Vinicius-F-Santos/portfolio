# Procedimento de Deploy — Hospedagem Vercel (João Vitor)

Ambiente: Vercel Production  
Projeto: Portfólio Profissional — João Vitor Dias Fernandes  
Repositório GitHub: `https://github.com/joaovitordf/portfolio`  
Branch de Produção: `master`  
Data: 2026-10-13  
Status: Pronto para Execução e Publicação  

---

## 1. Valores Operacionais e Parâmetros

- **Repositório GitHub**: `https://github.com/joaovitordf/portfolio`
- **Branch de Produção**: `master`
- **Framework Preset**: `Angular` (ou `Other`)
- **Root Directory**: `./` (raiz do projeto)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/portfolio/browser`
- **Install Command**: `npm install`
- **Node.js Version**: `20.x` ou `22.x`

### Variáveis de Ambiente Necessárias na Vercel:

| Variável | Obrigatória? | Descrição | Exemplo |
|---|---|---|---|
| `SUPABASE_URL` | Sim | URL pública do projeto Supabase | `https://xxxx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Sim | Chave pública anônima do Supabase | `sb_publishable_...` ou `eyJ...` |
| `SUPABASE_ADMIN_USER_ID` | Opcional | UUID do usuário autenticado autorizado no Admin | `00000000-0000-0000-0000-...` |

> [!IMPORTANT]
> **Nunca** configure a chave `service_role` ou senhas de banco na Vercel ou no código. Apenas a chave pública (`SUPABASE_PUBLISHABLE_KEY` ou `anon`) deve ser informada.

---

## 2. Pré-condições Locais

Antes de iniciar o deploy, valide em seu terminal local:

```powershell
# 1. Garantir que a árvore de trabalho está limpa e testada
git status
npm test
npm run build
```

Confirmado que os 154 testes passaram e o build gerou a pasta `dist/portfolio/browser` com sucesso.

---

## 3. Passo a Passo do Deploy

Você pode publicar seu projeto na Vercel através de duas opções simples:

### Opção A — Conexão Contínua GitHub + Vercel Dashboard (Recomendada)

Esta é a melhor opção, pois qualquer commit futuro que você enviar para a branch `master` gerará deploy automaticamente em produção.

1. **Enviar commits locais para o seu GitHub**:
   ```powershell
   git push origin master
   ```

2. **Acessar a Vercel**:
   - Acesse [https://vercel.com](https://vercel.com) e faça login com sua conta (ou faça login via GitHub).

3. **Importar o Repositório**:
   - Clique em **"Add New..."** -> **"Project"**.
   - Localize o repositório **`joaovitordf/portfolio`** e clique em **"Import"**.

4. **Configurar o Projeto**:
   - **Project Name**: `portfolio` (ou o nome de sua preferência).
   - **Framework Preset**: Selecione `Angular`.
   - **Root Directory**: Deixe `./`.
   - **Build and Output Settings**:
     - *Build Command*: `npm run build`
     - *Output Directory*: `dist/portfolio/browser`
   - **Environment Variables**:
     Adicione as três variáveis do Supabase copiadas do seu painel Supabase (ou do seu arquivo `.env` local):
     - `SUPABASE_URL`
     - `SUPABASE_PUBLISHABLE_KEY`
     - `SUPABASE_ADMIN_USER_ID` (opcional, se for usar o painel admin)

5. **Disparar o Deploy**:
   - Clique em **"Deploy"**.
   - A Vercel executará o `prebuild` (`generate-runtime-config.mjs`) gerando as configurações dinâmicas e o `ng build`.
   - Em cerca de 1 a 2 minutos o site estará no ar com a URL pública gerada (ex: `https://portfolio-xxxx.vercel.app`).

---

### Opção B — Deploy Direto via Vercel CLI (Terminal)

Caso prefira publicar diretamente do seu terminal PowerShell:

1. **Autenticar na CLI da Vercel**:
   ```powershell
   npx vercel login
   ```
   Siga a instrução no navegador para autorizar o acesso da sua conta.

2. **Vincular o Projeto**:
   ```powershell
   npx vercel link
   ```
   Selecione seu escopo pessoal e crie um novo projeto ou vincule a um existente.

3. **Configurar as Variáveis de Ambiente no Projeto**:
   ```powershell
   npx vercel env add SUPABASE_URL production
   npx vercel env add SUPABASE_PUBLISHABLE_KEY production
   npx vercel env add SUPABASE_ADMIN_USER_ID production
   ```

4. **Executar o Deploy de Produção**:
   ```powershell
   npx vercel --prod
   ```
   A CLI fará o upload e compilação na nuvem e retornará o link de produção ativo.

---

## 4. Testes de Fumaça Pós-Deploy (Smoke Testing)

Após a publicação, acesse a URL gerada pela Vercel e valide os seguintes pontos:

1. **Página Inicial (`/`)**:
   - O portfólio de João Vitor deve carregar com fotos, textos, bio e cards de projetos e experiências.
   - Alternar o seletor de idioma (PT <-> EN) no cabeçalho e verificar se os textos atualizam imediatamente.
2. **Navegação SPA e F5**:
   - Clique em um projeto para abrir a rota `/projetos/:id`.
   - Aperte **F5** (Recarregar). O site deve manter o projeto carregado e **não** exibir página 404 da Vercel.
3. **Painel de Contato**:
   - Preencha o formulário na seção de contato.
   - Clique em "Enviar pelo WhatsApp" e confirme que a janela abre direcionando para o número de João (`+55 37 99429-018`).
   - Clique em "Enviar por e-mail" e confirme que o cliente de e-mail abre com destino para `profissional.joaovitordf@gmail.com`.
4. **Download de Currículo**:
   - Clique nos botões de download de currículo e verifique se os arquivos `curriculum-pt.pdf` e `curriculum-en.pdf` abrem normalmente.
5. **Acesso Administrativo (`/admin`)**:
   - Acesse `/admin`. A tela de login deve abrir normalmente sem erro 404.

---

## 5. Procedimento de Rollback

Em caso de qualquer anomalia identificada pós-deploy:
1. Acesse o painel da Vercel em **Deployments**.
2. Localize a implantação anterior que estava estável.
3. Clique nos três pontinhos (`...`) ao lado dela e selecione **"Instant Rollback"** (ou **"Promote to Production"**).
4. Em menos de 2 segundos a versão anterior voltará a responder em produção.
