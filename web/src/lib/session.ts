export type Role = "CLIENT" | "OWNER";

export type Session = {
  token: string;
  user: {
    userId: string;
    email: string;
    name: string;
    nicknamePublic?: string;
    role: Role;
  };
};

const KEY = "dami.session";

export const getSession = (): Session | null => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
};

export const setSession = (session: Session) => {
  localStorage.setItem(KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(KEY);
};
