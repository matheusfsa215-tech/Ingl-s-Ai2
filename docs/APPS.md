# Fluentia como aplicação — Android e computador

O Fluentia é uma **PWA (Progressive Web App)**: a mesma base de código corre como app instalável
em Android, iPhone, Windows, macOS e Linux. Além disso, o repositório inclui o empacotamento
nativo para APK/AAB (Capacitor) e instaladores de secretária (Electron).

## 1. Instalação imediata (PWA)

Já funciona sem build adicional, desde que o site esteja servido por HTTPS.

### Android (Chrome, Android 8+)
1. Abre o site no Chrome.
2. Menu `⋮` → **Instalar aplicação** (ou **Adicionar ao ecrã principal**).
3. Confirma. A app abre em ecrã inteiro, com ícone próprio e atalhos para **Conversar**,
   **Pronúncia** e **Progresso**.

### Windows / macOS / Linux (Chrome ou Edge)
1. Abre o site.
2. Clica no ícone de instalação da barra de endereço (ou menu `⋮` → **Instalar Fluentia**).
3. Confirma. Passa a abrir numa janela própria, sem barra de navegador.

### iPhone / iPad (Safari)
Partilhar → **Adicionar ao ecrã principal**.

## 2. APK / AAB Android (Capacitor)

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
```

Edita `capacitor.config.json` e substitui `server.url` pelo domínio onde o Next.js está publicado
(o APK carrega a app remota e beneficia de atualizações imediatas):

```json
"server": { "androidScheme": "https", "url": "https://o-teu-dominio.com", "cleartext": false }
```

```bash
npx cap add android
npm run build
npx cap sync android
npx cap open android      # Android Studio
# Build > Build Bundle(s) / APK(s) > Build APK(s)
# Release assinado: cd android && ./gradlew bundleRelease
```

Saída: `android/app/build/outputs/apk/debug/app-debug.apk` e
`android/app/build/outputs/bundle/release/app-release.aab` (Play Store).

> O microfone é pedido pelo `WebView` através do reconhecimento de voz do Chrome/Android.
> Permissões relevantes em `android/app/src/main/AndroidManifest.xml`:
> `android.permission.RECORD_AUDIO`, `android.permission.INTERNET`.

## 3. Desktop nativo (Electron)

```bash
npm i -D electron electron-builder
npm run build && npm run start &
ELECTRON_START_URL=http://localhost:3000 npx electron electron/main.cjs
```

Gerar instaladores:

```bash
npx electron-builder --dir                 # pasta com a app
npx electron-builder --win --mac --linux   # .exe (NSIS), .dmg, AppImage/deb
```

Configuração em `electron-builder.yml`; ícone em `public/icons/icon-512.png`. O `main` do Electron
está em `electron/main.cjs` e já permite microfone (`setPermissionRequestHandler`).

Para apontar para produção em vez de `localhost`, usa:

```bash
ELECTRON_START_URL=https://o-teu-dominio.com npm run desktop
```

## 4. O que já está implementado

| Recurso | Ficheiro |
| --- | --- |
| Manifesto (nome, ícones, atalhos, cores) | `public/manifest.webmanifest` |
| Service worker (offline shell + cache de assets) | `public/sw.js` |
| Registo do SW, banner de instalação, aviso de nova versão | `src/components/PwaProvider.tsx` |
| Lógica de instalação / deteção de plataforma | `src/lib/pwa.ts` |
| Ecrã "App" com instruções e comandos | `src/app/instalar/page.tsx` |
| Página offline | `src/app/offline/page.tsx` |
| Ícones 192/512/maskable/apple-touch | `public/icons/` |
| Empacotamento Android | `capacitor.config.json` |
| Empacotamento desktop | `electron/`, `electron-builder.yml` |

## 5. Áudio, ditado e treino de dicção

- **Áudio no telemóvel**: o motor de voz (`src/lib/speech.ts`) carrega a lista de vozes com
  `voiceschanged`, escolhe uma voz `en-GB`/`en-US` local, espera 70 ms depois de `cancel()`
  (exigência do Android), tenta novamente sem voz explícita se o WebView ignorar a primeira
  chamada e repete a reprodução por frases em respostas longas. Botões **Ouvir** (0,94×),
  **Lento** (0,58×) e **Sílabas** disponíveis no chat e no treino.
- **Duração do ditado**: `src/hooks/useDictation.ts` grava até **60 s** (30 s na página de
  pronúncia) e reinicia automaticamente quando o Android/iOS fecham a sessão por silêncio,
  com contagem decrescente visível.
- **Treino de dicção (`/treino`)**: ciclo ouve → repete → grava → avalia, com plano do tutor
  adaptado à nota (85+ aprovado), sílabas das palavras falhadas, dicas por som (/θ/, /v/ vs /w/,
  -ed, grupos de consoantes) e repetição até boa dicção.
- **Chat corretivo**: cada resposta do tutor abre com a correção prioritária
  (`Quick fix: “…” instead of “…”`) e cada frase corrigida tem prática de dicção embutida.

## 6. Notas

- `/api/*` nunca é servido do cache: precisa de rede. As páginas visitadas continuam a abrir offline
  e mostram o conteúdo em cache; as conversas novas exigem ligação.
- O progresso está ligado ao dispositivo através de um cookie `httpOnly`
  (`fluentia_learner`). Para uma conta entre dispositivos seria necessário autenticação.
- A instalação exige HTTPS (ou `localhost`). O deploy desta plataforma já serve HTTPS.
