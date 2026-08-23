// Coliseo del Abismo: inscripciones y sorteo de enfrentamientos de LoL.
//
// Cada rango vale un numero para poder restarlos. Las divisiones van de IV a
// I, y los tres tiers altos no tienen division.
const storage = require('./storage');

const TIERS = [
  { nombre: 'Hierro', emoji: '⬛', alias: ['hierro', 'iron', 'fe'] },
  { nombre: 'Bronce', emoji: '🟫', alias: ['bronce', 'bronze'] },
  { nombre: 'Plata', emoji: '⬜', alias: ['plata', 'silver'] },
  { nombre: 'Oro', emoji: '🟨', alias: ['oro', 'gold'] },
  { nombre: 'Platino', emoji: '🟦', alias: ['platino', 'plat', 'platinum'] },
  { nombre: 'Esmeralda', emoji: '🟩', alias: ['esmeralda', 'emerald', 'esme'] },
  { nombre: 'Diamante', emoji: '💎', alias: ['diamante', 'diamond', 'dia'] },
  { nombre: 'Maestro', emoji: '🟪', alias: ['maestro', 'master'], sinDivision: true },
  { nombre: 'Gran Maestro', emoji: '🟥', alias: ['gran maestro', 'granmaestro', 'grandmaster', 'gm'], sinDivision: true },
  { nombre: 'Retador', emoji: '👑', alias: ['retador', 'challenger', 'chall'], sinDivision: true },
];

const DIVISIONES = ['IV', 'III', 'II', 'I'];

// Bans que gana el de menor rango por cada tier completo de diferencia,
// ademas del que le corresponde de salida.
const BANS_BASE = 1;
const BANS_MAX = 5;

// Acepta "oro 2", "gold II", "diamante iv" o solo "maestro"
function parsearRango(texto) {
  if (!texto) return null;
  const limpio = texto.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // El tier se busca por el alias mas largo que encaje, para que "gran
  // maestro" no se lea como "maestro"
  let tier = null;
  let mejorAlias = 0;
  TIERS.forEach((t, i) => {
    for (const a of t.alias) {
      if (limpio.includes(a) && a.length > mejorAlias) { tier = i; mejorAlias = a.length; }
    }
  });
  if (tier === null) return null;

  if (TIERS[tier].sinDivision) return { tier, division: 3 };

  const resto = limpio.slice(limpio.indexOf(TIERS[tier].alias.find(a => limpio.includes(a))) + mejorAlias);
  const romano = resto.match(/\b(iv|iii|ii|i)\b/);
  const arabigo = resto.match(/\b([1-4])\b/);

  let division;
  if (romano) division = DIVISIONES.indexOf(romano[1].toUpperCase());
  else if (arabigo) division = DIVISIONES.indexOf(['I', 'II', 'III', 'IV'][arabigo[1] - 1]);
  else return null;

  return { tier, division };
}

const valorDe = r => r.tier * 4 + r.division;

const nombreRango = r => {
  const t = TIERS[r.tier];
  return t.sinDivision ? `${t.emoji} ${t.nombre}` : `${t.emoji} ${t.nombre} ${DIVISIONES[r.division]}`;
};

// Diferencia en tiers completos, que es la unidad con la que se reparten bans
const diferenciaTiers = (a, b) => Math.abs(a.tier - b.tier);

function bansDelMenor(a, b) {
  return Math.min(BANS_BASE + diferenciaTiers(a, b), BANS_MAX);
}

// --- Inscripciones ---

const inscritos = () => storage.getConfig().coliseoInscritos || [];

async function inscribir(entrada) {
  const lista = inscritos().filter(i => i.userId !== entrada.userId);
  lista.push(entrada);
  const config = storage.getConfig();
  await storage.setConfig({ ...config, coliseoInscritos: lista });
  return lista.length;
}

async function borrarInscritos() {
  const config = storage.getConfig();
  await storage.setConfig({ ...config, coliseoInscritos: [] });
}

async function desinscribir(userId) {
  const lista = inscritos().filter(i => i.userId !== userId);
  const config = storage.getConfig();
  await storage.setConfig({ ...config, coliseoInscritos: lista });
  return lista.length;
}

// --- Sorteo ---

// Mezcla, empareja de dos en dos y calcula la ventaja de cada duelo.
// Si sobra alguien pasa de ronda sin jugar.
function sortear(lista) {
  const mezclada = [...lista];
  for (let i = mezclada.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mezclada[i], mezclada[j]] = [mezclada[j], mezclada[i]];
  }

  const duelos = [];
  while (mezclada.length >= 2) {
    const a = mezclada.shift();
    const b = mezclada.shift();

    const rangoA = { tier: a.tier, division: a.division };
    const rangoB = { tier: b.tier, division: b.division };
    const menor = valorDe(rangoA) <= valorDe(rangoB) ? a : b;

    duelos.push({
      a, b,
      menor,
      tiers: diferenciaTiers(rangoA, rangoB),
      bans: bansDelMenor(rangoA, rangoB),
    });
  }

  return { duelos, descansa: mezclada[0] || null };
}

module.exports = {
  TIERS, DIVISIONES, BANS_MAX,
  parsearRango, valorDe, nombreRango, diferenciaTiers, bansDelMenor,
  inscritos, inscribir, borrarInscritos, desinscribir, sortear,
};
