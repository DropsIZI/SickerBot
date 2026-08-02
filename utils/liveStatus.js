// Renombra un canal y/o una categoría según si hay alguien en vivo.
// Discord limita el renombrado a ~2 cambios cada 10 minutos por canal,
// por eso solo se renombra si el nombre realmente cambió.

// Streamers activos ahora mismo (para no marcar offline si aún queda alguien)
const enVivoAhora = new Set();

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

async function actualizarEstado(guild) {
  const live = enVivoAhora.size > 0;
  await renombrar(guild, process.env.LIVE_CHANNEL_ID, NOMBRES.canal[live ? 'live' : 'off']);
  await renombrar(guild, process.env.LIVE_CATEGORY_ID, NOMBRES.categoria[live ? 'live' : 'off']);
}

async function marcarEnVivo(guild, userId) {
  if (enVivoAhora.has(userId)) return;
  enVivoAhora.add(userId);
  await actualizarEstado(guild);
}

async function marcarOffline(guild, userId) {
  if (!enVivoAhora.delete(userId)) return;
  await actualizarEstado(guild);
}

module.exports = { marcarEnVivo, marcarOffline, enVivoAhora };
