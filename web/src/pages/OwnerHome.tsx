import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/format";

const OwnerHome = () => {
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(0);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);
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
      const [weekData, monthData, upcomingData, birthdayData] = await Promise.all([
        apiFetch<{ total: number }>("/owner/stats/week"),
        apiFetch<{ total: number }>("/owner/stats/month"),
        apiFetch<any[]>("/owner/appointments?upcoming=1"),
        apiFetch<any[]>("/owner/reminders?days=30")
      ]);
      setWeek(weekData.total || 0);
      setMonth(monthData.total || 0);
      setUpcoming(upcomingData);
      setBirthdays(birthdayData);
    };
    load().catch(() => null);
  }, []);

  const applyTemplate = (title: string, message: string) => {
    setPush({ ...push, title, message });
  };

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
              <p>Crie um agendamento para comecar a preencher a agenda.</p>
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
        <h3>Lembretes de aniversario</h3>
        <div className="list">
          {birthdays.length === 0 && (
            <div className="card soft">
              <strong>Nenhum aniversario proximo</strong>
              <p>Os aniversarios dos proximos 30 dias aparecem aqui.</p>
            </div>
          )}
          {birthdays.map((item) => (
            <div key={item.userId} className="card">
              <strong>{item.name || item.email}</strong>
              <div>Data: {item.nextDate}</div>
              <div>Em {item.daysUntil} dias</div>
              <button
                className="secondary"
                onClick={() =>
                  applyTemplate(
                    "Feliz aniversario!",
                    `Oi ${item.name || ""}! Feliz aniversario! Gostaria de marcar um horario especial?`
                  )
                }
              >
                Preparar mensagem
              </button>
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
        <div className="list">
          <button className="secondary" onClick={() => applyTemplate("Hora de renovar o corte", "Oi! Seu prazo para renovar o corte esta chegando. Quer agendar?")}>Use lembrete de corte</button>
          <button className="secondary" onClick={() => applyTemplate("Manutencao do cabelo", "Oi! Que tal manter seu cabelo em dia? Posso sugerir um horario.")}>Use lembrete de manutencao</button>
        </div>
        <button onClick={handlePush}>Enviar</button>
        {pushStatus && <p>{pushStatus}</p>}
      </div>
    </section>
  );
};

export default OwnerHome;
