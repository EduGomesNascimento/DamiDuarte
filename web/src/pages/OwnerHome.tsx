import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/format";

const OwnerHome = () => {
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(0);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [push, setPush] = useState({
    target: "all",
    userId: "",
    email: "",
    title: "",
    message: ""
  });
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [weekData, monthData, upcomingData] = await Promise.all([
        apiFetch<{ total: number }>("/owner/stats/week"),
        apiFetch<{ total: number }>("/owner/stats/month"),
        apiFetch<any[]>("/owner/agenda?upcoming=1")
      ]);
      setWeek(weekData.total || 0);
      setMonth(monthData.total || 0);
      setUpcoming(upcomingData);
    };
    load().catch(() => null);
  }, []);

  const handlePush = async () => {
    setPushStatus(null);
    try {
      await apiFetch("/owner/push", {
        method: "POST",
        body: JSON.stringify(push)
      });
      setPushStatus("Push enviado!");
    } catch (err) {
      setPushStatus(err instanceof Error ? err.message : "Erro ao enviar push");
    }
  };

  return (
    <section className="grid">
      <div className="grid grid-2">
        <div className="card">
          <h3>Total semana</h3>
          <div className="kpi">{formatCurrency(week)}</div>
        </div>
        <div className="card">
          <h3>Total mes</h3>
          <div className="kpi">{formatCurrency(month)}</div>
        </div>
      </div>
      <div className="card">
        <h3>Proximos horarios</h3>
        <div className="list">
          {upcoming.length === 0 && (
            <div className="card soft">
              <strong>Nenhum horario futuro</strong>
              <p>Crie um agendamento para começar a preencher a agenda.</p>
            </div>
          )}
          {upcoming.map((item) => (
            <div key={item.appointmentId} className="card">
              <strong>{new Date(item.startAt).toLocaleString("pt-BR")}</strong>
              <div>{item.clientName || item.userId}</div>
              <div>{formatCurrency(item.value)}</div>
              <div>Status: {item.status}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Enviar push</h3>
        <div className="grid grid-2">
          <label>
            Envio
            <select value={push.target} onChange={(e) => setPush({ ...push, target: e.target.value })}>
              <option value="all">Todas</option>
              <option value="user">Uma cliente</option>
            </select>
          </label>
          {push.target === "user" && (
            <label>
              userId ou email
              <input
                placeholder="userId ou email"
                value={push.userId || push.email}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes("@")) {
                    setPush({ ...push, userId: "", email: value });
                  } else {
                    setPush({ ...push, userId: value, email: "" });
                  }
                }}
              />
            </label>
          )}
          <label>
            Titulo
            <input value={push.title} onChange={(e) => setPush({ ...push, title: e.target.value })} />
          </label>
          <label>
            Mensagem
            <input value={push.message} onChange={(e) => setPush({ ...push, message: e.target.value })} />
          </label>
        </div>
        <button onClick={handlePush}>Enviar</button>
        {pushStatus && <p>{pushStatus}</p>}
      </div>
    </section>
  );
};

export default OwnerHome;
