import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getSession, setSession } from "../lib/session";
import { promptOneSignal } from "../lib/onesignal";

const Profile = () => {
  const session = getSession();
  const [nicknamePublic, setNicknamePublic] = useState(session?.user.nicknamePublic || "");
  const [birthDate, setBirthDate] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any>("/me")
      .then((data) => {
        setNicknamePublic(data.user.nicknamePublic || "");
        setBirthDate(data.user.birthDate || "");
      })
      .catch(() => null);
  }, []);

  const handleSave = async () => {
    setStatus(null);
    const updated = await apiFetch<any>("/me", {
      method: "PUT",
      body: JSON.stringify({ nicknamePublic, birthDate })
    });
    if (session) {
      setSession({ ...session, user: { ...session.user, nicknamePublic: updated.nicknamePublic } });
    }
    setStatus("Atualizado!");
  };

  const handlePush = async () => {
    await promptOneSignal();
  };

  return (
    <section className="grid">
      <div className="card">
        <h2>Perfil</h2>
        <label>
          Apelido
          <input value={nicknamePublic} onChange={(e) => setNicknamePublic(e.target.value)} />
        </label>
        <label>
          Birth date
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>
        <label>
          Email
          <input value={session?.user.email || ""} readOnly />
        </label>
        <button onClick={handleSave}>Salvar</button>
        {status && <p>{status}</p>}
      </div>
      <div className="card">
        <h3>Notificacoes</h3>
        <p>Ative para receber avisos de horarios e novidades.</p>
        <button onClick={handlePush}>Ativar notificacoes</button>
        <p style={{ color: "var(--muted)" }}>
          No iOS, use o Safari e toque em Compartilhar &gt; Adicionar a Tela de Inicio.
        </p>
      </div>
    </section>
  );
};

export default Profile;
