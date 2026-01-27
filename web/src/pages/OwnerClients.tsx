import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const blank = {
  userId: "",
  email: "",
  name: "",
  nicknamePublic: "",
  nicknamePrivate: "",
  phoneE164: "",
  birthDate: "",
  active: true
};

const OwnerClients = () => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(blank);
  const [query, setQuery] = useState("");

  const load = () => {
    apiFetch<any[]>("/owner/users").then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((item) => {
    const hay = `${item.name || ""} ${item.email || ""} ${item.nicknamePublic || ""} ${
      item.nicknamePrivate || ""
    } ${item.phoneE164 || ""}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  const handleSubmit = async () => {
    if (form.userId) {
      await apiFetch(`/owner/users/${form.userId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch(`/owner/users`, {
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

  const handleDeactivate = async (id: string) => {
    await apiFetch(`/owner/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ active: false })
    });
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
            Telefone (E.164)
            <input value={form.phoneE164} onChange={(e) => setForm({ ...form, phoneE164: e.target.value })} />
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
        <label>
          Buscar cliente
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome, email, apelido..." />
        </label>
        <div className="list">
          {filtered.length === 0 && (
            <div className="card soft">
              <strong>Sem clientes cadastradas</strong>
              <p>Crie a primeira cliente para comecar.</p>
            </div>
          )}
          {filtered.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Apelido publico</th>
                    <th>Apelido privado</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.userId}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.phoneE164}</td>
                      <td>{item.nicknamePublic}</td>
                      <td>{item.nicknamePrivate}</td>
                      <td>{item.active ? "Ativa" : "Inativa"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="secondary" onClick={() => handleEdit(item)}>
                            Editar
                          </button>
                          <button className="secondary" onClick={() => handleDeactivate(item.userId)}>
                            Desativar
                          </button>
                          {item.phoneE164 && (
                            <a
                              className="pill-link"
                              href={`https://wa.me/${item.phoneE164.replace("+", "")}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OwnerClients;
