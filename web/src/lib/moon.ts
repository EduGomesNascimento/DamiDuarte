export type MoonPhaseInfo = {
  name: string;
  emoji: string;
  description: string;
  ageDays: number;
};

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

const PHASES: Array<{ name: string; emoji: string; description: string }> = [
  {
    name: "Lua Nova",
    emoji: "Nova",
    description: "Crenca popular: fase de renovacao e fortalecimento."
  },
  {
    name: "Crescente",
    emoji: "Cresc.",
    description: "Crenca popular: crescimento mais rapido dos fios."
  },
  {
    name: "Quarto Crescente",
    emoji: "1/4",
    description: "Crenca popular: bom para volume e vigor."
  },
  {
    name: "Gibosa Crescente",
    emoji: "Gib.",
    description: "Crenca popular: favorece brilho e alinhamento."
  },
  {
    name: "Lua Cheia",
    emoji: "Cheia",
    description: "Crenca popular: mais volume; atencao ao frizz."
  },
  {
    name: "Gibosa Minguante",
    emoji: "Gib.",
    description: "Crenca popular: bom para reduzir volume."
  },
  {
    name: "Quarto Minguante",
    emoji: "1/4",
    description: "Crenca popular: cortes para manutencao."
  },
  {
    name: "Minguante",
    emoji: "Ming.",
    description: "Crenca popular: crescimento mais lento."
  }
];

export const getMoonPhase = (date: Date): MoonPhaseInfo => {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const daysSince = (utc - KNOWN_NEW_MOON) / 86400000;
  const age = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const index = Math.floor(((age / SYNODIC_MONTH) * 8) + 0.5) % 8;
  const phase = PHASES[index];
  return {
    name: phase.name,
    emoji: phase.emoji,
    description: phase.description,
    ageDays: Number(age.toFixed(1))
  };
};
