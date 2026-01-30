import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { getCurrentUser, getFirestoreDb, getRoleForEmail } from "./firebase";
import { clearSession, getSession } from "./session";

const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    clearSession();
    if (typeof window !== "undefined") {
      const base = (import.meta as any).env?.BASE_URL || "/";
      window.location.href = `${base}login`;
    }
    throw new Error("Sessao expirada. Faca login novamente.");
  }
  return user;
};

const parseQuery = (path: string) => {
  const [base, queryString] = path.split("?");
  const params = new URLSearchParams(queryString || "");
  return { base, params };
};

const nowIso = () => new Date().toISOString();
const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as Crypto).randomUUID()
    : Math.random().toString(36).slice(2, 10);

const readAll = async (colName: string) => {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, colName));
  return snapshot.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }));
};

const readDoc = async (colName: string, id: string) => {
  const db = getFirestoreDb();
  const ref = doc(db, colName, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Registro nao encontrado");
  return { ...snap.data(), id: snap.id };
};

const upsertDoc = async (colName: string, id: string, data: Record<string, any>) => {
  const db = getFirestoreDb();
  const ref = doc(db, colName, id);
  await setDoc(ref, data, { merge: true });
  return { ...data, id };
};

const deleteDocById = async (colName: string, id: string) => {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, colName, id));
  return { ok: true };
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body && typeof options.body === "string" ? JSON.parse(options.body) : {};
  const { base, params } = parseQuery(path);

  if (base === "/announcements" && method === "GET") {
    const items = await readAll("announcements");
    const now = new Date();
    const published = params.get("published") === "1" || params.get("active") === "1";
    const filtered = items.filter((item) => {
      if (!published) return true;
      if (!item.isPublished) return false;
      if (item.publishAt && new Date(item.publishAt) > now) return false;
      if (item.expireAt && new Date(item.expireAt) < now) return false;
      return true;
    });
    return filtered as T;
  }

  if (base === "/products" && method === "GET") {
    const items = await readAll("products");
    const onlyActive = params.get("active") === "1";
    return items.filter((item) => (onlyActive ? item.isActive : true)) as T;
  }

  if (base === "/auth/me" && method === "POST") {
    const session = getSession();
    if (!session) throw new Error("Sessao ausente.");
    return session as T;
  }

  if (base === "/me" && method === "GET") {
    const user = await requireAuth();
    return (await readDoc("users", user.uid)) as T;
  }

  if (base === "/me" && method === "PUT") {
    const user = await requireAuth();
    const update = {
      nicknamePublic: body.nicknamePublic || "",
      birthDate: body.birthDate || "",
      updatedAt: nowIso()
    };
    await upsertDoc("users", user.uid, update);
    return (await readDoc("users", user.uid)) as T;
  }

  if ((base === "/appointments" || base === "/me/appointments") && method === "GET") {
    const user = await requireAuth();
    const items = await readAll("appointments");
    const upcoming = params.get("upcoming") === "1";
    const now = new Date();
    const filtered = items
      .filter((item) => item.userId === user.uid)
      .filter((item) => (upcoming ? new Date(item.startAt) >= now : true))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return filtered as T;
  }

  if (base === "/history" && method === "GET") {
    const user = await requireAuth();
    const days = Number(params.get("days") || 30);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const items = (await readAll("appointments"))
      .filter((item) => item.userId === user.uid)
      .filter((item) => new Date(item.startAt) >= cutoff);
    const total = items
      .filter((item) => item.status === "DONE")
      .reduce((sum, item) => sum + Number(item.value || 0), 0);
    return { items, total } as T;
  }

  if (base.startsWith("/owner/")) {
    const user = await requireAuth();
    const role = getRoleForEmail(user.email);
    if (role !== "OWNER") throw new Error("Nao autorizado");
    const rest = base.replace("/owner/", "");

    if (rest === "users" && method === "GET") {
      return (await readAll("users")) as T;
    }
    if (rest === "users" && method === "POST") {
      const id = body.userId || makeId();
      const data = {
        userId: id,
        role: body.role || "CLIENT",
        email: body.email || "",
        name: body.name || "",
        nicknamePublic: body.nicknamePublic || "",
        nicknamePrivate: body.nicknamePrivate || "",
        phoneE164: body.phoneE164 || "",
        birthDate: body.birthDate || "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        active: body.active !== false
      };
      await upsertDoc("users", id, data);
      return data as T;
    }
    if (rest.startsWith("users/") && (method === "PUT" || method === "DELETE")) {
      const id = rest.split("/")[1];
      if (method === "DELETE") {
        await upsertDoc("users", id, { active: false, updatedAt: nowIso() });
        return { ok: true } as T;
      }
      await upsertDoc("users", id, { ...body, updatedAt: nowIso() });
      return (await readDoc("users", id)) as T;
    }

    if (rest === "appointments" && method === "GET") {
      const items = await readAll("appointments");
      const upcoming = params.get("upcoming") === "1";
      const now = new Date();
      let filtered = items;
      const userId = params.get("userId");
      const status = params.get("status");
      const dateFrom = params.get("dateFrom");
      const dateTo = params.get("dateTo");
      if (userId) filtered = filtered.filter((item) => item.userId === userId);
      if (status) {
        const list = status.split(",").map((s) => s.trim());
        filtered = filtered.filter((item) => list.includes(item.status));
      }
      if (dateFrom) filtered = filtered.filter((item) => new Date(item.startAt) >= new Date(dateFrom));
      if (dateTo) filtered = filtered.filter((item) => new Date(item.startAt) <= new Date(dateTo));
      if (upcoming) filtered = filtered.filter((item) => new Date(item.startAt) >= now);
      return filtered as T;
    }
    if (rest === "appointments" && method === "POST") {
      const id = body.appointmentId || makeId();
      const data = {
        appointmentId: id,
        userId: body.userId || "",
        startAt: body.startAt || "",
        endAt: body.endAt || "",
        status: body.status || "SCHEDULED",
        value: body.value || 0,
        notesPrivate: body.notesPrivate || "",
        notesPublic: body.notesPublic || "",
        updatedAt: nowIso(),
        createdBy: user.email || ""
      };
      await upsertDoc("appointments", id, data);
      return data as T;
    }
    if (rest.startsWith("appointments/") && (method === "PUT" || method === "DELETE")) {
      const id = rest.split("/")[1];
      if (method === "DELETE") {
        return (await deleteDocById("appointments", id)) as T;
      }
      await upsertDoc("appointments", id, { ...body, updatedAt: nowIso() });
      return (await readDoc("appointments", id)) as T;
    }

    if (rest === "announcements" && method === "GET") {
      return (await readAll("announcements")) as T;
    }
    if (rest === "announcements" && method === "POST") {
      const id = body.announcementId || makeId();
      const data = {
        announcementId: id,
        title: body.title || "",
        content: body.content || "",
        isPublished: body.isPublished === true,
        publishAt: body.publishAt || "",
        expireAt: body.expireAt || "",
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      await upsertDoc("announcements", id, data);
      return data as T;
    }
    if (rest.startsWith("announcements/") && (method === "PUT" || method === "DELETE")) {
      const id = rest.split("/")[1];
      if (method === "DELETE") {
        return (await deleteDocById("announcements", id)) as T;
      }
      await upsertDoc("announcements", id, { ...body, updatedAt: nowIso() });
      return (await readDoc("announcements", id)) as T;
    }

    if (rest === "products" && method === "GET") {
      return (await readAll("products")) as T;
    }
    if (rest === "products" && method === "POST") {
      const id = body.productId || makeId();
      const data = {
        productId: id,
        name: body.name || "",
        price: body.price || 0,
        description: body.description || "",
        photoUrl: body.photoUrl || "",
        isActive: body.isActive !== false,
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      await upsertDoc("products", id, data);
      return data as T;
    }
    if (rest.startsWith("products/") && (method === "PUT" || method === "DELETE")) {
      const id = rest.split("/")[1];
      if (method === "DELETE") {
        return (await deleteDocById("products", id)) as T;
      }
      await upsertDoc("products", id, { ...body, updatedAt: nowIso() });
      return (await readDoc("products", id)) as T;
    }

    if (rest === "history" && method === "GET") {
      const days = Number(params.get("days") || 30);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const items = (await readAll("appointments")).filter(
        (item) => new Date(item.startAt) >= cutoff
      );
      const total = items
        .filter((item) => item.status === "DONE")
        .reduce((sum, item) => sum + Number(item.value || 0), 0);
      const byClient: Record<string, number> = {};
      items.forEach((item) => {
        const key = item.userId || "unknown";
        byClient[key] = (byClient[key] || 0) + Number(item.value || 0);
      });
      return { items, total, byClient } as T;
    }

    if (rest === "stats/week" && method === "GET") {
      const now = new Date();
      const start = new Date();
      start.setDate(now.getDate() - 7);
      const items = (await readAll("appointments")).filter(
        (item) => new Date(item.startAt) >= start && new Date(item.startAt) <= now
      );
      const total = items
        .filter((item) => item.status === "DONE")
        .reduce((sum, item) => sum + Number(item.value || 0), 0);
      return { total } as T;
    }

    if (rest === "stats/month" && method === "GET") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const items = (await readAll("appointments")).filter(
        (item) => new Date(item.startAt) >= start && new Date(item.startAt) <= now
      );
      const total = items
        .filter((item) => item.status === "DONE")
        .reduce((sum, item) => sum + Number(item.value || 0), 0);
      return { total } as T;
    }

    if (rest === "reminders" && method === "GET") {
      const days = Number(params.get("days") || 30);
      const users = await readAll("users");
      const now = new Date();
      const results = users
        .filter((u) => u.birthDate)
        .map((u) => {
          const birth = new Date(u.birthDate);
          const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
          if (next < now) next.setFullYear(next.getFullYear() + 1);
          const diffDays = Math.ceil((next.getTime() - now.getTime()) / 86400000);
          return {
            userId: u.userId,
            name: u.nicknamePublic || u.name || u.email,
            email: u.email,
            nextDate: next.toISOString().slice(0, 10),
            daysUntil: diffDays
          };
        })
        .filter((item) => item.daysUntil >= 0 && item.daysUntil <= days)
        .sort((a, b) => a.daysUntil - b.daysUntil);
      return results as T;
    }

    if (rest === "push" && method === "POST") {
      return { ok: false, message: "Push via OneSignal precisa de backend seguro." } as T;
    }
  }

  throw new Error("Rota nao encontrada");
};
