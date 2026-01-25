export const config = {
  apiBase: import.meta.env.VITE_API_BASE || "http://localhost:8080",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  oneSignalAppId: import.meta.env.VITE_ONESIGNAL_APP_ID || "",
  ownerEmail: import.meta.env.VITE_OWNER_EMAIL || "owner@example.com",
  whatsapp: "+5551981311169",
  whatsappDisplay: "(51) 98131-1169",
  whatsappLink:
    "https://api.whatsapp.com/message/UUVGVVLI2B7XI1?autoload=1&app_absent=0&utm_source=ig",
  instagram: "dami.duarte",
  instagramLink: "https://instagram.com/dami.duarte",
  email: "dami.carol@hotmail.com"
};
