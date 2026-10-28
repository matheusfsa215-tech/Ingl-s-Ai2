# Subir o Fluentia para produção — Vercel + Neon

Checklist para publicar esta versão (áudio corrigido no telemóvel, gravação até 60 s,
página `/treino` de dicção, chat corretivo melhorado e app instalável).

Tempo estimado: 10–15 minutos. Nada precisa de ser instalado além do que já tens.

---

## 0. Antes de começar (2 min)

```bash
npm run build      # confirma que compila localmente
```

Ficheiros novos/alterados que têm de ir no commit:

| Ficheiro | Para que serve |
| --- | --- |
| `src/lib/speech.ts` | áudio fiável no Android/iOS (voz, retry, lento, sílabas) |
| `src/hooks/useDictation.ts` | gravação longa com contagem decrescente |
| `src/components/DictionCoach.tsx`, `src/app/treino` | treinador de dicção |
| `src/components/InlineDictionPractice.tsx` | prática de dicção dentro do chat |
| `src/lib/coaching.ts`, `src/app/api/coach` | plano do tutor + avaliação |
| `src/db/index.ts` | SSL e pool compatíveis com Neon/serverless |
| `public/sw.js` | **versão v4** — invalida o cache antigo com o áudio silencioso |
| `vercel.json` | `/sw.js` e manifesto sem cache, ícones com cache longo |
| `drizzle.config.prod.ts` | aplicar o schema no Neon |
| `.env.example` | variáveis necessárias |

```bash
git add -A
git commit -m "Fluentia: audio no telemovel, ditado 60s e treino de diccao"
git push
```

> Se ainda não tens repositório: `git remote add origin <URL>` e `git push -u origin main`.
> A Vercel também aceita `npx vercel --prod` diretamente da pasta.

---

## 1. Criar/confirmar a base no Neon (3 min)

1. Entra em <https://console.neon.tech> → projeto existente **ou** *New Project*
   (região mais próxima, ex.: `eu-central-1`).
2. Em **Dashboard → Connect** copia **duas** connection strings:
   - **Pooled** (termina em `-pooler.eu-central-1.aws.neon.tech`) → para a Vercel;
   - **Direct** (sem `-pooler`) → só para aplicar o schema.
3. Ambas devem terminar com `?sslmode=require`.

Exemplo:

```
postgresql://neondb_owner:npg_xxx@ep-cool-name-123456-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

## 2. Aplicar o schema no Neon (2 min)

Corre **uma vez** a partir do teu computador, com a string **direta**:

```bash
export DATABASE_URL="postgresql://...@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
npx drizzle-kit push --config drizzle.config.prod.ts
```

Deves ver `Changes applied` e as tabelas `profiles`, `conversations`, `messages`,
`pronunciation_attempts`.

Confirma:

```bash
psql "$DATABASE_URL" -c "\dt"
```

> A versão desta release só **adiciona** a coluna `messages.meta`; se a base já existia,
> `drizzle-kit push` acrescenta-a sem apagar dados.
> Não corras `push` contra o endpoint `-pooler`: usa o direto para DDL.

---

## 3. Variáveis na Vercel (2 min)

**Project → Settings → Environment Variables** (marca Production, Preview e Development):

| Nome | Valor | Obrigatória |
| --- | --- | --- |
| `DATABASE_URL` | connection string **pooled** do Neon com `?sslmode=require` | ✅ |
| `OPENAI_API_KEY` | `sk-...` (ativa respostas geradas por IA) | opcional |
| `OPENAI_MODEL` | `gpt-4o-mini` (por omissão) | opcional |
| `PG_POOL_MAX` | `5` (por omissão) | opcional |

Notas:
- Se já tinhas `DATABASE_URL`, **substitui** pelo endpoint pooled — o código novo força SSL
  para hosts remotos e limita o pool a 5 ligações (evita esgotar o PgBouncer do Neon).
- Sem `OPENAI_API_KEY` a app funciona na mesma: o tutor local de correções, o treino de dicção
  e o ditado não dependem de IA externa.

---

## 4. Deploy (2 min)

**Opção A — Git (recomendado):** o `git push` do passo 0 já dispara o deploy.
Confirma em **Deployments** que o build passou.

**Opção B — CLI:**

```bash
npx vercel --prod
```

**Importante:** se mudaste variáveis de ambiente depois do último deploy, faz
**Deployments → ⋯ → Redeploy** (o build tem de ler as novas variáveis).

Configuração esperada na Vercel (detetada automaticamente):
- Framework: **Next.js** (`vercel.json` já define `"framework": "nextjs"`);
- Build: `npm run build` · Output: `.next` · Install: `npm install`;
- Node 20+ recomendado (Project → Settings → General → Node.js Version).

---

## 5. Verificação pós-deploy (3 min)

```bash
BASE=https://o-teu-dominio.vercel.app

curl -s $BASE/api/health                       # {"ok":true}
curl -s -o /dev/null -w "%{http_code}\n" $BASE/            # 200
curl -s -o /dev/null -w "%{http_code}\n" $BASE/treino      # 200
curl -s -o /dev/null -w "%{http_code}\n" $BASE/praticar    # 200
curl -s -o /dev/null -w "%{http_code}\n" $BASE/manifest.webmanifest
curl -sI $BASE/sw.js | grep -i cache-control   # max-age=0, must-revalidate
```

Depois, no telemóvel:

1. **Atualizar o cache antigo** (o áudio silencioso ficava aqui):
   - Se já tinhas a app instalada, abre-a → deve aparecer **“Nova versão disponível → Atualizar”**;
     toca em Atualizar. Se não aparecer, fecha a app, abre no Chrome e recarrega com
     *Definições do site → Limpar dados* ou desinstala/reinstala a PWA.
   - O `sw.js` agora está em `fluentia-v4-audio`: os caches antigos são apagados no `activate`.
2. Abre **App** (`/instalar`) → cartão **“Testar áudio neste telemóvel”**:
   - deve mostrar `Voz encontrada…` e o nome da voz;
   - toca **🔊 Ouvir normal** e **🐢 Ouvir lento** — o primeiro toque é obrigatório (política
     de autoplay do Android/iOS).
3. Se não ouvires nada: volume de multimédia, modo silencioso/energia, e
   *Definições → Acessibilidade → Texto para voz → motor Google* instalado e com voz inglesa.
4. Microfone: aceita a permissão; grava até **60 s** (contagem visível) em `/treino` ou no chat.
5. Abre `/treino`, grava uma frase e confirma nota + plano de correção.

---

## 6. Problemas comuns

| Sintoma | Causa | Solução |
| --- | --- | --- |
| Build falha com `DATABASE_URL is required` | variável não definida no ambiente certo | adiciona em Production **e** Preview e faz Redeploy |
| `password authentication failed` / `no pg_hba.conf entry` | host de base errado ou sem SSL | usa o endpoint `-pooler` + `?sslmode=require` |
| `too many connections` no Neon | pool grande em serverless | `PG_POOL_MAX=3` e confirma que usas o pooled endpoint |
| tabelas não existem (`relation "profiles" does not exist`) | schema não aplicado | passo 2 com a string direta |
| áudio continua sem som no telemóvel | service worker antigo em cache | passo 5.1 (Atualizar/reinstalar) + teste na página App |
| microfone bloqueado | permissão negada anteriormente | Chrome → cadeado → Microfone → Permitir; recarregar |
| install prompt não aparece | já está instalada, iOS, ou site não HTTPS | `/instalar` mostra instruções manuais por plataforma |
| progresso “desaparece” | identidade por cookie `httpOnly` | normal ao limpar cookies/trocar de dispositivo (login multi-dispositivo exigiria autenticação) |

---

## 7. Depois do deploy (opcional)

- **Domínio próprio:** Vercel → Settings → Domains (HTTPS automático; obrigatório para PWA/microfone).
- **Backups Neon:** ativa *Restore window* / PITR no projeto Neon.
- **Migrações futuras:** `npx drizzle-kit generate --config drizzle.config.prod.ts` +
  `drizzle-kit migrate` para histórico versionado em `./drizzle`.
- **Observabilidade:** Vercel → Logs (runtime) e *Speed Insights*; erros de base aparecem com prefixo `[db]`.
- **APK/desktop:** depois de o domínio estar validado, substitui `SUBSTITUI-PELO-TEU-DOMINIO`
  em `capacitor.config.json` e no Electron e segue `docs/APPS.md`.
