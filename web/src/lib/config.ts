const getRuntime = () => {
  if (typeof window === "undefined") return {} as Record<string, string>;
  const w = window as any;
  if (w.__RUNTIME_CONFIG__) return w.__RUNTIME_CONFIG__;

  const params = new URLSearchParams(window.location.search);
  const apiBase = params.get("apiBase");
  if (apiBase) {
    localStorage.setItem("dami.apiBase", apiBase);
  }
  const stored = localStorage.getItem("dami.apiBase") || "";
  return stored ? { apiBase: stored } : {};
};

const runtime = getRuntime();

export const config = {
  apiBase:
    (runtime.apiBase as string) ||
    import.meta.env.VITE_API_BASE ||
    "https://script.google.com/macros/s/AKfycbw5F4ffot3mP3V-aJkwvyuaY46qkulVMXbhT7T6fqwO9NH8QeTEUCiLqZfiRhwZGYSy/exec",
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
