// Renombra un canal y/o una categoría según si hay alguien en vivo.
// Discord limita el renombrado a ~2 cambios cada 10 minutos por canal,
// por eso solo se renombra si el nombre realmente cambió.
//
// El estado se guarda en la base de datos: Render redespliega cada vez que
// se hace push, y sin esto el cartel de "en vivo" se quedaria encendido para
// siempre porque nadie volveria a llamar a marcarOffline().

const storage = require('./storage');

// userId -> timestamp en que empezo el stream
const enVivoAhora = new Map();

// Red de seguridad por si se olvida /fin-stream: ningun stream queda
// marcado mas de este tiempo.
const MAX_MS = 8 * 60 * 60 * 1000; // 8 horas

const NOMBRES = {
  canal: {
    live: process.env.LIVE_CHANNEL_NAME_ON || '🔴・en-vivo',
    off: process.env.LIVE_CHANNEL_NAME_OFF || '⚫・sin-stream',
  },
  categoria: {
    live: process.env.LIVE_CATEGORY_NAME_ON || '🔴 STREAM EN VIVO',
    off: process.env.LIVE_CATEGORY_NAME_OFF || '💤 SIN STREAM',
  },
};

async function renombrar(guild, id, nombre) {
  if (!id) return;
  const canal = await guild.channels.fetch(id).catch(() => null);
  if (!canal || canal.name === nombre) return;
  await canal.setName(nombre, 'Estado de stream actualizado')
    .catch(err => console.error(`[liveStatus] no se pudo renombrar ${id}:`, err.message));
}

// Descarta los streams que llevan demasiado tiempo abiertos
function purgarCaducados() {
  const ahora = Date.now();
  let huboCambios = false;
  for (const [userId, desde] of enVivoAhora) {
    if (ahora - desde > MAX_MS) {
      enVivoAhora.delete(userId);
      huboCambios = true;
      console.log(`[liveStatus] stream de ${userId} cerrado solo tras ${MAX_MS / 3600000}h`);
    }
  }
  return huboCambios;
}

function persistir() {
  const config = storage.getConfig();
  storage.setConfig({ ...config, liveUsers: [...enVivoAhora.entries()] });
}

async function actualizarEstado(guild) {
  purgarCaducados();
  const live = enVivoAhora.size > 0;
  await renombrar(guild, process.env.LIVE_CHANNEL_ID, NOMBRES.canal[live ? 'live' : 'off']);
  await renombrar(guild, process.env.LIVE_CATEGORY_ID, NOMBRES.categoria[live ? 'live' : 'off']);
}

async function marcarEnVivo(guild, userId) {
  if (enVivoAhora.has(userId)) return;
  enVivoAhora.set(userId, Date.now());
  persistir();
  await actualizarEstado(guild);
}

async function marcarOffline(guild, userId) {
  if (!enVivoAhora.delete(userId)) return;
  persistir();
  await actualizarEstado(guild);
}

// Se llama al arrancar: recupera los streams que seguian abiertos antes del
// reinicio y deja el canal coherente con la realidad.
async function restaurar(guild) {
  for (const [userId, desde] of storage.getConfig().liveUsers || []) {
    enVivoAhora.set(userId, desde);
  }
  if (purgarCaducados()) persistir();
  await actualizarEstado(guild);

  // Revisa cada 15 min por si alguien se dejo el stream abierto
  setInterval(() => {
    if (purgarCaducados()) { persistir(); actualizarEstado(guild); }
  }, 15 * 60 * 1000);

  if (enVivoAhora.size) console.log(`[liveStatus] ${enVivoAhora.size} stream(s) seguian activos`);
}

module.exports = { marcarEnVivo, marcarOffline, restaurar, enVivoAhora };
