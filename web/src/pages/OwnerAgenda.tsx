import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/format";

const blank = {
  appointmentId: "",
  userId: "",
  startAt: "",
  endAt: "",
  status: "SCHEDULED",
  value: 0,
  notesPrivate: "",
  notesPublic: ""
};

const reminderTemplates = [
  {
    title: "Hora de renovar o corte",
    message: "Oi! Seu prazo para renovar o corte esta chegando. Quer agendar?"
  },
  {
    title: "Manutencao do cabelo",
    message: "Oi! Que tal manter seu cabelo em dia? Posso te sugerir um horario."
  }
];

const OwnerAgenda = () => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(blank);
  const [clients, setClients] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    userId: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });

  const load = () => {
    const params = new URLSearchParams();
    if (filters.userId) params.set("userId", filters.userId);
    if (filters.status) params.set("status", filters.status);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    apiFetch<any[]>(`/owner/appointments?${params.toString()}`)
      .then(setItems)
      .catch(() => setItems([]));
    apiFetch<any[]>("/owner/users").then(setClients).catch(() => setClients([]));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.userId, filters.status, filters.dateFrom, filters.dateTo]);

  const handleSubmit = async () => {
    if (form.appointmentId) {
      await apiFetch(`/owner/appointments/${form.appointmentId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch(`/owner/appointments`, {
        method: "POST",
        body: JSON.stringify(form)
      });
    }
    setForm(blank);
    load();
  };

  const handleEdit = (item: any) => {
    setForm(item);
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/owner/appointments/${id}`, { method: "DELETE" });
    load();
  };

  const quickUpdateStatus = async (id: string, status: string) => {
    await apiFetch(`/owner/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    load();
  };

  const quickReschedule = async (id: string, startAt: string, endAt: string) => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    start.setDate(start.getDate() + 7);
    end.setDate(end.getDate() + 7);
    await apiFetch(`/owner/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ startAt: start.toISOString(), endAt: end.toISOString() })
    });
    load();
  };

  const getClientPhone = (userId: string) => {
    const client = clients.find((c) => c.userId === userId);
    return client?.phoneE164 || "";
  };

  return (
    <section className="grid">
      <div className="card">
        <h2>Agenda</h2>
        <div className="grid grid-2">
          <label>
            Filtro cliente
            <select
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            >
              <option value="">Todos</option>
              {clients.map((client) => (
                <option key={client.userId} value={client.userId}>
                  {client.nicknamePublic || client.name || client.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELED">CANCELED</option>
              <option value="DONE">DONE</option>
            </select>
          </label>
          <label>
            De
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </label>
          <label>
            Ate
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </label>
        </div>
        <div className="divider" />
        <div className="grid grid-2">
          <label>
            Cliente
            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
              <option value="">Selecione</option>
              {clients.map((client) => (
                <option key={client.userId} value={client.userId}>
                  {client.nicknamePublic || client.name || client.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Inicio
            <input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
          </label>
          <label>
            Fim
            <input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELED">CANCELED</option>
              <option value="DONE">DONE</option>
            </select>
          </label>
          <label>
            Valor (R$)
            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          </label>
          <label>
            Notas privadas
            <input value={form.notesPrivate} onChange={(e) => setForm({ ...form, notesPrivate: e.target.value })} />
          </label>
          <label>
            Notas cliente
            <input value={form.notesPublic} onChange={(e) => setForm({ ...form, notesPublic: e.target.value })} />
          </label>
        </div>
        <button onClick={handleSubmit}>{form.appointmentId ? "Atualizar" : "Criar"}</button>
      </div>
      <div className="card">
        <h3>Lista</h3>
        <div className="list">
          {items.length === 0 && (
            <div className="card soft">
              <strong>Agenda vazia</strong>
              <p>Crie o primeiro atendimento usando o formulario acima.</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.appointmentId} className="card">
              <strong>{new Date(item.startAt).toLocaleString("pt-BR")}</strong>
              <div>{item.clientName || item.userId}</div>
              <div>{formatCurrency(item.value)}</div>
              <div>Status: {item.status}</div>
              {item.notesPublic && <p>{item.notesPublic}</p>}
              <div className="chips">
                <button className="secondary" onClick={() => quickUpdateStatus(item.appointmentId, "CONFIRMED")}>
                  Confirmar
                </button>
                <button className="secondary" onClick={() => quickUpdateStatus(item.appointmentId, "DONE")}>
                  Concluir
                </button>
                <button className="secondary" onClick={() => quickUpdateStatus(item.appointmentId, "CANCELED")}>
                  Cancelar
                </button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="secondary" onClick={() => handleEdit(item)}>
                  Editar
                </button>
                <button className="secondary" onClick={() => quickReschedule(item.appointmentId, item.startAt, item.endAt)}>
                  +7 dias
                </button>
                <button className="secondary" onClick={() => handleDelete(item.appointmentId)}>
                  Excluir
                </button>
                {getClientPhone(item.userId) && (
                  <a
                    className="pill-link"
                    href={`https://wa.me/${getClientPhone(item.userId).replace("+", "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Modelos de lembrete</h3>
        <div className="list">
          {reminderTemplates.map((template) => (
            <div key={template.title} className="card soft">
              <strong>{template.title}</strong>
              <p>{template.message}</p>
              <p style={{ color: "var(--muted)" }}>Copie e envie pelo push no painel inicial.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OwnerAgenda;
