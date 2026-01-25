import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const blank = {
  userId: "",
  email: "",
  name: "",
  nicknamePublic: "",
  nicknamePrivate: "",
  birthDate: "",
  active: true
};

const OwnerClients = () => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(blank);

  const load = () => {
    apiFetch<any[]>("/owner/clients").then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (form.userId) {
      await apiFetch(`/owner/clients/${form.userId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch(`/owner/clients`, {
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
    await apiFetch(`/owner/clients/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <section className="grid">
      <div className="card">
        <h2>Clientes</h2>
        <div className="grid grid-2">
          <label>
            userId
            <input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Nome
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Apelido publico
            <input value={form.nicknamePublic} onChange={(e) => setForm({ ...form, nicknamePublic: e.target.value })} />
          </label>
          <label>
            Apelido privado
            <input value={form.nicknamePrivate} onChange={(e) => setForm({ ...form, nicknamePrivate: e.target.value })} />
          </label>
          <label>
            Birth date
            <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </label>
          <label>
            Ativo
            <select value={form.active ? "true" : "false"} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}>
              <option value="true">Sim</option>
              <option value="false">Nao</option>
            </select>
          </label>
        </div>
        <button onClick={handleSubmit}>{form.userId ? "Atualizar" : "Criar"}</button>
      </div>
      <div className="card">
        <h3>Lista</h3>
        <div className="list">
          {items.map((item) => (
            <div key={item.userId} className="card">
              <strong>{item.name}</strong>
              <div>{item.email}</div>
              <div>{item.nicknamePrivate}</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="secondary" onClick={() => handleEdit(item)}>
                  Editar
                </button>
                <button className="secondary" onClick={() => handleDelete(item.userId)}>
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

export default OwnerClients;
