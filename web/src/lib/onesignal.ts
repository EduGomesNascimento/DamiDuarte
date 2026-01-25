import { config } from "./config";

declare global {
  interface Window {
    OneSignal?: any;
  }
}

const ONESIGNAL_SCRIPT = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";

export const loadOneSignal = async (): Promise<void> => {
  if (window.OneSignal) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = ONESIGNAL_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar OneSignal"));
    document.head.appendChild(script);
  });
};

export const initOneSignal = async (externalId: string, email: string) => {
  if (!config.oneSignalAppId) return;
  await loadOneSignal();
  const OneSignal = window.OneSignal || [];
  OneSignal.push(() => {
    OneSignal.init({
      appId: config.oneSignalAppId,
      allowLocalhostAsSecureOrigin: true
    });
    OneSignal.setExternalUserId(externalId);
    OneSignal.setEmail(email);
  });
};

export const promptOneSignal = async () => {
  if (!config.oneSignalAppId) return;
  const OneSignal = window.OneSignal || [];
  OneSignal.push(() => {
    OneSignal.Slidedown.promptPush();
  });
};
