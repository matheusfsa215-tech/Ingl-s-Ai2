# Fluentia — guia do zero, com as aplicações exatas

Escrito para quem **nunca fez um deploy**. Cada passo diz **que aplicação abrir**, **o que clicar**
e **o que colar**. Segue por ordem. Tempo total: ~30 minutos.

---

## Resumo: que aplicações vais usar

| # | Aplicação | Onde | Para que serve | Obrigatória? |
|---|---|---|---|---|
| 1 | **Google Chrome** | Computador | Abrir GitHub, Neon, Vercel e o site | ✅ |
| 2 | **Node.js (versão LTS)** | nodejs.org | Correr `npm`, `npx` no terminal e o projeto em local | Só se usares o terminal (podes evitar) |
| 3 | **Terminal / PowerShell** | Já vem no sistema | Enviar o código para o GitHub (`git push`) | Só na rota "terminal" |
| 4 | **GitHub Desktop** (alternativa ao terminal) | desktop.github.com | Enviar o código para o GitHub com cliques | Só na rota "sem terminal" |
| 5 | **GitHub** (site) | github.com | Guardar o código e ligar à Vercel | ✅ |
| 6 | **Neon** (site) | console.neon.tech | Base de dados PostgreSQL na nuvem | ✅ |
| 7 | **Vercel** (site) | vercel.com | Publicar o site na internet (HTTPS) | ✅ |
| 8 | **VS Code** (opcional) | code.visualstudio.com | Ver/editar ficheiros do projeto | Opcional |
| 9 | **Chrome no telemóvel Android** | Telemóvel | Instalar e usar o Fluentia como app | ✅ (para testar) |
| 10 | **Play Store** | Telemóvel | Instalar "Google Text-to-Speech" se não houver voz | Só se não houver áudio |

**Não precisas de:** Android Studio, Docker, XAMPP, pgAdmin, contas pagas.
Neon e Vercel têm plano gratuito suficiente. O Fluentia **não precisa** de nenhum serviço extra
para o áudio ou para o treino de dicção.

**Importante sobre o código:** o projeto tem de estar no teu GitHub para a Vercel o publicar.
Se já tens este projeto num repositório GitHub ligado à Vercel, salta para o **Passo 4**
(basta fazer commit/push; a Vercel publica sozinha).

---

## Passo 1 — Contas (uma vez, 5 min)

Abre o **Chrome** e cria conta nestes três sites, na ordem:

1. **github.com** → *Sign up* (email, password, username). Confirma o email.
2. **console.neon.tech** → *Sign up* → escolhe **Continue with GitHub** (mais simples).
3. **vercel.com** → *Sign up* → escolhe **Continue with GitHub** e aceita autorizar a Vercel.

> Usa o **mesmo email/GitHub** nos três. É isto que faz o botão "Import Project" aparecer sozinho.

---

## Passo 2 — Pôr o código no GitHub (escolhe UMA rota)

### Rota A — já tens repositório (a mais rápida)

Se este projeto já está num repositório GitHub teu:

1. No teu computador, abre o **Terminal** (macOS) ou **PowerShell** (Windows) na pasta do projeto.
2. Corre:
   ```bash
   git add -A
   git commit -m "audio no telemovel, ditado 60s, treino de diccao"
   git push
   ```
3. Fim do passo 2. Vai ao **Passo 3**.

### Rota B — com GitHub Desktop, sem comandos

1. Instala **GitHub Desktop** (desktop.github.com) e entra com a tua conta.
2. Menu **File → Add local repository…** → escolhe a pasta do projeto → *Add*.
3. Se avisar que não é repositório, clica **"create a repository"** → nome `fluentia` → **Create repository**.
4. No canto inferior esquerdo escreve a mensagem "deploy" → **Commit to main** → **Publish repository**
   (desmarca *Keep this code private* se quiseres).
5. Já está no GitHub.

### Rota C — terminal com repositório novo

1. No GitHub: **+ → New repository** → nome `fluentia` → **Create repository** (não marques nada).
2. Copia o URL `https://github.com/o-teu-user/fluentia.git`.
3. Na pasta do projeto:
   ```bash
   git init
   git add -A
   git commit -m "Fluentia"
   git branch -M main
   git remote add origin https://github.com/o-teu-user/fluentia.git
   git push -u origin main
   ```

### Como sei que correu bem?

Atualiza a página do repositório no GitHub: deve aparecer a pasta `src`, `public`, `package.json`.

---

## Passo 3 — Base de dados no Neon (7 min)

### 3.1 Criar o projeto

1. Entra em **console.neon.tech**.
2. **New Project** → *Name*: `fluentia` → *Region*: a mais perto (`AWS eu-central-1` para Portugal)
   → *Postgres version*: a sugerida → **Create project**.

### 3.2 Copiar as duas connection strings

No painel do projeto abre **Connect** (ou *Dashboard → Connection string*):

1. Liga **Connection pooling** (por vezes chamado *Pooled connection*) → copia o texto que começa por
   `postgresql://neondb_owner:...` e contém `-pooler`. **Guarda como "STRING-VERCEL"** (num bloco de notas).
2. Desliga **Connection pooling** (*Direct connection*) → copia outra vez. **Guarda como "STRING-SQL"**.

Ambas têm de terminar em `?sslmode=require`.

### 3.3 Criar as tabelas **sem terminal** (rota recomendada)

1. No Neon, no menu esquerdo, abre **SQL Editor**.
2. No projeto, abre o ficheiro **`drizzle/init-neon.sql`**, seleciona tudo (Ctrl/Cmd+A), copia.
3. Cola no SQL Editor do Neon → **Run**.
4. Deve dizer *Success*. Para verificar, cola e corre:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name;
   ```
   Devem aparecer: `conversations`, `messages`, `profiles`, `pronunciation_attempts`.

> Já tinhas a base criada de antes? O mesmo ficheiro é seguro: cria o que falta e acrescenta a
> coluna `meta` (a única novidade desta versão).

### 3.4 Alternativa com terminal (se preferires)

```bash
# macOS / Linux
export DATABASE_URL="cola-aqui-a-STRING-SQL"
npx drizzle-kit push --config drizzle.config.prod.ts
```

```powershell
# Windows PowerShell
$env:DATABASE_URL="cola-aqui-a-STRING-SQL"
npx drizzle-kit push --config drizzle.config.prod.ts
```
(Precisa de **Node.js LTS** instalado — aplicação #2 — e de correr na pasta do projeto.)

---

## Passo 4 — Publicar na Vercel (7 min)

1. Entra em **vercel.com** → **Add New… → Project**.
2. Em *Import Git Repository* aparece o teu `fluentia` → **Import**. Não aparece? Clica
   *Adjust GitHub App Permissions* → dá acesso ao repositório.
3. Configuração: deixa tudo como está (Framework **Next.js**, Build `npm run build`, Output `.next`).
4. Abre **Environment Variables** e adiciona:

   | Name | Value | Ambientes |
   |---|---|---|
   | `DATABASE_URL` | **STRING-VERCEL** (a do `-pooler`, com `?sslmode=require`) | Production, Preview, Development |
   | `OPENAI_API_KEY` | opcional (`sk-...`) para respostas de IA | idem |

5. **Deploy** → espera 1–3 minutos → aparece *Congratulations* e um link
   `https://fluentia-xxxx.vercel.app`. **Abre esse link no Chrome do computador.**

### Se mudares a variável depois do deploy

**Settings → Environment Variables** → edita → **Deployments → ⋯ (na última) → Redeploy**.
Sem Redeploy o site continua com o valor antigo.

---

## Passo 5 — Verificar (3 min, no computador)

Abre no Chrome, trocando `SEU-LINK` pelo link da Vercel:

- `https://SEU-LINK.vercel.app/api/health` → deve mostrar `{"ok":true}`
- `https://SEU-LINK.vercel.app/` → painel do Fluentia
- `https://SEU-LINK.vercel.app/treino` → treinador de dicção
- `https://SEU-LINK.vercel.app/instalar` → cartão **Testar áudio neste telemóvel**

Se `/api/health` der erro: a `DATABASE_URL` está errada ou as tabelas não existem (Passo 3).

---

## Passo 6 — Telemóvel Android: instalar e corrigir o áudio (5 min)

1. **Atualizar a app antiga** (importante — foi ela que ficou com o áudio em cache):
   - Se já tinhas o Fluentia instalado, abre a app. Deve surgir **"Nova versão disponível → Atualizar"**.
     Toca em **Atualizar**.
   - Se não surgir: desinstala o ícone antigo, abre `SEU-LINK.vercel.app` no **Chrome** e faz
     **menu ⋮ → Instalar aplicação** de novo.
2. **Instalar (primeira vez):** Chrome no telemóvel → abre o link → **⋮ → Instalar aplicação** →
   *Instalar*. Fica um ícone "Fluentia" no ecrã inicial.
3. **Testar o som:** abre a app → separador **App** (ou menu **⋮ → App**) → cartão
   **Testar áudio neste telemóvel**:
   - deve mostrar *"Voz encontrada…"* e o nome de uma voz (ex.: `English United Kingdom`);
   - toca **🔊 Ouvir normal** e depois **🐢 Ouvir lento**. O primeiro toque é obrigatório.
4. **Se não ouvires nada:**
   - sobe o **volume multimédia** e desliga o modo silencioso;
   - Android: *Definições → Acessibilidade → Texto para voz (Text-to-speech)* → confirma que existe
     um motor (**Google Text-to-Speech**, atualiza na Play Store) e que tem voz inglesa instalada;
   - volta à app e testa outra vez.
5. **Microfone / gravação longa:** abre **Dicção** (`/treino`) → aceita *Permitir microfone* →
   toca no microfone grande → falas até **60 segundos** (vês a contagem) → **Avaliar dicção**.
6. No **chat** (`Conversar`): botões **🔊 Ouvir**, **🐢 Lento** em cada resposta e
   **🎙 Praticar dicção desta frase** nas frases corrigidas.
7. **No computador:** o mesmo link no Chrome → ícone de instalar na barra de endereço → a app abre
   em janela própria (Windows/macOS/Linux).

---

## Passo 7 — A partir de agora

| Quero… | Como |
|---|---|
| Publicar alterações | `git push` (ou GitHub Desktop → Commit → Push). A Vercel publica sozinha em ~2 min |
| Mudar uma variável | Vercel → Settings → Environment Variables → editar → **Redeploy** |
| Ver erros do servidor | Vercel → teu projeto → **Logs** |
| Ver dados na base | Neon → **SQL Editor** (`SELECT * FROM profiles;`) |
| Fazer backup | Neon → **Branches / Restore** (guarda histórico) |
| Domínio próprio | Vercel → Settings → Domains → adicionar → copiar os registos DNS para o teu fornecedor |
| APK Android / app desktop | depois do domínio pronto, seguir `docs/APPS.md` |

---

## Onde colocar cada pedaço de informação (cola aqui)

```
LINK DO SITE (Vercel):        https://___________________________
DATABASE_URL (Vercel, pooler): postgresql://_____________________-pooler...?sslmode=require
DATABASE_URL (Neon, direta):   postgresql://_____________________...?sslmode=require
Repositório GitHub:            https://github.com/______________/________
OPENAI_API_KEY (opcional):     sk-______________________________
```

---

## Se algo falhar

| Mensagem / sintoma | O que significa | O que fazer |
|---|---|---|
| `DATABASE_URL is required` no build | a Vercel não viu a variável | adiciona em **todos** os ambientes e faz **Redeploy** |
| `password authentication failed` | copiaste a string errada ou com espaços | copia de novo no Neon (botão *Copy*) |
| `relation "profiles" does not exist` | tabelas não criadas | corre `drizzle/init-neon.sql` no SQL Editor (Passo 3.3) |
| `too many connections` | pool grande no serverless | define `PG_POOL_MAX=3` na Vercel e usa a string `-pooler` |
| Áudio continua mudo no telemóvel | app antiga em cache, ou voz do sistema em falta | Passo 6.1 (Atualizar/Reinstalar) + Passo 6.3/6.4 |
| Microfone não abre | permissão negada antes | Chrome → cadeado → *Microfone* → Permitir → recarregar |
| Site abre mas sem dados/progresso | cookies limpos ou outro dispositivo | normal: a identidade é um cookie; novo dispositivo = novo perfil |
| "Install" não aparece | já instalada, iOS, ou falta HTTPS | usa as instruções manuais da página **App** |
| Build falha em `next build` | ficheiro com erro de sintaxe | corre `npm run build` no computador e lê a primeira linha do erro |

Precisas de detalhe técnico (headers, SSL, pool, migrations): `docs/DEPLOY-VERCEL-NEON.md`.
Empacotamento APK/desktop: `docs/APPS.md`.
