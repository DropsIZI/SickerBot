// Torneo de eliminacion directa del Coliseo.
//
// El estado vive en la base de datos para que el cuadro no se pierda si Render
// redespliega en mitad de una ronda.
const storage = require('./storage');
const { valorDe, diferenciaTiers, bansDelMenor } = require('./coliseo');

const estado = () => storage.getConfig().coliseoTorneo || null;

async function guardar(torneo) {
  const config = storage.getConfig();
  await storage.setConfig({ ...config, coliseoTorneo: torneo });
}

async function cancelar() {
  const config = storage.getConfig();
  await storage.setConfig({ ...config, coliseoTorneo: null });
}

// La ronda se nombra por cuantos quedan, no por su numero de orden
function nombreRonda(jugadores) {
  if (jugadores <= 2) return '🏆 Final';
  if (jugadores <= 4) return '🥈 Semifinales';
  if (jugadores <= 8) return '🥉 Cuartos de final';
  if (jugadores <= 16) return '⚔️ Octavos de final';
  if (jugadores <= 32) return '⚔️ Dieciseisavos';
  return '⚔️ Ronda inicial';
}

const mezclar = arr => {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
};

// Empareja de dos en dos. Si sobra alguien, pasa de ronda sin jugar.
function armarDuelos(jugadores, rondaNum) {
  const pool = mezclar(jugadores);
  const duelos = [];
  let n = 1;

  while (pool.length >= 2) {
    const a = pool.shift();
    const b = pool.shift();
    const menor = valorDe(a) <= valorDe(b) ? a : b;

    duelos.push({
      id: `r${rondaNum}d${n++}`,
      a, b,
      menor: menor.userId,
      tiers: diferenciaTiers(a, b),
      bans: bansDelMenor(a, b),
      ganador: null,
    });
  }

  return { duelos, pasaDirecto: pool[0] || null };
}

async function iniciar(inscritos) {
  const { duelos, pasaDirecto } = armarDuelos(inscritos, 1);

  const torneo = {
    ronda: 1,
    totalInicial: inscritos.length,
    jugadoresRonda: inscritos.length,
    nombreRonda: nombreRonda(inscritos.length),
    duelos,
    pasaDirecto,
    campeon: null,
  };

  await guardar(torneo);
  return torneo;
}

// Devuelve el torneo actualizado, o null si el duelo no existe
async function registrarGanador(dueloId, userId) {
  const torneo = estado();
  if (!torneo || torneo.campeon) return null;

  const duelo = torneo.duelos.find(d => d.id === dueloId);
  if (!duelo) return null;
  if (![duelo.a.userId, duelo.b.userId].includes(userId)) return null;

  duelo.ganador = userId;
  await guardar(torneo);
  return torneo;
}

const rondaCompleta = torneo => torneo.duelos.every(d => d.ganador);

// Cierra la ronda: si queda uno solo hay campeon, si no arma la siguiente
async function avanzarRonda() {
  const torneo = estado();
  if (!torneo || !rondaCompleta(torneo)) return null;

  const clasificados = torneo.duelos
    .map(d => (d.ganador === d.a.userId ? d.a : d.b));
  if (torneo.pasaDirecto) clasificados.push(torneo.pasaDirecto);

  if (clasificados.length === 1) {
    torneo.campeon = clasificados[0];
    await guardar(torneo);
    return torneo;
  }

  const siguiente = torneo.ronda + 1;
  const { duelos, pasaDirecto } = armarDuelos(clasificados, siguiente);

  Object.assign(torneo, {
    ronda: siguiente,
    jugadoresRonda: clasificados.length,
    nombreRonda: nombreRonda(clasificados.length),
    duelos,
    pasaDirecto,
  });

  await guardar(torneo);
  return torneo;
}

module.exports = {
  estado, guardar, cancelar, iniciar,
  registrarGanador, rondaCompleta, avanzarRonda, nombreRonda,
};
