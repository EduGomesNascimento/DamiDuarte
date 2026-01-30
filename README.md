# Dami Duarte - Web + Firebase

## Visao geral
Sistema completo para clientes e owner:
- Frontend estatico (GitHub Pages)
- Backend (Firebase Auth + Firestore)
- Login Google (Firebase Auth)
- Push (OneSignal) com feature flag

## Estrutura
- `web/`: Vite + React + TypeScript (PWA + UI)
- `apps-script/`: legado (nao usado no modo Firebase)
- `docs/`: output do build (GitHub Pages)

## 1) Firebase
1. Crie um projeto no Firebase Console.
2. Ative **Authentication > Sign-in method > Google**.
3. Em **Authentication > Settings > Authorized domains**:
   - `localhost`
   - `edugomesnascimento.github.io`
4. Ative **Firestore Database** (modo production).
5. Copie as configs do app web (Project Settings > General > Your apps).

## 2) Frontend (GitHub Pages)
### Rodar local
```bash
cd web
npm install
npm run dev
```
Crie `web/.env.local`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ONESIGNAL_APP_ID=SEU_ONESIGNAL_APP_ID
VITE_OWNER_EMAIL=seu-email@dominio.com
```

### Deploy automatico (GitHub Actions)
1. Repo > Settings > Secrets and variables > Actions:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_ONESIGNAL_APP_ID`
   - `VITE_OWNER_EMAIL`
2. Push na `main` dispara o deploy.
3. Settings > Pages:
   - Source: `gh-pages` / root
4. URL final:
   - `https://SEU_USUARIO.github.io/SEU_REPO/`

## Firestore (colecoes)
- `users`
- `appointments`
- `announcements`
- `products`
- `audit` (opcional)

## Status e totais
- Week: ultimos 7 dias
- Month: do primeiro dia do mes ate hoje
- Total: soma de appointments com status `DONE`

## Notificacoes Push (OneSignal)
- Arquivos ja incluidos:
  - `web/public/OneSignalSDKWorker.js`
  - `web/public/OneSignalSDKUpdaterWorker.js`
- No frontend, a inscricao e feita apos login.
- Envio via `/owner/push` (placeholder no modo Firebase).
- Se OneSignal nao estiver configurado, o app continua funcionando.

## Checklist final
- Login Google funcionando (cliente e owner)
- Rotas protegidas
- CRUD appointments/users/products/announcements
- Historico 30 dias + totais
- WhatsApp + Instagram configurados
- GitHub Pages publicado

## Regras Firestore (cole em Rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner() {
      return request.auth != null && request.auth.token.email == "OWNER_EMAIL";
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || isOwner());
    }
    match /appointments/{id} {
      allow read, write: if request.auth != null && (isOwner() || request.resource.data.userId == request.auth.uid || resource.data.userId == request.auth.uid);
    }
    match /announcements/{id} {
      allow read: if true;
      allow write: if isOwner();
    }
    match /products/{id} {
      allow read: if true;
      allow write: if isOwner();
    }
  }
}
```
Troque `OWNER_EMAIL` pelo email da Dami.

## Known issues
- Push via OneSignal ainda depende de backend seguro.
