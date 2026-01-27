import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { config } from "../lib/config";
import { formatCurrency } from "../lib/format";
import { Link } from "react-router-dom";

const Home = () => {
  const [agenda, setAgenda] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [total30, setTotal30] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [agendaData, historyData, newsData] = await Promise.all([
          apiFetch<any[]>("/appointments?upcoming=1"),
          apiFetch<{ items: any[]; total: number }>("/history?days=30"),
          apiFetch<any[]>("/announcements?published=1")
        ]);
        setAgenda(agendaData);
        setHistory(historyData.items || []);
        setTotal30(historyData.total || 0);
        setAnnouncements(newsData.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar");
      }
    };
    load();
  }, []);

  const totalHistory = useMemo(() => {
    if (total30) return total30;
    return history.reduce((sum, item) => sum + Number(item.value || 0), 0);
  }, [history, total30]);

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
              {item.notesPublic && <p>{item.notesPublic}</p>}
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
          <div className="kpi">{formatCurrency(totalHistory)}</div>
          <p style={{ color: "var(--muted)" }}>Soma dos atendimentos concluidos.</p>
        </div>
      </div>
      <div className="card">
        <h3>Novidades</h3>
        <div className="list">
          {announcements.length === 0 && <p>Nenhum anuncio publicado.</p>}
          {announcements.map((item) => (
            <div key={item.announcementId}>
              <strong>{item.title}</strong>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
        <Link to="/novidades">Ver todas</Link>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <a href={config.whatsappLink} target="_blank" rel="noreferrer">
            <button>Falar no WhatsApp</button>
          </a>
        </div>
        <div className="card">
          <h3>Catalogo</h3>
          <p>Confira produtos e novidades exclusivas.</p>
          <Link to="/catalogo">Abrir catalogo</Link>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
    </section>
  );
};

export default Home;
