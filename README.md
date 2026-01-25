# Dami Duarte - Web + Apps Script

## Estrutura
- `web/`: Vite + React + TypeScript (PWA, OneSignal, telas)
- `apps-script/`: Google Apps Script (REST + Google Sheets)
- `docs/`: output do build (GitHub Pages)

## Web (GitHub Pages)
1) Instale deps:
   ```bash
   cd web
   npm install
   ```
2) Crie `.env.local` baseado em `web/.env.example`.
3) Rodar local:
   ```bash
   npm run dev
   ```
4) Build para GitHub Pages (gera `docs/`):
   ```bash
   npm run build
   ```
5) Deploy automatico via GitHub Actions:
   - Configure secrets no repo (Settings > Secrets and variables > Actions):
     - `VITE_API_BASE`
     - `VITE_GOOGLE_CLIENT_ID`
     - `VITE_ONESIGNAL_APP_ID`
     - `VITE_OWNER_EMAIL`
   - Push na branch `main` para publicar em GitHub Pages.

## Google Apps Script
1) Crie uma planilha Google e copie o ID.
2) Crie um projeto Apps Script (Web App).
3) Cole `apps-script/Code.gs` e `apps-script/appsscript.json`.
4) Em **Project Settings > Script Properties**, configure:
   - `SPREADSHEET_ID`
   - `OWNER_EMAIL`
   - `ONESIGNAL_APP_ID`
   - `ONESIGNAL_API_KEY`
5) Publique como Web App (Execute as: "Me", Who has access: "Anyone").
6) Use a URL do Web App no `VITE_API_BASE`.

## OneSignal Web Push
- Configure o app Web no OneSignal.
- Copie `ONESIGNAL_APP_ID` e `ONESIGNAL_API_KEY`.
- Arquivos obrigatorios no root do site:
  - `OneSignalSDKWorker.js`
  - `OneSignalSDKUpdaterWorker.js`

## Variaveis de ambiente
Veja `web/.env.example`.

## Observacoes
- O backend aceita `token` via query/body porque Apps Script nao exp?e headers confiaveis.
- PUT/DELETE sao enviados via `POST` com `__method`.
- PWA iOS: orientar a cliente a "Adicionar a Tela de Inicio" no Safari.
