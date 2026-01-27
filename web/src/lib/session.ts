export type Role = "CLIENT" | "OWNER";

export type Session = {
  token: string;
  exp?: number;
  user: {
    userId: string;
    email: string;
    name: string;
    nicknamePublic?: string;
    role: Role;
  };
};

const KEY = "dami.session";

const parseJwt = (token: string): { exp?: number } => {
  try {
    const payload = token.split(".")[1];
    const base = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

export const getSession = (): Session | null => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (session.exp && Date.now() > session.exp) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const setSession = (session: Session) => {
  const payload = parseJwt(session.token);
  const exp = payload.exp ? payload.exp * 1000 : undefined;
  localStorage.setItem(KEY, JSON.stringify({ ...session, exp }));
};

export const clearSession = () => {
  localStorage.removeItem(KEY);
};
