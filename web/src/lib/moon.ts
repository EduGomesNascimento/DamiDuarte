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
    emoji: "??",
    description: "Cren?a popular: fase de renova??o e fortalecimento."
  },
  {
    name: "Crescente",
    emoji: "??",
    description: "Cren?a popular: crescimento mais r?pido dos fios."
  },
  {
    name: "Quarto Crescente",
    emoji: "??",
    description: "Cren?a popular: bom para volume e vigor."
  },
  {
    name: "Gibosa Crescente",
    emoji: "??",
    description: "Cren?a popular: favorece brilho e alinhamento."
  },
  {
    name: "Lua Cheia",
    emoji: "??",
    description: "Cren?a popular: mais volume; aten??o ao frizz."
  },
  {
    name: "Gibosa Minguante",
    emoji: "??",
    description: "Cren?a popular: bom para reduzir volume."
  },
  {
    name: "Quarto Minguante",
    emoji: "??",
    description: "Cren?a popular: cortes para manuten??o."
  },
  {
    name: "Minguante",
    emoji: "??",
    description: "Cren?a popular: crescimento mais lento."
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
