const GIS_SRC = "https://accounts.google.com/gsi/client";

export const loadGoogleIdentity = async (): Promise<void> => {
  if (document.querySelector(`script[src="${GIS_SRC}"]`)) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar Google"));
    document.head.appendChild(script);
  });
};
