import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../lib/session";

const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");

export const OwnerShell = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/owner/login");
  };

  return (
    <main className="app-shell">
      <header className="shell-header">
        <div className="brand">
          <img src="/icone2.png" alt="Dami Duarte" />
          <div>
            <div className="badge">Owner</div>
            <h1>Painel Dami</h1>
          </div>
        </div>
        <button className="secondary" onClick={handleLogout}>
          Sair
        </button>
      </header>
      <nav className="nav">
        <NavLink to="/owner/home" className={linkClass}>
          KPIs
        </NavLink>
        <NavLink to="/owner/agenda" className={linkClass}>
          Agenda
        </NavLink>
        <NavLink to="/owner/clientes" className={linkClass}>
          Clientes
        </NavLink>
        <NavLink to="/owner/novidades" className={linkClass}>
          Novidades
        </NavLink>
        <NavLink to="/owner/produtos" className={linkClass}>
          Produtos
        </NavLink>
      </nav>
      {children}
    </main>
  );
};
