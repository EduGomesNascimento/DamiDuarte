import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/format";

const blank = {
  appointmentId: "",
  userId: "",
  startAt: "",
  endAt: "",
  status: "BOOKED",
  value: 0,
  notesPrivate: ""
};

const OwnerAgenda = () => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(blank);

  const load = () => {
    apiFetch<any[]>("/owner/agenda").then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (form.appointmentId) {
      await apiFetch(`/owner/agenda/${form.appointmentId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch(`/owner/agenda`, {
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
    await apiFetch(`/owner/agenda/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <section className="grid">
      <div className="card">
        <h2>Agenda</h2>
        <div className="grid grid-2">
          <label>
            Cliente (userId)
            <input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} />
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
              <option value="BOOKED">BOOKED</option>
              <option value="DONE">DONE</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
              <option value="RESCHEDULED">RESCHEDULED</option>
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
        </div>
        <button onClick={handleSubmit}>{form.appointmentId ? "Atualizar" : "Criar"}</button>
      </div>
      <div className="card">
        <h3>Lista</h3>
        <div className="list">
          {items.map((item) => (
            <div key={item.appointmentId} className="card">
              <strong>{new Date(item.startAt).toLocaleString("pt-BR")}</strong>
              <div>{item.userId}</div>
              <div>{formatCurrency(item.value)}</div>
              <div>Status: {item.status}</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="secondary" onClick={() => handleEdit(item)}>
                  Editar
                </button>
                <button className="secondary" onClick={() => handleDelete(item.appointmentId)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OwnerAgenda;
