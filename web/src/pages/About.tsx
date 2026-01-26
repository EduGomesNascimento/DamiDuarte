import { config } from "../lib/config";

const About = () => {
  return (
    <section className="grid">
      <div className="card hero soft">
        <h2>Sobre</h2>
        <p>Beleza, cosmeticos e cuidados pessoais</p>
        <div className="list">
          <span>Maquiadora</span>
          <span>Cabeleireira</span>
          <span>Representante H Maria Joias Contemporaneas</span>
        </div>
        <div className="card soft" style={{ marginTop: "1rem" }}>
          <strong>Contato</strong>
          <p>
            WhatsApp:{" "}
            <a href={config.whatsappLink} target="_blank" rel="noreferrer">
              {config.whatsappDisplay}
            </a>
          </p>
          <p>Email: {config.email}</p>
          <p>
            Instagram:{" "}
            <a href={config.instagramLink} target="_blank" rel="noreferrer">
              @{config.instagram}
            </a>
          </p>
        </div>
        <img
          src={`${import.meta.env.BASE_URL}fotodami.jpg`}
          alt="Dami Duarte"
          style={{ width: "100%", maxWidth: 420, borderRadius: 18, marginTop: "1rem" }}
        />
      </div>
    </section>
  );
};

export default About;
