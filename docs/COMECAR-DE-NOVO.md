# Fluentia — lançar do zero, apagando o antigo

> ## Quem faz o quê (lê primeiro, 1 minuto)
>
> Eu **não consigo** entrar nas tuas contas (Neon, Vercel, GitHub): não tenho acesso ao teu
> browser, ao teu email nem às tuas credenciais — e criar contas exige verificação no teu email.
> O que **está automatizado**:
>
> | Caminho | Quem faz | O que precisas |
> |---|---|---|
> | **A — 1 comando** (recomendado) | tu, com 1 comando | Node.js LTS + a string do Neon. Corre `bash scripts/deploy.sh` e responde a 2 perguntas |
> | **B — eu faço a base** | eu, aqui | cola neste chat a **DATABASE_URL direta** do Neon → eu crio as tabelas, verifico e digo-te o resultado |
> | **C — eu faço o deploy** | eu, aqui | cola um **VERCEL_TOKEN** (vercel.com/account/tokens) → eu publico e configuro `DATABASE_URL` |
> | **D — tudo à mão** | tu, sem terminal | fases 2–6 abaixo no browser |
>
> Segurança: um token/connection string partilhado deve ser **revogado** depois (`Delete` no token;
> `Reset password` no Neon). Se preferires não partilhar nada, usa o caminho **A** ou **D**.


Este guia apaga o site antigo (Vercel) e a base antiga (Neon) e cria tudo novo, por ordem,
com as aplicações exatas. Faz os passos **sem pressa**, na sequência. Tempo: ~30 minutos.

Antes de começar, garante que tens aberto no computador:
- **Google Chrome** (recomendado; Safari/Firefox também servem para isto)
- conta no **GitHub** (github.com), no **Neon** (console.neon.tech) e na **Vercel** (vercel.com)
- o **código deste projeto** numa pasta do teu computador (ou já num repositório GitHub)

> Se o código estiver num repositório GitHub que a Vercel já usa, **não apagues o repositório** —
> apaga só o *projeto Vercel* e a *base Neon*. O GitHub fica.

---

## FASE 1 — Apagar o antigo (5 min)

### 1.1 Apagar o projeto na Vercel

1. Abre **vercel.com** → entra.
2. Clica no projeto antigo (ex.: `fluentia`).
3. **Settings** (menu do topo) → desce até ao fim → **Delete Project** → escreve o nome do
   projeto para confirmar → **Delete**.
4. Se tiveres um domínio próprio associado, ele fica livre automaticamente.

> Apagar o projeto na Vercel **não apaga** o GitHub nem o Neon. Os dados continuam no Neon até ao 1.2.

### 1.2 Apagar a base antiga no Neon

1. Abre **console.neon.tech** → entra.
2. Escolhe o projeto antigo.
3. **Settings** (barra lateral) → desce até **Delete project** → escreve o nome → **Delete**.
4. Confirma que a lista de projetos já não mostra o antigo.

> Só faz isto se quiseres mesmo começar limpo. Se quiseres guardar os dados antigos, salta o 1.2
> e no Passo 3 cria apenas as tabelas que faltam (o SQL é seguro e não apaga linhas).

### 1.3 Limpar o telemóvel (obrigatório para o áudio)

1. No telemóvel, **pressiona sem soltar** o ícone do Fluentia → **Desinstalar** (ou
   *Informações da app → Desinstalar*).
2. No **Chrome** do telemóvel: **⋮ → Definições → Definições do site → Fluentia → Limpar e
   repor** (isto remove o service worker/cache antigo com o áudio em silêncio).

---

## FASE 2 — Base de dados nova no Neon (8 min)

### 2.1 Criar o projeto

1. **console.neon.tech** → **New Project**.
2. *Project name*: `fluentia` · *Region*: `AWS eu-central-1` (Frankfurt) · *Postgres*: versão sugerida.
3. **Create project**.

### 2.2 Copiar as DUAS strings

No painel do projeto → **Connect** (ou *Dashboard → Connection string*):

| Para que serve | Como obter | Exemplo |
|---|---|---|
| **Vercel** (runtime) | liga **Connection pooling** e copia | `postgresql://neondb_owner:XXX@ep-abc-123-**pooler**.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| **SQL** (criar tabelas) | desliga **Connection pooling** e copia | `postgresql://neondb_owner:XXX@ep-abc-123.eu-central-1.aws.neon.tech/neondb?sslmode=require` |

Guarda as duas no bloco de notas. **Terminam sempre em `?sslmode=require`.**

### 2.3 Criar as tabelas (sem terminal)

1. No Neon, menu esquerdo → **SQL Editor**.
2. No teu computador, abre o ficheiro **`drizzle/init-neon.sql`** (na pasta do projeto) com o
   Bloco de Notas/VS Code → **Ctrl+A / Cmd+A** → **Ctrl+C**.
3. Cola no SQL Editor do Neon → botão **Run**.
4. Verifica: cola e corre
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1;
   ```
   Tens de ver as 4: `conversations`, `messages`, `profiles`, `pronunciation_attempts`.

> Alternativa com terminal (opcional): `export DATABASE_URL="a-string-SQL"` e depois
> `npx drizzle-kit push --config drizzle.config.prod.ts` (precisa de Node.js LTS).

---

## FASE 3 — Código no GitHub (5 min, salta se já lá está)

Se o código **já está** no GitHub e queres publicar esta versão, no terminal na pasta do projeto:

```bash
git add -A
git commit -m "audio no telemovel, ditado 60s, diccao, diagnostico"
git push
```

Se ainda **não está** no GitHub, usa uma destas:

- **GitHub Desktop** (desktop.github.com): *File → Add local repository* → escolhe a pasta →
  **create a repository** → **Commit to main** → **Publish repository**.
- **Terminal**: no GitHub cria um repositório vazio `fluentia`; depois
  ```bash
  git init && git add -A && git commit -m "Fluentia"
  git branch -M main
  git remote add origin https://github.com/O-TEU-USER/fluentia.git
  git push -u origin main
  ```

Confirma no github.com que aparecem `src/`, `public/`, `package.json`.

---

## FASE 4 — Publicar na Vercel (7 min)

1. **vercel.com** → **Add New… → Project**.
2. Em *Import Git Repository* escolhe `fluentia` → **Import**.
   Não aparece? **Adjust GitHub App Permissions** → dá acesso ao repositório.
3. Não alteres o build. Confirma apenas: *Framework Preset* = **Next.js**.
4. Abre **Environment Variables** e cria (marca as três colunas: Production, Preview, Development):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | a string **pooled** do passo 2.2 (`...-pooler...?sslmode=require`) |
   | `OPENAI_API_KEY` | *opcional*, `sk-...` para respostas de IA |

   Atenção: sem espaços antes/depois, uma linha só.
5. **Deploy** → espera até “Congratulations” → copia o link `https://fluentia-xxxx.vercel.app`.

---

## FASE 5 — Confirmar no computador (3 min)

Abre no Chrome (troca `SEU-LINK`):

1. `https://SEU-LINK.vercel.app/api/health`
   → esperado: `{"ok":true, "service":"fluentia", "checks":[...]}` com todos `"status":"ok"`.
   Se der `503`, lê o campo `detail` do check que falhou — diz exatamente o que fazer.
2. `https://SEU-LINK.vercel.app/diagnostico` → página **🩺 Diagnóstico** (servidor + dispositivo).
3. `https://SEU-LINK.vercel.app/` (painel), `/treino` (dicção), `/instalar` (app + teste de áudio).
4. No painel, escreve o teu nome no cartão “Vamos personalizar” → **Guardar perfil**
   (se gravar, a base está 100% operacional).

---

## FASE 6 — Telemóvel Android: instalar e ouvir (5 min)

1. Abre `SEU-LINK.vercel.app` no **Chrome** do telemóvel.
2. **⋮ → Instalar aplicação → Instalar**. Fica o ícone “Fluentia”.
3. Abre a app → **⋮/menu → App** (ou o atalho 🩺/ícone de telefone) → cartão
   **“Testar áudio neste telemóvel”**:
   - tem de mostrar **“Voz encontrada…”** e o nome de uma voz (`English United Kingdom` etc.);
   - toca **🔊 Ouvir normal** e **🐢 Ouvir lento**. O 1.º toque é obrigatório (política do Chrome).
4. **Se não houver som:**
   - volume multimédia para cima, modo silencioso desligado;
   - Android → *Definições → Acessibilidade → Texto para voz* → motor **Google Text-to-Speech**
     (atualiza na Play Store) → *Instalar dados de voz* → **English**;
   - volta à app e testa outra vez.
5. **Microfone:** separador **Dicção** → *Permitir* microfone → toca no microfone grande → fala até
   **60 s** (contagem no ecrã) → **Avaliar dicção** → recebes nota + plano do tutor.
6. **Chat:** **Conversar** → escreve ou dita → a resposta abre com “Quick fix:…” e cada frase
   corrigida tem **🎙 Praticar dicção desta frase**.

---

## Como sei que está tudo bem? (checklist final)

- [ ] `console.neon.tech` mostra o projeto novo com as 4 tabelas
- [ ] Vercel: último deploy = **Ready**, com `DATABASE_URL` definida
- [ ] `/api/health` devolve `"ok":true` com todos os checks `ok`
- [ ] `/diagnostico` mostra servidor ✓ e, no telemóvel, vozes ✓ e ditado ✓
- [ ] Telemóvel: app instalada, botão **Ouvir** produz som
- [ ] Dicção: gravação passa dos 10 s e chega aos 60 s com contagem
- [ ] Perfil gravado (nome) e XP a subir depois de uma conversa

---

## Problemas → causa → solução

| O que vês | Causa | Solução |
|---|---|---|
| Vercel build: `DATABASE_URL is required` | variável não existe no ambiente | Settings → Environment Variables (todas as colunas) → **Redeploy** |
| `/api/health` 503 com `password authentication failed` | string colada errada/incompleta | volta ao Neon → **Connect → Copy** e cola de novo |
| `relation "profiles" does not exist` | não correste o SQL | SQL Editor → cola `drizzle/init-neon.sql` → Run |
| `too many connections` | pool grande / string direta na Vercel | usa a string **pooled** e `PG_POOL_MAX=3` |
| Site abre mas “Não consegui…” no chat | base indisponível | ver `/api/health` e corrigir o check em falha |
| Áudio mudo só no telemóvel | cache antigo ou sem voz do sistema | Fase 1.3 + Fase 6.4 |
| Diz “Ditado indisponível” | navegador sem SpeechRecognition | Chrome Android / Edge; ou escreve a transcrição |
| Instalar não aparece | já instalada, iOS, ou não é HTTPS | usa as instruções manuais em `/instalar` |
| Perdi o progresso | cookie apagado/outro dispositivo | esperado: identidade é um cookie (login exigiria autenticação) |

---

## Depois de estar a funcionar

- Alterações futuras: `git push` → Vercel publica em ~2 min (não precisas repetir nada disto).
- Variáveis: alterar → **Deployments → ⋮ → Redeploy**.
- Base de dados: dados em **Neon → Tables** ou **SQL Editor** (`SELECT * FROM profiles;`).
- Domínio próprio: Vercel → Settings → Domains.
- APK Android / app desktop: `docs/APPS.md` (depois de teres o domínio).
- Detalhes técnicos de deploy: `docs/DEPLOY-VERCEL-NEON.md`.

## Bloco para guardares

```
Site:                  https://________________.vercel.app
Neon pooled (Vercel):  postgresql://______________-pooler...?sslmode=require
Neon direta (SQL):     postgresql://______________...?sslmode=require
GitHub:                https://github.com/________/________
Diagnóstico:           https://________________.vercel.app/diagnostico
```

---

## Anexo — Caminho A em detalhe (1 comando)

Depois de teres a string **direta** do Neon (Connect → sem pooling):

```bash
bash scripts/deploy.sh
```

O script:

1. confirma Node e mostra a versão;
2. pede a `DATABASE_URL` (esconde-se se já estiver exportada);
3. verifica a ligação com `scripts/check-db.mjs` e lista o que falta;
4. aplica o schema (`npx drizzle-kit push --config drizzle.config.prod.ts`);
5. volta a verificar (tabelas + coluna `messages.meta`);
6. corre `npm run build` para garantir que compila;
7. publica na Vercel:
   - **com** `VERCEL_TOKEN` → define `DATABASE_URL` em Production/Preview/Development e faz deploy sem perguntas;
   - **sem** token → abre o login normal da Vercel e faz deploy de produção.

Se quiseres também que a Vercel receba a string **pooled** (recomendado), exporta as duas antes:

```bash
export DATABASE_URL="postgresql://...@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
export POOLED_DATABASE_URL="postgresql://...@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
export VERCEL_TOKEN="o-teu-token"          # opcional
export OPENAI_API_KEY="sk-..."             # opcional
bash scripts/deploy.sh
```

No fim, o script imprime os links de verificação: `/api/health` e `/diagnostico`.

### Sem Node.js instalado?

Instala **Node.js LTS** em nodejs.org (aplicação #2 da lista) — é o único programa extra que o
caminho A exige. Alternativa: caminho D (tudo no browser) ou caminho B/C (eu executo aqui).

### O que fazer se o script parar

| Mensagem | O que fazer |
|---|---|
| `Faltam tabelas` | o `drizzle-kit push` falhou: confirma que estás a usar a string **direta** e não a pooled |
| `sem sslmode=require` | copia a string outra vez no Neon (já inclui o parâmetro) |
| `DATABASE_URL is missing` no build | normal se ainda não definiste na Vercel; o script define-a nos 3 ambientes quando há token |
| `vercel link` a pedir projeto | aceita o nome sugerido; o deploy cria o projeto novo |
| deploy “Ready” mas `/api/health` 503 | abre `/diagnostico` e lê o item vermelho |

> A app já não falha o **build** quando falta a `DATABASE_URL`: a ligação é criada preguiçosamente
> (só na primeira consulta), pelo que o erro aparece no `/api/health` com uma mensagem clara em vez
> de partir o deploy.
