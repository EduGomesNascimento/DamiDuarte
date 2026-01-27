# Dami Duarte - Web + Apps Script

## Visao geral
Sistema completo para clientes e owner:
- Frontend estatico (GitHub Pages)
- Backend (Google Apps Script)
- Banco (Google Sheets)
- Login Google (GIS)
- Push (OneSignal) com feature flag

## Estrutura
- `web/`: Vite + React + TypeScript (PWA + UI)
- `apps-script/`: Google Apps Script (REST + Sheets)
- `docs/`: output do build (GitHub Pages)

## 1) Google OAuth Client ID (GIS)
1. Google Cloud Console > APIs & Services > Credentials
2. Create Credentials > OAuth client ID > Web application
3. Authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://SEU_USUARIO.github.io`
4. Authorized redirect URIs: (deixe vazio)

## 2) Google Sheets
1. Crie uma planilha Google
2. Copie o ID (URL da planilha)

## 3) Apps Script (Backend)
1. Crie um projeto Apps Script
2. Cole `apps-script/Code.gs` e `apps-script/appsscript.json`
3. Em **Project Settings > Script Properties**:
   - `SPREADSHEET_ID` = ID da planilha
   - `OWNER_EMAIL` = email da owner
   - `WEB_ORIGIN` = origens permitidas (separadas por virgula)
     - exemplo: `https://SEU_USUARIO.github.io,http://localhost:5173`
   - `GOOGLE_CLIENT_ID` = Client ID do OAuth
   - `ONESIGNAL_APP_ID` = (opcional)
   - `ONESIGNAL_API_KEY` = (opcional)
4. Deploy > New deployment > Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copie a URL do Web App (API base)

## 4) Frontend (GitHub Pages)
### Rodar local
```bash
cd web
npm install
npm run dev
```
Crie `web/.env.local`:
```
VITE_API_BASE=URL_DO_WEB_APP
VITE_GOOGLE_CLIENT_ID=SEU_CLIENT_ID
VITE_ONESIGNAL_APP_ID=SEU_ONESIGNAL_APP_ID
VITE_OWNER_EMAIL=seu-email@dominio.com
```

### Deploy automatico (GitHub Actions)
1. Repo > Settings > Secrets and variables > Actions:
   - `VITE_API_BASE`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_ONESIGNAL_APP_ID`
   - `VITE_OWNER_EMAIL`
2. Push na `main` dispara o deploy.
3. Settings > Pages:
   - Source: `gh-pages` / root
4. URL final:
   - `https://SEU_USUARIO.github.io/SEU_REPO/`

## Endpoints (resumo)
- POST `/auth/me` (login com ID token)
- GET/PUT `/me`
- GET `/appointments` (cliente)
- GET `/history?days=30` (cliente)
- GET `/announcements` (publicados)
- GET `/products` (ativos)
- OWNER:
  - GET/POST/PUT/DELETE `/owner/users`
  - GET/POST/PUT/DELETE `/owner/appointments`
  - GET `/owner/history?days=30`
  - GET `/owner/stats/week`
  - GET `/owner/stats/month`
  - GET/POST/PUT/DELETE `/owner/announcements`
  - GET/POST/PUT/DELETE `/owner/products`
  - POST `/owner/push`

## Status e totais
- Week: ultimos 7 dias
- Month: do primeiro dia do mes ate hoje
- Total: soma de appointments com status `DONE`

## Notificacoes Push (OneSignal)
- Arquivos ja incluidos:
  - `web/public/OneSignalSDKWorker.js`
  - `web/public/OneSignalSDKUpdaterWorker.js`
- No frontend, a inscricao e feita apos login.
- Envio via `/owner/push`.
- Se OneSignal nao estiver configurado, o app continua funcionando.

## Checklist final
- Login Google funcionando (cliente e owner)
- Rotas protegidas
- CRUD appointments/users/products/announcements
- Historico 30 dias + totais
- WhatsApp + Instagram configurados
- GitHub Pages publicado

## Known issues
- Se der erro de CORS, confirme `WEB_ORIGIN` no Apps Script e `VITE_API_BASE` no GitHub Secrets.
