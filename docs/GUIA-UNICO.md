# FLUENTIA — GUIA ÚNICO, DO ZERO

Tempo: 30–40 min. Faz pela ordem. Cada passo diz **onde ir**, **que app usar** e **o que clicar/colar**.

## Aplicações que vais usar (todas gratuitas)

| App | Onde | Para quê |
|---|---|---|
| **Google Chrome** | no teu computador | abrir GitHub, Neon, Vercel e testar o site |
| **GitHub** | https://github.com | guardar o código |
| **Neon** | https://console.neon.tech | base de dados PostgreSQL |
| **Vercel** | https://vercel.com | publicar o site com HTTPS |
| **Terminal** (macOS) / **PowerShell** (Windows) | já vem no sistema | 3 comandos `git` (Passo 3) |
| **Node.js LTS** | https://nodejs.org | só se uses o caminho com comandos para a base (Passo 2.4-B) |
| **Chrome no Android** | telemóvel | instalar e testar o áudio |

Usa o **mesmo email/GitHub** nos três sites (GitHub → Neon "Continue with GitHub" → Vercel "Continue with GitHub").

---

# PARTE 1 — Apagar o antigo (5 min)

## 1.1 Vercel
1. Chrome → `vercel.com` → entra.
2. Clica no projeto antigo (ex.: `fluentia`).
3. **Settings** (topo) → desce até ao fim → **Delete Project** → escreve o nome do projeto → **Delete**.

## 1.2 Neon
1. Chrome → `console.neon.tech` → entra.
2. Escolhe o projeto antigo → **Settings** (barra esquerda) → fundo → **Delete project** → escreve o nome → **Delete**.

## 1.3 Telemóvel (obrigatório — é isto que estraga o áudio)
1. Pressiona sem soltar o ícone **Fluentia** → **Desinstalar**.
2. Chrome do telemóvel → `⋮` → **Definições** → **Definições do site** → **Fluentia** (ou o domínio antigo) → **Limpar e repor**.

> O repositório GitHub **não** se apaga.

---

# PARTE 2 — Base de dados nova no Neon (8 min)

## 2.1 Criar
1. `console.neon.tech` → **New Project**.
2. *Project name*: `fluentia` · *Region*: `AWS eu-central-1` (Frankfurt) · Postgres: versão sugerida.
3. **Create project**.

## 2.2 Copiar as duas strings
No projeto → **Connect** (ou *Dashboard → Connection string*):

- **Liga** *Connection pooling* → **Copy** → guarda como **STRING-VERCEL** (tem `-pooler`).
- **Desliga** *Connection pooling* → **Copy** → guarda como **STRING-SQL** (não tem `-pooler`).

As duas terminam em `?sslmode=require`. Cola-as num bloco de notas.

## 2.3 Criar as tabelas — SEM terminal (recomendado)
1. Neon → menu esquerdo → **SQL Editor**.
2. No computador, abre o ficheiro **`drizzle/init-neon.sql`** do projeto (Bloco de Notas / VS Code) → `Ctrl+A` → `Ctrl+C`.
3. Cola no SQL Editor → **Run**.
4. Verificar: cola e corre
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1;
   ```
   Tens de ver 4: `conversations`, `messages`, `profiles`, `pronunciation_attempts`.

## 2.4-B Criar as tabelas — COM terminal (alternativa)
Pré-requisito: **Node.js LTS** instalado (nodejs.org → botão LTS → instalar → reiniciar o terminal).
Abre o Terminal/PowerShell **na pasta do projeto** e corre:

```bash
# macOS / Linux
export DATABASE_URL="cola-aqui-a-STRING-SQL"
npm install
npx drizzle-kit push --config drizzle.config.prod.ts
node scripts/check-db.mjs
```

```powershell
# Windows PowerShell
$env:DATABASE_URL="cola-aqui-a-STRING-SQL"
npm install
npx drizzle-kit push --config drizzle.config.prod.ts
node scripts/check-db.mjs
```

Deve aparecer `✓ Base de dados pronta.` no final.

---

# PARTE 3 — Código no GitHub (5 min)

## 3.1 Já tens o projeto num repositório GitHub
Terminal na pasta do projeto:

```bash
git add -A
git commit -m "audio no telemovel, ditado 60s, diccao, diagnostico"
git push
```

## 3.2 Ainda não tens repositório
1. GitHub → **+** (canto superior direito) → **New repository** → nome `fluentia` → **Create repository** (não marques nada).
2. Copia o URL mostrado (`https://github.com/O-TEU-USER/fluentia.git`).
3. Terminal na pasta do projeto:

```bash
git init
git add -A
git commit -m "Fluentia"
git branch -M main
git remote add origin https://github.com/O-TEU-USER/fluentia.git
git push -u origin main
```

4. Atualiza a página do repositório: devem aparecer `src`, `public`, `package.json`.

## 3.3 Sem terminal (GitHub Desktop)
1. Instala **GitHub Desktop** (desktop.github.com) → entra.
2. **File → Add local repository…** → escolhe a pasta do projeto → se pedir, **create a repository**.
3. Mensagem `deploy` → **Commit to main** → **Publish repository**.

---

# PARTE 4 — Publicar na Vercel (7 min)

1. Chrome → `vercel.com` → **Add New… → Project**.
2. Em *Import Git Repository* escolhe `fluentia` → **Import**.
   Não aparece? **Adjust GitHub App Permissions** → autoriza o repositório.
3. Não mexas no build. Confirma só: *Framework Preset* = **Next.js**.
4. **Environment Variables** → cria (marca Production, Preview **e** Development):
   - `DATABASE_URL` = **STRING-VERCEL** (a com `-pooler` e `?sslmode=require`)
   - *(opcional)* `OPENAI_API_KEY` = `sk-...` para respostas de IA
5. **Deploy** → espera "Congratulations" → copia o link `https://fluentia-xxxx.vercel.app`.

**Regra de ouro:** se mudares uma variável depois → **Deployments → ⋯ → Redeploy**.

---

# PARTE 5 — Confirmar no computador (3 min)

No Chrome, troca `SEU-LINK` pelo teu link:

1. `https://SEU-LINK.vercel.app/api/health`
   → `{"ok":true,...,"checks":[...]}` com todos `"status":"ok"`.
   Se algum estiver vermelho, o campo `detail` diz o que fazer.
2. `https://SEU-LINK.vercel.app/diagnostico` → página 🩺 (servidor + dispositivo).
3. `https://SEU-LINK.vercel.app/` → painel. Escreve o teu nome em **“Vamos personalizar”** → **Guardar perfil**.
   Se gravar, a base está a funcionar.
4. `https://SEU-LINK.vercel.app/treino` → treinador de dicção.

---

# PARTE 6 — Telemóvel Android (5 min)

1. Chrome do telemóvel → abre `SEU-LINK.vercel.app`.
2. `⋮` → **Instalar aplicação** → **Instalar**.
3. Abre a app → canto superior direito (ícone telemóvel) **App** → cartão **“Testar áudio neste telemóvel”**:
   - deve mostrar **“Voz encontrada…”** e o nome da voz (ex.: `English United Kingdom`);
   - toca **🔊 Ouvir normal** e **🐢 Ouvir lento** (o 1.º toque é obrigatório).
4. **Sem som?** volume multimédia ↑ · desligar modo silencioso · Android *Definições → Acessibilidade →
   Texto para voz* → motor **Google Text-to-Speech** (Play Store) → instalar voz inglesa → testar outra vez.
5. **Dicção** → *Permitir* microfone → microfone grande → falas até **60 s** (contagem visível) →
   **Avaliar dicção** → nota + plano de correção.
6. **Conversar** → escreve ou dita → resposta começa com “Quick fix: …” e cada frase corrigida tem
   **🎙 Praticar dicção desta frase**.

---

# PARTE 7 — Daqui para a frente

| Quero… | Faço |
|---|---|
| publicar alterações | `git add -A && git commit -m "msg" && git push` (a Vercel publica em ~2 min) |
| mudar variáveis | Vercel → Settings → Environment Variables → editar → **Redeploy** |
| ver dados | Neon → **SQL Editor**: `SELECT * FROM profiles;` |
| erros do servidor | Vercel → projeto → **Logs** |
| domínio próprio | Vercel → Settings → Domains |
| APK Android / app desktop | `docs/APPS.md` |

---

# TODOS OS COMANDOS NUM SÓ LUGAR

```bash
# 1. entrar na pasta do projeto
cd caminho/para/fluentia

# 2. instalar dependências (só na primeira vez)
npm install

# 3. apontar para a base Neon (string DIRETA, sem -pooler)
export DATABASE_URL="postgresql://...@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
# Windows PowerShell:  $env:DATABASE_URL="postgresql://..."

# 4. criar / atualizar tabelas
npx drizzle-kit push --config drizzle.config.prod.ts

# 5. verificar base
node scripts/check-db.mjs

# 6. (opcional) testar localmente
npm run build && npm run start      # abre http://localhost:3000

# 7. enviar código para o GitHub
git add -A && git commit -m "deploy" && git push
```

Alternativa: `bash scripts/deploy.sh` faz 3–7 por ti (pede a string e publica).

---

# SE FALHAR

| O que vês | Causa | Solução |
|---|---|---|
| janela **Deploy** vermelha: `DATABASE_URL is missing` | variável não definida | Vercel → Environment Variables (3 colunas) → **Redeploy** |
| `/api/health` 503, `password authentication failed` | string errada/incompleta | Neon → Connect → **Copy** → colar de novo, sem espaços |
| `/api/health` 503, check `tables` | tabelas não criadas | Neon → SQL Editor → colar `drizzle/init-neon.sql` → **Run** |
| check `meta` vermelho | coluna em falta | o mesmo SQL (inclui `ALTER TABLE messages ADD COLUMN IF NOT EXISTS meta`) |
| `too many connections` | pool grande | usar STRING-VERCEL (pooled) + variável `PG_POOL_MAX=3` |
| página abre mas chat diz “Não consegui…” | base indisponível | abrir `/diagnostico` e corrigir o item vermelho |
| telemóvel sem áudio | cache antigo / sem voz do sistema | Parte 1.3 + Parte 6.4 |
| “Ditado indisponível” | navegador sem reconhecimento de voz | usar Chrome/Edge no Android, ou escrever a transcrição |
| progresso desapareceu | cookies limpos/outro aparelho | normal: a identidade é um cookie (login exigiria autenticação) |

# CHECKLIST FINAL

- [ ] Neon novo com as 4 tabelas
- [ ] Vercel “Ready” com `DATABASE_URL` definida
- [ ] `/api/health` com `ok:true`
- [ ] nome guardado no painel (base a gravar)
- [ ] app instalada no telemóvel
- [ ] botão **Ouvir** com som
- [ ] gravação chega aos 60 s
- [ ] uma conversa com “Quick fix: …”
