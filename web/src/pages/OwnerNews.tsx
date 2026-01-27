import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const blank = {
  announcementId: "",
  title: "",
  content: "",
  isPublished: false
};

const OwnerNews = () => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(blank);

  const load = () => {
    apiFetch<any[]>("/owner/announcements").then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (form.announcementId) {
      await apiFetch(`/owner/announcements/${form.announcementId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch(`/owner/announcements`, {
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
    await apiFetch(`/owner/announcements/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <section className="grid">
      <div className="card">
        <h2>Novidades</h2>
        <div className="grid">
          <label>
            Titulo
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>
            Conteudo
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </label>
          <label>
            Publicado
            <select value={form.isPublished ? "true" : "false"} onChange={(e) => setForm({ ...form, isPublished: e.target.value === "true" })}>
              <option value="true">Sim</option>
              <option value="false">Nao</option>
            </select>
          </label>
        </div>
        <button onClick={handleSubmit}>{form.announcementId ? "Atualizar" : "Criar"}</button>
      </div>
      <div className="card">
        <h3>Lista</h3>
        <div className="list">
          {items.length === 0 && (
            <div className="card soft">
              <strong>Nenhum anuncio</strong>
              <p>Publique novidades para suas clientes.</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.announcementId} className="card">
              <strong>{item.title}</strong>
              <p>{item.content}</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="secondary" onClick={() => handleEdit(item)}>
                  Editar
                </button>
                <button className="secondary" onClick={() => handleDelete(item.announcementId)}>
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

export default OwnerNews;
