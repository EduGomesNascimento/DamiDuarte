import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getSession, setSession } from "../lib/session";

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
    </section>
  );
};

export default Profile;
