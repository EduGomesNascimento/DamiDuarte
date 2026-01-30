import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import News from "./pages/News";
import Catalog from "./pages/Catalog";
import Profile from "./pages/Profile";
import About from "./pages/About";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerHome from "./pages/OwnerHome";
import OwnerAgenda from "./pages/OwnerAgenda";
import OwnerClients from "./pages/OwnerClients";
import OwnerNews from "./pages/OwnerNews";
import OwnerProducts from "./pages/OwnerProducts";
import OwnerHistory from "./pages/OwnerHistory";
import { getSession, type Session } from "./lib/session";
import { subscribeToAuth } from "./lib/firebase";
import { AppShell } from "./components/AppShell";
import { OwnerShell } from "./components/OwnerShell";

const App = () => {
  const [session, setSession] = useState<Session | null>(() => getSession());

  useEffect(() => {
    const unsub = subscribeToAuth((next) => {
      setSession(next);
    });
    return () => unsub();
  }, []);

  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/owner/login" element={<OwnerLogin />} />

        <Route
          path="/home"
          element={
            <RequireRole role="CLIENT" sessionRole={session?.role}>
              <AppShell>
                <Home />
              </AppShell>
            </RequireRole>
          }
        />
        <Route
          path="/novidades"
          element={
            <RequireRole role="CLIENT" sessionRole={session?.role}>
              <AppShell>
                <News />
              </AppShell>
            </RequireRole>
          }
        />
        <Route
          path="/catalogo"
          element={
            <RequireRole role="CLIENT" sessionRole={session?.role}>
              <AppShell>
                <Catalog />
              </AppShell>
            </RequireRole>
          }
        />
        <Route
          path="/perfil"
          element={
            <RequireRole role="CLIENT" sessionRole={session?.role}>
              <AppShell>
                <Profile />
              </AppShell>
            </RequireRole>
          }
        />
        <Route
          path="/sobre"
          element={
            <RequireRole role="CLIENT" sessionRole={session?.role}>
              <AppShell>
                <About />
              </AppShell>
            </RequireRole>
          }
        />

        <Route
          path="/owner/home"
          element={
            <RequireRole role="OWNER" sessionRole={session?.role}>
              <OwnerShell>
                <OwnerHome />
              </OwnerShell>
            </RequireRole>
          }
        />
        <Route
          path="/owner/agenda"
          element={
            <RequireRole role="OWNER" sessionRole={session?.role}>
              <OwnerShell>
                <OwnerAgenda />
              </OwnerShell>
            </RequireRole>
          }
        />
        <Route
          path="/owner/clientes"
          element={
            <RequireRole role="OWNER" sessionRole={session?.role}>
              <OwnerShell>
                <OwnerClients />
              </OwnerShell>
            </RequireRole>
          }
        />
        <Route
          path="/owner/novidades"
          element={
            <RequireRole role="OWNER" sessionRole={session?.role}>
              <OwnerShell>
                <OwnerNews />
              </OwnerShell>
            </RequireRole>
          }
        />
        <Route
          path="/owner/produtos"
          element={
            <RequireRole role="OWNER" sessionRole={session?.role}>
              <OwnerShell>
                <OwnerProducts />
              </OwnerShell>
            </RequireRole>
          }
        />
        <Route
          path="/owner/historico"
          element={
            <RequireRole role="OWNER" sessionRole={session?.role}>
              <OwnerShell>
                <OwnerHistory />
              </OwnerShell>
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const RequireRole = ({
  role,
  sessionRole,
  children
}: {
  role: "CLIENT" | "OWNER";
  sessionRole?: "CLIENT" | "OWNER";
  children: React.ReactNode;
}) => {
  if (!sessionRole) {
    return <Navigate to={role === "OWNER" ? "/owner/login" : "/login"} replace />;
  }
  if (sessionRole !== role) {
    return <Navigate to={sessionRole === "OWNER" ? "/owner/home" : "/home"} replace />;
  }
  return <>{children}</>;
};

export default App;
