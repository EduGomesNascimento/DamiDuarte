import { config } from "./config";
import { clearSession, getSession } from "./session";

const appendTokenToUrl = (url: string, token?: string) => {
  if (!token) return url;
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}token=${encodeURIComponent(token)}`;
};

const withTokenInBody = (body: BodyInit | null | undefined, token?: string) => {
  if (!token || !body || typeof body !== "string") return body;
  try {
    const data = JSON.parse(body);
    return JSON.stringify({ ...data, token });
  } catch {
    return body;
  }
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  attempt = 0
): Promise<T> => {
  const session = getSession();
  const headers = new Headers(options.headers || {});

  let url = `${config.apiBase}${path}`;
  let method = options.method || "GET";
  let body = options.body;

  if (method === "GET") {
    url = appendTokenToUrl(url, session?.token);
  } else {
    body = withTokenInBody(body, session?.token);
  }

  if (method === "PUT" || method === "DELETE") {
    headers.set("X-HTTP-Method-Override", method);
    const joiner = url.includes("?") ? "&" : "?";
    url = `${url}${joiner}__method=${method}`;
    method = "POST";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      method,
      headers,
      body
    });
  } catch {
    if (attempt < 1) {
      return apiFetch(path, options, attempt + 1);
    }
    throw new Error("API indisponivel. Confirme VITE_API_BASE e o deploy do Apps Script.");
  }

  if (response.status === 401) {
    clearSession();
    if (typeof window !== "undefined") {
      const base = (import.meta as any).env?.BASE_URL || "/";
      window.location.href = `${base}login`;
    }
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro na API");
  }
  return (await response.json()) as T;
};
