const getRuntime = () => {
  if (typeof window === "undefined") return {} as Record<string, string>;
  const w = window as any;
  if (w.__RUNTIME_CONFIG__) return w.__RUNTIME_CONFIG__;

  const params = new URLSearchParams(window.location.search);
  const apiBase = params.get("apiBase");
  if (apiBase) {
    localStorage.setItem("dami.apiBase.v2", apiBase);
  }
  if (localStorage.getItem("dami.apiBase")) {
    localStorage.removeItem("dami.apiBase");
  }
  const stored = localStorage.getItem("dami.apiBase.v2") || "";
  return stored ? { apiBase: stored } : {};
};

const runtime = getRuntime();

export const config = {
  apiBase: (runtime.apiBase as string) || import.meta.env.VITE_API_BASE || "",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  oneSignalAppId: import.meta.env.VITE_ONESIGNAL_APP_ID || "",
  ownerEmail: import.meta.env.VITE_OWNER_EMAIL || "owner@example.com",
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  firebaseMessagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  whatsapp: "+5551981311169",
  whatsappDisplay: "(51) 98131-1169",
  whatsappLink:
    "https://api.whatsapp.com/message/UUVGVVLI2B7XI1?autoload=1&app_absent=0&utm_source=ig",
  instagram: "dami.duarte",
  instagramLink: "https://instagram.com/dami.duarte",
  email: "dami.carol@hotmail.com"
};
