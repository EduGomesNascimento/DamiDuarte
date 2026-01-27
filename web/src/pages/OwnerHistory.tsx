import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/format";

const OwnerHistory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [byClient, setByClient] = useState<Record<string, number>>({});

  useEffect(() => {
    apiFetch<{ items: any[]; total: number; byClient: Record<string, number> }>(
      "/owner/history?days=30"
    )
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setByClient(data.byClient || {});
      })
      .catch(() => null);
  }, []);

  const clientTotals = useMemo(() => {
    return Object.entries(byClient).sort((a, b) => b[1] - a[1]);
  }, [byClient]);

  return (
    <section className="grid">
      <div className="card">
        <h2>Historico 30 dias</h2>
        <div className="kpi">{formatCurrency(total)}</div>
        <p style={{ color: "var(--muted)" }}>Total de atendimentos concluidos no periodo.</p>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3>Por cliente</h3>
          <div className="list">
            {clientTotals.length === 0 && (
              <div className="card soft">
                <strong>Sem historico</strong>
                <p>Os totais por cliente aparecerao aqui.</p>
              </div>
            )}
            {clientTotals.map(([name, value]) => (
              <div key={name}>
                {name}: {formatCurrency(value)}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Lista</h3>
          <div className="list">
            {items.length === 0 && (
              <div className="card soft">
                <strong>Nenhum atendimento</strong>
                <p>Finalize atendimentos para alimentar o historico.</p>
              </div>
            )}
            {items.map((item) => (
              <div key={item.appointmentId} className="card">
                <strong>{new Date(item.startAt).toLocaleString("pt-BR")}</strong>
                <div>{item.clientName || item.userId}</div>
                <div>Status: {item.status}</div>
                <div>{formatCurrency(item.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerHistory;
