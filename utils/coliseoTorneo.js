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
//
// Con un numero impar el descanso se reparte: se elige entre quienes todavia
// no han pasado sin jugar, para que no le toque dos veces al mismo mientras
// haya gente que aun no ha descansado.
function crearDuelo(id, a, b, tipo = 'normal') {
  const menor = valorDe(a) <= valorDe(b) ? a : b;
  return {
    id, a, b, tipo,
    menor: menor.userId,
    tiers: diferenciaTiers(a, b),
    bans: bansDelMenor(a, b),
    ganador: null,
  };
}

function armarDuelos(jugadores, rondaNum, yaDescansaron = []) {
  const pool = mezclar(jugadores);
  let pasaDirecto = null;

  if (pool.length % 2 === 1) {
    const i = pool.findIndex(j => !yaDescansaron.includes(j.userId));
    pasaDirecto = pool.splice(i === -1 ? 0 : i, 1)[0];
  }

  const duelos = [];
  let n = 1;

  while (pool.length >= 2) {
    duelos.push(crearDuelo(`r${rondaNum}d${n++}`, pool.shift(), pool.shift()));
  }

  return { duelos, pasaDirecto };
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
    yaDescansaron: pasaDirecto ? [pasaDirecto.userId] : [],
    campeon: null,
    subcampeon: null,
    tercero: null,
    cuarto: null,
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

const ganadorDe = d => (d.ganador === d.a.userId ? d.a : d.b);
const perdedorDe = d => (d.ganador === d.a.userId ? d.b : d.a);

// Cierra la ronda: arma la siguiente, monta la final o proclama el podio
async function avanzarRonda() {
  const torneo = estado();
  if (!torneo || !rondaCompleta(torneo)) return null;

  // Ronda final ya resuelta: se reparte el podio
  const dueloFinal = torneo.duelos.find(d => d.tipo === 'final');
  if (dueloFinal) {
    torneo.campeon = ganadorDe(dueloFinal);
    torneo.subcampeon = perdedorDe(dueloFinal);

    const dueloTercero = torneo.duelos.find(d => d.tipo === 'tercero');
    if (dueloTercero) {
      torneo.tercero = ganadorDe(dueloTercero);
      torneo.cuarto = perdedorDe(dueloTercero);
    }

    await guardar(torneo);
    return torneo;
  }

  const clasificados = torneo.duelos.map(ganadorDe);
  if (torneo.pasaDirecto) clasificados.push(torneo.pasaDirecto);
  const perdedores = torneo.duelos.map(perdedorDe);

  // Torneo de solo dos jugadores: esa primera ronda ya era la final
  if (clasificados.length === 1) {
    torneo.campeon = clasificados[0];
    torneo.subcampeon = perdedores[0] || null;
    await guardar(torneo);
    return torneo;
  }

  const siguiente = torneo.ronda + 1;

  // Quedan dos: esta ronda era la semifinal. Se monta la final y, si dejo dos
  // eliminados, tambien el duelo por el bronce. Si con los descansos solo dejo
  // uno, ese es tercero directo y no hay nada que disputar.
  if (clasificados.length === 2) {
    const duelos = [crearDuelo(`r${siguiente}final`, clasificados[0], clasificados[1], 'final')];
    let tercero = null;

    if (perdedores.length >= 2) {
      duelos.push(crearDuelo(`r${siguiente}tercero`, perdedores[0], perdedores[1], 'tercero'));
    } else if (perdedores.length === 1) {
      tercero = perdedores[0];
    }

    Object.assign(torneo, {
      ronda: siguiente,
      jugadoresRonda: duelos.length * 2,
      nombreRonda: '🏆 Final',
      duelos,
      pasaDirecto: null,
      tercero,
    });

    await guardar(torneo);
    return torneo;
  }

  const yaDescansaron = torneo.yaDescansaron || [];
  const { duelos, pasaDirecto } = armarDuelos(clasificados, siguiente, yaDescansaron);

  Object.assign(torneo, {
    ronda: siguiente,
    jugadoresRonda: clasificados.length,
    nombreRonda: nombreRonda(clasificados.length),
    duelos,
    pasaDirecto,
    yaDescansaron: pasaDirecto ? [...yaDescansaron, pasaDirecto.userId] : yaDescansaron,
  });

  await guardar(torneo);
  return torneo;
}

module.exports = {
  estado, guardar, cancelar, iniciar,
  registrarGanador, rondaCompleta, avanzarRonda, nombreRonda,
};
