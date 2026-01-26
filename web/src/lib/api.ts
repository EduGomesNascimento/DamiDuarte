import { config } from "./config";
import { getSession } from "./session";

const appendTokenToUrl = (url: string, token?: string) => {
  if (!token) return url;
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}token=${encodeURIComponent(token)}`;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const session = getSession();
  const headers = new Headers(options.headers || {});

  let url = `${config.apiBase}${path}`;
  let method = options.method || "GET";
  let body = options.body;

  if (method === "GET") {
    url = appendTokenToUrl(url, session?.token);
  } else if (session?.token && body && typeof body === "string") {
    try {
      const data = JSON.parse(body);
      body = JSON.stringify({ ...data, token: session.token });
    } catch {
      // ignore parse errors
    }
  }

  if (method === "PUT" || method === "DELETE") {
    headers.set("X-HTTP-Method-Override", method);
    const joiner = url.includes("?") ? "&" : "?";
    url = `${url}${joiner}__method=${method}`;
    method = "POST";
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro na API");
  }
  return (await response.json()) as T;
};
