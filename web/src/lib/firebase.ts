import { initializeApp, getApps } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { config } from "./config";
import { clearSession, setSession, type Session } from "./session";

const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId: config.firebaseProjectId,
  storageBucket: config.firebaseStorageBucket,
  messagingSenderId: config.firebaseMessagingSenderId,
  appId: config.firebaseAppId
};

const initApp = () => {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error("Configure as variaveis VITE_FIREBASE_* para habilitar o login.");
  }
  if (getApps().length) return getApps()[0];
  return initializeApp(firebaseConfig);
};

export const getFirebaseAuth = () => getAuth(initApp());
export const getFirestoreDb = () => getFirestore(initApp());

export const getRoleForEmail = (email?: string | null) =>
  email && email.toLowerCase() === config.ownerEmail.toLowerCase() ? "OWNER" : "CLIENT";

export const ensureUserDoc = async (user: User) => {
  const db = getFirestoreDb();
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  const role = getRoleForEmail(user.email);
  const base = {
    userId: user.uid,
    role,
    email: user.email || "",
    name: user.displayName || user.email || "",
    nicknamePublic: user.displayName || user.email?.split("@")[0] || "",
    nicknamePrivate: "",
    phoneE164: "",
    birthDate: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  };
  if (!snapshot.exists()) {
    await setDoc(userRef, base);
    return base;
  }
  const existing = snapshot.data();
  const merged = {
    ...base,
    ...existing,
    role,
    email: user.email || existing.email || "",
    name: user.displayName || existing.name || ""
  };
  await setDoc(userRef, merged);
  return merged;
};

export const buildSessionFromUser = async (user: User): Promise<Session> => {
  const token = await user.getIdToken();
  const userDoc = await ensureUserDoc(user);
  return {
    token,
    user: {
      userId: userDoc.userId,
      email: userDoc.email,
      name: userDoc.name,
      nicknamePublic: userDoc.nicknamePublic,
      role: userDoc.role
    }
  };
};

export const signInWithGoogle = async (): Promise<Session> => {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const session = await buildSessionFromUser(result.user);
  setSession(session);
  return session;
};

export const signOutUser = async () => {
  const auth = getFirebaseAuth();
  await signOut(auth);
  clearSession();
};

export const subscribeToAuth = (onChange: (session: Session | null) => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const session = await buildSessionFromUser(user);
      setSession(session);
      onChange(session);
      return;
    }
    clearSession();
    onChange(null);
  });
};

export const getCurrentUser = (): Promise<User | null> => {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
    setTimeout(() => {
      unsub();
      resolve(null);
    }, 5000);
  });
};
