import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/format";

const blank = {
  productId: "",
  name: "",
  price: 0,
  description: "",
  photoUrl: "",
  isActive: true
};

const OwnerProducts = () => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(blank);

  const load = () => {
    apiFetch<any[]>("/owner/products").then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (form.productId) {
      await apiFetch(`/owner/products/${form.productId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch(`/owner/products`, {
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
    await apiFetch(`/owner/products/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <section className="grid">
      <div className="card">
        <h2>Produtos</h2>
        <div className="grid grid-2">
          <label>
            Nome
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Preco
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </label>
          <label>
            Descricao
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>
            Foto URL
            <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          </label>
          <label>
            Ativo
            <select value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
              <option value="true">Sim</option>
              <option value="false">Nao</option>
            </select>
          </label>
        </div>
        <button onClick={handleSubmit}>{form.productId ? "Atualizar" : "Criar"}</button>
      </div>
      <div className="card">
        <h3>Lista</h3>
        <div className="grid grid-2">
          {items.length === 0 && (
            <div className="card soft">
              <strong>Sem produtos cadastrados</strong>
              <p>Adicione seus produtos ativos aqui.</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.productId} className="card">
              {item.photoUrl && <img src={item.photoUrl} alt={item.name} style={{ width: "100%", borderRadius: 12 }} />}
              <strong>{item.name}</strong>
              <p>{item.description}</p>
              <div>{formatCurrency(item.price)}</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="secondary" onClick={() => handleEdit(item)}>
                  Editar
                </button>
                <button className="secondary" onClick={() => handleDelete(item.productId)}>
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

export default OwnerProducts;
