import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { config } from "../lib/config";
import { formatCurrency } from "../lib/format";

const Home = () => {
  const [agenda, setAgenda] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [agendaData, historyData] = await Promise.all([
          apiFetch<any[]>("/me/agenda"),
          apiFetch<any[]>("/me/history?days=30")
        ]);
        setAgenda(agendaData);
        setHistory(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar");
      }
    };
    load();
  }, []);

  const total30 = useMemo(() => {
    return history.reduce((sum, item) => sum + Number(item.value || 0), 0);
  }, [history]);

  return (
    <section className="grid">
      <div className="card hero">
        <h2>Proximos horarios</h2>
        <div className="list">
          {agenda.length === 0 && <p>Sem horarios agendados.</p>}
          {agenda.map((item) => (
            <div key={item.appointmentId} className="card">
              <strong>{new Date(item.startAt).toLocaleString("pt-BR")}</strong>
              <div>Status: {item.status}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3>Historico 30 dias</h3>
          <div className="list">
            {history.length === 0 && <p>Sem historico.</p>}
            {history.map((item) => (
              <div key={item.appointmentId}>
                {new Date(item.startAt).toLocaleDateString("pt-BR")} - {formatCurrency(item.value)}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Total 30 dias</h3>
          <div className="kpi">{formatCurrency(total30)}</div>
        </div>
      </div>
      <div className="card">
        <a href={config.whatsappLink} target="_blank" rel="noreferrer">
          <button>Falar no WhatsApp</button>
        </a>
      </div>
      {error && <p>{error}</p>}
    </section>
  );
};

export default Home;
