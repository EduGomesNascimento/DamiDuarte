import { NavLink, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../lib/session";

const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const session = getSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <main className="app-shell">
      <header className="shell-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icone2.png`} alt="Dami Duarte" />
          <div>
            <div className="badge">Cliente</div>
            <h1>Ola, {session?.user.nicknamePublic || session?.user.name}</h1>
          </div>
        </div>
        <button className="secondary" onClick={handleLogout}>
          Sair
        </button>
      </header>
      <nav className="nav">
        <NavLink to="/home" className={linkClass}>
          Agenda
        </NavLink>
        <NavLink to="/novidades" className={linkClass}>
          Novidades
        </NavLink>
        <NavLink to="/catalogo" className={linkClass}>
          Catalogo
        </NavLink>
        <NavLink to="/perfil" className={linkClass}>
          Perfil
        </NavLink>
        <NavLink to="/sobre" className={linkClass}>
          Sobre
        </NavLink>
      </nav>
      {children}
    </main>
  );
};
