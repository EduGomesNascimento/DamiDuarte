import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { config } from "../lib/config";
import { loadGoogleIdentity } from "../lib/google";
import { initOneSignal, promptOneSignal } from "../lib/onesignal";
import { setSession } from "../lib/session";

const Login = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const onCredential = useMemo(() => {
    return async (credential: string) => {
      try {
        setError(null);
        const session = await apiFetch<{
          token: string;
          user: {
            userId: string;
            email: string;
            name: string;
            nicknamePublic?: string;
            role: "CLIENT" | "OWNER";
          };
        }>("/auth/me", {
          method: "POST",
          body: JSON.stringify({ idToken: credential })
        });
        setSession(session);
        await initOneSignal(session.user.userId, session.user.email);
        await promptOneSignal();
        navigate(session.user.role === "OWNER" ? "/owner/home" : "/home");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao autenticar");
      }
    };
  }, [navigate]);

  useEffect(() => {
    const mount = async () => {
      try {
        await loadGoogleIdentity();
        const google = (window as any).google;
        if (!google || !config.googleClientId) {
          setError("Configure VITE_GOOGLE_CLIENT_ID para ativar o login.");
          setLoading(false);
          return;
        }
        google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (response: any) => onCredential(response.credential)
        });
        if (buttonRef.current) {
          google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: 320
          });
        }
      } catch (err) {
        setError("Erro ao carregar login Google.");
      } finally {
        setLoading(false);
      }
    };
    mount();
  }, [onCredential]);

  return (
    <main className="app-shell">
      <section className="login-layout">
        <div className="card login-hero soft">
          <div className="login-logo">
            <img src={`${import.meta.env.BASE_URL}icone2.png`} alt="Dami Duarte" />
            <div>
              <strong>Dami Duarte</strong>
              <div className="muted">Beleza &amp; cuidados pessoais</div>
            </div>
          </div>
          <h1>Agenda e novidades em um so lugar</h1>
          <p>Entre com Google para ver seus horarios, historico e novidades.</p>
          <div className="login-actions">
            <div ref={buttonRef} />
            {loading && <p>Carregando login...</p>}
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
        <div className="card login-panel">
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
