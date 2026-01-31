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
      try {
        await initOneSignal(session.user.userId, session.user.email);
        await promptOneSignal();
      } catch {
        // OneSignal is optional
      }
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
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Dami Duarte" />
            <div>
              <strong>Dami Duarte</strong>
              <div className="muted">Area da cliente</div>
            </div>
          </div>
          <h1>Sua beleza, em um lugar leve.</h1>
          <p>Entre com Google para acompanhar seus horarios.</p>
          <div className="login-actions">
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Entrando..." : "Fazer login com Google"}
            </button>
            {error && <p className="error-text">{error}</p>}
          </div>
          <ul className="login-topics">
            <li>
              <span className="badge">Agenda</span>
              <strong>Horarios sempre a mao</strong>
              <p>Rapidinho, sem complicacao.</p>
            </li>
            <li>
              <span className="badge">Historico</span>
              <strong>Seu historico</strong>
              <p>Um resumo do que voce fez.</p>
            </li>
            <li>
              <span className="badge">Novidades</span>
              <strong>Novidades da Dami</strong>
              <p>Recadinhos e novidades do studio.</p>
            </li>
          </ul>
        </div>
        <div className="login-panel">
          <span className="badge">Push no iPhone</span>
          <h2>Ative as notificacoes</h2>
          <p>
            No iPhone, abra no Safari e toque em Compartilhar &gt; Adicionar a Tela de Inicio.
          </p>
          <div className="divider" />
          <div>
            <strong>WhatsApp direto</strong>
            <p>Fale com a Dami quando quiser.</p>
          </div>
          <div className="login-note">
            <strong>Atendimento carinhoso</strong>
            <p>Beleza e cuidado em cada detalhe.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
