import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/format";

const Catalog = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/products?active=1").then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <section className="grid">
      <div className="card">
        <h2>Catalogo</h2>
        <div className="grid grid-2">
          {items.length === 0 && <p>Nenhum produto ativo.</p>}
          {items.map((item) => (
            <div key={item.productId} className="card">
              {item.photoUrl && <img src={item.photoUrl} alt={item.name} style={{ width: "100%", borderRadius: 12 }} />}
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <strong>{formatCurrency(item.price)}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Catalog;
