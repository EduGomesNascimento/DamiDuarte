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
  try {
    await loadOneSignal();
    const OneSignal: any = window.OneSignal || [];
    OneSignal.push(() => {
      try {
        OneSignal.init({
          appId: config.oneSignalAppId,
          allowLocalhostAsSecureOrigin: true
        });
        if (OneSignal.setExternalUserId) {
          OneSignal.setExternalUserId(externalId);
        } else if (OneSignal.User && OneSignal.User.addAlias) {
          OneSignal.User.addAlias("external_id", externalId);
        }
        if (OneSignal.setEmail) {
          OneSignal.setEmail(email);
        } else if (OneSignal.User && OneSignal.User.addEmail) {
          OneSignal.User.addEmail(email);
        }
      } catch {
        // best-effort only; do not block login
      }
    });
  } catch {
    // ignore OneSignal errors
  }
};

export const promptOneSignal = async () => {
  if (!config.oneSignalAppId) return;
  try {
    const OneSignal: any = window.OneSignal || [];
    OneSignal.push(() => {
      if (OneSignal.Slidedown && OneSignal.Slidedown.promptPush) {
        OneSignal.Slidedown.promptPush();
      }
    });
  } catch {
    // ignore
  }
};
