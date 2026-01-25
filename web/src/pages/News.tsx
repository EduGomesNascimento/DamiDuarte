import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const News = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/announcements?published=1").then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <section className="grid">
      <div className="card">
        <h2>Novidades</h2>
        <div className="list">
          {items.length === 0 && <p>Nenhuma novidade publicada.</p>}
          {items.map((item) => (
            <div key={item.announcementId} className="card">
              <strong>{item.title}</strong>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
