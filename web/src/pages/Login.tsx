import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../lib/firebase";
import { initOneSignal, promptOneSignal } from "../lib/onesignal";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      const session = await signInWithGoogle();
      await initOneSignal(session.user.userId, session.user.email);
      await promptOneSignal();
      navigate(session.user.role === "OWNER" ? "/owner/home" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="login-layout">
        <div className="login-hero">
          <div className="login-logo">
            <img src={`${import.meta.env.BASE_URL}icone2.png`} alt="Dami Duarte" />
            <div>
              <strong>Dami Duarte</strong>
              <div className="muted">Area da cliente</div>
            </div>
          </div>
          <h1>Agenda e novidades em um so lugar</h1>
          <p>Entre com Google para ver seus horarios, historico e novidades.</p>
          <div className="login-actions">
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Entrando..." : "Fazer login com Google"}
            </button>
            {error && <p className="error-text">{error}</p>}
          </div>
          <ul className="login-topics">
            <li>
              <span className="badge">Agenda</span>
              <strong>Horarios organizados</strong>
              <p>Seus atendimentos e ajustes em tempo real.</p>
            </li>
            <li>
              <span className="badge">Historico</span>
              <strong>Ultimos 30 dias</strong>
              <p>Valores e registros para facilitar seu controle.</p>
            </li>
            <li>
              <span className="badge">Novidades</span>
              <strong>Anuncios e catalogo</strong>
              <p>Novos produtos e recados importantes.</p>
            </li>
          </ul>
        </div>
        <div className="login-panel">
          <span className="badge">Push no iPhone</span>
          <h2>Ative as notificacoes</h2>
          <p>
            Para receber notificacoes no iOS, abra no Safari e toque em Compartilhar &gt; Adicionar a Tela de Inicio.
          </p>
          <div className="divider" />
          <div>
            <strong>WhatsApp direto</strong>
            <p>Agende horarios e confirme atendimentos por WhatsApp.</p>
          </div>
          <div className="login-note">
            <strong>Atendimento personalizado</strong>
            <p>Beleza, cosmeticos e cuidados pessoais com a Dami.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
